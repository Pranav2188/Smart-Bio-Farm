import { Sprout, ArrowRight } from "lucide-react";

export default function Welcome({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="bg-green-600 p-6 rounded-full shadow-2xl">
            <Sprout className="w-16 h-16 text-white" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
          Welcome to
        </h1>
        <h2 className="text-4xl md:text-5xl font-bold text-green-600 mb-6">
          Smart Bio Farm
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Revolutionizing agriculture with smart technology and sustainable practices
        </p>
        <button
          onClick={onGetStarted}
          aria-label="Get started"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all transform hover:scale-105 inline-flex items-center gap-2"
        >
          Get Started
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}