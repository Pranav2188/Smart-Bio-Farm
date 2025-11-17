import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ToastContainer";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import OfflineIndicator from "./components/OfflineIndicator";
import Welcome from "./pages/Welcome";
import Profession from "./pages/Profession";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FarmerDashboard from "./pages/FarmerDashboard";

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <OfflineIndicator />
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/profession" element={<Profession />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requiredRole="farmer">
                    <FarmerDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
}

// Wrapper adds navigation behavior
function WelcomePage() {
  const navigate = useNavigate();
  return <Welcome onGetStarted={() => navigate("/profession")} />;
}