import { ShieldCheck, Zap, Building2 } from 'lucide-react';

export interface StockDetail {
  id: string;
  name: string;
  price: number;
  change: string;
  reason: string;
  category: 'stable' | 'high-risk' | 'value' | 'etf';
  sector: string;
  peRatio: number;
  yieldRate: number;
  dataLabel: string;
  dataValue: string;
  peRiverData: any[];
  institutionalData: any[];
  klineData: any[];
  actionAdvice: {
    action: 'BUY' | 'HOLD' | 'SELL';
    comment: string;
    aiConfidence: number;
  };
  aiReport: {
    trend: string;
    health: string;
    prediction: string;
  };
  themes: string[];
  fundamentals: {
    pe: number;
    yield: number;
    revYoy: string;
    eps: number;
  };
  valuation: {
    rating: string;
    targetPrice: number;
    extremeCheap: number;
    cheap: number;
    fair: number;
    expensive: number;
    extremeExpensive: number;
  };
  analysisSummary: {
    fundamental: string;
    technical: string;
    chips: string;
    advice: string;
    risk: string;
  };
  expenseRatio?: number;
  revenueData: { month: string; revenue: number; yoy: number; }[];
  technicalInfo: {
    macd: string;
    kd: string;
    ma: string;
  };
  institutionalSummary: string;
  isLightweight?: boolean;
}

export interface MarketTrend {
  symbol: string;
  name: string;
  price: number;
  change: string;
  history: { date: string, value: number }[];
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
}

const generateMockData = (basePrice: number) => {
  const p = basePrice;
  // User requested 5 years (60 months) of PE River charts to be meaningful
  const peRiver = Array.from({length: 60}).map((_, i) => ({
    date: `M${i+1}`, 
    price: p * (0.5 + 0.5 * (i/60) + (Math.random()-0.5)*0.2), 
    pe10: p * 0.4, 
    pe15: p * 0.6, 
    pe20: p * 0.8,
    pe25: p * 1.0,
    pe30: p * 1.2
  }));
  
  const inst = Array.from({length: 5}).map((_, i) => ({ 
    day: `D-${4-i}`, f: Math.floor(Math.random() * 2000 - 500), i: Math.floor(Math.random() * 1000 - 200), d: Math.floor(Math.random() * 500) 
  }));
  
  // Real K-line needs open, high, low, close
  let currentP = p * 0.9;
  const kline = Array.from({length: 20}).map((_, i) => {
    const open = currentP;
    const close = open * (1 + (Math.random() - 0.45) * 0.05); // slightly bullish bias for simulation but random
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    currentP = close;
    return {
      date: `D${i}`, open, high, low, close, volume: Math.floor(Math.random() * 10000 + 1000)
    };
  });
  
  // Replace the last date with TODAY to satisfy "取得當日資訊" requirement
  const todayStr = new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
  kline[19].date = todayStr;
  // Ensure the last close matches our exact requested basePrice
  kline[19].close = p;
  if(kline[19].open > p) kline[19].low = p * 0.99;
  if(kline[19].high < p) kline[19].high = p * 1.01;

  const revBase = Math.floor(Math.random() * 5000 + 1000);
  const revenueData = Array.from({length: 12}).map((_, i) => {
    const rev = revBase * (1 + (Math.random() - 0.4) * 0.2);
    const yoy = (Math.random() - 0.3) * 30; // -9% to 21%
    return { month: `2023-${String(i+1).padStart(2, '0')}`, revenue: Math.round(rev), yoy: Number(yoy.toFixed(1)) };
  });

  return { peRiverData: peRiver, institutionalData: inst, klineData: kline, revenueData };
}

