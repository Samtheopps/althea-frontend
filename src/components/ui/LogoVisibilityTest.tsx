'use client';

import { useState } from 'react';
import Logo from './Logo';

export default function LogoVisibilityTest() {
  const [testMode, setTestMode] = useState(false);

  if (!testMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setTestMode(true)}
          className="bg-gray-800 text-white px-3 py-2 rounded text-xs"
        >
          Test Logos
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Test de Visibilité des Logos</h2>
          <button
            onClick={() => setTestMode(false)}
            className="text-black hover:text-black"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8">
          {/* Tests sur fond blanc */}
          <div className="p-6 bg-white border rounded-lg">
            <h3 className="font-semibold mb-4">Logos sur fond blanc</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm">Default:</span>
                <Logo size="sm" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm">Medium:</span>
                <Logo size="md" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm">Large:</span>
                <Logo size="lg" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm">Avec icône:</span>
                <Logo size="md" showIcon={true} />
              </div>
            </div>
          </div>

          {/* Tests sur fond gris */}
          <div className="p-6 bg-gray-100 border rounded-lg">
            <h3 className="font-semibold mb-4">Logos sur fond gris clair</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm">Default:</span>
                <Logo size="md" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm">Avec icône:</span>
                <Logo size="md" showIcon={true} />
              </div>
            </div>
          </div>

          {/* Tests sur fond sombre */}
          <div className="p-6 bg-gray-800 border rounded-lg">
            <h3 className="font-semibold mb-4 text-white">Logos sur fond sombre</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-white">Light:</span>
                <Logo size="md" variant="light" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-white">Avec icône:</span>
                <Logo size="md" variant="light" showIcon={true} />
              </div>
            </div>
          </div>

          {/* Tests sur fond bleu foncé (Footer) */}
          <div className="p-6 border rounded-lg" style={{ backgroundColor: '#003d5c' }}>
            <h3 className="font-semibold mb-4 text-white">Logos sur fond footer</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-white">Light:</span>
                <Logo size="md" variant="light" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-white">Avec icône:</span>
                <Logo size="md" variant="light" showIcon={true} />
              </div>
            </div>
          </div>

          {/* Tests sur fond coloré */}
          <div className="p-6 bg-blue-500 border rounded-lg">
            <h3 className="font-semibold mb-4 text-white">Logos sur fond coloré</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-white">Light:</span>
                <Logo size="md" variant="light" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-white">Dark:</span>
                <Logo size="md" variant="dark" />
              </div>
            </div>
          </div>

          {/* Test du gradient */}
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-4">Test du gradient CSS</h3>
            <div className="space-y-2">
              <div className="h-8 bg-gradient-to-r from-[#00a8b5] to-[#003d5c] rounded"></div>
              <p className="text-sm text-black">
                Couleurs: #00a8b5 (turquoise) → #003d5c (bleu foncé)
              </p>
            </div>
          </div>
        </div>

        {/* État des logos */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">✅ État des logos</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Header: Logo avec gradient et icône</li>
            <li>• Footer: Logo blanc avec icône</li>
            <li>• Pages Auth: Logo avec gradient</li>
            <li>• Fallbacks: Couleur unie si gradient échoue</li>
            <li>• Responsive: Tailles adaptatives</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
