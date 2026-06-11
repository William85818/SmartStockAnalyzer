import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Activity } from 'lucide-react';
import { StockDetail } from '../data';

export default function WatchlistPanel({ 
  watchlistedStocks, onSelectStock, toggleWatchlist, onGoToScreener 
}: {
  watchlistedStocks: StockDetail[];
  onSelectStock: (s: StockDetail) => void;
  toggleWatchlist: (id: string, e?: React.MouseEvent) => void;
  onGoToScreener: () => void;
}) {
  return (
    <motion.div key="watchlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">股票收藏庫</h2>
        <p className="text-slate-400">您關注的標的將儲存於此，方便隨時查看最新分析。</p>
      </div>

      {watchlistedStocks.length === 0 ? (
        <div className="bg-[#111624] border border-slate-800 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <Heart className="w-16 h-16 text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-slate-300 mb-2">您的收藏庫空空如也</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            前往「AI 智慧選股」或「進階篩選」挑選適合您的標的，並點擊愛心加入收藏。
          </p>
          <button onClick={onGoToScreener} className="mt-6 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors border border-blue-500/30 px-6 py-2 rounded-full hover:bg-blue-500/10">
            前往選股
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {watchlistedStocks.map((stock, i) => (
              <motion.div key={stock.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }} onClick={() => onSelectStock(stock)} className="bg-[#111624] border border-slate-800 hover:border-blue-500/50 p-5 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <span className="inline-block px-2.5 py-1 bg-[#1a2133] text-slate-300 text-xs font-mono font-medium rounded mb-2 border border-slate-700/50">
                        {stock.id}
                      </span>
                      <h4 className="text-xl font-bold text-white">{stock.name}</h4>
                    </div>
                    <button onClick={(e) => toggleWatchlist(stock.id, e)} className="p-1 -mr-1 hover:bg-slate-800 rounded-full transition-colors z-20">
                      <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-6 bg-slate-900/50 p-3 rounded-xl border border-slate-800 relative z-10">
                  <Activity className="w-4 h-4 text-blue-400 shrink-0"/>
                  <p className="text-xs text-slate-300 line-clamp-1">{stock.aiReport.prediction}</p>
                </div>

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
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
