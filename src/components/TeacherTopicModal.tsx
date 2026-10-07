import React, { useState, useEffect } from 'react';
import { TeacherReflectionTopic, UserProfile, AssessmentType } from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import { DoodleReflectionChat } from './DoodleIcons';
import { X, Pin, Send, Check } from 'lucide-react';

export const ASSESSMENT_OPTIONS: {
  type: AssessmentType;
  thaiSubtitle: string;
  description: string;
  defaultTitle: string;
  defaultPrompt: string;
  badgeClass: string;
  cardActiveClass: string;
}[] = [
  {
    type: 'Assessment as Learning',
    thaiSubtitle: 'การประเมินเพื่อพัฒนาการเรียนรู้ด้วยตนเอง',
    description: 'ให้นักเรียนทบทวน สะท้อนคิด และประเมินกระบวนการเรียนรู้ของตนเอง',
    defaultTitle: 'Assessment as Learning: สะท้อนคิดและประเมินการเรียนรู้ด้วยตนเอง',
    defaultPrompt:
      'วันนี้เราได้เรียนรู้อะไรใหม่บ้าง? นักเรียนคิดว่าตนเองเข้าใจเนื้อหามากน้อยแค่ไหน และมีวิธีพัฒนาการเรียนรู้ของตนเองอย่างไรในหัวข้อนี้?',
    badgeClass: 'bg-amber-200 text-amber-950 border-zinc-900',
    cardActiveClass: 'bg-amber-100 border-zinc-900 shadow-[3px_3px_0px_#18181b]',
  },
  {
    type: 'Assessment for Learning',
    thaiSubtitle: 'การประเมินเพื่อพัฒนาการเรียนรู้ระหว่างเรียน',
    description: 'สำรวจความเข้าใจและจุดที่ยังสงสัย เพื่อนำมาปรับการสอนและช่วยเหลือผู้เรียน',
    defaultTitle: 'Assessment for Learning: สำรวจความเข้าใจและข้อสงสัยระหว่างเรียน',
    defaultPrompt:
      'จากกิจกรรมและเนื้อหาในคาบเรียนนี้ มีจุดไหนที่นักเรียนยังสงสัย อยากให้ครูอธิบายเพิ่มเติม หรืออยากให้ปรับรูปแบบกิจกรรมอย่างไรบ้าง?',
    badgeClass: 'bg-sky-200 text-sky-950 border-zinc-900',
    cardActiveClass: 'bg-sky-100 border-zinc-900 shadow-[3px_3px_0px_#18181b]',
  },
  {
    type: 'Assessment of Learning',
    thaiSubtitle: 'การประเมินเพื่อสรุปผลการเรียนรู้',
    description: 'สรุปองค์ความรู้รวบยอดและการนำความรู้ไปประยุกต์ใช้หลังจบหน่วยการเรียนรู้',
    defaultTitle: 'Assessment of Learning: สรุปองค์ความรู้และการนำไปประยุกต์ใช้',
    defaultPrompt:
      'สรุปใจความสำคัญที่ได้จากบทเรียนนี้คืออะไร และนักเรียนสามารถนำความรู้นี้ไปประยุกต์ใช้ในชีวิตประจำวันหรือชิ้นงานได้อย่างไรบ้าง?',
    badgeClass: 'bg-emerald-200 text-emerald-950 border-zinc-900',
    cardActiveClass: 'bg-emerald-100 border-zinc-900 shadow-[3px_3px_0px_#18181b]',
  },
];

interface TeacherTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveTopic: (topic: TeacherReflectionTopic) => void;
  initialTopic?: TeacherReflectionTopic | null;
  initialAssessmentType?: AssessmentType;
}

