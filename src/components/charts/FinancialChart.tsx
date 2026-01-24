"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  AreaSeries,
  Time,
  ISeriesApi,
} from "lightweight-charts";

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface FinancialChartProps {
  data: ChartDataPoint[];
  type?: "candlestick" | "line";
  height?: number;
}

export default function FinancialChart({
  data,
  type = "candlestick",
  height = 400,
}: FinancialChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8E8E93",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        borderColor: "rgba(197, 203, 206, 0.2)",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "rgba(197, 203, 206, 0.2)",
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#758696",
          width: 1,
          style: 3,
          labelBackgroundColor: "#26a69a",
        },
        horzLine: {
          color: "#758696",
          width: 1,
          style: 3,
          labelBackgroundColor: "#26a69a",
        },
      },
    });

    // Add series - v5 CORRECT API
    let series: ISeriesApi<any>;

    if (type === "candlestick") {
      // ✅ v5 API: addSeries(CandlestickSeries, options)
      series = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      // Data transformation for candlestick
      const candleData = data.map((d) => ({
        time: (new Date(d.time).getTime() / 1000) as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      series.setData(candleData);
    } else {
      // ✅ v5 API: addSeries(AreaSeries, options)
      series = chart.addSeries(AreaSeries, {
        lineColor: "#26a69a",
        topColor: "rgba(38, 166, 154, 0.4)",
        bottomColor: "rgba(38, 166, 154, 0.0)",
        lineWidth: 2,
      });

      // Data transformation for area/line
      const lineData = data.map((d) => ({
        time: (new Date(d.time).getTime() / 1000) as Time,
        value: d.close,
      }));

      series.setData(lineData);
    }

    // ResizeObserver for responsive behavior
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(chartContainerRef.current);

    // Fit content initially
    chart.timeScale().fitContent();

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, type, height]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full relative"
      style={{ height: `${height}px` }}
    />
  );
}

// Dummy data for testing
export const dummyChartData: ChartDataPoint[] = [
  { time: "2024-01-01", open: 100, high: 110, low: 95, close: 105 },
  { time: "2024-01-02", open: 105, high: 115, low: 100, close: 112 },
  { time: "2024-01-03", open: 112, high: 118, low: 108, close: 110 },
  { time: "2024-01-04", open: 110, high: 120, low: 105, close: 118 },
  { time: "2024-01-05", open: 118, high: 125, low: 115, close: 122 },
];
