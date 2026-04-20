'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  Wrench, 
  FileText, 
  CheckCircle,
  Users,
  Phone,
  Zap,
  AlertCircle,
  Star,
  Award,
  Settings
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { FeatureCard, InfoCard, Section, SectionHeader } from '@/components/ui/Cards';

export default function WarrantyPage() {
  const warrantyTypes = [
    {
      icon: Shield,
      title: 'Garantie Constructeur',
      description: 'Garantie fabricant standard couvrant les défauts de fabrication et de matériaux selon les conditions du constructeur.',
    },
    {
      icon: Star,
      title: 'Garantie Étendue Althea',
      description: 'Extension de garantie exclusive offrant une protection renforcée et des services additionnels.',
    },
    {
      icon: Zap,
      title: 'Garantie Express',
      description: 'Service de réparation ou remplacement accéléré pour maintenir la continuité de vos activités médicales.',
    },
    {
      icon: Users,
      title: 'Garantie Installation',
      description: 'Garantie spécifique sur nos prestations d\'installation et de mise en service par nos techniciens.',
    },
  ];

  const warrantyStats = [
    { title: 'Durée moyenne garantie', value: '3 ans', icon: Clock, color: 'primary' as const },
    { title: 'Taux de prise en charge', value: '94%', icon: CheckCircle, color: 'success' as const },
    { title: 'Délai intervention SAV', value: '< 48h', icon: Wrench, color: 'secondary' as const },
    { title: 'Équipements sous garantie', value: '8500+', icon: Shield, color: 'warning' as const },
  ];

  const warrantyTerms = [
    {
      category: 'Équipements Diagnostic',
      standardWarranty: '2 ans',
      extendedWarranty: '5 ans',
      coverage: ['Défauts fabrication', 'Pannes électroniques', 'Calibration'],
      exclusions: ['Usure normale', 'Mauvais usage'],
    },
    {
      category: 'Instruments Chirurgicaux',
      standardWarranty: '1 an',
      extendedWarranty: '3 ans',
      coverage: ['Défauts matériaux', 'Problèmes mécaniques'],
      exclusions: ['Rayures', 'Déformation usage'],
    },
    {
      category: 'Mobilier Médical',
      standardWarranty: '3 ans',
      extendedWarranty: '7 ans',
      coverage: ['Structure', 'Mécanismes', 'Revêtements'],
      exclusions: ['Usure esthétique', 'Surcharge'],
    },
    {
      category: 'Équipements Stérilisation',
      standardWarranty: '2 ans',
      extendedWarranty: '5 ans',
      coverage: ['Systèmes chauffage', 'Joints étanchéité', 'Électronique'],
      exclusions: ['Entartrage', 'Mauvais entretien'],
    },
  ];

  const claimProcess = [
    {
      step: '01',
      title: 'Signalement du Problème',
      description: 'Contactez notre service SAV par téléphone, email ou via votre espace client en ligne.',
    },
    {
      step: '02',
      title: 'Diagnostic Initial',
      description: 'Notre équipe effectue un pré-diagnostic téléphonique pour orienter la prise en charge.',
    },
    {
      step: '03',
      title: 'Ouverture du Dossier',
      description: 'Création d\'un dossier de réclamation avec numéro de suivi et vérification de garantie.',
    },
    {
      step: '04',
      title: 'Intervention Technique',
      description: 'Intervention sur site ou récupération de l\'équipement selon la nature du problème.',
    },
    {
      step: '05',
      title: 'Réparation/Remplacement',
      description: 'Réparation certifiée ou remplacement par un équipement neuf selon les conditions.',
    },
    {
      step: '06',
      title: 'Validation & Clôture',
      description: 'Tests de validation, formation si nécessaire et clôture du dossier avec votre accord.',
    },
  ];

  const extendedServices = [
    {
      title: 'Maintenance Préventive',
      description: 'Interventions programmées pour prévenir les pannes',
      icon: Settings,
      features: [
        'Contrôles périodiques',
        'Calibration régulière',
        'Remplacement pièces d\'usure',
        'Rapport de maintenance',
      ],
    },
    {
      title: 'Support Prioritaire',
      description: 'Accès privilégié à notre équipe technique',
      icon: Phone,
      features: [
        'Ligne dédiée 24/7',
        'Intervention prioritaire',
        'Technicien référent',
        'Diagnostic à distance',
      ],
    },
    {
      title: 'Équipement de Prêt',
      description: 'Mise à disposition d\'équipements de remplacement',
      icon: Wrench,
      features: [
        'Prêt sous 24h',
        'Équipement équivalent',
        'Installation incluse',
        'Durée illimitée',
      ],
    },
    {
      title: 'Formation Continue',
      description: 'Mise à jour des compétences de votre équipe',
      icon: Award,
      features: [
        'Formations périodiques',
        'Nouveautés techniques',
        'Bonnes pratiques',
        'Certification utilisateur',
      ],
    },
  ];

  return (
    <>
      <PageHeader
        subtitle="Garanties & SAV"
        title="Une protection complète pour vos équipements"
        description="Découvrez nos garanties étendues et notre service après-vente professionnel pour une tranquillité totale."
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb 
          items={[
            { label: 'Garantie' }
          ]} 
        />

        {/* Types de Garanties */}
        <Section>
          <SectionHeader
            title="Types de Garanties"
            subtitle="Protection adaptée"
            description="Différents niveaux de protection pour répondre aux besoins spécifiques de votre établissement"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {warrantyTypes.map((type, index) => (
              <FeatureCard
                key={type.title}
                {...type}
                delay={index * 0.1}
              />
            ))}
          </div>
        </Section>

        {/* Statistiques Garantie */}
        <Section className="bg-gray-50">
          <SectionHeader
            title="Performance de nos Garanties"
            subtitle="Indicateurs de qualité"
            description="Des chiffres qui témoignent de l'efficacité de notre service garantie"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {warrantyStats.map((stat, index) => (
              <InfoCard
                key={stat.title}
                {...stat}
                delay={index * 0.1}
              />
            ))}
          </div>
        </Section>

        {/* Durées et Couvertures */}
        <Section>
          <SectionHeader
            title="Durées et Couvertures par Catégorie"
            subtitle="Détails des garanties"
            description="Aperçu complet des conditions de garantie selon le type d'équipement médical"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {warrantyTerms.map((term, index) => (
              <motion.div
                key={term.category}
                className="bg-white rounded-xl shadow-lg p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-heading font-bold text-black mb-6">
                  {term.category}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Garantie Standard</p>
                    <p className="text-lg font-bold text-primary">{term.standardWarranty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Garantie Étendue</p>
                    <p className="text-lg font-bold text-secondary">{term.extendedWarranty}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-black mb-2">Couverture incluse</h4>
                    <ul className="space-y-1">
                      {term.coverage.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-black mb-2">Exclusions</h4>
                    <ul className="space-y-1">
                      {term.exclusions.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Processus de Réclamation */}
        <Section className="bg-gray-50">
          <SectionHeader
            title="Processus de Réclamation"
            subtitle="Démarche simplifiée"
            description="Un processus clair et efficace pour traiter rapidement vos demandes de garantie"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claimProcess.map((step, index) => (
              <motion.div
                key={step.step}
                className="bg-white rounded-xl shadow-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full font-heading font-bold mr-3">
                    {step.step}
                  </div>
                  <h3 className="font-heading font-semibold text-black">
                    {step.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Documents requis pour réclamation</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Facture d'achat originale</li>
                  <li>• Certificat de garantie</li>
                  <li>• Description détaillée du problème</li>
                  <li>• Photos de l'équipement si dommage visible</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </Section>

        {/* Services Étendus */}
        <Section>
          <SectionHeader
            title="Services Étendus Inclus"
            subtitle="Valeur ajoutée"
            description="Services additionnels inclus avec nos garanties étendues pour une protection optimale"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {extendedServices.map((service, index) => (
              <motion.div
                key={service.title}
                className="bg-white rounded-xl shadow-lg p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-primary/10 rounded-lg p-3 mr-4">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-black">
                    {service.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Contact SAV */}
        <Section className="bg-gray-50">
          <SectionHeader
            title="Contacter notre SAV"
            subtitle="Assistance professionnelle"
            description="Notre équipe technique dédiée est à votre disposition pour tous vos besoins de garantie"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold text-black mb-4">
                Urgences SAV
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Assistance immédiate pour pannes critiques
              </p>
              <div className="text-lg font-bold text-primary mb-2">
                +33 1 23 45 67 89
              </div>
              <p className="text-xs text-gray-500">24h/7j pour garanties étendues</p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-lg p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold text-black mb-4">
                Email SAV
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Pour demandes non-urgentes et réclamations
              </p>
              <div className="text-sm font-medium text-primary mb-2">
                sav@althea-systems.fr
              </div>
              <p className="text-xs text-gray-500">Réponse sous 2h ouvrées</p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-lg p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold text-black mb-4">
                Espace Client
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Suivi de vos équipements et réclamations en ligne
              </p>
              <motion.button
                className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Accéder à mon compte
              </motion.button>
            </motion.div>
          </div>
        </Section>
        </div>
      </div>
    </>
  );
}