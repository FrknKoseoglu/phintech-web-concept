/**
 * Alternative Market Data Script - Tests without Yahoo Finance
 * Uses public APIs to validate actual market prices
 */

async function compareRealPrices() {
  console.log("📊 Gerçek Piyasa Fiyatları Karşılaştırması\n");
  
  // Test with CoinGecko for crypto (no auth needed)
  console.log("🔍 Kripto Kontrol (CoinGecko API):");
  console.log('='.repeat(60));
  
  try {
    const cryptoResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,avalanche-2,dogecoin&vs_currencies=usd&include_24hr_change=true'
    );
    const cryptoData = await cryptoResponse.json();
    
    console.log('\n💎 Bitcoin:');
    console.log(`   Gerçek Fiyat: $${cryptoData.bitcoin?.usd}`);
    console.log(`   24h Değişim: ${cryptoData.bitcoin?.usd_24h_change?.toFixed(2)}%`);
    
    console.log('\n💎 Ethereum:');
    console.log(`   Gerçek Fiyat: $${cryptoData.ethereum?.usd}`);
    console.log(`   24h Değişim: ${cryptoData.ethereum?.usd_24h_change?.toFixed(2)}%`);
    
    console.log('\n💎 Solana:');
    console.log(`   Gerçek Fiyat: $${cryptoData.solana?.usd}`);
    console.log(`   24h Değişim: ${cryptoData.solana?.usd_24h_change?.toFixed(2)}%`);
    
  } catch (error) {
    console.error('❌ CoinGecko hatası:', error);
  }
  
  // Test TCMB for USD/TRY
  console.log('\n\n🔍 Döviz Kontrol (TCMB):');
  console.log('='.repeat(60));
  
  try {
    const tcmbResponse = await fetch(
      'https://www.tcmb.gov.tr/kurlar/today.xml'
    );
    const tcmbXml = await tcmbResponse.text();
    
    // Simple regex to extract USD rate
    const usdMatch = tcmbXml.match(/<Currency.*?CurrencyCode="USD".*?>(.*?)<\/Currency>/s);
    if (usdMatch) {
      const forexSellingMatch = usdMatch[1].match(/<ForexSelling>([\d.]+)<\/ForexSelling>/);
      if (forexSellingMatch) {
        console.log(`\n💵 USD/TRY:`);
        console.log(`   TCMB Satış Kuru: ₺${forexSellingMatch[1]}`);
      }
    }
  } catch (error) {
    console.error('❌ TCMB hatası:', error);
  }
  
  console.log('\n\n🔍 ABD Hisseleri Kontrol (Alpha Vantage demo):');
  console.log('='.repeat(60));
  console.log('ℹ️  Not: ABD hisse fiyatları için Yahoo Finance alternatifi Alpha Vantage');
  console.log('ℹ️  API key gerektirir (ücretsiz: 25 request/day)');
  console.log('ℹ️  Veya Finnhub, Polygon.io gibi servisleri kullanabilirsiniz\n');
  
  console.log('\n✨ Test tamamlandı!');
  console.log('\n💡 Öneri: Yahoo Finance yerine:');
  console.log('   - Kripto: CoinGecko API (ücretsiz, limit yüksek)');
  console.log('   - Döviz: TCMB XML (resmi, güvenilir)');
  console.log('   - Hisseler: Alpha Vantage, Finnhub veya Twelve Data');
}

compareRealPrices();
