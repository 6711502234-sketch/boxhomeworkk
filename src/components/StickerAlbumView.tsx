import React, { useState } from 'react';
import { UserProfile, StickerAchievement } from '../types';
import { triggerStarBurst } from '../utils/confetti';
import { Award, Lock, Sparkles, Star, CheckCircle2, Shield, Info, X } from 'lucide-react';

interface StickerAlbumViewProps {
  currentUser: UserProfile;
  stickers: StickerAchievement[];
}

export const StickerAlbumView: React.FC<StickerAlbumViewProps> = ({
  currentUser,
  stickers,
}) => {
  const [inspectSticker, setInspectSticker] = useState<StickerAchievement | null>(null);

  const unlockedCount = stickers.filter((s) => s.isUnlocked).length;

  // Compute Rank based on stars
  const getRankInfo = (stars: number) => {
    if (stars >= 250) {
      return {
        level: 5,
        title: '👑 แชมป์เปี้ยนกล่องการบ้าน ม.3 (Level MAX)',
        nextGoal: 300,
        color: 'from-amber-400 to-yellow-500',
      };
    }
    if (stars >= 180) {
      return {
        level: 4,
        title: '🚀 ยอดนักวิทยาศาสตร์ ม.3 (Level 4)',
        nextGoal: 250,
        color: 'from-purple-400 to-indigo-500',
      };
    }
    if (stars >= 100) {
      return {
        level: 3,
        title: '⚙️ อัจฉริยะนักประดิษฐ์ (Level 3)',
        nextGoal: 180,
        color: 'from-sky-400 to-blue-500',
      };
    }
    if (stars >= 50) {
      return {
        level: 2,
        title: '📖 นักสืบการบ้านไฟแรง (Level 2)',
        nextGoal: 100,
        color: 'from-emerald-400 to-teal-500',
      };
    }
    return {
      level: 1,
      title: '🌱 ก้าวแรกนักเรียน ม.3 (Level 1)',
      nextGoal: 50,
      color: 'from-amber-200 to-yellow-400',
    };
  };

  const rank = getRankInfo(currentUser.totalStars);
  const progressPercent = Math.min(100, Math.round((currentUser.totalStars / rank.nextGoal) * 100));

  const handleStickerClick = (sticker: StickerAchievement) => {
    setInspectSticker(sticker);
    if (sticker.isUnlocked) {
      triggerStarBurst();
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner & Total Stars Showcase */}
      <div className="bg-[#DCFCE7] sketch-border rounded-[24px_16px_22px_18px] p-6 md:p-8 shadow-[6px_6px_0px_#18181b] relative overflow-hidden">
        <div className="washi-tape -top-3 left-10 rotate-[-3deg] bg-amber-300" />
        <div className="washi-tape -top-3 right-12 rotate-[2deg] bg-sky-200" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Stars Display Box */}
          <div className="md:col-span-5 bg-white p-5 rounded-[20px_14px_18px_12px] sketch-border shadow-[4px_4px_0px_#18181b] text-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-950 font-black text-xs px-3 py-1 rounded-full border border-amber-400 mb-2">
              ⭐ ยอดรวมดาวสะสมของคุณ
            </div>

            <div className="text-4xl md:text-5xl font-black text-amber-900 tracking-tight my-1">
              {currentUser.totalStars}{' '}
              <span className="text-xl font-bold text-amber-600">ดวง</span>
            </div>

            <p className="text-xs font-semibold text-zinc-600">
              ได้รับจากการส่งการบ้าน (+50), ควิซ (+10..130), และประเมินครู (+20)
            </p>
          </div>

          {/* Level Progress */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
                  สถานะระดับความสำเร็จ
                </span>
                <h3 className="text-lg md:text-xl font-black text-zinc-900">
                  {rank.title}
                </h3>
              </div>
              <span className="text-xs font-black bg-zinc-900 text-amber-300 px-3 py-1 rounded-full border border-zinc-900">
                ปลดล็อกแล้ว {unlockedCount}/6 สติกเกอร์
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-zinc-700 mb-1">
                <span>ความคืบหน้าระดับถัดไป</span>
                <span>
                  {currentUser.totalStars} / {rank.nextGoal} ⭐ ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-4 bg-white rounded-full border-2 border-zinc-900 p-0.5 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Honor Sticker Board */}
      <div className="bg-[#FFFDF5] notebook-dots sketch-border-lg rounded-[26px_18px_24px_20px] p-6 md:p-8 shadow-[6px_6px_0px_#18181b] relative">
        <div className="washi-tape -top-3.5 left-1/2 -translate-x-1/2 bg-pink-300" />

        <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b-3 border-zinc-900 mb-6 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎖️</span>
              <h3 className="text-xl md:text-2xl font-black text-zinc-900">
                บอร์ดสติกเกอร์เกียรติยศ 6 ชิ้น (Honor Album)
              </h3>
            </div>
            <p className="text-xs md:text-sm font-semibold text-zinc-600 mt-0.5">
              คลิกที่สติกเกอร์เพื่อดูเงื่อนไขการปลดล็อกและรายละเอียดความสำเร็จ
            </p>
          </div>
          <div className="bg-amber-200 text-zinc-900 text-xs font-black px-3 py-1.5 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000]">
            🏆 เก็บให้ครบ 6 ชิ้นเพื่อรับเหรียญทอง
          </div>
        </div>

        {/* 6 Stickers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stickers.map((sticker, idx) => {
            return (
              <div
                key={sticker.id}
                onClick={() => handleStickerClick(sticker)}
                className={`p-5 rounded-[22px_14px_20px_16px] border-3 transition-all cursor-pointer relative group ${
                  sticker.isUnlocked
                    ? 'bg-white border-zinc-900 shadow-[5px_5px_0px_#18181b] hover:translate-y-[-3px] hover:shadow-[7px_7px_0px_#18181b]'
                    : 'bg-zinc-100 border-dashed border-zinc-400 opacity-60 hover:opacity-90'
                }`}
              >
                {/* Stamp Number Pin */}
                <div className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-md border border-zinc-900 bg-amber-100 text-zinc-800">
                  #{idx + 1}
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div
                    className={`w-16 h-16 rounded-[18px_12px_16px_10px] border-3 flex items-center justify-center text-3xl shadow-[3px_3px_0px_#18181b] transition-transform group-hover:scale-110 ${
                      sticker.isUnlocked
                        ? `bg-linear-to-br ${sticker.color} border-zinc-900 rotate-[-2deg]`
                        : 'bg-zinc-200 border-zinc-400 text-zinc-400'
                    }`}
                  >
                    {sticker.isUnlocked ? sticker.icon : <Lock className="w-6 h-6 text-zinc-400" />}
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      {sticker.name}
                    </div>
                    <h4 className="text-base font-black text-zinc-900 leading-tight">
                      {sticker.thaiTitle}
                    </h4>
                    {sticker.isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ปลดล็อกแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 mt-1">
                        <Lock className="w-3.5 h-3.5" /> ยังไม่ปลดล็อก
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs font-semibold text-zinc-600 mb-3 line-clamp-2">
                  {sticker.description}
                </p>

                <div className="text-[11px] font-bold p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 flex items-center gap-1">
                  <Info className="w-3 h-3 text-sky-600 shrink-0" />
                  <span className="truncate">เงื่อนไข: {sticker.condition}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspect Sticker Modal */}
      {inspectSticker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF5] sketch-border-lg rounded-[26px_18px_24px_20px] p-6 md:p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200 text-center">
            <div className="washi-tape -top-3 left-1/2 -translate-x-1/2 bg-amber-300" />

            <button
              onClick={() => setInspectSticker(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-rose-200 hover:bg-rose-300 border-2 border-zinc-900 flex items-center justify-center font-bold text-zinc-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className={`w-24 h-24 mx-auto rounded-[22px_14px_20px_16px] border-3 flex items-center justify-center text-5xl shadow-[4px_4px_0px_#18181b] mb-4 ${
                inspectSticker.isUnlocked
                  ? `bg-linear-to-br ${inspectSticker.color} border-zinc-900 rotate-[-2deg] animate-bounce`
                  : 'bg-zinc-200 border-zinc-400'
              }`}
            >
              {inspectSticker.isUnlocked ? inspectSticker.icon : <Lock className="w-8 h-8 text-zinc-500" />}
            </div>

            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              {inspectSticker.name}
            </div>
            <h3 className="text-2xl font-black text-zinc-900 mb-2">
              {inspectSticker.thaiTitle}
            </h3>

            <p className="text-sm font-semibold text-zinc-700 mb-4 px-4">
              {inspectSticker.description}
            </p>

            <div className="bg-amber-50 p-4 rounded-xl border-2 border-zinc-900 text-left text-xs space-y-1.5 mb-6">
              <div>
                🎯 <span className="font-bold">เงื่อนไขการรับ:</span> {inspectSticker.condition}
              </div>
              <div>
                ✨ <span className="font-bold">สถานะ:</span>{' '}
                {inspectSticker.isUnlocked ? (
                  <span className="text-emerald-700 font-black">
                    ปลดล็อกสำเร็จแล้ว ({inspectSticker.unlockedAt || 'วันนี้'})
                  </span>
                ) : (
                  <span className="text-rose-600 font-black">
                    ยังไม่สำเร็จ (ทำภารกิจเพื่อปลดล็อก)
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInspectSticker(null)}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-sm rounded-xl sketch-btn cursor-pointer shadow-[3px_3px_0px_#18181b]"
            >
              เข้าใจแล้ว ปิดหน้าต่าง ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
