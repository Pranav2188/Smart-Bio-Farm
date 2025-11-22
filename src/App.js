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
import VetLogin from "./pages/VetLogin";
import VetSignup from "./pages/VetSignup";
import VetDashboard from "./pages/VetDashboard";
import VetRequests from "./pages/VetRequests";
import FarmerMyRequests from "./pages/FarmerMyRequests";
import VetTreatmentHistory from "./pages/VetTreatmentHistory";
import GovernmentLogin from "./pages/GovernmentLogin";
import GovernmentSignup from "./pages/GovernmentSignup";
import GovernmentDashboard from "./pages/GovernmentDashboard";

export default function App() {
  return (
    <ErrorBoundary>
      <Router basename="/Smart-Bio-Farm">
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
              <Route path="/vet/login" element={<VetLogin />} />
              <Route path="/vet/signup" element={<VetSignup />} />
              <Route 
                path="/vet/dashboard" 
                element={
                  <ProtectedRoute requiredRole="veterinarian">
                    <VetDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vet-requests" 
                element={
                  <ProtectedRoute requiredRole="veterinarian">
                    <VetRequests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/farmer/requests" 
                element={
                  <ProtectedRoute requiredRole="farmer">
                    <FarmerMyRequests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vet/history" 
                element={
                  <ProtectedRoute requiredRole="veterinarian">
                    <VetTreatmentHistory />
                  </ProtectedRoute>
                } 
              />
              <Route path="/government-login" element={<GovernmentLogin />} />
              <Route path="/government-signup" element={<GovernmentSignup />} />
              <Route 
                path="/government-dashboard" 
                element={
                  <ProtectedRoute requiredRole="government">
                    <GovernmentDashboard />
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