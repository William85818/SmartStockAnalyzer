import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, ArrowRight, MessageCircle } from 'lucide-react';

export default function TopUpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0f172a] rounded-2xl w-full max-w-md relative z-10 border border-slate-700/50 shadow-2xl overflow-hidden"
        >
          <div className="p-8 text-center border-b border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/5 pointer-events-none"></div>
            <div className="bg-indigo-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
              <CreditCard className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white relative z-10">升級為正式會員</h2>
            <p className="text-slate-400 mt-2 relative z-10 text-sm">解鎖即時 API 報價與無限制的 AI 估價報告</p>
            
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-20">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 relative">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">請匯款至以下指定帳戶</p>
              
              <div className="space-y-3 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">銀行代碼</span>
                  <span className="text-white font-bold text-lg">822 (中國信託)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">銀行帳號</span>
                  <span className="text-emerald-400 font-bold text-xl tracking-wider">123456789</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                  <span className="text-slate-500">升級費用</span>
                  <span className="text-white font-bold text-lg">NT$ 990 / 月</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex gap-3">
              <MessageCircle className="w-6 h-6 text-orange-400 shrink-0" />
              <div className="text-sm text-orange-200/80 leading-relaxed">
                匯款完成後，請聯繫管理員 <span className="font-bold text-orange-400">william0818</span> 並提供您的匯款帳號後五碼。管理員核對無誤後，將從後台為您開通會員帳號。
              </div>
            </div>

            <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              我已了解，稍後匯款 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
