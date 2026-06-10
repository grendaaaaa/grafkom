import type { CalculationStep } from '../types';

/**
 * Elips — Persamaan Parametrik:
 *   x = xc + a · cos(θ)
 *   y = yc + b · sin(θ)
 *
 * Jika a == b → Lingkaran sempurna.
 */
export const generateEllipseSteps = (
  xc: number, yc: number, a: number, b: number, deltaTheta: number
): CalculationStep[] => {
  const steps: CalculationStep[] = [];
  let iteration = 0;
  for (let theta = 0; theta <= 2 * Math.PI + 0.001; theta += deltaTheta) {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    steps.push({
      iteration,
      param: theta,
      term1: cosT,
      term2: sinT,
      xComponent: a * cosT,
      yComponent: b * sinT,
      x: xc + a * cosT,
      y: yc + b * sinT,
    });
    iteration++;
  }
  return steps;
};
