import { generateCircleSteps } from "../algorithms/circle";
import { generateEllipseSteps } from "../algorithms/ellipse";
import { generateParabolaSteps } from "../algorithms/parabola";
import { generateHyperbolaSteps } from "../algorithms/hyperbola";

const LOOPS = 10000;
// Budget maksimal operasi yang diizinkan per kurva
const TARGET_MAX_OPS = 300;

interface ResultRow {
  Kurva: string;
  Skenario: string;
  "Nilai Delta": number;
  "Jumlah Iterasi": number;
  "Jumlah Operasi (op.)": number;
  "Estimasi Beban Komputasi (ms)": string;
  "Status Budget": string;
}

const results: ResultRow[] = [];

/**
 * Mencari nilai delta terkecil (terhalus) yang jumlah operasionalnya
 * tidak melebihi TARGET_MAX_OPS.
 */
function findOptimalDelta(
  fn: (delta: number) => any[],
  opsPerIter: number,
  maxOps: number,
): { optimalDelta: number; iterations: number; totalOps: number } {
  let bestDelta = 2.0;
  let bestIterations = 0;
  let bestOps = 0;

  for (let d = 2.0; d >= 0.001; d -= 0.005) {
    const result = fn(d);
    const iterations = result.length;
    const ops = iterations * opsPerIter;

    if (ops <= maxOps) {
      bestDelta = d;
      bestIterations = iterations;
      bestOps = ops;
    } else {
      break;
    }
  }

  if (bestOps === 0) {
    const r = fn(2.0);
    bestIterations = r.length;
    bestOps = bestIterations * opsPerIter;
  }

  return {
    optimalDelta: Number(bestDelta.toFixed(3)),
    iterations: bestIterations,
    totalOps: bestOps,
  };
}

function runSingleTest(
  name: string,
  skenario: string,
  delta: number,
  fn: (delta: number) => any[],
  opsPerIter: number,
) {
  const result = fn(delta);
  const iterations = result.length;
  const totalOps = iterations * opsPerIter;

  const start = performance.now();
  for (let i = 0; i < LOOPS; i++) {
    fn(delta);
  }
  const end = performance.now();
  const timeTaken = (end - start).toFixed(2);

  let status = "";
  if (totalOps <= TARGET_MAX_OPS) {
    status =
      totalOps >= TARGET_MAX_OPS * 0.8
        ? "Optimal (Sesuai Budget)"
        : "Aman (Di bawah budget)";
  } else {
    status = "Boros (Overbudget)";
  }

  results.push({
    Kurva: name,
    Skenario: skenario,
    "Nilai Delta": Number(delta.toFixed(3)),
    "Jumlah Iterasi": iterations,
    "Jumlah Operasi (op.)": totalOps,
    "Estimasi Beban Komputasi (ms)": timeTaken,
    "Status Budget": status,
  });
}

function testPerformance(
  name: string,
  fn: (delta: number) => any[],
  opsPerIter: number,
) {
  // 1. Cari delta optimal berdasarkan budget
  const { optimalDelta } = findOptimalDelta(fn, opsPerIter, TARGET_MAX_OPS);

  // 2. Tentukan 3 delta terdekat untuk perbandingan
  const deltaLebihKasar = optimalDelta * 1.5;
  const deltaLebihHalus = optimalDelta * 0.75;
  const deltaSangatHalus = optimalDelta * 0.5;

  // 3. Jalankan pengujian untuk ke-4 skenario
  runSingleTest(name, "1. Lebih Kasar (+50%)", deltaLebihKasar, fn, opsPerIter);
  runSingleTest(name, "2. Target Optimal", optimalDelta, fn, opsPerIter);
  runSingleTest(name, "3. Lebih Halus (-25%)", deltaLebihHalus, fn, opsPerIter);
  runSingleTest(
    name,
    "4. Sangat Halus (-50%)",
    deltaSangatHalus,
    fn,
    opsPerIter,
  );
}

// Menjalankan pencarian delta optimal untuk masing-masing kurva
testPerformance("Lingkaran", (d) => generateCircleSteps(0, 0, 100, d), 2); // 2 op dari: Math.cos(theta) dan Math.sin(theta)
testPerformance("Elips", (d) => generateEllipseSteps(0, 0, 100, 50, d), 2); // 2 op dari: Math.cos(theta) dan Math.sin(theta)
testPerformance(
  "Parabola",
  (d) => generateParabolaSteps(0, 0, 1, -10, 10, d),
  3,
); // 3 op dari: t*t, a*t^2, 2*a*t
testPerformance("Hiperbola", (d) => generateHyperbolaSteps(0, 0, 50, 30, d), 3); // 3 op dari: Math.cos(theta), 1/cos(theta), dan Math.tan(theta)

console.log(
  `\n=== HASIL PERBANDINGAN DELTA OPTIMAL vs 3 DELTA TERDEKAT (Budget Maks: ${TARGET_MAX_OPS} op) ===`,
);
console.table(results);
