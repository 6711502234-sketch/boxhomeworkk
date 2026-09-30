import React, { useState, useEffect } from 'react';
import { QuizLesson, QuizQuestion } from '../types';
import {
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  CheckCircle,
  X,
  BookOpen,
  Calendar,
  Clock,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  Wand2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

interface QuizEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: QuizLesson) => void;
  onDelete?: (lessonId: string) => void;
  initialQuiz?: QuizLesson | null;
  authorName?: string;
}

const DEFAULT_SUBJECTS = [
  'วิทยาศาสตร์',
  'ฟิสิกส์',
  'เคมี',
  'ชีววิทยา',
  'คณิตศาสตร์',
  'ภาษาไทย',
  'ภาษาอังกฤษ',
  'เทคโนโลยี/วิทยาการคำนวณ',
  'สังคมศึกษา',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะและการออกแบบ'
];

const EMOJI_OPTIONS = [
  '⚡', '⚙️', '🧪', '🔬', '🔭', '🧲', '💡', '🌍', '💻', '📐', '📝', '🚀', '🤖', '🌿', '🔋', '☀️', '🧬', '🛰️'
];

const SAMPLE_QUESTION_TEMPLATES: Omit<QuizQuestion, 'id'>[] = [
  {
    question: 'ระบบเซลล์แสงอาทิตย์ (Solar Cell) เปลี่ยนพลังงานแสงอาทิตย์เป็นพลังงานชนิดใด?',
    options: [
      'พลังงานไฟฟ้า (Electrical Energy)',
      'พลังงานความร้อนอย่างเดียว',
      'พลังงานจลน์ (Kinetic Energy)',
      'พลังงานนิวเคลียร์'
    ],
    correctIndex: 0,
    explanation: 'เซลล์แสงอาทิตย์ผลิตจากสารกึ่งตัวนำซิลิคอน ทำหน้าที่เปลี่ยนพลังงานโฟตอนจากแสงแดดเป็นกระแสไฟฟ้าโดยตรงผ่านปรากฏการณ์ Photoelectric Effect',
    tip: 'จำง่ายๆ ว่า Solar Cell = แสงกลายเป็นไฟฟ้าโดยตรง'
  },
  {
    question: 'ข้อใดเป็นตัวอย่างของแหล่งพลังงานหมุนเวียน (Renewable Energy) ทั้งหมด?',
    options: [
      'ถ่านหิน น้ำมัน ก๊าซธรรมชาติ',
      'พลังงานลม พลังงานแสงอาทิตย์ พลังงานน้ำ',
      'ยูเรเนียม ก๊าซชีวภาพ หินน้ำมัน',
      'ดีเซล ชีวมวล ถ่านหิน'
    ],
    correctIndex: 1,
    explanation: 'พลังงานลม แสงอาทิตย์ และพลังงานน้ำ เป็นพลังงานหมุนเวียนที่ใช้แล้วไม่หมดไปและเป็นมิตรกับสิ่งแวดล้อม',
    tip: 'พลังงานหมุนเวียนคือ พลังงานที่ธรรมชาติสร้างทดแทนได้ตลอดเวลา'
  },
  {
    question: 'เมื่อวัตถุเคลื่อนที่ด้วยความเร็วคงที่ ผลรวมของแรงลัพธ์ (ΣF) ที่กระทำต่อวัตถุมีค่าเท่าใด?',
    options: [
      'มากกว่าศูนย์เสมอ',
      'เท่ากับศูนย์ (0 N)',
      'ขึ้นอยู่กับมวลของวัตถุ',
      'เท่ากับแรงเสียดทานคูณมวล'
    ],
    correctIndex: 1,
    explanation: 'ตามกฎการเคลื่อนที่ข้อที่ 1 ของนิวตัน (ΣF = 0) วัตถุจะรักษาสภาพหยุดนิ่งหรือเคลื่อนที่ด้วยความเร็วคงที่ในแนวเส้นตรง',
    tip: 'ความเร็วคงที่ = ความเร่งเป็นศูนย์ = แรงลัพธ์เป็นศูนย์'
  }
];

