import React from 'react';
import { Play, RotateCcw, Pause, StepForward, StepBack, Cpu, FunctionSquare } from 'lucide-react';
import type { CurveType, VisualizationMode, AlgorithmType } from '../types';

interface ControlPanelProps {
  xc: string; setXc: (v: string) => void;
  yc: string; setYc: (v: string) => void;
  r: string;  setR:  (v: string) => void;
  a: string;  setA:  (v: string) => void;
  b: string;  setB:  (v: string) => void;
  focusA: string; setFocusA: (v: string) => void;
  tMin: string;   setTMin:   (v: string) => void;
  tMax: string;   setTMax:   (v: string) => void;
  deltaT: string; setDeltaT: (v: string) => void;
  hA: string; setHA: (v: string) => void;
  hB: string; setHB: (v: string) => void;
  deltaTheta: string; setDeltaTheta: (v: string) => void;
  algorithmType: AlgorithmType; setAlgorithmType: (v: AlgorithmType) => void;
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
  algorithmType, setAlgorithmType,
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

      {/* Toggle Algoritma — hanya untuk lingkaran & elips */}
      {(curveType === 'lingkaran' || curveType === 'elips') && (
        <div className="bg-white/40 p-4 rounded-2xl border border-palette-sage/50 shadow-inner">
          <label className="block text-xs font-black mb-3 text-[#1d4d52] uppercase tracking-widest">Algoritma</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={isRunning}
              onClick={() => setAlgorithmType('parametrik')}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 font-bold text-sm transition-all duration-300
                ${algorithmType === 'parametrik'
                  ? 'bg-palette-teal border-palette-teal text-white shadow-lg shadow-palette-teal/30 scale-[1.03]'
                  : 'bg-white/50 border-palette-sage text-[#1d4d52] hover:bg-white hover:shadow'}`}
            >
              <FunctionSquare size={15} /> Parametrik
            </button>
            <button
              disabled={isRunning}
              onClick={() => setAlgorithmType('bresenham')}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 font-bold text-sm transition-all duration-300
                ${algorithmType === 'bresenham'
                  ? 'bg-[#1d4d52] border-[#1d4d52] text-palette-olive shadow-lg shadow-[#1d4d52]/30 scale-[1.03]'
                  : 'bg-white/50 border-palette-sage text-[#1d4d52] hover:bg-white hover:shadow'}`}
            >
              <Cpu size={15} /> Bresenham
            </button>
          </div>
          {algorithmType === 'bresenham' && (
            <p className="mt-2 text-xs font-semibold text-[#1d4d52]/70 bg-[#1d4d52]/5 px-3 py-2 rounded-lg border border-[#1d4d52]/10">
              ⚡ Integer arithmetic — tidak ada sin/cos, {curveType === 'lingkaran' ? '8' : '4'}-fold symmetry per step
            </p>
          )}
        </div>
      )}

      {/* Parameter Pusat / Vertex */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>{curveType === 'parabola' ? 'Vertex X (xp)' : 'Pusat X (xc)'}</label>
          <input type="number" value={xc} onChange={e => setXc(e.target.value)} disabled={isRunning} className={inp} />
        </div>
        <div>
          <label className={lbl}>{curveType === 'parabola' ? 'Vertex Y (yp)' : 'Pusat Y (yc)'}</label>
          <input type="number" value={yc} onChange={e => setYc(e.target.value)} disabled={isRunning} className={inp} />
        </div>
      </div>

      {/* Parameter spesifik per kurva */}
      {curveType === 'lingkaran' && (
        <>
          <div><label className={lbl}>Jari-jari (r)</label>
            <input type="number" value={r} min="0.1"
              onChange={e => setR(e.target.value)} disabled={isRunning} className={inp} /></div>
          {/* Δθ tidak digunakan oleh Bresenham — sembunyikan saat mode itu aktif */}
          {algorithmType === 'parametrik' && (
            <div><label className={lbl}>Delta Sudut (Δθ)</label>
              <input type="number" step="0.05" value={deltaTheta} min="0.001"
                onChange={e => setDeltaTheta(e.target.value)} disabled={isRunning} className={inp} /></div>
          )}
        </>
      )}

      {curveType === 'elips' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Semi-Mayor (a) horiz</label>
              <input type="number" value={a} min="0.1"
                onChange={e => setA(e.target.value)} disabled={isRunning} className={inp} /></div>
            <div><label className={lbl}>Semi-Minor (b) vert</label>
              <input type="number" value={b} min="0.1"
                onChange={e => setB(e.target.value)} disabled={isRunning} className={inp} /></div>
          </div>
          {Number(a) === Number(b) && <div className="text-xs font-bold text-palette-teal bg-palette-olive/30 px-3 py-2 rounded-lg">✓ a = b → Lingkaran sempurna</div>}
          {/* Δθ tidak digunakan oleh Bresenham */}
          {algorithmType === 'parametrik' && (
            <div><label className={lbl}>Delta Sudut (Δθ)</label>
              <input type="number" step="0.05" value={deltaTheta} min="0.001"
                onChange={e => setDeltaTheta(e.target.value)} disabled={isRunning} className={inp} /></div>
          )}
        </>
      )}

      {curveType === 'parabola' && (
        <>
          <div><label className={lbl}>Fokus / Koefisien (a)</label>
            <input type="number" step="0.5" value={focusA}
              onChange={e => setFocusA(e.target.value)} disabled={isRunning} className={inp} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className={lbl}>t Min</label>
              <input type="number" value={tMin}
                onChange={e => setTMin(e.target.value)} disabled={isRunning} className={inp} /></div>
            <div><label className={lbl}>t Max</label>
              <input type="number" value={tMax}
                onChange={e => setTMax(e.target.value)} disabled={isRunning} className={inp} /></div>
            <div><label className={lbl}>Δt (step)</label>
              {/* BUG-05: min=0.01 mencegah infinite loop dan tMin>=tMax */}
              <input type="number" step="0.1" value={deltaT} min="0.01"
                onChange={e => setDeltaT(e.target.value)} disabled={isRunning} className={inp} /></div>
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
              <input type="number" value={hA} min="0.1"
                onChange={e => setHA(e.target.value)} disabled={isRunning} className={inp} /></div>
            <div><label className={lbl}>Konjugasi (b)</label>
              <input type="number" value={hB} min="0.1"
                onChange={e => setHB(e.target.value)} disabled={isRunning} className={inp} /></div>
          </div>
          <div><label className={lbl}>Delta Sudut (Δθ)</label>
            {/* BUG-04: min=0.001 mencegah infinite loop di generator */}
            <input type="number" step="0.05" value={deltaTheta} min="0.001"
              onChange={e => setDeltaTheta(e.target.value)} disabled={isRunning} className={inp} /></div>
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
