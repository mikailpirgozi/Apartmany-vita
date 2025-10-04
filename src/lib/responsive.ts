// Responsive breakpoints following Tailwind CSS conventions
export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

// Mobile-first utility classes for common layouts
export const gridResponsive = {
  // Apartment grid layouts
  apartments: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  apartmentsLarge: "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3",
  
  // Feature sections
  features: "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3",
  featuresTwo: "grid grid-cols-1 gap-8 md:grid-cols-2",
  
  // Content layouts
  content: "grid grid-cols-1 gap-8 lg:grid-cols-3",
  contentSidebar: "grid grid-cols-1 gap-8 lg:grid-cols-4",
  
  // Gallery layouts
  gallery: "grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4",
  galleryLarge: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
  
  // Form layouts
  form: "grid grid-cols-1 gap-4 md:grid-cols-2",
  formLarge: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
} as const

// Container sizes
export const containerSizes = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full"
} as const

// Spacing utilities
export const spacing = {
  section: "py-16 md:py-24",
  sectionSmall: "py-8 md:py-12",
  sectionLarge: "py-24 md:py-32",
  
  container: "px-4 sm:px-6 lg:px-8",
  containerTight: "px-4 sm:px-6",
  containerWide: "px-4 sm:px-6 lg:px-12 xl:px-16"
} as const

// Typography responsive classes
export const typography = {
  hero: "text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
  heading: "text-3xl font-bold tracking-tight sm:text-4xl",
  subheading: "text-xl font-semibold sm:text-2xl",
  body: "text-base sm:text-lg",
  caption: "text-sm sm:text-base"
} as const

// Utility function to combine responsive classes
export function responsive(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Utility function to get responsive container
export function getContainer(size: keyof typeof containerSizes = 'xl'): string {
  return `container ${containerSizes[size]} ${spacing.container}`
}

// Utility function for responsive grid
export function getGrid(type: keyof typeof gridResponsive): string {
  return gridResponsive[type]
}

// Media query helpers for JavaScript
export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`
} as const

// Hook for responsive values (can be used with useMediaQuery)
export function getResponsiveValue<T>(
  _values: { sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T },
  defaultValue: T
): T {
  // This would typically be used with a useMediaQuery hook
  // For now, return the default value
  return defaultValue
}
