import type { CalculationStep } from '../types';

/**
 * Midpoint Ellipse Algorithm (Bresenham Ellipse)
 *
 * Integer arithmetic + 4-fold symmetry. Kurva dibagi menjadi DUA REGION
 * berdasarkan gradien:
 *
 *   Region 1 — |dy/dx| < 1 (bagian atas/bawah elips):
 *     Mulai dari titik puncak (0, b), x naik setiap langkah.
 *     Berhenti saat 2·b²·x ≥ 2·a²·y (slope = −1).
 *
 *   Region 2 — |dy/dx| ≥ 1 (bagian kiri/kanan elips):
 *     Lanjut dari akhir Region 1, y turun setiap langkah.
 *     Berhenti saat y < 0.
 *
 * Decision parameter diderivasi dari fungsi F(x, y) = b²x² + a²y² − a²b².
 *
 * Mapping ke CalculationStep:
 *   param      = d sebelum keputusan
 *   term1      = x di kuadran 1
 *   term2      = y di kuadran 1
 *   xComponent = d sesudah keputusan
 *   yComponent = 0 (East·R1) | 1 (SE·R1) | 2 (South·R2) | 3 (SE·R2)
 *   x, y       = titik utama yang diplot
 *   extraPoints= titik simetri lainnya (hingga 3)
 */
export const generateBEllipseSteps = (
  xc: number, yc: number, a: number, b: number
): CalculationStep[] => {
  const ra  = Math.round(a);
  const rb  = Math.round(b);
  const xci = Math.round(xc);
  const yci = Math.round(yc);
  if (ra <= 0 || rb <= 0) return [];

  const a2 = ra * ra;
  const b2 = rb * rb;

  const steps: CalculationStep[] = [];
  let iteration = 0;

  /** Hasilkan hingga 4 titik simetri, hapus duplikat (terjadi saat x=0 atau y=0) */
  const sym4 = (px: number, py: number): { x: number; y: number }[] => {
    const candidates = [
      { x: xci + px, y: yci + py },
      { x: xci - px, y: yci + py },
      { x: xci + px, y: yci - py },
      { x: xci - px, y: yci - py },
    ];
    const seen = new Set<string>();
    return candidates.filter(p => {
      const key = `${p.x},${p.y}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // ── Region 1: mulai dari (0, b), x naik ────────────────────────────────────
  let x = 0;
  let y = rb;
  // d = F(x+1, y−0.5) at (0, b) = b² − a²·b + 0.25·a²
  let d  = Math.round(b2 - a2 * rb + 0.25 * a2);
  let dx = 0;            // 2·b²·x — incremental tracker
  let dy = 2 * a2 * rb; // 2·a²·y — incremental tracker

  while (dx < dy) {          // kondisi: slope < −1
    const x_qt    = x;
    const y_qt    = y;
    const d_before = d;

    const allPts  = sym4(x_qt, y_qt);
    const primary = allPts[0];
    const extra   = allPts.slice(1);

    // x selalu naik di Region 1
    x++;
    dx += 2 * b2;

    let d_after: number;
    let branch: number;

    if (d < 0) {
      // Pilih East: hanya x naik
      // d_new = d + b²·(2·x_new + 1) = d + dx + b²
      d_after = d + dx + b2;
      branch  = 0; // East (Region 1)
    } else {
      // Pilih SouthEast: x naik + y turun
      // d_new = d + b²·(2·x_new+1) + a²·(−2·y_new) = d + dx + b² − dy_new
      y--;
      dy -= 2 * a2;
      d_after = d + dx + b2 - dy;
      branch  = 1; // SouthEast (Region 1)
    }
    d = d_after;

    steps.push({
      iteration,
      param:       d_before,
      term1:       x_qt,
      term2:       y_qt,
      xComponent:  d_after,
      yComponent:  branch,
      x:           primary.x,
      y:           primary.y,
      extraPoints: extra,
    });
    iteration++;
  }

  // ── Region 2: lanjut dari posisi saat ini, y turun ─────────────────────────
  // Re-init d untuk Region 2 berdasarkan posisi sekarang (x, y):
  // d = F(x+0.5, y−1) = b²·(x+0.5)² + a²·(y−1)² − a²·b²
  d  = Math.round(b2 * (x + 0.5) * (x + 0.5) + a2 * (y - 1) * (y - 1) - a2 * b2);
  dy = 2 * a2 * y; // re-sync dy

  while (y >= 0) {           // kondisi: sampai y = 0
    const x_qt    = x;
    const y_qt    = y;
    const d_before = d;

    const allPts  = sym4(x_qt, y_qt);
    const primary = allPts[0];
    const extra   = allPts.slice(1);

    // y selalu turun di Region 2
    y--;
    dy -= 2 * a2;

    let d_after: number;
    let branch: number;

    if (d > 0) {
      // Pilih South: hanya y turun
      // d_new = d + a²·(3 − 2·y_old) = d + 3a² − dy_old = d + a² − dy_new
      d_after = d + a2 - dy;
      branch  = 2; // South (Region 2)
    } else {
      // Pilih SouthEast: x naik + y turun
      // d_new = d + 2·b²·x_new + a²·(3 − 2·y_old) = d + dx_new + a² − dy_new
      x++;
      dx += 2 * b2;
      d_after = d + a2 - dy + dx;
      branch  = 3; // SouthEast (Region 2)
    }
    d = d_after;

    steps.push({
      iteration,
      param:       d_before,
      term1:       x_qt,
      term2:       y_qt,
      xComponent:  d_after,
      yComponent:  branch,
      x:           primary.x,
      y:           primary.y,
      extraPoints: extra,
    });
    iteration++;
  }

  return steps;
};