export const QuizEditorModal: React.FC<QuizEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialQuiz,
  authorName = 'คุณครู'
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('วิทยาศาสตร์');
  const [targetClass, setTargetClass] = useState('ทุกห้อง');
  const [subtitle, setSubtitle] = useState('');
  const [icon, setIcon] = useState('🧪');
  const [dueDate, setDueDate] = useState('');
  const [timeLimit, setTimeLimit] = useState('ไม่จำกัดเวลา');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialQuiz) {
      setTitle(initialQuiz.title || '');
      setSubject(initialQuiz.subject || 'วิทยาศาสตร์');
      setTargetClass(initialQuiz.targetClass || 'ทุกห้อง');
      setSubtitle(initialQuiz.subtitle || '');
      setIcon(initialQuiz.icon || '🧪');
      setDueDate(initialQuiz.dueDate || '20 ก.ย. 2569');
      setTimeLimit(initialQuiz.timeLimitMinutes ? `${initialQuiz.timeLimitMinutes} นาที` : 'ไม่จำกัดเวลา');
      setQuestions(
        initialQuiz.questions && initialQuiz.questions.length > 0
          ? JSON.parse(JSON.stringify(initialQuiz.questions))
          : [
              {
                id: 1,
                question: '',
                options: ['', '', '', ''],
                correctIndex: 0,
                explanation: '',
                tip: ''
              }
            ]
      );
    } else {
      // New Quiz Default
      setTitle('');
      setSubject('วิทยาศาสตร์');
      setTargetClass('ทุกห้อง');
      setSubtitle('แบบทดสอบปรนัย 4 ตัวเลือก ตรวจคำตอบอัตโนมัติพร้อมเฉลยละเอียด');
      setIcon('🧪');
      setDueDate('20 ก.ย. 2569');
      setTimeLimit('ไม่จำกัดเวลา');
      setQuestions([
        {
          id: 1,
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          explanation: '',
          tip: ''
        }
      ]);
    }
    setErrorMsg('');
  }, [initialQuiz, isOpen]);

  if (!isOpen) return null;

  // Add a blank question
  const handleAddQuestion = () => {
    const nextId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
    setQuestions((prev) => [
      ...prev,
      {
        id: nextId,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        tip: ''
      }
    ]);
  };

  // Add random sample question from template
  const handleAddSampleQuestion = () => {
    const randomTemplate = SAMPLE_QUESTION_TEMPLATES[Math.floor(Math.random() * SAMPLE_QUESTION_TEMPLATES.length)];
    const nextId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
    setQuestions((prev) => [
      ...prev,
      {
        id: nextId,
        question: randomTemplate.question,
        options: [...randomTemplate.options],
        correctIndex: randomTemplate.correctIndex,
        explanation: randomTemplate.explanation,
        tip: randomTemplate.tip || ''
      }
    ]);
  };

  // Remove question
  const handleRemoveQuestion = (idxToRemove: number) => {
    if (questions.length <= 1) {
      alert('ชุดข้อสอบต้องมีอย่างน้อย 1 ข้อ');
      return;
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Move question up/down
  const handleMoveQuestion = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Update question field
  const handleUpdateQuestionText = (idx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], question: text };
      return copy;
    });
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const newOpts = [...copy[qIdx].options];
      newOpts[optIdx] = text;
      copy[qIdx] = { ...copy[qIdx], options: newOpts };
      return copy;
    });
  };

  const handleAddOption = (qIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const currentOpts = copy[qIdx].options || [];
      if (currentOpts.length >= 8) {
        alert('สามารถเพิ่มตัวเลือกได้สูงสุด 8 ตัวเลือก');
        return copy;
      }
      const newOpts = [...currentOpts, ''];
      const newOptionImages = copy[qIdx].optionImages ? [...copy[qIdx].optionImages] : [];
      while (newOptionImages.length < newOpts.length) {
        newOptionImages.push(undefined);
      }
      copy[qIdx] = {
        ...copy[qIdx],
        options: newOpts,
        optionImages: newOptionImages,
      };
      return copy;
    });
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const currentOpts = copy[qIdx].options || [];
      if (currentOpts.length <= 2) {
        alert('คำถามต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก');
        return copy;
      }
      const newOpts = currentOpts.filter((_, idx) => idx !== optIdx);
      const newOptionImages = copy[qIdx].optionImages
        ? copy[qIdx].optionImages.filter((_, idx) => idx !== optIdx)
        : [];
      let newCorrectIndex = copy[qIdx].correctIndex;
      if (newCorrectIndex === optIdx) {
        newCorrectIndex = 0;
      } else if (newCorrectIndex > optIdx) {
        newCorrectIndex -= 1;
      }
      copy[qIdx] = {
        ...copy[qIdx],
        options: newOpts,
        optionImages: newOptionImages,
        correctIndex: newCorrectIndex,
      };
      return copy;
    });
  };

  const handleUpdateOptionImage = (qIdx: number, optIdx: number, imageUrl: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const newOptionImages = copy[qIdx].optionImages
        ? [...copy[qIdx].optionImages]
        : new Array(copy[qIdx].options.length).fill(undefined);
      while (newOptionImages.length < copy[qIdx].options.length) {
        newOptionImages.push(undefined);
      }
      newOptionImages[optIdx] = imageUrl ? imageUrl.trim() : undefined;
      copy[qIdx] = { ...copy[qIdx], optionImages: newOptionImages };
      return copy;
    });
  };

  const handleUploadOptionImage = (qIdx: number, optIdx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleUpdateOptionImage(qIdx, optIdx, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSetCorrectChoice = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], correctIndex: optIdx };
      return copy;
    });
  };

  const handleUpdateExplanation = (qIdx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], explanation: text };
      return copy;
    });
  };

  const handleUpdateTip = (qIdx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], tip: text };
      return copy;
    });
  };

  const handleUpdateQuestionImage = (idx: number, imageUrl: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], imageUrl: imageUrl || undefined };
      return copy;
    });
  };

  const handleUploadQuestionImage = (idx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleUpdateQuestionImage(idx, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('กรุณาระบุชื่อชุดแบบทดสอบ');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setErrorMsg(`กรุณากรอกโจทย์คำถามในข้อที่ ${i + 1}`);
        return;
      }
      if (!q.options || q.options.length < 2) {
        setErrorMsg(`ข้อที่ ${i + 1} ต้องมีตัวเลือกอย่างน้อย 2 ข้อ`);
        return;
      }
      for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
        const text = q.options[optIdx]?.trim();
        const hasImg = !!q.optionImages?.[optIdx];
        if (!text && !hasImg) {
          setErrorMsg(`กรุณากรอกข้อความหรือใส่รูปภาพในตัวเลือกที่ ${String.fromCharCode(65 + optIdx)} ในข้อที่ ${i + 1}`);
          return;
        }
      }
      if (q.correctIndex >= q.options.length) {
        q.correctIndex = 0;
      }
    }

    const lessonPayload: QuizLesson = {
      id: initialQuiz ? initialQuiz.id : 'quiz-' + Date.now(),
      title: title.trim(),
      subtitle: subtitle.trim() || 'แบบทดสอบปรนัยพร้อมเฉลยและบทวิเคราะห์',
      subject,
      targetClass,
      authorTeacher: authorName,
      createdAt: initialQuiz?.createdAt || new Date().toLocaleDateString('th-TH'),
      dueDate: dueDate.trim() || '20 ก.ย. 2569',
      icon: icon || '🧪',
      badgeColor: 'bg-amber-100',
      questions: questions.map((q, idx) => ({
        ...q,
        id: idx + 1,
        options: q.options.map((opt, optI) => opt.trim() || (q.optionImages?.[optI] ? `[รูปภาพตัวเลือก ${String.fromCharCode(65 + optI)}]` : `ตัวเลือก ${String.fromCharCode(65 + optI)}`)),
        optionImages: q.optionImages && q.optionImages.some(Boolean) ? q.optionImages : undefined,
        explanation: q.explanation.trim() || 'คำตอบที่ถูกต้องตามหลักวิชาการ',
        tip: q.tip?.trim() || ''
      })),
      bestScore: initialQuiz?.bestScore,
      lastAttemptAt: initialQuiz?.lastAttemptAt
    };

    onSave(lessonPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] sketch-border rounded-[24px_16px_22px_18px] p-5 sm:p-7 max-w-4xl w-full shadow-[8px_8px_0px_#18181b] space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[14px_10px_16px_12px] bg-amber-200 border-2 border-zinc-900 flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000]">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-zinc-900">
                  {initialQuiz ? '✏️ แก้ไขชุดแบบทดสอบ' : '➕ สร้างแบบทดสอบใหม่'}
                </h3>
                <span className="bg-amber-200 text-amber-950 font-medium text-[10px] px-2 py-0.5 rounded-full border border-amber-400">
                  คุณครู
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-600 mt-0.5">
                กำหนดคำถาม ตัวเลือก เฉลย และคำอธิบาย เพื่อโพสต์ให้นักเรียนทำในระบบได้ทันที
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 rounded-full border border-zinc-300 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 text-zinc-700" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-100 text-rose-900 border-2 border-rose-400 rounded-xl text-xs font-black flex items-center gap-2">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: QUIZ BASIC INFO */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b] space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-zinc-800 border-b pb-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>1. ข้อมูลทั่วไปของชุดข้อสอบ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quiz Title */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-black text-zinc-800">
                  ชื่อชุดแบบทดสอบ / ชื่อบทเรียน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น บทที่ 3: ระบบพลังงานทดแทนและสิ่งแวดล้อม"
                  className="w-full px-3 py-2 bg-zinc-50 rounded-xl border-2 border-zinc-900 text-xs md:text-sm font-bold focus:bg-white"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-800">กลุ่มสาระวิชา</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 rounded-xl border-2 border-zinc-900 text-xs font-bold"
                >
                  {DEFAULT_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Class */}
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-800">ห้องเรียนเป้าหมาย</label>
                <input
                  type="text"
                  list="quiz-targetclass-list"
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  placeholder="เช่น ทุกห้อง, ห้อง 1, ห้อง 2"
                  className="w-full px-3 py-2 bg-zinc-50 rounded-xl border-2 border-zinc-900 text-xs md:text-sm font-bold focus:bg-white"
                />
                <datalist id="quiz-targetclass-list">
                  <option value="ทุกห้อง" />
                  <option value="ห้อง 1" />
                  <option value="ห้อง 2" />
                  <option value="ห้อง 3" />
                  <option value="ห้อง 4" />
                </datalist>
              </div>

              {/* Subtitle / Instructions */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-black text-zinc-800">คำอธิบาย / คำชี้แจงสำหรับนักเรียน</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="เช่น ข้อสอบ 4 ตัวเลือก มีคำอธิบายและเฉลยเมื่อทำเสร็จสมบูรณ์"
                  className="w-full px-3 py-2 bg-zinc-50 rounded-xl border-2 border-zinc-900 text-xs font-semibold focus:bg-white"
                />
              </div>

              {/* Icon Picker */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-zinc-800">
                  เลือกไอคอนสัญลักษณ์ประจำชุดข้อสอบ:
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`w-9 h-9 rounded-xl border-2 text-lg flex items-center justify-center cursor-pointer transition-all ${
                        icon === em
                          ? 'bg-amber-300 border-zinc-900 scale-110 shadow-[2px_2px_0px_#000]'
                          : 'bg-white border-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date & Time Limit */}
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-800">กำหนดส่ง / วันที่ปิดรับ</label>
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="เช่น 25 ก.ย. 2569"
                  className="w-full px-3 py-2 bg-zinc-50 rounded-xl border-2 border-zinc-900 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-800">เวลาในการทำข้อสอบ</label>
                <input
                  type="text"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="เช่น ไม่จำกัดเวลา หรือ 20 นาที"
                  className="w-full px-3 py-2 bg-zinc-50 rounded-xl border-2 border-zinc-900 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: QUESTIONS BUILDER */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
              <div className="flex items-center gap-2 text-xs font-black text-zinc-800">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>2. รายการข้อคำถาม & เฉลย ({questions.length} ข้อ)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSampleQuestion}
                  className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-black rounded-xl border border-purple-400 flex items-center gap-1 cursor-pointer"
                  title="สุ่มข้อสอบตัวอย่างเพื่อทดสอบระบบอย่างรวดเร็ว"
                >
                  <Wand2 className="w-3.5 h-3.5 text-purple-700" />
                  <span>สุ่มข้อสอบตัวอย่าง ✨</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 bg-amber-300 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl border-2 border-zinc-900 flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_#000]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มข้อคำถาม</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div
                  key={q.id || qIdx}
                  className="p-4 rounded-2xl bg-[#FFFDF5] border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b] space-y-3 relative"
                >
                  {/* Question header toolbar */}
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-300 border-2 border-zinc-900 font-black text-xs flex items-center justify-center">
                        {qIdx + 1}
                      </span>
                      <span className="text-xs font-black text-zinc-800">
                        ข้อที่ {qIdx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-zinc-500">
                        (ข้อละ 10 ดาว)
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={qIdx === 0}
                        onClick={() => handleMoveQuestion(qIdx, 'up')}
                        className="p-1 hover:bg-zinc-200 disabled:opacity-30 rounded border border-zinc-300 cursor-pointer"
                        title="เลื่อนขึ้น"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-700" />
                      </button>
                      <button
                        type="button"
                        disabled={qIdx === questions.length - 1}
                        onClick={() => handleMoveQuestion(qIdx, 'down')}
                        className="p-1 hover:bg-zinc-200 disabled:opacity-30 rounded border border-zinc-300 cursor-pointer"
                        title="เลื่อนลง"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-700" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="p-1 hover:bg-rose-100 text-rose-700 rounded border border-rose-300 cursor-pointer ml-1"
                        title="ลบข้อนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">
                      โจทย์คำถาม: <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={q.question}
                      onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                      placeholder={`พิมพ์โจทย์ข้อที่ ${qIdx + 1}...`}
                      className="w-full px-3 py-2 bg-white rounded-xl border-2 border-zinc-400 focus:border-zinc-900 text-xs font-bold"
                    />
                  </div>

                  {/* Question Image Attachment (ครูสามารถเพิ่มรูปภาพในแบบทดสอบได้) */}
                  <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-zinc-300">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                        <span>รูปภาพประกอบคำถาม (JPG / PNG):</span>
                      </label>
                      {q.imageUrl && (
                        <button
                          type="button"
                          onClick={() => handleUpdateQuestionImage(qIdx, '')}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" /> ลบรูปภาพ
                        </button>
                      )}
                    </div>

                    {q.imageUrl ? (
                      <div className="relative group max-w-sm rounded-lg overflow-hidden border border-zinc-300 bg-zinc-50 p-1.5 mx-auto">
                        <img
                          src={q.imageUrl}
                          alt={`ภาพประกอบข้อ ${qIdx + 1}`}
                          className="max-h-48 w-auto rounded mx-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg border border-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>เลือกรูปภาพ (JPG, PNG)...</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUploadQuestionImage(qIdx, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        <span className="text-[11px] text-zinc-400">หรือระบุ URL รูป:</span>
                        <input
                          type="url"
                          placeholder="https://example.com/image.png"
                          className="flex-1 min-w-[140px] px-2.5 py-1 text-xs bg-zinc-50 rounded-lg border border-zinc-300 font-normal"
                          onBlur={(e) => {
                            if (e.target.value.trim()) handleUpdateQuestionImage(qIdx, e.target.value.trim());
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleUpdateQuestionImage(qIdx, (e.target as HTMLInputElement).value.trim());
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Choices Section (ครูสามารถเพิ่มช้อยส์คำตอบ และเพิ่มรูปในช้อยส์ได้) */}
                  <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <label className="text-xs font-black text-zinc-800 flex items-center gap-1.5">
                        <span>ตัวเลือกคำตอบ ({q.options.length} ข้อ):</span>
                        <span className="text-[11px] font-semibold text-zinc-500">
                          (คลิกปุ่มวงกลม A, B, C... เพื่อตั้งเป็นเฉลย)
                        </span>
                      </label>

                      {/* Add Choice Button */}
                      {q.options.length < 8 && (
                        <button
                          type="button"
                          onClick={() => handleAddOption(qIdx)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-lg border border-zinc-900 shadow-[1px_1px_0px_#000] flex items-center gap-1 cursor-pointer self-start sm:self-auto transition-transform active:translate-y-0.5"
                          title="เพิ่มตัวเลือกคำตอบใหม่ในข้อนี้"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ เพิ่มตัวเลือก ({String.fromCharCode(65 + q.options.length)})</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isCorrect = q.correctIndex === optIdx;
                        const optionImg = q.optionImages?.[optIdx];

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col justify-between space-y-2 ${
                              isCorrect
                                ? 'bg-emerald-50/90 border-emerald-600 shadow-[2px_2px_0px_#059669]'
                                : 'bg-white border-zinc-300'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {/* Choice Radio / Correct Answer Button */}
                              <button
                                type="button"
                                onClick={() => handleSetCorrectChoice(qIdx, optIdx)}
                                className={`w-7 h-7 rounded-full border-2 text-xs font-black shrink-0 mt-0.5 flex items-center justify-center cursor-pointer transition-transform ${
                                  isCorrect
                                    ? 'bg-emerald-500 text-white border-zinc-900 scale-105 shadow-xs'
                                    : 'bg-zinc-100 text-zinc-700 border-zinc-400 hover:bg-emerald-100'
                                }`}
                                title={isCorrect ? 'ข้อนี้เป็นคำตอบที่ถูกต้อง (เฉลย)' : 'คลิกเพื่อตั้งข้อนี้เป็นเฉลย'}
                              >
                                {isCorrect ? '✓' : letter}
                              </button>

                              {/* Choice Text Input */}
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                  placeholder={`พิมพ์ข้อความตัวเลือก ${letter}...`}
                                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                                    isCorrect
                                      ? 'bg-white border-emerald-500 font-black text-emerald-950'
                                      : 'bg-zinc-50 border-zinc-300'
                                  }`}
                                />
                              </div>

                              {/* Delete Choice Button (If > 2 choices) */}
                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(qIdx, optIdx)}
                                  className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-300 cursor-pointer shrink-0"
                                  title={`ลบตัวเลือก ${letter}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Choice Image Section (ครูสามารถเพิ่มรูปในช้อยคำตอบได้) */}
                            <div className="pt-1 border-t border-dashed border-zinc-200">
                              {optionImg ? (
                                <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-lg border border-zinc-200">
                                  <img
                                    src={optionImg}
                                    alt={`รูปช้อยส์ ${letter}`}
                                    className="w-12 h-12 object-contain bg-white rounded border border-zinc-300 shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[11px] font-bold text-zinc-700 block truncate">
                                      รูปภาพตัวเลือก {letter}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateOptionImage(qIdx, optIdx, '')}
                                      className="text-[10px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer mt-0.5"
                                    >
                                      <X className="w-3 h-3" /> ลบรูปตัวเลือกนี้
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <label className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-md border border-sky-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors">
                                    <Upload className="w-3 h-3" />
                                    <span>+ รูปในช้อยส์ {letter}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          handleUploadOptionImage(qIdx, optIdx, e.target.files[0]);
                                        }
                                      }}
                                    />
                                  </label>

                                  <input
                                    type="url"
                                    placeholder="หรือวาง URL รูป..."
                                    className="flex-1 min-w-[100px] text-[10px] px-2 py-0.5 bg-zinc-50 rounded border border-zinc-300"
                                    onBlur={(e) => {
                                      if (e.target.value.trim()) {
                                        handleUpdateOptionImage(qIdx, optIdx, e.target.value.trim());
                                        e.target.value = '';
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = (e.target as HTMLInputElement).value.trim();
                                        if (val) {
                                          handleUpdateOptionImage(qIdx, optIdx, val);
                                          (e.target as HTMLInputElement).value = '';
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation & Tip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-emerald-900 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>คำอธิบายเฉลย / แนวคิดวิทยาศาสตร์:</span>
                      </label>
                      <textarea
                        rows={2}
                        value={q.explanation}
                        onChange={(e) => handleUpdateExplanation(qIdx, e.target.value)}
                        placeholder="อธิบายเหตุผลว่าทำไมข้อนี้ถึงถูกต้อง..."
                        className="w-full px-2.5 py-1.5 bg-emerald-50/50 rounded-xl border border-emerald-400 text-xs font-semibold focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-sky-900 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-sky-500" />
                        <span>ทริกช่วยจำ / คำใบ้ (ไม่บังคับ):</span>
                      </label>
                      <textarea
                        rows={2}
                        value={q.tip || ''}
                        onChange={(e) => handleUpdateTip(qIdx, e.target.value)}
                        placeholder="เทคนิคจำง่ายๆ สำหรับนักเรียน..."
                        className="w-full px-2.5 py-1.5 bg-sky-50/50 rounded-xl border border-sky-400 text-xs font-semibold focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Add Question Button */}
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-zinc-950 font-black text-xs rounded-xl border-2 border-dashed border-zinc-900 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มข้อคำถามข้อต่อไป</span>
            </button>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t-2 border-zinc-900">
            {initialQuiz && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(initialQuiz.id);
                }}
                className="mr-auto w-full sm:w-auto px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-xl border border-rose-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_#000]"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>ลบชุดข้อสอบนี้</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-400 cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs md:text-sm rounded-xl sketch-btn flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#18181b]"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{initialQuiz ? '💾 บันทึกการแก้ไข' : '🚀 โพสต์ข้อสอบให้นักเรียนทำทันที'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
