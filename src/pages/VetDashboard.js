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
import { Stethoscope, Search, X, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function VetDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [animals, setAnimals] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [treatment, setTreatment] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");
  const [farmerFilter, setFarmerFilter] = useState("");

  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 text-xl">
        {t("loadingAnimals")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4">
        <div className="mb-4">
          <LanguageSwitcher />
        </div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-green-600" />
          {t("vetDashboard")}
        </h2>
        <nav className="space-y-2">
          <button
            onClick={() => navigate("/vet/dashboard")}
            className="w-full text-left px-4 py-2 rounded hover:bg-gray-200"
          >
            {t("dashboard")}
          </button>
          <button
            onClick={() => navigate("/vet-requests")}
            className="w-full text-left px-4 py-2 rounded hover:bg-gray-200"
          >
            {t("farmerRequests")}
          </button>
          <button
            onClick={() => navigate("/vet/history")}
            className="w-full text-left px-4 py-2 rounded hover:bg-gray-200"
          >
            {t("treatmentHistory")}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Stethoscope className="w-8 h-8 text-green-600" />
          {t("veterinarianDashboard")}
        </h1>

        {/* Quick Navigation */}
        <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-3">{t("quickNavigation")}</h2>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/vet-requests")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
            >
              {t("farmerRequests")}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
        <select
          className="px-4 py-2 border rounded-lg"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">{t("allTypes")}</option>
          <option value="pigs">{t("pigs")}</option>
          <option value="chickens">{t("chickens")}</option>
        </select>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={t("searchFarmerID")}
            className="pl-10 pr-4 py-2 border rounded-lg"
            value={farmerFilter}
            onChange={(e) => setFarmerFilter(e.target.value)}
          />
        </div>
      </div>

        {/* Animal Table */}
        <div className="bg-white p-5 rounded-xl shadow-md">
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
                <td className="p-3">{a.healthStatus || "Healthy"}</td>
                <td className="p-3 text-sm text-gray-600">{a.ownerId}</td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => setSelectedAnimal(a)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
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

        {/* Treatment Modal */}
        {selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {t("treat")} {selectedAnimal.type} – {selectedAnimal.category}
              </h2>

              <button
                onClick={() => setSelectedAnimal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <textarea
              className="w-full border rounded-lg p-3 h-32"
              placeholder={t("describeTreatment")}
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
            />

            <button
              onClick={handleSaveTreatment}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-4 rounded-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {t("saveTreatment")}
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
