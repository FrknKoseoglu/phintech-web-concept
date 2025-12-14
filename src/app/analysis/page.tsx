import { Zap, BarChart3, Bell, ArrowRight, Sparkles, Shield, Gauge } from "lucide-react";
import Link from "next/link";
import DemoButton from "@/components/ui/DemoButton";

export const metadata = {
  title: "Midas Pro Analiz | Midas Web Interface",
  description: "İleri seviye yatırımcılar için profesyonel analiz araçları",
};

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center text-center px-4 md:px-10 pb-20 pt-10">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-[-10%] left-0 right-0 h-[60%] opacity-40"
            style={{
              background: `
                radial-gradient(ellipse at center bottom, rgba(255, 255, 255, 0.03) 0%, transparent 60%),
                repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 10px)
              `
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight mb-8">
            Yetenekli. Güçlü. <span className="text-gray-400">Pro.</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto mb-12">
            İleri seviye yatırımcılar için analiz deneyimini derinleştiriyoruz.
            <br className="hidden md:block" />
            Midas Pro ile premium verilere ulaş, yatırımlarını profesyonelce yönet.
          </p>
          <DemoButton 
            featureName="Midas Pro abonelik"
            className="group flex items-center justify-center gap-2 h-14 px-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-[17px] font-bold transition-all backdrop-blur-sm"
          >
            <span>Midas Pro'ya Üye Ol</span>
            <span className="opacity-60 mx-1">-</span>
            <span>₺950/ay</span>
          </DemoButton>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20 md:px-12 lg:px-20 bg-black">
        <div className="max-w-[1200px] mx-auto">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-16 gap-4">
            <h2 className="text-white text-3xl md:text-4xl font-semibold">Midas Pro Özellikleri</h2>
            <p className="text-gray-400 text-lg max-w-2xl">
              Profesyonel yatırımcılar için tasarlanmış, hız ve veri odaklı özel araçlar.
            </p>
            <Link 
              href="#features-compare" 
              className="text-primary text-sm font-bold hover:text-white transition-colors mt-2 flex items-center gap-1"
            >
              Tüm özellikleri karşılaştır <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 - Canlı Veri */}
            <div className="group flex flex-col items-start gap-4 p-8 rounded-2xl bg-[#0f0f0f] border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white mb-2">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-white text-xl font-bold">Canlı Veri</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Anlık borsa verilerine kesintisiz erişim sağlayın. Gecikmesiz veri akışı ile piyasa hareketlerini kaçırmayın.
              </p>
            </div>

            {/* Feature Card 2 - Derinlik Tabloları */}
            <div className="group flex flex-col items-start gap-4 p-8 rounded-2xl bg-[#0f0f0f] border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white mb-2">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-white text-xl font-bold">Derinlik Tabloları</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Emir defteri derinliklerini analiz ederek strateji kurun. Alıcı ve satıcı yoğunluğunu görselleştirin.
              </p>
            </div>

            {/* Feature Card 3 - Gelişmiş Alarm */}
            <div className="group flex flex-col items-start gap-4 p-8 rounded-2xl bg-[#0f0f0f] border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white mb-2">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-white text-xl font-bold">Gelişmiş Alarm</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Fiyat hareketlerini ve hacim değişimlerini yakalamak için sınırsız ve özelleştirilebilir alarmlar kurun.
              </p>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Feature Card 4 - AI Önerileri */}
            <div className="group flex flex-col items-start gap-4 p-8 rounded-2xl bg-[#0f0f0f] border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-white text-xl font-bold">AI Destekli Öneriler</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Yapay zeka ile portföy analizi ve akıllı yatırım önerileri alın. Kişiselleştirilmiş strateji tavsiyeleri.
              </p>
            </div>

            {/* Feature Card 5 - Güvenlik */}
            <div className="group flex flex-col items-start gap-4 p-8 rounded-2xl bg-[#0f0f0f] border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400 mb-2">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-white text-xl font-bold">Gelişmiş Güvenlik</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Çift faktörlü kimlik doğrulama ve şifreli veri akışı ile yatırımlarınız güvende.
              </p>
            </div>

            {/* Feature Card 6 - Performans */}
            <div className="group flex flex-col items-start gap-4 p-8 rounded-2xl bg-[#0f0f0f] border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-yellow-500/20 text-orange-400 mb-2">
                <Gauge className="w-6 h-6" />
              </div>
              <h3 className="text-white text-xl font-bold">Yüksek Performans</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Milisaniye seviyesinde emir iletimi ve optimize edilmiş arayüz ile hız avantajı yakalayın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="features-compare" className="relative z-10 px-6 py-20 md:px-12 lg:px-20 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col items-center text-center mb-16 gap-4">
            <h2 className="text-white text-3xl md:text-4xl font-semibold">Planları Karşılaştır</h2>
            <p className="text-gray-400 text-lg max-w-2xl">
              İhtiyaçlarınıza uygun planı seçin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="flex flex-col p-8 rounded-2xl bg-[#0f0f0f] border border-white/5">
              <h3 className="text-white text-2xl font-bold mb-2">Midas Standart</h3>
              <p className="text-gray-400 text-sm mb-6">Yeni başlayanlar için</p>
              <div className="text-4xl font-bold text-white mb-6">
                Ücretsiz
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Temel piyasa verileri
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 15 dakika gecikmeli veriler
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 3 adet fiyat alarmı
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <span className="text-gray-600">✗</span> Canlı veri akışı
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <span className="text-gray-600">✗</span> Derinlik tabloları
                </li>
              </ul>
              <Link 
                href="/login" 
                className="w-full py-3 text-center rounded-full border border-white/20 text-white font-bold hover:bg-white/5 transition-all"
              >
                Ücretsiz Başla
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="flex flex-col p-8 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/30 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                ÖNERİLEN
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">Midas Pro</h3>
              <p className="text-gray-400 text-sm mb-6">Profesyonel yatırımcılar için</p>
              <div className="text-4xl font-bold text-white mb-1">
                ₺950<span className="text-lg font-normal text-gray-400">/ay</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">veya ₺9.500/yıl ile %17 tasarruf</p>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Tüm standart özellikler
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Canlı veri akışı
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Derinlik tabloları
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Sınırsız alarm
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> AI destekli öneriler
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Öncelikli destek
                </li>
              </ul>
              <DemoButton 
                featureName="Midas Pro abonelik"
                className="w-full py-3 text-center rounded-full bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-lg shadow-primary/20"
              >
                Pro'ya Geç
              </DemoButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
