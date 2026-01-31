import BrandLogo from "@/components/BrandLogo";
import { BRAND_LOGO_COLOR } from "@/lib/brand-config";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="flex flex-col items-center gap-4">
        {/* Brand Logo Spinner */}
        <div className="relative w-[60px] h-[60px]">
          <BrandLogo className="animate-pulse w-full h-full" />
          {/* Spinning ring */}
          <div 
            className="absolute -inset-4 border-2 border-t-4 rounded-full animate-spin" 
            style={{ 
              borderColor: `${BRAND_LOGO_COLOR}20`,
              borderTopColor: BRAND_LOGO_COLOR
            }}
          />
        </div>
        <p className="text-sm text-gray-400 animate-pulse">Yükleniyor...</p>
      </div>
    </div>
  );
}
