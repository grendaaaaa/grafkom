import React from 'react';
import { Play, RotateCcw, Pause, StepForward, StepBack } from 'lucide-react';
import type { CurveType, VisualizationMode } from '../types';

interface ControlPanelProps {
  xc: number; setXc: (v: number) => void;
  yc: number; setYc: (v: number) => void;
  r: number;  setR:  (v: number) => void;
  a: number;  setA:  (v: number) => void;
  b: number;  setB:  (v: number) => void;
  focusA: number; setFocusA: (v: number) => void;
  tMin: number;   setTMin:   (v: number) => void;
  tMax: number;   setTMax:   (v: number) => void;
  deltaT: number; setDeltaT: (v: number) => void;
  hA: number; setHA: (v: number) => void;
  hB: number; setHB: (v: number) => void;
  deltaTheta: number; setDeltaTheta: (v: number) => void;
  curveType: CurveType; setCurveType: (v: CurveType) => void;
  visMode: VisualizationMode; setVisMode: (v: VisualizationMode) => void;
  onStart: () => void; onPause: () => void; onReset: () => void;
  onStepForward: () => void; onStepBackward: () => void;
  isRunning: boolean; isFinished: boolean;
}

const CURVES: { key: CurveType; label: string; active: boolean }[] = [
  { key: 'lingkaran', label: 'Lingkaran',  active: true  },
  { key: 'elips',     label: 'Elips',      active: true  },
  { key: 'parabola',  label: 'Parabola',   active: true  },
  { key: 'hiperbola', label: 'Hiperbola',  active: true  },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  xc, setXc, yc, setYc, r, setR, a, setA, b, setB,
  focusA, setFocusA, tMin, setTMin, tMax, setTMax, deltaT, setDeltaT,
  hA, setHA, hB, setHB,
  deltaTheta, setDeltaTheta,
  curveType, setCurveType, visMode, setVisMode,
  onStart, onPause, onReset, onStepForward, onStepBackward,
  isRunning, isFinished,
}) => {
  const inp = "w-full bg-white/70 border-2 border-palette-sage/60 rounded-xl p-2.5 text-[#1d4d52] focus:bg-white focus:outline-none focus:border-palette-teal focus:ring-2 focus:ring-palette-teal/20 font-bold text-lg transition-all";
  const lbl = "block text-xs font-black mb-1.5 text-gray-600 uppercase tracking-wider";

  return (
    <div className="p-6 h-full flex flex-col gap-5">
      <h2 className="text-2xl font-black pb-3 border-b-2 border-palette-sage/60 text-palette-teal tracking-tight">
        Parameter Konfigurasi
      </h2>

      {/* Pilihan Kurva */}
      <div>
        <label className="block text-xs font-black mb-2 text-[#1d4d52] uppercase tracking-widest">Jenis Kurva</label>
        <div className="grid grid-cols-2 gap-2.5">
          {CURVES.map(c => (
            <button key={c.key} disabled={isRunning || !c.active} onClick={() => setCurveType(c.key)}
              className={`p-2.5 rounded-xl border-2 font-bold transition-all duration-300 text-sm
                ${curveType === c.key && c.active
                  ? 'bg-palette-teal border-palette-teal text-white shadow-lg shadow-palette-teal/30 scale-[1.03]'
                  : c.active
                    ? 'bg-white/50 border-palette-sage text-[#1d4d52] hover:bg-white hover:shadow'
                    : 'bg-gray-100/50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'}`}>
              {c.label}{!c.active && <span className="ml-1 text-xs opacity-70">(TBD)</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Visualisasi */}
      <div className="bg-white/40 p-4 rounded-2xl border border-palette-sage/50 shadow-inner">
        <label className="block text-xs font-black mb-3 text-[#1d4d52] uppercase tracking-widest">Mode Visualisasi</label>
        {[
          { val: 'geometri', label: 'Geometri Dasar (Garis & Titik)' },
          { val: 'presisi',  label: 'Rendering Presisi (Simulasi Raster)' },
          { val: 'analisis', label: 'Analisis Visual (Proyeksi / Garis Bantu)' },
        ].map(m => (
          <label key={m.val} className="flex items-center gap-3 cursor-pointer group mb-2.5">
            <input type="radio" checked={visMode === m.val} onChange={() => setVisMode(m.val as VisualizationMode)}
              className="w-5 h-5 text-palette-teal border-gray-300 focus:ring-palette-teal" />
            <span className="font-semibold text-gray-700 group-hover:text-palette-teal transition-colors text-sm">{m.label}</span>
          </label>
        ))}
      </div>

      {/* Parameter Pusat / Vertex */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>{curveType === 'parabola' ? 'Vertex X (xp)' : 'Pusat X (xc)'}</label>
          <input type="number" value={xc} onChange={e => setXc(Number(e.target.value))} disabled={isRunning} className={inp} />
        </div>
        <div>
          <label className={lbl}>{curveType === 'parabola' ? 'Vertex Y (yp)' : 'Pusat Y (yc)'}</label>
          <input type="number" value={yc} onChange={e => setYc(Number(e.target.value))} disabled={isRunning} className={inp} />
        </div>
      </div>

      {/* Parameter spesifik per kurva */}
      {curveType === 'lingkaran' && (
        <>
          <div><label className={lbl}>Jari-jari (r)</label>
            <input type="number" value={r} onChange={e => setR(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
          <div><label className={lbl}>Delta Sudut (Δθ)</label>
            <input type="number" step="0.05" value={deltaTheta} onChange={e => setDeltaTheta(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
        </>
      )}

      {curveType === 'elips' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Semi-Mayor (a) horiz</label>
              <input type="number" value={a} onChange={e => setA(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
            <div><label className={lbl}>Semi-Minor (b) vert</label>
              <input type="number" value={b} onChange={e => setB(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
          </div>
          {a === b && <div className="text-xs font-bold text-palette-teal bg-palette-olive/30 px-3 py-2 rounded-lg">✓ a = b → Lingkaran sempurna</div>}
          <div><label className={lbl}>Delta Sudut (Δθ)</label>
            <input type="number" step="0.05" value={deltaTheta} onChange={e => setDeltaTheta(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
        </>
      )}

      {curveType === 'parabola' && (
        <>
          <div><label className={lbl}>Fokus / Koefisien (a)</label>
            <input type="number" step="0.5" value={focusA} onChange={e => setFocusA(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className={lbl}>t Min</label>
              <input type="number" value={tMin} onChange={e => setTMin(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
            <div><label className={lbl}>t Max</label>
              <input type="number" value={tMax} onChange={e => setTMax(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
            <div><label className={lbl}>Δt (step)</label>
              <input type="number" step="0.1" value={deltaT} onChange={e => setDeltaT(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
          </div>
          <div className="text-xs font-semibold text-palette-sage bg-palette-cream/50 px-3 py-2 rounded-lg border border-palette-sage/30">
            x = xp + a·t² &nbsp;|&nbsp; y = yp + 2·a·t
          </div>
        </>
      )}

      {curveType === 'hiperbola' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Transversal (a)</label>
              <input type="number" value={hA} onChange={e => setHA(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
            <div><label className={lbl}>Konjugasi (b)</label>
              <input type="number" value={hB} onChange={e => setHB(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
          </div>
          <div><label className={lbl}>Delta Sudut (Δθ)</label>
            <input type="number" step="0.05" value={deltaTheta} onChange={e => setDeltaTheta(Number(e.target.value))} disabled={isRunning} className={inp} /></div>
          <div className="text-xs font-semibold text-palette-sage bg-palette-cream/50 px-3 py-2 rounded-lg border border-palette-sage/30">
            x = xc + a·sec(θ) &nbsp;|&nbsp; y = yc + b·tan(θ)
          </div>
        </>
      )}

      {/* Playback */}
      <div className="pt-2 mt-auto border-t-2 border-palette-sage/40 flex flex-col gap-3">
        <div className="flex gap-2">
          {!isRunning ? (
            <button onClick={onStart} disabled={isFinished}
              className="flex-1 bg-palette-teal hover:bg-[#1d4d52] text-white font-black text-lg py-3 px-4 rounded-2xl shadow-lg shadow-palette-teal/20 flex items-center justify-center transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
              <Play size={20} className="mr-2" /> PLAY
            </button>
          ) : (
            <button onClick={onPause}
              className="flex-1 bg-palette-olive border-2 border-palette-teal hover:bg-palette-sage text-[#1d4d52] font-black text-lg py-3 px-4 rounded-2xl shadow-lg flex items-center justify-center transition-all">
              <Pause size={20} className="mr-2" /> PAUSE
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onStepBackward} title="Mundur 1 Langkah"
              className="bg-white hover:bg-palette-cream text-palette-teal border-2 border-palette-teal p-3 rounded-xl shadow-sm transition-all hover:scale-[1.05]">
              <StepBack size={20} />
            </button>
            <button onClick={onStepForward} disabled={isFinished && !isRunning} title="Maju 1 Langkah"
              className="bg-white hover:bg-palette-cream text-palette-teal border-2 border-palette-teal p-3 rounded-xl shadow-sm transition-all hover:scale-[1.05] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              <StepForward size={20} />
            </button>
          </div>
        </div>
        <button onClick={onReset}
          className="w-full bg-transparent hover:bg-red-50 text-red-500 font-bold py-3 px-4 rounded-2xl flex items-center justify-center transition-all border-2 border-transparent hover:border-red-200">
          <RotateCcw size={18} className="mr-2" /> Reset Animasi
        </button>
      </div>
    </div>
  );
};
