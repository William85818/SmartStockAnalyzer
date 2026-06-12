import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, TrendingUp, TrendingDown, Activity, Minus, ArrowRight } from 'lucide-react';
import { StockDetail } from '../data';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function MarketOverviewPanel({ pool, onSelectStock }: { 
  pool: StockDetail[];
  onSelectStock: (s: StockDetail) => void;
}) {
  const [activeTab, setActiveTab] = useState<'limitUp' | 'limitDown'>('limitUp');

  const { upCount, downCount, flatCount, limitUpStocks, limitDownStocks } = useMemo(() => {
    let up = 0;
    let down = 0;
    let flat = 0;
    const lUp: StockDetail[] = [];
    const lDown: StockDetail[] = [];

    pool.forEach(stock => {
      if (stock.category === 'etf') return; // 可選擇排除 ETF 或保留，這裡保留一般個股
      
      const changeStr = stock.change.replace('%', '').replace('+', '').trim();
      const changeVal = parseFloat(changeStr) || 0;

      if (changeVal > 0) {
        up++;
        if (changeVal >= 9.8) {
          lUp.push(stock);
        }
      } else if (changeVal < 0) {
        down++;
        if (changeVal <= -9.8) {
          lDown.push(stock);
        }
      } else {
        flat++;
      }
    });

    return { 
      upCount: up, 
      downCount: down, 
      flatCount: flat, 
      limitUpStocks: lUp.sort((a,b) => parseFloat(b.change) - parseFloat(a.change)), 
      limitDownStocks: lDown.sort((a,b) => parseFloat(a.change) - parseFloat(b.change)) 
    };
  }, [pool]);

  const pieData = [
    { name: '上漲', value: upCount, color: '#10b981' },
    { name: '下跌', value: downCount, color: '#f43f5e' },
    { name: '平盤', value: flatCount, color: '#64748b' }
  ];

  return (
    <motion.div key="overviewPanel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full space-y-6">
      <div className="flex items-center gap-2 mb-8">
        <Activity className="w-6 h-6 text-purple-400" /> 
        <h2 className="text-2xl font-bold text-white tracking-tight">市場概況與漲跌停</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 左側：漲跌家數圓餅圖與統計 */}
        <div className="lg:col-span-1 bg-[#111624] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" /> 市場漲跌分佈 (扣除ETF)
          </h3>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-mono font-bold text-white">{upCount + downCount + flatCount}</span>
                <span className="text-xs text-slate-500">上市加上櫃</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 mt-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                <p className="text-xs text-emerald-400/70 mb-1 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3"/> 上漲</p>
                <p className="text-xl font-mono font-bold text-emerald-400">{upCount}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-1"><Minus className="w-3 h-3"/> 平盤</p>
                <p className="text-xl font-mono font-bold text-slate-300">{flatCount}</p>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-center">
                <p className="text-xs text-rose-400/70 mb-1 flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3"/> 下跌</p>
                <p className="text-xl font-mono font-bold text-rose-400">{downCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：漲跌停清單 */}
        <div className="lg:col-span-2 bg-[#111624] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
               <Activity className="w-4 h-4 text-orange-400" /> 漲跌停排行榜
            </h3>
            <div className="flex bg-[#0d101a] rounded-lg p-1 border border-slate-800">
              <button 
                onClick={() => setActiveTab('limitUp')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-2 ${activeTab === 'limitUp' ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                漲停 ({limitUpStocks.length})
              </button>
              <button 
                onClick={() => setActiveTab('limitDown')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-2 ${activeTab === 'limitDown' ? 'bg-rose-600/20 text-rose-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                跌停 ({limitDownStocks.length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-2">
            <AnimatePresence mode="wait">
              {activeTab === 'limitUp' ? (
                <motion.div key="limitUp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {limitUpStocks.length > 0 ? limitUpStocks.map((s, i) => (
                    <div key={s.id} onClick={() => onSelectStock(s)} className="bg-slate-900/50 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/30 p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          {s.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono mt-1">{s.id} | {s.sector}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-mono font-bold text-white">{s.price}</p>
                        <p className="text-[12px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-1 inline-block">{s.change}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center text-slate-500 py-12 text-sm">今日無漲停個股</div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="limitDown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {limitDownStocks.length > 0 ? limitDownStocks.map((s, i) => (
                    <div key={s.id} onClick={() => onSelectStock(s)} className="bg-slate-900/50 hover:bg-slate-800 border border-slate-800/80 hover:border-rose-500/30 p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          {s.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono mt-1">{s.id} | {s.sector}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-mono font-bold text-white">{s.price}</p>
                        <p className="text-[12px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded mt-1 inline-block">{s.change}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center text-slate-500 py-12 text-sm">今日無跌停個股</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
