'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TestSelectionVisibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test de Visibilité des Sélections et Numéros de Produit
          </h1>
          <p className="text-gray-600">
            Tests avant/après pour la correction des problèmes de visibilité
          </p>
        </div>

        <div className="space-y-12">
          {/* Test des sélections de texte */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Test des Zones de Sélection
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AVANT - Problèmes de sélection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ❌ AVANT : Sélection grise difficile à voir
                </h3>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-gray-900 selection:bg-gray-200 selection:text-gray-500">
                    Sélectionnez ce texte avec la souris. La sélection apparaît en gris clair difficile à voir.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 selection:bg-gray-200 selection:text-gray-500">
                      Référence produit : ALT-2024-001
                    </p>
                    <p className="font-medium text-gray-900 selection:bg-gray-200 selection:text-gray-500">
                      SKU : MED-DIAG-001
                    </p>
                    <p className="text-gray-700 selection:bg-gray-200 selection:text-gray-500">
                      Code interne : SYS-001-2024
                    </p>
                  </div>
                </div>
              </div>

              {/* APRÈS - Sélections améliorées */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ✅ APRÈS : Sélection turquoise Althea Systems
                </h3>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-gray-900 selection:bg-primary/20 selection:text-primary">
                    Sélectionnez ce texte avec la souris. La sélection apparaît maintenant en turquoise.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 selection:bg-primary/20 selection:text-primary">
                      Référence produit : ALT-2024-001
                    </p>
                    <p className="font-medium text-gray-900 selection:bg-primary/20 selection:text-primary">
                      SKU : MED-DIAG-001
                    </p>
                    <p className="text-gray-700 selection:bg-primary/20 selection:text-primary">
                      Code interne : SYS-001-2024
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Test des numéros de produit */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Test des Numéros de Produit
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AVANT - Texte en blanc invisible */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ❌ AVANT : Numéros en blanc (invisible)
                </h3>
                
                {/* Simulation d'une card produit avec texte blanc */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="h-48 bg-gray-200 relative">
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      Stock : 15
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Appareil de Diagnostic XR-500
                    </h4>
                    <div className="space-y-1">
                      <p className="text-white text-xs">Réf : ALT-XR500-2024</p>
                      <p className="text-white text-xs">SKU : DIAG-XR500</p>
                      <p className="text-white text-xs">Code : XR500-001</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-3">
                      2 450,00 € <span className="text-sm font-normal text-gray-600">HT</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* APRÈS - Texte visible */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ✅ APRÈS : Numéros visibles en gris
                </h3>
                
                {/* Simulation d'une card produit avec texte visible */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="h-48 bg-gray-200 relative">
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      Stock : 15
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Appareil de Diagnostic XR-500
                    </h4>
                    <div className="space-y-1">
                      <p className="text-gray-600 text-xs font-medium">Réf : ALT-XR500-2024</p>
                      <p className="text-gray-600 text-xs font-medium">SKU : DIAG-XR500</p>
                      <p className="text-gray-600 text-xs font-medium">Code : XR500-001</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-3">
                      2 450,00 € <span className="text-sm font-normal text-gray-600">HT</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Test des inputs et formulaires */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Test des Champs de Saisie
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AVANT */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ❌ AVANT : Sélection grise dans les inputs
                </h3>
                
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Rechercher un produit..."
                    defaultValue="Appareil de diagnostic"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary selection:bg-gray-200 selection:text-gray-500"
                  />
                  
                  <textarea 
                    placeholder="Commentaires sur le produit..."
                    defaultValue="Ce produit est parfait pour notre clinique. La référence ALT-2024-001 correspond exactement à nos besoins."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20 focus:outline-none focus:ring-primary focus:border-primary selection:bg-gray-200 selection:text-gray-500"
                  />
                </div>
              </div>

              {/* APRÈS */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ✅ APRÈS : Sélection turquoise dans les inputs
                </h3>
                
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Rechercher un produit..."
                    defaultValue="Appareil de diagnostic"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary selection:bg-primary/20 selection:text-primary"
                  />
                  
                  <textarea 
                    placeholder="Commentaires sur le produit..."
                    defaultValue="Ce produit est parfait pour notre clinique. La référence ALT-2024-001 correspond exactement à nos besoins."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20 focus:outline-none focus:ring-primary focus:border-primary selection:bg-primary/20 selection:text-primary"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Test avec différents fonds */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Test sur Différents Arrière-plans
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fond blanc */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Fond blanc</h4>
                <p className="text-gray-700 text-sm selection:bg-primary/20 selection:text-primary">
                  Sélectionnez ce texte pour voir la couleur de sélection sur fond blanc.
                  SKU : ALT-001-2024
                </p>
              </div>
              
              {/* Fond gris clair */}
              <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Fond gris clair</h4>
                <p className="text-gray-700 text-sm selection:bg-primary/20 selection:text-primary">
                  Sélectionnez ce texte pour voir la couleur de sélection sur fond gris.
                  Référence : MED-002-2024
                </p>
              </div>
              
              {/* Fond turquoise */}
              <div className="bg-primary p-4 border border-primary rounded-lg">
                <h4 className="font-medium text-white mb-3">Fond turquoise</h4>
                <p className="text-white text-sm selection:bg-white/30 selection:text-white">
                  Sélectionnez ce texte pour voir la couleur de sélection sur fond turquoise.
                  Code : SYS-003-2024
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}