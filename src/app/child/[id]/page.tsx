'use client';

import { useState, useEffect } from 'react';
import { supabase, Child, Response } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { detectRisk, getMoodEmoji, calculateDailyScore } from '@/lib/scoring';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ChildDashboardPage() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [childRes, responsesRes] = await Promise.all([
        supabase.from('children').select('*').eq('id', id as string).single(),
        supabase.from('responses').select('*').eq('child_id', id as string).order('date', { ascending: false }).limit(7)
      ]);

      if (childRes.error || !childRes.data) {
        router.push('/');
      } else {
        setChild(childRes.data);
        setResponses(responsesRes.data || []);
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const risk = detectRisk(responses);
  const todayResponse = responses.find(r => r.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <header className="p-4 flex items-center gap-4 bg-white border-b">
        <Link href="/" className="p-2 -ml-2 text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{child?.name}</h1>
          <p className="text-xs text-slate-500">{child?.group_name}</p>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Status Card */}
        <div className={cn(
          "p-6 rounded-3xl shadow-sm border-2 flex items-center gap-4",
          risk.level === 'Riesgo' ? "bg-red-50 border-red-100 text-red-800" :
          risk.level === 'Atención' ? "bg-amber-50 border-amber-100 text-amber-800" :
          "bg-green-50 border-green-100 text-green-800"
        )}>
          {risk.level === 'Riesgo' ? <AlertTriangle className="w-10 h-10" /> :
           risk.level === 'Atención' ? <Info className="w-10 h-10" /> :
           <CheckCircle className="w-10 h-10" />}
          <div>
            <h2 className="font-bold text-lg">Estado: {risk.level}</h2>
            <p className="text-sm opacity-80">{risk.reason || 'Todo parece ir bien esta semana.'}</p>
          </div>
        </div>

        {/* Call to Action */}
        {!todayResponse ? (
          <Link 
            href={`/survey/${id}`}
            className="block w-full bg-blue-600 text-white font-bold py-6 rounded-3xl text-center shadow-lg active:scale-95 transition-transform"
          >
            Registrar Encuesta de Hoy
          </Link>
        ) : (
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800">¡Encuesta de hoy lista!</p>
            <p className="text-sm text-slate-500">Gracias por estar pendiente.</p>
          </div>
        )}

        {/* Weekly History */}
        <section className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Últimos 7 días
          </h3>
          <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden shadow-sm">
            {responses.length === 0 ? (
              <p className="p-8 text-center text-slate-400 italic">No hay registros aún.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {responses.map((resp) => (
                  <div key={resp.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{getMoodEmoji(resp.mood)}</span>
                      <div>
                        <p className="font-semibold text-slate-700">
                          {new Date(resp.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-400">
                          {resp.played ? 'Jugó con amigos' : 'Estuvo solo/a'} • 
                          {resp.bullied ? ' Reportó maltrato' : ' Sin problemas'}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                      calculateDailyScore(resp) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {calculateDailyScore(resp) > 0 ? `+${calculateDailyScore(resp)}` : calculateDailyScore(resp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Detailed Events */}
        {responses.some(r => r.bullied) && (
          <section className="space-y-4 pb-8">
            <h3 className="font-bold text-slate-800">Eventos destacados</h3>
            <div className="space-y-3">
              {responses.filter(r => r.bullied).map(r => (
                <div key={r.id} className="bg-white p-4 rounded-2xl border-l-4 border-red-500 shadow-sm">
                  <p className="text-xs font-bold text-red-600 mb-1 uppercase tracking-tight">
                    {new Date(r.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="font-bold text-slate-800">{r.event_type || 'Maltrato reportado'}</p>
                  {r.notes && <p className="text-sm text-slate-500 mt-1 italic">&quot;{r.notes}&quot;</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
