'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.user);
      router.push('/app');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#36393f] text-white">
      <div className="bg-[#2f3136] p-8 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome back!</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#b9bbbe] text-sm font-bold mb-2 uppercase">Email</label>
            <input 
              className="w-full p-2 bg-[#202225] text-white rounded outline-none focus:ring-2 focus:ring-[#5865F2]"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block text-[#b9bbbe] text-sm font-bold mb-2 uppercase">Password</label>
            <input 
              className="w-full p-2 bg-[#202225] text-white rounded outline-none focus:ring-2 focus:ring-[#5865F2]"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2 px-4 rounded transition-colors" type="submit">
            Log In
          </button>
        </form>
        <p className="mt-4 text-[#b9bbbe] text-sm">
          Need an account? <a href="/register" className="text-[#00aff4] hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
}
