import React, { useRef, useEffect, useState } from 'react';
import type { Point, VisualizationMode, CurveType } from '../types';

interface Props {
  points: Point[];
  xc: number; yc: number;
  r: number; a: number; b: number; focusA: number; hA: number; hB: number;
  mode: VisualizationMode;
  curveType: CurveType;
}

export const VisualizationCanvas: React.FC<Props> = ({
  points, xc, yc, r, a, b, focusA, hA, hB, mode, curveType,
}) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // BUG-08: track ukuran container agar useEffect draw ter-trigger saat resize
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // BUG-08: ResizeObserver — canvas di-redraw setiap kali ukuran container berubah
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    });
    observer.observe(container);
    // Set ukuran awal
    const rect = container.getBoundingClientRect();
    setContainerSize({ w: rect.width, h: rect.height });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    ctx.clearRect(0, 0, W, H);

    // ── Skala Dinamis ───────────────────────────────────
    let maxBound = 5;
    if (curveType === 'lingkaran') maxBound = Math.max(Math.abs(xc) + r, Math.abs(yc) + r, 5);
    if (curveType === 'elips')     maxBound = Math.max(Math.abs(xc) + a, Math.abs(yc) + b, 5);
    if ((curveType === 'parabola' || curveType === 'hiperbola') && points.length > 0) {
      // Filter out NaN points before calculating max bounds
      const validPoints = points.filter(p => !isNaN(p.x) && !isNaN(p.y));
      if (validPoints.length > 0) {
        const xs = validPoints.map(p => Math.abs(p.x - xc));
        const ys = validPoints.map(p => Math.abs(p.y - yc));
        maxBound = Math.max(Math.max(...xs), Math.max(...ys), 5);
      }
    }
    // Jika hiperbola tapi belum ada point (karena belum play)
    if (curveType === 'hiperbola' && points.length === 0) {
      maxBound = Math.max(Math.abs(xc) + hA * 3, Math.abs(yc) + hB * 3, 5);
    }
    maxBound *= 1.25;

    const gridSize = Math.min(W, H) / 2 / maxBound;
    const ox = W / 2;
    const oy = H / 2;
    const mx = (x: number) => ox + x * gridSize;
    const my = (y: number) => oy - y * gridSize;

    // ── Dinamis Grid Step agar angka tidak numpuk ───────
    let gridStep = 1;
    // Maksimal sekitar 12-15 angka di setiap sisi sumbu
    while (maxBound / gridStep > 12) {
      const firstDigit = parseInt(gridStep.toString()[0]);
      if (firstDigit === 1) gridStep *= 2;       // 1 -> 2, 10 -> 20
      else if (firstDigit === 2) gridStep *= 2.5; // 2 -> 5, 20 -> 50
      else gridStep *= 2;                         // 5 -> 10, 50 -> 100
    }

    // ── Grid ────────────────────────────────────────────
    ctx.strokeStyle = '#7DA78C33';
    ctx.lineWidth = 1;
    const maxU = Math.ceil(maxBound) + gridStep;
    
    // Gambar garis grid
    for (let i = -maxU; i <= maxU; i++) {
      if (gridStep > 1 && i % gridStep !== 0) {
        ctx.strokeStyle = '#7DA78C11';
        ctx.beginPath(); ctx.moveTo(mx(i), 0); ctx.lineTo(mx(i), H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, my(i)); ctx.lineTo(W, my(i)); ctx.stroke();
      } else {
        ctx.strokeStyle = '#7DA78C44';
        ctx.beginPath(); ctx.moveTo(mx(i), 0); ctx.lineTo(mx(i), H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, my(i)); ctx.lineTo(W, my(i)); ctx.stroke();
      }
    }

    // ── Axes ────────────────────────────────────────────
    ctx.strokeStyle = '#1d4d52cc';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke();

    // ── Axis numbers ────────────────────────────────────
    const fs = Math.max(10, Math.min(13, gridSize * gridStep * 0.38));
    ctx.fillStyle = '#1d4d52';
    ctx.font = `bold ${fs}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    
    for (let i = -maxU; i <= maxU; i += gridStep) {
      if (i !== 0) { 
        ctx.fillText(i.toString(), mx(i), oy + fs + 4);
        ctx.fillText(i.toString(), ox - fs - 6, my(i));
      }
    }
    ctx.fillText('0', ox - 10, oy + 12);

    if (curveType === 'parabola') {
      ctx.strokeStyle = '#C2D09966';
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(mx(xc), 0); ctx.lineTo(mx(xc), H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#C2D099'; ctx.font = `bold ${fs}px "JetBrains Mono", monospace`;
      ctx.fillText('Axis', mx(xc), 16);
    }

    // Center / vertex dot
    ctx.fillStyle = '#C2D099';
    ctx.beginPath(); ctx.arc(mx(xc), my(yc), Math.max(4, gridSize * 0.12), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1d4d52'; ctx.lineWidth = 2; ctx.stroke();

    if (points.length === 0 && mode !== 'analisis') return;

    // Helper untuk menggambar path agar terpisah cabang
    const drawPath = (pts: Point[], stroke: string, width: number) => {
      if (pts.length === 0) return;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      let started = false;
      
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        
        // Handle NaN branch separator
        if (isNaN(p.x) || isNaN(p.y)) {
          ctx.stroke();
          ctx.beginPath();
          started = false;
          continue;
        }

        if (!started) {
          ctx.moveTo(mx(p.x), my(p.y));
          started = true;
        } else {
          ctx.lineTo(mx(p.x), my(p.y));
        }
      }
      ctx.stroke();
    };

    // ── MODE: GEOMETRI DASAR ────────────────────────────
    if (mode === 'geometri') {
      drawPath(points, '#35858E', Math.max(2, gridSize * 0.04));
      ctx.fillStyle = '#ef4444'; // Merah cerah agar sangat jelas dan kontras
      const pr = Math.max(3.5, gridSize * 0.08); // Diperbesar sedikit
      points.forEach(p => {
        if (!isNaN(p.x) && !isNaN(p.y)) {
          ctx.beginPath(); ctx.arc(mx(p.x), my(p.y), pr, 0, Math.PI * 2); ctx.fill();
        }
      });

    // ── MODE: RENDERING PRESISI ─────────────────────────
    } else if (mode === 'presisi') {
      const drawnPixels = new Set<string>();

      points.forEach(p => {
        if (isNaN(p.x) || isNaN(p.y)) return;
        
        const px = Math.round(p.x), py = Math.round(p.y);
        const key = `${px},${py}`;
        
        if (!drawnPixels.has(key)) {
          drawnPixels.add(key);
          ctx.fillStyle = '#7DA78Ccc';
          ctx.fillRect(mx(px) - gridSize / 2, my(py) - gridSize / 2, gridSize, gridSize);
          ctx.strokeStyle = '#1d4d52'; ctx.lineWidth = 1;
          ctx.strokeRect(mx(px) - gridSize / 2, my(py) - gridSize / 2, gridSize, gridSize);
          
          if (gridSize > 22) {
            ctx.fillStyle = '#0f292b';
            ctx.font = `bold ${gridSize * 0.22}px "JetBrains Mono", monospace`;
            ctx.fillText(key, mx(px), my(py));
          }
        }
      });

      ctx.fillStyle = '#ef4444';
      points.forEach(p => {
        if (!isNaN(p.x) && !isNaN(p.y)) {
          ctx.beginPath(); ctx.arc(mx(p.x), my(p.y), Math.max(2, gridSize * 0.04), 0, Math.PI * 2); ctx.fill();
        }
      });

    // ── MODE: ANALISIS VISUAL ───────────────────────────
    } else if (mode === 'analisis') {
      ctx.strokeStyle = '#7DA78C66'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);

      if (curveType === 'elips') {
        ctx.beginPath(); ctx.ellipse(mx(xc), my(yc), a * gridSize, b * gridSize, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (curveType === 'lingkaran') {
        ctx.beginPath(); ctx.arc(mx(xc), my(yc), r * gridSize, 0, Math.PI * 2); ctx.stroke();
      } else if (curveType === 'hiperbola') {
        ctx.strokeRect(mx(xc - hA), my(yc + hB), hA * 2 * gridSize, hB * 2 * gridSize);
        ctx.beginPath();
        ctx.moveTo(mx(xc - maxBound), my(yc - (hB/hA) * maxBound));
        ctx.lineTo(mx(xc + maxBound), my(yc + (hB/hA) * maxBound));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mx(xc - maxBound), my(yc + (hB/hA) * maxBound));
        ctx.lineTo(mx(xc + maxBound), my(yc - (hB/hA) * maxBound));
        ctx.stroke();
        
        ctx.fillStyle = '#7DA78C'; ctx.font = `bold ${fs}px "JetBrains Mono", monospace`;
        ctx.fillText('Asimtot', mx(xc + hA * 1.5), my(yc + hB * 1.5));
      }
      ctx.setLineDash([]);

      drawPath(points, '#35858E', Math.max(2, gridSize * 0.04));

      // Ambil poin terakhir yang BUKAN NaN
      const validPoints = points.filter(p => !isNaN(p.x) && !isNaN(p.y));
      if (validPoints.length > 0) {
        const last = validPoints[validPoints.length - 1];

        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#C2D099'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(mx(xc), my(last.y)); ctx.lineTo(mx(last.x), my(last.y)); ctx.stroke();
        ctx.strokeStyle = '#7DA78C';
        ctx.beginPath(); ctx.moveTo(mx(last.x), my(yc)); ctx.lineTo(mx(last.x), my(last.y)); ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#1d4d52'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(mx(xc), my(yc)); ctx.lineTo(mx(last.x), my(last.y)); ctx.stroke();

        const label = `P(${last.x.toFixed(1)}, ${last.y.toFixed(1)})`;
        ctx.font = "bold 13px 'JetBrains Mono', monospace";
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(mx(last.x) + 6, my(last.y) - 22, tw + 10, 18);
        ctx.fillStyle = '#1d4d52';
        ctx.fillText(label, mx(last.x) + 11 + tw / 2, my(last.y) - 13);
      }
    }
  }, [points, xc, yc, r, a, b, focusA, hA, hB, mode, curveType, containerSize]); // BUG-08: +containerSize

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px]">
      <canvas ref={canvasRef}
        className="w-full h-full bg-[#f4f8f5] rounded-[1.5rem] border-2 border-palette-sage shadow-inner"
        style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
