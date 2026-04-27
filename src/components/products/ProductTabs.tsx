'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Truck, Shield, Settings, Award } from 'lucide-react';

import { Product } from '@/types/api';
import { useI18n } from '@/lib/i18n';
import { T } from '@/components/ui/TranslatedText';

interface ProductTabsProps {
  product: Product;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const { tr } = useI18n();
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description',    label: tr.product.tabs.description,    icon: FileText },
    { id: 'specifications', label: tr.product.tabs.specifications, icon: Settings },
    { id: 'delivery',       label: tr.product.tabs.delivery,       icon: Truck },
    { id: 'warranty',       label: tr.product.tabs.warranty,       icon: Shield },
    { id: 'certifications', label: tr.product.tabs.certifications, icon: Award },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="space-y-6">
            <div className="text-black leading-relaxed font-medium">
              <T>{product.description}</T>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-bold text-black mb-4">
                  Fonctionnalités principales
                </h4>
                <ul className="list-disc list-inside space-y-2 text-black font-medium">
                  {product.features.map((feature, index) => (
                    <li key={index}><T>{feature}</T></li>
                  ))}
                </ul>
              </div>
            )}

            {product.applications && product.applications.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-bold text-black mb-4">
                  Applications
                </h4>
                <ul className="list-disc list-inside space-y-2 text-black font-medium">
                  {product.applications.map((application, index) => (
                    <li key={index}><T>{application}</T></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'specifications':
        return (
          <div className="space-y-6">
            {/* Informations produit */}
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
              <h4 className="text-lg font-bold text-black mb-4">
                Informations produit
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-black">Référence</span>
                  <p className="product-reference text-black font-mono">ALT-{product.id.slice(-6).toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-black">ID Produit</span>
                  <p className="product-code text-black font-mono">{product.id}</p>
                </div>
                {product.brand && (
                  <div>
                    <span className="text-sm font-medium text-black">Marque</span>
                    <p className="text-black">{product.brand}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Spécifications techniques */}
            {product.specifications ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-300 pb-3">
                    <dt className="font-semibold text-primary mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className="text-black font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </dd>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                 <Settings className="h-12 w-12 text-black mx-auto mb-4" />
                <p className="text-black">
                  Aucune spécification technique disponible pour ce produit.
                </p>
              </div>
            )}

            {/* Dimensions */}
            {(product.dimensions || product.weight) && (
              <div className="mt-8">
                <h4 className="text-lg font-bold text-black mb-4">
                  Dimensions et poids
                </h4>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {product.dimensions && (
                    <div>
                      <span className="text-sm font-medium text-black">Dimensions</span>
                      <p className="text-black">{product.dimensions}</p>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <span className="text-sm font-medium text-black">Poids</span>
                      <p className="text-black">{product.weight}</p>
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
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-black mb-3">
                  Livraison standard
                </h4>
                <ul className="space-y-2 text-black font-medium">
                  <li>• Gratuite dès 100€ d'achat</li>
                  <li>• 3-5 jours ouvrés</li>
                  <li>• Suivi de colis inclus</li>
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h4 className="text-lg font-bold text-black mb-3">
                  Livraison express
                </h4>
                <ul className="space-y-2 text-black font-medium">
                  <li>• 24-48h partout en France</li>
                  <li>• 15€ de frais de port</li>
                  <li>• Idéal pour les urgences</li>
                </ul>
              </div>
            </div>

            <div className="border border-primary/20 rounded-lg p-6">
              <h4 className="text-lg font-bold text-black mb-4">
                Zones de livraison
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <h5 className="font-semibold text-black">France métropolitaine</h5>
                  <p className="text-sm text-black">Livraison standard incluse</p>
                </div>
                <div>
                  <h5 className="font-semibold text-black">DOM-TOM</h5>
                  <p className="text-sm text-black">Nous consulter</p>
                </div>
                <div>
                  <h5 className="font-semibold text-black">Europe</h5>
                  <p className="text-sm text-black">Tarifs sur demande</p>
                </div>
              </div>
            </div>

            {product.weight && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-black font-medium">
                  <strong className="text-primary">Note :</strong> Ce produit pèse {product.weight}. 
                  Des frais de port supplémentaires peuvent s'appliquer pour les colis volumineux.
                </p>
              </div>
            )}
          </div>
        );

      case 'warranty':
        return (
          <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <h4 className="text-lg font-bold text-black mb-4">
                Garantie constructeur
              </h4>
              <div className="space-y-3 text-black font-medium">
                <p>• <strong className="text-primary">Durée :</strong> 2 ans pièces et main d'œuvre</p>
                <p>• <strong className="text-primary">Couverture :</strong> Défauts de fabrication</p>
                <p>• <strong className="text-primary">Support :</strong> Assistance technique gratuite</p>
                <p>• <strong className="text-primary">Réparation :</strong> Service après-vente agréé</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-primary/20 rounded-lg p-6">
                <h5 className="font-bold text-black mb-3">Ce qui est inclus</h5>
                <ul className="space-y-2 text-black text-sm font-medium">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Défauts de matériaux
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Vices de fabrication
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Dysfonctionnements électroniques
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Support technique
                  </li>
                </ul>
              </div>

              <div className="border border-primary/20 rounded-lg p-6">
                <h5 className="font-bold text-black mb-3">Exclusions</h5>
                <ul className="space-y-2 text-black text-sm font-medium">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Dommages accidentels
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Usure normale
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Mauvaise utilisation
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Modifications non autorisées
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-black text-sm">
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
                   <div key={index} className="border border-gray-300 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-8 w-8 text-blue-600" />
                    </div>
                    <h5 className="font-medium text-black mb-2">{cert}</h5>
                    <p className="text-sm text-black">Certification validée</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                 <Award className="h-12 w-12 text-black mx-auto mb-4" />
                <p className="text-black">
                  Aucune certification spécifique renseignée pour ce produit.
                </p>
              </div>
            )}

            <div className="bg-primary/5 border border-primary/10 rounded-lg p-6">
              <h4 className="text-lg font-bold text-black mb-4">
                Standards de qualité Althea Systems
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h5 className="font-semibold text-black mb-1">CE Médical</h5>
                  <p className="text-sm text-black">Conformité européenne</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h5 className="font-semibold text-black mb-1">ISO 13485</h5>
                  <p className="text-sm text-black">Système qualité médical</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h5 className="font-semibold text-black mb-1">FDA</h5>
                  <p className="text-sm text-black">Approuvé États-Unis</p>
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
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
      {/* Onglets */}
      <div className="border-b border-gray-300">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-black hover:text-primary hover:border-primary/30'
                }`}
              >
                <Icon
                  className={`mr-2 h-5 w-5 transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary'
                       : 'text-black group-hover:text-primary'
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