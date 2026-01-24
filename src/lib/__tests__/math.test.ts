/**
 * Unit Tests for Financial Math Module (CRITICAL - P0)
 * 
 * Tests all financial calculations to ensure money accuracy.
 */

import { describe, it, expect } from 'vitest';
import { calculateNetWorth, calculateProfitLoss, getUsdTryRate } from '../math';
import type { PortfolioItem, Asset } from '@/types';

describe('calculateNetWorth', () => {
  const mockUsdTryRate = 34.4;

  it('should calculate correct USD value with TRY balance only', () => {
    const balance = 1000; // TRY
    const portfolio: PortfolioItem[] = [];
    const marketData: Asset[] = [];
    
    const result = calculateNetWorth(balance, portfolio, marketData, mockUsdTryRate);
    
    expect(result.totalUsd).toBeCloseTo(29.07, 2); // 1000 / 34.4
    expect(result.cashTryInUsd).toBeCloseTo(29.07, 2);
    expect(result.cashUsd).toBe(0);
    expect(result.cashUsdt).toBe(0);
  });

  it('should handle zero balance', () => {
    const result = calculateNetWorth(0, [], [], mockUsdTryRate);
    
    expect(result.totalUsd).toBe(0);
    expect(result.totalTry).toBe(0);
    expect(result.investmentsValueUsd).toBe(0);
  });

  it('should calculate with USD cash holdings', () => {
    const balance = 0;
    const portfolio: PortfolioItem[] = [
      { symbol: 'USD', quantity: 100, avgCost: 1 }
    ];
    const marketData: Asset[] = [];
    
    const result = calculateNetWorth(balance, portfolio, marketData, mockUsdTryRate);
    
    expect(result.totalUsd).toBe(100);
    expect(result.cashUsd).toBe(100);
  });

  it('should calculate with USDT cash holdings', () => {
    const balance = 0;
    const portfolio: PortfolioItem[] = [
      { symbol: 'USDT', quantity: 50, avgCost: 1 }
    ];
    const marketData: Asset[] = [];
    
    const result = calculateNetWorth(balance, portfolio, marketData, mockUsdTryRate);
    
    expect(result.totalUsd).toBe(50);
    expect(result.cashUsdt).toBe(50);
  });

  it('should calculate crypto holdings in USD', () => {
    const balance = 0;
    const portfolio: PortfolioItem[] = [
      { symbol: 'BTC', quantity: 0.01, avgCost: 80000 }
    ];
    const marketData: Asset[] = [
      { symbol: 'BTC', name: 'Bitcoin', price: 90000, currency: 'USD', changePercent: 2, category: 'crypto' }
    ];
    
    const result = calculateNetWorth(balance, portfolio, marketData, mockUsdTryRate);
    
    expect(result.totalUsd).toBe(900); // 0.01 * 90000
    expect(result.investmentsValueUsd).toBe(900);
    expect(result.breakdown.crypto).toBe(900);
  });

  it('should convert TRY-denominated assets to USD', () => {
    const balance = 0;
    const portfolio: PortfolioItem[] = [
      { symbol: 'THYAO', quantity: 10, avgCost: 250 }
    ];
    const marketData: Asset[] = [
      { symbol: 'THYAO', name: 'THY', price: 260, currency: 'TRY', changePercent: 1, category: 'stock' }
    ];
    
    const result = calculateNetWorth(balance, portfolio, marketData, mockUsdTryRate);
    
    // 10 * 260 TRY = 2600 TRY / 34.4 = $75.58
    expect(result.totalUsd).toBeCloseTo(75.58, 2);
    expect(result.breakdown.stocks).toBeCloseTo(75.58, 2);
  });

  it('should calculate complex portfolio correctly', () => {
    const balance = 1000; // TRY
    const portfolio: PortfolioItem[] = [
      { symbol: 'USD', quantity: 50, avgCost: 1 },
      { symbol: 'BTC', quantity: 0.01, avgCost: 80000 },
      { symbol: 'THYAO', quantity: 10, avgCost: 250 },
    ];
    const marketData: Asset[] = [
      { symbol: 'BTC', name: 'Bitcoin', price: 90000, currency: 'USD', changePercent: 2, category: 'crypto' },
      { symbol: 'THYAO', name: 'THY', price: 260, currency: 'TRY', changePercent: 1, category: 'stock' },
    ];
    
    const result = calculateNetWorth(balance, portfolio, marketData, mockUsdTryRate);
    
    // TRY: 1000/34.4 = 29.07
    // USD: 50
    // BTC: 900
    // THYAO: 2600/34.4 = 75.58
    // Total: 1054.65
    expect(result.totalUsd).toBeCloseTo(1054.65, 1);
  });
});

