'use client';

import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  Clock, 
  Shield, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Package,
  CreditCard,
  Mail,
  Phone,
  Star,
  ArrowRight,
  Award
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { FeatureCard, InfoCard, Section, SectionHeader } from '@/components/ui/Cards';
import { ProcessStepCard, StatsGrid, CallToActionCard } from '@/components/ui/EnhancedCards';

export default function ReturnsPage() {
  const returnPolicies = [
    {
      icon: Clock,
      title: 'Délais de Retour Flexibles',
      description: '14 jours pour les équipements non-conformes ou défectueux. 7 jours pour changement d\'avis selon nos conditions générales.',
      features: [
        'Délai calculé à partir de la livraison',
        'Extension possible sur demande motivée',
        'Week-end et jours fériés non comptabilisés',
        'Notification automatique des échéances'
      ]
    },
    {
      icon: Shield,
      title: 'Garantie Satisfait ou Remboursé',
      description: 'Remboursement intégral garanti si l\'équipement ne correspond pas à vos attentes professionnelles légitimes.',
      features: [
        'Remboursement sans condition',
        'Frais de retour pris en charge',
        'Crédit immédiat disponible',
        'Échange prioritaire possible'
      ]
    },
    {
      icon: Package,
      title: 'Conditions d\'État Optimales',
      description: 'Retour accepté si l\'équipement est dans son état d\'origine avec emballage complet et documentation.',
      features: [
        'État neuf exigé pour équipements sensibles',
        'Emballage d\'origine conservé',
        'Documentation complète fournie',
        'Tests de fonctionnement inclus'
      ]
    },
    {
      icon: CreditCard,
      title: 'Modalités de Remboursement Rapides',
      description: 'Remboursement traité sous 5-10 jours ouvrés maximum après réception et contrôle de l\'équipement.',
      features: [
        'Virement bancaire sécurisé',
        'Avoir commercial disponible',
        'Crédit immédiat sur demande',
        'Suivi transparent du processus'
      ]
    },
  ];

  const returnStats = [
    { 
      title: 'Délai de traitement', 
      value: '< 48h', 
      icon: Clock, 
      color: 'primary' as const,
      description: 'Réactivité garantie'
    },
    { 
      title: 'Taux de satisfaction', 
      value: '96%', 
      icon: Star, 
      color: 'success' as const,
      description: 'Clients satisfaits'
    },
    { 
      title: 'Remboursements traités', 
      value: '500+', 
      icon: CreditCard, 
      color: 'secondary' as const,
      description: 'Par trimestre'
    },
    { 
      title: 'Délai de remboursement', 
      value: '7 jours', 
      icon: RotateCcw, 
      color: 'warning' as const,
      description: 'Moyenne constatée'
    },
  ];

  const returnReasons = [
    {
      reason: 'Défaut de fabrication',
      description: 'Équipement présentant un défaut de conception ou de fabrication avéré',
      action: 'Échange ou remboursement immédiat',
      timeLimit: '2 ans (garantie constructeur)',
      priority: 'Urgent',
      color: 'red'
    },
    {
      reason: 'Non-conformité aux spécifications',
      description: 'Produit ne correspondant pas exactement à la description ou aux spécifications annoncées',
      action: 'Remboursement intégral garanti',
      timeLimit: '14 jours calendaires',
      priority: 'Prioritaire',
      color: 'amber'
    },
    {
      reason: 'Dommage pendant transport',
      description: 'Équipement endommagé pendant le transport malgré nos précautions',
      action: 'Échange immédiat sans frais',
      timeLimit: '48h après livraison',
      priority: 'Urgent',
      color: 'red'
    },
    {
      reason: 'Erreur de commande',
      description: 'Mauvais équipement expédié par erreur de notre part',
      action: 'Échange gratuit prioritaire',
      timeLimit: '30 jours',
      priority: 'Standard',
      color: 'blue'
    },
    {
      reason: 'Changement d\'avis justifié',
      description: 'Équipement ne correspondant plus aux besoins évolutifs du client',
      action: 'Remboursement (sous conditions)',
      timeLimit: '7 jours ouvrés',
      priority: 'Standard',
      color: 'gray'
    },
  ];

  const returnProcess = [
    {
      step: '01',
      title: 'Demande de Retour Simplifiée',
      description: 'Contactez notre service client par téléphone ou email pour initier rapidement votre demande de retour.',
    },
    {
      step: '02',
      title: 'Autorisation de Retour (RMA)',
      description: 'Nous étudions votre demande sous 2h et vous délivrons un numéro d\'autorisation de retour unique.',
    },
    {
      step: '03',
      title: 'Préparation du Colis',
      description: 'Remballez soigneusement l\'équipement dans son emballage d\'origine avec tous les accessoires.',
    },
    {
      step: '04',
      title: 'Expédition Retour Gratuite',
      description: 'Expédiez le colis à l\'adresse indiquée avec le numéro RMA bien visible sur l\'emballage.',
    },
    {
      step: '05',
      title: 'Contrôle Qualité Expert',
      description: 'Notre équipe technique vérifie minutieusement l\'état et valide les conditions de retour.',
    },
    {
      step: '06',
      title: 'Remboursement Rapide',
      description: 'Traitement immédiat du remboursement ou de l\'échange selon les modalités convenues.',
    },
  ];

  const conditions = [
    {
      category: 'Équipements Retournables ✅',
      color: 'emerald',
      items: [
        'Équipements neufs non utilisés en parfait état',
        'Équipements défectueux couverts par la garantie',
        'Équipements non-conformes aux spécifications',
        'Équipements endommagés pendant transport'
      ],
    },
    {
      category: 'Équipements Non-Retournables ❌',
      color: 'red',
      items: [
        'Équipements personnalisés ou fabriqués sur-mesure',
        'Consommables ouverts, utilisés ou périmés',
        'Équipements présentant une usure normale d\'usage',
        'Équipements modifiés ou réparés par un tiers'
      ],
    },
    {
      category: 'Conditions Obligatoires 📋',
      color: 'blue',
      items: [
        'Emballage d\'origine complet et en bon état',
        'Tous accessoires et documentation technique inclus',
        'Aucun signe d\'utilisation intensive visible',
        'Numéro RMA obligatoire et visible sur le colis'
      ],
    },
  ];

  return (
    <>
      <PageHeader
        subtitle="Politique de Retours"
        title="Procédure simple et transparente"
        description="Découvrez nos conditions de retour équitables et notre processus d'échange simplifié pour vos équipements médicaux."
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb 
          items={[
            { label: 'Retours' }
          ]} 
        />

        {/* Politique de Retour Premium */}
        <Section variant="modern">
          <SectionHeader
            title="Notre Politique de Retour Premium"
            subtitle="Votre satisfaction, notre priorité absolue"
            description="Des conditions claires, équitables et généreuses pour garantir votre tranquillité d'achat et votre confiance"
            variant="modern"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {returnPolicies.map((policy, index) => (
              <motion.div
                key={policy.title}
                className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl shadow-2xl p-10 border border-gray-100 hover:shadow-3xl transition-all duration-500"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="flex items-start mb-8">
                  <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-4 mr-6 shadow-lg">
                    <policy.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4 leading-tight">
                      {policy.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg mb-6">
                      {policy.description}
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {policy.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={featureIndex}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: (index * 0.15) + (featureIndex * 0.1) }}
                    >
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Statistiques de Retour */}
        <Section className="bg-gradient-to-br from-gray-50 via-white to-gray-50" variant="modern">
          <SectionHeader
            title="Performance du Service Retours"
            subtitle="Notre efficacité mesurée"
            description="Des indicateurs concrets qui démontrent notre engagement envers la satisfaction client et l'excellence opérationnelle"
            variant="modern"
          />
          
          <StatsGrid stats={returnStats} />
        </Section>

        {/* Motifs de Retour - Design Premium */}
        <Section variant="premium">
          <SectionHeader
            title="Motifs de Retour Acceptés"
            subtitle="Situations couvertes"
            description="Aperçu détaillé des différentes situations donnant droit à un retour ou échange avec nos garanties associées"
            variant="modern"
          />
          
          <div className="space-y-6">
            {returnReasons.map((item, index) => (
              <motion.div
                key={item.reason}
                className={`relative bg-gradient-to-r from-white to-${item.color}-50/30 rounded-3xl shadow-xl p-8 border-l-4 border-${item.color}-400 hover:shadow-2xl transition-all duration-500`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                whileHover={{ x: 5, scale: 1.01 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="font-heading font-bold text-gray-900 text-xl mr-4">
                        {item.reason}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                        item.priority === 'Prioritaire' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Action</p>
                      <p className="text-primary font-bold">{item.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Délai limite</p>
                      <p className="text-gray-700 font-semibold">{item.timeLimit}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Processus de Retour */}
        <Section className="bg-gradient-to-br from-gray-50 via-white to-gray-50" variant="modern">
          <SectionHeader
            title="Processus de Retour Simplifié"
            subtitle="6 étapes claires"
            description="Un processus transparent et guidé pour faciliter vos retours d'équipements en toute sérénité"
            variant="modern"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {returnProcess.map((step, index) => (
              <ProcessStepCard
                key={step.step}
                {...step}
                index={index}
                isLast={index === returnProcess.length - 1}
              />
            ))}
          </div>
        </Section>

        {/* Conditions et Restrictions - Design Premium */}
        <Section variant="premium">
          <SectionHeader
            title="Conditions et Restrictions Détaillées"
            subtitle="Important à connaître"
            description="Détails complets des conditions applicables pour garantir un traitement optimal et rapide de votre retour"
            variant="modern"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {conditions.map((condition, index) => (
              <motion.div
                key={condition.category}
                className={`bg-gradient-to-br from-white to-${condition.color}-50/20 rounded-3xl shadow-2xl p-10 border border-${condition.color}-100`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-8 text-center">
                  {condition.category}
                </h3>
                <ul className="space-y-4">
                  {condition.items.map((item, itemIndex) => (
                    <motion.li
                      key={itemIndex}
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: (index * 0.15) + (itemIndex * 0.1) }}
                    >
                      {condition.color === 'red' ? (
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
                      )}
                      <span className="text-gray-600 leading-relaxed">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Contact pour Retours - Section Premium */}
        <Section className="bg-gradient-to-br from-gray-50 via-white to-gray-50" variant="modern">
          <SectionHeader
            title="Initier un Retour"
            subtitle="Contactez nos experts"
            description="Notre équipe dédiée aux retours est disponible pour vous accompagner dans votre démarche avec professionnalisme"
            variant="modern"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div
              className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl shadow-2xl p-10 border border-blue-100"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Phone className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  Service Retours Express
                </h3>
                <div className="space-y-4 mb-8 text-left">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Téléphone :</span>
                    <span className="text-blue-600 font-bold">+33 1 23 45 67 89</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Horaires :</span>
                    <span className="text-gray-600">Lun-Ven 9h-18h</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Réponse :</span>
                    <span className="text-green-600 font-bold">Immédiate</span>
                  </div>
                </div>
                <motion.button
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-heading font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Appeler maintenant
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-2xl p-10 border border-emerald-100"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  Email Support Dédié
                </h3>
                <div className="space-y-4 mb-8 text-left">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Email :</span>
                    <span className="text-emerald-600 font-bold text-sm">retours@althea-systems.fr</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Réponse :</span>
                    <span className="text-gray-600">Sous 2h en moyenne</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Suivi :</span>
                    <span className="text-blue-600 font-semibold">Ticket numéroté</span>
                  </div>
                </div>
                <motion.button
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-heading font-bold text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Envoyer un email
                </motion.button>
              </div>
            </motion.div>
          </div>
        </Section>

        {/* Call to Action */}
        <Section>
          <CallToActionCard
            title="Besoin d'aide pour un retour ?"
            description="Notre équipe spécialisée est à votre disposition pour vous accompagner et répondre à toutes vos questions sur nos politiques de retour."
            primaryButton={{
              text: "Contacter le service retours",
              href: "/contact"
            }}
            secondaryButton={{
              text: "Consulter la FAQ",
              href: "/help"
            }}
            variant="gradient"
          />
        </Section>
        </div>
      </div>
    </>
  );
}