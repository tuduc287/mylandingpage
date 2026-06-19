import React, { useState, useEffect } from "react";
import { Users, Trash2, Download, RefreshCw, BarChart3, Search, Calendar, Landmark, HelpCircle, CheckCircle } from "lucide-react";
import { Lead } from "../types";

interface AdminPanelProps {
  updateTrigger: number;
  onRefresh: () => void;
}

export default function AdminPanel({ updateTrigger, onRefresh }: AdminPanelProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (e) {
      console.error("Error fetching leads on client", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [updateTrigger]);

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lead này?")) return;
    try {
      const res = await fetch("/api/leads/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchLeads();
        onRefresh();
      }
    } catch (e) {
      alert("Không thể xóa lead.");
    }
  };

  const handleResetLeads = async () => {
    try {
      const res = await fetch("/api/leads/reset", { method: "POST" });
      if (res.ok) {
        fetchLeads();
        setConfirmDeleteAll(false);
        onRefresh();
      }
    } catch (e) {
      alert("Không thể làm trống danh sách.");
    }
  };

  const filteredLeads = leads.filter(l => {
    const q = searchQuery.toLowerCase();
    return (
      l.fullName.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.interestedTicker.toLowerCase().includes(q)
    );
  });

  // Analytics calculator helpers
  const totalLeads = leads.length;
  
  // Calculate distribution of capital sizes
  const capitalDistribution: Record<string, number> = {};
  leads.forEach(l => {
    const key = l.investmentAmount || "Chưa xác định";
    capitalDistribution[key] = (capitalDistribution[key] || 0) + 1;
  });

  // Calculate most requested tickers
  const tickerDistribution: Record<string, number> = {};
  leads.forEach(l => {
    const key = l.interestedTicker?.toUpperCase() || "Tổng quan";
    tickerDistribution[key] = (tickerDistribution[key] || 0) + 1;
  });

  // Risk profile numbers
  const riskDistribution: Record<string, number> = {};
  leads.forEach(l => {
    const key = l.riskTolerance || "Cân bằng";
    riskDistribution[key] = (riskDistribution[key] || 0) + 1;
  });

  return (
    <div id="admin-panel" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md shadow-xl">
      {/* Top action header */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/10 text-blue-400">
              <Users className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Trình Quản Trị Hệ Thống</span>
          </div>
          <h2 className="text-xl font-bold font-sans text-white">Quản Lý Lead Đăng Ký Tư Vấn ({filteredLeads.length}/{totalLeads})</h2>
          <p className="text-xs text-slate-400">Bộ phận sale, phân tích & CSKH theo dõi lịch sử thông tin lead thời gian thực.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-sans">
          <button
            onClick={() => setActiveTab(activeTab === "list" ? "analytics" : "list")}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {activeTab === "list" ? (
              <>
                <BarChart3 className="h-3.5 w-3.5" /> Thống kê phân loại
              </>
            ) : (
              <>
                <Users className="h-3.5 w-3.5" /> Danh sách Lead
              </>
            )}
          </button>

          <a
            href="/api/leads/export"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Xuất Excel (CSV)
          </a>

          <button
            onClick={fetchLeads}
            className="flex h-8 w-8 items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg cursor-pointer"
            title="Tải lại thủ công"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>
      </div>

      {activeTab === "list" ? (
        <div className="space-y-4 mt-5">
          {/* Search Filter Header */}
          <div className="flex items-center gap-2 relative bg-slate-950/60 rounded-xl border border-slate-800/80 px-3 py-1.5 max-w-md">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              className="bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-none w-full"
              placeholder="Tìm theo Tên, Số điện thoại, Mã cổ phiếu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-white text-[10px]">
                Xóa
              </button>
            )}
          </div>

          {/* Table representation */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
            {filteredLeads.length > 0 ? (
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                    <th className="p-3">Họ và Tên</th>
                    <th className="p-3">Số ĐT Zalo</th>
                    <th className="p-3">Email</th>
                    <th className="p-3 text-center">Khẩu Vị Rủi Ro</th>
                    <th className="p-3 text-right">Quy Mô Vốn</th>
                    <th className="p-3 text-center">Mã Quan Tâm</th>
                    <th className="p-3 max-w-[150px] truncate">Ghi Chú</th>
                    <th className="p-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="text-slate-300 hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        {lead.fullName}
                      </td>
                      <td className="p-3 font-mono font-medium text-blue-400">{lead.phone}</td>
                      <td className="p-3 text-slate-400">{lead.email}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          lead.riskTolerance.includes("An toàn") ? "bg-emerald-500/10 text-emerald-400" :
                          lead.riskTolerance.includes("Cân bằng") ? "bg-blue-500/10 text-blue-400" :
                          "bg-purple-500/10 text-purple-400"
                        }`}>
                          {lead.riskTolerance}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">{lead.investmentAmount}</td>
                      <td className="p-3 text-center">
                        <span className="font-mono bg-blue-950/40 text-blue-400 border border-blue-900/30 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          {lead.interestedTicker}
                        </span>
                      </td>
                      <td className="p-3 max-w-[150px] truncate text-slate-400 italic" title={lead.notes}>
                        {lead.notes || "Trống"}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                          title="Xóa Lead này"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                <HelpCircle className="h-8 w-8 text-slate-600 animate-pulse" />
                <p className="text-xs font-semibold">Không tìm thấy thông tin Lead phù hợp.</p>
                <p className="text-[10px] text-slate-600">Đăng ký thêm thông tin lấy lead ở biểu mẫu bên cạnh để hiển thị dữ liệu.</p>
              </div>
            )}
          </div>

          {/* Danger zone clean reset */}
          {!confirmDeleteAll ? (
            <button
              onClick={() => setConfirmDeleteAll(true)}
              className="text-[10px] font-semibold text-red-500/75 hover:text-red-400 underline cursor-pointer hover:no-underline"
            >
              Reset làm trống toàn bộ cơ sở dữ liệu Lead
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-red-950/20 border border-red-900/40 rounded-lg p-3 max-w-md">
              <span className="text-xs text-red-400 font-semibold font-sans">Xóa vĩnh viễn toàn bộ leads?</span>
              <button onClick={handleResetLeads} className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer">Xác Nhận XóA</button>
              <button onClick={() => setConfirmDeleteAll(false)} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded cursor-pointer">Hủy</button>
            </div>
          )}
        </div>
      ) : (
        /* ANALYTICS TAB DESIGN */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 font-sans">
          {/* Capital Distribution Block */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Landmark className="h-3.5 w-3.5 text-blue-400" /> Phân Loại Theo Quy Mô Vốn
            </h3>
            <div className="space-y-2.5">
              {Object.keys(capitalDistribution).length > 0 ? (
                Object.entries(capitalDistribution).map(([amt, count]) => {
                  const percent = ((count / totalLeads) * 100).toFixed(0);
                  return (
                    <div key={amt} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-medium">{amt}</span>
                        <span className="font-mono text-blue-400 font-bold">{count} leads ({percent}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-50 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-slate-600">Chưa có số liệu thống kê.</p>
              )}
            </div>
          </div>

          {/* Risk preference classification */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5 text-blue-400" /> Bản Lĩnh Đầu Tư
            </h3>
            <div className="space-y-2.5">
              {Object.keys(riskDistribution).length > 0 ? (
                Object.entries(riskDistribution).map(([risk, count]) => {
                  const percent = ((count / totalLeads) * 100).toFixed(0);
                  return (
                    <div key={risk} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-medium">{risk}</span>
                        <span className="font-mono text-blue-400 font-bold">{count} ({percent}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-slate-600">Chưa có số liệu thống kê.</p>
              )}
            </div>
          </div>

          {/* Popular stock symbol analytics */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Cổ Phiếu Được Quan Tâm Nhất
            </h3>
            <div className="space-y-2.5">
              {Object.keys(tickerDistribution).length > 0 ? (
                Object.entries(tickerDistribution).map(([tk, count]) => {
                  const percent = ((count / totalLeads) * 100).toFixed(0);
                  return (
                    <div key={tk} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-emerald-400 font-extrabold bg-emerald-950/50 px-1 rounded">{tk}</span>
                        <span className="font-mono text-slate-300">{count} lượt ({percent}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-slate-600">Chưa có số liệu thống kê.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
