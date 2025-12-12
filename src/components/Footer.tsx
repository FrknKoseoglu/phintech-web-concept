export default function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-[#1C1C1E] mt-auto py-6">
      <div className="max-w-[1920px] mx-auto px-6 text-center space-y-2">
        <p className="text-xs text-gray-500 dark:text-text-muted">
          © 2024 Midas Menkul Değerler A.Ş. Tüm hakları saklıdır.
        </p>
        <p className="text-[10px] text-gray-400 dark:text-text-muted/70 max-w-2xl mx-auto">
          Piyasa verileri Yahoo Finance tarafından sağlanmaktadır ve Borsa İstanbul verileri 15 dakika gecikmelidir. Kripto varlıklar anlıktır.
        </p>
      </div>
    </footer>
  );
}