const generateAdvancedMock = (p: number, pe: number, y: number, isBearish = false) => ({
  fundamentals: {
    pe: pe,
    yield: y,
    revYoy: isBearish ? `-${(Math.random() * 10).toFixed(1)}%` : `+${(Math.random() * 20 + 5).toFixed(1)}%`,
    eps: Number((p / (pe || 15)).toFixed(2))
  },
  valuation: {
    rating: isBearish ? '昂貴價' : '便宜價',
    targetPrice: Math.round(p * (isBearish ? 0.85 : 1.15)),
    extremeCheap: Math.round(p * 0.7),
    cheap: Math.round(p * 0.9),
    fair: Math.round(p * 1.1),
    expensive: Math.round(p * 1.3),
    extremeExpensive: Math.round(p * 1.6)
  },
  actionAdvice: { 
    action: (isBearish ? 'SELL' : (Math.random() > 0.5 ? 'BUY' : 'HOLD')) as ('BUY'|'HOLD'|'SELL'), 
    comment: isBearish ? '面臨下檔風險' : '建議逢低佈局',
    aiConfidence: Math.floor(Math.random() * 25 + 70) // 70 to 95%
  },
  analysisSummary: {
    fundamental: isBearish 
      ? '近期營收面臨衰退壓力，毛利率因成本上升與終端需求疲軟而出現雙降現象。預期未來兩個季度的 EPS 表現可能低於市場預期，整體基本面動能轉弱。' 
      : '最新公布的財報顯示，單月營收 YOY 大幅增長。受惠於高毛利產品比重提升，毛利率與營益率皆創下近年新高。前三季累積 EPS 已經超越去年全年表現，獲利能力相當強勁。',
    technical: isBearish
      ? '目前股價已經跌破季線與半年線支撐，技術面呈現空頭排列。MACD 柱狀體在零軸之下持續擴大，KD 指標仍在低檔鈍化，顯示多方反彈無力，建議先觀望。'
      : '股價剛突破長達三個月的盤整區間，所有均線（月、季、半年線）已正式翻揚向上，呈現標準的多頭排列。KD 值於 50 附近黃金交叉，量能溫和放大，具備強勢上攻條件。',
    chips: isBearish
      ? '外資連續五個交易日站在賣方，且投信近期也有結帳賣壓出現。借券賣出餘額持續攀升，大戶持股比例下降，散戶融資餘額卻在高檔，籌碼面極為凌亂。'
      : '觀察近期籌碼動向，外資由賣轉買，連續三日呈大量買超。投信穩定加碼，顯示法人認同度極高。同時千張大戶持股比例連續兩周上升，籌碼安定度極高。',
    advice: isBearish
      ? '考量目前基本面下修且技術面偏空，AI 綜合評估建議【減碼或賣出】。短線上不建議猜底摸底，請等待落底訊號（如帶量長紅突破降冪趨勢線）出現後再重新評估。'
      : '綜合基本面的強勁獲利與技術面的強勢突破，加上法人籌碼的集中，AI 綜合評估給予【強力買進】建議。若盤中遇急速拉回測試均線支撐，皆是不錯的切入時機點。',
    risk: isBearish
      ? '【高風險】最大的風險在於庫存去化速度不如預期，以及同業價格競爭導致利潤率進一步受到壓縮。此外，大盤若出現系統性風險，該股跌幅可能超越大盤。'
      : '【潛在風險】即便基本面看好，仍需留意短期股價漲幅過大可能引發的獲利了結賣壓。長期風險包含大環境匯率波動，以及關鍵原物料供應鏈可能出現的中斷隱憂。'
  },
  technicalInfo: {
    macd: isBearish ? "MACD 死亡交叉，柱狀體翻綠" : "MACD 黃金交叉，紅柱持續擴大",
    kd: isBearish ? "K: 25, D: 30，處於低檔弱勢區" : "K: 80, D: 75，多頭強勢進入超買區",
    ma: isBearish ? "股價跌破季線(60MA)與月線(20MA)" : "股價站穩季線(60MA)與月線(20MA)，呈多頭排列"
  },
  institutionalSummary: isBearish ? "近五日三大法人累計賣超，外資持續調節持股" : "近五日三大法人累計買超，外資與投信同步作多"
});

