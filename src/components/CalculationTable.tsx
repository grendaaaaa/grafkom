import React, { useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type {
  Point,
  CalculationStep,
  CurveType,
  AlgorithmType,
} from "../types";

interface Props {
  steps: CalculationStep[];
  xc: number;
  yc: number;
  r: number;
  a: number;
  b: number;
  focusA: number;
  hA: number;
  hB: number;
  curveType: CurveType;
  algorithmType: AlgorithmType;
}

export const CalculationTable: React.FC<Props> = ({
  steps,
  xc,
  yc,
  r,
  a,
  b,
  focusA,
  hA,
  hB,
  curveType,
  algorithmType,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [steps]);

  const headers = () => {
    // ── Bresenham headers ──────────────────────────────────
    if (algorithmType === "bresenham") {
      if (curveType === "lingkaran")
        return {
          param: "d (sebelum)",
          t1: "x_oct",
          t2: "y_oct",
          xH: "d (sesudah)",
          yH: "Titik Plot",
        };
      if (curveType === "elips")
        return {
          param: "d (sebelum)",
          t1: "x_qt",
          t2: "y_qt",
          xH: "d (sesudah)",
          yH: "Titik Plot",
        };
    }
    // ── Parametrik headers ─────────────────────────────────
    if (curveType === "lingkaran")
      return {
        param: "θ (rad)",
        t1: "cos(θ)",
        t2: "sin(θ)",
        xH: `x = ${xc} + ${r}·cos(θ)`,
        yH: `y = ${yc} + ${r}·sin(θ)`,
      };
    if (curveType === "elips")
      return {
        param: "θ (rad)",
        t1: "cos(θ)",
        t2: "sin(θ)",
        xH: `x = ${xc} + ${a}·cos(θ)`,
        yH: `y = ${yc} + ${b}·sin(θ)`,
      };
    if (curveType === "parabola")
      return {
        param: "t",
        t1: "t",
        t2: "t²",
        xH: `x = ${xc} + ${focusA}·t²`,
        yH: `y = ${yc} + ${2 * focusA}·t`,
      };
    if (curveType === "hiperbola")
      return {
        param: "θ (rad)",
        t1: "sec(θ)",
        t2: "tan(θ)",
        xH: `x = ${xc} + ${hA}·sec(θ)`,
        yH: `y = ${yc} + ${hB}·tan(θ)`,
      };
    return { param: "param", t1: "term1", t2: "term2", xH: "x", yH: "y" };
  };
  const h = headers();

  const paramLabel = () => {
    if (algorithmType === "bresenham") {
      if (curveType === "lingkaran")
        return `Bresenham — r=${Math.round(r)} | Pusat: (${Math.round(xc)}, ${Math.round(yc)})`;
      if (curveType === "elips")
        return `Bresenham — a=${Math.round(a)}, b=${Math.round(b)} | Pusat: (${Math.round(xc)}, ${Math.round(yc)})`;
    }
    if (curveType === "lingkaran" || curveType === "elips")
      return "Pusat: xc=" + xc + ", yc=" + yc;
    if (curveType === "parabola")
      return `Vertex: xp=${xc}, yp=${yc} | a=${focusA}`;
    if (curveType === "hiperbola")
      return `Pusat: xc=${xc}, yc=${yc} | Transv. a=${hA} | Konjugasi b=${hB}`;
    return "";
  };

  /** Label teks untuk nilai yComponent (branch decision Bresenham) */
  const branchLabel = (v: number, curve: CurveType): string => {
    if (curve === "lingkaran") return v === 0 ? "East" : "SE";
    // elips: 0=E(R1), 1=SE(R1), 2=S(R2), 3=SE(R2)
    return ["E·R1", "SE·R1", "S·R2", "SE·R2"][v] ?? "?";
  };
  const branchColor = (v: number): string => {
    const map: Record<number, string> = {
      0: "bg-blue-100 text-blue-700",
      1: "bg-purple-100 text-purple-700",
      2: "bg-orange-100 text-orange-700",
      3: "bg-rose-100 text-rose-700",
    };
    return map[v] ?? "bg-gray-100 text-gray-500";
  };

  const [selectedStep, setSelectedStep] =
    React.useState<CalculationStep | null>(null);

  // PBUG-3: Auto-close modal saat steps dikosongkan (misal setelah Reset)
  useEffect(() => {
    if (steps.length === 0) setSelectedStep(null);
  }, [steps]);

  // BUG-A4: Hitung currentStepIndex — jika -1 (step tidak ditemukan), tutup modal
  let hasPrev = false;
  let hasNext = false;
  let currentStepIndex = -1;
  if (selectedStep) {
    currentStepIndex = steps.findIndex((s) => s === selectedStep);
    // BUG-A4: selectedStep ada tapi tidak ditemukan di steps → state sudah stale
    // Tidak langsung setSelectedStep(null) di render — lakukan di useEffect
    if (currentStepIndex !== -1) {
      hasPrev = steps.slice(0, currentStepIndex).some((s) => !isNaN(s.x));
      hasNext = steps.slice(currentStepIndex + 1).some((s) => !isNaN(s.x));
    }
  }

  // BUG-A4: Jika selectedStep tidak lagi ada di steps, tutup modal secara aman
  useEffect(() => {
    if (selectedStep && steps.findIndex((s) => s === selectedStep) === -1) {
      setSelectedStep(null);
    }
  }, [steps, selectedStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex <= 0) return;
    for (let i = currentStepIndex - 1; i >= 0; i--) {
      if (!isNaN(steps[i].x)) {
        setSelectedStep(steps[i]);
        return;
      }
    }
  }, [currentStepIndex, steps]);

  const handleNextStep = useCallback(() => {
    if (currentStepIndex < 0) return;
    for (let i = currentStepIndex + 1; i < steps.length; i++) {
      if (!isNaN(steps[i].x)) {
        setSelectedStep(steps[i]);
        return;
      }
    }
  }, [currentStepIndex, steps]);

  const formulaLabel = (step: CalculationStep, curve: CurveType) => {
    const { param: d, term1: x, term2: y, yComponent: branch } = step;
    if (curve === "lingkaran") {
      return branch === 0
        ? `${d.toFixed(0)} + 4(${x}) + 6`
        : `${d.toFixed(0)} + 4(${x} - ${y}) + 10`;
    }
    if (curve === "elips") {
      const a2 = Math.round(a * a);
      const b2 = Math.round(b * b);
      // BUG-A1 FIX: tampilkan ekspresi simbolik "(x+1)" bukan substitusi angka
      // agar konsisten dengan notasi rumus Bresenham standar
      if (branch === 0) return `${d.toFixed(0)} + ${2 * b2}·(${x}+1) + ${b2}`;
      if (branch === 1)
        return `${d.toFixed(0)} + ${2 * b2}·(${x}+1) - ${2 * a2}·(${y}-1) + ${b2}`;
      if (branch === 2) return `${d.toFixed(0)} - ${2 * a2}·(${y}-1) + ${a2}`;
      if (branch === 3)
        return `${d.toFixed(0)} + ${2 * b2}·(${x}+1) - ${2 * a2}·(${y}-1) + ${a2}`;
    }
    return "";
  };

  const getSymmetryBreakdown = (
    p: Point,
    step: CalculationStep,
    xc: number,
    yc: number,
  ) => {
    const dx = p.x - Math.round(xc);
    const dy = p.y - Math.round(yc);
    const x_val = Math.round(step.term1);
    const y_val = Math.round(step.term2);

    // BUG-A2 FIX: Saat x_val === y_val (titik diagonal 45°, iterasi terakhir lingkaran),
    // kita tidak bisa membedakan "+x" vs "+y" hanya dari magnitude.
    // Strategi: jika x_val === y_val, periksa apakah titik ini adalah titik PRIMER
    // (selalu berpola +x di X, +y di Y) atau simetri. Karena 8 titik simetri saat
    // x=y semuanya memiliki |dx|=|dy|=x_val, kita cukup lihat tanda saja.
    const isXEqY = x_val !== 0 && x_val === y_val;

    const resolveComponent = (
      delta: number,
      primaryFirst: boolean, // apakah komponen ini adalah x atau y di posisi primer
    ): { str: string; numStr: string } => {
      if (delta === 0) {
        return { str: "xc + 0", numStr: `${Math.round(xc)} + 0` };
      }
      if (isXEqY) {
        // Saat x=y, semua simetri punya |delta|=x_val. Hanya bisa bedakan via tanda.
        // Konvensi: gunakan "x" untuk komponen yang punya sign positif di titik primer,
        // "y" untuk yang lain (tidak ada perbedaan substantif karena x_val=y_val).
        const label = primaryFirst ? "x" : "y";
        return {
          str: delta > 0 ? `xc + ${label}` : `xc - ${label}`,
          numStr: delta > 0
            ? `${Math.round(xc)} + ${x_val}`
            : `${Math.round(xc)} - ${x_val}`,
        };
      }
      // Kasus normal (x_val !== y_val): cocokkan magnitude
      if (Math.abs(delta) === x_val) {
        return {
          str: delta > 0 ? "xc + x" : "xc - x",
          numStr: delta > 0 ? `${Math.round(xc)} + ${x_val}` : `${Math.round(xc)} - ${x_val}`,
        };
      }
      if (Math.abs(delta) === y_val && y_val !== 0) {
        return {
          str: delta > 0 ? "xc + y" : "xc - y",
          numStr: delta > 0 ? `${Math.round(xc)} + ${y_val}` : `${Math.round(xc)} - ${y_val}`,
        };
      }
      // Fallback
      return {
        str: `xc + ${delta}`,
        numStr: `${Math.round(xc)} + ${delta}`,
      };
    };

    const resolveYComponent = (
      delta: number,
      primaryFirst: boolean,
    ): { str: string; numStr: string } => {
      if (delta === 0) {
        return { str: "yc + 0", numStr: `${Math.round(yc)} + 0` };
      }
      if (isXEqY) {
        const label = primaryFirst ? "y" : "x";
        return {
          str: delta > 0 ? `yc + ${label}` : `yc - ${label}`,
          numStr: delta > 0
            ? `${Math.round(yc)} + ${y_val}`
            : `${Math.round(yc)} - ${y_val}`,
        };
      }
      // Kasus normal: di komponen Y, y_val datang pertama
      if (Math.abs(delta) === y_val) {
        return {
          str: delta > 0 ? "yc + y" : "yc - y",
          numStr: delta > 0 ? `${Math.round(yc)} + ${y_val}` : `${Math.round(yc)} - ${y_val}`,
        };
      }
      if (Math.abs(delta) === x_val && x_val !== 0) {
        return {
          str: delta > 0 ? "yc + x" : "yc - x",
          numStr: delta > 0 ? `${Math.round(yc)} + ${x_val}` : `${Math.round(yc)} - ${x_val}`,
        };
      }
      // Fallback
      return {
        str: `yc + ${delta}`,
        numStr: `${Math.round(yc)} + ${delta}`,
      };
    };

    const xRes = resolveComponent(dx, true);
    const yRes = resolveYComponent(dy, true);

    return {
      formula: `(${xRes.str}, ${yRes.str})`,
      numbers: `(${xRes.numStr}, ${yRes.numStr})`,
      result: `(${p.x.toFixed(0)}, ${p.y.toFixed(0)})`,
    };
  };

  const getParametricBreakdown = (step: CalculationStep, curve: CurveType) => {
    const t1 = step.term1.toFixed(4);
    const t2 = step.term2.toFixed(4);
    const xcStr = Math.round(xc).toString();
    const ycStr = Math.round(yc).toString();

    let xFormula = "";
    let yFormula = "";
    let xCalc = "";
    let yCalc = "";

    if (curve === 'lingkaran') {
      xFormula = `xc + r·cos(θ)`;
      yFormula = `yc + r·sin(θ)`;
      xCalc = `${xcStr} + ${Math.round(r)}(${t1})`;
      yCalc = `${ycStr} + ${Math.round(r)}(${t2})`;
    } else if (curve === 'elips') {
      xFormula = `xc + a·cos(θ)`;
      yFormula = `yc + b·sin(θ)`;
      xCalc = `${xcStr} + ${Math.round(a)}(${t1})`;
      yCalc = `${ycStr} + ${Math.round(b)}(${t2})`;
    } else if (curve === 'parabola') {
      // PBUG-1 NOTE: Di parabola.ts, term1=t dan term2=t².
      // Formula: x = xc + a·t²  → menggunakan term2 (t²)
      //          y = yc + 2a·t   → menggunakan term1 (t)
      // Ini SENGAJA "terbalik" urutan term, sesuai mapping di parabola.ts.
      xFormula = `xc + a·t²`;
      yFormula = `yc + 2a·t`;
      xCalc = `${xcStr} + ${focusA}·(${t2})`; // t2 = t² ✓
      yCalc = `${ycStr} + ${2*focusA}·(${t1})`; // t1 = t  ✓
    } else if (curve === 'hiperbola') {
      xFormula = `xc + a·sec(θ)`;
      yFormula = `yc + b·tan(θ)`;
      xCalc = `${xcStr} + ${hA}(${t1})`;
      yCalc = `${ycStr} + ${hB}(${t2})`;
    }

    return { xFormula, yFormula, xCalc, yCalc };
  };

  const getBresenhamFormulaName = (step: CalculationStep, curve: CurveType) => {
    const { yComponent: branch } = step;
    if (curve === 'lingkaran') {
      return branch === 0 ? 'd += 4x + 6' : 'd += 4(x-y) + 10';
    }
    if (curve === 'elips') {
      if (branch === 0) return 'd += 2b²(x+1) + b²';
      if (branch === 1) return 'd += 2b²(x+1) - 2a²(y-1) + b²';
      if (branch === 2) return 'd -= 2a²(y-1) + a²';
      if (branch === 3) return 'd += 2b²(x+1) - 2a²(y-1) + a²';
    }
    return '';
  };

  return (
    <div className="flex flex-col h-[500px] relative">
      <div className="p-5 border-b-2 border-palette-teal/20 bg-palette-teal/5">
        <h2 className="text-xl font-black text-palette-teal tracking-tight">
          Log Perhitungan Detail (Step-by-Step)
        </h2>
        <p className="text-sm text-palette-teal/70 font-mono mt-1 font-bold">
          {paramLabel()}
        </p>
      </div>

      <div
        className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-white/40"
        ref={scrollRef}
      >
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-palette-teal sticky top-0 shadow-md text-white z-10">
            <tr>
              <th className="py-4 px-4 font-bold text-center border-r border-[#1d4d52]/50">
                It
              </th>
              <th className="py-4 px-4 font-bold border-r border-[#1d4d52]/50">
                {h.param}
              </th>
              <th className="py-4 px-4 font-bold border-r border-[#1d4d52]/50">
                {h.t1}
              </th>
              <th className="py-4 px-4 font-bold border-r border-[#1d4d52]/50">
                {h.t2}
              </th>
              <th className="py-4 px-4 font-bold border-r border-[#1d4d52]/50 text-palette-cream">
                {h.xH}
              </th>
              <th className="py-4 px-4 font-bold text-palette-cream">{h.yH}</th>
              <th className="py-4 px-4 font-bold text-center text-palette-cream">
                Info
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-palette-teal/10">
            {steps.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-palette-teal/50 font-bold italic text-base"
                >
                  Belum ada kalkulasi. Tekan "PLAY" atau maju per langkah.
                </td>
              </tr>
            ) : (
              steps.map((step, idx) => {
                if (isNaN(step.x)) {
                  return (
                    <tr key={`sep-${idx}`} className="bg-palette-teal/10">
                      <td
                        colSpan={7}
                        className="py-2 px-4 text-center text-palette-teal/70 font-bold italic text-xs tracking-widest"
                      >
                        --- PERPINDAHAN CABANG KURVA ---
                      </td>
                    </tr>
                  );
                }

                // ── Bresenham row ──────────────────────────────
                if (algorithmType === "bresenham") {
                  const totalPlotted = 1 + (step.extraPoints?.length ?? 0);
                  return (
                    <tr
                      key={step.iteration}
                      className="hover:bg-palette-olive/20 transition-colors font-mono"
                    >
                      <td className="py-3 px-4 text-[#1d4d52] text-center border-r border-palette-teal/10 font-bold">
                        {step.iteration}
                      </td>
                      <td className="py-3 px-4 text-palette-teal border-r border-palette-teal/10 font-bold bg-palette-teal/5">
                        {step.param.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 border-r border-palette-teal/10 font-medium">
                        {step.term1.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 border-r border-palette-teal/10 font-medium">
                        {step.term2.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 border-r border-palette-teal/10">
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded mr-2 ${branchColor(step.yComponent)}`}
                        >
                          {branchLabel(step.yComponent, curveType)}
                        </span>
                        <span className="text-[#1d4d52] font-extrabold bg-palette-olive/40 px-2 py-0.5 rounded">
                          {step.xComponent.toFixed(0)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-r border-palette-teal/10">
                        <span className="text-palette-teal font-extrabold bg-palette-cream border border-palette-sage/50 px-2 py-0.5 rounded">
                          ({step.x.toFixed(0)}, {step.y.toFixed(0)})
                        </span>
                        {totalPlotted > 1 && (
                          <span className="ml-2 text-xs text-gray-500 font-semibold">
                            +{totalPlotted - 1}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedStep(step)}
                          className="px-3 py-1 bg-palette-teal text-white text-xs font-bold rounded-lg hover:bg-[#1d4d52] transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                }

                // ── Parametrik row (default) ───────────────────
                return (
                  <tr
                    key={step.iteration}
                    className="hover:bg-palette-olive/20 transition-colors font-mono"
                  >
                    <td className="py-3 px-4 text-[#1d4d52] text-center border-r border-palette-teal/10 font-bold">
                      {step.iteration}
                    </td>
                    <td className="py-3 px-4 text-palette-teal border-r border-palette-teal/10 font-bold bg-palette-teal/5">
                      {step.param.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 border-r border-palette-teal/10 font-medium">
                      {step.term1.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 border-r border-palette-teal/10 font-medium">
                      {step.term2.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 border-r border-palette-teal/10">
                      <span className="text-[#1d4d52] font-extrabold bg-palette-olive/40 px-2 py-0.5 rounded mr-2">
                        {step.x.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-r border-palette-teal/10">
                      <span className="text-palette-teal font-extrabold bg-palette-cream border border-palette-sage/50 px-2 py-0.5 rounded mr-2">
                        {step.y.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedStep(step)}
                        className="px-3 py-1 bg-palette-teal text-white text-xs font-bold rounded-lg hover:bg-[#1d4d52] transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── FLOATING MODAL DETAIL ────────────────────────────────────────── */}
      {selectedStep &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1d4d52]/30 backdrop-blur-sm"
            onClick={() => setSelectedStep(null)}
          >
            <div
              className="bg-[#f4f8f5] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-palette-sage animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-palette-teal p-5 flex justify-between items-center text-white">
                <div>
                  <h3 className="font-black text-lg">
                    Rincian Langkah #{selectedStep.iteration}
                  </h3>
                  <p className="text-xs text-white/80 font-mono mt-1 bg-white/10 inline-block px-2 py-0.5 rounded">
                    {algorithmType === "bresenham"
                      ? branchLabel(selectedStep.yComponent, curveType)
                      : "Parametrik"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevStep}
                    disabled={!hasPrev}
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-colors ${hasPrev ? 'bg-white/10 hover:bg-white/20' : 'opacity-30 cursor-not-allowed'}`}
                    title="Langkah Sebelumnya"
                  >
                    ❮
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!hasNext}
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-colors ${hasNext ? 'bg-white/10 hover:bg-white/20' : 'opacity-30 cursor-not-allowed'}`}
                    title="Langkah Selanjutnya"
                  >
                    ❯
                  </button>
                  <div className="w-px h-6 bg-white/20 mx-1"></div>
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 transition-colors font-bold"
                    title="Tutup Modal"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Box 1: Kalkulasi d / Kalkulasi parametrik */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-palette-teal">
                    Kalkulasi Formula
                  </h4>
                  <div className="bg-white p-4 rounded-xl border border-palette-sage/50 font-mono text-sm space-y-2">
                    {algorithmType === "bresenham" ? (
                      <>
                        {/* BUG-A3 FIX: Banner d_awal untuk Lingkaran dan Elips di iterasi pertama */}
                        {selectedStep.iteration === 0 && curveType === 'lingkaran' && (
                          <div className="bg-palette-teal/10 p-3 rounded-lg border border-palette-teal/20 mb-4 text-xs text-[#1d4d52] font-medium">
                            <div className="font-bold uppercase tracking-wider mb-2">Inisialisasi Parameter Lingkaran:</div>
                            <code className="bg-white px-2 py-1 rounded font-bold border border-palette-sage/50 block">
                              d_awal = 3 - 2r = 3 - 2({Math.round(r)}) = {selectedStep.param.toFixed(0)}
                            </code>
                          </div>
                        )}
                        {selectedStep.iteration === 0 && curveType === 'elips' && (
                          <div className="bg-palette-teal/10 p-3 rounded-lg border border-palette-teal/20 mb-4 text-xs text-[#1d4d52] font-medium">
                            <div className="font-bold uppercase tracking-wider mb-2">Inisialisasi Parameter Elips (Region 1):</div>
                            <div className="space-y-1 font-mono">
                              <div className="text-gray-600">d_awal = b² - a²·b + 0.25·a²</div>
                              <code className="bg-white px-2 py-1 rounded font-bold border border-palette-sage/50 block">
                                = {Math.round(b*b)} - {Math.round(a*a)}·{Math.round(b)} + 0.25·{Math.round(a*a)} = {selectedStep.param.toFixed(0)}
                              </code>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-gray-500">Nilai Parameter Awal (d)</span>
                          <span className="font-bold text-[#1d4d52]">
                            {selectedStep.param.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-gray-100 gap-2">
                          <span className="text-gray-500">Evaluasi Kondisi & Rumus</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold">
                              {selectedStep.param < 0 ? 'd < 0' : 'd ≥ 0'}
                            </span>
                            <span className="text-gray-400">➔</span>
                            <span className="bg-palette-teal/10 text-palette-teal px-2 py-1 rounded font-bold">
                              {getBresenhamFormulaName(selectedStep, curveType)}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 text-gray-700">
                          <span>Penjabaran d (sesudah)</span>
                          <span className="bg-palette-olive/20 px-2 py-1 rounded font-bold">
                            {formulaLabel(selectedStep, curveType)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                          <span className="font-bold text-[#1d4d52]">Hasil Akhir Parameter</span>
                          <span className="font-black text-lg text-[#1d4d52]">
                            {selectedStep.xComponent.toFixed(0)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
                          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                            Perhitungan Sumbu X
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-sm">
                            <span className="font-bold text-palette-teal w-28 shrink-0">{getParametricBreakdown(selectedStep, curveType).xFormula}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-600">{getParametricBreakdown(selectedStep, curveType).xCalc}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-500">{Math.round(xc)} + {selectedStep.xComponent.toFixed(2)}</span>
                            <span className="font-black text-[#1d4d52] ml-auto text-base whitespace-nowrap">= {selectedStep.x.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
                          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                            Perhitungan Sumbu Y
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-sm">
                            <span className="font-bold text-palette-teal w-28 shrink-0">{getParametricBreakdown(selectedStep, curveType).yFormula}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-600">{getParametricBreakdown(selectedStep, curveType).yCalc}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-500">{Math.round(yc)} + {selectedStep.yComponent.toFixed(2)}</span>
                            <span className="font-black text-[#1d4d52] ml-auto text-base whitespace-nowrap">= {selectedStep.y.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Box 2: Titik Plot (Symmetry) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-palette-teal">
                    Rincian Titik yang Digambar
                  </h4>
                  <div className="bg-white p-4 rounded-xl border border-palette-sage/50 font-mono text-sm">
                    {algorithmType === "bresenham" ? (
                      <>
                        <div className="mb-4 bg-palette-teal/5 border border-palette-teal/20 px-3 py-2 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="flex items-center gap-2 mb-1 sm:mb-0">
                            <span className="inline-block bg-palette-teal text-white px-2 py-0.5 rounded text-[10px] font-bold">
                              PRIMER
                            </span>
                            <span className="font-bold text-palette-teal w-32 whitespace-nowrap">
                              {
                                getSymmetryBreakdown(
                                  { x: selectedStep.x, y: selectedStep.y },
                                  selectedStep,
                                  xc,
                                  yc,
                                ).formula
                              }
                            </span>
                            <span className="text-gray-400 hidden sm:inline">
                              →
                            </span>
                            <span className="text-gray-600 font-mono">
                              {
                                getSymmetryBreakdown(
                                  { x: selectedStep.x, y: selectedStep.y },
                                  selectedStep,
                                  xc,
                                  yc,
                                ).numbers
                              }
                            </span>
                          </div>
                          <span className="font-black text-[#1d4d52] bg-white px-2 py-1 rounded shadow-sm border border-palette-sage text-right">
                            ={" "}
                            {
                              getSymmetryBreakdown(
                                { x: selectedStep.x, y: selectedStep.y },
                                selectedStep,
                                xc,
                                yc,
                              ).result
                            }
                          </span>
                        </div>

                        {selectedStep.extraPoints &&
                          selectedStep.extraPoints.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 mb-2 border-t border-gray-100 pt-3 uppercase tracking-wider">
                                Pancaran {selectedStep.extraPoints.length} Titik
                                Simetri:
                              </div>
                              <div className="flex flex-col gap-2">
                                {selectedStep.extraPoints.map((p, i) => {
                                  const breakdown = getSymmetryBreakdown(
                                    p,
                                    selectedStep,
                                    xc,
                                    yc,
                                  );
                                  return (
                                    <div
                                      key={i}
                                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-xs hover:bg-palette-olive/10 transition-colors"
                                    >
                                      <div className="flex items-center gap-2 mb-1 sm:mb-0">
                                        <span className="font-bold text-palette-teal w-32 whitespace-nowrap">
                                          {breakdown.formula}
                                        </span>
                                        <span className="text-gray-400 hidden sm:inline">
                                          →
                                        </span>
                                        <span className="text-gray-600 font-mono">
                                          {breakdown.numbers}
                                        </span>
                                      </div>
                                      <span className="font-black text-[#1d4d52] bg-white px-2 py-1 rounded shadow-sm border border-gray-100 text-right">
                                        = {breakdown.result}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-palette-teal/5 border border-palette-teal/20 px-3 py-2 rounded-lg text-xs">
                        <div className="flex items-center gap-2 mb-1 sm:mb-0">
                          <span className="inline-block bg-palette-teal text-white px-2 py-0.5 rounded text-[10px] font-bold">
                            HASIL
                          </span>
                          <span className="text-gray-600 font-mono">
                            Hasil akhir kalkulasi parametrik
                          </span>
                        </div>
                        <span className="font-black text-[#1d4d52] bg-white px-2 py-1 rounded shadow-sm border border-palette-sage text-right">
                          = ({selectedStep.x.toFixed(2)},{" "}
                          {selectedStep.y.toFixed(2)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
