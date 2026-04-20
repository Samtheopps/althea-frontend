'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw,
  ChevronRight, Minus, Plus, CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import type { Product } from '@/types/api';
import { productService } from '@/services/productService';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import ProductImageCarousel from '@/components/products/ProductImageCarousel';
import ProductTabs from '@/components/products/ProductTabs';
import ProductSimilar from '@/components/products/ProductSimilar';
import ProductReviews from '@/components/products/ProductReviews';
import { useI18n } from '@/lib/i18n';

/* ── Stock indicator ── */
function StockStatus({ stock, tr }: { stock: number; tr: any }) {
  if (stock > 10) return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
      <CheckCircle2 className="w-4 h-4" />
      {tr.common.inStock} ({stock})
    </span>
  );
  if (stock > 0) return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
      <AlertTriangle className="w-4 h-4" />
      {stock}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
      <XCircle className="w-4 h-4" />
      {tr.common.outOfStock}
    </span>
  );
}

export default function ProductPage() {
  const { tr } = useI18n();
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCartStore();

  const [product,         setProduct]         = useState<Product | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [quantity,        setQuantity]        = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [wishlisted,      setWishlisted]      = useState(false);

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await productService.getProductBySlug(slug);
      setProduct(data);
      if (data?.variants?.length) setSelectedVariant(data.variants[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    addItem(product, quantity, selectedVariant);
    toast.success(`${product.name} ajouté au panier !`);
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({ title: product.name, text: product.description, url: window.location.href });
      } catch {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié !');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié !');
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container-page py-8">
          <div className="h-4 bg-slate-200 rounded w-64 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />
            <div className="space-y-5">
              <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse" />
              <div className="h-10 bg-slate-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse" />
              <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-14 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-slate-800 mb-2">{tr.product.notFound}</h2>
          <p className="text-slate-500 mb-6">{tr.product.notFoundDesc}</p>
          <Link href="/products" className="btn btn-primary">
            {tr.product.backToCatalog}
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice  = selectedVariant?.price        ?? product.price;
  const originalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
  const isOutOfStock  = product.stock !== undefined && product.stock === 0;
  const hasDiscount   = originalPrice && originalPrice > currentPrice;
  const discountPct   = hasDiscount ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-page py-3">
          <nav className="flex items-center gap-1.5 text-sm flex-wrap">
            <Link href="/" className="text-slate-500 hover:text-primary transition-colors">{tr.nav.home}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            <Link href="/products" className="text-slate-500 hover:text-primary transition-colors">{tr.nav.products}</Link>
            {product.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                <Link href={`/categories/${product.category.slug}`} className="text-slate-500 hover:text-primary transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container-page py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Images */}
          <div className="lg:sticky lg:top-24">
            <ProductImageCarousel images={product.images || []} />
          </div>

          {/* Product info */}
          <div className="space-y-7">

            {/* Header */}
            <div>
              {product.brand && (
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                  {product.brand}
                </p>
              )}
              <h1 className="font-heading font-bold text-3xl text-slate-900 leading-tight mb-3">
                {product.name}
              </h1>
              <p className="text-slate-500 leading-relaxed text-sm">
                {product.shortDescription ?? product.description}
              </p>
            </div>

            {/* Reference + Stock */}
            <div className="flex items-center justify-between gap-4 py-3 border-y border-slate-100">
              <p className="product-reference">REF: ALT-{product.id.toString().slice(-6).toUpperCase()}</p>
              {product.stock !== undefined && <StockStatus stock={product.stock} tr={tr} />}
            </div>

            {/* Price block */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="font-heading font-bold text-4xl text-slate-900">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-slate-400 text-sm pb-1">HT</span>
                {hasDiscount && (
                  <span className="text-slate-400 line-through text-lg pb-1">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                {discountPct > 0 && (
                  <span className="badge badge-danger text-xs ml-1">–{discountPct}%</span>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-500">
                <span>TVA : {formatPrice(currentPrice * 0.2)}</span>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-slate-700">TTC : {formatPrice(currentPrice * 1.2)}</span>
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">{tr.product.variant}</p>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 text-left rounded-xl border-2 transition-all duration-200 ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary bg-primary-light'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className="font-semibold text-slate-800 text-sm">{variant.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{formatPrice(variant.price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="space-y-4">
              {/* Quantity picker */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">{tr.common.quantity}</p>
                <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-slate-800 text-sm select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-11 h-11 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {/* ADD TO CART — primary CTA */}
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
                  whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
                  className="flex-1 btn btn-lg"
                  style={
                    isOutOfStock
                      ? { background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }
                      : {
                          background: 'linear-gradient(135deg, #00a8b5 0%, #0098a4 100%)',
                          color: '#ffffff',
                          boxShadow: '0 4px 14px 0 rgba(0, 168, 181, 0.35)',
                          border: 'none',
                        }
                  }
                  aria-label={isOutOfStock ? tr.common.outOfStock : tr.common.addToCart}
                >
                  <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                  {isOutOfStock ? tr.common.outOfStock : tr.common.addToCart}
                </motion.button>

                {/* Wishlist */}
                <button
                  onClick={() => {
                    setWishlisted(v => !v);
                    toast.success(wishlisted ? 'Retiré des favoris' : 'Ajouté aux favoris');
                  }}
                  aria-label={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  className="w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-all duration-200"
                  style={
                    wishlisted
                      ? { background: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }
                      : { background: '#ffffff', borderColor: '#e2e8f0', color: '#94a3b8' }
                  }
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  aria-label={tr.product.shareLabel}
                  className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reassurance strip */}
            <div className="grid grid-cols-3 gap-3">
              {([Truck, Shield, RotateCcw] as const).map((Icon, i) => {
                const { title, sub } = tr.product.reassurance[i];
                return (
                <div
                  key={title}
                  className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-white border border-slate-100"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#e0f7f9' }}>
                    <Icon className="w-4 h-4" style={{ color: '#00a8b5' }} />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{title}</p>
                  <p className="text-[11px] text-slate-400">{sub}</p>
                </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-16">
          <ProductTabs product={product} />
        </div>

        {/* ── Reviews ── */}
        {product.id && (
          <div className="mt-16">
            <ProductReviews productId={product.id} />
          </div>
        )}

        {/* ── Similar ── */}
        {product.id && (
          <div className="mt-16">
            <ProductSimilar productId={product.id} categoryId={product.categoryId} />
          </div>
        )}
      </div>
    </div>
  );
}
