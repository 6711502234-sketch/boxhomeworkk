import React from 'react';
import { Sparkles, Star, Award, X } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  starAmount?: number;
  icon?: string;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  starAmount,
  icon = '🎉',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] sketch-border-lg rounded-[26px_18px_24px_20px] p-6 md:p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200 text-center">
        <div className="washi-tape -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-300" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-rose-200 hover:bg-rose-300 border-2 border-zinc-900 flex items-center justify-center font-bold text-zinc-900 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto rounded-full bg-amber-300 border-3 border-zinc-900 flex items-center justify-center text-4xl shadow-[4px_4px_0px_#18181b] animate-bounce mb-3">
          {icon}
        </div>

        {starAmount && (
          <div className="inline-block bg-amber-100 text-amber-900 font-black text-xs px-3 py-1 rounded-full border border-amber-500 mb-2">
            ⭐ รับรางวัล +{starAmount} ดาวสะสม!
          </div>
        )}

        <h3 className="text-2xl font-black text-zinc-900 mb-2">
          {title}
        </h3>

        <p className="text-sm font-semibold text-zinc-600 mb-6 px-2">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-sm rounded-xl sketch-btn cursor-pointer shadow-[3px_3px_0px_#18181b]"
        >
          รับรางวัลและลุยต่อ 🚀
        </button>
      </div>
    </div>
  );
};
