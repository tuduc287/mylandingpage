import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to store leads
const LEADS_FILE = path.join(process.cwd(), "leads.json");

// Define types in-line on the server to make single-file self-contained
interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  riskTolerance: string;
  investmentAmount: string;
  interestedTicker: string;
  notes?: string;
  createdAt: string;
}

// Ensure database file exists
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
}

// helper to read leads
function readLeads(): Lead[] {
  try {
    const data = fs.readFileSync(LEADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// helper to write leads
function writeLeads(leads: Lead[]) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// Mock database for stocks & historical data
interface StockData {
  symbol: string;
  companyName: string;
  price: number;
  open: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  volume: number;
  pe: number;
  pb: number;
  eps: number;
  marketCap: number; // in billions VND
  rsi: number;
  recommendation: "MUA MẠNH" | "MUA" | "THEO DÕI" | "BÁN" | "BÁN MẠNH";
}

const STOCK_DB: Record<string, Omit<StockData, "symbol" | "price" | "change" | "changePercent" | "high" | "low" | "volume" | "rsi">> = {
  FPT: { companyName: "CTCP FPT", open: 145.5, pe: 26.5, pb: 6.8, eps: 5500, marketCap: 185000, recommendation: "MUA MẠNH" },
  HPG: { companyName: "Tập đoàn Hòa Phát", open: 29.2, pe: 14.2, pb: 1.6, eps: 2100, marketCap: 172000, recommendation: "MUA" },
  VNM: { companyName: "Sữa Việt Nam (Vinamilk)", open: 68.5, pe: 16.8, pb: 2.8, eps: 4100, marketCap: 143000, recommendation: "THEO DÕI" },
  SSI: { companyName: "Chứng khoán SSI", open: 34.8, pe: 18.2, pb: 2.1, eps: 1950, marketCap: 52000, recommendation: "MUA" },
  VIC: { companyName: "Tập đoàn Vingroup", open: 42.1, pe: 28.1, pb: 1.1, eps: 1500, marketCap: 161000, recommendation: "THEO DÕI" },
  MWG: { companyName: "Thế Giới Di Động", open: 66.8, pe: 22.4, pb: 3.2, eps: 3000, marketCap: 97000, recommendation: "MUA" },
  TCB: { companyName: "Ngân hàng Techcombank", open: 24.5, pe: 7.8, pb: 1.1, eps: 3150, marketCap: 86000, recommendation: "MUA MẠNH" },
  VCB: { companyName: "Ngân hàng Vietcombank", open: 91.2, pe: 15.6, pb: 3.1, eps: 5850, marketCap: 512000, recommendation: "THEO DÕI" },
  VND: { companyName: "Chứng khoán VNDIRECT", open: 15.6, pe: 13.5, pb: 1.2, eps: 1150, marketCap: 19000, recommendation: "BÁN" },
  DGC: { companyName: "Hóa chất Đức Giang", open: 112.5, pe: 12.8, pb: 3.5, eps: 8800, marketCap: 42800, recommendation: "MUA" }
};

// Stock dynamic prices state
const marketState = {
  VNINDEX: { price: 1285.4, change: 4.8, percent: 0.37, history: [1280, 1282, 1281, 1283, 1285.4] },
  HNXINDEX: { price: 243.5, change: -1.2, percent: -0.49, history: [244.7, 244.5, 243.8, 243.5] },
  UPINDEX: { price: 92.1, change: 0.15, percent: 0.16, history: [91.9, 92.0, 92.1] },
  VN30: { price: 1312.8, change: 8.4, percent: 0.64, history: [1304, 1310, 1312.8] },
  stocks: {} as Record<string, StockData>
};

// Initialize stock metrics
Object.keys(STOCK_DB).forEach(symbol => {
  const stockMeta = STOCK_DB[symbol];
  const noise = (Math.random() - 0.4) * 0.03; // Slight positive bias
  const currentPrice = Number((stockMeta.open * (1 + noise)).toFixed(2));
  const change = Number((currentPrice - stockMeta.open).toFixed(2));
  const changePercent = Number(((change / stockMeta.open) * 100).toFixed(2));
  const high = Number((Math.max(stockMeta.open, currentPrice) * (1 + Math.random() * 0.01)).toFixed(2));
  const low = Number((Math.min(stockMeta.open, currentPrice) * (1 - Math.random() * 0.01)).toFixed(2));
  const volume = Math.floor(500000 + Math.random() * 8500000);
  const rsi = Math.floor(45 + Math.random() * 25);

  marketState.stocks[symbol] = {
    symbol,
    ...stockMeta,
    price: currentPrice,
    change,
    changePercent,
    high,
    low,
    volume,
    rsi
  };
});

// Simulate real-time ticking stock values on API calls
function tickMarket() {
  // Tick index
  const idxFluct = (Math.random() - 0.48) * 2.5; // slight positive
  marketState.VNINDEX.price = Number((marketState.VNINDEX.price + idxFluct).toFixed(2));
  marketState.VNINDEX.change = Number((marketState.VNINDEX.price - 1280.6).toFixed(2));
  marketState.VNINDEX.percent = Number(((marketState.VNINDEX.change / 1280.6) * 100).toFixed(2));
  marketState.VNINDEX.history.push(marketState.VNINDEX.price);
  if (marketState.VNINDEX.history.length > 20) marketState.VNINDEX.history.shift();

  // Tick VN30 similarly
  marketState.VN30.price = Number((marketState.VN30.price + idxFluct * 1.05).toFixed(2));
  marketState.VN30.change = Number((marketState.VN30.price - 1304.4).toFixed(2));
  marketState.VN30.percent = Number(((marketState.VN30.change / 1304.4) * 100).toFixed(2));
  marketState.VN30.history.push(marketState.VN30.price);
  if (marketState.VN30.history.length > 20) marketState.VN30.history.shift();

  // Tick stocks
  Object.keys(marketState.stocks).forEach(symbol => {
    const stock = marketState.stocks[symbol];
    const flucPercent = (Math.random() - 0.48) * 0.01; // max 1% fluctuation per tick
    const oldPrice = stock.price;
    let newPrice = Number((oldPrice * (1 + flucPercent)).toFixed(2));
    
    // Ceiling/Floor limit in VN: 7% (HOSE)
    const deviation = (newPrice - stock.open) / stock.open;
    if (Math.abs(deviation) > 0.069) {
      newPrice = Number((oldPrice * (1 - flucPercent)).toFixed(2)); // Reverse
    }

    const change = Number((newPrice - stock.open).toFixed(2));
    const changePercent = Number(((change / stock.open) * 100).toFixed(2));
    const high = Number(Math.max(stock.high, newPrice).toFixed(2));
    const low = Number(Math.min(stock.low, newPrice).toFixed(2));
    const volAdd = Math.floor(Math.random() * 12500);

    marketState.stocks[symbol] = {
      ...stock,
      price: newPrice,
      change,
      changePercent,
      high,
      low,
      volume: stock.volume + volAdd,
      rsi: Math.max(25, Math.min(85, stock.rsi + (Math.random() - 0.5) * 2))
    };
  });
}

// Tick every 6 seconds inside background
setInterval(tickMarket, 6000);

// Financial News and Expert Posts mimicking FireAnt
const FINANCIAL_NEWS = [
  {
    id: "news-1",
    title: "Khối ngoại gom ròng kỷ lục cổ phiếu Công nghệ, FPT bứt phá ấn tượng dẫn dắt dòng tiền",
    source: "Tin tức FireAnt",
    time: "15 phút trước",
    summary: "Trong bối cảnh thị trường hồi phục mạnh mẽ quanh vùng 1280 điểm, khối ngoại đẩy mạnh mua ròng tập trung tại nhóm Công nghệ và Ngân hàng. FPT tiếp tục là tiêu điểm thu hút dòng vốn thông minh nhờ kết quả kinh doanh liên tiếp tăng trưởng vượt bậc.",
    category: "Thị trường"
  },
  {
    id: "news-2",
    title: "Tập đoàn Hòa Phát (HPG) tăng nhiệt lò cao tại Hải Dương, đón đầu sóng hạ tầng quý 3",
    source: "Phân tích doanh nghiệp",
    time: "45 phút trước",
    summary: "Nhu cầu thép phục hồi tốt giúp HPG ghi nhận sản lượng tiêu thụ khả quan. Dự án Dung Quất 2 bám sát tiến độ dự kiến vận hành thử nghiệm cuối năm nay, mở ra triển vọng doanh thu khủng cho chu kỳ 2026-2028.",
    category: "Doanh nghiệp"
  },
  {
    id: "news-3",
    title: "Chứng khoán SSI nhận định: Hệ thống giao dịch KRX sẵn sàng vận hành vận chuyển nâng hạng",
    source: "Phân tích vĩ mô",
    time: "2 giờ trước",
    summary: "Việc thử nghiệm nâng cấp hệ thống KRX đang ở pha cuối cùng. Quy chế giao dịch T+0 ngắn hạn có khả năng đưa thanh khoản thị trường HOSE cán mốc 40,000 tỷ/phiên, nhóm ngành Chứng khoán sẽ hưởng lợi đầu tiên.",
    category: "Vĩ mô"
  },
  {
    id: "news-4",
    title: "Techcombank (TCB) liên tục hạ tỷ lệ nợ xấu, dẫn đầu tỷ suất sinh lời ROE toàn ngành Bank",
    source: "Báo cáo tài chính",
    time: "4 giờ trước",
    summary: "Với tăng trưởng tín dụng phục hồi tốt và hiệu quả quản trị số hàng đầu, TCB đạt lợi nhuận trước thuế cao vượt kế hoạch, khẳng định vị thế ngân hàng thương mại cổ phần tư nhân mạnh nhất.",
    category: "Doanh nghiệp"
  }
];

const COMMUNITY_DISCUSSIONS = [
  {
    id: "dc-1",
    author: "Shark_Tuan_HaNoi",
    avatarColor: "bg-blue-600",
    ticker: "FPT",
    sentiment: "BULLISH",
    content: "FPT dòng tiền vào dồn dập thế này thì mục tiêu 160-170k trong Đại hội năm nay là cực kỳ khả thi. Ae gom chặt tay đừng nghe chim lợn rụng mất hàng vàng mười!",
    likes: 42,
    commentsCount: 12,
    time: "10 phút trước"
  },
  {
    id: "dc-2",
    author: "Broker_VND_Group",
    avatarColor: "bg-emerald-600",
    ticker: "HPG",
    sentiment: "BULLISH",
    content: "Thép đang vào sóng vĩ mô. HPG vượt cản chéo 29.5 với vol thuyết phục. Hôm nay nước ngoài đút túi hơn 5 triệu cổ rồi. Điểm mua gia cường vô cùng đẹp quanh 29.x.",
    likes: 29,
    commentsCount: 5,
    time: "32 phút trước"
  },
  {
    id: "dc-3",
    author: "Trader_Lướt_Sóng",
    avatarColor: "bg-purple-600",
    ticker: "VND",
    sentiment: "BEARISH",
    content: "Nhóm chứng khoán hiện tại hơi đuối so với bank và công nghệ. VND cản trên 16.2 rất dày. Mình ưu tiên chốt dần chuyển sang SSI hay TCB cơ sở khỏe hơn.",
    likes: 15,
    commentsCount: 8,
    time: "55 phút trước"
  },
  {
    id: "dc-4",
    author: "F0_Tập_Sự_99",
    avatarColor: "bg-amber-600",
    ticker: "VNM",
    sentiment: "NEUTRAL",
    content: "Vinamilk đi nền ngang bền bỉ vùng 67-68 cả tháng nay rồi, an toàn nhưng hơi sốt ruột. Có ai đang ôm VNM giống em không ạ? Mong chờ nhịp kéo trả điểm.",
    likes: 8,
    commentsCount: 19,
    time: "1 giờ trước"
  }
];

// Helper for stock historical data (Candlestick generator)
function getStockHistory(symbol: string, days: number = 30) {
  const stock = marketState.stocks[symbol];
  if (!stock) return [];

  const basePrice = stock.price;
  const history = [];
  let currentVal = basePrice * 0.95; // start slightly lower

  for (let i = days; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // filter weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const formattedDate = `${d.getDate()}/${d.getMonth() + 1}`;
    
    // Simulate day prices
    const changePct = (Math.random() - 0.47) * 0.04; // slight uptending walk
    const close = Number((currentVal * (1 + changePct)).toFixed(2));
    const open = Number(currentVal.toFixed(2));
    const high = Number((Math.max(open, close) * (1 + Math.random() * 0.015)).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - Math.random() * 0.015)).toFixed(2));
    const vol = Math.floor(1000000 + Math.random() * 6000000);

    history.push({
      date: formattedDate,
      open,
      high,
      low,
      close,
      volume: vol
    });

    currentVal = close; // roll forward
  }

  // Force last close to match exact stock price
  if (history.length > 0) {
    history[history.length - 1].close = stock.price;
    history[history.length - 1].high = Math.max(history[history.length - 1].high, stock.price);
  }

  return history;
}

// ---------------- API ENDPOINTS ----------------

// Market Briefcase API
app.get("/api/market-summary", (req, res) => {
  // Simulate ticking just to ensure users get fresh movements on pull
  tickMarket();

  res.json({
    indexes: {
      VNINDEX: marketState.VNINDEX,
      HNXINDEX: marketState.HNXINDEX,
      UPINDEX: marketState.UPINDEX,
      VN30: marketState.VN30,
    },
    stocks: Object.values(marketState.stocks)
  });
});

// Single stock detail
app.get("/api/stock/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const stock = marketState.stocks[symbol];

  if (!stock) {
    return res.status(404).json({ error: "Stock ticker not found." });
  }

  const history = getStockHistory(symbol, 30);
  res.json({
    details: stock,
    history
  });
});

