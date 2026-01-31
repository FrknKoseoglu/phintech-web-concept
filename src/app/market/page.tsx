import { Metadata } from "next";
import MarketExploreClient from "./MarketExploreClient";
import { BRAND_NAME } from "@/lib/brand-config";

export const metadata: Metadata = {
  title: `Market - Varlıkları Keşfet | ${BRAND_NAME}`,
  description: "BIST, ABD hisseleri, kripto paralar ve ETF'leri keşfedin. Canlı fiyatlar ve piyasa verileri.",
};

export default function MarketPage() {
  return <MarketExploreClient />;
}
