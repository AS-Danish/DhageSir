// theme.js - Global Theme Configuration

export const theme = {
  colors: {
    // Primary Brand Colors (Premium Orange Palette)
    primary: {
      50: '#FFF7ED',   // Lightest orange tint
      100: '#FFEDD5',  // Very light orange
      200: '#FED7AA',  // Light orange
      300: '#FDBA74',  // Soft orange
      400: '#FB923C',  // Medium orange
      500: '#F97316',  // Main brand orange
      600: '#EA580C',  // Deep orange
      700: '#C2410C',  // Darker orange
      800: '#9A3412',  // Very dark orange
      900: '#7C2D12',  // Deepest orange
    },

    // Secondary Accent (Complementary Deep Blue/Navy)
    secondary: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#0EA5E9',
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
    },

    // Neutral Grays
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Success, Warning, Error
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Gradient Combinations
  gradients: {
    primary: 'from-orange-500 to-orange-600',
    primaryLight: 'from-orange-400 to-orange-500',
    primaryDark: 'from-orange-600 to-orange-700',
    
    secondary: 'from-blue-600 to-cyan-600',
    
    // Premium combinations
    premium: 'from-orange-500 via-orange-600 to-red-600',
    sunset: 'from-orange-400 via-red-500 to-pink-600',
    warm: 'from-amber-500 to-orange-600',
    
    // Neutral combinations
    dark: 'from-gray-800 to-gray-900',
    light: 'from-gray-50 to-gray-100',
    
    // Background overlays
    overlay: 'from-gray-900/80 via-gray-900/40 to-transparent',
  },

  // Background Colors for Sections
  backgrounds: {
    primary: 'bg-orange-50',
    secondary: 'bg-blue-50',
    light: 'bg-gray-50',
    white: 'bg-white',
    dark: 'bg-gray-900',
  },

  // Text Colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    light: 'text-gray-500',
    white: 'text-white',
    brand: 'text-orange-600',
  },

  // Border Colors
  borders: {
    light: 'border-gray-100',
    default: 'border-gray-200',
    dark: 'border-gray-300',
    primary: 'border-orange-200',
    focus: 'focus:border-orange-500',
  },

  // Shadow Styles
  shadows: {
    sm: 'shadow-sm',
    default: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl',
    primary: 'shadow-orange-500/20',
  },

  // Button Styles
  buttons: {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white',
    secondary: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white',
    outline: 'bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white',
    dark: 'bg-gray-900 text-white hover:bg-gray-800',
    ghost: 'bg-transparent hover:bg-orange-50 text-orange-600',
  },

  // Icon Container Styles
  iconContainers: {
    primary: 'bg-gradient-to-br from-orange-400 to-orange-600',
    secondary: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    success: 'bg-gradient-to-br from-green-400 to-emerald-600',
    warning: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    info: 'bg-gradient-to-br from-blue-400 to-indigo-600',
  },

  // Badge Styles
  badges: {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
    secondary: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
    light: 'bg-orange-100 text-orange-700',
    outline: 'border-2 border-orange-500 text-orange-600',
  },

  // Card Styles
  cards: {
    default: 'bg-white border-2 border-gray-100 hover:border-orange-200',
    elevated: 'bg-white shadow-xl hover:shadow-2xl',
    gradient: 'bg-gradient-to-br from-orange-50 to-white',
  },
};

// Helper function to get gradient class
export const getGradient = (type = 'primary') => {
  return `bg-gradient-to-r ${theme.gradients[type]}`;
};

// Helper function to get button class
export const getButton = (variant = 'primary') => {
  return `${theme.buttons[variant]} rounded-xl py-4 px-8 font-bold transition-all hover:scale-105 hover:shadow-2xl`;
};

export default theme;