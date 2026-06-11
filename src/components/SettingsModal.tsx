import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, Save, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ApiKeys {
  alpacaKey: string;
  alpacaSecret: string;
  finmindKey: string;
  llmKey: string;
}

export const getApiKeys = (): ApiKeys => {
  const saved = localStorage.getItem('alphaFlow_apiKeys');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return { alpacaKey: '', alpacaSecret: '', finmindKey: '', llmKey: '' };
    }
  }
  return { alpacaKey: '', alpacaSecret: '', finmindKey: '', llmKey: '' };
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [keys, setKeys] = useState<ApiKeys>({ alpacaKey: '', alpacaSecret: '', finmindKey: '', llmKey: '' });
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeys(getApiKeys());
      setSavedMsg(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('alphaFlow_apiKeys', JSON.stringify(keys));
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      onClose();
    }, 1500);
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0d111d] border border-slate-800 rounded-2xl p-6 z-50 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" />
                API 金鑰設定
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">OpenAI / LLM API Key (用於生成報告)</label>
                <input 
                  type="password" 
                  value={keys.llmKey}
                  onChange={e => setKeys({...keys, llmKey: e.target.value})}
                  placeholder="sk-..."
                  className="w-full bg-[#111624] border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">FinMind API Key (台股，可不填則為免費額度)</label>
                <input 
                  type="password" 
                  value={keys.finmindKey}
                  onChange={e => setKeys({...keys, finmindKey: e.target.value})}
                  placeholder="FinMind Token..."
                  className="w-full bg-[#111624] border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Alpaca API Key (美股)</label>
                <input 
                  type="password" 
                  value={keys.alpacaKey}
                  onChange={e => setKeys({...keys, alpacaKey: e.target.value})}
                  placeholder="PK..."
                  className="w-full bg-[#111624] border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Alpaca API Secret (美股)</label>
                <input 
                  type="password" 
                  value={keys.alpacaSecret}
                  onChange={e => setKeys({...keys, alpacaSecret: e.target.value})}
                  placeholder="Secret..."
                  className="w-full bg-[#111624] border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
              >
                {savedMsg ? <><CheckCircle2 className="w-4 h-4" /> 已儲存</> : <><Save className="w-4 h-4" /> 儲存設定</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
