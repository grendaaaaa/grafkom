import type { CalculationStep } from '../types';

/**
 * Lingkaran — Persamaan Parametrik:
 *   x = xc + r · cos(θ)
 *   y = yc + r · sin(θ)
 *
 * FIX BUG-04: Guard deltaTheta <= 0 → return empty (cegah infinite loop)
 * FIX BUG-09: Integer-based loop (i * deltaTheta) ganti float accumulation
 *             untuk memastikan titik terakhir menutup ke titik pertama.
 * FIX BUG-10: Ganti i <= totalSteps menjadi i < totalSteps agar tidak ada
 *             titik ekstra yang melampaui 2π, lalu tambahkan titik penutup
 *             eksplisit di θ=2π sehingga lingkaran tertutup tanpa overshoot.
 */
export const generateCircleSteps = (
  xc: number, yc: number, r: number, deltaTheta: number
): CalculationStep[] => {
  // BUG-04: deltaTheta <= 0 akan menyebabkan infinite loop
  if (deltaTheta <= 0) return [];

  const steps: CalculationStep[] = [];
  // BUG-09: gunakan integer i agar tidak ada float accumulation error
  const totalSteps = Math.ceil(2 * Math.PI / deltaTheta);

  // BUG-10: i < totalSteps (bukan <=) agar tidak overshoot melewati 2π.
  // Contoh Δθ=0.1: totalSteps=63, loop i=0..62 → θ maks = 62×0.1 = 6.2 < 2π ✓
  for (let i = 0; i < totalSteps; i++) {
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

  // Titik penutup eksplisit di θ=2π agar lingkaran tertutup sempurna ke titik awal.
  // Menggunakan 2π bukan (totalSteps * deltaTheta) untuk menghindari floating-point drift.
  const closingTheta = 2 * Math.PI;
  steps.push({
    iteration: totalSteps,
    param: closingTheta,
    term1: Math.cos(closingTheta),  // = 1 (sama dengan θ=0)
    term2: Math.sin(closingTheta),  // ≈ 0 (sama dengan θ=0)
    xComponent: r * Math.cos(closingTheta),
    yComponent: r * Math.sin(closingTheta),
    x: xc + r * Math.cos(closingTheta),
    y: yc + r * Math.sin(closingTheta),
  });

  return steps;
};
