export type Point = {
  x: number;
  y: number;
};

/**
 * CalculationStep — generik untuk semua kurva.
 *
 * Parametrik Lingkaran/Elips:  param = θ,  term1 = cos(θ),  term2 = sin(θ)
 *                               xComponent = a·cos(θ),  yComponent = b·sin(θ)
 *
 * Parametrik Parabola:         param = t,  term1 = t,  term2 = t²
 *                               xComponent = a·t²,  yComponent = 2·a·t
 *
 * Bresenham Lingkaran:         param = d (sebelum),  term1 = x_oct,  term2 = y_oct
 *                               xComponent = d (sesudah),  yComponent = branch (0=E, 1=SE)
 *
 * Bresenham Elips:             param = d (sebelum),  term1 = x_qt,  term2 = y_qt
 *                               xComponent = d (sesudah)
 *                               yComponent = branch (0=E·R1, 1=SE·R1, 2=S·R2, 3=SE·R2)
 */
export type CalculationStep = {
  iteration: number;
  param: number;
  term1: number;
  term2: number;
  xComponent: number;
  yComponent: number;
  x: number;
  y: number;
  /** Bresenham: titik-titik simetri tambahan (8-fold untuk lingkaran, 4-fold untuk elips).
   *  Kosong / undefined untuk algoritma parametrik. */
  extraPoints?: { x: number; y: number }[];
};

export type CurveType = 'lingkaran' | 'elips' | 'parabola' | 'hiperbola';
export type AlgorithmType = 'parametrik' | 'bresenham';

export type VisualizationMode = 'geometri' | 'presisi' | 'analisis';

export type AlgorithmPhase = 'idle' | 'init' | 'running' | 'paused' | 'done';
