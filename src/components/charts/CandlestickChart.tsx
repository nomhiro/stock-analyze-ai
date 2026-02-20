"use client";

import { useEffect, useRef } from "react";
import type { IChartApi } from "lightweight-charts";
import type { StockHistoryEntry } from "@/lib/types/stock";

interface CandlestickChartProps {
  data: StockHistoryEntry[];
  height?: number;
  showSMA?: boolean;
  showBB?: boolean;
}

function calcSMA(data: StockHistoryEntry[], period: number) {
  return data.map((_, i) => {
    if (i < period - 1) return { time: data[i].date, value: NaN };
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((s, d) => s + d.close, 0) / period;
    return { time: data[i].date, value: avg };
  }).filter((d) => !isNaN(d.value));
}

function calcBollingerBands(data: StockHistoryEntry[], period = 25, mult = 2) {
  const sma = calcSMA(data, period);
  return sma.map((s, i) => {
    const startIdx = data.findIndex((d) => d.date === s.time) - period + 1;
    const slice = data.slice(startIdx, startIdx + period);
    const mean = s.value;
    const variance =
      slice.reduce((sum, d) => sum + (d.close - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    return {
      time: s.time,
      upper: mean + mult * std,
      lower: mean - mult * std,
    };
  });
}

export function CandlestickChart({
  data,
  height = 400,
  showSMA = true,
  showBB = false,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    let cancelled = false;

    (async () => {
      const {
        createChart,
        CandlestickSeries,
        HistogramSeries,
        LineSeries,
      } = await import("lightweight-charts");

      if (cancelled || !containerRef.current) return;

      // Clear previous chart
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }

      const chart = createChart(containerRef.current, {
        height,
        layout: {
          background: { color: "#1a1d27" },
          textColor: "#9ca3af",
        },
        grid: {
          vertLines: { color: "#2a2d3a" },
          horzLines: { color: "#2a2d3a" },
        },
        crosshair: { mode: 0 },
        timeScale: { timeVisible: false, borderColor: "#2a2d3a" },
        rightPriceScale: { borderColor: "#2a2d3a" },
      });

      // Candlestick series
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });
      candleSeries.setData(
        data.map((d) => ({
          time: d.date,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        })),
      );

      // Volume
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      volumeSeries.setData(
        data.map((d) => ({
          time: d.date,
          value: d.volume,
          color:
            d.close >= d.open
              ? "rgba(34,197,94,0.25)"
              : "rgba(239,68,68,0.25)",
        })),
      );

      // SMA lines
      if (showSMA) {
        const smaConfigs = [
          { period: 5, color: "#f59e0b" },
          { period: 25, color: "#3b82f6" },
          { period: 75, color: "#a855f7" },
        ];
        for (const cfg of smaConfigs) {
          const smaData = calcSMA(data, cfg.period);
          if (smaData.length > 0) {
            const smaSeries = chart.addSeries(LineSeries, {
              color: cfg.color,
              lineWidth: 1,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            smaSeries.setData(smaData);
          }
        }
      }

      // Bollinger Bands
      if (showBB) {
        const bb = calcBollingerBands(data, 25, 2);
        if (bb.length > 0) {
          const upperSeries = chart.addSeries(LineSeries, {
            color: "rgba(147,197,253,0.4)",
            lineWidth: 1,
            lineStyle: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          upperSeries.setData(
            bb.map((b) => ({ time: b.time, value: b.upper })),
          );

          const lowerSeries = chart.addSeries(LineSeries, {
            color: "rgba(147,197,253,0.4)",
            lineWidth: 1,
            lineStyle: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          lowerSeries.setData(
            bb.map((b) => ({ time: b.time, value: b.lower })),
          );
        }
      }

      chart.timeScale().fitContent();
      chartRef.current = chart;

      const handleResize = () => {
        if (containerRef.current) {
          chart.applyOptions({ width: containerRef.current.clientWidth });
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    })();

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, height, showSMA, showBB]);

  return <div ref={containerRef} className="w-full" />;
}
