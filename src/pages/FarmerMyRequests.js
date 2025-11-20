import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { AlertTriangle, CheckCircle, Clock, ArrowLeft } from "lucide-react";

export default function FarmerMyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "vetRequests"),
      where("farmerId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching requests:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white p-2 rounded-lg shadow hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-green-700">
            My Vet Requests
          </h1>
        </div>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No requests sent yet.</p>
            <p className="text-gray-500 mt-2">
              Submit a condition report from your dashboard to get started.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition"
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

                {/* Condition/Message */}
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
                  Sent on: {formatDate(req.createdAt)}
                </p>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className="font-semibold text-gray-700">Status: </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-white text-sm font-semibold ${getStatusColor(
                      req.status
                    )}`}
                  >
                    {req.status.toUpperCase()}
                  </span>
                </div>

                {/* Treatment Details (if available) */}
                {req.treatment && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Veterinarian Response
                    </h3>

                    {req.treatment.diagnosis && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700">
                          Diagnosis:
                        </p>
                        <p className="text-gray-600 bg-green-50 p-2 rounded">
                          {req.treatment.diagnosis}
                        </p>
                      </div>
                    )}

                    {req.treatment.medicines && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700">
                          Medicines:
                        </p>
                        <p className="text-gray-600 bg-blue-50 p-2 rounded">
                          {req.treatment.medicines}
                        </p>
                      </div>
                    )}

                    {req.treatment.followupDate && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700">
                          Follow-up Date:
                        </p>
                        <p className="text-gray-600 bg-purple-50 p-2 rounded">
                          {req.treatment.followupDate}
                        </p>
                      </div>
                    )}

                    {req.treatment.notes && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Additional Notes:
                        </p>
                        <p className="text-gray-600 bg-gray-50 p-2 rounded">
                          {req.treatment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
