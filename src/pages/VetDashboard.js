import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { Stethoscope, Search, X, CheckCircle, Menu, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useAuth } from "../contexts/AuthContext";

export default function VetDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [treatment, setTreatment] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");
  const [farmerFilter, setFarmerFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  /** Fetch ALL animals from Firestore */
  const loadAnimals = async () => {
    try {
      const snap = await getDocs(collection(db, "animals"));
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setAnimals(arr);
      setFiltered(arr);
    } catch (err) {
      console.error("Error loading animals:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAnimals();
  }, []);

  /** Filter animals when filters change */
  useEffect(() => {
    let f = animals;

    if (typeFilter !== "all") {
      f = f.filter((a) => a.type === typeFilter);
    }

    if (farmerFilter.trim() !== "") {
      f = f.filter((a) =>
        a.ownerId.toLowerCase().includes(farmerFilter.toLowerCase())
      );
    }

    setFiltered(f);
  }, [typeFilter, farmerFilter, animals]);

  /** Save treatment report */
  const handleSaveTreatment = async () => {
    if (!treatment.trim()) {
      alert(t("enterTreatmentNote"));
      return;
    }

    try {
      // 1️⃣ Save vet report into DB
      await addDoc(collection(db, "vetReports"), {
        animalId: selectedAnimal.id,
        farmerId: selectedAnimal.ownerId,
        vetId: auth.currentUser.uid,
        notes: treatment,
        date: serverTimestamp()
      });

      // 2️⃣ Update animal health status
      await updateDoc(doc(db, "animals", selectedAnimal.id), {
        healthStatus: "Treated",
        lastTreatment: treatment,
        treatedAt: serverTimestamp()
      });

      // 3️⃣ Create alert for farmer
      await addDoc(collection(db, "alerts"), {
        userId: selectedAnimal.ownerId,
        message: `Your ${selectedAnimal.type} (${selectedAnimal.category}) received treatment.`,
        timestamp: serverTimestamp(),
        type: "info",
        read: false,
        priority: 3
      });

      alert(t("treatmentSavedSuccessfully"));
      setSelectedAnimal(null);
      setTreatment("");
      loadAnimals();
    } catch (err) {
      console.error(err);
      alert(t("errorSavingTreatment"));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 text-base md:text-xl px-4">
        {t("loadingAnimals")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Responsive Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="bg-green-600 p-1.5 md:p-2 rounded-lg flex-shrink-0">
              <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 whitespace-nowrap">
              <span className="hidden xs:inline">{t("vetDashboard")}</span>
              <span className="inline xs:hidden">{t("vet")}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            <LanguageSwitcher />
            
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1 sm:gap-2 bg-green-100 hover:bg-green-200 px-2 sm:px-3 md:px-4 py-2 rounded-lg transition min-h-[44px]"
              >
                <User className="w-5 h-5 md:w-6 md:h-6 text-green-700" />
                <span className="text-green-700 font-semibold text-xs sm:text-sm md:text-base">
                  VET
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl p-3 z-50">
                  <p className="font-medium text-gray-800 mb-2">
                    VETERINARIAN USER
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="w-64 bg-white h-full shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-green-600" />
                {t("menu")}
              </h2>
              <button onClick={() => setShowMobileMenu(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => { navigate("/vet/dashboard"); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 rounded hover:bg-gray-200 min-h-[44px]"
              >
                {t("dashboard")}
              </button>
              <button
                onClick={() => { navigate("/vet-requests"); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 rounded hover:bg-gray-200 min-h-[44px]"
              >
                {t("farmerRequests")}
              </button>
              <button
                onClick={() => { navigate("/vet/history"); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 rounded hover:bg-gray-200 min-h-[44px]"
              >
                {t("treatmentHistory")}
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-lg p-4 min-h-screen">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-green-600" />
            {t("navigation")}
          </h2>
          <nav className="space-y-2">
            <button
              onClick={() => navigate("/vet/dashboard")}
              className="w-full text-left px-4 py-3 rounded hover:bg-gray-200 min-h-[44px]"
            >
              {t("dashboard")}
            </button>
            <button
              onClick={() => navigate("/vet-requests")}
              className="w-full text-left px-4 py-3 rounded hover:bg-gray-200 min-h-[44px]"
            >
              {t("farmerRequests")}
            </button>
            <button
              onClick={() => navigate("/vet/history")}
              className="w-full text-left px-4 py-3 rounded hover:bg-gray-200 min-h-[44px]"
            >
              {t("treatmentHistory")}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4 md:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600" />
            <span className="hidden sm:inline">{t("veterinarianDashboard")}</span>
            <span className="inline sm:hidden">{t("dashboard")}</span>
          </h1>

          {/* Quick Navigation */}
          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-lg mb-4 md:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3">{t("quickNavigation")}</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => navigate("/vet-requests")}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-semibold min-h-[44px]"
              >
                {t("farmerRequests")}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 md:mb-6">
            <select
              className="w-full sm:w-auto px-4 py-3 border rounded-lg min-h-[44px] text-sm sm:text-base"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">{t("allTypes")}</option>
              <option value="pigs">{t("pigs")}</option>
              <option value="chickens">{t("chickens")}</option>
            </select>

            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchFarmerID")}
                className="w-full pl-10 pr-4 py-3 border rounded-lg min-h-[44px] text-sm sm:text-base"
                value={farmerFilter}
                onChange={(e) => setFarmerFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Animal Cards (Mobile) */}
          <div className="lg:hidden space-y-3 mb-6">
            {filtered.map((a) => (
              <div key={a.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{a.type}</h3>
                    <p className="text-sm text-gray-600">{a.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    a.healthStatus === "Treated" ? "bg-green-100 text-green-700" :
                    a.healthStatus === "Sick" ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {a.healthStatus || "Healthy"}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500">{t("quantity")}:</span>
                    <span className="ml-1 font-semibold">{a.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("farmerID")}:</span>
                    <span className="ml-1 font-semibold text-xs">{a.ownerId.substring(0, 8)}...</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAnimal(a)}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-semibold min-h-[44px]"
                >
                  {t("treat")}
                </button>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                {t("noAnimalsFound")}
              </div>
            )}
          </div>

          {/* Animal Table (Desktop) */}
          <div className="hidden lg:block bg-white p-5 rounded-xl shadow-md overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">{t("type")}</th>
                  <th className="p-3 text-left">{t("category")}</th>
                  <th className="p-3 text-left">{t("quantity")}</th>
                  <th className="p-3 text-left">{t("health")}</th>
                  <th className="p-3 text-left">{t("farmerID")}</th>
                  <th className="p-3 text-center">{t("action")}</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{a.type}</td>
                    <td className="p-3">{a.category}</td>
                    <td className="p-3">{a.quantity}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        a.healthStatus === "Treated" ? "bg-green-100 text-green-700" :
                        a.healthStatus === "Sick" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {a.healthStatus || "Healthy"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{a.ownerId}</td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedAnimal(a)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 min-h-[44px]"
                      >
                        {t("treat")}
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-500">
                      {t("noAnimalsFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Treatment Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-bold pr-2">
                {t("treat")} {selectedAnimal.type} – {selectedAnimal.category}
              </h2>

              <button
                onClick={() => setSelectedAnimal(null)}
                className="text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">{t("quantity")}:</span>
                  <span className="ml-1 font-semibold">{selectedAnimal.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t("health")}:</span>
                  <span className="ml-1 font-semibold">{selectedAnimal.healthStatus || "Healthy"}</span>
                </div>
              </div>
            </div>

            <textarea
              className="w-full border rounded-lg p-3 h-32 min-h-[44px] text-sm sm:text-base"
              placeholder={t("describeTreatment")}
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
            />

            <button
              onClick={handleSaveTreatment}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-4 rounded-lg flex items-center justify-center gap-2 font-semibold min-h-[44px]"
            >
              <CheckCircle className="w-5 h-5" />
              {t("saveTreatment")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
