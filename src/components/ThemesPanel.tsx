import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Heart, ChevronRight } from 'lucide-react';
import { topThemes, topThemesUs, StockDetail } from '../data';

export default function ThemesPanel({ market, onSelectStock, watchlist, toggleWatchlist, pool = [] }: {
  market: 'TW' | 'US';
  onSelectStock: (stock: StockDetail) => void;
  watchlist: string[];
  toggleWatchlist: (id: string, e?: React.MouseEvent) => void;
  pool?: StockDetail[];
}) {
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  const currentThemes = market === 'US' ? topThemesUs : topThemes;
  const activeThemeObj = currentThemes.find(t => t.id === activeTheme);
  const themeName = activeThemeObj?.name.split(' (')[0] || '';
  const matchSectors = (activeThemeObj as any)?.matchSectors || [];
  const themeStocks = activeTheme 
    ? pool.filter(s => 
        s.themes.includes(themeName) || 
        s.themes.some(t => activeThemeObj?.name.includes(t)) ||
        matchSectors.some((ms: string) => s.sector.includes(ms) || ms.includes(s.sector))
      ).slice(0, 30)
    : [];

  return (
    <motion.div key="themes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
          <Flame className="w-8 h-8 text-rose-500" />
          熱門題材與資金流向
        </h2>
        <p className="text-slate-400">追蹤市場資金關注的熱門產業與相關概念股。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {currentThemes.map((theme, i) => (
          <motion.button
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActiveTheme(activeTheme === theme.id ? null : theme.id)}
            className={`text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
              activeTheme === theme.id 
                ? (theme.isBullish ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 'bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]')
                : 'bg-[#111624] border-slate-800 hover:border-slate-600 hover:bg-[#1a2133]'
            }`}
          >
             {activeTheme === theme.id && (
               <div className={`absolute inset-0 bg-gradient-to-br from-${theme.isBullish ? 'rose' : 'blue'}-500/10 to-transparent pointer-events-none`} />
             )}
            <div className="flex justify-between items-start mb-1">
              <h4 className={`text-lg font-bold ${activeTheme === theme.id ? (theme.isBullish ? 'text-rose-400' : 'text-blue-400') : 'text-slate-300 group-hover:text-white'}`}>
                {theme.name}
              </h4>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${theme.isBullish ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {theme.isBullish ? '多方資金' : '空方壓力'}
              </span>
            </div>
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
              <span>{activeThemeObj?.name.split(' (')[0]} 相關概念股</span>
              <span className="text-sm font-mono text-slate-500 font-normal">找到 {themeStocks.length} 檔標的</span>
            </h3>

            {themeStocks.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {themeStocks.map((stock, i) => (
                  <motion.button key={stock.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => onSelectStock(stock)} className="bg-[#0d101a] border border-slate-800 hover:border-indigo-500/50 p-6 rounded-2xl transition-all group text-left relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded mr-2 border border-slate-700">{stock.id}</span>
                        <span className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{stock.name}</span>
                      </div>
                      <button onClick={(e) => toggleWatchlist(stock.id, e)} className="text-slate-600 hover:text-rose-500 transition-colors bg-slate-800/50 p-1.5 rounded-full z-10 relative">
                        <Heart className={`w-5 h-5 ${watchlist.includes(stock.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10 pr-8">
                       <span className={`inline-block px-2 py-0.5 rounded text-[10px] mr-2 ${
                         stock.actionAdvice.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' :
                         stock.actionAdvice.action === 'SELL' ? 'bg-rose-500/20 text-rose-400' :
                         'bg-blue-500/20 text-blue-400'
                       }`}>{stock.actionAdvice.action}</span>
                       {stock.analysisSummary?.advice || stock.reason}
                    </p>
                    
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                      <ChevronRight className="w-6 h-6 text-indigo-500/50" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">股價</p>
                        <p className="text-lg font-mono text-white">{stock.isLightweight ? '---' : stock.price}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">漲跌</p>
                        <p className={`text-lg font-mono ${stock.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{stock.change}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{stock.dataLabel}</p>
                        <p className="text-lg font-mono text-slate-300">{stock.dataValue}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                目前沒有符合此主題的標的。
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
