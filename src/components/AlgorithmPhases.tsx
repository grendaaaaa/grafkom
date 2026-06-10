import React from 'react';
import type { AlgorithmPhase, CurveType } from '../types';
import { Play, RotateCcw, Calculator, MonitorPlay } from 'lucide-react';

interface Props { currentPhase: AlgorithmPhase; curveType: CurveType; }

const formulaMap: Record<string, React.ReactNode> = {
  lingkaran: <><span>x = x<sub>c</sub> + r · cos(θ)</span><br/><span>y = y<sub>c</sub> + r · sin(θ)</span></>,
  elips:     <><span>x = x<sub>c</sub> + a · cos(θ)</span><br/><span>y = y<sub>c</sub> + b · sin(θ)</span></>,
  parabola:  <><span>x = x<sub>p</sub> + a · t²</span><br/><span>y = y<sub>p</sub> + 2 · a · t</span></>,
  hiperbola: <><span>x = x<sub>c</sub> + a · sec(θ)</span><br/><span>y = y<sub>c</sub> + b · tan(θ)</span></>,
};

const initMap: Record<string, string> = {
  lingkaran: 'Tentukan nilai pusat (xc, yc), jari-jari r, dan rentang parameter sudut θ ∈ [0, 2π].',
  elips:     'Tentukan nilai pusat (xc, yc), sumbu semi-mayor a, sumbu semi-minor b, dan rentang sudut θ ∈ [0, 2π].',
  parabola:  'Tentukan titik puncak (xp, yp), koefisien fokus a, dan rentang parameter linier t dari tMin hingga tMax.',
  hiperbola: 'Tentukan pusat (xc, yc), sumbu transversal a, sumbu konjugasi b, dan rentang parameter sudut θ.',
};

export const AlgorithmPhases: React.FC<Props> = ({ currentPhase, curveType }) => {
  const isRunning   = currentPhase === 'running';
  const isRendering = currentPhase === 'running' || currentPhase === 'done';

  const card = (active: boolean) =>
    active
      ? 'border-palette-teal bg-palette-olive/40 text-[#1d4d52] shadow-[0_4px_20px_rgba(53,133,142,0.2)] border-l-4 scale-[1.02] transition-all duration-300'
      : 'border-transparent bg-white/50 text-gray-500 border-l-4 hover:bg-white/80 transition-all duration-300';

  return (
    <div className="p-6 flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-xl font-black pb-3 border-b-2 border-palette-sage/60 text-palette-teal tracking-tight shrink-0">
        Algoritma Implementasi Program
      </h2>

      {/* 1. Inisialisasi */}
      <div className={`p-4 rounded-r-2xl flex items-start gap-4 shrink-0 ${card(currentPhase === 'init')}`}>
        <RotateCcw size={22} className={`mt-1 shrink-0 ${currentPhase === 'init' ? 'text-palette-teal' : 'text-gray-400'}`} />
        <div>
          <h3 className={`font-black text-lg ${currentPhase === 'init' ? 'text-palette-teal' : 'text-gray-700'}`}>1. Inisialisasi</h3>
          <p className="text-sm mt-1.5 leading-relaxed font-medium text-gray-600">{initMap[curveType]}</p>
        </div>
      </div>

      {/* 2. Iterasi */}
      <div className={`p-4 rounded-r-2xl flex items-start gap-4 shrink-0 ${card(isRunning)}`}>
        <Play size={22} className={`mt-1 shrink-0 ${isRunning ? 'text-palette-teal' : 'text-gray-400'}`} />
        <div>
          <h3 className={`font-black text-lg ${isRunning ? 'text-palette-teal' : 'text-gray-700'}`}>2. Iterasi</h3>
          <p className="text-sm mt-1.5 leading-relaxed font-medium text-gray-600">
            {curveType === 'parabola'
              ? 'Loop dari t = tMin hingga tMax dengan langkah kecil Δt per iterasi.'
              : 'Loop nilai sudut θ dengan langkah kecil Δθ per iterasi.'}
          </p>
        </div>
      </div>

      {/* 3. Kalkulasi */}
      <div className={`p-4 rounded-r-2xl flex items-start gap-4 shrink-0 ${card(isRunning)}`}>
        <Calculator size={22} className={`mt-1 shrink-0 ${isRunning ? 'text-palette-teal' : 'text-gray-400'}`} />
        <div>
          <h3 className={`font-black text-lg ${isRunning ? 'text-palette-teal' : 'text-gray-700'}`}>3. Kalkulasi</h3>
          <p className="text-sm mt-1.5 leading-relaxed font-medium text-gray-600">Hitung nilai x dan y menggunakan rumus parametrik di setiap iterasi.</p>
          <div className={`font-mono border p-2.5 rounded-xl mt-3 text-sm font-bold shadow-inner transition-all duration-300 
            ${isRunning ? 'bg-white/80 border-palette-teal/40 text-[#1d4d52]' : 'bg-gray-50/50 border-gray-200/50 text-gray-400'}`}>
            {formulaMap[curveType]}
          </div>
        </div>
      </div>

      {/* 4. Rendering */}
      <div className={`p-4 rounded-r-2xl flex items-start gap-4 shrink-0 transition-all duration-300
        ${isRendering
          ? 'border-l-4 border-palette-teal bg-palette-teal text-white shadow-lg shadow-palette-teal/20 scale-[1.02]'
          : 'border-l-4 border-transparent bg-white/50 text-gray-500'}`}>
        <MonitorPlay size={22} className={`mt-1 shrink-0 ${isRendering ? 'text-palette-cream' : 'text-gray-400'}`} />
        <div>
          <h3 className={`font-black text-lg ${isRendering ? 'text-white' : 'text-gray-700'}`}>4. Rendering</h3>
          <p className={`text-sm mt-1.5 leading-relaxed font-medium ${isRendering ? 'text-palette-cream' : 'text-gray-600'}`}>
            Gambar titik atau garis penghubung dari koordinat (x, y) yang dihasilkan ke layar.
          </p>
        </div>
      </div>
    </div>
  );
};
