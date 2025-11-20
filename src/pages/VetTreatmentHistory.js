import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { Search, ArrowLeft, FileText, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function VetTreatmentHistory() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterFarmer, setFilterFarmer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    try {
      // Base query: all vetReports ordered by createdAt desc
      const q = query(collection(db, "vetReports"), orderBy("createdAt", "desc"));

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const arr = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setReports(arr);
          setLoading(false);
        },
        (err) => {
          console.error("VetTreatmentHistory listener error:", err);
          setError(err.message || String(err));
          setLoading(false);
        }
      );

      return () => unsub();
    } catch (err) {
      console.error("VetTreatmentHistory error:", err);
      setError(err.message || String(err));
      setLoading(false);
    }
  }, []);

  // Client-side filtering
  const filtered = reports.filter((r) => {
    if (filterFarmer && !r.farmerId?.toLowerCase().includes(filterFarmer.toLowerCase())) return false;
    if (startDate) {
      const d = r.createdAt && r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
      if (d < new Date(startDate)) return false;
    }
    if (endDate) {
      const d = r.createdAt && r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
      // Include entire end day
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      if (d > e) return false;
    }
    return true;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return "-";
    }
  };

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
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-blue-700">{t("treatmentHistoryTitle")}</h1>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">{t("totalReports")}</p>
            <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">{t("filteredResults")}</p>
            <p className="text-2xl font-bold text-blue-600">{filtered.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Farmer ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Farmer ID..."
                  value={filterFarmer}
                  onChange={(e) => setFilterFarmer(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                End Date
              </label>
              <input
                type="date"
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filterFarmer || startDate || endDate) && (
            <button
              onClick={() => {
                setFilterFarmer("");
                setStartDate("");
                setEndDate("");
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Farmer ID</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Animal</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Diagnosis</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Medicines</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Follow-Up</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Request ID</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600">Loading treatment history...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">No reports found.</p>
                      <p className="text-gray-500 text-sm mt-2">
                        {reports.length > 0
                          ? "Try adjusting your filters."
                          : "Treatment reports will appear here."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 text-sm">{formatDate(r.createdAt)}</td>
                      <td className="p-3 text-sm break-words max-w-xs">
                        {r.farmerId ? r.farmerId.substring(0, 20) + "..." : "-"}
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{r.animalType || "-"}</span>
                        {r.category && <span className="text-gray-600"> — {r.category}</span>}
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="truncate" title={r.diagnosis || r.notes}>
                          {r.diagnosis || r.notes || "-"}
                        </div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="truncate" title={r.medicines}>
                          {r.medicines || "-"}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {r.followupDate || r.followUp || "-"}
                      </td>
                      <td className="p-3 text-sm break-words max-w-xs">
                        {r.requestId ? r.requestId.substring(0, 12) + "..." : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
