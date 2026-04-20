import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité - Althea Systems',
  description: 'Politique de protection des données personnelles d\'Althea Systems',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-black mb-8">
            Politique de Confidentialité
          </h1>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                1. Introduction
              </h2>
              <p className="text-black leading-relaxed">
                Chez Althea Systems, nous nous engageons à protéger et respecter votre vie privée. 
                Cette politique explique quand et pourquoi nous collectons des informations personnelles, 
                comment nous les utilisons et dans quelles conditions nous pouvons les divulguer à des tiers.
              </p>
              <p className="text-black leading-relaxed mt-4">
                Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD) 
                et à la loi Informatique et Libertés modifiée.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                2. Responsable du traitement
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-black">
                  <strong>Althea Systems SAS</strong><br />
                  123 Avenue de la Santé<br />
                  75000 Paris, France<br />
                  Email : dpo@althea-systems.fr<br />
                  Téléphone : +33 1 23 45 67 89
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                3. Données collectées
              </h2>
              
              <h3 className="text-lg font-medium text-black mb-3">3.1 Données d'identification</h3>
              <ul className="list-disc list-inside text-black space-y-1 mb-4">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Adresse postale</li>
                <li>Informations de l'entreprise (nom, SIRET, etc.)</li>
              </ul>

              <h3 className="text-lg font-medium text-black mb-3">3.2 Données de commande</h3>
              <ul className="list-disc list-inside text-black space-y-1 mb-4">
                <li>Historique des commandes</li>
                <li>Préférences de livraison</li>
                <li>Méthodes de paiement (informations chiffrées)</li>
                <li>Correspondances et communications</li>
              </ul>

              <h3 className="text-lg font-medium text-black mb-3">3.3 Données de navigation</h3>
              <ul className="list-disc list-inside text-black space-y-1 mb-4">
                <li>Adresse IP</li>
                <li>Données de géolocalisation approximative</li>
                <li>Informations sur le navigateur et l'appareil</li>
                <li>Pages visitées et temps passé sur le site</li>
                <li>Cookies et technologies similaires</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                4. Finalités du traitement
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-black mb-2">4.1 Gestion des commandes</h3>
                  <p className="text-black">
                    Traitement des commandes, facturation, livraison, service après-vente et communication commerciale.
                  </p>
                  <p className="text-sm text-black mt-1">
                    <strong>Base légale :</strong> Exécution du contrat de vente
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-black mb-2">4.2 Gestion de la relation client</h3>
                  <p className="text-black">
                    Support technique, assistance, réponses aux demandes d'information et réclamations.
                  </p>
                  <p className="text-sm text-black mt-1">
                    <strong>Base légale :</strong> Intérêt légitime
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-black mb-2">4.3 Marketing et communication</h3>
                  <p className="text-black">
                    Envoi de newsletters, offres promotionnelles et informations sur nos nouveaux produits.
                  </p>
                  <p className="text-sm text-black mt-1">
                    <strong>Base légale :</strong> Consentement (avec possibilité de retrait)
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-black mb-2">4.4 Amélioration du service</h3>
                  <p className="text-black">
                    Analyse statistique, amélioration de l'expérience utilisateur et développement de nouveaux services.
                  </p>
                  <p className="text-sm text-black mt-1">
                    <strong>Base légale :</strong> Intérêt légitime
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-black mb-2">4.5 Obligations légales</h3>
                  <p className="text-black">
                    Respect des obligations comptables, fiscales et de traçabilité des dispositifs médicaux.
                  </p>
                  <p className="text-sm text-black mt-1">
                    <strong>Base légale :</strong> Obligation légale
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                5. Partage des données
              </h2>
              
              <p className="text-black leading-relaxed mb-4">
                Nous ne vendons ni ne louons vos données personnelles à des tiers. Nous pouvons partager 
                vos données uniquement dans les cas suivants :
              </p>

              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-black">Prestataires de services</h3>
                  <p className="text-black text-sm">
                    Transporteurs, processeurs de paiement, services d'hébergement, outils de marketing 
                    (sous contrat de sous-traitance avec garanties de protection des données).
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Obligations légales</h3>
                  <p className="text-black text-sm">
                    Autorités judiciaires ou administratives dans le cadre d'enquêtes légales 
                    ou de réquisitions judiciaires.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Transferts d'entreprise</h3>
                  <p className="text-black text-sm">
                    En cas de fusion, acquisition ou cession d'actifs, avec les mêmes garanties 
                    de protection des données.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                6. Conservation des données
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-black">Données de compte client</span>
                  <span className="font-medium text-black">3 ans après dernière activité</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-black">Données de commande</span>
                  <span className="font-medium text-black">10 ans (obligation comptable)</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-black">Données de navigation</span>
                  <span className="font-medium text-black">13 mois maximum</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-black">Données marketing</span>
                  <span className="font-medium text-black">3 ans ou jusqu'à désabonnement</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                7. Sécurité des données
              </h2>
              
              <p className="text-black leading-relaxed mb-4">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées 
                pour protéger vos données personnelles :
              </p>

              <ul className="list-disc list-inside text-black space-y-2">
                <li>Chiffrement des données sensibles (SSL/TLS)</li>
                <li>Contrôle d'accès strict aux données</li>
                <li>Sauvegardes régulières et sécurisées</li>
                <li>Surveillance et détection des intrusions</li>
                <li>Formation du personnel à la protection des données</li>
                <li>Audits de sécurité réguliers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                8. Vos droits
              </h2>
              
              <p className="text-black leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-black">Droit d'accès</h3>
                  <p className="text-black text-sm">
                    Obtenir une copie des données personnelles que nous détenons sur vous.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Droit de rectification</h3>
                  <p className="text-black text-sm">
                    Corriger les données inexactes ou incomplètes.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Droit à l'effacement</h3>
                  <p className="text-black text-sm">
                    Demander la suppression de vos données (sous certaines conditions).
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Droit à la limitation</h3>
                  <p className="text-black text-sm">
                    Restreindre le traitement de vos données dans certaines situations.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Droit à la portabilité</h3>
                  <p className="text-black text-sm">
                    Récupérer vos données dans un format structuré et lisible par machine.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Droit d'opposition</h3>
                  <p className="text-black text-sm">
                    Vous opposer au traitement pour des raisons tenant à votre situation particulière.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="font-medium text-blue-900 mb-2">Comment exercer vos droits</h3>
                <p className="text-blue-800 text-sm">
                  Pour exercer ces droits, contactez-nous à : <strong>dpo@althea-systems.fr</strong><br />
                  Nous vous répondrons dans un délai d'un mois maximum.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                9. Cookies
              </h2>
              
              <p className="text-black leading-relaxed mb-4">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. 
                Vous pouvez consulter notre politique détaillée sur les cookies en cliquant sur le lien 
                en bas de page ou gérer vos préférences via le bandeau de cookies.
              </p>

              <h3 className="text-lg font-medium text-black mb-3">Types de cookies utilisés :</h3>
              <ul className="list-disc list-inside text-black space-y-1">
                <li>Cookies techniques (indispensables au fonctionnement)</li>
                <li>Cookies analytiques (mesure d'audience anonyme)</li>
                <li>Cookies de personnalisation (préférences utilisateur)</li>
                <li>Cookies marketing (avec votre consentement)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                10. Mineurs
              </h2>
              <p className="text-black leading-relaxed">
                Nos services s'adressent exclusivement aux professionnels de santé. 
                Nous ne collectons pas sciemment de données personnelles concernant des mineurs de moins de 16 ans.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                11. Modifications
              </h2>
              <p className="text-black leading-relaxed">
                Cette politique de confidentialité peut être modifiée pour refléter les changements 
                de nos pratiques. Nous vous informerons de toute modification importante par email 
                ou via une notification sur notre site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                12. Contact et réclamations
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-black">Délégué à la Protection des Données (DPO)</h3>
                  <p className="text-black text-sm">
                    Email : dpo@althea-systems.fr<br />
                    Adresse : Althea Systems - DPO, 123 Avenue de la Santé, 75000 Paris
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Autorité de contrôle</h3>
                  <p className="text-black text-sm">
                    Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire 
                    une réclamation auprès de la CNIL :<br />
                    <a href="https://www.cnil.fr" className="text-primary hover:underline">www.cnil.fr</a>
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-black">
            <p>Dernière mise à jour : Mars 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}