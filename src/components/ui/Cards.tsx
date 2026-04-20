'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  variant?: 'default' | 'premium' | 'gradient';
  accentColor?: 'primary' | 'secondary' | 'success' | 'warning';
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0,
  variant = 'default',
  accentColor = 'primary'
}: FeatureCardProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-primary/10',
      icon: 'text-primary',
      border: 'border-primary/20',
      glow: 'shadow-primary/10'
    },
    secondary: {
      bg: 'bg-secondary/10',
      icon: 'text-secondary', 
      border: 'border-secondary/20',
      glow: 'shadow-secondary/10'
    },
    success: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      border: 'border-emerald-200',
      glow: 'shadow-emerald-500/10'
    },
    warning: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      border: 'border-amber-200',
      glow: 'shadow-amber-500/10'
    }
  };

  const colors = colorClasses[accentColor];

  const getCardClasses = () => {
    switch (variant) {
      case 'premium':
        return `bg-white rounded-2xl shadow-2xl border-l-4 ${colors.border} p-8 hover:shadow-xl hover:${colors.glow} transition-all duration-500 bg-gradient-to-br from-white to-gray-50/30`;
      case 'gradient':
        return `bg-gradient-to-br from-white via-white to-${accentColor}/5 rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl hover:from-gray-50 hover:to-${accentColor}/10 transition-all duration-500`;
      default:
        return `bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 hover:shadow-2xl hover:${colors.glow} transition-all duration-500 backdrop-blur-sm`;
    }
  };

  return (
    <motion.div
      className={getCardClasses()}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
      }}
    >
      <div className="flex items-start mb-6">
        <div className={`${colors.bg} rounded-xl p-4 mr-5 shadow-lg`}>
          <Icon className={`h-7 w-7 ${colors.icon}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 leading-tight">
            {title}
          </h3>
        </div>
      </div>
      <p className="text-gray-600 leading-relaxed text-base">
        {description}
      </p>
    </motion.div>
  );
}

interface InfoCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  delay?: number;
  variant?: 'default' | 'modern' | 'minimal';
}

export function InfoCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = 'primary',
  delay = 0,
  variant = 'default'
}: InfoCardProps) {
  const colorClasses = {
    primary: {
      bg: 'from-primary to-primary-hover',
      text: 'text-white',
      iconBg: 'bg-white/20',
      shadow: 'shadow-primary/20'
    },
    secondary: {
      bg: 'from-secondary to-secondary-hover',
      text: 'text-white',
      iconBg: 'bg-white/20',
      shadow: 'shadow-secondary/20'
    },
    success: {
      bg: 'from-emerald-500 to-emerald-600',
      text: 'text-white',
      iconBg: 'bg-white/20',
      shadow: 'shadow-emerald-500/20'
    },
    warning: {
      bg: 'from-amber-500 to-amber-600',
      text: 'text-white',
      iconBg: 'bg-white/20',
      shadow: 'shadow-amber-500/20'
    }
  };

  const colors = colorClasses[color];

  const getCardClasses = () => {
    switch (variant) {
      case 'modern':
        return `bg-gradient-to-br ${colors.bg} rounded-2xl shadow-2xl ${colors.shadow} p-8 text-center relative overflow-hidden`;
      case 'minimal':
        return `card-elegant rounded-2xl border border-primary/10 p-8 text-center hover:shadow-2xl transition-all duration-500`;
      default:
        return `bg-gradient-to-br ${colors.bg} rounded-2xl shadow-xl ${colors.shadow} p-8 text-center relative overflow-hidden`;
    }
  };

  const getTextClasses = () => {
    return variant === 'minimal' 
      ? { value: 'text-gray-900', title: 'text-gray-700', desc: 'text-gray-600' }
      : { value: colors.text, title: colors.text, desc: `${colors.text} opacity-90` };
  };

  const textClasses = getTextClasses();

  return (
    <motion.div
      className={getCardClasses()}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
      }}
    >
      {/* Background Pattern */}
      {variant !== 'minimal' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 transform translate-x-8 -translate-y-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 transform -translate-x-4 translate-y-4"></div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {Icon && (
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${variant === 'minimal' ? `bg-${color}/10` : colors.iconBg} mb-6 ${colors.shadow}`}>
            <Icon className={`h-8 w-8 ${variant === 'minimal' ? `text-${color}` : 'text-white'}`} />
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className={`text-4xl font-heading font-bold ${textClasses.value} mb-3 tracking-tight`}>
            {value}
          </h3>
          <p className={`font-semibold ${textClasses.title} mb-2 text-lg tracking-wide`}>
            {title}
          </p>
          {description && (
            <p className={`text-sm ${textClasses.desc} leading-relaxed`}>
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  variant?: 'default' | 'modern' | 'premium';
}

export function Section({ children, className = '', id, variant = 'default' }: SectionProps) {
  const getSectionClasses = () => {
    const baseClasses = 'py-20';
    
    switch (variant) {
      case 'modern':
        return `${baseClasses} relative overflow-hidden ${className}`;
      case 'premium':
        return `${baseClasses} relative ${className}`;
      default:
        return `${baseClasses} ${className}`;
    }
  };

  return (
    <section 
      id={id}
      className={getSectionClasses()}
    >
      {variant === 'modern' && (
        <>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,.2) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,.2) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
          </div>
        </>
      )}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  centered?: boolean;
  variant?: 'default' | 'modern' | 'premium';
}

export function SectionHeader({ 
  title, 
  subtitle, 
  description, 
  centered = true,
  variant = 'default'
}: SectionHeaderProps) {
  const getHeaderClasses = () => {
    const baseClasses = `mb-16 ${centered ? 'text-center' : ''}`;
    
    switch (variant) {
      case 'modern':
        return `${baseClasses} relative`;
      case 'premium':
        return `${baseClasses} relative`;
      default:
        return baseClasses;
    }
  };

  return (
    <motion.div 
      className={getHeaderClasses()}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Decorative Elements */}
      {variant === 'modern' && centered && (
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary"></div>
          </div>
        </div>
      )}
      
      {subtitle && (
        <motion.p 
          className="text-primary font-semibold text-lg mb-4 tracking-wide uppercase text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}
      
      <motion.h2 
        className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-gray-900 mb-8 leading-tight tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {title}
      </motion.h2>
      
      {description && (
        <motion.p 
          className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}