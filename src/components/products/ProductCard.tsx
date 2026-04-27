'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import toast from 'react-hot-toast';

import type { Product } from '@/types/api';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';
import { T } from '@/components/ui/TranslatedText';
import { useI18n } from '@/lib/i18n';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

function StockBadge({ stock }: { stock: number }) {
  if (stock > 10) return <span className="stock-in">En stock</span>;
  if (stock > 0)  return <span className="stock-low">Stock faible — {stock}</span>;
  return <span className="stock-out">Rupture de stock</span>;
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { tr } = useI18n();
  const router = useRouter();
  const { addItem } = useCartStore();
  const [wishlisted, setWishlisted] = useState(false);
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
    toast.success(`${product.name} ajouté au panier`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(v => !v);
    toast.success(wishlisted ? 'Retiré de la liste de souhaits' : 'Ajouté à la liste de souhaits');
  };

  const goToProduct = () => router.push(`/products/${product.slug}`);

  /* ── List view ── */
  if (viewMode === 'list') {
    return (
      <div
        onClick={goToProduct}
        className="group flex gap-5 p-5 bg-white rounded-xl border border-slate-200 hover:border-[#00a8b5] hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        {/* Image */}
        <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
          <ProductImage
            src={product.images}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            categorySlug={product.category?.slug}
            productName={product.name}
          />
          {product.isNew && (
            <span className="absolute top-1.5 left-1.5 badge badge-success text-[10px]">Nouveau</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
          <div>
            {product.brand && (
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{product.brand}</p>
            )}
            <h3 className="font-semibold text-slate-800 line-clamp-2 text-sm leading-snug group-hover:text-[#00a8b5] transition-colors">
              <T>{product.name}</T>
            </h3>
            {product.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                <T maxLength={120}>{product.description}</T>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            {product.stock !== undefined && <StockBadge stock={product.stock} />}
            <div className="flex items-center gap-3">
              <div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-slate-400 line-through block">{formatPrice(product.originalPrice)}</span>
                )}
                <span className="font-bold text-slate-900 text-base">{formatPrice(product.price)}</span>
                <span className="text-xs text-slate-400 ml-1">HT</span>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary btn-sm"
                aria-label={`${tr.common.addToCart} ${product.name}`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {tr.common.addToCart}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Grid view ── */
  return (
    <article
      onClick={goToProduct}
      onKeyDown={e => { if (e.key === 'Enter') goToProduct(); }}
      role="article"
      tabIndex={0}
      aria-label={`${product.name}${product.brand ? ` — ${product.brand}` : ''}, ${formatPrice(product.price)} HT`}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200 hover:border-[#00a8b5] hover:shadow-lg transition-all duration-200 cursor-pointer h-full overflow-hidden focus-visible:outline-2 focus-visible:outline-[#00a8b5] focus-visible:outline-offset-2"
    >
      {/* Image area */}
      <div className="relative overflow-hidden bg-slate-50 aspect-[4/3]">
        <ProductImage
          src={product.images}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          categorySlug={product.category?.slug}
          productName={product.name}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-slate-700 shadow-md">
            <Eye className="w-3.5 h-3.5" />
            Voir le produit
          </span>
        </div>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="badge badge-success text-[10px]">Nouveau</span>
          )}
          {product.discount && (
            <span className="badge badge-danger text-[10px]">–{product.discount}%</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200 ${
            wishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-slate-400 hover:text-red-500 backdrop-blur-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide -mb-1">{product.brand}</p>
        )}

        {/* Reference */}
        <p className="product-reference text-[10px]">
          REF: ALT-{product.id.toString().slice(-6).toUpperCase()}
        </p>

        {/* Title */}
        <h3 className="font-semibold text-slate-800 line-clamp-2 leading-snug text-sm group-hover:text-[#00a8b5] transition-colors">
          <T>{product.name}</T>
        </h3>

        {/* Rating */}
        {product.rating != null && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating!) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400">({product.reviewsCount ?? 0})</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + Stock */}
        <div className="flex items-end justify-between gap-2">
          <div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through block">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="font-bold text-slate-900 text-lg leading-none">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-slate-400 ml-1">HT</span>
          </div>
          {product.stock !== undefined && <StockBadge stock={product.stock} />}
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full btn btn-sm font-semibold mt-1 ${
            isOutOfStock ? 'btn-ghost opacity-50 cursor-not-allowed' : 'btn-primary'
          }`}
          aria-label={`Ajouter ${product.name} au panier`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {isOutOfStock ? tr.common.outOfStock : tr.common.addToCart}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
