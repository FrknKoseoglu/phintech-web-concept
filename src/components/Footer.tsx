import { BRAND_NAME, isMidasBrand } from "@/lib/brand-config";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-[#1C1C1E] mt-auto py-6">
      <div className="max-w-[1920px] mx-auto px-6 text-center space-y-2">
        <p className="text-xs text-gray-500 dark:text-text-muted">
          © 2024 {BRAND_NAME} - Konsept Proje
        </p>
        <p className="text-[10px] text-gray-400 dark:text-text-muted/70 max-w-4xl mx-auto">
          Bu proje bir konsept çalışmadır. {isMidasBrand() ? 'Midas Menkul Değerler A.Ş.' : 'PhinTech'} veya herhangi bir finansal kuruluş ile bağlantısı bulunmamaktadır. 
          Kripto verileri CoinGecko, döviz kurları TCMB, hisse verileri Yahoo Finance tarafından sağlanmaktadır.
        </p>
      </div>
    </footer>
  );
}
