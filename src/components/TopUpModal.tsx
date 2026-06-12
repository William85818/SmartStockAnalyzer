import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, ArrowRight, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';

export default function TopUpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [hasSentEmail, setHasSentEmail] = useState(false);
  const [cooldownTime, setCooldownTime] = useState('');
  const [requestAccount, setRequestAccount] = useState('');
  const [bankAccountEnd, setBankAccountEnd] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    
    const checkCooldown = () => {
      const historyStr = localStorage.getItem('alphaFlow_topup_email_history');
      if (historyStr) {
        try {
          const history = JSON.parse(historyStr) as number[];
          const oneDayMs = 24 * 60 * 60 * 1000;
          const now = Date.now();
          const recentHistory = history.filter(time => now - time < oneDayMs);
          
          if (recentHistory.length >= 3) {
            setHasSentEmail(true);
            const oldestTime = recentHistory[0];
            const remainingMs = oneDayMs - (now - oldestTime);
            const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
            const remainingMins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
            setCooldownTime(`${remainingHours} 小時 ${remainingMins} 分`);
          } else {
            setHasSentEmail(false);
          }
          
          if (recentHistory.length !== history.length) {
            localStorage.setItem('alphaFlow_topup_email_history', JSON.stringify(recentHistory));
          }
        } catch(e) {}
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSendEmail = () => {
    if (hasSentEmail || !requestAccount || !bankAccountEnd) return;
    
    const historyStr = localStorage.getItem('alphaFlow_topup_email_history');
    let history: number[] = [];
    if (historyStr) {
      try { history = JSON.parse(historyStr); } catch(e) {}
    }
    history.push(Date.now());
    localStorage.setItem('alphaFlow_topup_email_history', JSON.stringify(history));
    
    if (history.length >= 3) {
      setHasSentEmail(true);
      setCooldownTime('23 小時 59 分');
    }
    
    const email = "wang850818@gmail.com";
    const subject = encodeURIComponent("SmartStockAnalyzer 會員升級匯款通知");
    const body = encodeURIComponent(`管理員您好，\n\n我已經完成匯款，請協助查核並開通會員權限。\n\n欲註冊帳號：${requestAccount}\n(預設密碼為 0000)\n\n匯款帳號後五碼：${bankAccountEnd}\n\n謝謝！`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

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
                匯款完成後，請先在下方輸入您的欲註冊帳號及匯款後五碼，再點擊發送申請。核對無誤後我們將為您開通會員 <span className="font-bold text-orange-400">(預設密碼為 0000)</span>。
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="欲註冊之帳號 (開通後預設密碼為 0000)"
                  value={requestAccount}
                  onChange={(e) => setRequestAccount(e.target.value)}
                  className="w-full bg-[#1e293b] text-white border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors text-sm placeholder:text-slate-500"
                />
                <input
                  type="text"
                  placeholder="您的匯款帳號後五碼"
                  maxLength={5}
                  value={bankAccountEnd}
                  onChange={(e) => setBankAccountEnd(e.target.value)}
                  className="w-full bg-[#1e293b] text-white border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors text-sm placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleSendEmail}
                  disabled={hasSentEmail || !requestAccount || !bankAccountEnd}
                  className={`w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    hasSentEmail 
                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50' 
                      : (!requestAccount || !bankAccountEnd)
                        ? 'bg-indigo-600/50 text-indigo-200/50 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                  }`}
              >
                {hasSentEmail ? (
                  <><CheckCircle2 className="w-5 h-5" /> 信件已發送 (請於 {cooldownTime} 後再試)</>
                ) : (
                  <><Mail className="w-5 h-5" /> 匯款完成，通知管理員審核</>
                )}
              </button>
              
              <button onClick={onClose} className="w-full bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-bold py-3 rounded-lg transition-colors border border-transparent hover:border-slate-700">
                稍後再說
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
