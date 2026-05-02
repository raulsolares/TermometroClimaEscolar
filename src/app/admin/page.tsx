'use client';

import { useState, useEffect } from 'react';
import { supabase, Child, Response } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Users, AlertTriangle, ShieldCheck, ChevronRight, Search } from 'lucide-react';
import { detectRisk, calculateDailyScore, getMoodEmoji } from '@/lib/scoring';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ChildWithStats = Child & {
  lastResponse?: Response;
  risk: { level: string; reason: string | null };
  totalResponses: number;
};

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ChildWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      // 1. Fetch all children
      const { data: children, error: childError } = await supabase
        .from('children')
        .select('*');

      if (childError) {
        console.error(childError);
        setLoading(false);
        return;
      }

      // 2. Fetch recent responses for all children (last 7 days to calculate risk)
      const { data: responses, error: respError } = await supabase
        .from('responses')
        .select('*')
        .order('date', { ascending: false });

      if (respError) {
        console.error(respError);
        setLoading(false);
        return;
      }

      // 3. Process data
      const processed: ChildWithStats[] = (children || []).map(child => {
        const childResponses = (responses || []).filter(r => r.child_id === child.id);
        return {
          ...child,
          lastResponse: childResponses[0],
          risk: detectRisk(childResponses.slice(0, 7)),
          totalResponses: childResponses.length
        };
      });

      setData(processed);
      setLoading(false);
    };

    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading, router]);

  const filteredData = data.filter(child => 
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (child.group_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const riskCount = data.filter(c => c.risk.level === 'Riesgo').length;
  const attentionCount = data.filter(c => c.risk.level === 'Atención').length;

  if (loading || authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <header className="p-6 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-900 p-2 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Panel de Administración</h1>
            <p className="text-xs text-slate-500">Vista Global de la Escuela</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
            <p className="text-xs font-bold text-red-600 uppercase mb-1">En Riesgo</p>
            <p className="text-3xl font-black text-red-700">{riskCount}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <p className="text-xs font-bold text-amber-600 uppercase mb-1">Atención</p>
            <p className="text-3xl font-black text-amber-700">{attentionCount}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por nombre o grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </header>

      <div className="p-4 space-y-3">
        {filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic">
            No se encontraron alumnos.
          </div>
        ) : (
          filteredData.sort((a, b) => {
            const weights = { 'Riesgo': 0, 'Atención': 1, 'Bueno': 2 };
            return (weights[a.risk.level as keyof typeof weights] || 0) - (weights[b.risk.level as keyof typeof weights] || 0);
          }).map((child) => (
            <div 
              key={child.id}
              className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner",
                  child.risk.level === 'Riesgo' ? "bg-red-100" :
                  child.risk.level === 'Atención' ? "bg-amber-100" : "bg-green-100"
                )}>
                  {child.lastResponse ? getMoodEmoji(child.lastResponse.mood) : '❔'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{child.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-medium">
                      {child.group_name || 'Sin grupo'}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-tight",
                      child.risk.level === 'Riesgo' ? "text-red-500" :
                      child.risk.level === 'Atención' ? "text-amber-500" : "text-green-500"
                    )}>
                      {child.risk.level}
                    </span>
                  </div>
                </div>
              </div>
              
              {child.risk.level !== 'Bueno' && (
                <div className="bg-red-50 p-2 rounded-full animate-pulse">
                  <AlertTriangle className={cn(
                    "w-5 h-5",
                    child.risk.level === 'Riesgo' ? "text-red-500" : "text-amber-500"
                  )} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Seccion de incidentes criticos */}
      <section className="p-4 mt-4 pb-12">
        <h2 className="font-black text-slate-800 mb-4 px-2 uppercase text-sm tracking-widest">Incidentes Recientes</h2>
        <div className="space-y-3">
          {data.flatMap(c => (c.lastResponse?.bullied ? [{ child: c, resp: c.lastResponse }] : [])).length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-4 italic">No hay incidentes reportados hoy.</p>
          ) : (
            data.flatMap(c => (c.lastResponse?.bullied ? [{ child: c, resp: c.lastResponse }] : [])).map(({ child, resp }) => (
              <div key={resp.id} className="bg-white p-4 rounded-2xl border-l-4 border-red-500 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-red-600 uppercase">{child.name} ({child.group_name})</span>
                  <span className="text-[10px] text-slate-400">Hoy</span>
                </div>
                <p className="font-bold text-slate-800">{resp.event_type}</p>
                {resp.notes && <p className="text-sm text-slate-500 mt-1 italic">&quot;{resp.notes}&quot;</p>}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
