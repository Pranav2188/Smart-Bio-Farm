import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Profession from "./pages/Profession";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FarmerDashboard from "./pages/FarmerDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/profession" element={<Profession />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<FarmerDashboard />} />
      </Routes>
    </Router>
  );
}

// Wrapper adds navigation behavior
function WelcomePage() {
  const navigate = useNavigate();
  return <Welcome onGetStarted={() => navigate("/profession")} />;
}