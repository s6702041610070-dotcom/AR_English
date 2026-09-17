import React from 'react';
import { Camera, Sparkles, Ship, Fish, CheckCircle2, ShieldAlert } from 'lucide-react';

interface StartModalProps {
  onStart: () => void;
  isLoading: boolean;
  cameraError: string | null;
}

export const StartModal: React.FC<StartModalProps> = ({
  onStart,
  isLoading,
  cameraError
}) => {
  return (
    <div
      id="start-game-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="relative max-w-xl w-full bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-100">
        {/* Background ambient lighting */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            MediaPipe Hands AR Experience
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 font-['Fredoka']">
            AR English Vocabulary Game
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            เกมจำแนกคำศัพท์ที่ใช้ <span className="text-cyan-400 font-bold">'a'</span> และ <span className="text-amber-400 font-bold">'an'</span> ด้วยการตรวจจับท่าทางมือ
          </p>
        </div>

        {/* Instructions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
          {/* Card 1: Controls */}
          <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-300 font-bold mb-2">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px]">1</div>
                วิธีจับปลา (Pinch Gesture)
              </div>
              <p className="text-slate-300 leading-relaxed">
                ชี้ปลายนิ้วไปที่ปลา แล้ว <strong className="text-emerald-400">จีบนิ้วโป้งกับนิ้วชี้</strong> แตะกันเพื่อคีบจับปลาไว้ (เคอร์เซอร์สีเขียว)
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
              <span>ปกติ: สีฟ้า | เล็ง: สีเหลือง | จับ: สีเขียว</span>
            </div>
          </div>

          {/* Card 2: Rules */}
          <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-300 font-bold mb-2">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">2</div>
                หย่อนใส่เรือ (Sort to Boat)
              </div>
              <p className="text-slate-300 leading-relaxed">
                ลากปลาไปปล่อยที่เรือด้านบนผิวน้ำ:
                <br />
                • <strong className="text-cyan-300">Boat 'a' (ซ้าย)</strong>: คำนำหน้าด้วยเสียงพยัญชนะ
                <br />
                • <strong className="text-amber-300">Boat 'an' (ขวา)</strong>: คำนำหน้าด้วยเสียงสระ
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded-xl">
              <span className="text-emerald-400 font-bold">+20 คะแนน</span>
              <span>/</span>
              <span className="text-rose-400 font-bold">-10 คะแนน</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-cyan-950/40 border border-cyan-500/20 rounded-2xl p-3 mb-6 flex items-center justify-around text-center text-xs">
          <div>
            <div className="text-cyan-300 font-bold text-base font-['Fredoka']">60 คำ</div>
            <div className="text-slate-400 text-[10px]">คลังคำศัพท์ทั้งหมด</div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <div className="text-amber-300 font-bold text-base font-['Fredoka']">20 ตัว</div>
            <div className="text-slate-400 text-[10px]">ปลาว่ายน้ำพร้อมกัน</div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <div className="text-emerald-300 font-bold text-base font-['Fredoka']">AR Hand</div>
            <div className="text-slate-400 text-[10px]">ตรวจจับมือผ่านกล้อง</div>
          </div>
        </div>

        {/* Camera Error Notice if any */}
        {cameraError && (
          <div className="mb-4 p-3 bg-rose-950/70 border border-rose-500/40 rounded-2xl text-rose-200 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <strong>ไม่สามารถเข้าถึงกล้อง:</strong> {cameraError} (กรุณาอนุญาตการเข้าถึงเว็บแคม)
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          id="btn-start-game"
          onClick={onStart}
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-500 text-slate-950 font-black text-lg tracking-wide shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-['Fredoka']"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>กำลังเปิดกล้องและระบบ AR...</span>
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              <span>เริ่มเล่นเกม! (Start Game)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