describe('calculateProfitLoss', () => {
  const mockUsdTryRate = 34.4;

  it('should calculate profit correctly', () => {
    const portfolio: PortfolioItem[] = [
      { symbol: 'BTC', quantity: 0.01, avgCost: 80000 }
    ];
    const marketData: Asset[] = [
      { symbol: 'BTC', name: 'Bitcoin', price: 90000, currency: 'USD', changePercent: 2, category: 'crypto' }
    ];
    
    const result = calculateProfitLoss(portfolio, marketData, mockUsdTryRate);
    
    // Current: 0.01 * 90000 = 900
    // Cost: 0.01 * 80000 = 800
    // Profit: 100
    expect(result.totalPL).toBe(100);
    expect(result.totalPLPercent).toBeCloseTo(12.5, 1); // 100/800 * 100
  });

  it('should calculate loss correctly', () => {
    const portfolio: PortfolioItem[] = [
      { symbol: 'ETH', quantity: 1, avgCost: 3000 }
    ];
    const marketData: Asset[] = [
      { symbol: 'ETH', name: 'Ethereum', price: 2500, currency: 'USD', changePercent: -5, category: 'crypto' }
    ];
    
    const result = calculateProfitLoss(portfolio, marketData, mockUsdTryRate);
    
    expect(result.totalPL).toBe(-500);
    expect(result.totalPLPercent).toBeCloseTo(-16.67, 1);
  });

  it('should handle zero cost basis', () => {
    const portfolio: PortfolioItem[] = [
      { symbol: 'BTC', quantity: 0.01, avgCost: 0 }
    ];
    const marketData: Asset[] = [
      { symbol: 'BTC', name: 'Bitcoin', price: 90000, currency: 'USD', changePercent: 2, category: 'crypto' }
    ];
    
    const result = calculateProfitLoss(portfolio, marketData, mockUsdTryRate);
    
    expect(result.totalPLPercent).toBe(0); // Avoid division by zero
  });

  it('should convert TRY assets in P/L calculation', () => {
    const portfolio: PortfolioItem[] = [
      { symbol: 'THYAO', quantity: 10, avgCost: 250 }
    ];
    const marketData: Asset[] = [
      { symbol: 'THYAO', name: 'THY', price: 260, currency: 'TRY', changePercent: 1, category: 'stock' }
    ];
    
    const result = calculateProfitLoss(portfolio, marketData, mockUsdTryRate);
    
    // Current: 10 * 260 / 34.4 = 75.58 USD
    // Cost: 10 * 250 / 34.4 = 72.67 USD
    // Profit: 2.91 USD
    expect(result.totalPL).toBeCloseTo(2.91, 2);
  });

  it('should ignore USD and USDT from profit calculation', () => {
    const portfolio: PortfolioItem[] = [
      { symbol: 'USD', quantity: 100, avgCost: 1 },
      { symbol: 'USDT', quantity: 50, avgCost: 1 },
      { symbol: 'BTC', quantity: 0.01, avgCost: 80000 }
    ];
    const marketData: Asset[] = [
      { symbol: 'BTC', name: 'Bitcoin', price: 90000, currency: 'USD', changePercent: 2, category: 'crypto' }
    ];
    
    const result = calculateProfitLoss(portfolio, marketData, mockUsdTryRate);
    
    // Only BTC should be counted
    expect(result.totalPL).toBe(100);
  });
});

describe('getUsdTryRate', () => {
  it('should return correct rate from market data', () => {
    const marketData: Asset[] = [
      { symbol: 'USD', name: 'US Dollar', price: 43.28, currency: 'TRY', changePercent: 0, category: 'currency' }
    ];
    
    const rate = getUsdTryRate(marketData);
    
    expect(rate).toBe(43.28);
  });

  it('should return fallback rate when USD not found', () => {
    const marketData: Asset[] = [];
    
    const rate = getUsdTryRate(marketData);
    
    expect(rate).toBe(34.5); // Default fallback
  });
});
