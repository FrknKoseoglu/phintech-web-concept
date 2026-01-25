import { Metadata } from "next";
import MarketExploreClient from "./MarketExploreClient";

export const metadata: Metadata = {
  title: "Market - Varlıkları Keşfet | Midas",
  description: "BIST, ABD hisseleri, kripto paralar ve ETF'leri keşfedin. Canlı fiyatlar ve piyasa verileri.",
};

export default function MarketPage() {
  return <MarketExploreClient />;
}