export const TeacherTopicModal: React.FC<TeacherTopicModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveTopic,
  initialTopic,
  initialAssessmentType = 'Assessment as Learning',
}) => {
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('Assessment as Learning');
  const [title, setTitle] = useState('');
  const [promptQuestion, setPromptQuestion] = useState('');
  const [targetClass, setTargetClass] = useState('ทุกห้อง');
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    if (initialTopic) {
      setAssessmentType(initialTopic.assessmentType || 'Assessment as Learning');
      setTitle(initialTopic.title);
      setPromptQuestion(initialTopic.promptQuestion);
      setTargetClass(initialTopic.targetClass || 'ทุกห้อง');
      setPinned(initialTopic.pinned ?? false);
    } else {
      const selectedOpt =
        ASSESSMENT_OPTIONS.find((o) => o.type === initialAssessmentType) ||
        ASSESSMENT_OPTIONS[0];
      setAssessmentType(selectedOpt.type);
      setTitle(selectedOpt.type);
      setPromptQuestion(selectedOpt.defaultPrompt);
      setTargetClass(
        currentUser.teachingClasses && currentUser.teachingClasses.length > 0
          ? currentUser.teachingClasses[0]
          : 'ทุกห้อง'
      );
      setPinned(true);
    }
  }, [initialTopic, initialAssessmentType, isOpen, currentUser.teachingClasses]);

  const handleSelectAssessmentType = (option: (typeof ASSESSMENT_OPTIONS)[number]) => {
    setAssessmentType(option.type);
    // Update title to the selected topic or replace previous default title
    const isDefaultOrEmpty =
      !title.trim() ||
      ASSESSMENT_OPTIONS.some(
        (o) => title.trim() === o.type || title.trim() === o.defaultTitle
      );
    if (isDefaultOrEmpty) {
      setTitle(option.type);
    }
    const isDefaultPromptOrEmpty =
      !promptQuestion.trim() ||
      ASSESSMENT_OPTIONS.some((o) => promptQuestion.trim() === o.defaultPrompt);
    if (isDefaultPromptOrEmpty) {
      setPromptQuestion(option.defaultPrompt);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptQuestion.trim()) return;

    const topic: TeacherReflectionTopic = {
      id: initialTopic ? initialTopic.id : 'topic-' + Date.now(),
      assessmentType,
      title: title.trim(),
      promptQuestion: promptQuestion.trim(),
      targetClass: targetClass.trim() || 'ทุกห้อง',
      authorTeacher: currentUser.name || 'คุณครู',
      teacherId: currentUser.id,
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
      <div className="bg-white sketch-border-lg rounded-[26px_18px_24px_20px] p-6 md:p-8 max-w-2xl w-full relative shadow-[8px_8px_0px_#18181b] max-h-[92vh] overflow-y-auto">
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
          <div className="w-12 h-12 rounded-xl bg-purple-200 border-2 border-zinc-900 flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <DoodleReflectionChat className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-zinc-900">
                {initialTopic ? 'แก้ไขโพสต์หัวข้อสะท้อนคิด' : 'โพสต์หัวข้อในมุมสะท้อน'}
              </h3>
              <span className="bg-purple-200 text-purple-950 font-black text-[10px] px-2.5 py-0.5 rounded-full border border-zinc-900">
                คุณครู
              </span>
            </div>
            <p className="text-xs font-semibold text-zinc-600 mt-0.5">
              เลือกหัวข้อการประเมิน (Assessment) และตั้งประเด็นคำถามเพื่อให้นักเรียนร่วมสะท้อนคิด
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* เลือกหัวข้อในการโพสต์: Assessment as / for / of Learning */}
          <div>
            <label className="block text-xs md:text-sm font-black text-zinc-900 mb-2">
              เลือกหัวข้อในการโพสต์ (ประเภทการประเมิน) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {ASSESSMENT_OPTIONS.map((opt) => {
                const isSelected = assessmentType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleSelectAssessmentType(opt)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? opt.cardActiveClass
                        : 'bg-zinc-50 border-zinc-300 hover:border-zinc-700 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs sm:text-sm font-black text-zinc-950 leading-tight">
                          {opt.type}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-zinc-700 mt-1">
                        {opt.thaiSubtitle}
                      </div>
                    </div>
                    <div className="text-[10px] font-medium text-zinc-500 mt-1.5 leading-snug">
                      {opt.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-black text-zinc-800 mb-1 flex items-center justify-between">
              <span>หัวข้อโพสต์ <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-semibold text-zinc-500">
                ปรับแต่งข้อความหัวข้อเพิ่มเติมได้
              </span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น Assessment as Learning"
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
              rows={3}
              required
              value={promptQuestion}
              onChange={(e) => setPromptQuestion(e.target.value)}
              placeholder="พิมพ์คำถามหรือประเด็นที่ต้องการให้นักเรียนสะท้อนคิด..."
              className="w-full bg-[#FFFDF5] p-3 rounded-xl sketch-input text-xs md:text-sm font-semibold text-zinc-900 resize-y"
            />
          </div>

          {/* Target Classroom & Pin Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-zinc-50 rounded-xl border-2 border-zinc-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-black text-zinc-800">
                  ห้องเรียนเป้าหมาย:
                </label>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                  เช่น ม.2/1, ทุกห้อง
                </span>
              </div>
              <input
                type="text"
                list="topic-targetclass-list"
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                placeholder="เช่น ทุกห้อง, ม.2/1, ห้อง 1..."
                className="w-full bg-white p-2.5 rounded-lg border-2 border-zinc-900 text-xs font-bold text-zinc-800 shadow-[1.5px_1.5px_0px_#000]"
              />
              <datalist id="topic-targetclass-list">
                <option value="ทุกห้อง" />
                {currentUser.teachingClasses?.map((cls) => (
                  <option key={cls} value={cls} />
                ))}
                <option value="ม.2/1" />
                <option value="ม.2/2" />
                <option value="ห้อง 1" />
                <option value="ห้อง 2" />
              </datalist>

              {/* Quick Classroom Pills */}
              <div className="flex items-center gap-1 mt-1.5 overflow-x-auto pb-0.5">
                {[
                  'ทุกห้อง',
                  ...(currentUser.teachingClasses && currentUser.teachingClasses.length > 0
                    ? currentUser.teachingClasses
                    : ['ม.2/1', 'ม.2/2']),
                ].map((val) => {
                  const isSel = targetClass === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTargetClass(val)}
                      className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all cursor-pointer shrink-0 ${
                        isSel
                          ? 'bg-purple-600 text-white border-purple-700'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:bg-purple-50'
                      }`}
                    >
                      {val}
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
                <span>ตัวอย่างการแสดงผลให้นักเรียนเห็น:</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <AvatarDisplay avatar={currentUser.avatar} className="w-6 h-6" />
                  <span className="text-xs font-black text-zinc-900">{currentUser.name}</span>
                  <span className="text-[10px] font-black bg-amber-200 text-stone-900 px-2 py-0.5 rounded-full border border-zinc-900">
                    {assessmentType}
                  </span>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded border border-purple-300">
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