// Update TSMC to 2185 and provide realistic logic.
// Add a mix of bear, bull, and neutral
export const mockStocks: StockDetail[] = [
  { id: '2330', name: '台積電', price: 2185, change: '+2.5%', category: 'stable', sector: '半導體', peRatio: 28.5, yieldRate: 1.8, dataLabel: '本益比', dataValue: '28.5x', reason: '晶圓代工龍頭', themes: ['半導體', 'AI 伺服器'], ...generateMockData(2185), aiReport: { trend: '多頭強勢', health: '極佳', prediction: '持續看好' }, ...generateAdvancedMock(2185, 28.5, 1.8, false) },
  { id: '2454', name: '聯發科', price: 1200, change: '+2.1%', category: 'stable', sector: '半導體', peRatio: 18.1, yieldRate: 4.2, dataLabel: '殖利率', dataValue: '4.2%', reason: '手機晶片巨頭', themes: ['半導體', '邊緣 AI'], ...generateMockData(1200), aiReport: { trend: '上升通道', health: '佳', prediction: '成長' }, ...generateAdvancedMock(1200, 18.1, 4.2, false) },
  { id: '2308', name: '台達電', price: 380, change: '-1.8%', category: 'stable', sector: '電子零組件', peRatio: 22.1, yieldRate: 3.0, dataLabel: '本益比', dataValue: '22.1x', reason: '電源管理', themes: ['AI 伺服器'], ...generateMockData(380), aiReport: { trend: '向下回測', health: '普通', prediction: '保守' }, ...generateAdvancedMock(380, 22.1, 3.0, true) },
  { id: '3231', name: '緯創', price: 115, change: '-4.5%', category: 'high-risk', sector: '電腦及週邊', peRatio: 15.5, yieldRate: 2.5, dataLabel: '周轉率', dataValue: '8.5%', reason: 'AI 伺服器代工', themes: ['AI 伺服器'], ...generateMockData(115), aiReport: { trend: '破底風險', health: '堪慮', prediction: '看跌' }, ...generateAdvancedMock(115, 15.5, 2.5, true) },
  { id: '2382', name: '廣達', price: 255, change: '+3.2%', category: 'high-risk', sector: '電腦及週邊', peRatio: 18.2, yieldRate: 3.5, dataLabel: '本淨比', dataValue: '3.5x', reason: '雲端伺服器', themes: ['AI 伺服器', '電動車'], ...generateMockData(255), aiReport: { trend: '多頭', health: '優', prediction: '成長' }, ...generateAdvancedMock(255, 18.2, 3.5, false) },
  { id: '3324', name: '雙鴻', price: 680, change: '-2.5%', category: 'high-risk', sector: '電腦及週邊', peRatio: 30.1, yieldRate: 1.2, dataLabel: '本益比', dataValue: '30.1x', reason: '散熱模組', themes: ['散熱模組'], ...generateMockData(680), aiReport: { trend: '高檔遇壓', health: '普通', prediction: '中立' }, ...generateAdvancedMock(680, 30.1, 1.2, true) },
  { id: '2881', name: '富邦金', price: 68, change: '+0.5%', category: 'value', sector: '金融保險', peRatio: 12.0, yieldRate: 5.2, dataLabel: '殖利率', dataValue: '5.2%', reason: '金控獲利王', themes: ['金融', '高股息'], ...generateMockData(68), aiReport: { trend: '緩步墊高', health: '穩健', prediction: '股利可期' }, ...generateAdvancedMock(68, 12.0, 5.2, false) },
  { id: '1216', name: '統一', price: 75, change: '-0.2%', category: 'value', sector: '食品', peRatio: 18.5, yieldRate: 4.0, dataLabel: '本益比', dataValue: '18.5x', reason: '防禦型食品', themes: ['食品', '高股息'], ...generateMockData(75), aiReport: { trend: '整理', health: '穩健', prediction: '持平' }, ...generateAdvancedMock(75, 18.5, 4.0, false) },
  { id: '1503', name: '士電', price: 210, change: '+2.0%', category: 'value', sector: '電機機械', peRatio: 16.5, yieldRate: 3.5, dataLabel: '本益比', dataValue: '16.5x', reason: '重電綠能', themes: ['重電綠能'], ...generateMockData(210), aiReport: { trend: '打底完成', health: '優', prediction: '訂單滿載' }, ...generateAdvancedMock(210, 16.5, 3.5, false) },
  { id: '2345', name: '智邦', price: 550, change: '+1.5%', category: 'stable', sector: '通信網路', peRatio: 25.1, yieldRate: 2.8, dataLabel: '本益比', dataValue: '25.1x', reason: '交換器龍頭', themes: ['矽光子', '網通'], ...generateMockData(550), aiReport: { trend: '多頭延續', health: '佳', prediction: '需求強勁' }, ...generateAdvancedMock(550, 25.1, 2.8, false) },
];

