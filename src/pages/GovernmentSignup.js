import { useState } from "react";
import { Mail, Lock, User, Building2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/ToastContainer";
import { getAuthErrorMessage } from "../utils/errorHandlers";

export default function GovernmentSignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [region, setRegion] = useState("");
  const [adminCode, setAdminCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const validateForm = () => {
    const errors = {};
    
    if (!fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      errors.password = "Password is required";
    } else {
      const passwordError = validatePassword(password);
      if (passwordError) {
        errors.password = passwordError;
      }
    }
    
    if (!department.trim()) {
      errors.department = "Department is required";
    }
    
    if (!region.trim()) {
      errors.region = "Region is required";
    }
    
    if (!adminCode.trim()) {
      errors.adminCode = "Admin access code is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    setError("");
    setValidationErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Verify admin code with backend (more secure)
      const codeValidation = await fetch('http://localhost:5000/validate-admin-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: adminCode })
      });
      
      const { valid } = await codeValidation.json();
      
      if (!valid) {
        setError("Invalid admin access code. Contact system administrator.");
        showError("Unauthorized: Invalid admin code");
        setLoading(false);
        return;
      }
      
      // Admin code validated, proceed with signup
      await signUp(email, password, fullName, "government", {
        department,
        region
      });
      
      showSuccess("Government account created successfully!");
      navigate("/government-dashboard");
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Government Services
          </h2>
          <p className="text-gray-600">Register as Agriculture Official</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.fullName ? "border-red-500" : ""
                }`}
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
            {validationErrors.fullName && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Official Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.email ? "border-red-500" : ""
                }`}
                placeholder="official@agriculture.gov"
                disabled={loading}
              />
            </div>
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Department
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.department ? "border-red-500" : ""
                }`}
                placeholder="e.g., Livestock Management"
                disabled={loading}
              />
            </div>
            {validationErrors.department && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.department}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Region
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.region ? "border-red-500" : ""
                }`}
                placeholder="e.g., Nairobi County"
                disabled={loading}
              />
            </div>
            {validationErrors.region && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.region}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Admin Access Code
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.adminCode ? "border-red-500" : ""
                }`}
                placeholder="Enter admin setup code"
                disabled={loading}
              />
            </div>
            {validationErrors.adminCode && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.adminCode}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Contact system administrator for access code
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.password ? "border-red-500" : ""
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Password must be at least 6 characters long
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Official Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/government-login")}
            className="text-blue-600 hover:text-blue-700 font-semibold"
            disabled={loading}
          >
            Login
          </button>
        </p>

        <button
          onClick={() => navigate("/profession")}
          className="text-sm text-gray-600 hover:text-gray-800 underline block mx-auto mt-4"
          disabled={loading}
        >
          ← Back to Role Selection
        </button>
      </div>
    </div>
  );
}
