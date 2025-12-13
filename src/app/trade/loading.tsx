export default function TradeLoading() {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Al-Sat yükleniyor...</p>
      </div>
    </div>
  );
}
