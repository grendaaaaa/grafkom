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
 * FIX BUG-04: Guard deltaTheta <= 0 → return empty (cegah infinite loop)
 * FIX BUG-06: cosThreshold dinamis berdasarkan deltaTheta (ganti hardcoded 0.01)
 *             mencegah nilai sec(θ) yang sangat besar saat deltaTheta kecil
 * FIX BUG-09: Integer-based loop untuk kedua cabang
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
  // BUG-04: deltaTheta <= 0 akan menyebabkan infinite loop
  if (deltaTheta <= 0) return [];

  const steps: CalculationStep[] = [];
  let iteration = 0;
  const eps = 0.08; // Jarak aman dari asimtot agar tidak tak-hingga

  // BUG-06: threshold dinamis — semakin kecil deltaTheta, semakin ketat threshold
  // agar titik yang terlalu dekat ke asimtot (|cos| kecil → |sec| sangat besar) ter-skip
  const cosThreshold = Math.max(0.01, deltaTheta * 0.5);

  // ── Cabang Kanan: θ dari -π/2+ε hingga π/2-ε ─────────
  // BUG-09: integer-based loop agar tidak ada float accumulation
  const rightRangeStart = -Math.PI / 2 + eps;
  const rightRangeEnd   =  Math.PI / 2 - eps;
  const rightSteps = Math.ceil((rightRangeEnd - rightRangeStart) / deltaTheta);

  for (let i = 0; i <= rightSteps; i++) {
    const theta = rightRangeStart + i * deltaTheta;
    if (theta > rightRangeEnd + 1e-9) break;

    const cosT = Math.cos(theta);
    // BUG-06: gunakan threshold dinamis (bukan hardcoded 0.01)
    if (Math.abs(cosT) < cosThreshold) continue;

    const secT    = 1 / cosT;
    const tanT    = Math.tan(theta);
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
  // (tidak dirender di canvas, hanya untuk memisahkan cabang di drawPath & tabel)
  steps.push({
    iteration,
    param: NaN,
    term1: NaN, term2: NaN,
    xComponent: NaN, yComponent: NaN,
    x: NaN, y: NaN,
  });
  iteration++;

  // ── Cabang Kiri: θ dari π/2+ε hingga 3π/2-ε ─────────
  // BUG-09: integer-based loop
  const leftRangeStart =     Math.PI / 2 + eps;
  const leftRangeEnd   = 3 * Math.PI / 2 - eps;
  const leftSteps = Math.ceil((leftRangeEnd - leftRangeStart) / deltaTheta);

  for (let i = 0; i <= leftSteps; i++) {
    const theta = leftRangeStart + i * deltaTheta;
    if (theta > leftRangeEnd + 1e-9) break;

    const cosT = Math.cos(theta);
    // BUG-06: gunakan threshold dinamis
    if (Math.abs(cosT) < cosThreshold) continue;

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
