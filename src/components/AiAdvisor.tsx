import React, { useState } from "react";
import { BrainCircuit, Loader2, Sparkles, AlertCircle, ArrowDown, HelpCircle, ArrowRight } from "lucide-react";

interface AiAdvisorProps {
  ticker: string;
  onLeadScroll: () => void;
}

export default function AiAdvisor({ ticker, onLeadScroll }: AiAdvisorProps) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [currentTicker, setCurrentTicker] = useState("");

  const handleRunAnalysis = async () => {
    setLoading(true);
    setAnalysis("");
    setCurrentTicker(ticker);

    try {
      const resp = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: ticker,
          userProfile: {
            capital: "100 - 500 triệu",
            risk: "Cân bằng"
          }
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setAnalysis(data.analysis || "Không nhận được phản hồi từ AI.");
        setIsFallback(data.isFallback || false);
      } else {
        setAnalysis("Có lỗi xuất hiện khi gọi dịch vụ AI. Vui lòng gửi lại.");
      }
    } catch (e) {
      setAnalysis("Lỗi mạng bất ngờ. Vui lòng chụp lại thông tin và chụp gửi sau.");
    } finally {
      setLoading(false);
    }
  };

  // Turn linebreaks into bullet blocks or styled paragraphs to bypass react-markdown dependency
  const renderFormattedText = (text: string) => {
    return text.split("\n\n").map((para, paraIdx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Check if it's a list item starting with dash or bullet
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const listItems = trimmed.split("\n").map((li, liIdx) => {
          const cleanLi = li.replace(/^[\-\*\s]+/, "");
          return (
            <li key={liIdx} className="ml-5 list-disc text-xs text-slate-300 leading-relaxed font-sans pb-1.5 capitalize">
              {cleanLi}
            </li>
          );
        });
        return <ul key={paraIdx} className="mb-4">{listItems}</ul>;
      }

      // Check if it's a sub-header (e.g. 1. **Title** or ### Title)
      if (trimmed.match(/^\d+\./) || trimmed.startsWith("###") || trimmed.startsWith("**")) {
        const cleanHeader = trimmed.replace(/^[\d\.\#\*\s]+/, "").split("**").join("");
        return (
          <h4 key={paraIdx} className="text-sm font-bold text-blue-400 font-sans mt-3.5 mb-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            {cleanHeader}
          </h4>
        );
      }

      // Normal paragraph
      const formattedPara = trimmed.split("**").map((chunk, chunkIdx) => {
        return chunkIdx % 2 === 1 ? <strong key={chunkIdx} className="text-white font-semibold">{chunk}</strong> : chunk;
      });

      return (
        <p key={paraIdx} className="mb-3.5 text-xs text-slate-300 leading-relaxed font-sans">
          {formattedPara}
        </p>
      );
    });
  };

  return (
    <div id="ai-advisor-panel" className="rounded-2xl border border-slate-800 bg-slate-900/35 p-5 shadow-xl backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
            <BrainCircuit className="h-4.5 w-4.5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-1">
              AI Khuyên Lệnh <span className="text-[10px] text-teal-400 font-mono font-extrabold bg-teal-950 px-1.5 py-0.5 rounded ml-1 animate-pulse">2.5s</span>
            </h3>
            <p className="text-[10px] text-slate-500">Trí tuệ nhân tạo Gemini 3.5 phân tích tức thì</p>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 min-h-[32px] text-white text-xs font-bold px-4 py-1.5 rounded-lg border border-blue-500 active:scale-95 transition-all select-none disabled:opacity-50 flex items-center gap-1 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tính toán...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" /> Phân tích {ticker}
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-3.5 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-300 animate-pulse">Mô hình AI đang thẩm định mã {ticker}...</p>
            <p className="text-[10px] text-slate-500">Đối chiếu bảng định giá P/E chuyên sâu & vị thế chỉ báo RSI(14)</p>
          </div>
        </div>
      )}

      {!loading && !analysis && (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
          <HelpCircle className="h-7 w-7 text-slate-600" />
          <p className="text-xs font-bold text-slate-400 font-sans">Chưa có kết quả báo cáo mới cho {ticker}</p>
          <p className="text-[10px] text-slate-600 max-w-xs leading-relaxed">
            Nhấp nút <strong className="text-slate-400">Phân tích {ticker}</strong> ở phía trên để AI tiến hành quét cơ cấu tài chính và lập lệnh khuyến nghị.
          </p>
        </div>
      )}

      {!loading && analysis && (
        <div className="space-y-4">
          {/* Metadata report banner */}
          <div className="flex items-center justify-between bg-blue-950/10 border border-blue-900/30 rounded-lg p-2.5 text-[10px]">
            <span className="text-slate-400">Báo cáo: Mã <strong className="text-blue-400 font-mono">{currentTicker}</strong></span>
            {isFallback ? (
              <span className="text-blue-400 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Offline Tech Analysis fallbacks
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                ● Connected to Gemini-3.5-Engine
              </span>
            )}
          </div>

          {/* Rendered textual output */}
          <div className="border border-slate-800/60 rounded-xl bg-slate-950/45 p-4 overflow-y-auto max-h-[320px] scrollbar-thin scrollbar-thumb-slate-800 select-text">
            {renderFormattedText(analysis)}
          </div>

          {/* Sub CTA box to register lead */}
          <div className="rounded-xl bg-gradient-to-r from-blue-500/10 via-slate-500/5 to-transparent border border-blue-500/20 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left font-sans shadow-md">
            <div>
              <p className="text-xs font-bold text-blue-400 flex items-center gap-1">
                🎁 Tải File Excel Định Giá VIP của {currentTicker}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Nhận điểm báo mua/bán chi tiết trực tiếp qua tin nhắn SMS/Zalo tức thì.
              </p>
            </div>
            
            <button
              onClick={onLeadScroll}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1 select-none font-sans shadow-lg shadow-blue-500/20"
            >
              Nhận Báo Cáo <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
