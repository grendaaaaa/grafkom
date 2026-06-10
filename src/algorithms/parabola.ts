import type { CalculationStep } from '../types';

/**
 * Parabola — Persamaan Parametrik (Parameter Linier t):
 *   x = xp + a · t²
 *   y = yp + 2 · a · t
 *
 * (xp, yp) = titik puncak (vertex)
 * a         = fokus / koefisien
 * t         = parameter dari tMin hingga tMax
 *
 * FIX BUG-05: Guard deltaT <= 0 atau tMin >= tMax → return empty (cegah infinite loop)
 * FIX BUG-09: Integer-based loop (tMin + i * deltaT) ganti float accumulation
 */
export const generateParabolaSteps = (
  xp: number,
  yp: number,
  a: number,
  tMin: number,
  tMax: number,
  deltaT: number
): CalculationStep[] => {
  // BUG-05: deltaT <= 0 → infinite loop; tMin >= tMax → tidak ada step yang valid
  if (deltaT <= 0 || tMin >= tMax) return [];

  const steps: CalculationStep[] = [];
  // BUG-09: gunakan integer i agar tidak ada float accumulation error
  const totalSteps = Math.ceil((tMax - tMin) / deltaT);

  for (let i = 0; i <= totalSteps; i++) {
    const t = tMin + i * deltaT;
    // Pastikan tidak melampaui tMax karena Math.ceil bisa over-estimate
    if (t > tMax + 1e-9) break;

    const tSquared  = t * t;
    const xComp     = a * tSquared;   // a · t²
    const yComp     = 2 * a * t;      // 2 · a · t

    steps.push({
      iteration: i,
      param: t,
      term1: t,
      term2: tSquared,
      xComponent: xComp,
      yComponent: yComp,
      x: xp + xComp,
      y: yp + yComp,
    });
  }

  return steps;
};
