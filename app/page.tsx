'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // This pushes the user to the actual dashboard
    router.push('/executive-overview'); 
  };

  return (
    /* This "fixed" container ensures the login covers any sidebars/headers from layout.tsx */
    <div className="fixed inset-0 z-[9999] bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-zinc-200 p-8 text-zinc-900">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-xl mb-4 shadow-lg">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">YouTube Intelligence</h1>
          <p className="text-zinc-500 mt-2 text-sm font-medium text-balance">
            Senior Design Team 10 | Security Portal
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              <input 
                type="email" 
                placeholder="admin@cs4485.com" 
                required 
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-sm" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1.5">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-sm" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-zinc-900 text-white py-3 rounded-lg font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-md shadow-zinc-200"
          >
            Access Platform
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}