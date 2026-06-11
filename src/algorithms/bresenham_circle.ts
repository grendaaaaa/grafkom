import type { CalculationStep } from '../types';

/**
 * Midpoint Circle Algorithm (Bresenham Circle)
 *
 * Integer arithmetic murni — tidak ada Math.sin / Math.cos.
 * Memanfaatkan 8-fold symmetry: setiap iterasi menghasilkan hingga 8 piksel sekaligus.
 *
 * Inisialisasi:
 *   x = 0,  y = r,  d = 3 − 2r
 *
 * Setiap langkah:
 *   Plot 8 titik simetri di sekitar (xc, yc)
 *   if d < 0 : d ← d + 4x + 6          → East    (y tetap)
 *   else      : d ← d + 4(x − y) + 10  → SouthEast (y--)
 *   x++
 *
 * Berhenti saat x > y.
 *
 * Mapping ke CalculationStep:
 *   param      = d sebelum keputusan
 *   term1      = x_oct  (koordinat di oktan 1)
 *   term2      = y_oct  (koordinat di oktan 1)
 *   xComponent = d sesudah keputusan
 *   yComponent = 0 (East) | 1 (SouthEast)
 *   x, y       = titik utama yang diplot (xc + x_oct, yc + y_oct)
 *   extraPoints= 7 titik simetri lainnya
 */
export const generateBCircleSteps = (
  xc: number, yc: number, r: number
): CalculationStep[] => {
  const ri  = Math.round(r);
  const xci = Math.round(xc);
  const yci = Math.round(yc);
  if (ri <= 0) return [];

  const steps: CalculationStep[] = [];
  let x = 0;
  let y = ri;
  let d = 3 - 2 * ri;
  let iteration = 0;

  /** Hasilkan hingga 8 titik simetri, hapus duplikat (terjadi saat x=0, x=y, atau y=0) */
  const sym8 = (px: number, py: number): { x: number; y: number }[] => {
    const candidates = [
      { x: xci + px, y: yci + py },
      { x: xci - px, y: yci + py },
      { x: xci + px, y: yci - py },
      { x: xci - px, y: yci - py },
      { x: xci + py, y: yci + px },
      { x: xci - py, y: yci + px },
      { x: xci + py, y: yci - px },
      { x: xci - py, y: yci - px },
    ];
    const seen = new Set<string>();
    return candidates.filter(p => {
      const key = `${p.x},${p.y}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  while (x <= y) {
    // Capture state SEBELUM update untuk keperluan logging
    const x_oct    = x;
    const y_oct    = y;
    const d_before = d;

    // Semua titik simetri untuk iterasi ini
    const allPts  = sym8(x_oct, y_oct);
    const primary = allPts[0]; // (xci + x, yci + y) — Oktan 1
    const extra   = allPts.slice(1);

    // Keputusan: East atau SouthEast
    let d_after: number;
    let branch: number; // 0 = East, 1 = SouthEast

    if (d < 0) {
      d_after = d + 4 * x + 6;
      branch  = 0; // East — y tetap
    } else {
      d_after = d + 4 * (x - y) + 10;
      branch  = 1; // SouthEast — y akan turun
      y--;
    }
    d = d_after;
    x++;

    steps.push({
      iteration,
      param:       d_before,
      term1:       x_oct,
      term2:       y_oct,
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
