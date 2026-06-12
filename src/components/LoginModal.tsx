import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, User, Key, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, login, logout, changePassword } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      onClose();
    } else {
      setError('帳號或密碼錯誤');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (newPassword.length < 4) {
      setError('密碼長度至少為 4 碼');
      return;
    }
    const success = await changePassword(newPassword);
    if (success) {
      setSuccessMsg('密碼修改成功！');
      setNewPassword('');
      setTimeout(() => setIsChangingPassword(false), 2000);
    } else {
      setError('密碼修改失敗');
    }
  };

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
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              {user.role === 'guest' ? '系統登入' : '帳號管理'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {user.role === 'guest' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">帳號</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="請輸入帳號 (例如: william0818)"
                      className="w-full bg-[#1e293b] text-white border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">密碼</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="請輸入密碼"
                      className="w-full bg-[#1e293b] text-white border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors mt-4">
                  登入
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">目前登入帳號</p>
                    <p className="text-lg font-bold text-white mt-1">{user.username}</p>
                    <p className="text-xs text-indigo-400 mt-1 uppercase tracking-wider">{user.role} 權限</p>
                  </div>
                  <User className="w-10 h-10 text-slate-500" />
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {error && <div className="text-rose-400 text-sm">{error}</div>}
                    {successMsg && <div className="text-emerald-400 text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> {successMsg}</div>}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">輸入新密碼</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#1e293b] text-white border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => { setIsChangingPassword(false); setError(''); setSuccessMsg(''); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-lg transition-colors">取消</button>
                      <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-colors">確認修改</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button onClick={() => setIsChangingPassword(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors border border-slate-700">
                      修改密碼
                    </button>
                    <button onClick={() => { logout(); onClose(); }} className="w-full bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 font-bold py-3 rounded-lg transition-colors border border-rose-500/20">
                      登出
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
