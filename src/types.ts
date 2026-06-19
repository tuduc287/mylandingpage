export interface StockData {
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
  marketCap: number;
  rsi: number;
  recommendation: "MUA MẠNH" | "MUA" | "THEO DÕI" | "BÁN" | "BÁN MẠNH";
}

export interface IndexData {
  price: number;
  change: number;
  percent: number;
  history: number[];
}

export interface MarketSummary {
  indexes: {
    VNINDEX: IndexData;
    HNXINDEX: IndexData;
    UPINDEX: IndexData;
    VN30: IndexData;
  };
  stocks: StockData[];
}

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockDetailResponse {
  details: StockData;
  history: Candle[];
}

export interface FinancialNews {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
  category: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatarColor: string;
  ticker: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  content: string;
  likes: number;
  commentsCount: number;
  time: string;
}

export interface Lead {
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
