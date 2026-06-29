import React from 'react';
import { createPortal } from 'react-dom';
import { Play, RotateCcw, Pause, StepForward, StepBack, X, HelpCircle } from 'lucide-react';
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
  curveType: CurveType; setCurveType: (v: CurveType) => void;
  visMode: VisualizationMode; setVisMode: (v: VisualizationMode) => void;
  onStart: () => void; onPause: () => void; onReset: () => void;
  onStepForward: () => void; onStepBackward: () => void;
  isRunning: boolean; isFinished: boolean;
  algorithmType: AlgorithmType; setAlgorithmType: (v: AlgorithmType) => void;
}

// ── Definisi penjelasan setiap parameter ───────────────────────────────────────
interface ParamInfo {
  title: string;
  symbol: string;
  emoji: string;
  short: string;
  detail: string;
  effect: string;
  formula?: string;
  tip?: string;
}

const PARAM_INFO: Record<string, ParamInfo> = {
  // ── Umum ──
  xc_lingkaran: {
    title: 'Pusat X — Lingkaran',
    symbol: 'xc',
    emoji: '📍',
    short: 'Titik pusat lingkaran pada sumbu horizontal.',
    detail:
      'Parameter xc menentukan posisi pusat lingkaran di arah kiri-kanan (sumbu X). ' +
      'Nilai 0 berarti pusat tepat di tengah grid. Nilai positif menggeser lingkaran ke kanan, nilai negatif ke kiri.',
    effect: 'Semakin besar xc maka akan menggeser lingkaran ke kanan, semakin kecil maka menggeser lingkaran ke kiri.',
    formula: 'x = xc + r·cos(θ)',
    tip: 'Ubah xc untuk menempatkan lingkaran di posisi yang kamu inginkan tanpa mengubah ukurannya.',
  },
  yc_lingkaran: {
    title: 'Pusat Y — Lingkaran',
    symbol: 'yc',
    emoji: '📍',
    short: 'Titik pusat lingkaran pada sumbu vertikal.',
    detail:
      'Parameter yc menentukan posisi pusat lingkaran di arah atas-bawah (sumbu Y). ' +
      'Nilai 0 berarti pusat tepat di tengah grid. Nilai positif menggeser lingkaran ke atas, nilai negatif ke bawah.',
    effect: 'Semakin besar yc maka akan menggeser lingkaran ke atas, semakin kecil maka menggeser lingkaran ke bawah.',
    formula: 'y = yc + r·sin(θ)',
    tip: 'Kombinasikan xc dan yc untuk menempatkan pusat lingkaran di koordinat mana pun.',
  },
  r_lingkaran: {
    title: 'Jari-jari — Lingkaran',
    symbol: 'r',
    emoji: '⭕',
    short: 'Jarak dari pusat ke tepi lingkaran.',
    detail:
      'Jari-jari (r) adalah jarak setiap titik pada lingkaran ke titik pusatnya. ' +
      'Ini adalah satu-satunya parameter yang mengontrol seberapa besar atau kecil lingkaran yang digambar.',
    effect: 'Semakin besar r maka akan membuat lingkaran semakin besar, semakin kecil maka membuat lingkaran semakin kecil.',
    formula: 'x = xc + r·cos(θ)   |   y = yc + r·sin(θ)',
    tip: 'Untuk Bresenham, r harus berupa bilangan bulat agar hasil paling akurat.',
  },
  deltaTheta_lingkaran: {
    title: 'Delta Sudut (Δθ) — Lingkaran',
    symbol: 'Δθ',
    emoji: '🔄',
    short: 'Besar lompatan sudut di setiap langkah kalkulasi.',
    detail:
      'Δθ menentukan seberapa halus kurva lingkaran digambar. Di setiap langkah, sudut θ bertambah sebesar Δθ radian. ' +
      'Kurva dibangkitkan dari θ = 0 hingga 2π.',
    effect: 'Semakin besar Δθ maka akan membuat jumlah langkah pengerjaan sedikit dan kurva tampak bersudut kasar, semakin kecil maka membuat kurva lebih halus dengan titik yang rapat.',
    formula: 'θ[i+1] = θ[i] + Δθ',
    tip: 'Nilai optimal biasanya 0.05–0.2. Terlalu kecil memperlambat animasi, terlalu besar membuat kurva tidak halus.',
  },

  // ── Elips ──
  xc_elips: {
    title: 'Pusat X — Elips',
    symbol: 'xc',
    emoji: '📍',
    short: 'Posisi pusat elips di sumbu horizontal.',
    detail:
      'xc adalah koordinat X dari titik tengah elips. Semua titik elips dihitung relatif terhadap titik pusat ini.',
    effect: 'Semakin besar xc maka akan menggeser elips ke kanan, semakin kecil maka menggeser elips ke kiri.',
    formula: 'x = xc + a·cos(θ)',
    tip: 'Pusat elips sama persis konsepnya dengan pusat lingkaran, hanya bentuknya yang berbeda.',
  },
  yc_elips: {
    title: 'Pusat Y — Elips',
    symbol: 'yc',
    emoji: '📍',
    short: 'Posisi pusat elips di sumbu vertikal.',
    detail:
      'yc adalah koordinat Y dari titik tengah elips. Semua titik elips dihitung relatif terhadap titik pusat ini.',
    effect: 'Semakin besar yc maka akan menggeser elips ke atas, semakin kecil maka menggeser elips ke bawah.',
    formula: 'y = yc + b·sin(θ)',
  },
  a_elips: {
    title: 'Semi-Mayor (a) — Elips',
    symbol: 'a',
    emoji: '↔️',
    short: 'Setengah lebar elips pada arah horizontal.',
    detail:
      'Semi-mayor (a) adalah jarak dari pusat elips ke ujung kiri atau kanan. Ini adalah "radius horizontal" dari elips. ' +
      'Jika a > b, elips lebih lebar dari tinggi (melebar ke samping). Jika a < b, elips lebih tinggi.',
    effect: 'Semakin besar a maka akan memperlebar elips secara horizontal ke kanan dan kiri, semakin kecil maka mempersempit lebar elips.',
    formula: 'x = xc + a·cos(θ)',
    tip: 'Coba set a = b untuk mendapatkan lingkaran dari rumus elips!',
  },
  b_elips: {
    title: 'Semi-Minor (b) — Elips',
    symbol: 'b',
    emoji: '↕️',
    short: 'Setengah tinggi elips pada arah vertikal.',
    detail:
      'Semi-minor (b) adalah jarak dari pusat elips ke ujung atas atau bawah. Ini adalah "radius vertikal" dari elips.',
    effect: 'Semakin besar b maka akan mempertinggi elips secara vertikal ke atas dan bawah, semakin kecil maka memperpendek tinggi elips.',
    formula: 'y = yc + b·sin(θ)',
    tip: 'Selisih antara a dan b menentukan seberapa "gepeng" elips tersebut.',
  },
  deltaTheta_elips: {
    title: 'Delta Sudut (Δθ) — Elips',
    symbol: 'Δθ',
    emoji: '🔄',
    short: 'Besar lompatan sudut di setiap langkah kalkulasi.',
    detail:
      'Sama seperti pada lingkaran, Δθ mengatur tingkat kehalusan kurva elips. ' +
      'Nilai kecil menghasilkan kurva mulus dengan lebih banyak titik.',
    effect: 'Semakin besar Δθ maka akan mempercepat perhitungan tapi kurva terlihat kasar patah-patah, semakin kecil maka kurva elips digambar dengan sangat halus.',
    formula: 'θ[i+1] = θ[i] + Δθ',
    tip: 'Nilai 0.05 adalah titik awal yang baik untuk keseimbangan antara kehalusan dan kecepatan.',
  },

  // ── Parabola ──
  xc_parabola: {
    title: 'Vertex X — Parabola',
    symbol: 'xp',
    emoji: '📍',
    short: 'Posisi titik puncak (vertex) parabola pada sumbu X.',
    detail:
      'xp adalah koordinat X dari vertex (titik puncak/balik) parabola. ' +
      'Pada parabola x = xp + a·t², nilai x minimum terjadi tepat di titik ini saat t = 0.',
    effect: 'Semakin besar xp maka akan menggeser puncak parabola ke kanan, semakin kecil maka menggeser puncak parabola ke kiri.',
    formula: 'x = xp + a·t²',
    tip: 'Vertex adalah titik paling kiri (atau kanan, tergantung tanda a) dari parabola.',
  },
  yc_parabola: {
    title: 'Vertex Y — Parabola',
    symbol: 'yp',
    emoji: '📍',
    short: 'Posisi titik puncak (vertex) parabola pada sumbu Y.',
    detail:
      'yp adalah koordinat Y dari vertex parabola. Saat t = 0, titik yang digambar adalah (xp, yp), yaitu tepat di puncak.',
    effect: 'Semakin besar yp maka akan menggeser puncak parabola ke atas, semakin kecil maka menggeser puncak parabola ke bawah.',
    formula: 'y = yp + 2a·t',
    tip: 'Coba set xp=0, yp=0 untuk parabola yang berpusat di tengah grid.',
  },
  focusA_parabola: {
    title: 'Koefisien Fokus (a) — Parabola',
    symbol: 'a',
    emoji: '🎯',
    short: 'Penentu lebar dan arah bukaan parabola.',
    detail:
      'Parameter a mengontrol seberapa cepat parabola "melebar" saat t bergerak dari 0. ' +
      'Nilainya berhubungan langsung dengan jarak titik fokus ke vertex parabola.',
    effect: 'Semakin besar a maka akan mempersempit bukaan parabola ke arah horizontal dan membuatnya lebih curam, semakin kecil maka memperlebar kelengkungan parabola.',
    formula: 'x = xp + a·t²   |   y = yp + 2a·t',
    tip: 'Coba nilai a = 1, 2, 0.5 untuk membandingkan bentuk parabola yang berbeda.',
  },
  tMin_parabola: {
    title: 'Batas Awal Parameter (t Min)',
    symbol: 't_min',
    emoji: '⏮️',
    short: 'Nilai awal parameter t, menentukan titik mulai gambar kurva.',
    detail:
      't adalah parameter waktu yang "berjalan" dari tMin ke tMax. Saat t = tMin, itulah titik pertama yang digambar. ' +
      'Nilai negatif memungkinkan menggambar setengah kiri parabola.',
    effect: 'Semakin besar tMin maka akan memotong bagian awal gambar kurva parabola, semakin kecil maka memulai penggambaran dari titik yang lebih jauh.',
    formula: 'Kurva dimulai dari t = tMin',
    tip: 'Untuk parabola simetri, gunakan tMin = -tMax (misalnya -5 dan 5).',
  },
  tMax_parabola: {
    title: 'Batas Akhir Parameter (t Max)',
    symbol: 't_max',
    emoji: '⏭️',
    short: 'Nilai akhir parameter t, menentukan titik selesai gambar kurva.',
    detail:
      't berjalan hingga mencapai tMax, saat itulah gambar parabola selesai. ' +
      'Rentang [tMin, tMax] menentukan seberapa banyak "panjang" kurva yang ditampilkan.',
    effect: 'Semakin besar tMax maka akan memperpanjang sisa gambar kurva ke arah luar, semakin kecil maka membatasi panjang gambar kurva.',
    formula: 'Kurva berakhir di t = tMax',
    tip: 'Nilai tMax = 5 dengan tMin = -5 biasanya menghasilkan parabola yang proporsional di layar.',
  },
  deltaT_parabola: {
    title: 'Langkah Parameter (Δt)',
    symbol: 'Δt',
    emoji: '🔢',
    short: 'Besar lompatan parameter t di setiap langkah.',
    detail:
      'Setiap iterasi, t bertambah sebesar Δt. Nilai kecil menghasilkan lebih banyak titik sehingga kurva terlihat lebih halus.',
    effect: 'Semakin besar Δt maka akan mengurangi detail titik sehingga parabola tampak kasar patah-patah, semakin kecil maka memperbanyak detail titik sehingga kurva sangat mulus.',
    formula: 't[i+1] = t[i] + Δt',
    tip: 'Jangan terlalu kecil (< 0.01) karena akan menghasilkan ribuan titik dan memperlambat animasi.',
  },

  // ── Hiperbola ──
  xc_hiperbola: {
    title: 'Pusat X — Hiperbola',
    symbol: 'xc',
    emoji: '📍',
    short: 'Posisi pusat hiperbola pada sumbu horizontal.',
    detail:
      'xc adalah koordinat X dari titik pusat hiperbola. Hiperbola terdiri dari dua "cabang" yang simetris terhadap pusat ini.',
    effect: 'Semakin besar xc maka akan menggeser kedua cabang hiperbola ke kanan, semakin kecil maka menggeser kedua cabang hiperbola ke kiri.',
    formula: 'x = xc + a·sec(θ)',
    tip: 'Pusat hiperbola adalah titik tengah antara dua vertex kedua cabangnya.',
  },
  yc_hiperbola: {
    title: 'Pusat Y — Hiperbola',
    symbol: 'yc',
    emoji: '📍',
    short: 'Posisi pusat hiperbola pada sumbu vertikal.',
    detail:
      'yc adalah koordinat Y dari titik pusat hiperbola. Kedua cabang hiperbola simetris terhadap garis y = yc.',
    effect: 'Semakin besar yc maka akan menggeser kedua cabang hiperbola ke atas, semakin kecil maka menggeser kedua cabang hiperbola ke bawah.',
    formula: 'y = yc + b·tan(θ)',
  },
  hA_hiperbola: {
    title: 'Sumbu Transversal (a) — Hiperbola',
    symbol: 'a',
    emoji: '↔️',
    short: 'Jarak dari pusat ke vertex (puncak) masing-masing cabang.',
    detail:
      'Parameter a menentukan seberapa jauh kedua cabang hiperbola dari pusat. ' +
      'Vertex hiperbola terletak di (xc ± a, yc). Semakin besar a, semakin jauh kedua cabang terpisah.',
    effect: 'Semakin besar a maka akan memperlebar jarak pisah antara cabang kiri dan kanan, semakin kecil maka memperdekat kedua cabang ke titik pusat.',
    formula: 'x = xc + a·sec(θ)',
    tip: 'Pada hiperbola horizontal (buka ke samping), parameter a ini adalah yang paling terlihat efeknya.',
  },
  hB_hiperbola: {
    title: 'Sumbu Konjugasi (b) — Hiperbola',
    symbol: 'b',
    emoji: '↕️',
    short: 'Mengatur kecuraman (kelengkungan) cabang-cabang hiperbola.',
    detail:
      'Parameter b mengontrol kemiringan asimtot hiperbola. Asimtot adalah garis lurus yang "didekati" oleh cabang hiperbola ' +
      'namun tidak pernah berpotongan. Kemiringan asimtot adalah ±(b/a).',
    effect: 'Semakin besar b maka akan membuat cabang kurva melengkung lebih tajam (curam) ke arah atas-bawah, semakin kecil maka membuat cabang kurva lebih landai.',
    formula: 'y = yc + b·tan(θ)   |   Asimtot: y = ±(b/a)·x',
    tip: 'Coba a = b untuk hiperbola persegi (equilateral) — asimtotnya bersilang tegak lurus.',
  },
  deltaTheta_hiperbola: {
    title: 'Delta Sudut (Δθ) — Hiperbola',
    symbol: 'Δθ',
    emoji: '🔄',
    short: 'Besar lompatan sudut di setiap langkah kalkulasi.',
    detail:
      'Δθ mengontrol kehalusan kurva hiperbola. Sudut θ bergerak menghindari titik asimtot (π/2 dan 3π/2) ' +
      'karena di titik itu sec(θ) dan tan(θ) tidak terdefinisi (tak hingga).',
    effect: 'Semakin besar Δθ maka akan mempercepat penggambaran namun cabang kurva tampak kasar terputus-putus, semakin kecil maka menghasilkan kelengkungan cabang hiperbola yang sangat halus.',
    formula: 'θ[i+1] = θ[i] + Δθ',
    tip: 'Nilai 0.05–0.1 biasanya menghasilkan hiperbola yang terlihat mulus.',
  },
};

