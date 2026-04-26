import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login, register, googleLogin } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-black text-white text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Join MITube'}
        </h2>
        <p className="text-zinc-400 text-center mb-8 text-sm">
          {isLogin ? 'Sign in to access your collections.' : 'Create an account to save your favorite movies.'}
        </p>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Username" 
              required
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg py-3 pl-10 pr-4 text-white outline-none transition-colors"
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg py-3 pl-10 pr-4 text-white outline-none transition-colors"
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg py-3 pl-10 pr-4 text-white outline-none transition-colors"
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-emerald-500 text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-emerald-400 transition-colors shadow-lg">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-zinc-800 w-full"></div>
          <span className="bg-zinc-950 px-4 text-zinc-500 text-xs uppercase tracking-widest absolute">Or</span>
        </div>

        {/* --- GOOGLE LOGIN BUTTON --- */}
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={credentialResponse => {
              googleLogin(credentialResponse.credential).then(() => onClose());
            }}
            onError={() => setError('Google Login Failed')}
            theme="filled_black"
            shape="pill"
          />
        </div>

        <p className="text-center text-zinc-500 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-500 hover:text-emerald-400 font-bold ml-1">
            {isLogin ? 'Register' : 'Sign In'}
          </button>
        </p>

      </div>
    </div>
  );
}