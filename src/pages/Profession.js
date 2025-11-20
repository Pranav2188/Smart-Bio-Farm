import { Sprout, Users, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Profession() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const professions = [
    {
      id: "farmer",
      title: t("farmer"),
      icon: Sprout,
      description: t("farmerDesc"),
      color: "bg-green-500",
    },
    {
      id: "veterinarian",
      title: t("veterinarian"),
      icon: Users,
      description: t("veterinarianDesc"),
      color: "bg-blue-500",
    },
    {
      id: "government",
      title: t("government"),
      icon: Building2,
      description: t("governmentDesc"),
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {t("chooseProfession")}
          </h2>
          <p className="text-lg text-gray-600">
            {t("selectRole")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {professions.map((profession) => {
            const Icon = profession.icon;
            const loginPath = profession.id === "government" 
              ? "/government-login" 
              : `/login?role=${profession.id}`;
            return (
              <div
                key={profession.id}
                onClick={() => navigate(loginPath)}
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
                  {t("continue")}
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
            ← {t("backToWelcome")}
          </button>
        </div>
      </div>
    </div>
  );
}