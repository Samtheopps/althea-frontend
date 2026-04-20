'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, SortAsc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useProductStore } from '@/stores/productStore';
import { useI18n } from '@/lib/i18n';

export default function ProductSort() {
  const { tr } = useI18n();
  const { filters, setFilters } = useProductStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: 'newest',       label: tr.sort.newest },
    { value: 'name_asc',     label: tr.sort.nameAsc },
    { value: 'name_desc',    label: tr.sort.nameDesc },
    { value: 'price_asc',    label: tr.sort.priceAsc },
    { value: 'price_desc',   label: tr.sort.priceDesc },
    { value: 'availability', label: tr.sort.availability },
  ];

  const currentSort = sortOptions.find(o => o.value === filters.sortBy) || sortOptions[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-black bg-white hover:bg-gray-50 transition-colors"
      >
        <SortAsc className="mr-2 h-4 w-4" />
        {currentSort.label}
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <div className="py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => { setFilters({ sortBy: option.value as any }); setIsOpen(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    currentSort.value === option.value ? 'bg-primary text-white' : 'text-black hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