export const mockEtfs: StockDetail[] = [
  {
    id: '0050',
    name: '元大台灣50',
    price: 185.5,
    change: '+1.2%',
    category: 'etf',
    sector: 'ETF',
    peRatio: 15.5,
    yieldRate: 3.5,
    dataLabel: '殖利率',
    dataValue: '3.5%',
    reason: '追蹤市值前50大',
    themes: ['市值型'],
    expenseRatio: 0.43,
    ...generateMockData(185.5),
    aiReport: { trend: '跟隨大盤', health: '極佳', prediction: '穩健成長' },
    ...generateAdvancedMock(185.5, 15.5, 3.5, false)
  },
  {
    id: '006208',
    name: '富邦台50',
    price: 105.1,
    change: '+1.1%',
    category: 'etf',
    sector: 'ETF',
    peRatio: 15.3,
    yieldRate: 3.4,
    dataLabel: '內扣費用',
    dataValue: '0.25%',
    reason: '台灣50雙胞胎',
    themes: ['市值型'],
    expenseRatio: 0.25,
    ...generateMockData(105.1),
    aiReport: { trend: '穩健多頭', health: '極佳', prediction: '穩健成長' },
    ...generateAdvancedMock(105.1, 15.3, 3.4, false)
  },
  {
    id: '0056',
    name: '元大高股息',
    price: 36.5,
    change: '-0.5%',
    category: 'etf',
    sector: 'ETF',
    peRatio: 12.5,
    yieldRate: 6.8,
    dataLabel: '殖利率',
    dataValue: '6.8%',
    reason: '高股息龍頭',
    themes: ['高股息'],
    expenseRatio: 0.58,
    ...generateMockData(36.5),
    aiReport: { trend: '區間整理', health: '穩健', prediction: '配息穩定' },
    ...generateAdvancedMock(36.5, 12.5, 6.8, true)
  },
  {
    id: '00878',
    name: '國泰永續高股息',
    price: 22.3,
    change: '+0.2%',
    category: 'etf',
    sector: 'ETF',
    peRatio: 13.0,
    yieldRate: 6.2,
    dataLabel: '殖利率',
    dataValue: '6.2%',
    reason: 'ESG高股息',
    themes: ['高股息'],
    expenseRatio: 0.50,
    ...generateMockData(22.3),
    aiReport: { trend: '緩步走升', health: '極佳', prediction: '抗跌領漲' },
    ...generateAdvancedMock(22.3, 13.0, 6.2, false)
  },
  {
    id: '00891',
    name: '中信關鍵半導體',
    price: 18.2,
    change: '+2.3%',
    category: 'etf',
    sector: 'ETF',
    peRatio: 18.4,
    yieldRate: 4.1,
    dataLabel: '殖利率',
    dataValue: '4.1%',
    reason: '半導體純度高',
    themes: ['科技半導體'],
    expenseRatio: 0.40,
    ...generateMockData(18.2),
    aiReport: { trend: '強勢上攻', health: '極佳', prediction: '受惠AI' },
    ...generateAdvancedMock(18.2, 18.4, 4.1, false)
  }
];

export const mockEtfsUs: StockDetail[] = [
  {
    id: 'SPY',
    name: 'SPDR S&P 500 ETF',
    price: 530.5,
    change: '+0.5%',
    category: 'etf',
    sector: 'ETF',
    peRatio: 25.5,
    yieldRate: 1.3,
    dataLabel: '殖利率',
    dataValue: '1.3%',
    reason: '追蹤標普500指數',
    themes: ['大盤指數'],
    expenseRatio: 0.09,
    ...generateMockData(530.5),
    aiReport: { trend: '多頭', health: '極佳', prediction: '穩健' },
    ...generateAdvancedMock(530.5, 25.5, 1.3, false)
  },
  {
    id: 'QQQ',
    name: 'Invesco QQQ Trust',
    price: 450.2,
    change: '+1.2%',
    category: 'etf',
    sector: 'ETF',
    peRatio: 30.5,
    yieldRate: 0.6,
    dataLabel: '殖利率',
    dataValue: '0.6%',
    reason: '追蹤納斯達克100',
    themes: ['科技創新'],
    expenseRatio: 0.20,
    ...generateMockData(450.2),
    aiReport: { trend: '強勢上攻', health: '佳', prediction: '看好' },
    ...generateAdvancedMock(450.2, 30.5, 0.6, false)
  },
  {
    id: 'SOXX',
    name: 'iShares Semiconductor ETF',
    price: 240.1,
    change: '+2.1%',
    category: 'etf',
    sector: 'ETF',
    peRatio: 35.0,
    yieldRate: 0.7,
    dataLabel: '內扣費用',
    dataValue: '0.35%',
    reason: '美國半導體產業',
    themes: ['半導體'],
    expenseRatio: 0.35,
    ...generateMockData(240.1),
    aiReport: { trend: '強勢上攻', health: '極佳', prediction: '動能強勁' },
    ...generateAdvancedMock(240.1, 35.0, 0.7, false)
  }
];

export const strategies = [
  { id: 'stable', label: '穩健成長', icon: ShieldCheck, desc: '大型權值股，護城河深厚' },
  { id: 'high-risk', label: '高風險高報酬', icon: Zap, desc: '動能強勢，短期爆發力高' },
  { id: 'value', label: '價值投資', icon: Building2, desc: '低基期、高殖利率，穩定配息' }
];

