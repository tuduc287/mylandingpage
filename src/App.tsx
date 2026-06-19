import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  BrainCircuit,
  Activity,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Lock,
  ExternalLink,
  Users
} from "lucide-react";
import StockDashboard from "./components/StockDashboard";
import TechnicalChart from "./components/TechnicalChart";
import LeadCaptureForm from "./components/LeadCaptureForm";
import AdminPanel from "./components/AdminPanel";
import AiAdvisor from "./components/AiAdvisor";
import { MarketSummary, FinancialNews, CommunityPost } from "./types";

export default function App() {
  // Application global states
  const [selectedTicker, setSelectedTicker] = useState("FPT");
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [activeHistory, setActiveHistory] = useState<any[]>([]);
  const [news, setNews] = useState<FinancialNews[]>([]);
  const [discussions, setDiscussions] = useState<CommunityPost[]>([]);
  const [adminMode, setAdminMode] = useState(false);
  
  // Toggles for triggers
  const [adminRefreshTrigger, setAdminRefreshTrigger] = useState(0);

  // References
  const leadSectionRef = useRef<HTMLDivElement>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);

  // Poll real-time stock quotes from Express server every 4 seconds
  const fetchMarketSummary = async () => {
    try {
      const resp = await fetch("/api/market-summary");
      if (resp.ok) {
        const data: MarketSummary = await resp.json();
        setMarketSummary(data);
      }
    } catch (e) {
      console.error("Market summary fetch failure.", e);
    }
  };

  // Fetch news, social posts
  const fetchFeeds = async () => {
    try {
      const resp = await fetch("/api/news-feed");
      if (resp.ok) {
        const data = await resp.json();
        setNews(data.news || []);
        setDiscussions(data.discussions || []);
      }
    } catch (e) {
      console.error("News feeds fetch failure.", e);
    }
  };

  // Fetch specific selected ticker detail & history
  const fetchTickerDetail = async (symbol: string) => {
    try {
      const resp = await fetch(`/api/stock/${symbol}`);
      if (resp.ok) {
        const data = await resp.json();
        setActiveHistory(data.history || []);
      }
    } catch (e) {
      console.error(`Error loading history for ${symbol}`, e);
    }
  };

  // Submissions state trigger
  const handleLeadSubmitted = () => {
    // Increment the refresh counter to trigger Admin panel state refetch
    setAdminRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Initial fetch
    fetchMarketSummary();
    fetchFeeds();
  }, []);

  // Fetch active history whenever chosen ticker pivots
  useEffect(() => {
    fetchTickerDetail(selectedTicker);
  }, [selectedTicker]);

  // Periodic polling for real-time market ticket changes
  useEffect(() => {
    const timer = setInterval(fetchMarketSummary, 4500);
    return () => clearInterval(timer);
  }, []);

  const scrollToLeadSection = () => {
    if (leadSectionRef.current) {
      leadSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const triggerSearchAnalysis = (symbol: string) => {
    setSelectedTicker(symbol);
    if (aiSectionRef.current) {
      aiSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 selection:bg-blue-600 selection:text-slate-100 overflow-x-hidden font-sans pb-16">
      
      {/* 1. TOP RUNNING TAPE (BĂNG CHẠY THÔNG TIN CHỨNG KHOÁN) */}
      <div className="w-full bg-[#090d16] border-b border-slate-900 py-2 overflow-hidden select-none font-mono text-[11px]">
        <div className="flex animate-marquee whitespace-nowrap gap-12 text-slate-400 items-center">
          {marketSummary?.stocks.map((stock) => {
            const isUp = stock.changePercent >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => setSelectedTicker(stock.symbol)}
                className="inline-flex items-center gap-1.5 cursor-pointer hover:bg-slate-950 px-2 py-0.5 rounded transition-colors"
              >
                <span className="font-bold text-slate-100">{stock.symbol}</span>
                <span className="text-[10px] text-slate-500">{(stock.price * 1000).toLocaleString()}</span>
                <span className={`flex items-center font-bold text-[10px] ${isUp ? "text-emerald-400" : "text-rose-500"}`}>
                  {isUp ? "▲" : "▼"} {Math.abs(stock.changePercent)}%
                </span>
              </div>
            );
          })}
          {/* Duplicate to ensure fluent visual infinite scroll loop */}
          {marketSummary?.stocks.map((stock) => {
            const isUp = stock.changePercent >= 0;
            return (
              <div
                key={`${stock.symbol}-dup`}
                onClick={() => setSelectedTicker(stock.symbol)}
                className="hidden md:inline-flex items-center gap-1.5 cursor-pointer hover:bg-slate-950 px-2 py-0.5 rounded transition-colors"
              >
                <span className="font-bold text-slate-100">{stock.symbol}</span>
                <span className="text-[10px] text-slate-500">{(stock.price * 1000).toLocaleString()}</span>
                <span className={`flex items-center font-bold text-[10px] ${isUp ? "text-emerald-400" : "text-rose-500"}`}>
                  {isUp ? "▲" : "▼"} {Math.abs(stock.changePercent)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. HERO HIGHLIGHT ZONE */}
      <header className="relative w-full max-w-7xl mx-auto px-4 pt-8 pb-12 text-center lg:text-left">
        {/* Absolute Glowing Orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none lg:left-1/4"></div>
        <div className="absolute bottom-0 right-10 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mx-auto lg:mx-0">
              <Award className="h-3.5 w-3.5 animate-pulse" />
              <span>Nền Tảng Phân Tích Dữ Liệu FireAnt VIP Q2/2026</span>
            </div>

            {/* Main Catchy Heading */}
            <h1 className="font-sans text-3.5xl font-extrabold tracking-tight text-white leading-tight sm:text-4xl md:text-5xl lg:max-w-2xl">
              Xác Định Điểm Mua Chân Sóng Kỹ Thuật Với <span className="text-gradient bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Gemini AI</span>
            </h1>
            
            <p className="max-w-xl text-sm leading-relaxed text-slate-400 font-sans mx-auto lg:mx-0">
              Rút ngắn 90% thời gian phân tích thị trường chứng khoán Việt Nam. Kết nối tự động dữ liệu bảng giá, tin vĩ mô và phân tích cơ cấu tài chính doanh nghiệp tức thì, đưa ra lệnh kiến nghị hiệu suất cao.
            </p>

            {/* Visual Stats Block */}
            <div className="grid grid-cols-3 gap-4 pt-3 max-w-md font-sans mx-auto lg:mx-0">
              <div className="text-left border-l border-blue-500/40 pl-3">
                <p className="text-base font-extrabold text-white">96.8%</p>
                <p className="text-[10px] text-slate-500">Khách phát sinh lead hài lòng</p>
              </div>
              <div className="text-left border-l border-blue-500/40 pl-3">
                <p className="text-base font-extrabold text-white">2.5 giây</p>
                <p className="text-[10px] text-slate-500">Quét bot mã kĩ thuật</p>
              </div>
              <div className="text-left border-l border-emerald-500/40 pl-3">
                <p className="text-base font-extrabold text-white">0 đồng</p>
                <p className="text-[10px] text-slate-500">Cấp tài khoản trải nghiệm VIP</p>
              </div>
            </div>

            {/* Quick Actions buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 font-sans">
              <button
                onClick={scrollToLeadSection}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-600 transform transition active:scale-95 shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                Đăng Ký Nhận Lệnh Vip Chi Tiết <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => {
                  if (aiSectionRef.current) {
                    aiSectionRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white cursor-pointer"
              >
                Thử Với Gemini AI Advisor
              </button>
            </div>
          </div>

          {/* Right illustration / interactive metrics */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent z-10"></div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 backdrop-blur-md shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-sans">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-slate-400">Lệnh Đầu Tư VIP Gần Nhất</span>
                </div>
                <span className="font-mono text-[10px] text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded font-bold">Bot Tín Hiệu</span>
              </div>

              {[
                { s: "FPT", p: "145.8", change: "+14.6%", action: "MUA TÍCH LŨY", color: "text-emerald-400" },
                { s: "TCB", p: "24.6", change: "+22.5%", action: "TIẾP TỤC ÔM KHÓA", color: "text-emerald-400" },
                { s: "VND", p: "15.4", change: "-2.3%", action: "CẢNH BÁO CHỐT QUAN SÁT", color: "text-blue-400" }
              ].map((rec, i) => (
                <div key={i} className="flex items-center justify-between gap-2 font-mono text-xs border-b border-slate-900/50 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-blue-400 border border-blue-900/30 font-extrabold px-1.5 py-0.5 rounded text-[10px]">{rec.s}</span>
                    <span className="text-slate-300">{rec.p}k</span>
                  </div>
                  <span className={`font-bold ${rec.color}`}>{rec.change}</span>
                  <span className="text-[10px] rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-slate-400 font-sans">{rec.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 3. MAIN WORKSPACE / SECTIONS */}
      <main className="w-full max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (60% width) - Interactive Board, Charts, AI counselor */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Real-time Ticker Grid List & Feeds */}
          <section id="market-section">
            <div className="mb-4 flex items-center justify-between font-sans">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" /> Bảng Giá Chứng Khoán Phân Khúc (Thực tế FireAnt)
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">Tự động làm mới mỗi 4.5 giây</span>
            </div>
            
            <StockDashboard
              selectedTicker={selectedTicker}
              onTickerSelect={setSelectedTicker}
              onRunAiAnalysis={triggerSearchAnalysis}
              news={news}
              discussions={discussions}
              marketSummary={marketSummary}
              onRefresh={fetchMarketSummary}
            />
          </section>

          {/* Candlestick Technical Chart */}
          <section id="chart-section">
            <div className="mb-4 font-sans">
              <h2 className="text-lg font-bold text-white">Biểu đồ Kỹ thuật Tích hợp</h2>
              <p className="text-xs text-slate-500">Quét hành vi biến động giá và khối lượng giao dịch. Click vào danh sách bảng giá bên trên để đổi mã.</p>
            </div>
            <TechnicalChart
              candles={activeHistory}
              ticker={selectedTicker}
            />
          </section>

          {/* AI Advisor Chat Column */}
          <section id="ai-advisor-section" ref={aiSectionRef}>
            <div className="mb-4 font-sans">
              <h2 className="text-lg font-bold text-white">Trợ Lý Phân Tích Kỹ Thuật AI</h2>
              <p className="text-xs text-slate-500">Tính toán cấu trúc tỷ lệ RSI, định giá P/E để ra khuyến nghị hành động tối ưu cho vốn đầu tư của bạn.</p>
            </div>
            <AiAdvisor
              ticker={selectedTicker}
              onLeadScroll={scrollToLeadSection}
            />
          </section>

        </div>

        {/* RIGHT COLUMN (40% width) - Lead Capture Sidebar + Admin Tool */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* High Conversion Lead capture form */}
          <section id="lead-capture-section" ref={leadSectionRef} className="lg:sticky lg:top-6 z-20">
            <LeadCaptureForm
              initialTicker={selectedTicker}
              onLeadSubmitted={handleLeadSubmitted}
            />
          </section>

          {/* Security details & support */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-5 font-sans space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" /> Cam Kết Bảo Mật Thông Tin
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-500 leading-relaxed list-inside">
              <li>• Mã hóa 100% tệp Lead đăng ký, chỉ gửi trực tiếp về hệ thống CSKH.</li>
              <li>• Tuyệt đối không spam hoặc rò rỉ dữ liệu tài khoản Zalo.</li>
              <li>• Hỗ trợ hướng dẫn cơ cấu danh mục an toàn trong vòng 24 giờ.</li>
            </ul>
          </div>

          {/* Quick toggle to show collected leads for demonstration (Admin panel) */}
          <div className="rounded-xl border border-dashed border-slate-800/80 p-4 font-sans text-center">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-indigo-400" /> Chế độ Trưởng phòng (Admin Leads)
              </span>
              <button
                onClick={() => setAdminMode(!adminMode)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  adminMode ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {adminMode ? "ĐÓNG PANEL" : "XEM LEADS"}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 text-left leading-relaxed">
              Dành riêng cho Tuduc287@gmail.com để theo dõi, xóa, lọc tỉ lệ phân bố vốn, và xuất file CSV sang Excel!
            </p>
          </div>

        </div>

      </main>

      {/* 4. SEPARATED BOTTOM ADMIN PANEL TABLE VIEW (FULLWIDTH WIDTH CONSTRAINED) */}
      {adminMode && (
        <section className="w-full max-w-7xl mx-auto px-4 mt-12 transition-all">
          <AdminPanel
            updateTrigger={adminRefreshTrigger}
            onRefresh={fetchMarketSummary}
          />
        </section>
      )}

    </div>
  );
}
