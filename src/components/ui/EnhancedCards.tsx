'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// Process Step Card
interface ProcessStepCardProps {
  step: string;
  title: string;
  description: string;
  index: number;
  isLast?: boolean;
}

export function ProcessStepCard({ step, title, description, index, isLast }: ProcessStepCardProps) {
  return (
    <motion.div
      className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 hover:shadow-2xl transition-all duration-500"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Step Number */}
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-2xl shadow-lg flex items-center justify-center">
        <span className="text-white font-heading font-bold text-lg">{step}</span>
      </div>

      {/* Connector Line (for desktop) */}
      {!isLast && (
        <div className="hidden lg:block">
          <div className="absolute top-1/2 -right-8 w-16 h-px bg-gradient-to-r from-primary/50 to-primary/20 hidden lg:block">
            <div className="absolute right-0 top-1/2 w-2 h-2 bg-primary rounded-full transform -translate-y-1/2"></div>
          </div>
        </div>
      )}

      <div className="pt-4">
        <h3 className="text-xl font-heading font-bold text-gray-900 mb-4 leading-tight">
          {title}
        </h3>
         <p className="text-gray-800 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// Service Card
interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  index: number;
  variant?: 'default' | 'featured';
}

export function ServiceCard({ icon: Icon, title, description, features, index, variant = 'default' }: ServiceCardProps) {
  const getCardClasses = () => {
    switch (variant) {
      case 'featured':
        return "bg-gradient-to-br from-primary to-primary-hover text-white rounded-2xl shadow-2xl p-8 transform relative overflow-hidden";
      case 'default':
        return "bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100/50";
      default:
        return "bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100/50";
    }
  };

  const getIconClasses = () => {
    switch (variant) {
      case 'featured':
        return "bg-white/20 backdrop-blur-sm text-white";
      case 'default':
        return "bg-primary/10 text-primary";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const textClass = variant === 'featured' ? 'text-white' : 'text-gray-900';
  const descClass = variant === 'featured' ? 'text-white/90' : 'text-gray-800';
  const featureTextClass = variant === 'featured' ? 'text-white/80' : 'text-gray-800';

  return (
    <motion.div
      className={getCardClasses()}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Background Pattern for Featured */}
      {variant === 'featured' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 transform -translate-x-8 translate-y-8"></div>
        </div>
      )}

      <div className="relative z-10">
        {/* Icon & Title */}
        <div className="flex items-start mb-6">
          <div className={`${getIconClasses()} rounded-xl p-4 mr-5 shadow-lg`}>
            <Icon className="h-7 w-7" />
          </div>
          <h3 className={`text-xl font-heading font-bold ${textClass} leading-tight flex-1`}>
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className={`${descClass} leading-relaxed mb-6 text-base`}>
          {description}
        </p>

        {/* Features List */}
        <ul className="space-y-3">
          {features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${variant === 'featured' ? 'bg-white/60' : 'bg-primary'} flex-shrink-0`}></div>
              <span className={`ml-3 text-sm ${featureTextClass}`}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// Stats Grid
interface Stat {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'primary' | 'secondary' | 'success' | 'warning';
  description: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          className="group"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center relative overflow-hidden group-hover:shadow-2xl transition-all duration-500">
            {/* Background Pattern */}
            <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${
              stat.color === 'primary' ? 'from-primary to-primary-hover' :
              stat.color === 'secondary' ? 'from-secondary to-secondary-hover' :
              stat.color === 'success' ? 'from-emerald-500 to-emerald-600' :
              'from-amber-500 to-amber-600'
            }`}></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg ${
                stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                stat.color === 'secondary' ? 'bg-secondary/10 text-secondary' :
                stat.color === 'success' ? 'bg-emerald-50 text-emerald-600' :
                stat.color === 'warning' ? 'bg-amber-50 text-amber-600' :
                'bg-primary/10 text-primary'
              }`}>
                <stat.icon className="h-8 w-8" />
              </div>

              {/* Value */}
              <h3 className="text-4xl font-heading font-bold text-gray-900 mb-3 tracking-tight">
                {stat.value}
              </h3>

              {/* Title */}
              <p className="font-semibold text-gray-700 mb-2 text-lg tracking-wide">
                {stat.title}
              </p>

              {/* Description */}
               <p className="text-sm text-gray-800 leading-relaxed">
                {stat.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Call to Action Card
interface CallToActionCardProps {
  title: string;
  description: string;
  primaryButton: {
    text: string;
    href: string;
  };
  secondaryButton?: {
    text: string;
    href: string;
  };
  variant?: 'primary' | 'elegant' | 'gradient';
}

export function CallToActionCard({ 
  title, 
  description, 
  primaryButton, 
  secondaryButton,
  variant = 'gradient' 
}: CallToActionCardProps) {
  const getCardClasses = () => {
    switch (variant) {
      case 'primary':
        return "bg-secondary";
      case 'elegant':
        return "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900";
      default:
        return "bg-secondary";  // Bleu foncé pur #003d5c
    }
  };

  const getTextClass = () => {
    return variant === 'elegant' ? 'text-gray-900' : 'text-white';
  };

  const getBgPattern = () => {
    if (variant === 'elegant') {
      return (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-secondary transform -translate-x-12 translate-y-12"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-primary/30 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      );
    }
    return (
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-12 translate-y-12"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-white/30 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    );
  };

  const getButtonClasses = () => {
    if (variant === 'elegant') {
      return {
        primary: "bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-hover transition-all duration-300 shadow-xl",
        secondary: "bg-transparent border-2 border-primary text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary hover:text-white transition-all duration-300"
      };
    }
    return {
      primary: "bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl",
      secondary: "bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary transition-all duration-300"
    };
  };

  const textClass = getTextClass();
  const buttonClasses = getButtonClasses();

  return (
    <motion.div
      className={`${getCardClasses()} rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background Pattern */}
      {getBgPattern()}

      <div className="relative z-10">
        {/* Title */}
        <h2 className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 leading-tight ${textClass}`}>
          {title}
        </h2>

        {/* Description */}
        <p className={`text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed font-light ${variant === 'elegant' ? 'text-gray-800' : 'text-white/90'}`}>
          {description}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.a
            href={primaryButton.href}
            className={buttonClasses.primary}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {primaryButton.text}
          </motion.a>

          {secondaryButton && (
            <motion.a
              href={secondaryButton.href}
              className={buttonClasses.secondary}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {secondaryButton.text}
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
}