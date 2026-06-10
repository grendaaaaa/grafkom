import type { CalculationStep } from '../types';

/**
 * Lingkaran — Persamaan Parametrik:
 *   x = xc + r · cos(θ)
 *   y = yc + r · sin(θ)
 *
 * FIX BUG-04: Guard deltaTheta <= 0 → return empty (cegah infinite loop)
 * FIX BUG-09: Integer-based loop (i * deltaTheta) ganti float accumulation
 *             untuk memastikan titik terakhir menutup ke titik pertama.
 */
export const generateCircleSteps = (
  xc: number, yc: number, r: number, deltaTheta: number
): CalculationStep[] => {
  // BUG-04: deltaTheta <= 0 akan menyebabkan infinite loop
  if (deltaTheta <= 0) return [];

  const steps: CalculationStep[] = [];
  // BUG-09: gunakan integer i agar tidak ada float accumulation error
  const totalSteps = Math.ceil(2 * Math.PI / deltaTheta);

  for (let i = 0; i <= totalSteps; i++) {
    const theta = i * deltaTheta; // presisi lebih baik dari: theta += deltaTheta
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    steps.push({
      iteration: i,
      param: theta,
      term1: cosT,
      term2: sinT,
      xComponent: r * cosT,
      yComponent: r * sinT,
      x: xc + r * cosT,
      y: yc + r * sinT,
    });
  }
  return steps;
};
