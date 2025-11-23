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
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AnimalChart from "../components/AnimalChart";
import { useAuth } from "../contexts/AuthContext";
import { useAlerts } from "../hooks/useFirestore";
import { useToast } from "../components/ToastContainer";
import { getFirestoreErrorMessage } from "../utils/errorHandlers";
import { getWeather, getUserLocation } from "../utils/weatherService";
import { db, auth } from "../firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { notifyFarmersNewAlert, notifyVetsNewRequest } from "../services/pushNotificationService";

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const role = params.get("role") || "farmer";
  const { signOut, currentUser } = useAuth();
  const { showError, showSuccess, showWarning } = useToast();
  const { t } = useTranslation();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  // Loading state for animals data
  const [animalsLoading, setAnimalsLoading] = useState(true);



  // Firestore hook for alerts with real-time updates
  const { alerts: firestoreAlerts, loading: alertsLoading, error: alertsError, addAlert: addFirestoreAlert } = useAlerts();

  // Real weather data state
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Calculate real animal statistics from database
  const [animalStats, setAnimalStats] = useState({
    totalAnimals: 0,
    activeCategories: 0,
    todayUpdates: 0,
    totalValue: 0
  });

  // Fetch all animals and calculate stats
  useEffect(() => {
    if (!currentUser) {
      setAnimalsLoading(false);
      return;
    }

    setAnimalsLoading(true);

    const q = query(
      collection(db, "animals"),
      where("ownerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const animals = [];
      let totalAnimals = 0;
      let totalValue = 0;
      const categories = new Set();
      let todayCount = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      snapshot.forEach((doc) => {
        const data = doc.data();
        animals.push({ id: doc.id, ...data });
        
        totalAnimals += data.quantity || 0;
        totalValue += (data.quantity || 0) * (data.price || 0);
        categories.add(data.type);
        
        // Check if created today
        if (data.createdAt && data.createdAt.toDate) {
          const createdDate = data.createdAt.toDate();
          createdDate.setHours(0, 0, 0, 0);
          if (createdDate.getTime() === today.getTime()) {
            todayCount++;
          }
        }
      });

      setAllAnimalsData(animals);
      setAnimalStats({
        totalAnimals,
        activeCategories: categories.size,
        todayUpdates: todayCount,
        totalValue
      });
      setAnimalsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // State for all animals data (needed for charts)
  const [allAnimalsData, setAllAnimalsData] = useState([]);
  
  // Real chart data from database
  const [animalQuantityData, setAnimalQuantityData] = useState([]);
  const [priceTrendData, setPriceTrendData] = useState([]);

  // Calculate chart data from real animals
  useEffect(() => {
    if (allAnimalsData.length === 0) {
      // Show empty state or default data
      setAnimalQuantityData([
        { name: 'No Data', pigs: 0, chickens: 0 }
      ]);
      setPriceTrendData([
        { name: 'No Data', price: 0 }
      ]);
      return;
    }

    // Group animals by date for last 7 days
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date,
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        pigs: 0,
        chickens: 0
      });
    }

    // Count animals by type for each day
    allAnimalsData.forEach(animal => {
      if (animal.createdAt && animal.createdAt.toDate) {
        const animalDate = animal.createdAt.toDate();
        const dayIndex = last7Days.findIndex(day => 
          day.date.toDateString() === animalDate.toDateString()
        );
        
        if (dayIndex !== -1) {
          if (animal.type === 'pigs') {
            last7Days[dayIndex].pigs += animal.quantity || 0;
          } else if (animal.type === 'chickens') {
            last7Days[dayIndex].chickens += animal.quantity || 0;
          }
        }
      }
    });

    setAnimalQuantityData(last7Days.map(({ name, pigs, chickens }) => ({ name, pigs, chickens })));

    // Calculate price trends by month (last 6 months)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      last6Months.push({
        date: date,
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        price: 0,
        count: 0
      });
    }

    // Calculate average price per month
    allAnimalsData.forEach(animal => {
      if (animal.createdAt && animal.createdAt.toDate) {
        const animalDate = animal.createdAt.toDate();
        const monthIndex = last6Months.findIndex(month => 
          month.date.getMonth() === animalDate.getMonth() &&
          month.date.getFullYear() === animalDate.getFullYear()
        );
        
        if (monthIndex !== -1) {
          last6Months[monthIndex].price += animal.price || 0;
          last6Months[monthIndex].count += 1;
        }
      }
    });

    // Calculate average prices
    const priceData = last6Months.map(month => ({
      name: month.name,
      price: month.count > 0 ? Math.round(month.price / month.count) : 0
    }));

    setPriceTrendData(priceData);
  }, [allAnimalsData]);

  // Alerts State
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [addAlertError, setAddAlertError] = useState(null);

  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [operationError, setOperationError] = useState(null);

  const [newEntry, setNewEntry] = useState({
    date: "",
    category: "",
    gender: "",
    quantity: "",
    price: ""
  });

  const [newReport, setNewReport] = useState({ type: "info", message: "" });

  // State for animals from shared database
  const [pigData, setPigData] = useState([]);
  const [chickenData, setChickenData] = useState([]);
  

  
  // State for Report Condition modal
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [reportAnimalType, setReportAnimalType] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  // Fetch real weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        // Get user's location or use default (Mumbai, India)
        const location = await getUserLocation();
        
        // OpenWeatherMap API key
        const apiKey = "8f4980c2b086f0f5a64ebc8ba62d8326";
        
        const data = await getWeather(location.lat, location.lon, apiKey);
        setWeather(data);
        setWeatherLoading(false);
      } catch (error) {
        console.error("Failed to fetch weather:", error);
        setWeatherLoading(false);
      }
    };

    fetchWeather();
    
    // Update weather every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch animals from shared database
  useEffect(() => {
    if (!currentUser) return;

    const fetchAnimals = async () => {
      try {
        const q = query(
          collection(db, "animals"),
          where("ownerId", "==", currentUser.uid),
          where("type", "==", selectedAnimal)
        );

        const snap = await getDocs(q);
        const arr = [];
        snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));

        if (selectedAnimal === "pigs") setPigData(arr);
        else if (selectedAnimal === "chickens") setChickenData(arr);
      } catch (error) {
        console.error("Error fetching animals:", error);
      }
    };

    if (selectedAnimal) fetchAnimals();
  }, [selectedAnimal, showAddForm, currentUser]);

  const handleAddReport = async () => {
    if (!newReport.message.trim()) {
      showWarning("Please enter an alert message");
      return;
    }

    try {
      setAddAlertError(null);
      
      // Add alert to Firestore
      await addFirestoreAlert({
        type: newReport.type,
        message: newReport.message
      });
      
      // Send push notifications to all farmers
      try {
        const result = await notifyFarmersNewAlert({
          alertType: newReport.type,
          alertMessage: newReport.message,
          createdByName: currentUser?.displayName || currentUser?.email || 'A Farmer'
        });
        
        if (result.success) {
          console.log(`Alert notification sent to ${result.count} farmers`);
        } else if (result.method === 'fallback') {
          console.log(result.message);
        }
      } catch (notifError) {
        // Don't fail the whole operation if notification fails
        console.error("Error sending alert notifications:", notifError);
      }
      
      showSuccess("Alert added successfully and farmers notified!");
      setNewReport({ type: "info", message: "" });
      setShowAddReportModal(false);
    } catch (error) {
      console.error("Error adding alert:", error);
      const errorMessage = getFirestoreErrorMessage(error);
      setAddAlertError(errorMessage);
      showError(errorMessage);
    }
  };

  // Handle condition report submission
  const handleSendCondition = async () => {
    if (!reportAnimalType || !reportCategory || !reportMessage) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "vetRequests"), {
        farmerId: auth.currentUser.uid,
        animalType: reportAnimalType,
        category: reportCategory,
        message: reportMessage,
        status: "pending",
        createdAt: serverTimestamp()
      });

      // Notify all veterinarians
      try {
        const result = await notifyVetsNewRequest({
          farmerName: currentUser?.displayName || currentUser?.email || 'A Farmer',
          animalType: reportAnimalType,
          symptoms: reportMessage,
          urgency: reportCategory
        });
        
        if (result.success) {
          console.log(`Veterinarians notified successfully (${result.count} vets)`);
        } else if (result.method === 'fallback') {
          console.log(result.message);
        }
      } catch (notifError) {
        console.error("Failed to notify veterinarians:", notifError);
        // Don't block the main flow if notification fails
      }

      alert("Condition sent to veterinarian successfully!");
      
      setShowConditionModal(false);
      setReportAnimalType("");
      setReportCategory("");
      setReportMessage("");
    } catch (err) {
      console.log(err);
      alert("Error sending report.");
    }
  };

  // Use data from shared animals database
  const currentData = selectedAnimal === "pigs" ? pigData : chickenData;
  const isLoading = animalsLoading;
  const dataError = null; // Error handling done via try-catch in operations

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
      
      // Save to shared animals collection
      await addDoc(collection(db, "animals"), {
        ownerId: currentUser.uid,
        type: selectedAnimal, // pigs or chickens
        category: newEntry.category,
        gender: newEntry.gender,
        quantity: Number(newEntry.quantity),
        price: Number(newEntry.price),
        date: newEntry.date,
        healthStatus: "Healthy",
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });

      showSuccess("Animal entry saved successfully!");
      
      setNewEntry({ date: "", category: "", gender: "", quantity: "", price: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding animal:", error);
      const errorMessage = getFirestoreErrorMessage(error);
      setOperationError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleDeleteEntry = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      setOperationError(null);
      await deleteDoc(doc(db, "animals", docId));
      showSuccess("Animal entry deleted successfully");
    } catch (error) {
      console.error("Error deleting animal:", error);
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-green-600 p-1.5 md:p-2 rounded-lg">
              <Sprout className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold text-gray-800">Smart Bio Farm</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSwitcher />
            
            <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 bg-green-100 hover:bg-green-200 px-3 md:px-4 py-2 rounded-lg transition"
            >
              <User className="w-5 h-5 md:w-6 md:h-6 text-green-700" />
              <span className="text-green-700 font-semibold">
                {role.toUpperCase()}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl p-3 z-50">
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
                  {t("logout")}
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

        {/* Live Weather - Temperature + Humidity */}
        <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 rounded-xl p-4 md:p-6 text-white shadow-lg col-span-1 md:col-span-2">
          {weatherLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="ml-3 text-white">{t("loadingWeather")}</p>
            </div>
          ) : !weather ? (
            <div className="bg-red-500 bg-opacity-20 border border-white border-opacity-30 rounded-lg p-4">
              <p className="font-semibold">{t("unableToLoadWeather")}</p>
              <p className="text-sm mt-1">{t("checkConnection")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Thermometer className="w-5 h-5 md:w-6 md:h-6" /> {t("liveTemperature")}
                  </p>
                  <p className="text-3xl md:text-4xl font-bold">{weather.temperature}°C</p>
                  <p className="text-sm opacity-80 mt-1">{t("feelsLike")} {weather.feelsLike}°C</p>
                </div>
                <div>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Droplets className="w-5 h-5 md:w-6 md:h-6" /> {t("liveHumidity")}
                  </p>
                  <p className="text-3xl md:text-4xl font-bold">{weather.humidity}%</p>
                  <p className="text-sm opacity-80 mt-1">{t("wind")}: {weather.windSpeed} m/s</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                <p className="text-sm opacity-90 break-words">
                  📍 {weather.city} • {weather.description.toUpperCase()}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {t("updatesEvery5Min")}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Animal Overview */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">{t("animalOverview")}</h3>
            <button
              onClick={() => setShowAnimalModal(true)}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              🐾 {t("manageAnimals")}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <StatBox icon={Package} value={animalStats.totalAnimals} label={t("totalAnimals")} color="green" />
            <StatBox icon={TrendingUp} value={animalStats.activeCategories} label={t("activeCategories")} color="blue" />
            <StatBox icon={CheckCircle} value={animalStats.todayUpdates} label={t("todayUpdates")} color="purple" />
            <StatBox icon={DollarSign} value={`₹${animalStats.totalValue.toLocaleString()}`} label={t("totalValue")} color="orange" />
          </div>
        </div>

        {/* Report Condition & My Requests */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
            {t("veterinaryServices")}
          </h3>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
            {t("reportHealthIssues")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button
              onClick={() => setShowConditionModal(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px]"
            >
              {t("reportCondition")}
            </button>
            
            <button
              onClick={() => navigate("/farmer/requests")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px]"
            >
              {t("myVetRequests")}
            </button>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">{t("liveAlerts")}</h3>
            
            <button
              onClick={() => setShowAddReportModal(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("addReport")}
            </button>
          </div>

          {alertsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">{t("loading")}</p>
            </div>
          ) : alertsError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">{t("error")}</p>
              <p className="text-sm mt-1">{alertsError}</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3 max-h-64 overflow-y-auto">
              {firestoreAlerts.length === 0 ? (
                <p className="text-center text-gray-500 py-4">{t("noAlertsYet")}</p>
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
                        className={`w-5 h-5 flex-shrink-0 ${
                          alert.type === "warning"
                            ? "text-yellow-600"
                            : alert.type === "alert"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 mb-2 break-words">{alert.message}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500">{formatRelativeTime(alert.timestamp, t)}</span>
                          {alert.createdByName && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-600 font-medium">{t("by")} {alert.createdByName}</span>
                            </>
                          )}
                        </div>
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
            allAnimalsData.filter(animal => animal.type === selectedAnimal)
          } />
        </div>

        {/* Analytics Dashboard */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Animal Quantity Stats */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">{t("animalQuantityStats")}</h3>
            <ResponsiveContainer width="100%" height={250}>
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
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">{t("priceTrends")}</h3>
            <ResponsiveContainer width="100%" height={250}>
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
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-2xl w-full max-w-sm">
            <h3 className="text-lg md:text-xl font-bold mb-4">Choose Animal</h3>

            <button className="w-full bg-pink-100 py-3 rounded-lg text-pink-900 font-semibold mb-3 min-h-[44px]"
              onClick={() => { setSelectedAnimal("pigs"); setShowAnimalModal(false); }}>
              🐷 Manage Pigs
            </button>

            <button className="w-full bg-yellow-100 py-3 rounded-lg text-yellow-800 font-semibold min-h-[44px]"
              onClick={() => { setSelectedAnimal("chickens"); setShowAnimalModal(false); }}>
              🐔 Manage Chickens
            </button>

            <button onClick={() => setShowAnimalModal(false)} className="mt-4 text-gray-700 underline min-h-[44px]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Database Entry Table Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center p-2 md:p-4 overflow-auto">
          <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 w-full max-w-5xl my-auto max-h-screen overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold capitalize">{selectedAnimal} Records</h2>
              <button onClick={() => {
                setSelectedAnimal(null);
                setOperationError(null);
              }} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-6 h-6 text-gray-800" />
              </button>
            </div>

            {/* Error Message */}
            {(operationError || dataError) && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg">
                <p className="font-semibold text-sm md:text-base">Error:</p>
                <p className="text-xs md:text-sm">{operationError || dataError}</p>
              </div>
            )}

            <button onClick={() => setShowAddForm(!showAddForm)}
              className="mb-4 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold min-h-[44px]">
              + Add New Entry
            </button>

            {showAddForm && (
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 border p-3 md:p-4 rounded-lg bg-gray-50">
                <input type="date" className="input w-full min-h-[44px]" value={newEntry.date}
                  onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}/>
                <input type="text" placeholder="Category" className="input w-full min-h-[44px]" value={newEntry.category}
                  onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}/>
                <select className="input w-full min-h-[44px]" value={newEntry.gender} onChange={e => setNewEntry({ ...newEntry, gender: e.target.value })}>
                  <option value="">Gender</option><option>Male</option><option>Female</option><option>Mixed</option>
                </select>
                <input type="number" placeholder="Qty" className="input w-full min-h-[44px]" value={newEntry.quantity}
                  onChange={e => setNewEntry({ ...newEntry, quantity: e.target.value })}/>
                <input type="number" placeholder="Price ₹" className="input w-full min-h-[44px]" value={newEntry.price}
                  onChange={e => setNewEntry({ ...newEntry, price: e.target.value })}/>
                <button onClick={handleAddEntry} className="bg-green-600 text-white px-3 py-2 rounded min-h-[44px] w-full sm:col-span-2 md:col-span-1">
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
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full text-left border text-sm md:text-base">
                  <thead className="bg-gray-200 text-xs md:text-sm font-bold">
                    <tr>
                      <th className="p-2 md:p-3">Date</th><th className="p-2 md:p-3">Category</th><th className="p-2 md:p-3">Gender</th>
                      <th className="p-2 md:p-3">Qty</th><th className="p-2 md:p-3">Price (₹)</th><th className="p-2 md:p-3 text-center">Actions</th>
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
                          <td className="p-2 md:p-3">{row.date}</td>
                          <td className="p-2 md:p-3">{row.category}</td>
                          <td className="p-2 md:p-3">{row.gender}</td>
                          <td className="p-2 md:p-3">{row.quantity}</td>
                          <td className="p-2 md:p-3">₹{row.price.toLocaleString()}</td>
                          <td className="p-2 md:p-3 text-center">
                            <button onClick={() => handleDeleteEntry(row.id)}
                              className="text-red-600 hover:text-red-800 font-bold min-h-[44px] px-2">
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
          <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 w-full max-w-md">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Add New Report</h3>
              <button onClick={() => {
                setShowAddReportModal(false);
                setAddAlertError(null);
              }} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
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
                className="w-full px-4 py-2 border rounded-lg min-h-[44px]"
                value={newReport.type}
                onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
              </select>

              <textarea
                rows="3"
                className="w-full px-4 py-2 border rounded-lg min-h-[44px]"
                placeholder="Enter report message..."
                value={newReport.message}
                onChange={(e) => setNewReport({ ...newReport, message: e.target.value })}
              />

              <button
                onClick={handleAddReport}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition min-h-[44px]"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Condition Modal */}
      {showConditionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 w-full max-w-md">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Report Animal Condition</h3>
              <button onClick={() => setShowConditionModal(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Animal Type */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Animal Type
                </label>
                <select
                  value={reportAnimalType}
                  onChange={(e) => setReportAnimalType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg min-h-[44px]"
                >
                  <option value="">Select</option>
                  <option value="pigs">Pigs</option>
                  <option value="chickens">Chickens</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg min-h-[44px]"
                  placeholder="Boar, Sow, Broiler, etc"
                />
              </div>

              {/* Condition Description */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Describe the Condition
                </label>
                <textarea
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg min-h-[44px]"
                  placeholder="Explain the problem or symptoms..."
                ></textarea>
              </div>

              {/* Submit */}
              <button
                onClick={handleSendCondition}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold min-h-[44px]"
              >
                Send to Veterinarian
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper function to format relative time for alerts
function formatRelativeTime(timestamp, t) {
  if (!timestamp) return 'Unknown';
  
  // Handle Firestore Timestamp object
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t("justNow");
  if (diffMins < 60) return t("minutesAgo", { count: diffMins });
  if (diffHours < 24) return t("hoursAgo", { count: diffHours });
  if (diffDays < 7) return t("daysAgo", { count: diffDays });
  
  return date.toLocaleDateString();
}

// Small reusable UI Components
function StatBox({ icon: Icon, value, label, color }) {
  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-2 md:p-3`}>
      <Icon className={`w-5 h-5 md:w-6 md:h-6 text-${color}-600`} />
      <p className="text-lg md:text-xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}