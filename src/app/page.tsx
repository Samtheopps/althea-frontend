'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Truck, HeadphonesIcon, Package, Star } from 'lucide-react';

import { Category, Product } from '@/types/api';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import ProductCard from '@/components/products/ProductCard';
import { formatPrice } from '@/lib/utils';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les données en parallèle avec gestion d'erreur individuelle
      const [categoriesData, productsData] = await Promise.allSettled([
        categoryService.getMainCategories(),
        productService.getProducts({ limit: 8, sortBy: 'newest' })
      ]);
      
      // Traiter les catégories
      if (categoriesData.status === 'fulfilled') {
        setCategories((categoriesData.value || []).slice(0, 6));
      } else {
        console.warn('Erreur chargement catégories:', categoriesData.reason);
        setCategories([]);
      }
      
      // Traiter les produits
      if (productsData.status === 'fulfilled') {
        setFeaturedProducts(productsData.value?.products || []);
      } else {
        console.warn('Erreur chargement produits:', productsData.reason);
        setFeaturedProducts([]);
      }
      
    } catch (error) {
      console.error('Erreur globale chargement données accueil:', error);
      // S'assurer que les states sont initialisés même en cas d'erreur
      setCategories([]);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-light via-white to-primary-light py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold tracking-tight text-gray-900 sm:text-6xl">
              Équipements Médicaux
              <span className="block text-gradient">
                de Haute Qualité
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Althea Systems fournit des équipements médicaux de pointe pour les professionnels de santé. 
              Découvrez notre gamme complète de produits certifiés et fiables.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/products"
                className="btn-primary inline-flex items-center gap-2"
              >
                Découvrir nos produits
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary transition-colors"
              >
                En savoir plus <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold tracking-tight text-gray-900 sm:text-4xl">
              Pourquoi choisir Althea Systems ?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Notre engagement pour votre réussite
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Qualité Certifiée
              </h3>
              <p className="mt-2 text-gray-600">
                Tous nos équipements sont certifiés CE, FDA et conformes aux normes ISO 13485.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Livraison Rapide
              </h3>
              <p className="mt-2 text-gray-600">
                Livraison express en 24-48h partout en France métropolitaine.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-lg bg-primary/10 p-3">
                  <HeadphonesIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Support Expert
              </h3>
              <p className="mt-2 text-gray-600">
                Une équipe d'experts à votre disposition pour vous conseiller et vous accompagner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold tracking-tight text-gray-900 sm:text-4xl">
              Nos Catégories
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Explorez notre gamme complète d'équipements médicaux
            </p>
          </div>

          {loading ? (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/categories/${category.slug}`}>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center mb-4">
                        <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                          <Package className="h-8 w-8 text-primary" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {category.productCount || 0} produits
                          </p>
                        </div>
                      </div>
                      {category.description && (
                        <p className="text-gray-600 text-sm">
                          {category.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center text-primary font-medium text-sm group-hover:underline">
                        Découvrir
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Catégories en cours de chargement
              </h3>
              <p className="text-gray-600">
                Nos catégories seront bientôt disponibles.
              </p>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/categories"
              className="btn-secondary inline-flex items-center gap-2"
            >
              Voir toutes les catégories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold tracking-tight text-gray-900 sm:text-4xl">
              Produits Vedettes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Découvrez nos équipements les plus populaires
            </p>
          </div>

          {loading ? (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-100 rounded-lg h-96 animate-pulse"></div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {(featuredProducts || []).slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Produits bientôt disponibles
              </h3>
              <p className="text-gray-600">
                Notre catalogue de produits sera bientôt enrichi.
              </p>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="btn-primary inline-flex items-center gap-2"
            >
              Voir tous les produits
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold tracking-tight text-white sm:text-4xl">
              Prêt à équiper votre cabinet médical ?
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Contactez-nous pour un devis personnalisé ou parcourez notre catalogue complet.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Link
                href="/contact"
                className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primary-hover transition-colors duration-200"
              >
                Demander un devis
              </Link>
              <Link
                href="/products"
                className="text-base font-semibold leading-6 text-white hover:text-primary-light transition-colors"
              >
                Voir tous les produits <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
