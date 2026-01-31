"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { getLimitOrders, cancelLimitOrder } from "@/actions/limit-orders";
import { getHoldingUnit } from "@/lib/utils";

interface OpenOrdersProps {
  symbol?: string; // Optional: filter by symbol
  status?: "PENDING" | "COMPLETED" | "CANCELLED"; // Default: PENDING
}

interface LimitOrderWithDetails {
  id: string;
  userId: string;
  symbol: string;
  quantity: number | null;
  amount: number | null;
  targetPrice: number;
  type: "BUY" | "SELL";
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
  currentPrice: number;
  currency: 'USD' | 'TRY' | 'USDT';
}

export default function OpenOrders({ symbol, status = "PENDING" }: OpenOrdersProps) {
  const [orders, setOrders] = useState<LimitOrderWithDetails[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await getLimitOrders(status);
      
      if (result.success && result.orders) {
        setOrders(result.orders as any);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  // Handle cancel order
  const handleCancelOrder = (orderId: string) => {
    startTransition(async () => {
      try {
        const result = await cancelLimitOrder(orderId);
        
        if (result.success) {
          toast.success("Emir İptal Edildi", {
            description: result.message,
          });
          fetchOrders(); // Refresh orders
        } else {
          toast.error("İptal Başarısız", {
            description: result.message,
          });
        }
      } catch (error) {
        toast.error("Bir hata oluştu", {
          description: "Lütfen tekrar deneyin.",
        });
      }
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Get status badge
  const getStatusBadge = (orderStatus: string) => {
    const badges = {
      PENDING: { text: "Beklemede", class: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
      COMPLETED: { text: "Tamamlandı", class: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
      CANCELLED: { text: "İptal Edildi", class: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400" },
      FAILED: { text: "Başarısız", class: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
    };
    const badge = badges[orderStatus as keyof typeof badges] || badges.PENDING;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const filteredOrders = symbol 
    ? orders.filter(order => order.symbol === symbol)
    : orders;

  return (
    <div className="h-full overflow-auto p-4 bg-white dark:bg-black">
      {loading ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          Yükleniyor...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center text-sm text-gray-400 dark:text-gray-500 italic">
          {status === "PENDING" ? "Açık emriniz bulunmuyor." : 
           status === "COMPLETED" ? "Tamamlanmış emriniz bulunmuyor." : 
           "İptal edilmiş emriniz bulunmuyor."}
        </div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th className="pb-2 font-medium">Tarih</th>
              <th className="pb-2 font-medium">Sembol</th>
              <th className="pb-2 font-medium">Yön</th>
              <th className="pb-2 font-medium text-right">Hedef Fiyat</th>
              <th className="pb-2 font-medium text-right">Miktar</th>
              <th className="pb-2 font-medium text-right">Piyasa Fiyatı</th>
              <th className="pb-2 font-medium text-center">Durum</th>
              {status === "PENDING" && <th className="pb-2 font-medium text-right">İşlem</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="py-3 text-gray-600 dark:text-gray-300">
                  {formatDate(order.createdAt)}
                </td>
                <td className="py-3 font-semibold text-gray-900 dark:text-white">
                  {order.symbol}
                </td>
                <td className={`py-3 font-medium ${order.type === "BUY" ? "text-success" : "text-danger"}`}>
                  {order.type === "BUY" ? "Al" : "Sat"}
                </td>
                <td className="py-3 text-right text-gray-900 dark:text-white">
                  {order.currency === 'TRY' ? '₺' : '$'}
                  {order.targetPrice.toLocaleString(order.currency === 'TRY' ? "tr-TR" : "en-US", { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </td>
                <td className="py-3 text-right text-gray-700 dark:text-gray-200">
                  {order.quantity?.toFixed(4)} {getHoldingUnit(order.symbol)}
                </td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                  {order.currency === 'TRY' ? '₺' : '$'}
                  {order.currentPrice.toLocaleString(order.currency === 'TRY' ? "tr-TR" : "en-US", { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </td>
                <td className="py-3 text-center">
                  {getStatusBadge(order.status)}
                </td>
                {status === "PENDING" && (
                  <td className="py-3 text-right">
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={isPending}
                      className="text-danger hover:bg-danger/10 px-2 py-1 rounded text-xs disabled:opacity-50 transition-colors"
                    >
                      İptal
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
