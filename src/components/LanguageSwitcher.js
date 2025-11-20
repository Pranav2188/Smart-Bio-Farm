import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('smartBioFarmLanguage', lng);
  };

  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200">
      <Globe className="w-5 h-5 text-gray-700" />
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent outline-none cursor-pointer text-gray-700 font-medium text-sm min-w-[100px]"
      >
        <option value="en">🇬🇧 English</option>
        <option value="hi">🇮🇳 हिन्दी</option>
        <option value="mr">🇮🇳 मराठी</option>
      </select>
    </div>
  );
}
