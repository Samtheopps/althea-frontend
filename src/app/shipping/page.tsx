'use client';

import { motion } from 'framer-motion';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Package, 
  Shield,
  CheckCircle,
  Info,
  Euro,
  Calendar,
  Search,
  Star,
  Zap
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { FeatureCard, InfoCard, Section, SectionHeader } from '@/components/ui/Cards';
import { StatsGrid, ServiceCard, CallToActionCard } from '@/components/ui/EnhancedCards';

export default function ShippingPage() {
  const shippingOptions = [
    {
      icon: Truck,
      title: 'Livraison Standard',
      description: 'Livraison en 3-5 jours ouvrés pour la plupart des équipements médicaux. Solution économique idéale pour les commandes non-urgentes.',
      features: [
        'Délai 3-5 jours ouvrés',
        'Gratuit dès 500€ d\'achat',
        'Suivi en temps réel',
        'Assurance incluse'
      ]
    },
    {
      icon: Zap,
      title: 'Livraison Express',
      description: 'Livraison en 24-48h pour les équipements urgents. Service prioritaire disponible sur toute la France métropolitaine.',
      features: [
        'Délai 24-48h garanti',
        'Priorité absolue',
        'Suivi GPS en temps réel',
        'Livraison samedi possible'
      ]
    },
    {
      icon: Shield,
      title: 'Livraison Sécurisée Plus',
      description: 'Transport ultra-sécurisé pour équipements sensibles avec assurance complète et conditionnement renforcé.',
      features: [
        'Emballage renforcé',
        'Assurance tous risques',
        'Transport spécialisé',
        'Température contrôlée'
      ]
    },
    {
      icon: Package,
      title: 'Installation Incluse',
      description: 'Livraison avec installation et mise en service par nos techniciens certifiés pour les gros équipements médicaux.',
      features: [
        'Installation professionnelle',
        'Mise en service incluse',
        'Formation de base',
        'Tests de conformité'
      ]
    },
  ];

  const deliveryStats = [
    { 
      title: 'Délai moyen de livraison', 
      value: '2.8 jours', 
      icon: Clock, 
      color: 'primary' as const,
      description: 'Performance moyenne'
    },
    { 
      title: 'Taux de livraison à temps', 
      value: '98.5%', 
      icon: CheckCircle, 
      color: 'success' as const,
      description: 'Fiabilité prouvée'
    },
    { 
      title: 'Zones couvertes', 
      value: '100%', 
      icon: MapPin, 
      color: 'secondary' as const,
      description: 'Territoire français'
    },
    { 
      title: 'Colis livrés par mois', 
      value: '2000+', 
      icon: Package, 
      color: 'warning' as const,
      description: 'Volume traité'
    },
  ];

  const pricingTable = [
    {
      zone: 'France Métropolitaine',
      standard: 'Gratuit dès 500€',
      express: '49€',
      installation: 'Sur devis',
      weight: '< 30kg',
      highlight: true,
    },
    {
      zone: 'Corse',
      standard: '29€',
      express: '89€',
      installation: 'Sur devis + déplacement',
      weight: '< 30kg',
      highlight: false,
    },
    {
      zone: 'DOM-TOM',
      standard: 'Sur devis',
      express: 'Sur devis',
      installation: 'Sur devis + déplacement',
      weight: 'Variable',
      highlight: false,
    },
    {
      zone: 'Europe (UE)',
      standard: '79€',
      express: '149€',
      installation: 'Non disponible',
      weight: '< 30kg',
      highlight: false,
    },
  ];

  const trackingSteps = [
    { 
      step: 'Commande confirmée', 
      description: 'Votre commande est validée et en cours de préparation dans nos entrepôts spécialisés',
      icon: CheckCircle
    },
    { 
      step: 'En préparation', 
      description: 'Vos équipements sont soigneusement vérifiés, testés et emballés avec le plus grand soin',
      icon: Package
    },
    { 
      step: 'Expédiée', 
      description: 'Votre commande a quitté nos entrepôts et est prise en charge par notre transporteur',
      icon: Truck
    },
    { 
      step: 'En transit', 
      description: 'Votre colis est en cours de transport vers sa destination avec suivi GPS en temps réel',
      icon: MapPin
    },
    { 
      step: 'En livraison', 
      description: 'Le transporteur procède à la livraison selon le créneau horaire convenu',
      icon: Clock
    },
    { 
      step: 'Livrée', 
      description: 'Votre commande a été livrée avec succès et la réception confirmée',
      icon: Star
    },
  ];

  return (
    <>
      <PageHeader
        subtitle="Informations de Livraison"
        title="Livraison rapide et sécurisée partout en France"
        description="Découvrez nos options de livraison premium adaptées à vos besoins professionnels et urgences médicales."
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb 
          items={[
            { label: 'Livraison' }
          ]} 
        />

        {/* Options de Livraison - Premium */}
        <Section variant="modern">
          <SectionHeader
            title="Options de Livraison Premium"
            subtitle="Choisissez votre service"
            description="Des solutions de transport de haute qualité adaptées à vos équipements médicaux et vos contraintes de temps"
            variant="modern"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {shippingOptions.map((option, index) => (
              <ServiceCard
                key={option.title}
                {...option}
                index={index}
                variant={index === 1 ? 'featured' : 'default'}
              />
            ))}
          </div>
        </Section>

        {/* Statistiques de Livraison */}
        <Section className="bg-gradient-to-br from-gray-50 via-white to-gray-50" variant="modern">
          <SectionHeader
            title="Performance de notre Logistique"
            subtitle="Notre engagement"
            description="Des indicateurs concrets qui témoignent de la fiabilité et de l'efficacité de notre service logistique"
            variant="modern"
          />
          
          <StatsGrid stats={deliveryStats} />
        </Section>

        {/* Zones et Tarifs - Design Premium */}
        <Section variant="premium">
          <SectionHeader
            title="Zones Couvertes & Tarifs Transparents"
            subtitle="Transparence tarifaire"
            description="Nos tarifs de livraison détaillés selon les zones géographiques et services, sans surprise ni coût caché"
            variant="modern"
          />
          
          <motion.div
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary to-primary-hover text-white">
                  <tr>
                    <th className="px-8 py-6 text-left font-heading font-bold text-lg">Zone de Livraison</th>
                    <th className="px-8 py-6 text-left font-heading font-bold text-lg">Standard (3-5j)</th>
                    <th className="px-8 py-6 text-left font-heading font-bold text-lg">Express (24-48h)</th>
                    <th className="px-8 py-6 text-left font-heading font-bold text-lg">Installation</th>
                    <th className="px-8 py-6 text-left font-heading font-bold text-lg">Poids max</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingTable.map((row, index) => (
                    <motion.tr
                      key={row.zone}
                      className={`${
                        row.highlight 
                          ? 'bg-gradient-to-r from-primary/5 to-secondary/5 border-l-4 border-primary' 
                          : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-primary/10 transition-all duration-300`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <td className="px-8 py-6 font-bold text-gray-900 text-lg">
                        {row.zone}
                        {row.highlight && (
                          <span className="ml-2 px-2 py-1 bg-primary text-white text-xs font-bold rounded-full">
                            POPULAIRE
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-gray-700 font-medium">{row.standard}</td>
                      <td className="px-8 py-6 text-gray-700 font-medium">{row.express}</td>
                      <td className="px-8 py-6 text-gray-700 font-medium">{row.installation}</td>
                      <td className="px-8 py-6 text-gray-700 font-medium">{row.weight}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500 rounded-2xl p-3">
                <Info className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-blue-900 mb-4 text-xl">
                  Conditions Spéciales & Avantages
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span>Livraison gratuite dès 500€ d'achat en métropole</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span>Tarifs dégressifs pour commandes volumineuses</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span>Installation incluse pour équipements &gt; 5000€</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span>Assurance transport incluse sur tous les équipements</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </Section>

        {/* Suivi de Commande - Design Premium */}
        <Section className="bg-gradient-to-br from-gray-50 via-white to-gray-50" variant="modern">
          <SectionHeader
            title="Suivi de votre Commande en Temps Réel"
            subtitle="Transparence totale"
            description="Suivez votre commande étape par étape depuis la validation jusqu'à la livraison avec notre système de tracking avancé"
            variant="modern"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Étapes du Suivi */}
            <div>
              <h3 className="text-3xl font-heading font-bold text-gray-900 mb-10">
                Étapes du Processus
              </h3>
              <div className="space-y-6">
                {trackingSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    className="relative group"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    {/* Connecting Line */}
                    {index < trackingSteps.length - 1 && (
                      <div className="absolute left-6 top-16 w-px h-16 bg-gradient-to-b from-primary/50 to-primary/20"></div>
                    )}
                    
                    <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:border-primary/20">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center shadow-lg">
                          <step.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-heading font-bold text-gray-900 text-lg mb-2">
                          {step.step}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Interface de Suivi */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-white via-white to-primary/5 rounded-3xl shadow-2xl p-10 border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                    Suivre ma Commande
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Saisissez votre numéro de commande pour obtenir des informations détaillées en temps réel
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="tracking" className="block text-sm font-heading font-semibold text-gray-700 mb-3">
                      Numéro de commande
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="tracking"
                        placeholder="Ex: ALT2024-001234"
                        className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg bg-white"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <motion.button 
                    className="w-full bg-gradient-to-r from-primary to-primary-hover text-white px-8 py-4 rounded-2xl font-heading font-bold text-lg hover:from-primary-hover hover:to-secondary transition-all duration-300 shadow-xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Suivre ma commande
                  </motion.button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-3">
                      Vous recevrez également des notifications automatiques
                    </p>
                    <div className="flex justify-center space-x-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        📧 Email
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        📱 SMS
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        🔔 Push
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-sm"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </Section>

        {/* Conditions Particulières - Design Premium */}
        <Section variant="premium">
          <SectionHeader
            title="Conditions Particulières"
            subtitle="À savoir absolument"
            description="Informations importantes concernant la livraison d'équipements médicaux et nos services spécialisés"
            variant="modern"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div
              className="bg-gradient-to-br from-white to-amber-50/30 rounded-3xl shadow-2xl p-10 border border-amber-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 w-fit mb-8 shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Équipements Lourds & Volumineux
              </h3>
              <ul className="space-y-4 text-gray-600">
                {[
                  'Livraison par transporteur spécialisé équipé',
                  'Rendez-vous obligatoire avec créneaux flexibles',
                  'Assistance au déchargement et portage incluse',
                  'Vérification d\'accessibilité préalable gratuite'
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CheckCircle className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-2xl p-10 border border-emerald-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 w-fit mb-8 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Équipements Sensibles & Critiques
              </h3>
              <ul className="space-y-4 text-gray-600">
                {[
                  'Emballage renforcé et protection étanche',
                  'Transport à température contrôlée si nécessaire',
                  'Assurance tous risques incluse automatiquement',
                  'Suivi GPS en temps réel avec alertes'
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </Section>

        {/* Call to Action */}
        <Section>
          <CallToActionCard
            title="Questions sur la livraison ?"
            description="Notre équipe logistique est à votre disposition pour répondre à toutes vos questions et organiser une livraison sur mesure."
            primaryButton={{
              text: "Contacter la logistique",
              href: "/contact"
            }}
            secondaryButton={{
              text: "Calculer les frais de port",
              href: "/shipping-calculator"
            }}
            variant="elegant"
          />
        </Section>
        </div>
      </div>
    </>
  );
}