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
 * FIX BUG-12: Generate titik simetris dari θ=0 ke dua arah (±) agar setiap
 *             titik di kuadran atas memiliki cermin presisi di kuadran bawah.
 *             Sebelumnya, kedua cabang dimulai dari ujung range yang berbeda
 *             sehingga nilai y tidak selalu simetris ketika Δθ tidak habis membagi range.
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
  const cosThreshold = Math.max(0.01, deltaTheta * 0.5);

  // ── Helper: buat satu titik hiperbola dari θ ─────────────────────────────
  const makeStep = (theta: number): CalculationStep | null => {
    const cosT = Math.cos(theta);
    if (Math.abs(cosT) < cosThreshold) return null; // terlalu dekat asimtot
    const secT  = 1 / cosT;
    const tanT  = Math.tan(theta);
    const xComp = a * secT;
    const yComp = b * tanT;
    return {
      iteration,
      param: theta,
      term1: secT,
      term2: tanT,
      xComponent: xComp,
      yComponent: yComp,
      x: xc + xComp,
      y: yc + yComp,
    };
  };

  // ── BUG-12: Generate setiap cabang dari θ=0 menuju batas ─────────────────
  // Dengan cara ini, untuk setiap i, titik di θ=+i·Δθ dan θ=-i·Δθ menghasilkan:
  //   y(+θ) = b·tan(+θ) = +b·tan(θ)   ← kuadran atas
  //   y(-θ) = b·tan(-θ) = -b·tan(θ)   ← kuadran bawah (presisi cermin)
  // Simetri x juga terjaga: sec(+θ) = sec(-θ) → x sama persis.

  // ── Cabang KANAN: θ ∈ [0, π/2-ε] dan θ ∈ [-(π/2-ε), 0) ─────────────
  // Kumpulkan titik dari θ=0 ke atas (positif), lalu cerminkan ke bawah (negatif)
  const halfRight = Math.PI / 2 - eps;
  const rightHalfSteps = Math.floor(halfRight / deltaTheta);

  // Titik bawah cabang kanan (θ negatif, urutan terbalik agar path kontinu dari bawah ke atas)
  const rightNegPts: CalculationStep[] = [];
  for (let i = rightHalfSteps; i >= 1; i--) {
    const theta = -(i * deltaTheta);
    if (Math.abs(theta) > halfRight) continue;
    const s = makeStep(theta);
    if (s) { s.iteration = iteration++; rightNegPts.push(s); }
  }
  steps.push(...rightNegPts);

  // Titik tengah cabang kanan (θ=0 → puncak kanan, y=0)
  const s0right = makeStep(0);
  if (s0right) { s0right.iteration = iteration++; steps.push(s0right); }

  // Titik atas cabang kanan (θ positif)
  for (let i = 1; i <= rightHalfSteps; i++) {
    const theta = i * deltaTheta;
    if (theta > halfRight) break;
    const s = makeStep(theta);
    if (s) { s.iteration = iteration++; steps.push(s); }
  }

  // ── Separator: titik NaN sebagai penanda ganti cabang ─────────────────
  steps.push({
    iteration: iteration++,
    param: NaN,
    term1: NaN, term2: NaN,
    xComponent: NaN, yComponent: NaN,
    x: NaN, y: NaN,
  });

  // ── Cabang KIRI: θ ∈ [π, π/2+ε] dan θ ∈ [π, 3π/2-ε] ────────────────
  // Gunakan pendekatan yang sama: dari θ=π (puncak kiri) ke dua arah ±
  // tan(π+φ) = tan(φ), sec(π+φ) = -sec(φ) → cermin dari cabang kanan di sumbu Y
  const halfLeft = Math.PI / 2 - eps; // sama dengan halfRight karena simetri
  const leftHalfSteps = Math.floor(halfLeft / deltaTheta);

  // Titik bawah cabang kiri (θ = π + i·Δθ, positif dari π → tan negatif → y negatif)
  const leftNegPts: CalculationStep[] = [];
  for (let i = leftHalfSteps; i >= 1; i--) {
    const theta = Math.PI + i * deltaTheta;
    const s = makeStep(theta);
    if (s) { s.iteration = iteration++; leftNegPts.push(s); }
  }
  steps.push(...leftNegPts);

  // Titik tengah cabang kiri (θ=π → puncak kiri, y=0)
  const s0left = makeStep(Math.PI);
  if (s0left) { s0left.iteration = iteration++; steps.push(s0left); }

  // Titik atas cabang kiri (θ = π - i·Δθ)
  for (let i = 1; i <= leftHalfSteps; i++) {
    const theta = Math.PI - i * deltaTheta;
    if (theta < Math.PI / 2 + eps) break;
    const s = makeStep(theta);
    if (s) { s.iteration = iteration++; steps.push(s); }
  }

  return steps;
};
