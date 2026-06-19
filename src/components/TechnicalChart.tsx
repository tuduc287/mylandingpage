import React, { useState, useRef, useEffect } from "react";
import { Candle } from "../types";

interface TechnicalChartProps {
  candles: Candle[];
  ticker: string;
}

export default function TechnicalChart({ candles, ticker }: TechnicalChartProps) {
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 });

  // Update sizes responsively
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      setDimensions({
        width: Math.max(300, width),
        height: 320
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!candles || candles.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400">
        Đang tải dữ liệu biểu đồ kỹ thuật...
      </div>
    );
  }

  const { width, height } = dimensions;
  const paddingLeft = 10;
  const paddingRight = 60;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find min and max values to fit prices in SVG
  const prices = candles.flatMap((c) => [c.high, c.low, c.open, c.close]);
  const minPrice = Math.min(...prices) * 0.98;
  const maxPrice = Math.max(...prices) * 1.02;
  const priceRange = maxPrice - minPrice;

  // Max volume for volume bars (drawn at the bottom 25% height of the chart)
  const volumes = candles.map((c) => c.volume);
  const maxVolume = Math.max(...volumes) || 1;

  // Convert values to SVG coordinates
  const getX = (index: number) => {
    return paddingLeft + (index / (candles.length - 1)) * chartWidth;
  };

  const getY = (price: number) => {
    return paddingTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  const getVolHeight = (volume: number) => {
    return (volume / maxVolume) * (chartHeight * 0.25);
  };

  // Generate 5 horizontal price gridlines
  const gridCount = 5;
  const priceGridlines = Array.from({ length: gridCount }, (_, i) => {
    const price = minPrice + (i / (gridCount - 1)) * priceRange;
    return {
      price: price.toFixed(1),
      y: getY(price)
    };
  });

  // Simple 5-day Moving Average (MA5) line coordinate generator
  const maPeriod = 5;
  const maPoints: { x: number; y: number }[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i >= maPeriod - 1) {
      let sum = 0;
      for (let j = 0; j < maPeriod; j++) {
        sum += candles[i - j].close;
      }
      const maPrice = sum / maPeriod;
      maPoints.push({ x: getX(i), y: getY(maPrice) });
    }
  }

  const maPathD = maPoints.length > 0
    ? `M ${maPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`
    : "";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Map X coordinate to closest candle index
    const relativeX = x - paddingLeft;
    const index = Math.round((relativeX / chartWidth) * (candles.length - 1));
    const safeIndex = Math.max(0, Math.min(candles.length - 1, index));

    setHoveredCandle(candles[safeIndex]);
    setMousePos({ x: getX(safeIndex), y });
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setMousePos(null);
  };

  const currentHovered = hoveredCandle || candles[candles.length - 1];

  return (
    <div id="tech-chart-container" className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-xl" ref={containerRef}>
      {/* Top Legend Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-base font-bold text-blue-400 bg-blue-950/30 px-2.5 py-0.5 rounded border border-blue-900/40">{ticker}</span>
          <span className="text-xs text-slate-400">Biểu đồ Kỹ thuật 30 Phiên</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            Real-time (FireAnt Engine)
          </span>
        </div>
        <div className="flex gap-4 font-mono text-xs">
          <span className="text-slate-400">Mở: <strong className="text-white">{currentHovered.open}</strong></span>
          <span className="text-slate-400">Cao: <strong className="text-emerald-400">{currentHovered.high}</strong></span>
          <span className="text-slate-400">Thấp: <strong className="text-red-400">{currentHovered.low}</strong></span>
          <span className="text-slate-400">Đóng: <strong className={currentHovered.close >= currentHovered.open ? "text-emerald-400" : "text-red-400"}>{currentHovered.close}</strong></span>
          <span className="hidden sm:inline text-slate-400">Vol: <strong className="text-blue-400">{(currentHovered.volume / 1000000).toFixed(2)}M</strong></span>
        </div>
      </div>

      <div className="relative">
        <svg
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair select-none overflow-visible"
        >
          {/* Horizontal price gridlines */}
          {priceGridlines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={paddingLeft + chartWidth}
                y2={line.y}
                stroke="#1e293b"
                strokeWidth={1}
                strokeDasharray="2,2"
              />
              <text
                x={paddingLeft + chartWidth + 6}
                y={line.y + 4}
                fill="#64748b"
                fontSize={10}
                fontFamily="monospace"
                textAnchor="start"
              >
                {line.price}
              </text>
            </g>
          ))}

          {/* Draw volume bars at the bottom */}
          {candles.map((candle, idx) => {
            const barWidth = Math.max(1, (chartWidth / candles.length) * 0.5);
            const x = getX(idx) - barWidth / 2;
            const h = getVolHeight(candle.volume);
            const y = paddingTop + chartHeight - h;
            const isUp = candle.close >= candle.open;

            return (
              <rect
                key={`vol-${idx}`}
                x={x}
                y={y}
                width={barWidth}
                height={h}
                fill={isUp ? "#10b981" : "#ef4444"}
                opacity={0.17}
              />
            );
          })}

          {/* Candlesticks (Wick + Body) */}
          {candles.map((candle, idx) => {
            const isUp = candle.close >= candle.open;
            const color = isUp ? "#10b981" : "#ef4444";
            const x = getX(idx);
            
            // Coordinates
            const yHigh = getY(candle.high);
            const yLow = getY(candle.low);
            const yOpen = getY(candle.open);
            const yClose = getY(candle.close);
            
            const bodyY = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(1.5, Math.abs(yOpen - yClose));
            
            const barWidth = Math.max(2, (chartWidth / candles.length) * 0.6);

            return (
              <g key={`candle-${idx}`}>
                {/* Wick line */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={color}
                  strokeWidth={1.2}
                />
                {/* Body block */}
                <rect
                  x={x - barWidth / 2}
                  y={bodyY}
                  width={barWidth}
                  height={bodyHeight}
                  fill={isUp ? "transparent" : color}
                  stroke={color}
                  strokeWidth={1.5}
                  rx={0.5}
                />
              </g>
            );
          })}

          {/* Simple Moving Average Line (MA5) */}
          {maPathD && (
            <path
              d={maPathD}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeOpacity={0.8}
            />
          )}

          {/* Date Axis Labels (Show every 5 days for clarity) */}
          {candles.map((candle, idx) => {
            if (idx % 6 !== 0 && idx !== candles.length - 1) return null;
            const x = getX(idx);
            return (
              <g key={`date-${idx}`}>
                <line
                  x1={x}
                  y1={paddingTop + chartHeight}
                  x2={x}
                  y2={paddingTop + chartHeight + 4}
                  stroke="#334155"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={paddingTop + chartHeight + 16}
                  fill="#64748b"
                  fontSize={10}
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {candle.date}
                </text>
              </g>
            );
          })}

          {/* Crosshair & Interactivity HUD */}
          {mousePos && (
            <g>
              {/* Vertical dotted guide */}
              <line
                x1={mousePos.x}
                y1={paddingTop}
                x2={mousePos.x}
                y2={paddingTop + chartHeight}
                stroke="#64748b"
                strokeWidth={1}
                strokeDasharray="3,3"
                opacity={0.6}
              />
              {/* Horizontal dotted guide */}
              {mousePos.y >= paddingTop && mousePos.y <= paddingTop + chartHeight && (
                <line
                  x1={paddingLeft}
                  y1={mousePos.y}
                  x2={paddingLeft + chartWidth}
                  y2={mousePos.y}
                  stroke="#64748b"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                  opacity={0.6}
                />
              )}
            </g>
          )}
        </svg>

        {/* Legend Indicator label */}
        <div className="absolute right-16 top-2.5 flex items-center gap-1 font-mono text-[10px] text-blue-400 opacity-80 select-none">
          <span className="h-1 lg:w-3 border-b-2 border-blue-500"></span>
          <span>Đường giá MA(5)</span>
        </div>
      </div>
    </div>
  );
}
