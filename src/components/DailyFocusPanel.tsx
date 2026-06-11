import React, { useState, useEffect } from 'react';
import { Search, Heart, Globe, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { StockDetail } from '../data';
import { motion, AnimatePresence } from 'motion/react';

export default function DailyFocusPanel({ market, onSelectStock, pool, watchlist, toggleWatchlist }: {
  market: 'TW' | 'US';
  onSelectStock: (s: StockDetail) => void;
  pool: StockDetail[];
  watchlist: string[];
  toggleWatchlist: (id: string, e?: React.MouseEvent) => void;
}) {
  const [selectedTab, setSelectedTab] = useState<'top'|'hot'>('top');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<StockDetail[]>([]);

  useEffect(() => {
    let filtered = pool;
    if (selectedTab === 'top') {
      filtered = [...pool].sort((a, b) => parseFloat(b.change) - parseFloat(a.change));
    } else {
      filtered = pool.filter(s => s.category === 'high-risk' || s.category === 'stable');
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(s => s.id.includes(searchQuery) || s.name.includes(searchQuery));
    }

    setResults(filtered.slice(0, 10)); // max 10 items
  }, [pool, selectedTab, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const tabs = [
    { id: 'top', label: '今日強勢股', icon: TrendingUp, desc: '漲幅居前標的' },
    { id: 'hot', label: '熱門交易', icon: TrendingDown, desc: '成交量大或關注度高' }
  ] as const;

  return (
    <motion.div key="daily-focus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
            <Globe className="text-cyan-400" /> {market === 'TW' ? '台股每日焦點' : '美股每日焦點'}
          </h2>
          <p className="text-slate-400">獲取即時市場動態與今日精選標的。</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="代號或名稱" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111624] border border-slate-700 text-white pl-4 pr-10 py-2.5 rounded-full outline-none focus:border-blue-500 transition-colors"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="bg-[#111624] rounded-2xl border border-slate-800 p-6 md:p-8 shadow-xl mb-12">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-800 pb-4">
          焦點看板切換
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tabs.map(s => {
            const Icon = s.icon;
            const isActive = selectedTab === s.id;
            return (
              <button key={s.id} onClick={() => setSelectedTab(s.id)} className={`text-left p-5 rounded-xl border transition-all duration-300 ${isActive ? 'bg-cyan-600/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50' : 'bg-[#0d101a] border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'}`}>
                <Icon className={`w-6 h-6 mb-3 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <h4 className={`font-bold mb-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>{s.label}</h4>
                <p className={`text-xs ${isActive ? 'text-cyan-200/80' : 'text-slate-500'}`}>{s.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <Clock className="w-5 h-5 text-cyan-500"/> 最新報價 ({results.length})
          </h3>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {results.map((stock, i) => (
                <motion.div key={stock.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} onClick={() => onSelectStock(stock)} className="bg-[#111624] border border-slate-800 hover:border-cyan-500/50 p-5 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <span className="inline-block px-2.5 py-1 bg-[#1a2133] text-slate-300 text-xs font-mono font-medium rounded mb-2 border border-slate-700/50">{stock.id}</span>
                      <h4 className="text-xl font-bold text-white">{stock.name}</h4>
                    </div>
                    <button onClick={(e) => toggleWatchlist(stock.id, e)} className="p-1 -mr-1 hover:bg-slate-800 rounded-full transition-colors z-20">
                      <Heart className={`w-5 h-5 ${watchlist.includes(stock.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                    </button>
                  </div>
                  <p className="text-sm font-light text-slate-400 mb-6 line-clamp-2 relative z-10">{stock.reason}</p>
                  <div className="flex items-end justify-between border-t border-slate-800/80 pt-4 relative z-10">
                    <div>
                      <p className="text-xs text-slate-500 mb-1 tracking-wider uppercase font-medium">{stock.dataLabel}</p>
                      <p className={`text-sm font-mono ${stock.change.startsWith('+') ? 'text-emerald-400' : stock.change.startsWith('-') ? 'text-rose-400' : 'text-slate-400'}`}>
                        {stock.change}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-mono font-bold text-white leading-none">{stock.price}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 py-10 text-center">沒有可用標的</div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