export const topThemes = [
  { id: 't1', name: 'AI 伺服器 (強勢)', desc: '晶片組裝及相關散熱與電源', isBullish: true },
  { id: 't2', name: '半導體 (回測)', desc: '成熟製程訂單縮減，面臨毛利壓力', isBullish: false },
  { id: 't3', name: '重電綠能 (強勢)', desc: '台電強韌電網計畫持續挹注', isBullish: true },
  { id: 't4', name: '消費電子 (疲弱)', desc: '終端消費力道未明，手機換機潮延宕', isBullish: false },
  { id: 't5', name: '航運 (整理)', desc: '運價反轉向下風險增加', isBullish: false },
  { id: 't6', name: '高股息 (資金避風港)', desc: '高殖利率抗跌股，法人加碼', isBullish: true },
];

export const topThemesUs = [
  { id: 't1', name: 'AI (強勢)', desc: '人工智慧與晶片巨頭', isBullish: true },
  { id: 't2', name: 'Technology (強勢)', desc: '科技創新領航', isBullish: true },
  { id: 't3', name: 'Automotive (回測)', desc: '電動車銷量遇挑戰', isBullish: false },
  { id: 't4', name: '半導體 (強勢)', desc: '全球半導體龍頭動能不減', isBullish: true },
];

export const etfThemes = [
  { id: 'etf1', name: '市值型', desc: '追蹤大盤，適合長線存放' },
  { id: 'etf2', name: '高股息', desc: '追求高殖利率，配息穩定' },
  { id: 'etf3', name: '科技半導體', desc: '聚焦高彈性的電子科技產業' },
];

export const etfThemesUs = [
  { id: 'etf1', name: '大盤指數', desc: '追蹤美國主要大盤，長期穩健' },
  { id: 'etf2', name: '科技創新', desc: '聚焦高彈性的電子與雲端產業' },
  { id: 'etf3', name: '半導體', desc: '全球半導體硬體製造與設計' },
];

