export type Point = {
  x: number;
  y: number;
};

/**
 * CalculationStep — generik untuk semua kurva.
 *
 * Lingkaran/Elips:  param = θ,  term1 = cos(θ),  term2 = sin(θ),
 *                   xComponent = a·cos(θ),  yComponent = b·sin(θ)
 *
 * Parabola:         param = t,  term1 = t,        term2 = t²,
 *                   xComponent = a·t²,   yComponent = 2·a·t
 */
export type CalculationStep = {
  iteration: number;
  param: number;       // θ (lingkaran/elips) atau t (parabola)
  term1: number;       // cos(θ) atau t
  term2: number;       // sin(θ) atau t²
  xComponent: number;  // kontribusi x sebelum ditambah xc/xp
  yComponent: number;  // kontribusi y sebelum ditambah yc/yp
  x: number;
  y: number;
};

export type CurveType = 'lingkaran' | 'elips' | 'parabola' | 'hiperbola';

export type VisualizationMode = 'geometri' | 'presisi' | 'analisis';

export type AlgorithmPhase = 'idle' | 'init' | 'running' | 'paused' | 'done';
