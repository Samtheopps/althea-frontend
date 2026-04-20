'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Package, MapPin, CreditCard, Settings, LogOut, Edit } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';

export default function AccountPage() {
  const { tr } = useI18n();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const menuItems = [
    { id: 'profile',   label: tr.account.profile,   icon: User,       href: '/account' },
    { id: 'orders',    label: tr.nav.orders,         icon: Package,    href: '/account/orders' },
    { id: 'addresses', label: tr.account.addresses,  icon: MapPin,     href: '/account/addresses' },
    { id: 'payment',   label: tr.account.payment,    icon: CreditCard, href: '/account/payment' },
    { id: 'settings',  label: tr.account.settings,   icon: Settings,   href: '/account/settings' },
  ];

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            {tr.account.noAccess}
          </h2>
          <p className="text-black mb-6">
            {tr.account.noAccessDesc}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors"
          >
            {tr.nav.login}
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
              <h1 className="text-3xl font-bold text-black">
                {tr.account.title}
              </h1>
              <p className="mt-1 text-sm text-black">
                Bienvenue, {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-black bg-white hover:bg-gray-50 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {tr.nav.logout}
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
                          : 'text-black hover:bg-gray-50'
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
              <h3 className="text-lg font-medium text-black mb-4">
                {tr.account.activity}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-black">{tr.account.ordersLabel}</span>
                  <span className="text-sm font-medium text-black">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black">{tr.account.totalSpent}</span>
                  <span className="text-sm font-medium text-black">0,00 €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black">{tr.account.memberSince}</span>
                  <span className="text-sm font-medium text-black">{new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
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
  const { tr } = useI18n();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-black">
          {tr.account.personalInfo}
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-black hover:bg-gray-50 transition-colors"
        >
          <Edit className="mr-2 h-4 w-4" />
          {isEditing ? tr.common.cancel : tr.common.edit}
        </button>
      </div>

      {isEditing ? (
        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {tr.auth.firstName}
              </label>
              <input
                type="text"
                defaultValue={user.firstName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {tr.auth.lastName}
              </label>
              <input
                type="text"
                defaultValue={user.lastName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              {tr.auth.email}
            </label>
            <input
              type="email"
              defaultValue={user.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              {tr.account.phone}
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
              {tr.common.save}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
            >
              {tr.common.cancel}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black">
                {tr.auth.firstName}
              </label>
              <p className="mt-1 text-sm text-black">{user.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-black">
                {tr.auth.lastName}
              </label>
              <p className="mt-1 text-sm text-black">{user.lastName}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              {tr.auth.email}
            </label>
            <p className="mt-1 text-sm text-black">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              {tr.account.phone}
            </label>
            <p className="mt-1 text-sm text-black">{user.phone || '—'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Section Commandes
function OrdersSection() {
  const { tr } = useI18n();
  const orders: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-800 bg-green-100';
      case 'processing':
        return 'text-yellow-800 bg-yellow-100';
      case 'cancelled':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-black bg-gray-100';
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
        <h2 className="text-xl font-semibold text-black">
          {tr.nav.orders}
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-12 text-center">
           <Package className="h-12 w-12 text-black mx-auto mb-4" />
          <p className="text-black">{tr.account.ordersEmpty}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {orders.map((order) => (
            <div key={order.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-medium text-black">
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
                  <div className="mt-1 flex items-center space-x-4 text-sm text-black">
                    <span>{new Date(order.date).toLocaleDateString('fr-FR')}</span>
                    <span>{order.items} article{order.items > 1 ? 's' : ''}</span>
                    <span className="font-medium">{order.total.toFixed(2)} €</span>
                  </div>
                </div>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-black hover:bg-gray-50 transition-colors"
                >
                  {tr.account.seeDetails}
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
  const { tr } = useI18n();
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-black mb-4">
        {tr.account.addresses}
      </h2>
    </div>
  );
}

function PaymentSection() {
  const { tr } = useI18n();
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-black mb-4">
        {tr.account.payment}
      </h2>
    </div>
  );
}

function SettingsSection() {
  const { tr } = useI18n();
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-black mb-4">
        {tr.account.settings}
      </h2>
    </div>
  );
}