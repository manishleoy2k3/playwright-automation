/**
 * URL Configuration utility for metrology hardware store
 * Supports dynamic URL construction based on environment, country, and language
 * New URL format: https://store.{environment}.test.com/hardware-store?store-code={country}&lang={language}
 */

export type Environment = 'dev' | 'stg' | 'prd';

export interface SiteConfig {
  env: Environment;
  country: string;
  language: string;
}
//todo: cleanup CountryConfig later, when exact url structure is confirmed
export interface CountryConfig {
  code: string;
  language: string | string[];
  currency: string;
  name: string;
  defaultLanguage?: string;
  whitelistedCountries?: string[]; // List of countries that are allowed to access this country's store
  localeOverride?: Record<string, string>; // Override locale format for specific languages
}

/**
 * Country configurations with default language and currency
 */
export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  at: {
    code: 'at',
    language: ['de', 'en'],
    currency: 'EUR',
    name: 'Austria',
    defaultLanguage: 'de',
  },
  be: {
    code: 'be',
    language: 'en',
    currency: 'EUR',
    name: 'Belgium',
    whitelistedCountries: ['lu'],
  },
  ch: {
    code: 'ch',
    language: ['de', 'fr', 'it', 'en'],
    currency: 'CHF',
    name: 'Switzerland',
    defaultLanguage: 'de',
    whitelistedCountries: ['li'],
  },
  cz: {
    code: 'cz',
    language: ['cs', 'en', 'de'],
    currency: 'EUR',
    name: 'Czech Republic',
    defaultLanguage: 'cs',
  },
  de: {
    code: 'de',
    language: ['de', 'en'],
    currency: 'EUR',
    name: 'Germany',
    defaultLanguage: 'de',
  },
  dk: {
    code: 'dk',
    language: 'en',
    currency: 'DKK',
    name: 'Denmark',
  },
  es: {
    code: 'es',
    language: ['es', 'en'],
    currency: 'EUR',
    name: 'Spain',
    defaultLanguage: 'es',
    whitelistedCountries: ['pt'],
  },
  fi: {
    code: 'fi',
    language: 'en',
    currency: 'EUR',
    name: 'Finland',
    whitelistedCountries: ['ee'],
  },
  fr: {
    code: 'fr',
    language: ['fr', 'en'],
    currency: 'EUR',
    name: 'France',
    defaultLanguage: 'fr',
  },
  global: {
    code: 'global',
    language: ['de', 'en'],
    currency: 'EUR',
    name: 'Global',
    defaultLanguage: 'de',
    localeOverride: {
      de: 'de_DE',
      en: 'en_DE',
    },
  },
  ie: {
    code: 'ie',
    language: 'en',
    currency: 'EUR',
    name: 'Ireland',
  },
  in: {
    code: 'in',
    language: ['en', 'de'],
    currency: 'INR',
    name: 'India',
    defaultLanguage: 'en',
  },
  it: {
    code: 'it',
    language: ['it', 'en', 'de'],
    currency: 'EUR',
    name: 'Italy',
    defaultLanguage: 'it',
  },
  kr: {
    code: 'kr',
    language: ['ko', 'en'],
    currency: 'KRW',
    name: 'South Korea',
    defaultLanguage: 'ko',
  },
  mx: {
    code: 'mx',
    language: ['es', 'en'],
    currency: 'USD',
    name: 'Mexico',
    defaultLanguage: 'es',
  },
  nl: {
    code: 'nl',
    language: 'en',
    currency: 'EUR',
    name: 'Netherlands',
  },
  no: {
    code: 'no',
    language: 'en',
    currency: 'NOK',
    name: 'Norway',
  },
  pl: {
    code: 'pl',
    language: ['pl', 'en', 'de'],
    currency: 'PLN',
    name: 'Poland',
    defaultLanguage: 'pl',
  },
  se: {
    code: 'se',
    language: 'en',
    currency: 'SEK',
    name: 'Sweden',
  },
  sk: {
    code: 'sk',
    language: ['cs', 'en'],
    currency: 'EUR',
    name: 'Slovakia',
    defaultLanguage: 'cs',
  },
  uk: {
    code: 'uk',
    language: 'en',
    currency: 'GBP',
    name: 'United Kingdom',
    localeOverride: {
      en: 'en_GB',
    },
  },
  us: {
    code: 'us',
    language: 'en',
    currency: 'USD',
    name: 'United States',
    whitelistedCountries: ['ca', 'pr'],
  },
};

