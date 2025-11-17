import {
  Sprout,
  User,
  LogOut,
  Thermometer,
  Droplets,
  Package,
  TrendingUp,
  CheckCircle,
  DollarSign,
  Plus,
  X,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const role = params.get("role") || "farmer";

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAnimalModal, setShowAnimalModal] = useState(false);

  const liveData = {
    temperature: 28,
    humidity: 65,
  };

  const animalStats = {
    totalAnimals: 245,
    activeCategories: 2,
    todayUpdates: 5,
    totalValue: 185000,
  };

  const [showAddReportModal, setShowAddReportModal] = useState(false);

  const [alerts, setAlerts] = useState([
    { id: 1, type: "warning", message: "Low soil moisture detected", time: "10 mins ago" },
    { id: 2, type: "info", message: "Rain expected tomorrow", time: "1 hour ago" },
    { id: 3, type: "alert", message: "Pest activity reported nearby", time: "2 hours ago" },
  ]);

  const [newReport, setNewReport] = useState({ type: "info", message: "" });

  const handleAddReport = () => {
    if (!newReport.message.trim()) return;

    const report = {
      id: alerts.length + 1,
      ...newReport,
      time: "Just now"
    };

    setAlerts([report, ...alerts]);
    setNewReport({ type: "info", message: "" });
    setShowAddReportModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Smart Bio Farm</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 bg-green-100 hover:bg-green-200 px-4 py-2 rounded-lg transition"
            >
              <User className="w-5 h-5 text-green-700" />
              <span className="text-green-700 font-semibold">
                {role.toUpperCase()}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl p-3">
                <p className="font-medium text-gray-800 mb-2">
                  {role.toUpperCase()} USER
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 w-full text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Live Temperature + Humidity */}
        <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 rounded-xl p-6 text-white shadow-lg col-span-2">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold flex items-center gap-2">
                <Thermometer className="w-6 h-6" /> Live Temperature
              </p>
              <p className="text-4xl font-bold">{liveData.temperature}°C</p>
            </div>
            <div>
              <p className="text-sm font-semibold flex items-center gap-2">
                <Droplets className="w-6 h-6" /> Live Humidity
              </p>
              <p className="text-4xl font-bold">{liveData.humidity}%</p>
            </div>
          </div>
        </div>

        {/* Animal Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Animal Overview</h3>
            <button
              onClick={() => setShowAnimalModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
            >
              <Package className="w-5 h-5" /> Manage
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatBox icon={Package} value={animalStats.totalAnimals} label="Total Animals" color="green" />
            <StatBox icon={TrendingUp} value={animalStats.activeCategories} label="Active Categories" color="blue" />
            <StatBox icon={CheckCircle} value={animalStats.todayUpdates} label="Today's Updates" color="purple" />
            <StatBox icon={DollarSign} value={`₹${animalStats.totalValue.toLocaleString()}`} label="Total Value" color="orange" />
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Live Alerts</h3>
            
            <button
              onClick={() => setShowAddReportModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Report
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 p-3 rounded ${
                  alert.type === "warning"
                    ? "border-yellow-500 bg-yellow-50"
                    : alert.type === "alert"
                    ? "border-red-500 bg-red-50"
                    : "border-blue-500 bg-blue-50"
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      alert.type === "warning"
                        ? "text-yellow-600"
                        : alert.type === "alert"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animal Selection Modal */}
      {showAnimalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Select Animal Type</h3>
              <button onClick={() => setShowAnimalModal(false)}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <AnimalButton label="🐷 Pigs" />
              <AnimalButton label="🐔 Chickens" />
            </div>
          </div>
        </div>
      )}

      {/* Add Report Modal */}
      {showAddReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add New Report</h3>
              <button onClick={() => setShowAddReportModal(false)}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <select
                className="w-full px-4 py-2 border rounded-lg"
                value={newReport.type}
                onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
              </select>

              <textarea
                rows="3"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter report message..."
                value={newReport.message}
                onChange={(e) => setNewReport({ ...newReport, message: e.target.value })}
              />

              <button
                onClick={handleAddReport}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Small reusable UI Components
function StatBox({ icon: Icon, value, label, color }) {
  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-3`}>
      <Icon className={`w-6 h-6 text-${color}-600`} />
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function AnimalButton({ label }) {
  return (
    <button className="w-full bg-green-100 hover:bg-green-200 py-3 rounded-lg font-semibold transition">
      {label}
    </button>
  );
}