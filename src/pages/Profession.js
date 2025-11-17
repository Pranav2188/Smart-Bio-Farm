import { Sprout, Users, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const professions = [
  {
    id: "farmer",
    title: "Farmer",
    icon: Sprout,
    description: "Manage your farm, crops, and livestock efficiently",
    color: "bg-green-500",
  },
  {
    id: "veterinarian",
    title: "Veterinarian",
    icon: Users,
    description: "Provide healthcare services for livestock",
    color: "bg-blue-500",
  },
  {
    id: "government",
    title: "Government Services",
    icon: Building2,
    description: "Monitor and support agricultural development",
    color: "bg-purple-500",
  },
];

export default function Profession() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Choose Your Profession
          </h2>
          <p className="text-lg text-gray-600">
            Select your role to access tailored features and services
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {professions.map((profession) => {
            const Icon = profession.icon;
            return (
              <div
                key={profession.id}
                onClick={() => navigate(`/login?role=${profession.id}`)}
                className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transition-all transform hover:scale-105 hover:shadow-2xl"
              >
                <div className={`${profession.color} w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                  {profession.title}
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {profession.description}
                </p>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-colors">
                  Continue
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Back to Welcome
          </button>
        </div>
      </div>
    </div>
  );
}