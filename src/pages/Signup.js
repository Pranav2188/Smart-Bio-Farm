import { Mail, Lock, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const role = params.get("role") || "farmer";

  const handleSignup = () => {
    navigate(`/dashboard?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Sign Up as {role}
          </h2>
          <p className="text-gray-600">Create your account</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            onClick={handleSignup}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Create Account
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() =>
                navigate(`/login?role=${role}`)
              }
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Login
            </button>
          </p>

          <button
            onClick={() => navigate("/profession")}
            className="text-sm text-gray-600 hover:text-gray-800 underline block mx-auto"
          >
            ← Change Profession
          </button>
        </div>
      </div>
    </div>
  );
}