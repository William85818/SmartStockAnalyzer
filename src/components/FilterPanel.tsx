import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, ChevronRight, Heart, Search } from 'lucide-react';
import { StockDetail } from '../data';

export default function FilterPanel({ onSelectStock, watchlist, toggleWatchlist, pool }: {
  onSelectStock: (s: StockDetail) => void;
  watchlist: string[];
  toggleWatchlist: (id: string, e?: React.MouseEvent) => void;
  pool: StockDetail[];
}) {
  const [selectedSector, setSelectedSector] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPe, setMaxPe] = useState<number>(30);
  const [minYield, setMinYield] = useState<number>(0);

  const sectors = useMemo(() => {
    const s = new Set(pool.map(stock => stock.sector));
    return ['All', ...Array.from(s)];
  }, [pool]);

  const filteredStocks = useMemo(() => {
    return pool.filter(stock => {
      const matchSector = selectedSector === 'All' || stock.sector === selectedSector;
      const matchSearch = stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || stock.id.includes(searchQuery);
      const matchPe = stock.peRatio <= maxPe;
      const matchYield = stock.yieldRate >= minYield;
      return matchSector && matchSearch && matchPe && matchYield;
    }).slice(0, 10);
  }, [selectedSector, searchQuery, maxPe, minYield, pool]);

  return (
    <motion.div key="filter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
          <Filter className="w-8 h-8 text-purple-500" />
          進階篩選
        </h2>
        <p className="text-slate-400">自訂篩選條件，精準找出潛力標的。（最多顯示 10 檔）</p>
      </div>

      <div className="bg-[#111624] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl mb-10 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">產業類別</label>
          <select 
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full bg-[#0d101a] border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 appearance-none"
          >
            <option value="All">全部產業</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
            <span>本益比 (PE) 低於</span>
            <span className="text-purple-400 font-mono">{maxPe}x</span>
          </label>
          <input 
            type="range" min="10" max="50" step="1" 
            value={maxPe} onChange={(e) => setMaxPe(Number(e.target.value))}
            className="w-full accent-purple-500 bg-slate-800 rounded-lg appearance-none h-2 cursor-pointer"
          />
        </div>

        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
            <span>殖利率高於</span>
            <span className="text-emerald-400 font-mono">{minYield}%</span>
          </label>
          <input 
            type="range" min="0" max="8" step="0.5" 
            value={minYield} onChange={(e) => setMinYield(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 rounded-lg appearance-none h-2 cursor-pointer"
          />
        </div>
      </div>

      {/* 篩選結果總攬列表 */}
      <div className="bg-[#111624] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <h3 className="font-bold text-white text-lg">篩選結果總攬</h3>
          <span className="text-sm font-mono text-slate-400">顯示 {filteredStocks.length} 筆</span>
        </div>
        
        {filteredStocks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-500 uppercase bg-[#0d101a] border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">代號 / 名稱</th>
                  <th className="px-6 py-4 font-medium">產業</th>
                  <th className="px-6 py-4 font-medium">股價</th>
                  <th className="px-6 py-4 font-medium">本益比</th>
                  <th className="px-6 py-4 font-medium">殖利率</th>
                  <th className="px-6 py-4 font-medium text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredStocks.map((stock, i) => (
                    <motion.tr 
                      key={stock.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer group"
                      onClick={() => onSelectStock(stock)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-400 text-xs">{stock.id}</span>
                          <span className="font-bold text-white group-hover:text-purple-400 transition-colors">{stock.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{stock.sector}</td>
                      <td className="px-6 py-4 font-mono font-medium text-white">{stock.isLightweight ? '---' : stock.price}</td>
                      <td className="px-6 py-4 font-mono text-blue-400">{stock.peRatio}x</td>
                      <td className="px-6 py-4 font-mono text-emerald-400">{stock.yieldRate}%</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(stock.id, e);
                          }}
                          className="p-1.5 hover:bg-slate-700 rounded-md transition-colors inline-flex"
                        >
                          <Heart className={`w-4 h-4 ${watchlist.includes(stock.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            沒有符合目前條件的股票。請嘗試放寬篩選標準。
          </div>
        )}
      </div>

    </motion.div>
  );
}
