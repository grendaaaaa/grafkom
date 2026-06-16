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
 * FIX BUG-11: Ganti Math.ceil dengan Math.round untuk menghindari over-estimate
 *             akibat floating-point (mis. 10/0.2 = 50.000...07 → ceil = 51).
 *             Tambah titik penutup eksplisit di tMax agar sisi atas dan bawah
 *             parabola selalu simetris meskipun deltaT tidak membagi range habis.
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

  // BUG-11: gunakan Math.round bukan Math.ceil agar nilai yang "seharusnya bulat"
  // (mis. 10/0.2 = 50.000...07) tidak di-over-estimate menjadi 51.
  const totalSteps = Math.round((tMax - tMin) / deltaT);

  for (let i = 0; i <= totalSteps; i++) {
    const t = tMin + i * deltaT;
    // Clamp agar tidak melampaui tMax karena akumulasi floating-point
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

  // BUG-11: Titik penutup eksplisit di tMax agar sisi positif (atas) selalu
  // memiliki titik ujung yang simetris dengan sisi negatif (bawah).
  // Jika titik terakhir sudah tepat di tMax (dalam toleransi 1e-9), skip.
  const lastT = tMin + totalSteps * deltaT;
  if (Math.abs(lastT - tMax) > 1e-9) {
    const tEnd  = tMax;
    const tSq   = tEnd * tEnd;
    const xComp = a * tSq;
    const yComp = 2 * a * tEnd;
    steps.push({
      iteration: totalSteps + 1,
      param: tEnd,
      term1: tEnd,
      term2: tSq,
      xComponent: xComp,
      yComponent: yComp,
      x: xp + xComp,
      y: yp + yComp,
    });
  }

  return steps;
};
