import { useState, useEffect } from "react";
import {
  Building2, Users, AlertTriangle, TrendingUp, Activity,
  LogOut, Bell, FileText, BarChart3, Cloud, Plus, X, Send
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs, where, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../components/ToastContainer";
import { getWeather, getUserLocation } from "../utils/weatherService";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { notifyFarmersNewAlert } from "../services/pushNotificationService";

export default function GovernmentDashboard() {
  const { currentUser, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Statistics
  const [stats, setStats] = useState({
    totalFarmers: 0, totalVets: 0, totalAnimals: 0,
    activeAlerts: 0, pendingRequests: 0, completedTreatments: 0
  });
  
  // Data
  const [farmers, setFarmers] = useState([]);
  const [allAnimals, setAllAnimals] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [weather, setWeather] = useState(null);
  
  // Alert modal
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [newAlert, setNewAlert] = useState({ type: "info", message: "" });

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
      fetchWeather();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch farmers
      const farmersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "farmer")));
      const farmersList = [];
      farmersSnap.forEach(doc => farmersList.push({ id: doc.id, ...doc.data() }));
      setFarmers(farmersList);

      // Fetch vets
      const vetsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "veterinarian")));

      // Fetch all animals from shared animals collection
      const animalsSnap = await getDocs(collection(db, "animals"));
      let totalAnimals = 0;
      const animalsList = [];
      animalsSnap.forEach(doc => {
        const data = doc.data();
        totalAnimals += data.quantity || 0;
        animalsList.push({ id: doc.id, ...data });
      });
      setAllAnimals(animalsList);

      // Fetch alerts
      const alertsSnap = await getDocs(query(collection(db, "alerts"), where("isGlobal", "==", true), orderBy("timestamp", "desc")));
      const alerts = [];
      alertsSnap.forEach(doc => alerts.push({ id: doc.id, ...doc.data() }));
      setRecentAlerts(alerts.slice(0, 10));

      // Fetch vet requests
      const requestsSnap = await getDocs(collection(db, "vetRequests"));
      let pending = 0, completed = 0;
      const requests = [];
      requestsSnap.forEach(doc => {
        const data = doc.data();
        if (data.status === "pending") pending++;
        else if (data.status === "completed") completed++;
        requests.push({ id: doc.id, ...data });
      });
      requests.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setRecentRequests(requests.slice(0, 10));

      setStats({
        totalFarmers: farmersList.length,
        totalVets: vetsSnap.size,
        totalAnimals,
        activeAlerts: alerts.length,
        pendingRequests: pending,
        completedTreatments: completed
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      showError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const location = await getUserLocation();
      const apiKey = "8f4980c2b086f0f5a64ebc8ba62d8326";
      const weatherData = await getWeather(location.lat, location.lon, apiKey);
      setWeather(weatherData);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.message.trim()) {
      showWarning("Please enter an alert message");
      return;
    }

    try {
      await addDoc(collection(db, "alerts"), {
        createdBy: currentUser.uid,
        createdByName: `${userProfile?.fullName || "Government"} (${userProfile?.department || "Official"})`,
        type: newAlert.type,
        message: newAlert.message,
        isGlobal: true,
        timestamp: serverTimestamp()
      });

      // Send notifications
      try {
        const result = await notifyFarmersNewAlert({
          alertType: newAlert.type,
          alertMessage: newAlert.message,
          createdByName: `Government - ${userProfile?.department || "Official"}`
        });
        
        if (result.success) {
          console.log(`Alert sent to ${result.count} farmers`);
        } else if (result.method === 'fallback') {
          console.log(result.message);
        }
      } catch (notifError) {
        console.error("Notification error:", notifError);
      }

      showSuccess("Government alert created and sent to all farmers!");
      setNewAlert({ type: "info", message: "" });
      setShowAlertModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error("Error creating alert:", error);
      showError("Failed to create alert");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showSuccess("Logged out successfully");
      navigate("/government-login");
    } catch (error) {
      showError("Failed to logout");
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Government Services Dashboard</h1>
                <p className="text-sm text-gray-600">
                  {userProfile?.department || "Agriculture Department"} • {userProfile?.region || "National"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{userProfile?.fullName || currentUser?.email}</p>
                <p className="text-xs text-gray-600">Agriculture Official</p>
              </div>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
                <LogOut className="w-4 h-4" />
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "farmers", label: "All Farmers", icon: Users },
              { id: "animals", label: "Livestock", icon: Activity },
              { id: "requests", label: "Vet Requests", icon: FileText },
              { id: "alerts", label: "Alerts Control", icon: Bell },
              { id: "weather", label: "Weather", icon: Cloud }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 font-semibold"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard title="Total Farmers" value={stats.totalFarmers} icon={Users} color="green" />
              <StatCard title="Veterinarians" value={stats.totalVets} icon={Activity} color="blue" />
              <StatCard title="Total Livestock" value={stats.totalAnimals} icon={TrendingUp} color="purple" />
              <StatCard title="Active Alerts" value={stats.activeAlerts} icon={AlertTriangle} color="yellow" />
              <StatCard title="Pending Requests" value={stats.pendingRequests} icon={FileText} color="orange" />
              <StatCard title="Completed Treatments" value={stats.completedTreatments} icon={BarChart3} color="green" />
            </div>

            {/* Weather & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Weather Card */}
              {weather && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Cloud className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-800">Current Weather</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-bold text-gray-800">{weather.temperature}°C</p>
                      <p className="text-gray-600 mt-1">{weather.description}</p>
                      <p className="text-sm text-gray-500 mt-2">Humidity: {weather.humidity}%</p>
                    </div>
                    <div className="text-6xl">{weather.icon}</div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAlertModal(true)}
                    className="w-full flex items-center gap-3 p-3 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">Create Government Alert</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("farmers")}
                    className="w-full flex items-center gap-3 p-3 border-2 border-green-200 rounded-lg hover:bg-green-50 transition"
                  >
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-800">View All Farmers</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("animals")}
                    className="w-full flex items-center gap-3 p-3 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition"
                  >
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-800">Livestock Overview</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityCard title="Recent Alerts" icon={Bell} items={recentAlerts} type="alert" formatTime={formatRelativeTime} />
              <ActivityCard title="Recent Vet Requests" icon={FileText} items={recentRequests} type="request" formatTime={formatRelativeTime} />
            </div>
          </div>
        )}

        {/* Farmers Tab */}
        {activeTab === "farmers" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Registered Farmers</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {farmers.map(farmer => (
                    <tr key={farmer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{farmer.fullName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{farmer.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatRelativeTime(farmer.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Animals Tab */}
        {activeTab === "animals" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">National Livestock Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Animals</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalAnimals}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Pigs</p>
                <p className="text-3xl font-bold text-green-600">{allAnimals.filter(a => a.type === "pigs").reduce((sum, a) => sum + (a.quantity || 0), 0)}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Chickens</p>
                <p className="text-3xl font-bold text-yellow-600">{allAnimals.filter(a => a.type === "chickens").reduce((sum, a) => sum + (a.quantity || 0), 0)}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allAnimals.slice(0, 50).map(animal => (
                    <tr key={animal.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800 capitalize">{animal.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{animal.category}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{animal.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{animal.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Veterinary Requests</h2>
            <div className="space-y-4">
              {recentRequests.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          request.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }`}>
                          {request.status}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{request.animalType} - {request.category}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{request.message}</p>
                      <p className="text-xs text-gray-500">{formatRelativeTime(request.createdAt)}</p>
                    </div>
                  </div>
                  {request.diagnosis && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700">Treatment:</p>
                      <p className="text-sm text-gray-600">{request.diagnosis}</p>
                      {request.medicine && <p className="text-xs text-gray-500 mt-1">Medicine: {request.medicine}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Government Alerts Control</h2>
                <button
                  onClick={() => setShowAlertModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  Create Alert
                </button>
              </div>
              <p className="text-gray-600 mb-4">Create and manage region-wide alerts for disease outbreaks, weather warnings, and government schemes.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">All Active Alerts</h3>
              <div className="space-y-3">
                {recentAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`border-l-4 p-4 rounded ${
                      alert.type === "warning" ? "border-yellow-500 bg-yellow-50" :
                      alert.type === "alert" ? "border-red-500 bg-red-50" : "border-blue-500 bg-blue-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-gray-500">{formatRelativeTime(alert.timestamp)}</p>
                          {alert.createdByName && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-600">{alert.createdByName}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === "weather" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Weather Monitoring Center</h2>
            {weather ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Temperature</p>
                    <p className="text-4xl font-bold text-blue-600">{weather.temperature}°C</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Humidity</p>
                    <p className="text-4xl font-bold text-green-600">{weather.humidity}%</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Conditions</p>
                    <p className="text-2xl font-bold text-purple-600">{weather.description}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Weather Advisory</h3>
                  <p className="text-gray-600">
                    Current weather conditions are being monitored. Use the Alerts Control to send weather warnings to farmers if needed.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab("alerts");
                      setShowAlertModal(true);
                      setNewAlert({ type: "warning", message: `Weather Alert: ${weather.description}. Temperature: ${weather.temperature}°C` });
                    }}
                    className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Send Weather Alert
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Loading weather data...</p>
            )}
          </div>
        )}
      </div>

      {/* Create Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Create Government Alert</h3>
              <button onClick={() => setShowAlertModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alert Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="alert">Critical Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter alert message for all farmers..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAlert}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  Send Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
    orange: "bg-orange-100 text-orange-600"
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ title, icon: Icon, items, type, formatTime }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No items yet</p>
        ) : (
          items.map(item => (
            <div key={item.id} className={type === "alert" ? 
              `border-l-4 p-3 rounded ${
                item.type === "warning" ? "border-yellow-500 bg-yellow-50" :
                item.type === "alert" ? "border-red-500 bg-red-50" : "border-blue-500 bg-blue-50"
              }` : "border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
            }>
              {type === "alert" ? (
                <>
                  <p className="text-sm font-medium text-gray-800">{item.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{formatTime(item.timestamp)}</p>
                    {item.createdByName && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-600">{item.createdByName}</p>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{item.animalType} - {item.category}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{formatTime(item.createdAt)}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
