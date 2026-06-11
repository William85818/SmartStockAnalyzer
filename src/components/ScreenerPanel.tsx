import React, { useState } from 'react';
import { Search, Heart, Zap, ShieldCheck, Building2, Activity } from 'lucide-react';
import { mockStocks, strategies, StockDetail } from '../data';
import { motion, AnimatePresence } from 'motion/react';

export default function ScreenerPanel({ onSelectStock, watchlist, toggleWatchlist }: {
  onSelectStock: (s: StockDetail) => void;
  watchlist: string[];
  toggleWatchlist: (id: string, e?: React.MouseEvent) => void;
}) {
  const [selectedStrategy, setSelectedStrategy] = useState('stable');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<StockDetail[] | null>(null);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setResults(null);
    setTimeout(() => {
      setResults(mockStocks.filter(s => s.category === selectedStrategy));
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = mockStocks.filter(s => 
      s.id.includes(searchQuery) || s.name.includes(searchQuery)
    );
    setResults(found);
    setIsAnalyzing(false);
  };

  return (
    <motion.div key="screener" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">AI 智慧選股</h2>
          <p className="text-slate-400">根據您的投資偏好，演算法將掃描市場並給出最佳量化推薦。</p>
        </div>
        
        {/* 代號查詢 Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="台股代號或名稱" 
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
          STEP 1: 選擇投資偏好
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {strategies.map(s => {
            const Icon = s.icon;
            const isActive = selectedStrategy === s.id;
            return (
              <button key={s.id} onClick={() => setSelectedStrategy(s.id)} className={`text-left p-5 rounded-xl border transition-all duration-300 ${isActive ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50' : 'bg-[#0d101a] border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'}`}>
                <Icon className={`w-6 h-6 mb-3 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <h4 className={`font-bold mb-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>{s.label}</h4>
                <p className={`text-xs ${isActive ? 'text-blue-200/80' : 'text-slate-500'}`}>{s.desc}</p>
              </button>
            )
          })}
        </div>
        <div className="flex justify-end">
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2">
            {isAnalyzing ? <><Activity className="w-5 h-5 animate-pulse" /> AI 運算中...</> : <><Zap className="w-5 h-5" /> 開始 AI 運算</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {results && !isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Search className="w-5 h-5 text-blue-500"/> 推薦清單 ({results.length})
            </h3>
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {results.map((stock, i) => (
                  <motion.div key={stock.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} onClick={() => onSelectStock(stock)} className="bg-[#111624] border border-slate-800 hover:border-blue-500/50 p-5 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden">
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
                        <p className="text-sm font-mono text-blue-400">{stock.dataValue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-mono font-bold text-white leading-none">{stock.price}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 py-10 text-center">找不到符合條件的股票</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