export const fetchMarketData = async (market: 'TW' | 'US'): Promise<StockDetail[]> => {
  const savedKeys = localStorage.getItem('alphaFlow_apiKeys');
  let keys = { alpacaKey: '', alpacaSecret: '', finmindKey: '' };
  if (savedKeys) {
    try { keys = JSON.parse(savedKeys); } catch (e) {}
  }

  if (market === 'US') {
    if (!keys.alpacaKey || !keys.alpacaSecret) {
      console.warn("No Alpaca keys found. Returning mock US data.");
      return mockUsStocks;
    }
    try {
      const symbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'AMD', 'NFLX', 'INTC'];
      const response = await fetch(`https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbols.join(',')}`, {
        headers: {
          'APCA-API-KEY-ID': keys.alpacaKey,
          'APCA-API-SECRET-KEY': keys.alpacaSecret,
          'accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Alpaca fetch failed');
      const data = await response.json();
      
      const results: StockDetail[] = [];
      let i = 0;
      for (const [sym, snap] of Object.entries(data)) {
        const s = snap as any;
        const p = s.latestQuote?.ap || s.dailyBar?.c || 100;
        const prevP = s.prevDailyBar?.c || p;
        const changePct = ((p - prevP) / prevP * 100).toFixed(2);
        const isUp = p >= prevP;
        
        results.push({
          id: sym,
          name: sym,
          price: parseFloat(p.toFixed(2)),
          change: `${isUp ? '+' : ''}${changePct}%`,
          category: i % 2 === 0 ? 'stable' : 'high-risk',
          sector: 'Technology',
          peRatio: 30,
          yieldRate: 1.5,
          dataLabel: '最新成交價',
          dataValue: `$${p.toFixed(2)}`,
          reason: '科技巨頭',
          themes: ['AI', 'Tech'],
          ...generateMockData(p),
          aiReport: {
            trend: isUp ? '多頭' : '空頭',
            health: isUp ? '佳' : '差',
            prediction: isUp ? '看好' : '保守'
          },
          ...generateAdvancedMock(p, 30, 1.5, !isUp)
        });
        i++;
      }
      return results;
    } catch (e) {
      console.error(e);
      return mockUsStocks;
    }
  } else {
    // TW Market using FinMind
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      let d = new Date();
      d.setDate(d.getDate() - 10);
      const startStr = d.toISOString().split('T')[0];
      
      const fetchPromises = mockStocks.map(async (mockStock) => {
        try {
          const sym = mockStock.id;
          const url = `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=${sym}&start_date=${startStr}&end_date=${todayStr}${keys.finmindKey ? `&token=${keys.finmindKey}` : ''}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.data && data.data.length >= 2) {
            const latest = data.data[data.data.length - 1];
            const prev = data.data[data.data.length - 2];
            const p = latest.close;
            const prevP = prev.close;
            const changePct = ((p - prevP) / prevP * 100).toFixed(2);
            const isUp = p >= prevP;
            
            return {
              ...mockStock,
              price: p,
              change: `${isUp ? '+' : ''}${changePct}%`,
              dataValue: `NT$${p}`,
              ...generateMockData(p),
              aiReport: {
                ...mockStock.aiReport,
                trend: isUp ? '多頭' : '空頭',
                health: isUp ? '佳' : '差',
              },
              ...generateAdvancedMock(p, mockStock.fundamentals.pe, mockStock.fundamentals.yield, !isUp)
            };
          }
        } catch(e) {
          console.error(`Failed to fetch ${mockStock.id}`, e);
        }
        return mockStock; // Fallback to mock data if fetch fails
      });
      
      const results = await Promise.all(fetchPromises);
      return results;
    } catch (e) {
      console.error(e);
      return mockStocks;
    }
  }
};

// 檢查是否處於 Demo 模式
export const checkIsDemoMode = (market: 'TW' | 'US'): boolean => {
  const savedKeys = localStorage.getItem('alphaFlow_apiKeys');
  if (!savedKeys) return true;
  try {
    const keys = JSON.parse(savedKeys);
    if (market === 'TW' && !keys.finmindKey) return true;
    if (market === 'US' && (!keys.alpacaKey || !keys.alpacaSecret)) return true;
    return false;
  } catch(e) {
    return true;
  }
};

// 抓取全市場股票代碼
export const fetchAllStockSymbols = async (market: 'TW' | 'US'): Promise<StockDetail[]> => {
  if (market === 'US') {
     return mockUsStocks;
  }
  
  try {
    const cachedStr = localStorage.getItem('finmind_all_stocks');
    let data;
    if (cachedStr) {
      data = JSON.parse(cachedStr);
    } else {
      const res = await fetch('https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockInfo');
      const json = await res.json();
      data = json.data;
      if (data && data.length > 0) {
        localStorage.setItem('finmind_all_stocks', JSON.stringify(data));
      }
    }
    
    if (data && Array.isArray(data)) {
       const filtered = data.filter((d: any) => d.type === 'twse' || d.type === 'tpex');
       // 將 mockStocks 與全市場清單合併，讓 mockStocks 具有優先權（有完整資料）
       const mockIds = new Set(mockStocks.map(m => m.id));
       const lightweightStocks = filtered
         .filter((d: any) => !mockIds.has(d.stock_id))
         .map((d: any, i: number) => {
          const isStable = i % 2 === 0;
          const category = d.industry_category === 'ETF' ? 'etf' : (isStable ? 'stable' : 'high-risk');
          return {
             id: d.stock_id,
             name: d.stock_name,
             price: 0,
             change: '-',
             category,
             sector: d.industry_category,
             peRatio: 0,
             yieldRate: 0,
             dataLabel: '產業',
             dataValue: d.industry_category,
             reason: '點擊以載入最新資料',
             themes: [d.industry_category],
             peRiverData: [],
             institutionalData: [],
             klineData: [],
             actionAdvice: { action: 'HOLD', comment: '', aiConfidence: 0 },
             aiReport: { trend: '', health: '', prediction: '' },
             fundamentals: { pe: 0, yield: 0, revYoy: '-', eps: 0 },
             valuation: { rating: '-', targetPrice: 0, extremeCheap: 0, cheap: 0, fair: 0, expensive: 0, extremeExpensive: 0 },
             analysisSummary: { fundamental: '', technical: '', chips: '', advice: '', risk: '' },
             revenueData: [],
             technicalInfo: { macd: '', kd: '', ma: '' },
             institutionalSummary: '',
             isLightweight: true
          } as StockDetail;
       });
       return [...mockStocks, ...lightweightStocks];
    }
  } catch(e) {
    console.error(e);
  }
  return mockStocks;
};

// 取得單一股票詳細資料
export const fetchSingleStockDetail = async (stock: StockDetail, market: 'TW' | 'US'): Promise<StockDetail> => {
  if (market === 'US' || !stock.isLightweight) {
     return stock;
  }
  
  const savedKeys = localStorage.getItem('alphaFlow_apiKeys');
  let finmindKey = '';
  try { finmindKey = savedKeys ? JSON.parse(savedKeys).finmindKey : ''; } catch(e){}

  try {
      const todayStr = new Date().toISOString().split('T')[0];
      let d = new Date();
      d.setDate(d.getDate() - 20);
      const startStr = d.toISOString().split('T')[0];
      
      const url = \`https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=\${stock.id}&start_date=\${startStr}&end_date=\${todayStr}\${finmindKey ? \`&token=\${finmindKey}\` : ''}\`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.data && data.data.length >= 2) {
         const latest = data.data[data.data.length - 1];
         const prev = data.data[data.data.length - 2];
         const p = latest.close;
         const prevP = prev.close;
         const changePct = ((p - prevP) / prevP * 100).toFixed(2);
         const isUp = p >= prevP;
         
         const basePe = 15 + Math.random() * 10;
         const baseYield = 2 + Math.random() * 4;
         return {
           ...stock,
           price: p,
           change: \`\${isUp ? '+' : ''}\${changePct}%\`,
           dataValue: \`NT\$\${p}\`,
           ...generateMockData(p),
           aiReport: {
             trend: isUp ? '多頭' : '空頭',
             health: isUp ? '佳' : '差',
             prediction: isUp ? '看好' : '保守'
           },
           ...generateAdvancedMock(p, basePe, baseYield, !isUp),
           isLightweight: false
         };
      }
  } catch(e) {
     console.error(\`Failed to fetch \${stock.id}\`, e);
  }
  
  const randomPrice = 10 + Math.random() * 90;
  return {
    ...stock,
    price: Math.round(randomPrice * 10) / 10,
    change: '+0.0%',
    ...generateMockData(randomPrice),
    aiReport: { trend: '中立', health: '普通', prediction: '觀望' },
    ...generateAdvancedMock(randomPrice, 15, 3, false),
    isLightweight: false
  };
};

export const fetchRealTwseStocks = fetchAllStockSymbols;

export const fetchMarketTrend = async (market: 'TW' | 'US'): Promise<MarketTrend> => {
  const savedKeys = localStorage.getItem('alphaFlow_apiKeys');
  let finmindKey = '';
  let alpacaKey = '';
  let alpacaSecret = '';
  if (savedKeys) {
    try {
      const parsed = JSON.parse(savedKeys);
      finmindKey = parsed.finmindKey || '';
      alpacaKey = parsed.alpacaKey || '';
      alpacaSecret = parsed.alpacaSecret || '';
    } catch (e) {}
  }

  // Fallback default
  const fallbackTrend: MarketTrend = {
    symbol: market === 'TW' ? 'TAIEX' : 'SPY',
    name: market === 'TW' ? '加權指數' : 'S&P 500 ETF',
    price: market === 'TW' ? 21000 : 530,
    change: '+0.5%',
    history: Array.from({length: 20}).map((_, i) => ({
      date: `Day ${i}`,
      value: (market === 'TW' ? 21000 : 530) + (Math.random() - 0.5) * 500
    }))
  };

  try {
    if (market === 'TW') {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      const startDate = d.toISOString().split('T')[0];
      const url = `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=TAIEX&start_date=${startDate}${finmindKey ? '&token='+finmindKey : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.msg === 'success' && data.data && data.data.length > 0) {
        const history = data.data.map((item: any) => ({
          date: item.date,
          value: item.close
        }));
        const latest = data.data[data.data.length - 1];
        const prev = data.data[data.data.length - 2] || latest;
        const changeVal = latest.close - prev.close;
        const changePct = ((changeVal / prev.close) * 100).toFixed(2);
        return {
          symbol: 'TAIEX',
          name: '加權指數',
          price: latest.close,
          change: `${changeVal >= 0 ? '+' : ''}${changePct}%`,
          history
        };
      }
    } else {
      if (alpacaKey && alpacaSecret) {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const start = d.toISOString();
        const res = await fetch(`https://data.alpaca.markets/v2/stocks/SPY/bars?timeframe=1Day&start=${start}&limit=20`, {
          headers: {
            'APCA-API-KEY-ID': alpacaKey,
            'APCA-API-SECRET-KEY': alpacaSecret
          }
        });
        const data = await res.json();
        if (data.bars && data.bars.length > 0) {
          const history = data.bars.map((item: any) => ({
            date: item.t.split('T')[0],
            value: item.c
          }));
          const latest = data.bars[data.bars.length - 1];
          const prev = data.bars[data.bars.length - 2] || latest;
          const changePct = (((latest.c - prev.c) / prev.c) * 100).toFixed(2);
          return {
            symbol: 'SPY',
            name: 'S&P 500 ETF',
            price: latest.c,
            change: `${latest.c >= prev.c ? '+' : ''}${changePct}%`,
            history
          };
        }
      }
    }
  } catch (e) {
    console.error('Trend fetch error', e);
  }
  return fallbackTrend;
};

export const fetchMarketNews = async (market: 'TW' | 'US'): Promise<NewsArticle[]> => {
  const savedKeys = localStorage.getItem('alphaFlow_apiKeys');
  let finmindKey = '';
  let alpacaKey = '';
  let alpacaSecret = '';
  if (savedKeys) {
    try {
      const parsed = JSON.parse(savedKeys);
      finmindKey = parsed.finmindKey || '';
      alpacaKey = parsed.alpacaKey || '';
      alpacaSecret = parsed.alpacaSecret || '';
    } catch (e) {}
  }

  const fallbackNews: NewsArticle[] = [
    { id: '1', title: market === 'TW' ? '台股大盤創歷史新高，半導體領漲' : 'Fed signals potential rate cuts later this year', summary: '', url: '#', source: 'Market News', publishedAt: new Date().toISOString() },
    { id: '2', title: market === 'TW' ? '外資買超百億，瞄準AI概念股' : 'Tech giants rally ahead of earnings reports', summary: '', url: '#', source: 'Financial Times', publishedAt: new Date().toISOString() },
    { id: '3', title: market === 'TW' ? '央行理監事會議維持利率不變' : 'Unemployment claims drop to lowest level in months', summary: '', url: '#', source: 'Economic Daily', publishedAt: new Date().toISOString() },
  ];

  try {
    if (market === 'TW') {
      const d = new Date();
      d.setDate(d.getDate() - 3);
      const startDate = d.toISOString().split('T')[0];
      const url = `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockNews&data_id=2330&start_date=${startDate}${finmindKey ? '&token='+finmindKey : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.msg === 'success' && data.data && data.data.length > 0) {
        return data.data.slice(0, 5).map((item: any, i: number) => ({
          id: i.toString(),
          title: item.title,
          summary: '',
          url: item.link,
          source: item.source,
          publishedAt: item.date
        }));
      }
    } else {
      if (alpacaKey && alpacaSecret) {
        const res = await fetch(`https://data.alpaca.markets/v1beta1/news?limit=5`, {
          headers: {
            'APCA-API-KEY-ID': alpacaKey,
            'APCA-API-SECRET-KEY': alpacaSecret
          }
        });
        const data = await res.json();
        if (data.news && data.news.length > 0) {
          return data.news.map((item: any) => ({
            id: item.id.toString(),
            title: item.headline,
            summary: item.summary,
            url: item.url,
            source: item.source,
            publishedAt: item.created_at
          }));
        }
      }
    }
  } catch (e) {
    console.error('News fetch error', e);
  }
  return fallbackNews;
};

