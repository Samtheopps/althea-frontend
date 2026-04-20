import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation - Althea Systems',
  description: 'Conditions générales d\'utilisation et de vente d\'Althea Systems',
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-black mb-8">
            Conditions Générales d'Utilisation et de Vente
          </h1>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 1 - Objet
              </h2>
              <p className="text-black leading-relaxed">
                Les présentes Conditions Générales d'Utilisation et de Vente (CGUV) régissent les relations 
                contractuelles entre Althea Systems SAS, société de vente d'équipements médicaux, 
                et toute personne physique ou morale souhaitant procéder à un achat via le site internet 
                althea-systems.fr.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 2 - Acceptation des conditions
              </h2>
              <p className="text-black leading-relaxed">
                L'utilisation du site althea-systems.fr implique l'acceptation pleine et entière des présentes CGUV. 
                Ces conditions prévalent sur toutes autres conditions figurant dans tout autre document, 
                sauf dérogation préalable, expresse et écrite.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 3 - Produits et services
              </h2>
              <div className="space-y-4">
                <p className="text-black leading-relaxed">
                  Althea Systems commercialise des équipements médicaux et dispositifs médicaux destinés 
                  aux professionnels de santé. Tous nos produits sont conformes aux réglementations en vigueur 
                  et possèdent les certifications nécessaires (CE médical, ISO, etc.).
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Important</h3>
                  <p className="text-blue-800 text-sm">
                    Les équipements médicaux proposés sont exclusivement destinés à un usage professionnel 
                    par des personnes qualifiées. L'acheteur s'engage à respecter les conditions d'utilisation 
                    et de sécurité propres à chaque produit.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 4 - Commandes
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-black">4.1 Processus de commande</h3>
                <p className="text-black leading-relaxed">
                  Toute commande passée sur le site althea-systems.fr suppose la lecture et l'acceptation 
                  des présentes CGUV. La validation de la commande vaut acceptation de ces conditions.
                </p>

                <h3 className="text-lg font-medium text-black">4.2 Confirmation de commande</h3>
                <p className="text-black leading-relaxed">
                  Une confirmation de commande sera envoyée par email à l'adresse indiquée lors de la commande. 
                  Cette confirmation reprend les éléments de la commande et constitue le contrat de vente.
                </p>

                <h3 className="text-lg font-medium text-black">4.3 Modification ou annulation</h3>
                <p className="text-black leading-relaxed">
                  Toute demande de modification ou d'annulation doit être formulée dans les 24h suivant 
                  la validation de la commande, avant préparation de celle-ci.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 5 - Prix et paiement
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-black">5.1 Prix</h3>
                <p className="text-black leading-relaxed">
                  Les prix indiqués sur le site sont en euros, hors taxes. La TVA au taux en vigueur 
                  sera ajoutée au moment de la commande. Les prix peuvent être modifiés à tout moment 
                  mais seront facturés sur la base du tarif en vigueur au moment de la validation de la commande.
                </p>

                <h3 className="text-lg font-medium text-black">5.2 Modalités de paiement</h3>
                <ul className="list-disc list-inside text-black space-y-2">
                  <li>Carte bancaire (paiement sécurisé via Stripe)</li>
                  <li>Virement bancaire (RIB fourni après validation de commande)</li>
                  <li>Solutions de financement (nous consulter)</li>
                </ul>

                <h3 className="text-lg font-medium text-black">5.3 Facturation</h3>
                <p className="text-black leading-relaxed">
                  La facture est établie au nom et à l'adresse de facturation indiquée lors de la commande. 
                  Elle est envoyée par email au format PDF.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 6 - Livraison
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-black">6.1 Zones de livraison</h3>
                <p className="text-black leading-relaxed">
                  Les livraisons sont effectuées en France métropolitaine. Pour les DOM-TOM et l'international, 
                  nous consulter.
                </p>

                <h3 className="text-lg font-medium text-black">6.2 Délais de livraison</h3>
                <ul className="list-disc list-inside text-black space-y-2">
                  <li>Livraison standard : 3 à 5 jours ouvrés</li>
                  <li>Livraison express : 24 à 48h</li>
                  <li>Matériel sur commande : délais communiqués lors de la commande</li>
                </ul>

                <h3 className="text-lg font-medium text-black">6.3 Frais de port</h3>
                <p className="text-black leading-relaxed">
                  Livraison gratuite à partir de 100€ HT. En deçà, frais de port : 15€ HT.
                </p>

                <h3 className="text-lg font-medium text-black">6.4 Réception</h3>
                <p className="text-black leading-relaxed">
                  Il appartient au destinataire de vérifier l'état de la marchandise à la livraison 
                  et de formuler toutes réserves utiles sur le bon de livraison en cas de dommage.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 7 - Garanties
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-black">7.1 Garantie légale</h3>
                <p className="text-black leading-relaxed">
                  Tous nos produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés.
                </p>

                <h3 className="text-lg font-medium text-black">7.2 Garantie constructeur</h3>
                <p className="text-black leading-relaxed">
                  Chaque produit bénéficie de la garantie constructeur selon les conditions spécifiques à chaque marque. 
                  La durée de garantie est précisée sur la fiche produit.
                </p>

                <h3 className="text-lg font-medium text-black">7.3 Exclusions</h3>
                <p className="text-black leading-relaxed">
                  La garantie ne couvre pas les dommages résultant d'une utilisation non conforme, 
                  de négligence, d'usure normale ou de modifications non autorisées.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 8 - Retours et remboursements
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-black">8.1 Droit de rétractation (professionnels)</h3>
                <p className="text-black leading-relaxed">
                  Les ventes aux professionnels ne bénéficient pas du droit de rétractation légal. 
                  Cependant, Althea Systems peut accepter les retours dans un délai de 14 jours sous conditions.
                </p>

                <h3 className="text-lg font-medium text-black">8.2 Conditions de retour</h3>
                <ul className="list-disc list-inside text-black space-y-2">
                  <li>Produit dans son emballage d'origine</li>
                  <li>État neuf et non utilisé</li>
                  <li>Accord préalable du service client</li>
                </ul>

                <h3 className="text-lg font-medium text-black">8.3 Frais de retour</h3>
                <p className="text-black leading-relaxed">
                  Les frais de retour sont à la charge du client, sauf en cas d'erreur de notre part 
                  ou de produit défectueux.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 9 - Responsabilité
              </h2>
              <p className="text-black leading-relaxed">
                La responsabilité d'Althea Systems ne saurait être engagée pour tout dommage indirect. 
                En tout état de cause, la responsabilité d'Althea Systems est limitée au montant de la commande.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 10 - Protection des données personnelles
              </h2>
              <p className="text-black leading-relaxed">
                Les informations recueillies font l'objet d'un traitement informatique destiné à la gestion 
                de votre compte et de vos commandes. Pour plus d'informations, consultez notre{' '}
                <a href="/legal/privacy" className="text-primary hover:underline">
                  politique de confidentialité
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 11 - Propriété intellectuelle
              </h2>
              <p className="text-black leading-relaxed">
                Tous les éléments du site althea-systems.fr sont et restent la propriété intellectuelle 
                et exclusive d'Althea Systems. Nul n'est autorisé à reproduire, exploiter ou utiliser 
                à quelque titre que ce soit, même partiellement, des éléments du site qu'ils soient logiciels, 
                visuels ou sonores.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 12 - Droit applicable
              </h2>
              <p className="text-black leading-relaxed">
                Les présentes CGUV sont soumises à la loi française. Tout litige sera soumis aux tribunaux 
                compétents de Paris.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                Article 13 - Médiation
              </h2>
              <p className="text-black leading-relaxed">
                En cas de litige, vous pouvez recourir à la médiation conventionnelle ou à tout autre mode 
                alternatif de règlement des différends. Vous pouvez notamment vous adresser au médiateur 
                de la consommation compétent dont les coordonnées peuvent être communiquées sur demande.
              </p>
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