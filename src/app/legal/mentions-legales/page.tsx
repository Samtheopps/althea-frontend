import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales - Althea Systems',
  description: 'Mentions légales et informations juridiques d\'Althea Systems',
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-black mb-8">
            Mentions Légales
          </h1>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                1. Informations légales
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-black">Dénomination sociale</h3>
                  <p className="text-black">Althea Systems SAS</p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Forme juridique</h3>
                  <p className="text-black">Société par Actions Simplifiée (SAS)</p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Capital social</h3>
                  <p className="text-black">500 000 €</p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Siège social</h3>
                  <p className="text-black">
                    123 Avenue de la Santé<br />
                    75000 Paris, France
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Numéro SIRET</h3>
                  <p className="text-black">123 456 789 00012</p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Code APE</h3>
                  <p className="text-black">4646Z - Commerce de gros d'équipements et fournitures médicaux</p>
                </div>

                <div>
                  <h3 className="font-medium text-black">Numéro de TVA intracommunautaire</h3>
                  <p className="text-black">FR 12 123456789</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                2. Direction de la publication
              </h2>
              <div className="space-y-2">
                <p><span className="font-medium">Directeur de la publication :</span> Marie Dubois</p>
                <p><span className="font-medium">Qualité :</span> Présidente</p>
                <p><span className="font-medium">Email :</span> direction@althea-systems.fr</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                3. Hébergement
              </h2>
              <div className="space-y-2">
                <p><span className="font-medium">Hébergeur :</span> OVH SAS</p>
                <p><span className="font-medium">Adresse :</span> 2 rue Kellermann, 59100 Roubaix, France</p>
                <p><span className="font-medium">Téléphone :</span> 1007</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                4. Contact
              </h2>
              <div className="space-y-2">
                <p><span className="font-medium">Téléphone :</span> +33 1 23 45 67 89</p>
                <p><span className="font-medium">Email :</span> contact@althea-systems.fr</p>
                <p><span className="font-medium">Horaires :</span> Lundi au vendredi, 9h00 - 18h00</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                5. Propriété intellectuelle
              </h2>
              <p className="text-black leading-relaxed">
                Le site web althea-systems.fr et l'ensemble de son contenu (textes, images, vidéos, logos, graphismes, etc.) 
                sont protégés par le droit d'auteur et les droits de propriété intellectuelle. Toute reproduction, 
                représentation, modification, publication, transmission ou dénaturation, totale ou partielle, 
                du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit, 
                est interdite sans autorisation écrite préalable d'Althea Systems.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                6. Responsabilité
              </h2>
              <p className="text-black leading-relaxed">
                Althea Systems s'efforce de fournir des informations exactes et mises à jour sur ce site web. 
                Cependant, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité des informations 
                diffusées. En conséquence, l'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                7. Cookies et données personnelles
              </h2>
              <p className="text-black leading-relaxed">
                Ce site utilise des cookies pour améliorer votre expérience de navigation. Pour plus d'informations 
                sur l'utilisation de vos données personnelles et les cookies, consultez notre{' '}
                <a href="/legal/privacy" className="text-primary hover:underline">
                  politique de confidentialité
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                8. Droit applicable et juridiction
              </h2>
              <p className="text-black leading-relaxed">
                Les présentes mentions légales sont régies par le droit français. Tout litige relatif à 
                l'utilisation du site althea-systems.fr sera soumis à la compétence exclusive des tribunaux de Paris.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-black mb-4">
                9. Médiation
              </h2>
              <p className="text-black leading-relaxed">
                Conformément aux dispositions du Code de la consommation concernant le règlement amiable des litiges, 
                Althea Systems adhère au Service du Médiateur du e-commerce de la FEVAD (Fédération du e-commerce et de la vente à distance) 
                dont les coordonnées sont les suivantes : 60 Rue La Boétie – 75008 Paris – 
                <a href="http://www.mediateurfevad.fr" className="text-primary hover:underline">
                  http://www.mediateurfevad.fr
                </a>
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