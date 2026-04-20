// Utility functions and constants for enhanced design components - Harmonisé Althea Systems

export const colorVariants = {
  primary: {
    bg: 'from-primary to-primary-hover',
    text: 'text-primary',
    bgSolid: 'bg-primary',
    bgLight: 'bg-primary-light',
    border: 'border-primary',
    ring: 'ring-primary',
    shadow: 'shadow-primary/20',
    glow: 'shadow-primary/30',
    hover: 'hover:bg-primary-hover hover:text-white'
  },
  secondary: {
    bg: 'from-secondary to-secondary-hover', 
    text: 'text-secondary',
    bgSolid: 'bg-secondary',
    bgLight: 'bg-secondary-light',
    border: 'border-secondary',
    ring: 'ring-secondary',
    shadow: 'shadow-secondary/20',
    glow: 'shadow-secondary/30',
    hover: 'hover:bg-secondary-hover hover:text-white'
  },
  success: {
    bg: 'from-emerald-500 to-emerald-600',
    text: 'text-emerald-600',
    bgSolid: 'bg-emerald-500',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
    ring: 'ring-emerald-500',
    shadow: 'shadow-emerald-500/20',
    glow: 'shadow-emerald-500/30',
    hover: 'hover:bg-emerald-600 hover:text-white'
  },
  warning: {
    bg: 'from-amber-500 to-amber-600',
    text: 'text-amber-600',
    bgSolid: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    border: 'border-amber-200',
    ring: 'ring-amber-500',
    shadow: 'shadow-amber-500/20',
    glow: 'shadow-amber-500/30',
    hover: 'hover:bg-amber-600 hover:text-white'
  },
  info: {
    bg: 'from-primary-dark to-primary',
    text: 'text-primary-dark',
    bgSolid: 'bg-primary-dark',
    bgLight: 'bg-primary-50',
    border: 'border-primary/30',
    ring: 'ring-primary-dark',
    shadow: 'shadow-primary-dark/20',
    glow: 'shadow-primary-dark/30',
    hover: 'hover:bg-primary hover:text-white'
  },
  error: {
    bg: 'from-red-500 to-red-600',
    text: 'text-red-600',
    bgSolid: 'bg-red-500',
    bgLight: 'bg-red-50',
    border: 'border-red-200',
    ring: 'ring-red-500',
    shadow: 'shadow-red-500/20',
    glow: 'shadow-red-500/30',
    hover: 'hover:bg-red-600 hover:text-white'
  }
} as const;

export const animationVariants = {
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] }
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] }
  },
  fadeInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  },
  hoverLift: {
    whileHover: { 
      y: -8, 
      scale: 1.02,
      transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
    }
  },
  hoverGlow: {
    whileHover: {
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.3 }
    }
  }
} as const;

export const shadowVariants = {
  subtle: 'shadow-sm',
  default: 'shadow-lg',
  medium: 'shadow-xl', 
  large: 'shadow-2xl',
  colored: {
    primary: 'shadow-xl shadow-primary/20',
    secondary: 'shadow-xl shadow-secondary/20',
    success: 'shadow-xl shadow-emerald-500/20',
    warning: 'shadow-xl shadow-amber-500/20'
  }
} as const;

export const gradientBackgrounds = {
  // Dégradés harmonisés avec la palette Althea Systems
  primary: 'bg-gradient-to-br from-primary via-primary-hover to-primary-dark',
  secondary: 'bg-gradient-to-br from-secondary via-secondary-hover to-secondary-dark',
  elegant: 'bg-gradient-to-br from-secondary-light via-white to-primary-light',
  premium: 'bg-gradient-to-br from-secondary to-primary',
  soft: 'bg-gradient-to-br from-primary-50 via-white to-secondary-50',
  warm: 'bg-gradient-to-br from-primary-light via-white to-primary-100',
  cool: 'bg-gradient-to-br from-secondary-light via-primary-50 to-secondary-100',
  success: 'bg-gradient-to-br from-emerald-50 via-green-50 to-primary-50',
  medical: 'bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-light'
} as const;

export const borderVariants = {
  subtle: 'border border-primary/10',
  default: 'border border-primary/20', 
  bold: 'border-2 border-primary/30',
  colored: {
    primary: 'border border-primary/25',
    secondary: 'border border-secondary/25',
    success: 'border border-emerald-200',
    warning: 'border border-amber-200'
  }
} as const;

export type ColorVariant = keyof typeof colorVariants;
export type AnimationVariant = keyof typeof animationVariants;
export type ShadowVariant = keyof typeof shadowVariants;