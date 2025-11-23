import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreditsFooter() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 shadow-lg z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="hover:underline font-semibold transition-all hover:scale-105"
          >
            Quirk Lab
          </button>
          <span className="mx-2">✕</span>
          <span className="font-medium">Trip Defender</span>
        </div>
      </div>

      {/* Credits Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Modal Content */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Credits
              </h2>

              <div className="space-y-6">
                {/* Quirk Lab Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
                    Quirk Lab
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <span className="font-semibold">Developed by:</span>
                      <br />
                      Pranav Patil
                    </p>
                    <p>
                      <span className="font-semibold">Designed by:</span>
                      <br />
                      Pranav Patil
                    </p>
                  </div>
                </div>

                {/* Trip Defender Section */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-green-700 mb-3">
                    Trip Defender
                  </h3>
                  <p className="text-gray-700">
                    <span className="font-semibold">Proposed by:</span>
                    <br />
                    Trip Defender Team
                  </p>
                </div>

                {/* Footer Note */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    © {new Date().getFullYear()} All rights reserved
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
