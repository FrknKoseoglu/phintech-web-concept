
import YahooFinance from 'yahoo-finance2';

async function testMarketData() {
  console.log("📊 Testing Yahoo Finance Market Data Accuracy...\n");
  const yahooFinance = new YahooFinance();

  // Test symbols from each category
  const testSymbols = {
    'Kripto': ['BTC-USD', 'ETH-USD', 'SOL-USD'],
    'ABD Borsası': ['AAPL', 'TSLA', 'NVDA'],
    'BIST': ['THYAO.IS', 'GARAN.IS', 'AKBNK.IS'],
    'Emtia': ['GC=F', 'SI=F'],
    'Döviz': ['TRY=X']
  };

  for (const [category, symbols] of Object.entries(testSymbols)) {
    console.log(`\n🔍 ${category}:`);
    console.log('='.repeat(50));
    
    try {
      const quotes = await yahooFinance.quote(symbols);
      
      for (const quote of quotes) {
        console.log(`\n📈 ${quote.symbol}`);
        console.log(`   Fiyat: ${quote.regularMarketPrice}`);
        console.log(`   Değişim: ${quote.regularMarketChangePercent?.toFixed(2)}%`);
        console.log(`   Hacim: ${quote.regularMarketVolume}`);
        console.log(`   Son İşlem: ${quote.regularMarketTime}`);
        console.log(`   Piyasa Durumu: ${quote.marketState}`);
        
        // Warning for suspicious data
        if (!quote.regularMarketPrice || quote.regularMarketPrice === 0) {
          console.log(`   ⚠️  UYARI: Fiyat verisi eksik veya sıfır!`);
        }
      }
    } catch (error: any) {
      console.error(`❌ ${category} hatası:`, error.message);
    }
    
    // Small delay between categories to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n\n🔍 Detaylı BIST Test (Symbol Format):');
  console.log('='.repeat(50));
  
  try {
    // Test different BIST symbol formats
    const bistFormats = ['THYAO.IS', 'THYAO.IST', 'THYAO'];
    
    for (const symbol of bistFormats) {
      try {
        const quote = await yahooFinance.quote(symbol);
        console.log(`\n✅ ${symbol} çalışıyor:`);
        console.log(`   Fiyat: ${quote.regularMarketPrice} TRY`);
      } catch (error: any) {
        console.log(`\n❌ ${symbol} başarısız: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('BIST format test hatası:', error);
  }

  console.log('\n\n✨ Test tamamlandı!');
}

testMarketData();