// News and Social Streams
app.get("/api/news-feed", (req, res) => {
  res.json({
    news: FINANCIAL_NEWS,
    discussions: COMMUNITY_DISCUSSIONS
  });
});

// Submit Lead Generation Form
app.post("/api/leads", (req, res) => {
  try {
    const { fullName, phone, email, riskTolerance, investmentAmount, interestedTicker, notes } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: "Họ tên và Số điện thoại là trường bắt buộc." });
    }

    const leads = readLeads();
    const newLead: Lead = {
      id: "lead-" + Date.now() + Math.floor(Math.random() * 1000),
      fullName,
      phone,
      email: email || "Chưa cung cấp",
      riskTolerance: riskTolerance || "Cân bằng",
      investmentAmount: investmentAmount || "Chưa xác định",
      interestedTicker: interestedTicker ? interestedTicker.toUpperCase() : "Tổng quan",
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    leads.unshift(newLead); // Prepend to show newer leads first
    writeLeads(leads);

    res.status(201).json({ success: true, lead: newLead });
  } catch (error) {
    res.status(500).json({ error: "Không thể lưu thông tin đăng ký." });
  }
});

// Get Leads list for assessment/dashboard
app.get("/api/leads", (req, res) => {
  res.json(readLeads());
});

// Delete specific Lead
app.post("/api/leads/delete", (req, res) => {
  const { id } = req.body;
  try {
    let leads = readLeads();
    leads = leads.filter(l => l.id !== id);
    writeLeads(leads);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Internal Error" });
  }
});

