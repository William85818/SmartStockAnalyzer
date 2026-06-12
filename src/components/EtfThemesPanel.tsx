import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Heart, Search, ChevronRight } from 'lucide-react';
import { mockEtfs, mockEtfsUs, etfThemes, etfThemesUs, StockDetail } from '../data';

export default function EtfThemesPanel({ market, onSelectStock, watchlist, toggleWatchlist }: {
  market: 'TW' | 'US';
  onSelectStock: (stock: StockDetail) => void;
  watchlist: string[];
  toggleWatchlist: (id: string, e?: React.MouseEvent) => void;
}) {
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  const currentThemes = market === 'US' ? etfThemesUs : etfThemes;
  const currentEtfs = market === 'US' ? mockEtfsUs : mockEtfs;

  const activeThemeObj = currentThemes.find(t => t.id === activeTheme);
  const themeEtfs = activeTheme 
    ? currentEtfs.filter(s => s.themes.includes(activeThemeObj?.name || ''))
    : [];

  return (
    <motion.div key="etfthemes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
          <PieChart className="w-8 h-8 text-cyan-400" />
          ETF 題材精選
        </h2>
        <p className="text-slate-400">掌握大環境趨勢，挑選適合您資產配置的 ETF。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {currentThemes.map((theme, i) => (
          <motion.button
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActiveTheme(activeTheme === theme.id ? null : theme.id)}
            className={`text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
              activeTheme === theme.id 
                ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                : 'bg-[#111624] border-slate-800 hover:border-slate-600 hover:bg-[#1a2133]'
            }`}
          >
            {activeTheme === theme.id && (
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
            )}
            <h4 className={`text-lg font-bold mb-1 ${activeTheme === theme.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
              {theme.name}
            </h4>
            <p className="text-xs text-slate-500">{theme.desc}</p>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTheme && (
          <motion.div
            key={activeTheme}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-[#111624] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl"
          >
            <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4 flex items-center justify-between">
              <span>{activeThemeObj?.name} ETF</span>
              <span className="text-sm font-mono text-slate-500 font-normal">找到 {themeEtfs.length} 檔標的</span>
            </h3>

            {themeEtfs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {themeEtfs.map((etf, i) => (
                  <motion.button 
                    key={etf.id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.05 }} 
                    onClick={() => onSelectStock(etf)}
                    className="bg-[#0d101a] border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl transition-all group text-left relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded mr-2 border border-slate-700">{etf.id}</span>
                        <span className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{etf.name}</span>
                      </div>
                      <button 
                        onClick={(e) => toggleWatchlist(etf.id, e)} 
                        className="text-slate-600 hover:text-rose-500 transition-colors bg-slate-800/50 p-1.5 rounded-full z-10 relative"
                      >
                        <Heart className={`w-5 h-5 ${watchlist.includes(etf.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10 pr-8">{etf.reason}</p>
                    
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                      <ChevronRight className="w-6 h-6 text-cyan-500/50" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">參考價</p>
                        <p className="text-lg font-mono text-white">{etf.price}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">殖利率</p>
                        <p className="text-lg font-mono text-emerald-400">{etf.yieldRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">內扣費用</p>
                        <p className="text-lg font-mono text-slate-300">{etf.expenseRatio}%</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                目前沒有符合此主題的 ETF。
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
