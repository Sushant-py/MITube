import React, { useState } from 'react';
import axios from 'axios';
import { Film } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);
      localStorage.setItem('token', response.data.token);
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-emerald-500/20 p-8 rounded-lg">
        <div className="flex items-center gap-3 justify-center mb-8">
          <Film className="h-8 w-8 text-emerald-500" />
          <h1 className="text-2xl text-emerald-500 tracking-wider">MITube</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-black border border-emerald-500/20 p-3 text-white rounded focus:border-emerald-500 outline-none"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-black border border-emerald-500/20 p-3 text-white rounded focus:border-emerald-500 outline-none"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-black border border-emerald-500/20 p-3 text-white rounded focus:border-emerald-500 outline-none"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button className="w-full bg-emerald-500 text-black py-3 rounded font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors">
            {isLogin ? 'Sign In' : 'Join Now'}
          </button>
        </form>
        
        <p className="text-zinc-500 mt-6 text-center text-sm">
          {isLogin ? "New to MITube?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-500 ml-2 hover:underline"
          >
            {isLogin ? 'Create an account' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}