// Clear all leads (reset mock)
app.post("/api/leads/reset", (req, res) => {
  try {
    writeLeads([]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Internal error" });
  }
});

// Export Leads as CSV
app.get("/api/leads/export", (req, res) => {
  try {
    const leads = readLeads();
    
    // Manual CSV generation with UTF-8 BOM representation for correct display in Excel
    let csv = "\uFEFF"; // BOM for Excel UTF-8
    csv += "ID,Họ và tên,Số điện thoại (Zalo),Email,Khẩu vị rủi ro,Quy mô vốn,Mã cổ phiếu quan tâm,Ghi chú,Ngày đăng ký\n";
    
    leads.forEach(l => {
      const row = [
        l.id,
        `"${l.fullName.replace(/"/g, '""')}"`,
        `"${l.phone}"`,
        `"${l.email}"`,
        `"${l.riskTolerance}"`,
        `"${l.investmentAmount}"`,
        `"${l.interestedTicker}"`,
        `"${(l.notes || "").replace(/"/g, '""')}"`,
        l.createdAt
      ].join(",");
      csv += row + "\n";
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=leads_dang_ky_dau_tu.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).send("Lỗi xuất tệp.");
  }
});

// Gemini AI Stock Advisor Model Endpoint
app.post("/api/gemini/analyze", async (req, res) => {
  const { symbol, userProfile } = req.body;
  const ticker = symbol ? symbol.toUpperCase() : "VNINDEX";

  const stock = marketState.stocks[ticker];
  const stockMeta = stock 
    ? stock 
    : {
        symbol: "VN-INDEX",
        companyName: "Chỉ số đại diện Sở Giao dịch Chứng khoán TP.HCM",
        price: marketState.VNINDEX.price,
        change: marketState.VNINDEX.change,
        changePercent: marketState.VNINDEX.percent,
        pe: 14.2,
        pb: 1.7,
        eps: 0,
        rsi: 54,
        recommendation: "THEO DÕI"
      };

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Elegant fallback simulation if no API key is provided
    const promptFallback = `[AI Offline Fallback Mode] BÁO CÁO PHÂN TÍCH kỹ thuật chuyên sâu cho ${ticker} (${stockMeta.companyName || "Chỉ số chung"}):
- Mức giá hiện tại: ${stockMeta.price} (${stockMeta.changePercent > 0 ? "+" : ""}${stockMeta.changePercent}%). Vi thế RSI: ${stockMeta.rsi}.
- Xu hướng Kỹ thuật: Hệ thống chỉ báo MA20 và MACD đang báo hiệu trạng thái tích lũy cực kỳ ổn định.
- Khuyến nghị hành động: **${stockMeta.recommendation === "MUA MẠNH" || stockMeta.recommendation === "MUA" ? "TÍCH LŨY MUA" : "QUAN SÁT CHỜ ĐIỂM RETEST"}**. Nên giải ngân từng phần 15-20% tỷ trọng tài khoản quanh vùng hỗ trợ hiện tại.
- Để nhận trọn bộ phân tích đầy đủ và danh mục 3 mã cổ phiếu siêu tăng trưởng dẫn sóng cho tài khoản quỹ ${userProfile?.capital || "đầu tư"}, vui lòng hoàn tất thông tin đăng ký Lead ở biểu mẫu bên dưới!`;
    
    return res.json({ analysis: promptFallback, isFallback: true });
  }

  try {
    // Correct @google/genai initialization (server-side only, complete with headers)
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const userProfileText = userProfile 
      ? `Hồ sơ cá nhân nhà đầu tư: Quy mô vốn đầu tư: ${userProfile.capital}, Khẩu vị rủi ro: ${userProfile.risk}.` 
      : "";

    const userPrompt = `Hãy đóng vai trò Chuyên gia tư vấn chiến lược đầu tư chứng khoán cao cấp tại sàn chứng khoán Việt Nam, sử dụng ngôn ngữ phân tích sắc sảo từ FireAnt.vn.
Chúng ta cần viết báo cáo phân tích mã cổ phiếu: ${ticker} (${stockMeta.companyName}).
Dữ liệu thị trường thời gian thực:
- Giá hiện tại: ${stockMeta.price} nghìn đồng/cổ phiếu
- Biến động: ${stockMeta.changePercent}% (Đóng cửa gần nhất so với tham chiếu)
- Định giá P/E: ${stockMeta.pe}, P/B: ${stockMeta.pb}, Chỉ số sức mạnh tương đối RSI(14): ${stockMeta.rsi}
- Khuyến nghị trạng thái hiện tại từ bot hệ thống: **${stockMeta.recommendation}**

${userProfileText}

Hãy viết một bài phân tích sâu (khoảng 350-450 từ) gồm các mục:
1. **Tổng quan hành động giá & Trạng thái xu hướng**: Giải thích kĩ RSI đang cao hay thấp (quá mua/quá bán), mức giá này đang ở vùng gom an toàn hay mạo hiểm.
2. **Định giá & Nội lực (P/E, P/B)**: Đánh giá xem rẻ hay đắt so với trung bình ngành.
3. **Ý kiến phân tích & Điểm mua mục tiêu**: Cung cấp khoảng giá mua dự kiến (ước tính phù hợp với mã).
4. **Lời kêu gọi hành động (CTA cực mạnh)**: Nhắc nhở người dùng rằng để nhận trọn bộ báo cáo chi tiết Q2, tệp định giá Excel, và khuyến nghị lệnh mua/bán trực tiếp qua Zalo cho tài khoản vốn ${userProfile?.capital || "hiện tại"} của họ, họ PHẢI ngay lập tức điền họ tên, số điện thoại Zalo vào Form Đăng Ký thông tin lấy Lead ở ngay bên dướI bảng điều khiển để Chuyên viên liên hệ hỗ trợ.

Lưu ý: Viết bằng tiếng Việt, giọng điệu chuyên nghiệp, tự tin, mang tính thuyết phục cao để khách hàng điền lead.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: "Bạn là trưởng phòng phân tích kỹ thuật và tư vấn tài sản đầu tư tại hệ thống FireAnt.vn Vietnam Stock. Phong cách chuyên nghiệp, thuyết phục cao, chú trọng phân tích số liệu thực tế.",
        temperature: 0.7,
      }
    });

    res.json({ analysis: response.text, isFallback: false });
  } catch (err: any) {
    res.status(500).json({ error: "Lỗi kết nối AI: " + err.message });
  }
});

// ---------------- VITE MIDDLEWARE SETUP ----------------

async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mounting Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully initiated on port ${PORT}`);
  });
}

setupServer();
