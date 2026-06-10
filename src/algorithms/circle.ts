import type { CalculationStep } from '../types';

/**
 * Lingkaran — Persamaan Parametrik:
 *   x = xc + r · cos(θ)
 *   y = yc + r · sin(θ)
 */
export const generateCircleSteps = (
  xc: number, yc: number, r: number, deltaTheta: number
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
      xComponent: r * cosT,
      yComponent: r * sinT,
      x: xc + r * cosT,
      y: yc + r * sinT,
    });
    iteration++;
  }
  return steps;
};
