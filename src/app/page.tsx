'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase, Child } from '@/lib/supabase';
import Link from 'next/link';
import { PlusCircle, ClipboardCheck } from 'lucide-react';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setChildren(data);
      }
      setLoading(false);
    };

    if (!authLoading) {
      if (user) {
        fetchChildren();
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthProvider handles redirect
  }

  if (children.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-blue-50 p-6 rounded-full mb-6 text-blue-600">
          <PlusCircle className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold mb-4">¡Bienvenido!</h2>
        <p className="text-slate-500 mb-8">Para comenzar, registra el perfil de tu hijo o hija.</p>
        <Link 
          href="/register-child"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-xl shadow-lg active:scale-95 transition-transform"
        >
          Registrar Niño
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Mis Niños</h1>
        <p className="text-slate-500">¿Cómo están hoy?</p>
      </header>

      <div className="grid gap-4">
        {children.map((child) => (
          <Link 
            key={child.id}
            href={`/child/${child.id}`}
            className="bg-white border-2 border-slate-100 p-5 rounded-3xl shadow-sm hover:border-blue-200 transition-colors flex items-center justify-between group"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-800">{child.name}</h3>
              <p className="text-sm text-slate-500">{child.group_name || 'Sin grupo'}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-blue-50 transition-colors">
              <ClipboardCheck className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
            </div>
          </Link>
        ))}
      </div>

      <Link 
        href="/register-child"
        className="flex items-center justify-center gap-2 text-blue-600 font-semibold py-4"
      >
        <PlusCircle className="w-5 h-5" />
        Registrar otro niño
      </Link>
    </div>
  );
}
