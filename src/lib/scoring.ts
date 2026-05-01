import { Response } from './supabase';

export type RiskLevel = 'Bueno' | 'Atención' | 'Riesgo';

export function calculateDailyScore(response: Response): number {
  let score = 0;
  
  // Mood: 🙂=3 (+2) | 😐=2 (0) | 🙁=1 (-2)
  if (response.mood === 3) score += 2;
  else if (response.mood === 1) score -= 2;

  // Played: Sí=+1 | No=-1
  score += response.played ? 1 : -1;

  // Bullied: Sí=-2
  if (response.bullied) score -= 2;

  return score;
}

export function detectRisk(responses: Response[]): { level: RiskLevel; reason: string | null } {
  // Sort by date descending
  const sorted = [...responses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // 1. 2 reports of bullying in 5 days
  const last5Days = sorted.slice(0, 5);
  const bullyingCount = last5Days.filter(r => r.bullied).length;
  if (bullyingCount >= 2) {
    return { level: 'Riesgo', reason: 'Múltiples reportes de maltrato recientemente' };
  }

  // 2. 3 consecutive days with negative score
  if (sorted.length >= 3) {
    const last3Days = sorted.slice(0, 3);
    const negativeCount = last3Days.filter(r => calculateDailyScore(r) < 0).length;
    if (negativeCount === 3) {
      return { level: 'Riesgo', reason: 'Tendencia negativa persistente' };
    }
  }

  // 3. Last day negative or any bullying
  const lastDay = sorted[0];
  if (lastDay) {
    if (lastDay.bullied) return { level: 'Atención', reason: 'Reporte de maltrato hoy' };
    if (calculateDailyScore(lastDay) < 0) return { level: 'Atención', reason: 'Bajo bienestar hoy' };
  }

  return { level: 'Bueno', reason: null };
}

export function getMoodEmoji(mood: number): string {
  if (mood === 3) return '🙂';
  if (mood === 2) return '😐';
  return '🙁';
}
