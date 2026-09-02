import React, { useState } from 'react';
import { Lock, X, ShieldAlert } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Default demo credentials: admin / ask123 or admin / admin
    if (
      (username.trim().toLowerCase() === 'admin' && password === 'ask123') ||
      (username.trim().toLowerCase() === 'admin' && password === 'admin') ||
      password === 'ask123'
    ) {
      onLoginSuccess();
      onClose();
    } else {
      setError('Invalid admin credentials. Use "admin" and "ask123"');
    }
  };

  const handleDemoFill = () => {
    setUsername('admin');
    setPassword('ask123');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white border border-zinc-200 text-zinc-900 rounded-3xl shadow-2xl overflow-hidden my-6"
        id="admin-login-dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black border border-black flex items-center justify-center text-white shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-base">ASK ENTERPRISES Admin</h3>
              <p className="text-[11px] text-zinc-500">Management & Product Catalog Portal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200 flex items-center justify-center transition-all shadow-xs"
            id="close-admin-login-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="bg-zinc-100 border border-zinc-300 p-3 rounded-xl text-xs text-zinc-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-zinc-900 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Admin Username
            </label>
            <input
              type="text"
              required
              id="admin-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:border-zinc-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Admin Password / PIN
            </label>
            <input
              type="password"
              required
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:border-zinc-800 outline-none"
            />
          </div>

          {/* Quick Demo Helper */}
          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px]">Demo Credentials</span>
              <span className="font-mono text-zinc-900 text-xs font-bold">admin / ask123</span>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-zinc-300 transition-colors shadow-xs"
            >
              Auto-fill
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              id="admin-login-submit"
              className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.01]"
            >
              Secure Admin Login
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs text-zinc-500 hover:text-black py-1"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
