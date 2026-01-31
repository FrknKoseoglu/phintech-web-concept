/**
 * Brand Configuration
 * Centralized branding system based on PROJECT_CLONE_NAME environment variable
 */

type BrandName = 'midas' | 'other';

interface BrandConfig {
  name: string;
  fullName: string;
  proName: string;
  plusName: string;
  standardName: string;
  logoColor: string;
  description: string;
}

const BRAND_CONFIGS: Record<BrandName, BrandConfig> = {
  midas: {
    name: 'Midas',
    fullName: 'Midas Web Interface',
    proName: 'Midas Pro',
    plusName: 'Midas Plus',
    standardName: 'Midas Standart',
    logoColor: '#4E55FF',
    description: 'Midas trading platform',
  },
  other: {
    name: 'PhinTech',
    fullName: 'PhinTech Web Interface',
    proName: 'PhinTech Pro',
    plusName: 'PhinTech Plus',
    standardName: 'PhinTech Standart',
    logoColor: '#14B8A6',
    description: 'PhinTech trading platform',
  },
};

/**
 * Get current brand configuration based on environment variable
 */
function getBrandConfig(): BrandConfig {
  const projectCloneName = (process.env.NEXT_PUBLIC_PROJECT_CLONE_NAME || 'midas').toLowerCase();
  const brandKey: BrandName = projectCloneName === 'midas' ? 'midas' : 'other';
  return BRAND_CONFIGS[brandKey];
}

/**
 * Check if current brand is Midas
 */
export function isMidasBrand(): boolean {
  const projectCloneName = (process.env.NEXT_PUBLIC_PROJECT_CLONE_NAME || 'midas').toLowerCase();
  return projectCloneName === 'midas';
}

// Export brand configuration
export const BRAND = getBrandConfig();

// Export individual brand values for convenience
export const BRAND_NAME = BRAND.name;
export const BRAND_FULL_NAME = BRAND.fullName;
export const BRAND_PRO_NAME = BRAND.proName;
export const BRAND_PLUS_NAME = BRAND.plusName;
export const BRAND_STANDARD_NAME = BRAND.standardName;
export const BRAND_LOGO_COLOR = BRAND.logoColor;
export const BRAND_DESCRIPTION = BRAND.description;
