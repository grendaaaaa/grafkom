import type { CalculationStep } from '../types';

/**
 * Parabola — Persamaan Parametrik (Parameter Linier t):
 *   x = xp + a · t²
 *   y = yp + 2 · a · t
 *
 * (xp, yp) = titik puncak (vertex)
 * a         = fokus / koefisien
 * t         = parameter dari tMin hingga tMax
 */
export const generateParabolaSteps = (
  xp: number,
  yp: number,
  a: number,
  tMin: number,
  tMax: number,
  deltaT: number
): CalculationStep[] => {
  const steps: CalculationStep[] = [];
  let iteration = 0;

  for (let t = tMin; t <= tMax + 0.0001; t += deltaT) {
    const tSquared  = t * t;
    const xComp     = a * tSquared;   // a · t²
    const yComp     = 2 * a * t;      // 2 · a · t

    steps.push({
      iteration,
      param: t,
      term1: t,
      term2: tSquared,
      xComponent: xComp,
      yComponent: yComp,
      x: xp + xComp,
      y: yp + yComp,
    });
    iteration++;
  }

  return steps;
};
