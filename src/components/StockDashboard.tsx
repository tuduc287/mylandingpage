import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, Search, BrainCircuit, Sparkles, MessageSquare, Flame } from "lucide-react";
import { StockData, MarketSummary, FinancialNews, CommunityPost } from "../types";

interface StockDashboardProps {
  selectedTicker: string;
  onTickerSelect: (symbol: string) => void;
  onRunAiAnalysis: (symbol: string) => void;
  news: FinancialNews[];
  discussions: CommunityPost[];
  marketSummary: MarketSummary | null;
  onRefresh: () => void;
}

export default function StockDashboard({
  selectedTicker,
  onTickerSelect,
  onRunAiAnalysis,
  news,
  discussions,
  marketSummary,
  onRefresh
}: StockDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "high-cap" | "tech" | "bank-sec">("all");
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});

  // Monitor stock prices changes to trigger beautiful fleeting highlight anim rings (flash green on rise, red on drop)
  useEffect(() => {
    if (!marketSummary?.stocks) return;
    const currentPrices: Record<string, number> = {};
    marketSummary.stocks.forEach((s) => {
      currentPrices[s.symbol] = s.price;
    });

    // Save previous prices state
    setPrevPrices((prev) => {
      const merged = { ...prev };
      Object.keys(currentPrices).forEach((k) => {
        if (prev[k] !== undefined && prev[k] !== currentPrices[k]) {
          // Keep it brief, just record the old price
        }
        merged[k] = currentPrices[k];
      });
      return merged;
    });
  }, [marketSummary]);

  if (!marketSummary) {
    return (
      <div id="dashboard-loading" className="flex h-[400px] flex-col items-center justify-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/30 text-slate-400">
        <Activity className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm font-semibold">Đang đồng bộ dữ liệu Hệ thống Bảng giá FireAnt...</p>
      </div>
    );
  }

  const { indexes, stocks } = marketSummary;

  // Filter stocks based on group tabs
  const filteredStocks = stocks.filter((s) => {
    // Search filter
    const matchesSearch = s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.companyName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Segment tabs
    if (activeCategory === "high-cap") return s.marketCap > 100000;
    if (activeCategory === "tech") return s.symbol === "FPT" || s.symbol === "MWG" || s.symbol === "DGC";
    if (activeCategory === "bank-sec") return s.symbol === "SSI" || s.symbol === "TCB" || s.symbol === "VCB" || s.symbol === "VND";
    return true; // "all"
  });

  // Calculate market stats
  const bullishCount = stocks.filter((s) => s.changePercent > 0).length;
  const bearishCount = stocks.filter((s) => s.changePercent < 0).length;

  return (
    <div id="stock-dashboard-section" className="space-y-6">
      {/* 4 Index Grid Panels */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 font-mono">
        {[
          { name: "VN-INDEX", val: indexes.VNINDEX, bg: "from-indigo-950/20 to-indigo-900/5" },
          { name: "VN30-INDEX", val: indexes.VN30, bg: "from-blue-950/20 to-blue-900/5" },
          { name: "HNX-INDEX", val: indexes.HNXINDEX, bg: "from-slate-950/30 to-slate-900/5" },
          { name: "UPCOM-INDEX", val: indexes.UPINDEX, bg: "from-purple-950/20 to-purple-900/5" }
        ].map((item) => {
          const isUp = item.val.change >= 0;
          return (
            <div
              key={item.name}
              className={`rounded-xl border border-slate-800/80 bg-gradient-to-br ${item.bg} p-3.5 shadow-md flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{item.name}</span>
                <span className={`flex items-center text-[10px] font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                  {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {item.val.percent > 0 ? "+" : ""}{item.val.percent}%
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-white">{item.val.price}</span>
                <span className={`text-[11px] font-bold ${isUp ? "text-emerald-500" : "text-red-500"}`}>
                  {isUp ? "+" : ""}{item.val.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Stock Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/35 p-4 lg:p-6 shadow-xl backdrop-blur-sm">
        {/* Filter controls */}
        <div className="flex flex-col gap-4 border-b border-slate-800/70 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 font-sans">
            {[
              { id: "all", label: "Tất cả cổ phiếu" },
              { id: "high-cap", label: "Vốn hóa lớn (Vn30)" },
              { id: "tech", label: "Công nghệ & Hóa chất" },
              { id: "bank-sec", label: "Tài chính (Bank - Chứng)" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search tool */}
          <div className="relative flex items-center bg-slate-950/80 rounded-xl border border-slate-800 px-3 py-1.5 md:w-64 font-sans">
            <Search className="h-4 w-4 text-slate-500 absolute left-3" />
            <input
              type="text"
              placeholder="Tìm kiếm mã cổ phiếu..."
              className="bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-none w-full pl-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Real-time Tickers Grid */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800/70 text-slate-400 pb-3 font-semibold">
                <th className="p-3 text-left">Mã CK</th>
                <th className="p-3">Tên Doanh Nghiệp</th>
                <th className="p-3 text-right">Thị Giá (vNĐ)</th>
                <th className="p-3 text-right">Biến động</th>
                <th className="p-3 text-right">Cao / Thấp</th>
                <th className="p-3 text-right">Tổng Vol</th>
                <th className="p-3 text-center">Tín Hiệu Bot</th>
                <th className="p-3 text-right">Phân tích AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredStocks.map((stock) => {
                const isSelected = selectedTicker === stock.symbol;
                const isPositive = stock.changePercent >= 0;
                
                // Color flash helper if prices changed
                const prevPrice = prevPrices[stock.symbol];
                const deltaChange = prevPrice !== undefined ? stock.price - prevPrice : 0;
                
                let flashBorder = "border-transparent";
                if (deltaChange > 0) flashBorder = "bg-emerald-950/20 text-emerald-300 ring-1 ring-emerald-500/50";
                if (deltaChange < 0) flashBorder = "bg-red-950/20 text-red-300 ring-1 ring-red-500/50";

                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => onTickerSelect(stock.symbol)}
                    className={`transition-colors duration-150 cursor-pointer ${
                      isSelected ? "bg-blue-600/10 hover:bg-blue-600/15" : "hover:bg-slate-800/30"
                    }`}
                  >
                    {/* Ticker Symbol */}
                    <td className="p-3 text-left font-bold text-white relative">
                      <div className="flex items-center gap-1.5">
                        {isSelected && <span className="absolute left-0 top-3 h-5 w-1 rounded-r bg-blue-500"></span>}
                        <span className="text-blue-400">{stock.symbol}</span>
                      </div>
                    </td>

                    {/* Company name */}
                    <td className="p-3 text-slate-400 font-sans font-medium truncate max-w-[140px] md:max-w-none">
                      {stock.companyName}
                    </td>

                    {/* Price with flash effect */}
                    <td className={`p-3 text-right font-bold transition-all duration-300 ${flashBorder}`}>
                      {(stock.price * 1000).toLocaleString("vi-VN")}
                    </td>

                    {/* Change columns */}
                    <td className={`p-3 text-right font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                      <div className="flex flex-col items-end">
                        <span>{isPositive ? "+" : ""}{stock.change}</span>
                        <span className="text-[10px] opacity-80">{isPositive ? "+" : ""}{stock.changePercent}%</span>
                      </div>
                    </td>

                    {/* High/Low */}
                    <td className="p-3 text-right text-slate-400">
                      <div className="flex items-center justify-end gap-1.5 font-mono text-[10px]">
                        <span className="text-emerald-500">{stock.high}</span>
                        <span>/</span>
                        <span className="text-red-400">{stock.low}</span>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="p-3 text-right font-medium text-slate-300">
                      {stock.volume.toLocaleString("vi-VN")}
                    </td>

                    {/* Trading recommendation warning lights */}
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        stock.recommendation === "MUA MẠNH" ? "bg-emerald-500 text-emerald-950" :
                        stock.recommendation === "MUA" ? "bg-emerald-500/15 text-emerald-400" :
                        stock.recommendation === "THEO DÕI" ? "bg-slate-800 text-slate-400" :
                        "bg-red-500/15 text-red-500"
                      }`}>
                        {stock.recommendation}
                      </span>
                    </td>

                    {/* AI trigger CTA */}
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRunAiAnalysis(stock.symbol);
                        }}
                        className="flex items-center gap-1 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 hover:from-teal-500/30 hover:to-indigo-500/30 text-teal-300 font-sans text-[10px] font-bold px-2 py-1.5 rounded-lg border border-teal-500/35 hover:border-teal-400 selection:bg-none transition-all cursor-pointer"
                      >
                        <BrainCircuit className="h-3.5 w-3.5 animate-pulse" /> AI khuyên lệnh
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-Column Social Feed & News stream like fireant */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Financial News */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 font-sans">
              <Flame className="h-4.5 w-4.5 text-blue-500" /> Bảng Tin Nóng FireAnt
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Tin vĩ mô Q2</span>
          </div>

          <div className="divide-y divide-slate-800/40 space-y-4">
            {news.map((item, idx) => (
              <div key={item.id} className={`pt-4 first:pt-0 space-y-2`}>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span className="font-semibold text-blue-400/90">{item.source}</span>
                  <span className="font-mono">{item.time}</span>
                </div>
                <h4 className="text-xs font-bold font-sans text-slate-200 hover:text-blue-400 cursor-pointer transition-colors leading-relaxed">
                  {item.title}
                </h4>
                <p className="text-[11px] font-sans text-slate-400 leading-relaxed max-w-prose">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Community Post */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 font-sans">
              <MessageSquare className="h-4.5 w-4.5 text-indigo-400" /> Nhịp đập Cộng Đồng F319
            </h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Đang thảo luận sôi nổi</span>
          </div>

          <div className="space-y-4">
            {discussions.map((post) => (
              <div key={post.id} className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3 h-auto space-y-2 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${post.avatarColor}`}>
                      {post.author[0]}
                    </span>
                    <span className="font-semibold text-slate-200">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span className="bg-slate-800 text-blue-400 font-bold px-1.5 py-0.5 rounded">{post.ticker}</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded ${
                      post.sentiment === "BULLISH" ? "bg-emerald-500/10 text-emerald-400" :
                      post.sentiment === "BEARISH" ? "bg-red-500/10 text-red-500" :
                      "bg-slate-800 text-slate-400"
                    }`}>
                      {post.sentiment === "BULLISH" ? "BULL" : post.sentiment === "BEARISH" ? "BEAR" : "HOLD"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{post.content}</p>
                <div className="flex justify-between text-[10px] text-slate-600 pt-1 font-mono border-t border-slate-900/40">
                  <span>👍 {post.likes} Thích</span>
                  <span>💬 {post.commentsCount} Bình luận</span>
                  <span>{post.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
