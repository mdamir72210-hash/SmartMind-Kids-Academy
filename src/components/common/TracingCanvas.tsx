import React, { useEffect, useRef, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';

interface TracingCanvasProps {
  character: string;
  label: string;
  isBengali?: boolean;
  onComplete: () => void;
  alreadyTraced?: boolean;
}

const CRAYON_COLORS = [
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Red', hex: '#E11D48' },
  { name: 'Green', hex: '#059669' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Purple', hex: '#7C3AED' },
];

export const TracingCanvas: React.FC<TracingCanvasProps> = ({
  character,
  label,
  isBengali = false,
  onComplete,
  alreadyTraced = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [activeColor, setActiveColor] = useState(CRAYON_COLORS[0].hex);

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeCount(0);
  };

  useEffect(() => {
    resetCanvas();
  }, [character]);

  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 14;
    ctx.strokeStyle = activeColor;
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setStrokeCount((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="text-base font-bold text-slate-900">
            Trace the Letter · <span className="font-bengali">লিখে অনুশীলন করো</span>
          </h4>
          <p className="text-xs text-slate-500">Follow the dotted guide for {label} with your finger or mouse.</p>
        </div>
        <div className="flex items-center gap-2">
          {CRAYON_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setActiveColor(c.hex)}
              aria-label={`Select ${c.name} crayon`}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                activeColor === c.hex ? 'border-slate-900 scale-110' : 'border-white shadow-sm'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      <div className="relative w-full h-56 sm:h-64 bg-[#FFFDF8] border-2 border-dashed border-amber-300 rounded-xl overflow-hidden select-none touch-none flex items-center justify-center">
        {/* Ruled guide lines */}
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-sky-200 pointer-events-none" />
        <div
          aria-hidden="true"
          className={`pointer-events-none text-slate-200 font-bold leading-none select-none ${
            isBengali ? 'font-bengali text-[135px] sm:text-[155px]' : 'font-display text-[140px] sm:text-[165px]'
          }`}
          style={{ WebkitTextStroke: '3px #CBD5E1', color: 'rgba(241, 245, 249, 0.7)' }}
        >
          {character}
        </div>
        <canvas
          ref={canvasRef}
          width={520}
          height={260}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <button
          type="button"
          onClick={resetCanvas}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear</span>
        </button>

        <button
          type="button"
          onClick={onComplete}
          disabled={strokeCount === 0}
          className={`inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl font-bold text-sm transition-all ${
            strokeCount > 0
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800 active:translate-y-0.5'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{alreadyTraced ? 'Traced Again!' : 'Done Tracing (+5 pts)'}</span>
        </button>
      </div>
    </div>
  );
};
