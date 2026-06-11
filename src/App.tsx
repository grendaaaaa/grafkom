import { useState, useEffect, useRef, useCallback } from 'react';
import { ControlPanel, VisualizationCanvas, CalculationTable, AlgorithmPhases } from './components';
import { 
  generateCircleSteps, generateEllipseSteps, generateParabolaSteps, 
  generateHyperbolaSteps, generateBCircleSteps, generateBEllipseSteps 
} from './algorithms';
import type { Point, CalculationStep, CurveType, VisualizationMode, AlgorithmPhase, AlgorithmType } from './types';
import { Activity, Layers, AlertTriangle, X } from 'lucide-react';

function App() {
  // ── Peringatan (Warning) ────────────────────────────────
  const [warning, setWarning] = useState<string | null>(null);

  // ── Bersama ───────────────────────────────────────────
  const [xc, setXc] = useState<string>('0');
  const [yc, setYc] = useState<string>('0');
  const [deltaTheta, setDeltaTheta] = useState<string>('0.1');

  // ── Lingkaran ─────────────────────────────────────────
  const [r, setR] = useState<string>('10');

  // ── Elips ─────────────────────────────────────────────
  const [a, setA] = useState<string>('12');
  const [b, setB] = useState<string>('7');

  // ── Parabola ──────────────────────────────────────────
  const [focusA, setFocusA] = useState<string>('1');
  const [tMin,   setTMin]   = useState<string>('-5');
  const [tMax,   setTMax]   = useState<string>('5');
  const [deltaT, setDeltaT] = useState<string>('0.2');

  // ── Hiperbola ─────────────────────────────────────────
  const [hA, setHA] = useState<string>('5');
  const [hB, setHB] = useState<string>('4');

  // ── Config ────────────────────────────────────────────
  const [curveType,     setCurveType]     = useState<CurveType>('lingkaran');
  const [algorithmType, setAlgorithmType] = useState<AlgorithmType>('parametrik');
  const [visMode,       setVisMode]       = useState<VisualizationMode>('geometri');
  const [points,        setPoints]        = useState<Point[]>([]);
  const [steps,         setSteps]         = useState<CalculationStep[]>([]);
  const [isRunning,     setIsRunning]     = useState<boolean>(false);
  const [isFinished,    setIsFinished]    = useState<boolean>(false);
  const [currentPhase,  setCurrentPhase]  = useState<AlgorithmPhase>('idle');

  const allStepsRef  = useRef<CalculationStep[]>([]);
  const iterationRef = useRef<number>(0);
  // BUG-02: simpan referensi timer init (800ms) agar bisa di-cancel saat reset
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // BUG-01: wrap dalam useCallback dengan deps stabil.
  // Fungsi ini HANYA membaca dari refs dan state setters — aman tanpa deps.
  // Return value: true jika masih ada step, false jika sudah selesai (BUG-07)
  const calculateNextStep = useCallback((): boolean => {
    if (iterationRef.current >= allStepsRef.current.length) {
      setIsRunning(false); setIsFinished(true); setCurrentPhase('done');
      return false;
    }
    const s = allStepsRef.current[iterationRef.current];
    iterationRef.current += 1;

    const extraPts = s.extraPoints ?? [];
    if (extraPts.length > 0) {
      // Bresenham: push titik utama + semua titik simetri sekaligus
      const allNew = [{ x: s.x, y: s.y }, ...extraPts];
      setPoints(prev => [...prev, ...allNew]);
    } else {
      // Parametrik: push satu titik (boleh NaN — separator hiperbola)
      setPoints(prev => [...prev, { x: s.x, y: s.y }]);
    }
    setSteps(prev => [...prev, s]);
    return true;
  }, []); // stable — hanya gunakan refs dan setters yang tidak berubah

  // BUG-01: sertakan calculateNextStep di deps (kini stabil karena useCallback)
  // Pola effect-chain ini aman: setiap kali points berubah, effect lama di-cleanup
  // (clearTimeout) dan effect baru menjadwalkan satu timeout baru.
  useEffect(() => {
    if (!isRunning) return;
    const id = setTimeout(calculateNextStep, 50);
    return () => clearTimeout(id);
  }, [isRunning, points, calculateNextStep]);

  const prepSteps = useCallback(() => {
    if (allStepsRef.current.length > 0) return;
    const nxc = Number(xc)||0, nyc = Number(yc)||0, nr = Number(r)||0, na = Number(a)||0, nb = Number(b)||0;
    const ndth = Number(deltaTheta)||0.1, nfA = Number(focusA)||0, ntMin = Number(tMin)||0, ntMax = Number(tMax)||0;
    const ndt = Number(deltaT)||0.1, nhA = Number(hA)||0, nhB = Number(hB)||0;

    if (curveType === 'lingkaran') {
      allStepsRef.current = algorithmType === 'bresenham'
        ? generateBCircleSteps(nxc, nyc, nr)
        : generateCircleSteps(nxc, nyc, nr, ndth);
    } else if (curveType === 'elips') {
      allStepsRef.current = algorithmType === 'bresenham'
        ? generateBEllipseSteps(nxc, nyc, na, nb)
        : generateEllipseSteps(nxc, nyc, na, nb, ndth);
    } else if (curveType === 'parabola') {
      allStepsRef.current = generateParabolaSteps(nxc, nyc, nfA, ntMin, ntMax, ndt);
    } else if (curveType === 'hiperbola') {
      allStepsRef.current = generateHyperbolaSteps(nxc, nyc, nhA, nhB, ndth);
    }
  }, [curveType, algorithmType, xc, yc, r, a, b, deltaTheta, focusA, tMin, tMax, deltaT, hA, hB]);

  const validateInputs = useCallback((): string | null => {
    const nr = Number(r), na = Number(a), nb = Number(b), nfA = Number(focusA);
    const nhA = Number(hA), nhB = Number(hB), ndt = Number(deltaT), ndth = Number(deltaTheta);
    const ntMin = Number(tMin), ntMax = Number(tMax);
    
    if (curveType === 'lingkaran' && nr <= 0) return "Jari-jari (r) harus lebih besar dari 0.";
    if (curveType === 'elips' && (na <= 0 || nb <= 0)) return "Sumbu semi-mayor (a) dan semi-minor (b) harus lebih besar dari 0.";
    if (curveType === 'parabola' && nfA === 0) return "Koefisien fokus (a) tidak boleh 0.";
    if (curveType === 'hiperbola' && (nhA === 0 || nhB === 0)) return "Sumbu transversal (a) dan konjugasi (b) tidak boleh 0.";
    if (algorithmType === 'parametrik' && (curveType === 'lingkaran' || curveType === 'elips' || curveType === 'hiperbola') && ndth <= 0) return "Langkah sudut (Δθ) harus lebih besar dari 0.";
    if (curveType === 'parabola' && ndt <= 0) return "Langkah waktu (Δt) harus lebih besar dari 0.";
    if (curveType === 'parabola' && ntMin >= ntMax) return "Batas waktu (tMin) harus lebih kecil dari batas (tMax).";
    return null;
  }, [curveType, algorithmType, r, a, b, focusA, hA, hB, deltaTheta, deltaT, tMin, tMax]);

  const handleStart = useCallback(() => {
    const errorMsg = validateInputs();
    if (errorMsg) {
      setWarning(errorMsg);
      setTimeout(() => setWarning(null), 4000);
      return;
    }

    clearTimeout(startTimerRef.current); // BUG-02: cancel timer init yang masih pending
    if (isFinished) { setPoints([]); setSteps([]); iterationRef.current = 0; allStepsRef.current = []; }
    if (iterationRef.current === 0) {
      setCurrentPhase('init');
      // BUG-02: simpan id timer agar bisa di-cancel oleh handleReset
      startTimerRef.current = setTimeout(() => {
        prepSteps(); setCurrentPhase('running'); setIsRunning(true); setIsFinished(false);
      }, 800);
    } else { setCurrentPhase('running'); setIsRunning(true); }
  }, [isFinished, prepSteps, validateInputs]);

  const handlePause = useCallback(() => { setIsRunning(false); setCurrentPhase('paused'); }, []);

  // BUG-07: calculateNextStep sekarang return boolean.
  // Hanya set 'paused' jika masih ada step — jangan timpa state 'done' yang
  // di-set dari dalam calculateNextStep ketika sudah mencapai akhir.
  const handleStepForward = useCallback(() => {
    if (isFinished) return;
    
    const errorMsg = validateInputs();
    if (errorMsg) {
      setWarning(errorMsg);
      setTimeout(() => setWarning(null), 4000);
      return;
    }

    setIsRunning(false);
    prepSteps();
    const hasMore = calculateNextStep();
    if (hasMore) setCurrentPhase('paused');
    // jika !hasMore → calculateNextStep sudah set 'done', tidak perlu override
  }, [isFinished, prepSteps, calculateNextStep, validateInputs]);

  const handleStepBackward = useCallback(() => {
    setIsRunning(false);
    if (iterationRef.current > 0) {
      iterationRef.current -= 1;
      const removedStep = allStepsRef.current[iterationRef.current];

      // BUG-A5 FIX: Jika langkah yang diundo adalah separator NaN (hiperbola),
      // tidak ada titik yang perlu dihapus dari canvas karena NaN tidak dirender.
      // Hanya hapus titik dari canvas jika langkah tersebut adalah langkah valid.
      const isNaNSeparator = removedStep && isNaN(removedStep.x);
      if (!isNaNSeparator) {
        // Bresenham: tiap step bisa menghasilkan >1 titik (extraPoints)
        const removedCount = 1 + (removedStep?.extraPoints?.length ?? 0);
        setPoints(prev => prev.slice(0, -removedCount));
      }
      // Untuk NaN separator, points tidak diubah — hanya setSteps yang dikurangi
      setSteps(prev => prev.slice(0, -1));
      setIsFinished(false); setCurrentPhase('paused');
    }
  }, []);

  const handleReset = useCallback(() => {
    clearTimeout(startTimerRef.current); // BUG-02: cancel pending init timer
    setIsRunning(false); setIsFinished(false); setCurrentPhase('idle');
    setPoints([]); setSteps([]); iterationRef.current = 0; allStepsRef.current = [];
  }, []);

  const handleCurveChange = useCallback((type: CurveType) => {
    handleReset(); setCurveType(type);
    // Reset ke parametrik jika kurva tidak mendukung Bresenham
    if (type === 'parabola' || type === 'hiperbola') setAlgorithmType('parametrik');
  }, [handleReset]);

  const handleAlgorithmTypeChange = useCallback((type: AlgorithmType) => {
    handleReset(); setAlgorithmType(type);
  }, [handleReset]);

  return (
    <div className="min-h-screen text-[#1d4d52] p-4 md:p-8 font-sans relative">
      {/* ── TOAST WARNING ──────────────────────────────────────── */}
      {warning && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(239,68,68,0.4)] animate-in fade-in slide-in-from-top-10 duration-300">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-red-800">Kalkulasi Gagal</h4>
            <p className="text-sm font-medium mt-0.5">{warning}</p>
          </div>
          <button onClick={() => setWarning(null)} className="ml-4 p-1.5 hover:bg-red-100 rounded-full transition-colors text-red-500">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="max-w-[1500px] mx-auto space-y-8">

        {/* HERO */}
        <header className="relative overflow-hidden rounded-[2rem] bg-palette-teal shadow-[0_20px_60px_-10px_rgba(53,133,142,0.6)] transition-all hover:-translate-y-1">
          <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-white opacity-5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-palette-olive opacity-20 rounded-full blur-2xl" />
          <div className="relative z-10 px-8 py-16 md:px-12 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-palette-cream text-sm font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
              <Activity size={18} className="text-palette-olive" />
              <span>Project Akhir Grafkom K</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-xl">
              Eksplorasi Geometri &{' '}
              <span className="text-palette-olive relative inline-block">
                Rasterisasi
                <div className="absolute -bottom-2 left-0 w-full h-2 bg-palette-olive/40 rounded-full" />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-palette-cream/90 max-w-3xl font-medium mb-10 leading-relaxed">
              Platform pembelajaran grafika komputer interaktif untuk membedah algoritma pembangkitan kurva secara matematis dan visual.
            </p>
            <div className="flex flex-wrap justify-center gap-5">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 rounded-full bg-palette-olive/90 flex items-center justify-center text-palette-teal font-black shadow-inner"><Layers size={24} /></div>
                <div className="text-left">
                  <div className="text-xs text-palette-cream/80 font-bold uppercase tracking-wider mb-0.5">Dukungan Modul</div>
                  <div className="text-white font-bold text-lg">Multi-Kurva</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 rounded-full bg-palette-cream/20 flex items-center justify-center text-palette-cream shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
                <div className="text-left">
                  <div className="text-xs text-palette-cream/80 font-bold uppercase tracking-wider mb-0.5">Analisis Lengkap</div>
                  <div className="text-white font-bold text-lg">Step-by-Step</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-4 flex flex-col gap-8">
            <div className="glass-panel rounded-[2rem] overflow-hidden h-full border border-white/60 shadow-[0_15px_40px_-15px_rgba(125,167,140,0.6)] hover:shadow-[0_20px_50px_-15px_rgba(125,167,140,0.8)] hover:-translate-y-1 transition-all">
              <ControlPanel
                xc={xc} setXc={setXc} yc={yc} setYc={setYc}
                r={r} setR={setR}
                a={a} setA={setA} b={b} setB={setB}
                focusA={focusA} setFocusA={setFocusA}
                tMin={tMin} setTMin={setTMin} tMax={tMax} setTMax={setTMax}
                deltaT={deltaT} setDeltaT={setDeltaT}
                hA={hA} setHA={setHA} hB={hB} setHB={setHB}
                deltaTheta={deltaTheta} setDeltaTheta={setDeltaTheta}
                curveType={curveType} setCurveType={handleCurveChange}
                algorithmType={algorithmType} setAlgorithmType={handleAlgorithmTypeChange}
                visMode={visMode} setVisMode={setVisMode}
                onStart={handleStart} onPause={handlePause} onReset={handleReset}
                onStepForward={handleStepForward} onStepBackward={handleStepBackward}
                isRunning={isRunning} isFinished={isFinished}
              />
            </div>
            <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/60 shadow-[0_15px_40px_-15px_rgba(125,167,140,0.6)] hover:shadow-[0_20px_50px_-15px_rgba(125,167,140,0.8)] hover:-translate-y-1 transition-all">
              <AlgorithmPhases currentPhase={currentPhase} curveType={curveType} algorithmType={algorithmType} />
            </div>
          </div>
          <div className="xl:col-span-8 flex flex-col gap-8">
            <div className="flex-1 glass-panel rounded-[2rem] p-4 border border-white/60 shadow-[0_15px_40px_-15px_rgba(125,167,140,0.6)] hover:shadow-[0_20px_50px_-15px_rgba(125,167,140,0.8)] hover:-translate-y-1 transition-all">
              <VisualizationCanvas
                points={points} steps={steps} xc={Number(xc)||0} yc={Number(yc)||0}
                r={Number(r)||0} a={Number(a)||0} b={Number(b)||0} focusA={Number(focusA)||0} hA={Number(hA)||0} hB={Number(hB)||0}
                mode={visMode} curveType={curveType} algorithmType={algorithmType}
              />
            </div>
            <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/60 shadow-[0_15px_40px_-15px_rgba(125,167,140,0.6)] hover:shadow-[0_20px_50px_-15px_rgba(125,167,140,0.8)] hover:-translate-y-1 transition-all">
              <CalculationTable
                steps={steps} xc={Number(xc)||0} yc={Number(yc)||0}
                r={Number(r)||0} a={Number(a)||0} b={Number(b)||0} focusA={Number(focusA)||0} hA={Number(hA)||0} hB={Number(hB)||0}
                curveType={curveType} algorithmType={algorithmType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
