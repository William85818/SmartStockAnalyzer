import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { StockDetail } from '../data';

const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

const generateStableHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// 計算假定的市值/交易量權重，依據產業與 ID 產生穩定的亂數
const getStableVolume = (stock: StockDetail) => {
  const hash = generateStableHash(stock.id);
  let baseWeight = 1000 + (hash % 9000);
  
  // 給予特定產業較高的基礎權重，讓畫面板塊更符合真實台灣市場
  if (stock.sector?.includes('半導體')) baseWeight *= 20;
  if (stock.sector?.includes('金融') || stock.sector?.includes('保險')) baseWeight *= 15;
  if (stock.sector?.includes('航運') || stock.sector?.includes('電腦')) baseWeight *= 10;
  if (stock.sector?.includes('通信') || stock.sector?.includes('光電')) baseWeight *= 5;
  
  return baseWeight * (stock.price > 0 ? stock.price : 10);
};

const CustomTreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, name, change } = props;

  // 根據漲跌幅決定顏色
  let bgColor = '#334155'; // 預設平盤或無資料顏色
  if (change && change.startsWith('+')) {
    bgColor = '#10b981'; // 綠色 (漲)
  } else if (change && change.startsWith('-')) {
    bgColor = '#f43f5e'; // 紅色 (跌)
  }

  // 產業區塊 (depth === 1)
  if (depth === 1) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="rgba(15, 23, 42, 0.4)"
          stroke="#1e293b"
          strokeWidth={2}
        />
        {width > 50 && height > 30 && (
          <text x={x + 6} y={y + 20} fill="#f8fafc" fontSize={14} fontWeight="bold">
            {name}
          </text>
        )}
      </g>
    );
  }

  // 個股區塊 (depth === 2)
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={bgColor}
        stroke="#0f172a"
        strokeWidth={1}
        style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
        className="hover:brightness-125"
      />
      {width > 35 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 4}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={10}
          fontWeight="bold"
        >
          {name}
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data.change) return null; // 如果是產業層級則不顯示

    const isUp = data.change.startsWith('+');
    const isDown = data.change.startsWith('-');
    
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-white font-bold mb-1">{data.name} <span className="text-slate-400 text-xs ml-1">{data.id}</span></p>
        <div className="flex justify-between items-center gap-4">
          <span className="text-slate-300 text-sm">成交價</span>
          <span className="text-white font-mono">{data.price > 0 ? data.price : '---'}</span>
        </div>
        <div className="flex justify-between items-center gap-4 mt-1">
          <span className="text-slate-300 text-sm">漲跌幅</span>
          <span className={`font-mono font-bold ${isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-slate-400'}`}>
            {data.change}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function HeatmapPanel({ pool, onSelectStock }: { pool: StockDetail[], onSelectStock: (s: StockDetail) => void }) {
  
  const heatmapData = useMemo(() => {
    const sectorMap = new Map<string, any[]>();
    
    // Group by sector
    pool.forEach(stock => {
      // 過濾掉沒有產業的或者是大盤指數
      if (!stock.sector || stock.category === 'etf' || stock.sector === 'ETF') return;
      
      const sectorName = stock.sector;
      if (!sectorMap.has(sectorName)) {
        sectorMap.set(sectorName, []);
      }
      
      const size = getStableVolume(stock);
      sectorMap.get(sectorName)!.push({
        name: stock.name,
        id: stock.id,
        size,
        change: stock.change,
        price: stock.price,
        stockData: stock
      });
    });

    // Format for recharts
    const data = Array.from(sectorMap.entries()).map(([name, children]) => {
      // Sort children by size (descending) to render biggest boxes first
      children.sort((a, b) => b.size - a.size);
      
      // Calculate sector average change for coloring/stats
      const totalChange = children.reduce((acc, curr) => {
        const val = parseFloat(curr.change.replace('%', '').replace('+', ''));
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      const avgChange = children.length > 0 ? totalChange / children.length : 0;

      return {
        name,
        children: children.slice(0, 150), // 為了效能，單一產業最多渲染 150 檔代表性個股
        avgChange
      };
    });

    // Sort sectors by size (we need to compute total size)
    data.sort((a, b) => {
      const aSize = a.children.reduce((acc, curr) => acc + curr.size, 0);
      const bSize = b.children.reduce((acc, curr) => acc + curr.size, 0);
      return bSize - aSize;
    });

    return data;
  }, [pool]);

  // 計算強勢/弱勢產業
  const topSectors = [...heatmapData].sort((a, b) => b.avgChange - a.avgChange);
  const bestSector = topSectors[0];
  const worstSector = topSectors[topSectors.length - 1];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <LayoutGrid className="w-6 h-6 text-indigo-400" />
        <h2 className="text-2xl font-bold text-white tracking-tight">產業熱力圖</h2>
        <span className="ml-2 px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-md border border-indigo-500/30">
          全市場板塊動能
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111624] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 mb-1">資金匯聚板塊</p>
            <p className="text-lg font-bold text-white">{heatmapData[0]?.name || '---'}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div className="bg-[#111624] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 mb-1">今日最強勢產業</p>
            <p className="text-lg font-bold text-emerald-400">{bestSector?.name || '---'}</p>
            <p className="text-xs text-emerald-500 mt-0.5">+{bestSector?.avgChange.toFixed(2)}%</p>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div className="bg-[#111624] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 mb-1">今日最弱勢產業</p>
            <p className="text-lg font-bold text-rose-400">{worstSector?.name || '---'}</p>
            <p className="text-xs text-rose-500 mt-0.5">{worstSector?.avgChange.toFixed(2)}%</p>
          </div>
          <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-rose-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#0a0d14] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl p-2 min-h-[600px]">
        {heatmapData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={heatmapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#0f172a"
              content={<CustomTreemapContent />}
              onClick={(e: any) => {
                 if (e && e.stockData) onSelectStock(e.stockData);
              }}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            載入中或無資料...
          </div>
        )}
      </div>
    </motion.div>
  );
}
