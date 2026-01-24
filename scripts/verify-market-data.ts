/**
 * Market Data Verification Script
 * Tests all data sources to ensure accuracy
 */

import { getMarketData } from '../src/lib/market';
import { getCryptoPrices } from '../src/lib/coingecko';
import { getUSDTRY } from '../src/lib/tcmb';

async function verifyMarketData() {
  console.log('🧪 Market Data Verification Test\n');
  console.log('='.repeat(70));

  // Test 1: CoinGecko API
  console.log('\n1️⃣ Testing CoinGecko API (Crypto Prices)...');
  try {
    const cryptoPrices = await getCryptoPrices(['BTC', 'ETH', 'SOL']);
    console.log('   ✅ CoinGecko API Working!');
    
    cryptoPrices.forEach((data, symbol) => {
      console.log(`   📈 ${symbol}: $${data.price.toLocaleString()} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`);
    });
  } catch (error) {
    console.error('   ❌ CoinGecko API Failed:', error);
  }

  // Test 2: TCMB API
  console.log('\n2️⃣ Testing TCMB API (USD/TRY Rate)...');
  try {
    const usdTry = await getUSDTRY();
    console.log(`   ✅ TCMB API Working!`);
    console.log(`   💵 USD/TRY: ₺${usdTry.toFixed(4)}`);
  } catch (error) {
    console.error('   ❌ TCMB API Failed:', error);
  }

  // Test 3: Full Market Data
  console.log('\n3️⃣ Testing Full Market Data Integration...');
  try {
    const marketData = await getMarketData();
    console.log('   ✅ Market Data Integration Working!');
    console.log(`   📊 Total Assets: ${marketData.length}`);
    
    // Show sample prices from each category
    const samples = {
      'Crypto': marketData.filter(a => a.category === 'crypto').slice(0, 2),
      'Stocks': marketData.filter(a => a.category === 'stock').slice(0, 2),
      'Currency': marketData.filter(a => a.category === 'currency').slice(0, 2),
    };

    Object.entries(samples).forEach(([category, assets]) => {
      console.log(`\n   ${category}:`);
      assets.forEach(asset => {
        const priceStr = asset.currency === 'TRY' 
          ? `₺${asset.price.toFixed(2)}`
          : `$${asset.price.toLocaleString()}`;
        console.log(`     ${asset.symbol}: ${priceStr}`);
      });
    });

  } catch (error) {
    console.error('   ❌ Market Data Integration Failed:', error);
  }

  // Test 4: Price Accuracy Check
  console.log('\n4️⃣ Checking Price Accuracy...');
  console.log('   Expected BTC: ~$89,000-$95,000');
  console.log('   Expected ETH: ~$2,900-$3,100');
  console.log('   Expected USD/TRY: ~₺42-₺44');
  
  const marketData = await getMarketData();
  const btc = marketData.find(a => a.symbol === 'BTC');
  const eth = marketData.find(a => a.symbol === 'ETH');
  const usd = marketData.find(a => a.symbol === 'USD');

  if (btc && btc.price >= 89000 && btc.price <= 95000) {
    console.log(`   ✅ BTC price looks correct: $${btc.price.toLocaleString()}`);
  } else {
    console.log(`   ⚠️  BTC price might be off: $${btc?.price.toLocaleString()}`);
  }

  if (eth && eth.price >= 2900 && eth.price <= 3100) {
    console.log(`   ✅ ETH price looks correct: $${eth.price.toLocaleString()}`);
  } else {
    console.log(`   ⚠️  ETH price might be off: $${eth?.price.toLocaleString()}`);
  }

  if (usd && usd.price >= 42 && usd.price <= 44) {
    console.log(`   ✅ USD/TRY looks correct: ₺${usd.price.toFixed(2)}`);
  } else {
    console.log(`   ⚠️  USD/TRY might be off: ₺${usd?.price.toFixed(2)}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✨ Verification Complete!\n');
}

verifyMarketData().catch(console.error);
