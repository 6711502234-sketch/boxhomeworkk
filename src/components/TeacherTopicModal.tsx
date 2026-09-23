import React, { useState, useEffect } from 'react';
import { TeacherReflectionTopic, UserProfile } from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import { X, MessageSquare, Pin, Send, Sparkles } from 'lucide-react';

interface TeacherTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveTopic: (topic: TeacherReflectionTopic) => void;
  initialTopic?: TeacherReflectionTopic | null;
}

export const TeacherTopicModal: React.FC<TeacherTopicModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveTopic,
  initialTopic,
}) => {
  const [title, setTitle] = useState('');
  const [promptQuestion, setPromptQuestion] = useState('');
  const [targetClass, setTargetClass] = useState('ทุกห้อง');
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    if (initialTopic) {
      setTitle(initialTopic.title);
      setPromptQuestion(initialTopic.promptQuestion);
      setTargetClass(initialTopic.targetClass || 'ทุกห้อง');
      setPinned(initialTopic.pinned ?? false);
    } else {
      setTitle('');
      setPromptQuestion('');
      setTargetClass('ทุกห้อง');
      setPinned(true);
    }
  }, [initialTopic, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptQuestion.trim()) return;

    const topic: TeacherReflectionTopic = {
      id: initialTopic ? initialTopic.id : 'topic-' + Date.now(),
      title: title.trim(),
      promptQuestion: promptQuestion.trim(),
      targetClass,
      authorTeacher: currentUser.name || 'คุณครูผู้สอน',
      teacherAvatar: currentUser.avatar || 'teacher-female-glasses',
      createdAt: initialTopic
        ? initialTopic.createdAt
        : new Date().toLocaleString('th-TH', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
      pinned,
    };

    onSaveTopic(topic);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white sketch-border-lg rounded-[26px_18px_24px_20px] p-6 md:p-8 max-w-xl w-full relative shadow-[8px_8px_0px_#18181b] max-h-[92vh] overflow-y-auto">
        {/* Washi Tape */}
        <div className="washi-tape -top-3.5 left-1/2 -translate-x-1/2 bg-purple-200 rotate-[-1deg]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-300 cursor-pointer shadow-[1px_1px_0px_#000]"
          title="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b-2 border-zinc-200">
          <div className="w-12 h-12 rounded-xl bg-purple-200 border-2 border-zinc-900 flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000]">
            ✍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-zinc-900">
                {initialTopic ? 'แก้ไขโพสต์หัวข้อสะท้อนคิด' : 'โพสต์หัวข้อสะท้อนคิดชวนคุย'}
              </h3>
              <span className="bg-purple-200 text-purple-950 font-black text-[10px] px-2.5 py-0.5 rounded-full border border-zinc-900">
                คุณครู
              </span>
            </div>
            <p className="text-xs font-semibold text-zinc-600 mt-0.5">
              เขียนคำถามหรือประเด็นชวนคุยประจำคาบ เพื่อให้นักเรียนเข้ามาแสดงความคิดเห็นและให้ข้อเสนอแนะ
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Quick presets */}
          <div>
            <label className="block text-[11px] font-black text-zinc-600 mb-1">
              💡 ข้อความตัวอย่างด่วน (คลิกเพื่อเลือกใช้):
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTitle('ชวนคุยหลังคาบเรียน: ความรู้สึกและสิ่งที่ได้เรียนรู้วันนี้');
                  setPromptQuestion(
                    'นักเรียนคิดเห็นอย่างไรกับกิจกรรมในคาบเรียนวันนี้? ชอบช่วงไหนมากที่สุด และมีเรื่องไหนที่อยากให้ครูอธิบายซ้ำไหมจ๊ะ?'
                  );
                }}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-purple-100 text-zinc-800 text-[11px] font-bold rounded-lg border border-zinc-300 cursor-pointer transition-colors"
              >
                📝 สะท้อนคิดหลังคาบ
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('สำรวจความเข้าใจและข้อสงสัยก่อนสอบเก็บคะแนน');
                  setPromptQuestion(
                    'ก่อนจะถึงการสอบเก็บคะแนนในสัปดาห์หน้า มีเนื้อหาหรือหัวข้อไหนที่รู้สึกว่ายังยาก หรืออยากให้ติวทบทวนเพิ่มไหม?'
                  );
                }}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-purple-100 text-zinc-800 text-[11px] font-bold rounded-lg border border-zinc-300 cursor-pointer transition-colors"
              >
                🎯 ทบทวนก่อนสอบ
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('แชร์ไอเดีย: อยากให้จัดกิจกรรมกลุ่มหรือเกมแบบไหนในวิชานี้?');
                  setPromptQuestion(
                    'อยากฟังความคิดสร้างสรรค์จากทุกคน! อยากให้คาบถัดไปมีเกม กิจกรรมทดลอง หรือใช้สื่อแบบไหนในการเรียนรู้บ้าง ลองแชร์มาได้เลยนะ!'
                  );
                }}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-purple-100 text-zinc-800 text-[11px] font-bold rounded-lg border border-zinc-300 cursor-pointer transition-colors"
              >
                💡 ไอเดียกิจกรรม
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-black text-zinc-800 mb-1 flex items-center justify-between">
              <span>หัวข้อโพสต์ / ประเด็นหลัก <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-semibold text-zinc-500">สั้น กระชับ ชัดเจน</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ชวนคุยหลังการทดลองฟิสิกส์: ชอบช่วงไหนที่สุด?"
              className="w-full bg-[#FFFDF5] p-3 rounded-xl sketch-input text-xs md:text-sm font-bold text-zinc-900"
            />
          </div>

          {/* Prompt / Discussion Question */}
          <div>
            <label className="block text-xs font-black text-zinc-800 mb-1 flex items-center justify-between">
              <span>ข้อความคำถาม / ประเด็นชวนสะท้อนคิด <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-semibold text-purple-700">จะแสดงให้นักเรียนเห็นและตอบ</span>
            </label>
            <textarea
              rows={4}
              required
              value={promptQuestion}
              onChange={(e) => setPromptQuestion(e.target.value)}
              placeholder="เช่น ในคาบเรียนนี้ นักเรียนชอบกิจกรรมช่วงไหนมากที่สุด มีจุดไหนที่ยังสงสัยหรืออยากให้ครูอธิบายเพิ่มไหมจ๊ะ? มาร่วมแชร์ความคิดเห็นกันได้เลยนะ!"
              className="w-full bg-[#FFFDF5] p-3 rounded-xl sketch-input text-xs md:text-sm font-semibold text-zinc-900 resize-y"
            />
          </div>

          {/* Target Classroom & Pin Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-zinc-50 rounded-xl border-2 border-zinc-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-black text-zinc-800">
                  ห้องเรียนเป้าหมาย (ระบุเลขได้):
                </label>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                  ระบุเลข 1, 2, 3...
                </span>
              </div>
              <input
                type="text"
                list="topic-targetclass-list"
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                placeholder="เช่น ทุกห้อง, ห้อง 1, 1, 2, 3..."
                className="w-full bg-white p-2.5 rounded-lg border-2 border-zinc-900 text-xs font-bold text-zinc-800 shadow-[1.5px_1.5px_0px_#000]"
              />
              <datalist id="topic-targetclass-list">
                <option value="ทุกห้อง" />
                <option value="ห้อง 1" />
                <option value="ห้อง 2" />
                <option value="ห้อง 3" />
                <option value="ห้อง 4" />
                <option value="ห้อง 5" />
                <option value="ห้อง 6" />
              </datalist>

              {/* Quick Number Pills */}
              <div className="flex items-center gap-1 mt-1.5 overflow-x-auto pb-0.5">
                {['ทุกห้อง', '1', '2', '3', '4', '5'].map((n) => {
                  const val = n === 'ทุกห้อง' ? 'ทุกห้อง' : `ห้อง ${n}`;
                  const isSel = targetClass === val || targetClass === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTargetClass(val)}
                      className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all cursor-pointer shrink-0 ${
                        isSel
                          ? 'bg-purple-600 text-white border-purple-700'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:bg-purple-50'
                      }`}
                    >
                      {n === 'ทุกห้อง' ? 'ทุกห้อง' : `เลข ${n}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer mt-4 sm:mt-2">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-zinc-900 text-purple-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-black text-zinc-900 flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-rose-500 fill-rose-400" />
                  <span>ปักหมุดไว้บนสุด (Featured)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Live Preview Card */}
          {title && promptQuestion && (
            <div className="p-3.5 bg-purple-50/70 rounded-xl border-2 border-dashed border-purple-300 space-y-2">
              <div className="text-[11px] font-black text-purple-900 flex items-center gap-1">
                <span>👁️ ตัวอย่างการแสดงผลให้นักเรียนเห็น:</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm space-y-1">
                <div className="flex items-center gap-2">
                  <AvatarDisplay avatar={currentUser.avatar} className="w-6 h-6" />
                  <span className="text-xs font-black text-zinc-900">{currentUser.name}</span>
                  {pinned && (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded border border-rose-300">
                      📌 ปักหมุด
                    </span>
                  )}
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded border border-purple-300">
                    {targetClass}
                  </span>
                </div>
                <h4 className="text-xs font-black text-purple-950 mt-1">{title}</h4>
                <p className="text-xs font-semibold text-zinc-700 leading-relaxed italic">
                  "{promptQuestion}"
                </p>
              </div>
            </div>
          )}

          {/* Submit and Cancel Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs md:text-sm font-bold rounded-xl border border-zinc-300 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-400 hover:bg-purple-500 text-zinc-950 text-xs md:text-sm font-black rounded-xl sketch-btn flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#18181b]"
            >
              <Send className="w-4 h-4" />
              <span>{initialTopic ? 'บันทึกการแก้ไข' : 'โพสต์หัวข้อให้นักเรียนตอบ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
