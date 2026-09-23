import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  itemType?: string;
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'ยืนยันการลบโพสต์',
  itemName,
  itemType = 'โพสต์',
  description = 'เมื่อลบแล้ว รายการนี้และข้อมูลที่เกี่ยวข้องจะถูกนำออกจากระบบทันที ไม่สามารถกู้คืนได้',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white sketch-border rounded-[24px_16px_22px_18px] p-6 max-w-md w-full shadow-[8px_8px_0px_#18181b] space-y-4 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
          <div className="flex items-center gap-2 text-rose-600">
            <div className="p-2 bg-rose-100 rounded-xl border border-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-700" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 rounded-full border border-zinc-300 cursor-pointer"
            aria-label="ปิด"
          >
            <X className="w-5 h-5 text-zinc-700" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-zinc-800">
            คุณแน่ใจหรือไม่ว่าต้องการลบ{itemType}นี้?
          </p>

          {itemName && (
            <div className="p-3 bg-amber-50 rounded-xl border-2 border-dashed border-amber-400">
              <span className="text-xs font-semibold text-zinc-500 block mb-0.5">ชื่อรายการที่จะลบ:</span>
              <span className="text-sm font-black text-zinc-900 line-clamp-2">"{itemName}"</span>
            </div>
          )}

          <p className="text-xs font-semibold text-zinc-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
            ⚠️ {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-300 cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <Trash2 className="w-4 h-4" />
            <span>ยืนยันลบ{itemType}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
