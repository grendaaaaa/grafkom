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
 * FIX BUG-10: Ganti i <= totalSteps menjadi i < totalSteps agar tidak ada
 *             titik ekstra yang melampaui 2π (sama dengan fix di circle.ts).
 */
export const generateEllipseSteps = (
  xc: number, yc: number, a: number, b: number, deltaTheta: number
): CalculationStep[] => {
  // BUG-04: deltaTheta <= 0 akan menyebabkan infinite loop
  if (deltaTheta <= 0) return [];

  const steps: CalculationStep[] = [];
  // BUG-09: gunakan integer i agar tidak ada float accumulation error
  const totalSteps = Math.ceil(2 * Math.PI / deltaTheta);

  // BUG-10: i < totalSteps agar tidak overshoot melewati 2π
  for (let i = 0; i < totalSteps; i++) {
    const theta = i * deltaTheta;
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

  // Titik penutup eksplisit di θ=2π agar elips tertutup sempurna ke titik awal.
  const closingTheta = 2 * Math.PI;
  steps.push({
    iteration: totalSteps,
    param: closingTheta,
    term1: Math.cos(closingTheta),
    term2: Math.sin(closingTheta),
    xComponent: a * Math.cos(closingTheta),
    yComponent: b * Math.sin(closingTheta),
    x: xc + a * Math.cos(closingTheta),
    y: yc + b * Math.sin(closingTheta),
  });

  return steps;
};
