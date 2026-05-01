'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function RegisterChildPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    group_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    const { error } = await supabase.from('children').insert({
      user_id: user.id,
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : null,
      group_name: formData.group_name,
    });

    if (error) {
      alert('Error al registrar: ' + error.message);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="p-4 flex items-center gap-4 border-b">
        <Link href="/" className="p-2 -ml-2 text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Registrar Niño</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 p-6 flex flex-col">
        <div className="flex-1 space-y-6">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <UserPlus className="w-10 h-10 text-blue-600" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 ml-1">Nombre</label>
            <input
              type="text"
              required
              placeholder="Ej. Mateo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 ml-1">Edad</label>
              <input
                type="number"
                placeholder="Ej. 6"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 ml-1">Grupo / Grado</label>
              <input
                type="text"
                placeholder="Ej. 1ro B"
                value={formData.group_name}
                onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50 mt-8"
        >
          {loading ? 'Guardando...' : 'Guardar Perfil'}
        </button>
      </form>
    </div>
  );
}
