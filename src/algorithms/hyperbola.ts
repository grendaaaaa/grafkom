import type { CalculationStep } from '../types';

/**
 * Hiperbola — Persamaan Parametrik (Fungsi Secant dan Tangent):
 *   x = xc + a · sec(θ)   dimana sec(θ) = 1 / cos(θ)
 *   y = yc + b · tan(θ)
 *
 * Dua cabang dihasilkan:
 *   Cabang Kanan : θ ∈ (-π/2 + ε, π/2 - ε)   → sec(θ) > 0
 *   Cabang Kiri  : θ ∈ (π/2 + ε, 3π/2 - ε)   → sec(θ) < 0
 *
 * @param xc Pusat X
 * @param yc Pusat Y
 * @param a  Semi-sumbu transversal (horizontal)
 * @param b  Semi-sumbu konjugasi (vertikal)
 * @param deltaTheta Langkah sudut per iterasi
 */
export const generateHyperbolaSteps = (
  xc: number,
  yc: number,
  a: number,
  b: number,
  deltaTheta: number
): CalculationStep[] => {
  const steps: CalculationStep[] = [];
  let iteration = 0;
  const eps = 0.08; // Jarak aman dari asimtot agar tidak tak-hingga

  // ── Cabang Kanan: θ dari -π/2+ε hingga π/2-ε ─────────
  for (
    let theta = -Math.PI / 2 + eps;
    theta <= Math.PI / 2 - eps + 0.0001;
    theta += deltaTheta
  ) {
    const cosT = Math.cos(theta);
    if (Math.abs(cosT) < 0.01) continue; // Skip jika terlalu dekat asimtot

    const secT    = 1 / cosT;              // sec(θ)
    const tanT    = Math.tan(theta);       // tan(θ)
    const xComp   = a * secT;
    const yComp   = b * tanT;

    steps.push({
      iteration,
      param: theta,
      term1: secT,
      term2: tanT,
      xComponent: xComp,
      yComponent: yComp,
      x: xc + xComp,
      y: yc + yComp,
    });
    iteration++;
  }

  // ── Separator: titik NaN sebagai penanda ganti cabang ─
  // (tidak dirender, hanya untuk memisahkan cabang)
  steps.push({
    iteration,
    param: NaN,
    term1: NaN, term2: NaN,
    xComponent: NaN, yComponent: NaN,
    x: NaN, y: NaN,
  });
  iteration++;

  // ── Cabang Kiri: θ dari π/2+ε hingga 3π/2-ε ─────────
  for (
    let theta = Math.PI / 2 + eps;
    theta <= 3 * (Math.PI / 2) - eps + 0.0001;
    theta += deltaTheta
  ) {
    const cosT = Math.cos(theta);
    if (Math.abs(cosT) < 0.01) continue;

    const secT  = 1 / cosT;
    const tanT  = Math.tan(theta);
    const xComp = a * secT;
    const yComp = b * tanT;

    steps.push({
      iteration,
      param: theta,
      term1: secT,
      term2: tanT,
      xComponent: xComp,
      yComponent: yComp,
      x: xc + xComp,
      y: yc + yComp,
    });
    iteration++;
  }

  return steps;
};
