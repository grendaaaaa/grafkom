import React, { useRef, useEffect } from 'react';
import type { CalculationStep, CurveType } from '../types';

interface Props {
  steps: CalculationStep[];
  xc: number; yc: number;
  r: number; a: number; b: number; focusA: number; hA: number; hB: number;
  curveType: CurveType;
}

export const CalculationTable: React.FC<Props> = ({ steps, xc, yc, r, a, b, focusA, hA, hB, curveType }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [steps]);

  // Header kolom bervariasi per kurva
  const headers = () => {
    if (curveType === 'lingkaran') return {
      param: 'θ (rad)', t1: 'cos(θ)', t2: 'sin(θ)',
      xH: `x = ${xc} + ${r}·cos(θ)`, yH: `y = ${yc} + ${r}·sin(θ)`,
    };
    if (curveType === 'elips') return {
      param: 'θ (rad)', t1: 'cos(θ)', t2: 'sin(θ)',
      xH: `x = ${xc} + ${a}·cos(θ)`, yH: `y = ${yc} + ${b}·sin(θ)`,
    };
    if (curveType === 'parabola') return {
      param: 't', t1: 't', t2: 't²',
      xH: `x = ${xc} + ${focusA}·t²`, yH: `y = ${yc} + ${2 * focusA}·t`,
    };
    if (curveType === 'hiperbola') return {
      param: 'θ (rad)', t1: 'sec(θ)', t2: 'tan(θ)',
      xH: `x = ${xc} + ${hA}·sec(θ)`, yH: `y = ${yc} + ${hB}·tan(θ)`,
    };
    return { param: 'param', t1: 'term1', t2: 'term2', xH: 'x', yH: 'y' };
  };
  const h = headers();

  const paramLabel = () => {
    if (curveType === 'lingkaran' || curveType === 'elips') return 'Pusat: xc=' + xc + ', yc=' + yc;
    if (curveType === 'parabola') return `Vertex: xp=${xc}, yp=${yc} | a=${focusA}`;
    if (curveType === 'hiperbola') return `Pusat: xc=${xc}, yc=${yc} | Transv. a=${hA} | Konjugasi b=${hB}`;
    return '';
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="p-5 border-b-2 border-palette-teal/20 bg-palette-teal/5">
        <h2 className="text-xl font-black text-palette-teal tracking-tight">Log Perhitungan Detail (Step-by-Step)</h2>
        <p className="text-sm text-palette-teal/70 font-mono mt-1 font-bold">{paramLabel()}</p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-white/40" ref={scrollRef}>
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-palette-teal sticky top-0 shadow-md text-white z-10">
            <tr>
              <th className="py-4 px-4 font-bold text-center border-r border-[#1d4d52]/50">It</th>
              <th className="py-4 px-4 font-bold border-r border-[#1d4d52]/50">{h.param}</th>
              <th className="py-4 px-4 font-bold border-r border-[#1d4d52]/50">{h.t1}</th>
              <th className="py-4 px-4 font-bold border-r border-[#1d4d52]/50">{h.t2}</th>
              <th className="py-4 px-4 font-bold border-r border-[#1d4d52]/50 text-palette-cream">{h.xH}</th>
              <th className="py-4 px-4 font-bold text-palette-cream">{h.yH}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-palette-teal/10">
            {steps.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-palette-teal/50 font-bold italic text-base">
                Belum ada kalkulasi. Tekan "PLAY" atau maju per langkah.
              </td></tr>
            ) : (
              steps.map((step, idx) => {
                if (isNaN(step.x)) {
                  return (
                    <tr key={`sep-${idx}`} className="bg-palette-teal/10">
                      <td colSpan={6} className="py-2 px-4 text-center text-palette-teal/70 font-bold italic text-xs tracking-widest">
                        --- PERPINDAHAN CABANG KURVA ---
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={step.iteration} className="hover:bg-palette-olive/20 transition-colors font-mono">
                    <td className="py-3 px-4 text-[#1d4d52] text-center border-r border-palette-teal/10 font-bold">{step.iteration}</td>
                    <td className="py-3 px-4 text-palette-teal border-r border-palette-teal/10 font-bold bg-palette-teal/5">
                      {step.param.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 border-r border-palette-teal/10 font-medium">{step.term1.toFixed(4)}</td>
                    <td className="py-3 px-4 text-gray-600 border-r border-palette-teal/10 font-medium">{step.term2.toFixed(4)}</td>
                    <td className="py-3 px-4 border-r border-palette-teal/10">
                      <span className="text-gray-500 font-semibold">{xc} + {step.xComponent.toFixed(2)} = </span>
                      <span className="text-[#1d4d52] font-extrabold bg-palette-olive/40 px-2 py-0.5 rounded">{step.x.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-500 font-semibold">{yc} + {step.yComponent.toFixed(2)} = </span>
                      <span className="text-palette-teal font-extrabold bg-palette-cream border border-palette-sage/50 px-2 py-0.5 rounded">{step.y.toFixed(2)}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
