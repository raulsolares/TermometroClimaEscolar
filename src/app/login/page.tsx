'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('¡Revisa tu correo para el link de acceso!');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
      <div className="bg-blue-100 p-4 rounded-full mb-6">
        <Heart className="w-12 h-12 text-blue-600 fill-blue-600" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Hola 👋</h1>
      <p className="text-slate-500 mb-8">Ingresa tu email para entrar a tu cuenta</p>

      <form onSubmit={handleLogin} className="w-full space-y-4">
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-4 text-lg border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-colors"
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Entrar'}
        </button>
      </form>

      {message && (
        <p className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-xl w-full">
          {message}
        </p>
      )}

      <div className="mt-auto pt-8 text-slate-400 text-sm">
        Termómetro de Clima Escolar v1.0
      </div>
    </div>
  );
}
