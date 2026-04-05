'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Package, MapPin, CreditCard, Settings, LogOut, Edit } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';

const menuItems = [
  { id: 'profile', label: 'Mon profil', icon: User, href: '/account' },
  { id: 'orders', label: 'Mes commandes', icon: Package, href: '/account/orders' },
  { id: 'addresses', label: 'Mes adresses', icon: MapPin, href: '/account/addresses' },
  { id: 'payment', label: 'Moyens de paiement', icon: CreditCard, href: '/account/payment' },
  { id: 'settings', label: 'Paramètres', icon: Settings, href: '/account/settings' },
];

export default function AccountPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Accès non autorisé
          </h2>
          <p className="text-gray-600 mb-6">
            Veuillez vous connecter pour accéder à votre compte.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">
                Mon compte
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Bienvenue, {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Statistiques utilisateur */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Votre activité
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commandes</span>
                  <span className="text-sm font-medium text-gray-900">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total dépensé</span>
                  <span className="text-sm font-medium text-gray-900">2 450,00 €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Membre depuis</span>
                  <span className="text-sm font-medium text-gray-900">Jan 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-9 mt-8 lg:mt-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'profile' && <ProfileSection user={user} />}
              {activeTab === 'orders' && <OrdersSection />}
              {activeTab === 'addresses' && <AddressesSection />}
              {activeTab === 'payment' && <PaymentSection />}
              {activeTab === 'settings' && <SettingsSection />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Section Profil
function ProfileSection({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Informations personnelles
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Edit className="mr-2 h-4 w-4" />
          {isEditing ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      {isEditing ? (
        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                defaultValue={user.firstName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                defaultValue={user.lastName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              defaultValue={user.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              defaultValue={user.phone}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Prénom
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Nom
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.lastName}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Adresse email
            </label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Téléphone
            </label>
            <p className="mt-1 text-sm text-gray-900">{user.phone || 'Non renseigné'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Section Commandes
function OrdersSection() {
  const orders = [
    {
      id: 'CMD-2024-001',
      date: '2024-03-15',
      status: 'delivered',
      total: 1250.00,
      items: 3,
    },
    {
      id: 'CMD-2024-002',
      date: '2024-03-10',
      status: 'processing',
      total: 850.00,
      items: 2,
    },
    {
      id: 'CMD-2024-003',
      date: '2024-03-01',
      status: 'delivered',
      total: 2100.00,
      items: 5,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-800 bg-green-100';
      case 'processing':
        return 'text-yellow-800 bg-yellow-100';
      case 'cancelled':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Livrée';
      case 'processing':
        return 'En cours';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Mes commandes
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Aucune commande pour le moment</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {orders.map((order) => (
            <div key={order.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {order.id}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                    <span>{new Date(order.date).toLocaleDateString('fr-FR')}</span>
                    <span>{order.items} article{order.items > 1 ? 's' : ''}</span>
                    <span className="font-medium">{order.total.toFixed(2)} €</span>
                  </div>
                </div>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Voir détails
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Composants simplifiés pour les autres sections
function AddressesSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Mes adresses
      </h2>
      <p className="text-gray-600">
        Gérez vos adresses de livraison et de facturation.
      </p>
      {/* Contenu des adresses */}
    </div>
  );
}

function PaymentSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Moyens de paiement
      </h2>
      <p className="text-gray-600">
        Gérez vos cartes bancaires et moyens de paiement.
      </p>
      {/* Contenu des moyens de paiement */}
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Paramètres du compte
      </h2>
      <p className="text-gray-600">
        Configurez vos préférences et paramètres de sécurité.
      </p>
      {/* Contenu des paramètres */}
    </div>
  );
}