/**
 * TCMB (Central Bank of Turkey) Currency Service
 * Fetches official USD/TRY and EUR/TRY rates from TCMB XML feed
 */

import { unstable_cache } from 'next/cache';

export interface TCMBRates {
  usdTry: number;
  eurTry: number;
  timestamp: Date;
}

/**
 * Fetches currency rates from TCMB XML
 * Cached for 5 minutes (TCMB updates hourly)
 */
export const fetchTCMBRates = unstable_cache(
  async (): Promise<TCMBRates | null> => {
    try {
      const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml', {
        next: { revalidate: 300 }, // 5 minutes cache
      });

      if (!response.ok) {
        console.error(`TCMB API Error: ${response.status}`);
        return null;
      }

      const xmlText = await response.text();
      
      // Parse USD rate using regex
      const usdMatch = xmlText.match(/<Currency[\s\S]*?CurrencyCode="USD"[\s\S]*?>([\s\S]*?)<\/Currency>/);
      let usdTry = 43.28; // Default fallback
      
      if (usdMatch) {
        const forexSellingMatch = usdMatch[1].match(/<ForexSelling>([\d.]+)<\/ForexSelling>/);
        if (forexSellingMatch) {
          usdTry = parseFloat(forexSellingMatch[1]);
        }
      }

      // Parse EUR rate using regex
      const eurMatch = xmlText.match(/<Currency[\s\S]*?CurrencyCode="EUR"[\s\S]*?>([\s\S]*?)<\/Currency>/);
      let eurTry = 46.5; // Default fallback
      
      if (eurMatch) {
        const forexSellingMatch = eurMatch[1].match(/<ForexSelling>([\d.]+)<\/ForexSelling>/);
        if (forexSellingMatch) {
          eurTry = parseFloat(forexSellingMatch[1]);
        }
      }

      return {
        usdTry,
        eurTry,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ TCMB fetch error:', error);
      return null;
    }
  },
  ['tcmb-rates'],
  { 
    revalidate: 300, // Cache for 5 minutes
    tags: ['currency-rates'] 
  }
);

/**
 * Get current USD/TRY rate
 */
export async function getUSDTRY(): Promise<number> {
  const rates = await fetchTCMBRates();
  return rates?.usdTry || 43.28;
}

/**
 * Get current EUR/TRY rate
 */
export async function getEURTRY(): Promise<number> {
  const rates = await fetchTCMBRates();
  return rates?.eurTry || 46.5;
}
