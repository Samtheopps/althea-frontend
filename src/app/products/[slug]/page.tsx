'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

import { Product } from '@/types/api';
import { productService } from '@/services/productService';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import ProductImageCarousel from '@/components/products/ProductImageCarousel';
import ProductTabs from '@/components/products/ProductTabs';
import ProductSimilar from '@/components/products/ProductSimilar';
import ProductReviews from '@/components/products/ProductReviews';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await productService.getProductBySlug(slug);
      setProduct(data);
      if (data && data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem(product, quantity, selectedVariant);
    toast.success(`${product.name} ajouté au panier !`);
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted 
        ? 'Produit retiré de la liste de souhaits'
        : 'Produit ajouté à la liste de souhaits'
    );
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papiers !');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              <div className="h-96 bg-gray-200 rounded-lg mb-8 lg:mb-0"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Produit non trouvé
          </h2>
          <p className="text-gray-600 mb-6">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.price;
  const originalPrice = selectedVariant?.originalPrice || product.originalPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Accueil
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-gray-500 hover:text-gray-700">
              Produits
            </Link>
            {product.category && (
              <>
                <span className="text-gray-400">/</span>
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contenu principal */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Images */}
          <div className="mb-8 lg:mb-0">
            <ProductImageCarousel images={product.images || []} />
          </div>

            {/* Informations produit */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                {product.brand && (
                  <p className="text-sm text-gray-700 mb-2 font-medium">{product.brand}</p>
                )}
                
                {/* Référence produit */}
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-sm product-reference text-gray-600 font-mono">
                      REF: ALT-{product.id.slice(-6).toUpperCase()}
                    </p>
                    {selectedVariant?.sku && (
                      <p className="text-sm product-sku text-gray-500 font-mono">
                        SKU: {selectedVariant.sku}
                      </p>
                    )}
                  </div>
                  {product.stock !== undefined && (
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 10 ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            En stock ({product.stock})
                          </>
                        ) : product.stock > 0 ? (
                          <>Stock limité ({product.stock})</>
                        ) : (
                          <>Rupture de stock</>
                        )}
                      </span>
                    </div>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <p className="text-gray-700 leading-relaxed">
                  {product.shortDescription || product.description}
                </p>
              </div>

            {/* Prix */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-baseline space-x-3">
                {originalPrice && originalPrice > currentPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-sm text-gray-600">HT</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                TVA : {formatPrice(currentPrice * 0.2)}
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                Total TTC : {formatPrice(currentPrice * 1.2)}
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Variantes disponibles
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary bg-primary-light'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{variant.name}</div>
                      <div className="text-sm text-gray-600">
                        {formatPrice(variant.price)}
                      </div>
                      {variant.sku && (
                        <div className="text-xs product-sku text-gray-500 font-mono mt-1">
                          SKU: {variant.sku}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantité */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Quantité
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-primary focus:border-primary"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={handleAddToCart}
                className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ajouter au panier
              </motion.button>

              <button
                onClick={handleToggleWishlist}
                className={`px-4 py-3 border rounded-lg transition-colors ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Informations de livraison */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Livraison gratuite</p>
                  <p className="text-sm text-gray-600">Dès 100€ d'achat</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Garantie 2 ans</p>
                  <p className="text-sm text-gray-600">Pièces et main d'œuvre</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">Retour 30 jours</p>
                  <p className="text-sm text-gray-600">Satisfait ou remboursé</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets détails */}
        <div className="mt-16">
          <ProductTabs product={product} />
        </div>

        {/* Avis clients */}
        {product?.id && (
          <div className="mt-16">
            <ProductReviews productId={product.id} />
          </div>
        )}

        {/* Produits similaires */}
        {product?.id && (
          <div className="mt-16">
            <ProductSimilar 
              productId={product.id} 
              categoryId={product.categoryId} 
            />
          </div>
        )}
      </div>
    </div>
  );
}