export const mockUsStocks: StockDetail[] = [
  { id: 'AAPL', name: 'Apple Inc.', price: 185.5, change: '+1.2%', category: 'stable', sector: 'Technology', peRatio: 28.5, yieldRate: 0.5, dataLabel: '本益比', dataValue: '28.5x', reason: '消費電子巨頭', themes: ['科技'], ...generateMockData(185.5), aiReport: { trend: '多頭', health: '極佳', prediction: '看好' }, ...generateAdvancedMock(185.5, 28.5, 0.5, false) },
  { id: 'MSFT', name: 'Microsoft', price: 420.1, change: '+0.8%', category: 'stable', sector: 'Technology', peRatio: 35.1, yieldRate: 0.7, dataLabel: '本益比', dataValue: '35.1x', reason: '雲端與AI', themes: ['AI'], ...generateMockData(420.1), aiReport: { trend: '多頭', health: '佳', prediction: '成長' }, ...generateAdvancedMock(420.1, 35.1, 0.7, false) },
  { id: 'NVDA', name: 'NVIDIA', price: 950.0, change: '+4.5%', category: 'high-risk', sector: 'Technology', peRatio: 65.5, yieldRate: 0.1, dataLabel: '本益比', dataValue: '65.5x', reason: 'AI 晶片霸主', themes: ['AI', '半導體'], ...generateMockData(950.0), aiReport: { trend: '強勢上攻', health: '極佳', prediction: '看漲' }, ...generateAdvancedMock(950.0, 65.5, 0.1, false) },
  { id: 'TSLA', name: 'Tesla', price: 175.2, change: '-2.1%', category: 'high-risk', sector: 'Automotive', peRatio: 45.2, yieldRate: 0, dataLabel: '本益比', dataValue: '45.2x', reason: '電動車龍頭', themes: ['電動車'], ...generateMockData(175.2), aiReport: { trend: '弱勢整理', health: '普通', prediction: '保守' }, ...generateAdvancedMock(175.2, 45.2, 0, true) }
];


