import { Sparkles } from "lucide-react";

export default function UpgradeCard() {
  return (
    <div className="bg-gradient-to-br from-primary to-purple-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group cursor-pointer">
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
      
      <h3 className="text-lg font-bold mb-2 relative z-10 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Midas Plus&apos;a Geç
      </h3>
      <p className="text-white/80 text-sm mb-4 relative z-10">
        Daha düşük komisyonlar ve canlı veri akışı ile yatırımlarını güçlendir.
      </p>
      <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors relative z-10 border border-white/10">
        Planları İncele
      </button>
    </div>
  );
}
