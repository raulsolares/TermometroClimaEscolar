'use client';

import { useState, useEffect } from 'react';
import { supabase, Child } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const steps = [
  '¿Cómo se sintió hoy?',
  '¿Jugó con otros niños?',
  '¿Alguien lo/la hizo sentir mal?',
  '¿Qué pasó?'
];

export default function SurveyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [answers, setAnswers] = useState({
    mood: 0 as 1 | 2 | 3 | 0,
    played: null as boolean | null,
    bullied: null as boolean | null,
    event_type: '',
    notes: ''
  });

  useEffect(() => {
    const fetchChild = async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/');
      } else {
        setChild(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchChild();
    }
  }, [id, router]);

  const saveSurvey = async (currentAnswers = answers) => {
    setSaving(true);
    const { error } = await supabase.from('responses').insert({
      child_id: id as string,
      mood: currentAnswers.mood,
      played: currentAnswers.played ?? false,
      bullied: currentAnswers.bullied ?? false,
      event_type: currentAnswers.event_type || null,
      notes: currentAnswers.notes || null,
      date: new Date().toISOString().split('T')[0]
    });

    if (error) {
      if (error.code === '23505') {
        alert('Ya se registró una encuesta para hoy.');
      } else {
        alert('Error al guardar: ' + error.message);
      }
    }
    router.push('/');
    setSaving(false);
  };

  if (loading) return null;

  const nextStep = (updatedAnswers = answers) => {
    if (step === 3 && !updatedAnswers.bullied) {
      saveSurvey(updatedAnswers);
    } else if (step === 4) {
      saveSurvey(updatedAnswers);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="p-4 flex items-center justify-between border-b bg-white">
        <Link href="/" className="p-2 -ml-2 text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={cn(
                "h-1.5 w-8 rounded-full transition-colors",
                step >= s ? "bg-blue-600" : "bg-slate-100"
              )}
            />
          ))}
        </div>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 p-6 flex flex-col justify-center text-center">
        <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">
          {child?.name}
        </h2>
        <h1 className="text-3xl font-bold text-slate-800 mb-12">
          {steps[step - 1]}
        </h1>

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4">
            <EmojiButton 
              emoji="🙂" label="Muy bien" 
              active={answers.mood === 3}
              onClick={() => { 
                const upd = {...answers, mood: 3 as const};
                setAnswers(upd); 
                nextStep(upd); 
              }} 
            />
            <EmojiButton 
              emoji="😐" label="Normal" 
              active={answers.mood === 2}
              onClick={() => { 
                const upd = {...answers, mood: 2 as const};
                setAnswers(upd); 
                nextStep(upd); 
              }} 
            />
            <EmojiButton 
              emoji="🙁" label="Mal" 
              active={answers.mood === 1}
              onClick={() => { 
                const upd = {...answers, mood: 1 as const};
                setAnswers(upd); 
                nextStep(upd); 
              }} 
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4">
            <OptionButton 
              label="Sí, jugó con amigos" 
              active={answers.played === true}
              onClick={() => { 
                const upd = {...answers, played: true};
                setAnswers(upd); 
                nextStep(upd); 
              }} 
            />
            <OptionButton 
              label="No, estuvo solo/a" 
              active={answers.played === false}
              onClick={() => { 
                const upd = {...answers, played: false};
                setAnswers(upd); 
                nextStep(upd); 
              }} 
            />
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-4">
            <OptionButton 
              label="No, todo bien" 
              active={answers.bullied === false}
              onClick={() => { 
                const upd = {...answers, bullied: false};
                setAnswers(upd); 
                nextStep(upd); 
              }} 
            />
            <OptionButton 
              label="Sí, hubo un problema" 
              variant="danger"
              active={answers.bullied === true}
              onClick={() => { 
                const upd = {...answers, bullied: true};
                setAnswers(upd); 
                nextStep(upd); 
              }} 
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 text-left">
              {['No lo/la dejaron jugar', 'Le dijeron cosas feas', 'Lo/la empujaron', 'Otro'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswers({...answers, event_type: opt})}
                  className={cn(
                    "p-4 border-2 rounded-2xl text-lg font-medium transition-all",
                    answers.event_type === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 bg-slate-50 text-slate-600"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Notas adicionales (opcional)..."
              value={answers.notes}
              onChange={(e) => setAnswers({...answers, notes: e.target.value})}
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none min-h-[100px]"
            />
            <button
              onClick={() => saveSurvey()}
              disabled={saving || !answers.event_type}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Finalizar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmojiButton({ emoji, label, onClick, active }: { emoji: string, label: string, onClick: () => void, active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-6 p-5 border-2 rounded-3xl transition-all active:scale-95",
        active ? "border-blue-600 bg-blue-50" : "border-slate-100 bg-white shadow-sm"
      )}
    >
      <span className="text-5xl">{emoji}</span>
      <span className="text-xl font-bold text-slate-700">{label}</span>
    </button>
  );
}

function OptionButton({ label, onClick, active, variant = 'default' }: { label: string, onClick: () => void, active: boolean, variant?: 'default' | 'danger' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-6 border-2 rounded-3xl text-xl font-bold transition-all active:scale-95",
        active 
          ? "border-blue-600 bg-blue-50 text-blue-700" 
          : variant === 'danger' 
            ? "border-red-100 bg-red-50 text-red-600" 
            : "border-slate-100 bg-white shadow-sm text-slate-700"
      )}
    >
      {label}
    </button>
  );
}
