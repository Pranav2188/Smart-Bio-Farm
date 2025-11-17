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
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AnimalChart from "../components/AnimalChart";
import { useAuth } from "../contexts/AuthContext";
import { useLivestock, useEnvironmentalData, useAlerts } from "../hooks/useFirestore";
import { useToast } from "../components/ToastContainer";
import { getFirestoreErrorMessage } from "../utils/errorHandlers";

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const role = params.get("role") || "farmer";
  const { signOut } = useAuth();
  const { showError, showSuccess, showWarning } = useToast();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  // Firestore hooks for livestock data
  const pigsHook = useLivestock('pigs');
  const chickensHook = useLivestock('chickens');

  // Firestore hook for real-time environmental data
  const { data: environmentalData, loading: envLoading, error: envError } = useEnvironmentalData();

  // Firestore hook for alerts with real-time updates
  const { alerts: firestoreAlerts, loading: alertsLoading, error: alertsError, addAlert: addFirestoreAlert } = useAlerts();

  // Use real-time data from Firestore or fallback to defaults
  const liveData = {
    temperature: environmentalData?.temperature ?? 28,
    humidity: environmentalData?.humidity ?? 65,
    timestamp: environmentalData?.timestamp
  };

  const [animalStats] = useState({
    totalAnimals: 245,
    activeCategories: 2,
    todayUpdates: 5,
    totalValue: 185000
  });

  const [animalQuantityData] = useState([
    { name: 'Mon', pigs: 40, chickens: 240 },
    { name: 'Tue', pigs: 30, chickens: 220 },
    { name: 'Wed', pigs: 20, chickens: 290 },
    { name: 'Thu', pigs: 27, chickens: 200 },
    { name: 'Fri', pigs: 18, chickens: 280 },
    { name: 'Sat', pigs: 23, chickens: 250 },
    { name: 'Sun', pigs: 34, chickens: 210 },
  ]);

  const [priceTrendData] = useState([
    { name: 'Jan', price: 4000 },
    { name: 'Feb', price: 3000 },
    { name: 'Mar', price: 2000 },
    { name: 'Apr', price: 2780 },
    { name: 'May', price: 1890 },
    { name: 'Jun', price: 2390 },
    { name: 'Jul', price: 3490 },
  ]);

  // Alerts State
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [addAlertError, setAddAlertError] = useState(null);

  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [operationError, setOperationError] = useState(null);

  const [newEntry, setNewEntry] = useState({
    date: "",
    category: "",
    gender: "",
    quantity: "",
    price: ""
  });

  const [newReport, setNewReport] = useState({ type: "info", message: "" });

  const handleAddReport = async () => {
    if (!newReport.message.trim()) {
      showWarning("Please enter an alert message");
      return;
    }

    try {
      setAddAlertError(null);
      await addFirestoreAlert({
        type: newReport.type,
        message: newReport.message
      });
      
      showSuccess("Alert added successfully");
      setNewReport({ type: "info", message: "" });
      setShowAddReportModal(false);
    } catch (error) {
      console.error("Error adding alert:", error);
      const errorMessage = getFirestoreErrorMessage(error);
      setAddAlertError(errorMessage);
      showError(errorMessage);
    }
  };

  // Get current data and hook based on selected animal
  const currentHook = selectedAnimal === "pigs" ? pigsHook : chickensHook;
  const currentData = currentHook.data || [];
  const isLoading = currentHook.loading;
  const dataError = currentHook.error;

  const handleAddEntry = async () => {
    if (!newEntry.date || !newEntry.category || !newEntry.gender ||
        !newEntry.quantity || !newEntry.price) {
      const errorMsg = "Please fill all fields!";
      setOperationError(errorMsg);
      showWarning(errorMsg);
      return;
    }

    try {
      setOperationError(null);
      const livestockData = {
        date: newEntry.date,
        category: newEntry.category,
        gender: newEntry.gender,
        quantity: parseInt(newEntry.quantity),
        price: parseFloat(newEntry.price)
      };

      await currentHook.add(livestockData);
      showSuccess("Livestock entry added successfully");
      
      setNewEntry({ date: "", category: "", gender: "", quantity: "", price: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding livestock:", error);
      const errorMessage = getFirestoreErrorMessage(error);
      setOperationError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleDeleteEntry = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      setOperationError(null);
      await currentHook.delete(docId);
      showSuccess("Livestock entry deleted successfully");
    } catch (error) {
      console.error("Error deleting livestock:", error);
      const errorMessage = getFirestoreErrorMessage(error);
      setOperationError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleEditEntry = (row) => setEditingRow(row.id);

  const handleEntryChange = (id, field, value) => {
    // This function is for inline editing - we'll keep it for UI state
    // but won't use it since we removed inline editing functionality
  };

  const handleSaveEdit = async (docId, updatedData) => {
    try {
      setOperationError(null);
      await currentHook.update(docId, updatedData);
      showSuccess("Livestock entry updated successfully");
      setEditingRow(null);
    } catch (error) {
      console.error("Error updating livestock:", error);
      const errorMessage = getFirestoreErrorMessage(error);
      setOperationError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutError(null);
      await signOut();
      showSuccess("Logged out successfully");
      // Redirect to welcome page after successful logout
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      const errorMessage = "Failed to log out. Please try again.";
      setLogoutError(errorMessage);
      showError(errorMessage);
    }
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
                {logoutError && (
                  <p className="text-xs text-red-600 mb-2 px-3">
                    {logoutError}
                  </p>
                )}
                <button
                  onClick={handleLogout}
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
          {envLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="ml-3 text-white">Loading environmental data...</p>
            </div>
          ) : envError ? (
            <div className="bg-red-500 bg-opacity-20 border border-white border-opacity-30 rounded-lg p-4">
              <p className="font-semibold">Error loading environmental data</p>
              <p className="text-sm mt-1">{envError}</p>
            </div>
          ) : (
            <>
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
              {liveData.timestamp && (
                <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                  <p className="text-xs opacity-90">
                    Last updated: {formatTimestamp(liveData.timestamp)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Animal Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Animal Overview</h3>
            <button
              onClick={() => setShowAnimalModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              🐾 Manage Animals
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

          {alertsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">Loading alerts...</p>
            </div>
          ) : alertsError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Error loading alerts</p>
              <p className="text-sm mt-1">{alertsError}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {firestoreAlerts.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No alerts yet. Add your first report above.</p>
              ) : (
                firestoreAlerts.map((alert) => (
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
                        <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(alert.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        </div>

        <div className="mt-6">
          <AnimalChart data={
            selectedAnimal === "pigs" ? pigsHook.data : chickensHook.data
          } />
        </div>

        {/* Analytics Dashboard */}
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Animal Quantity Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Animal Quantity Stats</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={animalQuantityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pigs" fill="#8884d8" name="Pigs" />
                <Bar dataKey="chickens" fill="#82ca9d" name="Chickens" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Price Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Price Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      {/* Animal Type Selection Modal */}
      {showAnimalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-80">
            <h3 className="text-xl font-bold mb-4">Choose Animal</h3>

            <button className="w-full bg-pink-100 py-3 rounded-lg text-pink-900 font-semibold mb-3"
              onClick={() => { setSelectedAnimal("pigs"); setShowAnimalModal(false); }}>
              🐷 Manage Pigs
            </button>

            <button className="w-full bg-yellow-100 py-3 rounded-lg text-yellow-800 font-semibold"
              onClick={() => { setSelectedAnimal("chickens"); setShowAnimalModal(false); }}>
              🐔 Manage Chickens
            </button>

            <button onClick={() => setShowAnimalModal(false)} className="mt-4 text-gray-700 underline">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Database Entry Table Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center p-4 overflow-auto">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-5xl">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold capitalize">{selectedAnimal} Records</h2>
              <button onClick={() => {
                setSelectedAnimal(null);
                setOperationError(null);
              }}>
                <X className="w-6 h-6 text-gray-800" />
              </button>
            </div>

            {/* Error Message */}
            {(operationError || dataError) && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p className="text-sm">{operationError || dataError}</p>
              </div>
            )}

            <button onClick={() => setShowAddForm(!showAddForm)}
              className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">
              + Add New Entry
            </button>

            {showAddForm && (
              <div className="mb-4 grid grid-cols-5 gap-2 border p-3 rounded-lg bg-gray-50">
                <input type="date" className="input" value={newEntry.date}
                  onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}/>
                <input type="text" placeholder="Category" className="input" value={newEntry.category}
                  onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}/>
                <select className="input" value={newEntry.gender} onChange={e => setNewEntry({ ...newEntry, gender: e.target.value })}>
                  <option value="">Gender</option><option>Male</option><option>Female</option><option>Mixed</option>
                </select>
                <input type="number" placeholder="Qty" className="input" value={newEntry.quantity}
                  onChange={e => setNewEntry({ ...newEntry, quantity: e.target.value })}/>
                <input type="number" placeholder="Price ₹" className="input" value={newEntry.price}
                  onChange={e => setNewEntry({ ...newEntry, price: e.target.value })}/>
                <button onClick={handleAddEntry} className="bg-green-600 text-white px-3 py-1 rounded">
                  Save
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="ml-4 text-gray-600">Loading livestock data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border">
                  <thead className="bg-gray-200 text-sm font-bold">
                    <tr>
                      <th className="p-2">Date</th><th className="p-2">Category</th><th className="p-2">Gender</th>
                      <th className="p-2">Qty</th><th className="p-2">Price (₹)</th><th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-500">
                          No records found. Add your first entry above.
                        </td>
                      </tr>
                    ) : (
                      currentData.map(row => (
                        <tr key={row.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{row.date}</td>
                          <td className="p-2">{row.category}</td>
                          <td className="p-2">{row.gender}</td>
                          <td className="p-2">{row.quantity}</td>
                          <td className="p-2">₹{row.price.toLocaleString()}</td>
                          <td className="p-2 text-center">
                            <button onClick={() => handleDeleteEntry(row.id)}
                              className="text-red-600 hover:text-red-800 font-bold">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Add Report Modal */}
      {showAddReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add New Report</h3>
              <button onClick={() => {
                setShowAddReportModal(false);
                setAddAlertError(null);
              }}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {addAlertError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{addAlertError}</p>
              </div>
            )}

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

// Helper function to format Firestore timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown';
  
  // Handle Firestore Timestamp object
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleString();
}

// Helper function to format relative time for alerts
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Unknown';
  
  // Handle Firestore Timestamp object
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSecs < 10) return 'Just now';
  if (diffSecs < 60) return `${diffSecs} seconds ago`;
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
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