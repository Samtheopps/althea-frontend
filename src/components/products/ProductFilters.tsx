'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter } from 'lucide-react';

import { useProductStore } from '@/stores/productStore';
import { categoryService } from '@/services/categoryService';

export default function ProductFilters() {
  const {
    filters,
    setFilters,
    categories,
    setCategories,
    getBrands,
  } = useProductStore();

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'categories',
    'price',
    'brands'
  ]);

  const brands = getBrands();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters({
      category: filters.category === categoryId ? undefined : categoryId
    });
  };

  const handleBrandChange = (brand: string) => {
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
    
    setFilters({
      brands: newBrands.length === 0 ? undefined : newBrands
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    setFilters({
      priceMin: min === 0 ? undefined : min,
      priceMax: max === 10000 ? undefined : max,
    });
  };

  const FilterSection = ({ 
    title, 
    sectionKey, 
    children 
  }: { 
    title: string; 
    sectionKey: string; 
    children: React.ReactNode; 
  }) => (
    <div className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${
            expandedSections.includes(sectionKey) ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      <AnimatePresence>
        {expandedSections.includes(sectionKey) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-lg font-medium text-gray-900">
        <Filter className="h-5 w-5" />
        <span>Filtres</span>
      </div>

      {/* Catégories */}
      <FilterSection title="Catégories" sectionKey="categories">
        <div className="space-y-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.category === category.id}
                onChange={() => handleCategoryChange(category.id)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                {category.name}
                {category.productCount && (
                  <span className="ml-2 text-gray-500">({category.productCount})</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Prix */}
      <FilterSection title="Prix" sectionKey="price">
        <div className="space-y-4">
          {/* Range slider */}
          <div className="relative">
            <input
              type="range"
              min={0}
              max={10000}
              step={100}
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(parseInt(e.target.value), priceRange[1])}
              className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="range"
              min={0}
              max={10000}
              step={100}
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(priceRange[0], parseInt(e.target.value))}
              className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Valeurs */}
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>{priceRange[0]}€</span>
            <span>{priceRange[1] === 10000 ? '10 000€+' : `${priceRange[1]}€`}</span>
          </div>

          {/* Inputs directs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Min</label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(parseInt(e.target.value) || 0, priceRange[1])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Max</label>
              <input
                type="number"
                value={priceRange[1] === 10000 ? '' : priceRange[1]}
                placeholder="Max"
                onChange={(e) => handlePriceChange(priceRange[0], parseInt(e.target.value) || 10000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Marques */}
      {brands.length > 0 && (
        <FilterSection title="Marques" sectionKey="brands">
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.brands?.includes(brand) || false}
                  onChange={() => handleBrandChange(brand)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Disponibilité */}
      <FilterSection title="Disponibilité" sectionKey="availability">
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">En stock</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">Livraison rapide</span>
          </label>
        </div>
      </FilterSection>

      {/* Notes */}
      <FilterSection title="Notes clients" sectionKey="rating">
        <div className="space-y-3">
          {[4, 3, 2, 1].map((stars) => (
            <label key={stars} className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <div className="ml-3 flex items-center">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${
                        i < stars ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-700">& plus</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}