/**
 * Get supported languages for a country
 */
export const getSupportedLanguages = (country: string): string[] => {
  const config = COUNTRY_CONFIGS[country];
  if (!config) return [];
  return Array.isArray(config.language) ? config.language : [config.language];
};

/**
 * Get default language for a country
 */
export const getDefaultLanguage = (country: string): string => {
  const config = COUNTRY_CONFIGS[country];
  if (!config) return 'en';

  if (Array.isArray(config.language)) {
    return config.defaultLanguage || config.language[0] || 'en';
  }
  return config.language;
};

/**
 * Validate if language is supported for country
 */
export const isLanguageSupported = (country: string, language: string): boolean => {
  const supportedLanguages = getSupportedLanguages(country);
  return supportedLanguages.includes(language);
};

/**
 * Get currency for a country
 */
export const getCurrencyForCountry = (country: string): string => {
  const config = COUNTRY_CONFIGS[country];
  return config ? config.currency : 'EUR';
};

/**
 * URL Builder class for metrology hardware store
 */
export class UrlBuilder {
  private baseConfig: SiteConfig;

  constructor(config?: Partial<SiteConfig>) {
    // Default configuration from environment variables or fallback
    this.baseConfig = {
      env: (process.env['SITE_ENV'] as Environment) || 'dev',
      country: process.env['SITE_COUNTRY'] || 'de',
      language: process.env['SITE_LANGUAGE'] || 'en',
      ...config,
    };

    // Auto-configure language from country if not specified
    if (!config?.language && !process.env['SITE_LANGUAGE']) {
      this.baseConfig.language = getDefaultLanguage(this.baseConfig.country);
    }

    // Validate language is supported for the country
    if (!isLanguageSupported(this.baseConfig.country, this.baseConfig.language)) {
      console.warn(
        `Language '${this.baseConfig.language}' is not supported for country '${this.baseConfig.country}'. ` +
          `Using default language '${getDefaultLanguage(this.baseConfig.country)}' instead.`
      );
      this.baseConfig.language = getDefaultLanguage(this.baseConfig.country);
    }
  }

  /**
   * Build the base URL for the metrology hardware store
   * Format: https://store.metrology.{environment}.zeiss.com/{country}/{locale}
   * Production format: https://store.metrology.zeiss.com/{country}/{locale}
   */
  buildBaseUrl(config?: Partial<SiteConfig>): string {
    const finalConfig = { ...this.baseConfig, ...config };
    const storeCode = finalConfig.country;
    const language = finalConfig.language;
    const locale = language;
    const host =
      finalConfig.env === 'prd'
        ? 'store.metrology.test.com'
        : `store.metrology.${finalConfig.env}.test.com`;

    //todo: include edge cases with locale overrides later, when exact url structure is confirmed
    return `https://${host}/${storeCode}/${locale}`;
  }

  /**
   * Build specific page URLs by adding path segments
   */
  buildPageUrl(page: string, config?: Partial<SiteConfig>): string {
    const baseUrl = this.buildBaseUrl(config);
    return `${baseUrl}${page}`;
  }
}

/**
 * Get current country configuration
 */
export const getCountry = (): string => {
  return process.env['SITE_COUNTRY'] || 'de';
};

/**
 * Get whitelisted countries for a selected country
 */
export const getWhitelistedCountries = (country: string): string[] => {
  return COUNTRY_CONFIGS[country]?.whitelistedCountries ?? [];
};

/**
 * Get current language configuration
 */
export const getLanguage = (): string => {
  const country = getCountry();
  return process.env['SITE_LANGUAGE'] || getDefaultLanguage(country);
};

export const urlBuilder = new UrlBuilder();
