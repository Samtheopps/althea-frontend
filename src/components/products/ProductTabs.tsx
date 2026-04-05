'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Truck, Shield, Settings, Award } from 'lucide-react';

import { Product } from '@/types/api';

interface ProductTabsProps {
  product: Product;
}

const tabs = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'specifications', label: 'Caractéristiques', icon: Settings },
  { id: 'delivery', label: 'Livraison', icon: Truck },
  { id: 'warranty', label: 'Garantie', icon: Shield },
  { id: 'certifications', label: 'Certifications', icon: Award },
];

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="prose prose-sm max-w-none">
            <div className="text-gray-700 leading-relaxed">
              {product.description}
            </div>
            
            {product.features && product.features.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Fonctionnalités principales
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.applications && product.applications.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Applications
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {product.applications.map((application, index) => (
                    <li key={index}>{application}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'specifications':
        return (
          <div className="space-y-6">
            {product.specifications ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-3">
                    <dt className="font-medium text-gray-900 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className="text-gray-600">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </dd>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Aucune spécification technique disponible pour ce produit.
                </p>
              </div>
            )}

            {/* Dimensions */}
            {(product.dimensions || product.weight) && (
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Dimensions et poids
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {product.dimensions && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Dimensions</span>
                      <p className="text-gray-900">{product.dimensions}</p>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Poids</span>
                      <p className="text-gray-900">{product.weight}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'delivery':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-green-900 mb-3">
                  Livraison standard
                </h4>
                <ul className="space-y-2 text-green-800">
                  <li>• Gratuite dès 100€ d'achat</li>
                  <li>• 3-5 jours ouvrés</li>
                  <li>• Suivi de colis inclus</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-blue-900 mb-3">
                  Livraison express
                </h4>
                <ul className="space-y-2 text-blue-800">
                  <li>• 24-48h partout en France</li>
                  <li>• 15€ de frais de port</li>
                  <li>• Idéal pour les urgences</li>
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Zones de livraison
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900">France métropolitaine</h5>
                  <p className="text-sm text-gray-600">Livraison standard incluse</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">DOM-TOM</h5>
                  <p className="text-sm text-gray-600">Nous consulter</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Europe</h5>
                  <p className="text-sm text-gray-600">Tarifs sur demande</p>
                </div>
              </div>
            </div>

            {product.weight && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  <strong>Note :</strong> Ce produit pèse {product.weight}. 
                  Des frais de port supplémentaires peuvent s'appliquer pour les colis volumineux.
                </p>
              </div>
            )}
          </div>
        );

      case 'warranty':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-blue-900 mb-4">
                Garantie constructeur
              </h4>
              <div className="space-y-3 text-blue-800">
                <p>• <strong>Durée :</strong> 2 ans pièces et main d'œuvre</p>
                <p>• <strong>Couverture :</strong> Défauts de fabrication</p>
                <p>• <strong>Support :</strong> Assistance technique gratuite</p>
                <p>• <strong>Réparation :</strong> Service après-vente agréé</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h5 className="font-medium text-gray-900 mb-3">Ce qui est inclus</h5>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✓ Défauts de matériaux</li>
                  <li>✓ Vices de fabrication</li>
                  <li>✓ Dysfonctionnements électroniques</li>
                  <li>✓ Support technique</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h5 className="font-medium text-gray-900 mb-3">Exclusions</h5>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✗ Dommages accidentels</li>
                  <li>✗ Usure normale</li>
                  <li>✗ Mauvaise utilisation</li>
                  <li>✗ Modifications non autorisées</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                Pour faire valoir votre garantie, conservez votre facture d'achat et 
                contactez notre service client au <strong>01 23 45 67 89</strong> ou par email à 
                <strong> support@althea-systems.fr</strong>
              </p>
            </div>
          </div>
        );

      case 'certifications':
        return (
          <div className="space-y-6">
            {product.certifications && product.certifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {product.certifications.map((cert, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-8 w-8 text-blue-600" />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-2">{cert}</h5>
                    <p className="text-sm text-gray-600">Certification validée</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Aucune certification spécifique renseignée pour ce produit.
                </p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Standards de qualité Althea Systems
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h5 className="font-medium text-gray-900 mb-1">CE Médical</h5>
                  <p className="text-sm text-gray-600">Conformité européenne</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <h5 className="font-medium text-gray-900 mb-1">ISO 13485</h5>
                  <p className="text-sm text-gray-600">Système qualité médical</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h5 className="font-medium text-gray-900 mb-1">FDA</h5>
                  <p className="text-sm text-gray-600">Approuvé États-Unis</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon
                  className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6"
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
}