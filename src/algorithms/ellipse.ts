import type { CalculationStep } from '../types';

/**
 * Elips — Persamaan Parametrik:
 *   x = xc + a · cos(θ)
 *   y = yc + b · sin(θ)
 *
 * Jika a == b → Lingkaran sempurna.
 *
 * FIX BUG-04: Guard deltaTheta <= 0 → return empty (cegah infinite loop)
 * FIX BUG-09: Integer-based loop (i * deltaTheta) ganti float accumulation
 *             agar titik terakhir menutup sempurna ke titik pertama.
 */
export const generateEllipseSteps = (
  xc: number, yc: number, a: number, b: number, deltaTheta: number
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
      xComponent: a * cosT,
      yComponent: b * sinT,
      x: xc + a * cosT,
      y: yc + b * sinT,
    });
  }
  return steps;
};
