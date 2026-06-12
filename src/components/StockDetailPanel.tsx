import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, TrendingUp, BarChart3, Activity, Target, Landmark, Newspaper, FileSearch, ShieldAlert, BrainCircuit, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine, ComposedChart, Line } from 'recharts';
import { StockDetail } from '../data';

const CandlestickShape = (props: any) => {
  const { x, y, width, height, open, close, high, low, maxVal, minVal } = props;
  const isGreen = close >= open;
  const color = isGreen ? '#ef4444' : '#22c55e'; // In Taiwan, Red is UP, Green is DOWN
  
  if (!props.payload) return null;
  const { open: pOpen, close: pClose, high: pHigh, low: pLow } = props.payload;
  
  const yRatio = height / Math.max(Math.abs(pOpen - pClose), 0.001); // fallback to avoid NaN
  
  const halfWidth = width / 2;
  const bodyValue = Math.abs(pOpen - pClose);
  const pxPerValue = bodyValue > 0 ? height / bodyValue : 0;
  
  const bodyTop = y; // y is the top of the body (max of open/close)
  const bodyBottom = y + height;
  
  const highPx = bodyTop - (pHigh - Math.max(pOpen, pClose)) * pxPerValue;
  const lowPx = bodyBottom + (Math.min(pOpen, pClose) - pLow) * pxPerValue;

  return (
    <g stroke={color} fill={color}>
      {/* Wick */}
      <line x1={x + halfWidth} y1={highPx} x2={x + halfWidth} y2={lowPx} strokeWidth={1} />
      {/* Body */}
      <rect 
        x={x} 
        y={bodyTop} 
        width={width} 
        height={Math.max(height, 2)} 
        fill={isGreen ? '#ef4444' : '#0f172a'} 
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};


export default function StockDetailPanel({ stock: initialStock, setStock, watchlist, toggleWatchlist }: {
  stock: StockDetail;
  setStock: (s: StockDetail | null) => void;
  watchlist: string[];
  toggleWatchlist: (id: string, e?: React.MouseEvent) => void;
}) {
  const [stock, setLocalStock] = React.useState<StockDetail>(initialStock);
  const [isGenerating, setIsGenerating] = React.useState(false);

  React.useEffect(() => {
    setLocalStock(initialStock);
  }, [initialStock]);

  const handleGenerateReport = async () => {
    const savedKeys = localStorage.getItem('alphaFlow_apiKeys');
    let llmKey = '';
    if (savedKeys) {
      try { llmKey = JSON.parse(savedKeys).llmKey; } catch (e) {}
    }
    
    if (!llmKey) {
      alert("請先於設定輸入 OpenAI 或 Gemini API Key");
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `請扮演專業分析師，根據以下資料產生最新的股票分析報告。
標的: ${stock.name}(${stock.id})
最新價格: ${stock.price} (漲跌幅: ${stock.change})
【財報數據】本益比 ${stock.fundamentals?.pe || '-'}x, 殖利率 ${stock.fundamentals?.yield || '-'}%, 營收YoY ${stock.fundamentals?.revYoy || '-'}, 累積EPS ${stock.fundamentals?.eps || '-'}
【技術指標】MACD: ${stock.technicalInfo?.macd || '-'}, KD: ${stock.technicalInfo?.kd || '-'}, 均線: ${stock.technicalInfo?.ma || '-'}
【籌碼動向】三大法人: ${stock.institutionalSummary || '-'}

請在報告中明確引用上述具體數據(如 EPS, 本益比, YoY, KD值, 外資動向)來佐證你的分析。請以 JSON 格式回傳，欄位包含:
      {
        "fundamental": "基本面分析 (約50字)",
        "technical": "技術面分析 (約50字)",
        "chips": "籌碼與消息 (約50字)",
        "risk": "潛在風險 (約50字)",
        "advice": "綜合操作建議 (約50字)",
        "action": "BUY 或 HOLD 或 SELL",
        "confidence": 數字(1-100)
      }
      只回傳 JSON，不要 markdown 標記。`;

      let responseText = '';
      if (llmKey.startsWith('sk-')) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${llmKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }]
          })
        });
        const data = await res.json();
        responseText = data.choices[0].message.content;
      } else {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${llmKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        const data = await res.json();
        responseText = data.candidates[0].content.parts[0].text;
      }

      responseText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const report = JSON.parse(responseText);

      setLocalStock({
        ...stock,
        actionAdvice: {
          action: report.action,
          comment: report.advice,
          aiConfidence: report.confidence
        },
        analysisSummary: {
          fundamental: report.fundamental,
          technical: report.technical,
          chips: report.chips,
          advice: report.advice,
          risk: report.risk
        }
      });
    } catch (e) {
      console.error(e);
      alert("產生報告失敗，請檢查 API Key 或稍後再試");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const chartData = stock.klineData.map(d => ({
    ...d,
    candleBody: [d.open, d.close]
  }));

  const isETF = stock.category === 'etf';

  return (
    <motion.div key="detailPanel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <button onClick={() => setStock(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium group w-max">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回列表
      </button>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-[#111624] p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-mono font-bold rounded-md mb-3 border border-blue-500/20">
            {stock.id} | {stock.sector}
          </span>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            {stock.name}
            <button onClick={(e) => toggleWatchlist(stock.id, e)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <Heart className={`w-6 h-6 ${watchlist.includes(stock.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
            </button>
          </h2>
        </div>
        <div className="text-left md:text-right">
          <p className="text-4xl font-mono font-semibold text-white">{stock.price}</p>
          <p className={`text-sm font-bold mt-1 inline-block px-2 py-0.5 rounded ${stock.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {stock.change} (今日)
          </p>
        </div>
      </header>

      {/* 股票深度分析總結 (Moved to Top) */}
      <div className="bg-[#111624] rounded-2xl border border-slate-800 shadow-lg flex flex-col overflow-hidden relative w-full">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div className="p-6 lg:p-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileSearch className="w-6 h-6 text-blue-400"/> 股票深度分析總結
            </h3>
            <button 
              onClick={handleGenerateReport} 
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? <BrainCircuit className="w-4 h-4 animate-pulse" /> : <BrainCircuit className="w-4 h-4" />}
              {isGenerating ? '產生中...' : '重新生成 AI 報告'}
            </button>
          </div>
          <p className="text-sm text-slate-500 font-mono mb-8">Generated by AlphaFlow AI • {stock.actionAdvice.aiConfidence}% Confidence</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800/80 hover:bg-slate-800/50 transition-colors h-full">
              <h4 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                <Landmark className="w-4 h-4"/> 基本面分析
              </h4>
              <p className="text-[14px] leading-relaxed text-slate-300 font-light">{stock.analysisSummary?.fundamental || stock.aiReport?.health}</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800/80 hover:bg-slate-800/50 transition-colors h-full">
              <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4"/> 技術分析
              </h4>
              <p className="text-[14px] leading-relaxed text-slate-300 font-light">{stock.analysisSummary?.technical || stock.aiReport?.trend}</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800/80 hover:bg-slate-800/50 transition-colors h-full">
              <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <Newspaper className="w-4 h-4"/> 籌碼與消息
              </h4>
              <p className="text-[14px] leading-relaxed text-slate-300 font-light">{stock.analysisSummary?.chips || stock.aiReport?.prediction}</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800/80 hover:bg-slate-800/50 transition-colors h-full">
              <h4 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4"/> 潛在風險分析
              </h4>
              <p className="text-[14px] leading-relaxed text-slate-300 font-light">{stock.analysisSummary?.risk || '【系統性風險】需留意大盤回檔影響，以及產業庫存調整之不確定性。'}</p>
            </div>
          </div>

          {/* 獨立強調的操作建議 */}
          <div className={`p-6 rounded-xl border ${stock.actionAdvice.action === 'BUY' ? 'bg-emerald-500/10 border-emerald-500/30' : stock.actionAdvice.action === 'SELL' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className={`px-6 py-4 shrink-0 text-center rounded-xl font-black text-2xl ${stock.actionAdvice.action === 'BUY' ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : stock.actionAdvice.action === 'SELL' ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'}`}>
                {stock.actionAdvice.action}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5" /> AI 綜合操作建議
                  </h4>
                </div>
                <p className="text-[15px] text-slate-200 leading-relaxed font-normal">{stock.analysisSummary?.advice || stock.actionAdvice.comment}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111624] p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-400"/> 基本面核心數據
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">本益比 (PE)</p>
              <p className="text-xl font-mono font-medium text-white">{stock.fundamentals?.pe || '-'}x</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">殖利率</p>
              <p className="text-xl font-mono font-medium text-emerald-400">{stock.fundamentals?.yield || '-'}%</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{isETF ? '內扣費用' : '營收 YoY'}</p>
              <p className="text-xl font-mono font-medium text-blue-400">{isETF ? `${stock.expenseRatio}%` : `${stock.fundamentals?.revYoy || '-'}`}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{isETF ? '追蹤指數' : '累積 EPS'}</p>
              <p className="text-xl font-mono font-medium text-white">{isETF ? '-' : `${stock.fundamentals?.eps || '-'}元`}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111624] p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Target className="w-24 h-24" />
          </div>
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2 relative z-10">
            <Target className="w-5 h-5 text-orange-400"/> AI 估價模型與目標價
            <div className="relative group cursor-pointer ml-1">
              <Info className="w-4 h-4 text-slate-500 hover:text-slate-300" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 bg-slate-800 text-slate-300 text-[12px] leading-relaxed p-4 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none border border-slate-700 font-normal">
                本系統之 AI 估價模型綜合考量個股近五年之歷史本益比(PE)區間、預估 EPS 以及市場資金動能。透過常態分佈統計，取其 PE 均值上下 1 至 2 個標準差，並依據最新財報與營收 YoY 表現給予動態折溢價，推算出五個位階。目標價為模型預測未來半年最可能觸及之合理價值上限。
              </div>
            </div>
          </h3>
          <div className="flex items-end justify-between mb-6 relative z-10">
            <div>
              <p className="text-sm text-slate-400 mb-1">目前估值狀態</p>
              <span className={`px-3 py-1 text-sm font-bold rounded-lg ${stock.valuation?.rating === '便宜價' || stock.valuation?.rating === '大特價' ? 'bg-emerald-500/20 text-emerald-400' : stock.valuation?.rating === '合理價' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'}`}>{stock.valuation?.rating || '-'}</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-1">AI 預期目標價</p>
              <p className="text-3xl font-mono font-bold text-orange-400">{stock.valuation?.targetPrice || '-'}</p>
            </div>
          </div>

          <div className="relative pt-4 mt-2 border-t border-slate-800/80 z-10">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 rounded-full mb-3" />
            <div className="flex justify-between text-[11px] font-mono text-slate-400 font-medium tracking-wider">
              <div className="text-left">
                 <p>特價</p>
                 <p className="text-emerald-400">{stock.valuation?.extremeCheap || '-'}</p>
              </div>
              <div className="text-center">
                 <p>便宜</p>
                 <p className="text-emerald-300">{stock.valuation?.cheap || '-'}</p>
              </div>
              <div className="text-center">
                 <p>合理</p>
                 <p className="text-yellow-400">{stock.valuation?.fair || '-'}</p>
              </div>
              <div className="text-center">
                 <p>偏貴</p>
                 <p className="text-rose-400">{stock.valuation?.expensive || '-'}</p>
              </div>
               <div className="text-right">
                 <p>極貴</p>
                 <p className="text-rose-600">{stock.valuation?.extremeExpensive || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-[#111624] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-lg h-full">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400"/> 近 20 日 K線與走勢圖
            </h3>
            <div className="h-[300px] w-full text-xs">
              <ResponsiveContainer width="100%" height="80%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} syncId="kline">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    formatter={(value: any, name: string, props: any) => {
                      if (name === 'candleBody') {
                        const d = props.payload;
                        return [`高:${d.high.toFixed(1)} 低:${d.low.toFixed(1)} 開:${d.open.toFixed(1)} 收:${d.close.toFixed(1)}`, 'K棒'];
                      }
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="candleBody" shape={<CandlestickShape />} name="K棒" />
                </ComposedChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height="20%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} syncId="kline">
                  <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#64748b'}} tickMargin={5} axisLine={false} />
                  <YAxis hide />
                  <Bar dataKey="volume" fill="#475569" name="成交量" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="bg-[#111624] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-lg h-full">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400"/> 三大法人近 5 日買賣超
            </h3>
            <div className="h-[250px] w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stock.institutionalData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#1e293b', opacity: 0.4}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <ReferenceLine y={0} stroke="#334155" />
                  <Bar dataKey="f" fill="#3b82f6" name="外資" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="i" fill="#8b5cf6" name="投信" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="d" fill="#14b8a6" name="自營商" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111624] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
        <h3 className="text-lg font-bold text-white flex items-center justify-between mb-6">
           <div className="flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-indigo-400"/> 本益比河流圖 (PE Ratio River)
           </div>
           <span className="text-xs text-slate-500 font-mono">近五年 (60 月)</span>
        </h3>
        <div className="h-[350px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stock.peRiverData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#64748b'}} tickMargin={10} axisLine={false} minTickGap={20} />
              <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Area type="monotone" dataKey="pe30" stroke="none" fill="#ef4444" fillOpacity={0.15} name="30x" />
              <Area type="monotone" dataKey="pe25" stroke="none" fill="#f97316" fillOpacity={0.15} name="25x" />
              <Area type="monotone" dataKey="pe20" stroke="none" fill="#eab308" fillOpacity={0.15} name="20x" />
              <Area type="monotone" dataKey="pe15" stroke="none" fill="#22c55e" fillOpacity={0.15} name="15x" />
              <Area type="monotone" dataKey="pe10" stroke="none" fill="#3b82f6" fillOpacity={0.15} name="10x" />
              <Area type="natural" dataKey="price" stroke="#ffffff" strokeWidth={3} fill="url(#colorPrice)" name="真實股價" />
              <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#111624] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
        <h3 className="text-lg font-bold text-white flex items-center justify-between mb-6">
           <div className="flex items-center gap-2">
             <BarChart3 className="w-5 h-5 text-blue-400"/> 近 12 個月營收與 YoY 趨勢
           </div>
        </h3>
        <div className="h-[300px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={stock.revenueData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{fill: '#64748b'}} tickMargin={10} axisLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val: any) => `${val}%`} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                formatter={(value: any, name: any) => [name === '營收' ? Number(value).toLocaleString() : `${value}%`, name]}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="營收" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#f59e0b" name="YoY" strokeWidth={2} dot={{r: 4}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
