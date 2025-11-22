import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, onSnapshot, query, orderBy, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { AlertTriangle, CheckCircle, Clock, ArrowLeft, Stethoscope, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { notifyFarmerTreatment } from "../services/pushNotificationService";

export default function VetRequests() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Treatment modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [treatment, setTreatment] = useState({
    diagnosis: "",
    medicines: "",
    followupDate: "",
    notes: ""
  });

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(
      collection(db, "vetRequests"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const arr = [];
        snapshot.forEach((doc) => {
          arr.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setRequests(arr);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching requests:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleTreatRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const submitTreatment = async () => {
    if (!treatment.diagnosis || !treatment.medicines || !treatment.followupDate) {
      alert(t("fillAllRequiredFields"));
      return;
    }

    try {
      // 1. Save to vetReports collection
      await addDoc(collection(db, "vetReports"), {
        requestId: selectedRequest.id,
        farmerId: selectedRequest.farmerId,
        vetId: auth.currentUser.uid,
        animalType: selectedRequest.animalType,
        category: selectedRequest.category,
        diagnosis: treatment.diagnosis,
        medicines: treatment.medicines,
        followupDate: treatment.followupDate,
        notes: treatment.notes,
        createdAt: serverTimestamp()
      });

      // 2. Update request status to 'completed' and add treatment details
      await updateDoc(doc(db, "vetRequests", selectedRequest.id), {
        status: "completed",
        treatment: {
          diagnosis: treatment.diagnosis,
          medicines: treatment.medicines,
          followupDate: treatment.followupDate,
          notes: treatment.notes
        },
        completedAt: serverTimestamp()
      });

      // 3. Notify farmer
      try {
        const result = await notifyFarmerTreatment({
          farmerName: selectedRequest.farmerName || 'Farmer',
          vetName: auth.currentUser?.displayName || auth.currentUser?.email || 'Veterinarian',
          animalType: selectedRequest.animalType,
          diagnosis: treatment.diagnosis,
          treatment: treatment.medicines
        });
        
        if (result.success) {
          console.log("Farmer notified successfully");
        } else if (result.method === 'fallback') {
          console.log(result.message);
        }
      } catch (notifError) {
        console.error("Failed to notify farmer:", notifError);
        // Don't block the main flow if notification fails
      }

      alert(t("treatmentSubmittedSuccessfully"));

      // Reset modal state
      setShowModal(false);
      setSelectedRequest(null);
      setTreatment({ diagnosis: "", medicines: "", followupDate: "", notes: "" });
    } catch (error) {
      console.error("Error submitting treatment:", error);
      alert(t("errorSubmittingTreatment"));
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp.toDate()).toLocaleString();
    } catch {
      return "N/A";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600";
      case "completed":
        return "bg-green-600";
      case "in-progress":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loadingFarmerRequests")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/vet/dashboard")}
              className="bg-white p-2 rounded-lg shadow hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-blue-700">
                {t("allFarmerRequests")}
              </h1>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">{t("newRequests")}</p>
            <p className="text-2xl font-bold text-gray-800">{requests.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">{t("pending")}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">{t("completed")}</p>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">{t("noRequestsYet")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {req.animalType} — {req.category}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Request ID: {req.id.substring(0, 8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(req.status)}
                  </div>
                </div>

                {/* Farmer Info */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    <strong>Farmer ID:</strong> {req.farmerId.substring(0, 12)}...
                  </p>
                </div>

                {/* Symptoms */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Symptoms:
                  </p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {req.message}
                  </p>
                </div>

                {/* Date */}
                <p className="text-sm text-gray-500 mb-3">
                  Submitted: {formatDate(req.createdAt)}
                </p>

                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-white text-sm font-semibold ${getStatusColor(
                      req.status
                    )}`}
                  >
                    {req.status.toUpperCase()}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleTreatRequest(req)}
                  disabled={req.status === "completed"}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    req.status === "completed"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <Stethoscope className="w-5 h-5" />
                  {req.status === "completed" ? t("completed") : t("provideTreatment")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Treatment Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-6 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                <Stethoscope className="w-7 h-7" />
                Treatment for {selectedRequest.animalType}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Request Details */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Animal:</strong> {selectedRequest.animalType} - {selectedRequest.category}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Farmer ID:</strong> {selectedRequest.farmerId.substring(0, 20)}...
              </p>
              <p className="text-sm text-gray-600">
                <strong>Symptoms:</strong> {selectedRequest.message}
              </p>
            </div>

            {/* Treatment Form */}
            <div className="space-y-4">
              {/* Diagnosis */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  {t("diagnosis")} <span className="text-red-600">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder={t("diagnosis")}
                  value={treatment.diagnosis}
                  onChange={(e) =>
                    setTreatment({ ...treatment, diagnosis: e.target.value })
                  }
                />
              </div>

              {/* Medicines */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  {t("medicines")} <span className="text-red-600">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder={t("medicines")}
                  value={treatment.medicines}
                  onChange={(e) =>
                    setTreatment({ ...treatment, medicines: e.target.value })
                  }
                />
              </div>

              {/* Follow-up Date */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  {t("followupDate")} <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={treatment.followupDate}
                  onChange={(e) =>
                    setTreatment({ ...treatment, followupDate: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  {t("notes")}
                </label>
                <textarea
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder={t("notes")}
                  value={treatment.notes}
                  onChange={(e) =>
                    setTreatment({ ...treatment, notes: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                onClick={() => {
                  setShowModal(false);
                  setTreatment({ diagnosis: "", medicines: "", followupDate: "", notes: "" });
                }}
              >
                {t("cancel")}
              </button>
              <button
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
                onClick={submitTreatment}
              >
                <CheckCircle className="w-5 h-5" />
                {t("submitTreatment")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
