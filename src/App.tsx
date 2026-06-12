import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Heart, Flame, Filter, PieChart, Home, AlertCircle
} from 'lucide-react';
import { 
  StockDetail, 
  fetchAllStockSymbols, 
  fetchSingleStockDetail, 
  mockUsStocks, 
  mockStocks,
  checkIsDemoMode,
  cleanupFirebaseCache
} from './data';

import ScreenerPanel from './components/ScreenerPanel';
import StockDetailPanel from './components/StockDetailPanel';
import WatchlistPanel from './components/WatchlistPanel';
import ThemesPanel from './components/ThemesPanel';
import FilterPanel from './components/FilterPanel';
import EtfThemesPanel from './components/EtfThemesPanel';
import HeatmapPanel from './components/HeatmapPanel';
import SettingsModal from './components/SettingsModal';
import { Settings, Globe, Loader2, LayoutGrid } from 'lucide-react';

type Route = 'screener' | 'watchlist' | 'themes' | 'filter' | 'etfthemes' | 'heatmap';

export default function App() {
  const [activeRoute, setActiveRoute] = useState<Route>('screener');
  const [selectedStock, setSelectedStock] = useState<StockDetail | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [realStocks, setRealStocks] = useState<StockDetail[]>([]);
  const [loadingRealData, setLoadingRealData] = useState(true);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [market, setMarket] = useState<'TW' | 'US'>('TW');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isDemoMode = checkIsDemoMode(market);

  // 載入 Watchlist
  useEffect(() => {
    const saved = localStorage.getItem('alphaFlow_watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  // 儲存 Watchlist
  useEffect(() => {
    localStorage.setItem('alphaFlow_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    const loadData = async () => {
      setLoadingRealData(true);
      try {
        const data = await fetchAllStockSymbols(market);
        setRealStocks(data); 
      } catch (e) {
        console.error(e);
        setRealStocks(market === 'US' ? mockUsStocks : mockStocks);
      }
      setLoadingRealData(false);
    };
    loadData();
    // Cleanup old Firebase cache entries
    cleanupFirebaseCache();
  }, [market]);

  const toggleWatchlist = (stockId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchlist(prev => 
      prev.includes(stockId) ? prev.filter(id => id !== stockId) : [...prev, stockId]
    );
  };

  const watchlistedStocks = realStocks.filter(s => watchlist.includes(s.id));

  const handleNav = (route: Route) => {
    setActiveRoute(route);
    setSelectedStock(null);
  };

  const handleSelectStock = async (stock: StockDetail) => {
    if (market === 'TW') {
      setIsFetchingDetail(true);
      const detail = await fetchSingleStockDetail(stock, market);
      setSelectedStock(detail);
      setIsFetchingDetail(false);
    } else {
      setSelectedStock(stock);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b14] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col md:flex-row">
      
      {/* 側邊導覽列 */}
      {!selectedStock && (
      <aside className="w-full md:w-64 bg-[#0d111d] border-b md:border-b-0 md:border-r border-slate-800/60 p-6 flex flex-col z-20 shrink-0">
        <div className="flex flex-col gap-3 mb-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('screener')}>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">AlphaFlow</h1>
              <p className="text-[10px] text-blue-400 font-mono tracking-wider">AI ANALYTICS</p>
            </div>
          </div>
          {isDemoMode && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold w-max shadow-sm">
              <AlertCircle className="w-3 h-3" /> DEMO MODE
            </div>
          )}
        </div>

        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => handleNav('screener')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
              activeRoute === 'screener' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Home className="w-5 h-5" />
            首頁大廳
          </button>

          <button 
            onClick={() => handleNav('themes')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
              activeRoute === 'themes' 
                ? 'bg-orange-600/10 text-orange-500 border border-orange-500/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Flame className="w-5 h-5" />
            熱門題材
          </button>

          <button 
            onClick={() => handleNav('etfthemes')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
              activeRoute === 'etfthemes' 
                ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            <PieChart className="w-5 h-5" />
            ETF 選題材
          </button>

          <button 
            onClick={() => handleNav('filter')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
              activeRoute === 'filter' 
                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Filter className="w-5 h-5" />
            進階篩選
          </button>

          <button 
            onClick={() => handleNav('heatmap')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
              activeRoute === 'heatmap' 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            產業熱力圖
          </button>
          
          <button 
            onClick={() => handleNav('watchlist')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
              activeRoute === 'watchlist' 
                ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Heart className="w-5 h-5" />
            股票收藏庫
            {watchlist.length > 0 && (
              <span className="ml-auto bg-slate-800 text-slate-300 text-xs py-0.5 px-2 rounded-full border border-slate-700">
                {watchlist.length}
              </span>
            )}
          </button>
        </nav>

        <div className="mt-auto hidden md:flex flex-col gap-4 pt-6 border-t border-slate-800">
          
          <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Globe className="w-4 h-4" /> <span>市場</span>
            </div>
            <div className="flex bg-[#090b14] rounded-md overflow-hidden border border-slate-700/50 p-0.5">
              <button 
                onClick={() => setMarket('TW')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${market === 'TW' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
              >
                台股
              </button>
              <button 
                onClick={() => setMarket('US')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${market === 'US' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
              >
                美股
              </button>
            </div>
          </div>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            <Settings className="w-4 h-4" /> API 設定
          </button>

          <p className="text-xs text-slate-500 font-mono flex items-center gap-2 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Online
          </p>
        </div>
      </aside>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* 主要內容區 */}
      <main className={`flex-1 p-6 md:p-8 xl:p-10 mx-auto w-full overflow-y-auto ${selectedStock ? 'lg:max-w-7xl' : 'lg:max-w-[1400px]'}`}>
        
        {loadingRealData ? (
           <div className="flex h-full items-center justify-center text-slate-500">
             處理龐大市場數據中...
           </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {isFetchingDetail ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400 gap-4 mt-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                正在拉取最新報價與資料...
              </div>
            ) : selectedStock ? (
              <StockDetailPanel 
                stock={selectedStock} 
                setStock={setSelectedStock} 
                watchlist={watchlist} 
                toggleWatchlist={toggleWatchlist} 
              />
            ) : activeRoute === 'screener' ? (
              <ScreenerPanel 
                market={market}
                onSelectStock={(s) => { handleSelectStock(s); }} 
                watchlist={watchlist} 
                toggleWatchlist={toggleWatchlist} 
                pool={realStocks.filter(s => s.category !== 'etf')}
              />
            ) : activeRoute === 'themes' ? (
              <ThemesPanel 
                market={market}
                onSelectStock={(s) => { handleSelectStock(s); }} 
                watchlist={watchlist} 
                toggleWatchlist={toggleWatchlist} 
                pool={realStocks.filter(s => s.category !== 'etf')}
              />
            ) : activeRoute === 'etfthemes' ? (
              <EtfThemesPanel 
                market={market}
                onSelectStock={(s) => { handleSelectStock(s); }}
                watchlist={watchlist} 
                toggleWatchlist={toggleWatchlist}
                pool={realStocks}
              />
            ) : activeRoute === 'filter' ? (
              <FilterPanel 
                onSelectStock={(s) => { handleSelectStock(s); }} 
                watchlist={watchlist} 
                toggleWatchlist={toggleWatchlist} 
                pool={realStocks.filter(s => s.category !== 'etf')}
              />
            ) : activeRoute === 'heatmap' ? (
              <HeatmapPanel 
                pool={realStocks} 
                onSelectStock={(s) => { handleSelectStock(s); }}
              />
            ) : activeRoute === 'watchlist' ? (
              <WatchlistPanel 
                watchlistedStocks={watchlistedStocks} 
                onSelectStock={(s) => { handleSelectStock(s); }} 
                toggleWatchlist={toggleWatchlist}
                onGoToScreener={() => handleNav('screener')}
              />
            ) : null}

          </AnimatePresence>
        )}
      </main>

    </div>
  );
}


