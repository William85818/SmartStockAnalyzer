import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Key, AlertCircle, RefreshCw } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [finmindKey, setFinmindKey] = useState('');
  const [alpacaKey, setAlpacaKey] = useState('');
  const [alpacaSecret, setAlpacaSecret] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadKeys();
    }
  }, [isOpen]);

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const configRef = doc(db, 'system', 'config');
      const snap = await getDoc(configRef);
      if (snap.exists()) {
        const data = snap.data();
        setFinmindKey(data.finmindKey || '');
        setAlpacaKey(data.alpacaKey || '');
        setAlpacaSecret(data.alpacaSecret || '');
        setOpenaiKey(data.openaiKey || '');
      }
    } catch (e) {
      console.error('Failed to load keys', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const configRef = doc(db, 'system', 'config');
      await setDoc(configRef, {
        finmindKey,
        alpacaKey,
        alpacaSecret,
        openaiKey
      }, { merge: true });
      onClose();
    } catch (e) {
      console.error('Failed to save keys', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0d111d] border border-slate-800 rounded-2xl z-50 shadow-2xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-400" />
                  API 金鑰設定
                </h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                  <p>載入雲端金鑰中...</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                    <p className="text-sm text-indigo-200">
                      此設定將套用至全球所有使用者。<br/>
                      請勿洩漏您的 API 金鑰。儲存後，所有即時報價與 AI 報告均會扣除這些帳號的額度。
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">OpenAI / LLM API Key (用於生成報告)</label>
                      <input 
                        type="password" 
                        value={openaiKey}
                        onChange={e => setOpenaiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-[#111624] border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-1">FinMind API Key (台股)</label>
                      <input 
                        type="password" 
                        value={finmindKey}
                        onChange={e => setFinmindKey(e.target.value)}
                        placeholder="FinMind Token..."
                        className="w-full bg-[#111624] border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Alpaca API Key (美股)</label>
                      <input 
                        type="password" 
                        value={alpacaKey}
                        onChange={e => setAlpacaKey(e.target.value)}
                        placeholder="PK..."
                        className="w-full bg-[#111624] border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Alpaca API Secret (美股)</label>
                      <input 
                        type="password" 
                        value={alpacaSecret}
                        onChange={e => setAlpacaSecret(e.target.value)}
                        placeholder="Secret..."
                        className="w-full bg-[#111624] border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <><RefreshCw className="w-5 h-5 animate-spin" /> 同步至雲端...</>
                      ) : (
                        <><Save className="w-5 h-5" /> 儲存至雲端</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
