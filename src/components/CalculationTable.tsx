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


  type LineItem = { label: string; value?: string; highlight?: boolean; separator?: boolean };

  const renderLines = (lines: LineItem[], title: string) => (
    <div className={`bg-gray-50 rounded-2xl border border-gray-100 flex flex-col overflow-y-auto ${
      fitScreen ? 'p-2 gap-px' : 'p-4 gap-1'
    }`}>
      <div className={`text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200 ${
        fitScreen ? 'text-[9px] mb-1 pb-1' : 'text-xs mb-2 pb-2'
      }`}>
        {title}
      </div>
      {lines.map((line, i) =>
        line.separator ? (
          <div key={i} className={`font-bold uppercase tracking-widest text-palette-teal/60 border-t border-palette-sage/20 font-sans ${
            fitScreen ? 'text-[8px] mt-1 mb-0.5 pt-1' : 'text-[10px] mt-3 mb-1 pt-2'
          }`}>
            {line.label}
          </div>
        ) : (
          <div key={i} className={`flex items-start justify-between rounded ${
            fitScreen ? 'gap-2 py-px px-1' : 'gap-4 py-1 px-2'
          } ${line.highlight ? 'bg-palette-teal/10 border border-palette-teal/20 mt-0.5' : 'hover:bg-white'}`}>
            <span className={`text-gray-500 shrink-0 ${
              fitScreen ? 'text-[10px] max-w-[50%]' : 'text-xs max-w-[55%]'
            }`}>{line.label}</span>
            <span className={`text-right font-mono break-all ${
              line.highlight
                ? fitScreen ? 'font-black text-[#1d4d52] text-[11px]' : 'font-black text-[#1d4d52] text-sm'
                : fitScreen ? 'text-gray-700 text-[10px]' : 'text-gray-700 text-xs'
            }`}>{line.value}</span>
          </div>
        )
      )}
    </div>
  );

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

  const [isMaximized, setIsMaximized] = React.useState(false);
  const [fitScreen, setFitScreen] = React.useState(false);

  // reset fit/maximize when step changes
  React.useEffect(() => {
    setFitScreen(false);
    setIsMaximized(false);
  }, [selectedStep]);

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
                      <td className="py-3 px-4 text-center text-gray-400 text-xs italic">
                        {/* Detail button commented out for Bresenham as requested */}
                        {/* 
                        <button
                          onClick={() => setSelectedStep(step)}
                          className="px-3 py-1 bg-palette-teal text-white text-xs font-bold rounded-lg hover:bg-[#1d4d52] transition-colors"
                        >
                          Detail
                        </button>
                        */}
                        -
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
              className={`bg-[#f4f8f5] shadow-2xl border-2 border-palette-sage animate-in zoom-in-95 duration-200 flex flex-col transition-all overflow-hidden ${
                isMaximized || fitScreen
                  ? 'fixed inset-4 rounded-3xl z-[101]'
                  : 'rounded-[2.5rem] w-full max-w-2xl max-h-[90vh]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`bg-palette-teal flex justify-between items-center text-white shrink-0 ${
                fitScreen ? 'p-3' : 'p-5'
              }`}>
                <div>
                  <h3 className={`font-black ${fitScreen ? 'text-sm' : 'text-lg'}`}>
                    Rincian Langkah #{selectedStep.iteration}
                  </h3>
                  <p className={`text-white/80 font-mono mt-0.5 bg-white/10 inline-block px-2 py-0.5 rounded ${
                    fitScreen ? 'text-[10px]' : 'text-xs'
                  }`}>
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
                  {/* Fit-screen toggle */}
                  <button
                    onClick={() => setFitScreen(f => !f)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      fitScreen ? 'bg-yellow-400 text-[#1d4d52]' : 'bg-white/10 hover:bg-white/20'
                    }`}
                    title={fitScreen ? 'Mode scroll (normal)' : 'Tampilkan semua tanpa scroll'}
                  >
                    {fitScreen ? '⊟' : '⊞'}
                  </button>
                  {/* Maximize toggle */}
                  <button
                    onClick={() => setIsMaximized(m => !m)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors font-bold text-sm"
                    title={isMaximized ? 'Perkecil' : 'Perbesar (layar penuh)'}
                  >
                    {isMaximized ? '⊡' : '⊠'}
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

              <div className={`flex-1 overflow-y-auto custom-scrollbar ${
                fitScreen ? 'p-3 flex flex-col gap-3' : 'p-6 space-y-6'
              }`}
                style={{ minHeight: 0 }}>
                {/* Box 1: Kalkulasi d / Kalkulasi parametrik */}
                <div className={fitScreen ? 'space-y-1' : 'space-y-2'}>
                  <h4 className={`font-bold uppercase tracking-wider text-palette-teal ${
                    fitScreen ? 'text-[9px]' : 'text-xs'
                  }`}>
                    Kalkulasi Formula
                  </h4>
                  <div className={`bg-white rounded-2xl border border-palette-sage/50 font-mono text-sm ${
                    fitScreen ? 'p-2 space-y-1' : 'p-4 space-y-2'
                  }`}>
                    {algorithmType === "bresenham" ? (
                      (() => {
                        const x0 = Math.round(selectedStep.term1);
                        const y0 = Math.round(selectedStep.term2);
                        const d0 = Math.round(selectedStep.param);
                        const dAfter = Math.round(selectedStep.xComponent);
                        const branch = selectedStep.yComponent;
                        const b2 = Math.round(b * b);
                        const a2 = Math.round(a * a);
                        const cr = Math.round(r);

                        // Build step-by-step lines for Bresenham
                        let lines: { label: string; value: string; highlight?: boolean }[] = [];

                        // Initialization block for iteration 0
                        if (selectedStep.iteration === 0) {
                          if (curveType === 'lingkaran') {
                            lines.push({ label: '─── Inisialisasi ───', value: '' });
                            lines.push({ label: 'r', value: `${cr}` });
                            lines.push({ label: 'x₀ = 0', value: '0' });
                            lines.push({ label: 'y₀ = r', value: `${cr}` });
                            lines.push({ label: 'd_awal = 3 - 2r', value: `3 - 2(${cr}) = 3 - ${2*cr} = ${3 - 2*cr}` });
                          } else if (curveType === 'elips') {
                            lines.push({ label: '─── Inisialisasi Region 1 ───', value: '' });
                            lines.push({ label: 'a', value: `${Math.round(a)}`, });
                            lines.push({ label: 'b', value: `${Math.round(b)}` });
                            lines.push({ label: 'a²', value: `${Math.round(a)}² = ${a2}` });
                            lines.push({ label: 'b²', value: `${Math.round(b)}² = ${b2}` });
                            lines.push({ label: 'x₀ = 0', value: '0' });
                            lines.push({ label: 'y₀ = b', value: `${Math.round(b)}` });
                            lines.push({ label: 'd = b² - a²b + 0.25a²', value: `${b2} - ${a2}·${Math.round(b)} + 0.25·${a2}` });
                            lines.push({ label: '     = b² - a²b + 0.25a²', value: `${b2} - ${a2 * Math.round(b)} + ${0.25 * a2} = ${d0}`, highlight: true });
                          }
                        }

                        // Common step-by-step for all iterations
                        lines.push({ label: '─── Iterasi ' + selectedStep.iteration + ' ───', value: '' });
                        lines.push({ label: 'd (sebelum)', value: `${d0}` });
                        lines.push({ label: 'x', value: `${x0}` });
                        lines.push({ label: 'y', value: `${y0}` });
                        lines.push({ label: 'Kondisi: d < 0?', value: d0 < 0 ? `${d0} < 0 → YA → pilih East/Region sesuai` : `${d0} ≥ 0 → TIDAK → pilih SE/Region sesuai` });

                        if (curveType === 'lingkaran') {
                          if (branch === 0) {
                            lines.push({ label: 'Pilih arah', value: 'East (hanya x++)' });
                            lines.push({ label: 'd += 4x + 6', value: `${d0} + 4(${x0}) + 6` });
                            lines.push({ label: '         = d + 4x + 6', value: `${d0} + ${4*x0} + 6 = ${d0 + 4*x0 + 6}`, highlight: true });
                            lines.push({ label: 'x_baru = x + 1', value: `${x0} + 1 = ${x0+1}` });
                            lines.push({ label: 'y_baru = y', value: `${y0} (tidak berubah)` });
                          } else {
                            lines.push({ label: 'Pilih arah', value: 'South-East (x++ dan y--)' });
                            lines.push({ label: 'd += 4(x-y) + 10', value: `${d0} + 4(${x0}-${y0}) + 10` });
                            lines.push({ label: '         = d + 4(x-y) + 10', value: `${d0} + 4(${x0-y0}) + 10 = ${d0 + 4*(x0-y0) + 10}`, highlight: true });
                            lines.push({ label: 'x_baru = x + 1', value: `${x0} + 1 = ${x0+1}` });
                            lines.push({ label: 'y_baru = y - 1', value: `${y0} - 1 = ${y0-1}` });
                          }
                        } else if (curveType === 'elips') {
                          if (branch === 0) {
                            lines.push({ label: 'Region 1 → East', value: '' });
                            lines.push({ label: 'd += 2b²(x+1) + b²', value: `${d0} + 2(${b2})(${x0}+1) + ${b2}` });
                            lines.push({ label: '       = d + 2b²x + 3b²', value: `${d0} + ${2*b2*(x0+1)} + ${b2} = ${dAfter}`, highlight: true });
                            lines.push({ label: 'x_baru = x + 1', value: `${x0} + 1 = ${x0+1}` });
                            lines.push({ label: 'y_baru = y', value: `${y0} (tidak berubah)` });
                          } else if (branch === 1) {
                            lines.push({ label: 'Region 1 → South-East', value: '' });
                            lines.push({ label: 'd += 2b²(x+1) - 2a²(y-1) + b²', value: `${d0} + 2(${b2})(${x0}+1) - 2(${a2})(${y0}-1) + ${b2}` });
                            lines.push({ label: '       (substitusi)', value: `${d0} + ${2*b2*(x0+1)} - ${2*a2*(y0-1)} + ${b2} = ${dAfter}`, highlight: true });
                            lines.push({ label: 'x_baru = x + 1', value: `${x0} + 1 = ${x0+1}` });
                            lines.push({ label: 'y_baru = y - 1', value: `${y0} - 1 = ${y0-1}` });
                          } else if (branch === 2) {
                            lines.push({ label: 'Region 2 → South', value: '' });
                            lines.push({ label: 'd -= 2a²(y-1) + a²', value: `${d0} - 2(${a2})(${y0}-1) + ${a2}` });
                            lines.push({ label: '       (substitusi)', value: `${d0} - ${2*a2*(y0-1)} + ${a2} = ${dAfter}`, highlight: true });
                            lines.push({ label: 'x_baru = x', value: `${x0} (tidak berubah)` });
                            lines.push({ label: 'y_baru = y - 1', value: `${y0} - 1 = ${y0-1}` });
                          } else if (branch === 3) {
                            lines.push({ label: 'Region 2 → South-East', value: '' });
                            lines.push({ label: 'd += 2b²(x+1) - 2a²(y-1) + a²', value: `${d0} + 2(${b2})(${x0}+1) - 2(${a2})(${y0}-1) + ${a2}` });
                            lines.push({ label: '       (substitusi)', value: `${d0} + ${2*b2*(x0+1)} - ${2*a2*(y0-1)} + ${a2} = ${dAfter}`, highlight: true });
                            lines.push({ label: 'x_baru = x + 1', value: `${x0} + 1 = ${x0+1}` });
                            lines.push({ label: 'y_baru = y - 1', value: `${y0} - 1 = ${y0-1}` });
                          }
                        }
                        lines.push({ label: 'd (sesudah)', value: `${dAfter}`, highlight: true });

                        return (
                          <div className="flex flex-col gap-1.5">
                            {lines.map((line, i) => (
                              line.value === '' ? (
                                <div key={i} className="text-[10px] font-bold uppercase tracking-widest text-palette-teal/60 mt-3 mb-1 border-t border-palette-sage/20 pt-2">
                                  {line.label}
                                </div>
                              ) : (
                                <div key={i} className={`flex items-start justify-between gap-4 py-1 px-2 rounded ${line.highlight ? 'bg-palette-teal/10 border border-palette-teal/20' : 'hover:bg-gray-50'}`}>
                                  <span className="text-gray-500 text-xs shrink-0 w-44">{line.label}</span>
                                  <span className={`text-right font-mono text-sm ${line.highlight ? 'font-black text-[#1d4d52]' : 'text-gray-700'}`}>{line.value}</span>
                                </div>
                              )
                            ))}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          const radToDeg = (rad: number) => (rad * 180 / Math.PI).toFixed(4);
                          const p = selectedStep.param;
                          const pDeg = radToDeg(p);
                          const t1 = selectedStep.term1;
                          const t2 = selectedStep.term2;
                          const t1s = t1.toFixed(6);
                          const t2s = t2.toFixed(6);
                          const ps = p.toFixed(6);
                          const psFmt = p.toFixed(3);
                          const cXc = Math.round(xc);
                          const cYc = Math.round(yc);

                          type Line = { label: string; value?: string; highlight?: boolean; separator?: boolean };
                          let xLines: Line[] = [];
                          let yLines: Line[] = [];

                          if (curveType === 'lingkaran') {
                            const cr = Math.round(r);
                            xLines = [
                              { label: 'Rumus', value: 'x = xc + r·cos(θ)' },
                              { separator: true, label: 'Substitusi Parameter' },
                              { label: 'xc', value: `${cXc}` },
                              { label: 'r', value: `${cr}` },
                              { label: 'θ (radian)', value: `${psFmt} rad` },
                              { label: 'θ (derajat) = θ × 180/π', value: `${psFmt} × 180 / π = ${psFmt} × 57.2958 = ${pDeg}°` },
                              { separator: true, label: 'Hitung cos(θ)' },
                              { label: `cos(${psFmt} rad) = cos(${pDeg}°)`, value: `${t1s}` },
                              { separator: true, label: 'Hitung x' },
                              { label: 'x = xc + r·cos(θ)', value: `${cXc} + ${cr} × ${t1s}` },
                              { label: `x = ${cXc} + ${(cr * t1).toFixed(6)}`, value: `${selectedStep.x.toFixed(4)}`, highlight: true },
                            ];
                            yLines = [
                              { label: 'Rumus', value: 'y = yc + r·sin(θ)' },
                              { separator: true, label: 'Substitusi Parameter' },
                              { label: 'yc', value: `${cYc}` },
                              { label: 'r', value: `${cr}` },
                              { label: 'θ (radian)', value: `${psFmt} rad` },
                              { label: 'θ (derajat) = θ × 180/π', value: `${psFmt} × 180 / π = ${psFmt} × 57.2958 = ${pDeg}°` },
                              { separator: true, label: 'Hitung sin(θ)' },
                              { label: `sin(${psFmt} rad) = sin(${pDeg}°)`, value: `${t2s}` },
                              { separator: true, label: 'Hitung y' },
                              { label: 'y = yc + r·sin(θ)', value: `${cYc} + ${cr} × ${t2s}` },
                              { label: `y = ${cYc} + ${(cr * t2).toFixed(6)}`, value: `${selectedStep.y.toFixed(4)}`, highlight: true },
                            ];
                          } else if (curveType === 'elips') {
                            const ca = Math.round(a);
                            const cb = Math.round(b);
                            xLines = [
                              { label: 'Rumus', value: 'x = xc + a·cos(θ)' },
                              { separator: true, label: 'Substitusi Parameter' },
                              { label: 'xc', value: `${cXc}` },
                              { label: 'a (semi-mayor)', value: `${ca}` },
                              { label: 'θ (radian)', value: `${psFmt} rad` },
                              { label: 'θ (derajat) = θ × 180/π', value: `${psFmt} × 57.2958 = ${pDeg}°` },
                              { separator: true, label: 'Hitung cos(θ)' },
                              { label: `cos(${psFmt} rad) = cos(${pDeg}°)`, value: `${t1s}` },
                              { separator: true, label: 'Hitung x' },
                              { label: 'x = xc + a·cos(θ)', value: `${cXc} + ${ca} × ${t1s}` },
                              { label: `x = ${cXc} + ${(ca * t1).toFixed(6)}`, value: `${selectedStep.x.toFixed(4)}`, highlight: true },
                            ];
                            yLines = [
                              { label: 'Rumus', value: 'y = yc + b·sin(θ)' },
                              { separator: true, label: 'Substitusi Parameter' },
                              { label: 'yc', value: `${cYc}` },
                              { label: 'b (semi-minor)', value: `${cb}` },
                              { label: 'θ (radian)', value: `${psFmt} rad` },
                              { label: 'θ (derajat) = θ × 180/π', value: `${psFmt} × 57.2958 = ${pDeg}°` },
                              { separator: true, label: 'Hitung sin(θ)' },
                              { label: `sin(${psFmt} rad) = sin(${pDeg}°)`, value: `${t2s}` },
                              { separator: true, label: 'Hitung y' },
                              { label: 'y = yc + b·sin(θ)', value: `${cYc} + ${cb} × ${t2s}` },
                              { label: `y = ${cYc} + ${(cb * t2).toFixed(6)}`, value: `${selectedStep.y.toFixed(4)}`, highlight: true },
                            ];
                          } else if (curveType === 'parabola') {
                            const fa = focusA;
                            xLines = [
                              { label: 'Rumus', value: 'x = xp + a·t²' },
                              { separator: true, label: 'Substitusi Parameter' },
                              { label: 'xp (vertex X)', value: `${cXc}` },
                              { label: 'a (fokus)', value: `${fa}` },
                              { label: 't (parameter)', value: `${ps}` },
                              { separator: true, label: 'Hitung t²' },
                              { label: `t² = ${ps} × ${ps}`, value: `${t2s}` },
                              { separator: true, label: 'Hitung x' },
                              { label: 'x = xp + a·t²', value: `${cXc} + ${fa} × ${t2s}` },
                              { label: `x = ${cXc} + ${(fa * t2).toFixed(6)}`, value: `${selectedStep.x.toFixed(4)}`, highlight: true },
                            ];
                            yLines = [
                              { label: 'Rumus', value: 'y = yp + 2a·t' },
                              { separator: true, label: 'Substitusi Parameter' },
                              { label: 'yp (vertex Y)', value: `${cYc}` },
                              { label: '2a', value: `2 × ${fa} = ${2 * fa}` },
                              { label: 't (parameter)', value: `${ps}` },
                              { separator: true, label: 'Hitung y' },
                              { label: 'y = yp + 2a·t', value: `${cYc} + ${2*fa} × ${ps}` },
                              { label: `y = ${cYc} + ${(2 * fa * p).toFixed(6)}`, value: `${selectedStep.y.toFixed(4)}`, highlight: true },
                            ];
                          } else if (curveType === 'hiperbola') {
                            const cosVal = Math.cos(p);
                            xLines = [
                              { label: 'Rumus', value: 'x = xc + a·sec(θ)' },
                              { separator: true, label: 'Substitusi Parameter' },
                              { label: 'xc', value: `${cXc}` },
                              { label: 'a (transversal)', value: `${hA}` },
                              { label: 'θ (radian)', value: `${psFmt} rad` },
                              { label: 'θ (derajat) = θ × 180/π', value: `${psFmt} × 57.2958 = ${pDeg}°` },
                              { separator: true, label: 'Hitung sec(θ)' },
                              { label: `cos(${psFmt} rad) = cos(${pDeg}°)`, value: `${cosVal.toFixed(6)}` },
                              { label: `sec(θ) = 1 / cos(θ) = 1 / ${cosVal.toFixed(6)}`, value: `${t1s}` },
                              { separator: true, label: 'Hitung x' },
                              { label: 'x = xc + a·sec(θ)', value: `${cXc} + ${hA} × ${t1s}` },
                              { label: `x = ${cXc} + ${(hA * t1).toFixed(6)}`, value: `${selectedStep.x.toFixed(4)}`, highlight: true },
                            ];
                            yLines = [
                              { label: 'Rumus', value: 'y = yc + b·tan(θ)' },
                              { separator: true, label: 'Substitusi Parameter' },
                              { label: 'yc', value: `${cYc}` },
                              { label: 'b (konjugasi)', value: `${hB}` },
                              { label: 'θ (radian)', value: `${psFmt} rad` },
                              { label: 'θ (derajat) = θ × 180/π', value: `${psFmt} × 57.2958 = ${pDeg}°` },
                              { separator: true, label: 'Hitung tan(θ)' },
                              { label: `tan(${psFmt} rad) = tan(${pDeg}°)`, value: `${t2s}` },
                              { separator: true, label: 'Hitung y' },
                              { label: 'y = yc + b·tan(θ)', value: `${cYc} + ${hB} × ${t2s}` },
                              { label: `y = ${cYc} + ${(hB * t2).toFixed(6)}`, value: `${selectedStep.y.toFixed(4)}`, highlight: true },
                            ];
                          }

                          return (
                            <div className={fitScreen ? 'grid grid-cols-2 gap-2' : 'space-y-4'}>
                              {renderLines(xLines, 'Langkah Perhitungan Sumbu X')}
                              {renderLines(yLines, 'Langkah Perhitungan Sumbu Y')}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Box 2: Titik Plot (Symmetry) */}
                <div className={fitScreen ? 'space-y-1' : 'space-y-2'}>
                  <h4 className={`font-bold uppercase tracking-wider text-palette-teal ${
                    fitScreen ? 'text-[9px]' : 'text-xs'
                  }`}>
                    Rincian Titik yang Digambar
                  </h4>
                  <div className={`bg-white rounded-2xl border border-palette-sage/50 font-mono text-sm ${
                    fitScreen ? 'p-2' : 'p-4'
                  }`}>
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
