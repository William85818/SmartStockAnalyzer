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
import MarketOverviewPanel from './components/MarketOverviewPanel';
import SettingsModal from './components/SettingsModal';
import LoginModal from './components/LoginModal';
import TopUpModal from './components/TopUpModal';
import { Settings, Globe, Loader2, LayoutGrid, ActivitySquare, UserCircle, Crown, AlertTriangle } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

type Route = 'screener' | 'watchlist' | 'themes' | 'filter' | 'etfthemes' | 'heatmap' | 'overview';

export default function App() {
  const { user, isLoading } = useAuth();
  const [activeRoute, setActiveRoute] = useState<Route>('screener');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockDetail | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [realStocks, setRealStocks] = useState<StockDetail[]>([]);
  const [loadingRealData, setLoadingRealData] = useState(true);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [market, setMarket] = useState<'TW' | 'US'>('TW');

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
      
      {/* DEMO MODE Banner */}
      {user?.role === 'guest' && !isLoading && (
        <div className="bg-orange-500 text-white py-1 px-4 text-center text-xs font-bold tracking-widest flex items-center justify-center gap-2 relative z-50 shadow-md">
          <AlertTriangle className="w-3 h-3" /> DEMO MODE (訪客唯讀模式) - 您正在瀏覽昨日的快取歷史資料，請登入或升級會員獲取即時大數據分析！
        </div>
      )}

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
            onClick={() => handleNav('overview')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
              activeRoute === 'overview' 
                ? 'bg-orange-600/10 text-orange-400 border border-orange-500/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            <ActivitySquare className="w-5 h-5" />
            市場概況
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

          {/* User / Login Area at bottom of sidebar */}
          <div className="p-4 border-t border-slate-800/50 space-y-2">
            {user?.role === 'guest' ? (
              <>
                <button 
                  onClick={() => setIsTopUpOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white py-2.5 rounded-lg transition-all font-bold shadow-lg shadow-orange-500/20 text-sm"
                >
                  <Crown className="w-4 h-4" /> 升級正式會員
                </button>
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white py-2 transition-colors text-sm font-medium"
                >
                  <UserCircle className="w-4 h-4" /> 帳號登入
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 text-white px-3 py-2.5 rounded-lg transition-all text-sm"
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold">{user?.username}</span>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {user?.role}
                  </span>
                </button>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    <Settings className="w-4 h-4" /> 系統設定 (Admin)
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 font-mono flex items-center gap-2 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Online
          </p>
        </div>
      </aside>
      )}

      {isSettingsOpen && user?.role === 'admin' && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />

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
            ) : activeRoute === 'overview' ? (
              <MarketOverviewPanel 
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