// ── Fungsi bantu ambil kunci info param ───────────────────────────────────────
const getParamKey = (paramName: string, curve: CurveType): string =>
  `${paramName}_${curve}`;

// ── Sub-komponen: Tombol "?" ───────────────────────────────────────────────────
const InfoBtn: React.FC<{ paramKey: string; onClick: (key: string) => void }> = ({
  paramKey, onClick,
}) => (
  <button
    type="button"
    onClick={() => onClick(paramKey)}
    className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-palette-teal/15 hover:bg-palette-teal/30 text-palette-teal transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-palette-teal/40 shrink-0"
    title="Lihat penjelasan parameter"
  >
    <HelpCircle size={12} strokeWidth={2.5} />
  </button>
);

// ── Sub-komponen: Label + tombol info ─────────────────────────────────────────
const FieldLabel: React.FC<{
  children: React.ReactNode;
  paramKey: string;
  onInfo: (key: string) => void;
  className?: string;
}> = ({ children, paramKey, onInfo, className = '' }) => (
  <span className={`flex items-center gap-0 ${className}`}>
    <span className="block text-xs font-black text-gray-600 uppercase tracking-wider">
      {children}
    </span>
    <InfoBtn paramKey={paramKey} onClick={onInfo} />
  </span>
);

// ── Modal Popup Penjelasan ─────────────────────────────────────────────────────
const ParamModal: React.FC<{ info: ParamInfo; onClose: () => void }> = ({
  info, onClose,
}) =>
  createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1d4d52]/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#f4f8f5] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-palette-sage animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-palette-teal p-5 flex justify-between items-start text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{info.emoji}</span>
            <div>
              <h3 className="font-black text-lg leading-tight">{info.title}</h3>
              <code className="mt-1 text-xs bg-white/20 px-2 py-0.5 rounded font-mono inline-block tracking-widest">
                {info.symbol}
              </code>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 transition-colors font-bold ml-4 shrink-0"
            title="Tutup"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Ringkasan singkat */}
          <div className="bg-palette-teal/10 border border-palette-teal/20 rounded-xl px-4 py-3">
            <p className="text-sm font-bold text-palette-teal leading-relaxed">
              📌 {info.short}
            </p>
          </div>

          {/* Penjelasan detail */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              Penjelasan
            </h4>
            <div className="bg-white rounded-xl border border-palette-sage/40 px-4 py-3">
              <p className="text-sm text-gray-700 leading-relaxed">{info.detail}</p>
            </div>
          </div>

          {/* Efek perubahan nilai */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              ⚙️ Efek Mengubah Nilai
            </h4>
            <div className="bg-white rounded-xl border border-palette-sage/40 px-4 py-3">
              <p className="text-sm text-[#1d4d52] font-semibold leading-relaxed">
                {info.effect}
              </p>
            </div>
          </div>

          {/* Rumus */}
          {info.formula && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                📐 Peran dalam Rumus
              </h4>
              <div className="bg-[#1d4d52]/5 border border-[#1d4d52]/15 rounded-xl px-4 py-3 font-mono text-sm font-bold text-[#1d4d52] tracking-wide">
                {info.formula}
              </div>
            </div>
          )}

          {/* Tips */}
          {info.tip && (
            <div className="bg-palette-olive/20 border border-palette-sage/30 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-[#1d4d52] leading-relaxed">
                💡 <span className="font-black">Tips:</span> {info.tip}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );

// ── Daftar kurva ──────────────────────────────────────────────────────────────
const CURVES: { key: CurveType; label: string; active: boolean }[] = [
  { key: 'lingkaran', label: 'Lingkaran',  active: true  },
  { key: 'elips',     label: 'Elips',      active: true  },
  { key: 'parabola',  label: 'Parabola',   active: true  },
  { key: 'hiperbola', label: 'Hiperbola',  active: true  },
];

// ── Komponen Utama ────────────────────────────────────────────────────────────
export const ControlPanel: React.FC<ControlPanelProps> = ({
  xc, setXc, yc, setYc, r, setR, a, setA, b, setB,
  focusA, setFocusA, tMin, setTMin, tMax, setTMax, deltaT, setDeltaT,
  hA, setHA, hB, setHB,
  deltaTheta, setDeltaTheta,
  curveType, setCurveType, visMode, setVisMode,
  onStart, onPause, onReset, onStepForward, onStepBackward,
  isRunning, isFinished,
  algorithmType, setAlgorithmType,
}) => {
  const [activeParamKey, setActiveParamKey] = React.useState<string | null>(null);

  const inp = "w-full bg-white/70 border-2 border-palette-sage/60 rounded-xl p-2.5 text-[#1d4d52] focus:bg-white focus:outline-none focus:border-palette-teal focus:ring-2 focus:ring-palette-teal/20 font-bold text-lg transition-all";

  const openInfo = (key: string) => setActiveParamKey(key);
  const closeInfo = () => setActiveParamKey(null);

  const activeInfo = activeParamKey ? PARAM_INFO[activeParamKey] : null;

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

      {/* Pilihan Algoritma */}
      <div>
        <label className="block text-xs font-black mb-2 text-[#1d4d52] uppercase tracking-widest">Metode Algoritma</label>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { key: 'parametrik', label: 'Parametrik', supported: true },
            { key: 'bresenham', label: 'Bresenham', supported: curveType === 'lingkaran' || curveType === 'elips' },
          ].map(algo => (
            <button
              key={algo.key}
              disabled={isRunning || !algo.supported}
              onClick={() => setAlgorithmType(algo.key as AlgorithmType)}
              className={`p-2.5 rounded-xl border-2 font-bold transition-all duration-300 text-sm flex flex-col items-center justify-center gap-0.5
                ${algorithmType === algo.key
                  ? 'bg-palette-teal border-palette-teal text-white shadow-lg shadow-palette-teal/30 scale-[1.03]'
                  : algo.supported
                    ? 'bg-white/50 border-palette-sage text-[#1d4d52] hover:bg-white hover:shadow'
                    : 'bg-gray-100/50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'}`}
            >
              <span>{algo.label}</span>
              {!algo.supported && <span className="text-[9px] opacity-70 font-normal">(Hanya Lingkaran/Elips)</span>}
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


      {/* ── Parameter Pusat / Vertex ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5">
            <FieldLabel
              paramKey={getParamKey('xc', curveType)}
              onInfo={openInfo}
            >
              {curveType === 'parabola' ? 'Vertex X (xp)' : 'Pusat X (xc)'}
            </FieldLabel>
          </label>
          <input type="number" value={xc} onChange={e => setXc(e.target.value)} disabled={isRunning} className={inp} />
        </div>
        <div>
          <label className="mb-1.5">
            <FieldLabel
              paramKey={getParamKey('yc', curveType)}
              onInfo={openInfo}
            >
              {curveType === 'parabola' ? 'Vertex Y (yp)' : 'Pusat Y (yc)'}
            </FieldLabel>
          </label>
          <input type="number" value={yc} onChange={e => setYc(e.target.value)} disabled={isRunning} className={inp} />
        </div>
      </div>

      {/* ── Parameter spesifik: Lingkaran ── */}
      {curveType === 'lingkaran' && (
        <>
          <div>
            <label className="mb-1.5">
              <FieldLabel paramKey="r_lingkaran" onInfo={openInfo}>Jari-jari (r)</FieldLabel>
            </label>
            <input type="number" value={r} min="0.1"
              onChange={e => setR(e.target.value)} disabled={isRunning} className={inp} />
          </div>
          <div>
            <label className="mb-1.5">
              <FieldLabel paramKey="deltaTheta_lingkaran" onInfo={openInfo}>Delta Sudut (Δθ)</FieldLabel>
            </label>
            <input type="number" step="0.05" value={deltaTheta} min="0.001"
              onChange={e => setDeltaTheta(e.target.value)} disabled={isRunning} className={inp} />
          </div>
        </>
      )}

      {/* ── Parameter spesifik: Elips ── */}
      {curveType === 'elips' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5">
                <FieldLabel paramKey="a_elips" onInfo={openInfo}>Semi-Mayor (a) horiz</FieldLabel>
              </label>
              <input type="number" value={a} min="0.1"
                onChange={e => setA(e.target.value)} disabled={isRunning} className={inp} />
            </div>
            <div>
              <label className="mb-1.5">
                <FieldLabel paramKey="b_elips" onInfo={openInfo}>Semi-Minor (b) vert</FieldLabel>
              </label>
              <input type="number" value={b} min="0.1"
                onChange={e => setB(e.target.value)} disabled={isRunning} className={inp} />
            </div>
          </div>
          {Number(a) === Number(b) && <div className="text-xs font-bold text-palette-teal bg-palette-olive/30 px-3 py-2 rounded-lg">✓ a = b → Lingkaran sempurna</div>}
          <div>
            <label className="mb-1.5">
              <FieldLabel paramKey="deltaTheta_elips" onInfo={openInfo}>Delta Sudut (Δθ)</FieldLabel>
            </label>
            <input type="number" step="0.05" value={deltaTheta} min="0.001"
              onChange={e => setDeltaTheta(e.target.value)} disabled={isRunning} className={inp} />
          </div>
        </>
      )}

      {/* ── Parameter spesifik: Parabola ── */}
      {curveType === 'parabola' && (
        <>
          <div>
            <label className="mb-1.5">
              <FieldLabel paramKey="focusA_parabola" onInfo={openInfo}>Fokus / Koefisien (a)</FieldLabel>
            </label>
            <input type="number" step="0.5" value={focusA}
              onChange={e => setFocusA(e.target.value)} disabled={isRunning} className={inp} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1.5">
                <FieldLabel paramKey="tMin_parabola" onInfo={openInfo}>t Min</FieldLabel>
              </label>
              <input type="number" value={tMin}
                onChange={e => setTMin(e.target.value)} disabled={isRunning} className={inp} />
            </div>
            <div>
              <label className="mb-1.5">
                <FieldLabel paramKey="tMax_parabola" onInfo={openInfo}>t Max</FieldLabel>
              </label>
              <input type="number" value={tMax}
                onChange={e => setTMax(e.target.value)} disabled={isRunning} className={inp} />
            </div>
            <div>
              <label className="mb-1.5">
                <FieldLabel paramKey="deltaT_parabola" onInfo={openInfo}>Δt (step)</FieldLabel>
              </label>
              {/* BUG-05: min=0.01 mencegah infinite loop dan tMin>=tMax */}
              <input type="number" step="0.1" value={deltaT} min="0.01"
                onChange={e => setDeltaT(e.target.value)} disabled={isRunning} className={inp} />
            </div>
          </div>
          <div className="text-xs font-semibold text-palette-sage bg-palette-cream/50 px-3 py-2 rounded-lg border border-palette-sage/30">
            x = xp + a·t² &nbsp;|&nbsp; y = yp + 2·a·t
          </div>
        </>
      )}

      {/* ── Parameter spesifik: Hiperbola ── */}
      {curveType === 'hiperbola' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5">
                <FieldLabel paramKey="hA_hiperbola" onInfo={openInfo}>Transversal (a)</FieldLabel>
              </label>
              <input type="number" value={hA} min="0.1"
                onChange={e => setHA(e.target.value)} disabled={isRunning} className={inp} />
            </div>
            <div>
              <label className="mb-1.5">
                <FieldLabel paramKey="hB_hiperbola" onInfo={openInfo}>Konjugasi (b)</FieldLabel>
              </label>
              <input type="number" value={hB} min="0.1"
                onChange={e => setHB(e.target.value)} disabled={isRunning} className={inp} />
            </div>
          </div>
          <div>
            <label className="mb-1.5">
              <FieldLabel paramKey="deltaTheta_hiperbola" onInfo={openInfo}>Delta Sudut (Δθ)</FieldLabel>
            </label>
            {/* BUG-04: min=0.001 mencegah infinite loop di generator */}
            <input type="number" step="0.05" value={deltaTheta} min="0.001"
              onChange={e => setDeltaTheta(e.target.value)} disabled={isRunning} className={inp} />
          </div>
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

      {/* ── Modal Popup Penjelasan Parameter ── */}
      {activeInfo && <ParamModal info={activeInfo} onClose={closeInfo} />}
    </div>
  );
};
