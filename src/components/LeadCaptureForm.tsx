import React, { useState, useEffect } from "react";
import { Sparkles, Phone, User, Mail, DollarSign, Target, Gift, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface LeadCaptureFormProps {
  initialTicker?: string;
  onLeadSubmitted?: () => void;
}

export default function LeadCaptureForm({ initialTicker = "Tổng quan", onLeadSubmitted }: LeadCaptureFormProps) {
  // Fields state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [riskTolerance, setRiskTolerance] = useState("Cân bằng");
  const [investmentAmount, setInvestmentAmount] = useState("100 - 500 triệu");
  const [interestedTicker, setInterestedTicker] = useState("");
  const [notes, setNotes] = useState("");

  // UI Flow state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync initial ticker selection
  useEffect(() => {
    if (initialTicker) {
      setInterestedTicker(initialTicker);
    }
  }, [initialTicker]);

  const validateStep1 = () => {
    if (!fullName.trim()) {
      setErrorMsg("Vui lòng điền Họ và tên.");
      return false;
    }
    const cleanPhone = phone.replace(/[\s\.\-\(\)]/g, "");
    if (!phone.trim()) {
      setErrorMsg("Vui lòng điền Số điện thoại (Zalo).");
      return false;
    }
    if (cleanPhone.length < 9 || cleanPhone.length > 11) {
      setErrorMsg("Số điện thoại không hợp lệ (yêu cầu từ 9 đến 11 chữ số).");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const resp = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          riskTolerance,
          investmentAmount,
          interestedTicker: interestedTicker.toUpperCase() || "Tổng quan",
          notes
        })
      });

      const resJson = await resp.json();
      if (resp.ok && resJson.success) {
        setSuccess(true);
        if (onLeadSubmitted) onLeadSubmitted();
      } else {
        setErrorMsg(resJson.error || "Có lỗi bất ngờ xảy ra khi gửi thông tin.");
      }
    } catch (err) {
      setErrorMsg("Lỗi kết nối máy chủ. Vui lòng kiểm tra và thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  return (
    <div id="lead-form-wrapper" className="relative h-full overflow-hidden rounded-2xl bg-white p-6 shadow-2xl lg:p-8">
      {/* Decorative Gradient Flare */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

      {!success ? (
        <form onSubmit={handleSubmit} className="flex h-full flex-col justify-between space-y-5">
          {/* Header Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Ưu đãi độc quyền</span>
            </div>
            <h3 className="font-sans text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">
              Nhận Khuyến Nghị Lệnh Tự Động & Báo Cáo Phân Tích Vip
            </h3>
            <p className="mt-2 text-sm text-slate-550 leading-relaxed">
              Nhập thông tin phân tích để được liên kết Zalo cùng Quản lý tài khoản, đồng thời tặng kèm bộ cẩm nang VIP Trading Q2/2026.
            </p>
          </div>

          {/* Progress Tracker Bar */}
          <div className="flex items-center gap-2">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 1 ? "bg-blue-600" : "bg-slate-200"}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 2 ? "bg-blue-600" : "bg-slate-200"}`}></div>
            <span className="font-mono text-xs text-slate-400 font-semibold uppercase">{currentStep === 1 ? "Bước 1/2" : "Bước 2/2"}</span>
          </div>

          {/* Step Contents */}
          <div className="space-y-4 py-1">
            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            {currentStep === 1 ? (
              <div className="space-y-4">
                {/* Full name input */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Họ và Tên <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Phone number input */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Số điện thoại Zalo <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      placeholder="0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Địa chỉ Email <span className="text-slate-400">(Không bắt buộc)</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="email"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      placeholder="email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Investment Cap sizing */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-blue-600" /> Quy mô vốn đầu tư dự kiến
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Dưới 100tr", "100 - 500tr", "500tr - 2 tỷ", "Trên 2 tỷ"].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setInvestmentAmount(amount)}
                        className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                          investmentAmount === amount
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-800"
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risk Tolerance selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-blue-600" /> Bản lĩnh & Khẩu vị đầu tư
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["An toàn (Trái phiếu)", "Cân bằng (Tăng trưởng)", "Chủ động (Kim cương)", "Đầu cơ (T+)"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setRiskTolerance(opt)}
                        className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                          riskTolerance === opt
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-800"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target design stock */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cổ phiếu quan tâm</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase font-mono font-bold"
                      placeholder="Ví dụ: FPT"
                      value={interestedTicker}
                      onChange={(e) => setInterestedTicker(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ghi chú yêu cầu</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Cần hỗ trợ danh mục..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions footer */}
          <div className="flex gap-2">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-850"
              >
                Quay lại
              </button>
            )}

            {currentStep === 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-lg shadow-blue-500/20"
              >
                Tiếp Tục <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-grow flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all font-sans cursor-pointer disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" /> Đang đăng ký...
                  </>
                ) : (
                  <>
                    <Gift className="h-4.5 w-4.5" /> Tải báo cáo ngay
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      ) : (
        /* SUCCESS SCREEN */
        <div className="flex h-full flex-col items-center justify-center text-center space-y-5 my-auto py-8 text-slate-900">
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100"
          >
            <CheckCircle2 className="h-10 w-10" />
          </motion.div>

          <div className="space-y-2">
            <h4 className="text-xl font-bold uppercase tracking-tight text-slate-900">Đăng Ký Thành Công!</h4>
            <p className="max-w-md text-sm text-slate-500 leading-relaxed font-sans">
              Chào mừng <strong className="text-blue-600">{fullName}</strong> đã tham gia phòng VIP tín hiệu FireAnt. Chuyên viên tư vấn độc quyền sẽ nhắn tin qua Zalo Số điện thoại <strong className="text-slate-900">{phone}</strong> chậm nhất trong 5 phút nữa.
            </p>
          </div>

          <div className="w-full max-w-sm rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-left">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 font-extrabold text-sm font-mono">
                🎁
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">Quà Tặng Miễn Phí Đính Kèm</p>
                <p className="text-[10px] text-slate-500">Cẩm nang Top 10 cổ phiếu chân sóng Q2/2026</p>
              </div>
            </div>

            <a
              href="/api/leads/export"
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 py-2 rounded-lg cursor-pointer transition-colors"
            >
              📥 Tải Biều Mẫu Lead (CSV)
            </a>
            
            <button
              onClick={() => {
                setSuccess(false);
                setCurrentStep(1);
                setFullName("");
                setPhone("");
                setEmail("");
                setNotes("");
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-400 underline block mx-auto cursor-pointer"
            >
              Đăng ký thêm thông tin số khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
