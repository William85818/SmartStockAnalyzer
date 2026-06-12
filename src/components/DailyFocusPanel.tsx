import React, { useState, useEffect } from 'react';
import { Heart, Globe, TrendingUp, TrendingDown, Activity, Newspaper, ChevronRight } from 'lucide-react';
import { StockDetail, fetchMarketTrend, fetchMarketNews, MarketTrend, NewsArticle } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DailyFocusPanel({ market, onSelectStock, pool, watchlist, toggleWatchlist }: {
  market: 'TW' | 'US';
  onSelectStock: (s: StockDetail) => void;
  pool: StockDetail[];
  watchlist: string[];
  toggleWatchlist: (id: string, e?: React.MouseEvent) => void;
}) {
  const [selectedTab, setSelectedTab] = useState<'top'|'hot'>('top');
  const [results, setResults] = useState<StockDetail[]>([]);
  const [trend, setTrend] = useState<MarketTrend | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let filtered = pool;
    if (selectedTab === 'top') {
      filtered = [...pool].sort((a, b) => parseFloat(b.change) - parseFloat(a.change));
    } else {
      filtered = pool.filter(s => s.category === 'high-risk' || s.category === 'stable');
    }
    setResults(filtered.slice(0, 4)); // max 4 items for compact view
  }, [pool, selectedTab]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchMarketTrend(market),
      fetchMarketNews(market)
    ]).then(([trendData, newsData]) => {
      setTrend(trendData);
      setNews(newsData);
      setIsLoading(false);
    });
  }, [market]);

  const tabs = [
    { id: 'top', label: '今日強勢股', icon: TrendingUp },
    { id: 'hot', label: '熱門交易', icon: TrendingDown }
  ] as const;

  return (
    <motion.div key="daily-focus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full">
      <div className="flex items-center gap-2 mb-8">
        <Globe className="w-6 h-6 text-cyan-400" /> 
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {market === 'TW' ? '台股每日焦點' : '美股每日焦點'}
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* 左側：大盤走勢 */}
        <div className="xl:col-span-1 bg-[#111624] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> 市場走勢
          </h3>
          
          {isLoading || !trend ? (
             <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">載入走勢中...</div>
          ) : (
            <>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{trend.name} ({trend.symbol})</p>
                  <p className="text-3xl font-mono font-bold text-white">{trend.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
                <div className={`px-2 py-1 rounded text-sm font-bold ${trend.change.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {trend.change}
                </div>
              </div>
              <div className="h-[180px] w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend.history}>
                    <defs>
                      <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={trend.change.startsWith('+') ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={trend.change.startsWith('+') ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                      labelStyle={{ color: '#94a3b8' }}
                      formatter={(val: number) => [val.toFixed(2), '指數']}
                    />
                    <Area type="monotone" dataKey="value" stroke={trend.change.startsWith('+') ? '#10b981' : '#f43f5e'} strokeWidth={3} fill="url(#trendColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* 中間：即時新聞 */}
        <div className="xl:col-span-1 bg-[#111624] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-blue-400" /> 即時市場新聞
          </h3>
          
          {isLoading ? (
             <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">載入新聞中...</div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[250px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {news.map(item => (
                <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="group block">
                  <div className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-150 transition-transform"></div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 font-mono">{item.source}</span>
                        <span className="text-[10px] text-slate-600">• {new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
              {news.length === 0 && <div className="text-slate-500 text-sm py-4">目前無相關新聞</div>}
            </div>
          )}
        </div>

        {/* 右側：精選個股 */}
        <div className="xl:col-span-1 bg-[#111624] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex bg-[#0d101a] rounded-lg p-1 border border-slate-800">
              {tabs.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setSelectedTab(t.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${selectedTab === t.id ? 'bg-cyan-600/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <t.icon className="w-3 h-3" /> {t.label}
                </button>
              ))}
            </div>
            <button className="p-1 text-slate-500 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[250px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-2">
            <AnimatePresence mode="popLayout">
              {results.map((stock, i) => (
                <motion.div 
                  key={stock.id} 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }} 
                  onClick={() => onSelectStock(stock)} 
                  className="bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/50 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => toggleWatchlist(stock.id, e)} className="p-1.5 hover:bg-slate-700 rounded-full transition-colors">
                      <Heart className={`w-4 h-4 ${watchlist.includes(stock.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                    </button>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{stock.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{stock.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-white">{stock.isLightweight ? '---' : stock.price}</p>
                    <p className={`text-[11px] font-mono font-medium ${stock.change.startsWith('+') ? 'text-emerald-400' : stock.change.startsWith('-') ? 'text-rose-400' : 'text-slate-400'}`}>
                      {stock.change}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
