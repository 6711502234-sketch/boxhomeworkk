import React, { useState } from 'react';
import {
  UserProfile,
  StickerAchievement,
  QuizLesson,
  Homework,
  StudentRecord,
  AwardedBadgeItem
} from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import { triggerFestiveConfetti, triggerStarBurst } from '../utils/confetti';
import {
  Award,
  Lock,
  Sparkles,
  Star,
  CheckCircle2,
  BookOpen,
  Info,
  X,
  TrendingUp,
  CheckCircle,
  FileText,
  GraduationCap,
  Gift,
  PlusCircle,
  Users,
  Search,
  Check,
  Save,
  Table,
  LayoutGrid,
  Edit3
} from 'lucide-react';

import { GoogleSheetsIcon } from './GoogleSheetsModal';

interface ScorebookViewProps {
  currentUser: UserProfile;
  stickers: StickerAchievement[];
  quizLessons: QuizLesson[];
  homeworkList: Homework[];
  studentRecords: StudentRecord[];
  onAwardStickerToStudent: (
    studentId: string,
    stickerId: string,
    stickerName: string,
    thaiTitle: string,
    icon: string,
    bonusStars: number,
    note: string
  ) => void;
  onUpdateStudentRecord?: (updatedStudent: StudentRecord) => void;
  onOpenGoogleSheets?: () => void;
}

export const ScorebookView: React.FC<ScorebookViewProps> = ({
  currentUser,
  stickers,
  quizLessons,
  homeworkList,
  studentRecords,
  onAwardStickerToStudent,
  onUpdateStudentRecord,
  onOpenGoogleSheets,
}) => {
  const [inspectSticker, setInspectSticker] = useState<StickerAchievement | null>(null);

  // Teacher Award Modal State
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentRecords[0]?.id || 'std-01');
  const [selectedStickerChoice, setSelectedStickerChoice] = useState<string>('first-step');
  const [bonusStarsChoice, setBonusStarsChoice] = useState<number>(50);
  const [teacherAwardNote, setTeacherAwardNote] = useState<string>(
    'ครูขอชื่นชมในความตั้งใจส่งงานตรงเวลาและความคิดสร้างสรรค์ ขอให้รักษามาตรฐานนี้ไว้นะจ๊ะ!'
  );

  // Filters for Teacher
  const [searchStudent, setSearchStudent] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Inline Score Edit State for Teacher: { [studentId]: { stars: number, hwCount: number } }
  const [editingStars, setEditingStars] = useState<Record<string, number>>({});
  const [savedStudentId, setSavedStudentId] = useState<string | null>(null);

  const isTeacher = currentUser.role === 'teacher';

  // Custom Teacher Badges List
  const availableStickersToAward = [
    {
      id: 'first-step',
      name: 'First Step',
      thaiTitle: 'ผู้เริ่มต้นไฟแรง',
      icon: '🌟',
      color: 'bg-amber-100 border-amber-500 text-amber-950',
    },
    {
      id: 'super-critic',
      name: 'Super Critic',
      thaiTitle: 'นักประเมินยอดเยี่ยม',
      icon: '💖',
      color: 'bg-pink-100 border-rose-500 text-rose-950',
    },
    {
      id: 'ev-master',
      name: 'EV Master',
      thaiTitle: 'เซียนรถยนต์ไฟฟ้า EV',
      icon: '⚡',
      color: 'bg-emerald-100 border-emerald-500 text-emerald-950',
    },
    {
      id: 'quiz-champion',
      name: 'Quiz Champion',
      thaiTitle: 'ยอดนักคิดคะแนนเต็ม',
      icon: '🎯',
      color: 'bg-sky-100 border-blue-500 text-sky-950',
    },
    {
      id: 'century-star',
      name: 'Century Star',
      thaiTitle: 'ดาวรุ่งพุ่งแรง 100+',
      icon: '🏆',
      color: 'bg-purple-100 border-purple-500 text-purple-950',
    },
    {
      id: 'homework-legend',
      name: 'Homework Legend',
      thaiTitle: 'แชมป์กล่องการบ้าน',
      icon: '👑',
      color: 'bg-orange-100 border-orange-500 text-orange-950',
    },
    {
      id: 'punctual-champ',
      name: 'Punctual Champion',
      thaiTitle: 'เหรียญส่งงานตรงเวลา',
      icon: '⏰',
      color: 'bg-teal-100 border-teal-500 text-teal-950',
    },
    {
      id: 'creative-spark',
      name: 'Creative Spark',
      thaiTitle: 'นักคิดสร้างสรรค์ดีเด่น',
      icon: '🎨',
      color: 'bg-violet-100 border-violet-500 text-violet-950',
    },
    {
      id: 'team-helper',
      name: 'Classroom Hero',
      thaiTitle: 'จิตอาสาช่วยเพื่อนร่วมชั้น',
      icon: '🤝',
      color: 'bg-blue-100 border-blue-500 text-blue-950',
    },
  ];

  const handleOpenAwardForStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsAwardModalOpen(true);
  };

  const handleConfirmAward = () => {
    const sticker = availableStickersToAward.find((s) => s.id === selectedStickerChoice);
    if (!sticker || !selectedStudentId) return;

    onAwardStickerToStudent(
      selectedStudentId,
      sticker.id,
      sticker.name,
      sticker.thaiTitle,
      sticker.icon,
      bonusStarsChoice,
      teacherAwardNote.trim() || 'คุณครูมอบสติกเกอร์เกียรติยศให้เพื่อเป็นกำลังใจ'
    );

    triggerFestiveConfetti();
    setIsAwardModalOpen(false);
  };

  const handleSaveStudentScore = (student: StudentRecord) => {
    const newStarVal = editingStars[student.id] !== undefined ? editingStars[student.id] : student.totalStars;
    if (onUpdateStudentRecord) {
      onUpdateStudentRecord({
        ...student,
        totalStars: Number(newStarVal),
      });
    }
    setSavedStudentId(student.id);
    setTimeout(() => setSavedStudentId(null), 2500);
    triggerStarBurst();
  };

  // Compute Rank based on stars for student
  const getRankInfo = (stars: number) => {
    if (stars >= 250) {
      return { level: 5, title: '👑 แชมป์เปี้ยนกล่องการบ้าน (Level MAX)', nextGoal: 300 };
    }
    if (stars >= 180) {
      return { level: 4, title: '🚀 ยอดนักเรียนดีเด่น (Level 4)', nextGoal: 250 };
    }
    if (stars >= 100) {
      return { level: 3, title: '⚙️ อัจฉริยะนักประดิษฐ์ (Level 3)', nextGoal: 180 };
    }
    if (stars >= 50) {
      return { level: 2, title: '📖 นักสืบการบ้านไฟแรง (Level 2)', nextGoal: 100 };
    }
    return { level: 1, title: '🌱 ก้าวแรกนักเรียนคนเก่ง (Level 1)', nextGoal: 50 };
  };

  const rank = getRankInfo(currentUser.totalStars);
  const progressPercent = Math.min(100, Math.round((currentUser.totalStars / rank.nextGoal) * 100));
  const unlockedCount = stickers.filter((s) => s.isUnlocked).length;

  const availableClasses = Array.from(
    new Set(studentRecords.map((s) => s.classRoom).filter(Boolean))
  ).sort();

  const filteredStudents = studentRecords.filter((std) => {
    const matchSearch =
      std.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      std.studentNo.includes(searchStudent) ||
      std.studentIdCode.toLowerCase().includes(searchStudent.toLowerCase());
    const matchClass = classFilter === 'all' || std.classRoom === classFilter || std.classRoom.includes(classFilter);
    return matchSearch && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#DCFCE7] sketch-border rounded-[24px_16px_22px_18px] p-6 md:p-8 shadow-[6px_6px_0px_#18181b] relative overflow-hidden">
        <div className="washi-tape -top-3 left-10 rotate-[-3deg] bg-amber-300" />
        <div className="washi-tape -top-3 right-12 rotate-[2deg] bg-sky-200" />

        {isTeacher ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 bg-emerald-400 sketch-border rounded-[16px_12px_18px_10px] flex items-center justify-center text-3xl shadow-[2px_2px_0px_#000]">
                🎖️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-zinc-900">
                    3. สมุดคะแนน (สามารถให้สติกเกอร์กับนักเรียนได้)
                  </h2>
                  <span className="bg-purple-300 text-purple-950 font-black text-xs px-2.5 py-0.5 rounded-full border border-zinc-900">
                    โหมดคุณครู
                  </span>
                </div>
                <p className="text-xs md:text-sm font-semibold text-zinc-700 mt-0.5">
                  ตรวจสอบและกรอกคะแนนนักเรียนรายบุคคล พร้อมมอบสติกเกอร์เกียรติยศและดาวพิเศษ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenGoogleSheets && (
                <button
                  type="button"
                  onClick={onOpenGoogleSheets}
                  className="px-4 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-sm rounded-xl sketch-btn flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#18181b] shrink-0"
                  title="ซิงค์และส่งออกสมุดคะแนนไปยัง Google Sheets"
                >
                  <GoogleSheetsIcon className="w-4 h-4" />
                  <span>Google Sheets</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedStudentId(studentRecords[0]?.id || 'std-01');
                  setIsAwardModalOpen(true);
                }}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-sm rounded-xl sketch-btn flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#18181b] shrink-0"
              >
                <Gift className="w-4 h-4" />
                <span>มอบสติกเกอร์ให้นักเรียน 🎁</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Stars Display Box */}
            <div className="md:col-span-5 bg-white p-5 rounded-[20px_14px_18px_12px] sketch-border shadow-[4px_4px_0px_#18181b] text-center">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-950 font-black text-sm px-3.5 py-1.5 rounded-full border border-amber-400 mb-2">
                ⭐ สมุดบันทึกคะแนน & ดาวสะสม
              </div>

              <div className="text-4xl md:text-6xl font-black text-amber-900 tracking-tight my-1">
                {currentUser.totalStars} <span className="text-2xl font-bold text-amber-600">ดวง</span>
              </div>

              <p className="text-sm font-bold text-zinc-700">
                ของ {currentUser.name} ({currentUser.classRoom})
              </p>
            </div>

            {/* Level Progress */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                    ระดับเกียรติยศประจำตัว
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-zinc-900">{rank.title}</h3>
                </div>
                <span className="text-sm font-black bg-zinc-900 text-amber-300 px-3.5 py-1.5 rounded-full border border-zinc-900 shadow-[1px_1px_0px_#000]">
                  สติกเกอร์ {unlockedCount}/6 ชิ้น
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm font-bold text-zinc-800 mb-1">
                  <span>ความคืบหน้าระดับถัดไป</span>
                  <span>
                    {currentUser.totalStars} / {rank.nextGoal} ⭐ ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-5 bg-white rounded-full border-2 border-zinc-900 p-0.5 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TEACHER VIEW: STUDENT ROSTER & STICKER AWARDS WITH EDITABLE SCORE FIELDS */}
      {isTeacher ? (
        <div className="space-y-4">
          {/* Filter & View Mode Bar */}
          <div className="bg-white sketch-border rounded-[18px_12px_16px_14px] p-4 shadow-[4px_4px_0px_#18181b] flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="ค้นหาชื่อ, รหัสนักเรียน หรือเลขที่..."
                className="w-full bg-zinc-50 pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-300 text-xs font-bold overflow-x-auto">
                <span className="px-2 text-zinc-500">ห้อง:</span>
                <button
                  type="button"
                  onClick={() => setClassFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    classFilter === 'all' ? 'bg-zinc-900 text-white font-black' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  ทุกห้อง
                </button>
                {availableClasses.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setClassFilter(cls)}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      classFilter === cls ? 'bg-purple-600 text-white font-black' : 'text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-300 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${
                    viewMode === 'cards' ? 'bg-zinc-900 text-white font-black' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                  title="มุมมองการ์ด"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>การ์ด</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${
                    viewMode === 'table' ? 'bg-zinc-900 text-white font-black' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                  title="ตารางกรอกคะแนน"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>ตารางกรอกคะแนน</span>
                </button>
              </div>
            </div>
          </div>

          {/* VIEW MODE: TABLE (SPREADSHEET SCORE ENTRY) */}
          {viewMode === 'table' ? (
            <div className="bg-white sketch-border rounded-[22px_16px_20px_18px] p-5 shadow-[5px_5px_0px_#18181b] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-900 text-zinc-800 font-black text-xs bg-amber-50">
                    <th className="p-3">เลขที่ / รหัส</th>
                    <th className="p-3">ชื่อ-นามสกุล</th>
                    <th className="p-3">ห้อง</th>
                    <th className="p-3 text-center">การบ้านที่ส่ง</th>
                    <th className="p-3 text-center">สติกเกอร์ที่ได้</th>
                    <th className="p-3 text-center">ช่องกรอกคะแนน (ดาวสะสม ⭐)</th>
                    <th className="p-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-semibold text-zinc-700">
                  {filteredStudents.map((student) => {
                    const currentStarsVal =
                      editingStars[student.id] !== undefined
                        ? editingStars[student.id]
                        : student.totalStars;
                    const isSaved = savedStudentId === student.id;

                    return (
                      <tr key={student.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="p-3 font-bold">
                          <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                            {student.studentNo}
                          </span>{' '}
                          <span className="text-zinc-400 ml-1">{student.studentIdCode}</span>
                        </td>
                        <td className="p-3 font-black text-zinc-900 flex items-center gap-2">
                          <AvatarDisplay avatar={student.avatar} className="w-8 h-8" />
                          <span>{student.name}</span>
                        </td>
                        <td className="p-3 font-bold">{student.classRoom}</td>
                        <td className="p-3 text-center font-bold text-sky-900">
                          {student.homeworkCount} งาน
                        </td>
                        <td className="p-3 text-center font-bold text-purple-900">
                          {student.unlockedStickers.length + (student.awardedBadges?.length || 0)} เหรียญ
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="999"
                              value={currentStarsVal}
                              onChange={(e) =>
                                setEditingStars((prev) => ({
                                  ...prev,
                                  [student.id]: Number(e.target.value),
                                }))
                              }
                              className="w-20 px-2 py-1 bg-yellow-50 border-2 border-zinc-900 rounded-lg text-center font-black text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveStudentScore(student)}
                              className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black text-[11px] rounded-lg border border-zinc-900 shadow-[1px_1px_0px_#000] cursor-pointer flex items-center gap-0.5"
                            >
                              <Save className="w-3 h-3" />
                              <span>บันทึก</span>
                            </button>
                            {isSaved && (
                              <span className="text-[10px] font-black text-emerald-700 animate-pulse">
                                ✓
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenAwardForStudent(student.id)}
                            className="px-3 py-1.5 bg-amber-300 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-lg border border-zinc-900 shadow-[1px_1px_0px_#000] cursor-pointer inline-flex items-center gap-1"
                          >
                            <Gift className="w-3.5 h-3.5" /> ให้สติกเกอร์
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* VIEW MODE: CARDS WITH SCORE INPUTS */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((student) => {
                const stdRank = getRankInfo(student.totalStars);
                const currentStarsVal =
                  editingStars[student.id] !== undefined
                    ? editingStars[student.id]
                    : student.totalStars;
                const isSaved = savedStudentId === student.id;

                return (
                  <div
                    key={student.id}
                    className="bg-white sketch-border rounded-[22px_16px_20px_18px] p-5 shadow-[5px_5px_0px_#18181b] space-y-4 hover:translate-y-[-2px] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-zinc-200">
                        <div className="flex items-center gap-3">
                          <AvatarDisplay avatar={student.avatar} className="w-12 h-12" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-black text-zinc-900">{student.name}</h4>
                              <span className="text-[11px] font-black bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                                เลขที่ {student.studentNo}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-zinc-500">
                              {student.classRoom} • {student.studentIdCode}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-amber-900 flex items-center justify-end gap-1">
                            ⭐ {student.totalStars}
                          </div>
                          <span className="text-[10px] font-bold text-zinc-500">ดาวสะสม</span>
                        </div>
                      </div>

                      {/* Stats & Rank */}
                      <div className="grid grid-cols-3 gap-2 my-3 text-center text-xs">
                        <div className="bg-amber-50 p-2 rounded-xl border border-amber-300">
                          <div className="font-bold text-amber-900 text-[10px]">ระดับเกียรติยศ</div>
                          <div className="font-black text-amber-950 text-xs truncate">
                            {stdRank.title.split(' ')[1]}
                          </div>
                        </div>
                        <div className="bg-sky-50 p-2 rounded-xl border border-sky-300">
                          <div className="font-bold text-sky-900 text-[10px]">ส่งการบ้าน</div>
                          <div className="font-black text-sky-950 text-xs">{student.homeworkCount} ชิ้น</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded-xl border border-purple-300">
                          <div className="font-bold text-purple-900 text-[10px]">สติกเกอร์ที่ได้</div>
                          <div className="font-black text-purple-950 text-xs">
                            {student.unlockedStickers.length + (student.awardedBadges?.length || 0)} ชิ้น
                          </div>
                        </div>
                      </div>

                      {/* Score Input Box for Student */}
                      <div className="bg-amber-50/70 p-3 rounded-xl border-2 border-amber-300 my-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-zinc-900">
                            ✏️ ช่องกรอกคะแนน/ดาวสะสม:
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="999"
                            value={currentStarsVal}
                            onChange={(e) =>
                              setEditingStars((prev) => ({
                                ...prev,
                                [student.id]: Number(e.target.value),
                              }))
                            }
                            className="w-20 px-2 py-1 bg-white border-2 border-zinc-900 rounded-lg text-center font-black text-xs"
                          />
                          <span className="text-xs font-bold text-zinc-600">⭐</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveStudentScore(student)}
                          className="px-3 py-1 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black text-xs rounded-lg border border-zinc-900 shadow-[1px_1px_0px_#000] cursor-pointer flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>{isSaved ? 'บันทึกแล้ว ✓' : 'บันทึก'}</span>
                        </button>
                      </div>

                      {/* Awarded Badges list */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-black text-zinc-700 flex items-center justify-between">
                          <span>🎖️ สติกเกอร์และเหรียญรางวัลของนักเรียน:</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                          {student.unlockedStickers.map((stkId) => {
                            const stk = availableStickersToAward.find((s) => s.id === stkId);
                            if (!stk) return null;
                            return (
                              <span
                                key={stkId}
                                className={`text-[11px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 shadow-[1px_1px_0px_#000] ${stk.color}`}
                              >
                                <span>{stk.icon}</span>
                                <span>{stk.thaiTitle}</span>
                              </span>
                            );
                          })}

                          {student.awardedBadges?.map((badge) => (
                            <span
                              key={badge.id}
                              className="text-[11px] font-black px-2 py-0.5 rounded-lg border bg-amber-200 border-amber-600 text-amber-950 flex items-center gap-1 shadow-[1px_1px_0px_#000]"
                            >
                              <span>{badge.icon}</span>
                              <span>{badge.thaiTitle} (+{badge.starsAdded}⭐)</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Give Sticker Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenAwardForStudent(student.id)}
                      className="w-full py-2.5 bg-emerald-300 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl sketch-btn flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      <Gift className="w-4 h-4 text-emerald-950" />
                      <span>มอบสติกเกอร์ & ดาวให้นักเรียนคนนี้ ✨</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* STUDENT VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Quiz Exam Summary */}
          <div className="bg-white sketch-border rounded-[22px_14px_20px_16px] p-5 shadow-[5px_5px_0px_#18181b] relative">
            <div className="washi-tape -top-3 left-8 bg-sky-200 rotate-[-2deg]" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧪</span>
                <h3 className="text-lg font-black text-zinc-900">คะแนนแบบทดสอบ 2 บทเรียน</h3>
              </div>
              <span className="text-xs font-black bg-sky-100 text-sky-900 px-2.5 py-1 rounded-lg border border-sky-400">
                10 ข้อ/บท
              </span>
            </div>

            <div className="space-y-3">
              {quizLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-3.5 rounded-[16px_10px_14px_12px] border-2 border-zinc-900 bg-sky-50/50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lesson.icon}</span>
                    <div>
                      <h4 className="text-sm font-black text-zinc-900 leading-tight">{lesson.title}</h4>
                      <span className="text-[11px] font-semibold text-zinc-500">
                        {lesson.lastAttemptAt ? `ทำล่าสุดเมื่อ: ${lesson.lastAttemptAt}` : 'ยังไม่ได้เริ่มทำ'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-sm text-zinc-900 bg-white px-2.5 py-1 rounded-lg border border-zinc-900">
                      {lesson.bestScore !== undefined ? `${lesson.bestScore} / 10` : '- / 10'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Homework Summary */}
          <div className="bg-white sketch-border rounded-[22px_14px_20px_16px] p-5 shadow-[5px_5px_0px_#18181b] relative">
            <div className="washi-tape -top-3 right-8 bg-pink-200 rotate-[2deg]" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📦</span>
                <h3 className="text-lg font-black text-zinc-900">สถานะการส่งชิ้นงาน & การบ้าน</h3>
              </div>
              <span className="text-xs font-black bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-400">
                +50 ⭐ ทุกชิ้น
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center mb-3">
              <div className="p-3 bg-amber-50 rounded-xl border-2 border-amber-300">
                <div className="text-2xl font-black text-amber-950">{homeworkList.length}</div>
                <div className="text-xs font-bold text-amber-800">ส่งชิ้นงานทั้งหมด</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border-2 border-emerald-300">
                <div className="text-2xl font-black text-emerald-950">
                  {homeworkList.filter((h) => h.status === 'reviewed').length}
                </div>
                <div className="text-xs font-bold text-emerald-800">ครูตรวจเรียบร้อย</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6 Official Stickers Showcase */}
      <div className="bg-white sketch-border rounded-[24px_16px_22px_18px] p-6 shadow-[6px_6px_0px_#18181b] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-200">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <div>
              <h3 className="text-lg md:text-xl font-black text-zinc-900">
                ทำเนียบ 6 สติกเกอร์เกียรติยศ (Achievement Badges)
              </h3>
              <p className="text-xs font-semibold text-zinc-600">
                สติกเกอร์เกียรติประวัติแห่งความพยายามของนักเรียนทุกคน
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stickers.map((sticker) => {
            return (
              <div
                key={sticker.id}
                onClick={() => {
                  setInspectSticker(sticker);
                  if (sticker.isUnlocked) triggerStarBurst();
                }}
                className={`p-4 rounded-[20px_14px_18px_16px] border-3 text-center transition-all cursor-pointer flex flex-col items-center justify-between relative ${
                  sticker.isUnlocked
                    ? 'bg-[#FFFDF5] border-zinc-900 hover:translate-y-[-3px] hover:shadow-[4px_4px_0px_#18181b]'
                    : 'bg-zinc-100 border-dashed border-zinc-400 opacity-70 hover:opacity-90'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center text-3xl mb-2 shadow-[2px_2px_0px_#000]">
                  {sticker.isUnlocked ? sticker.icon : <Lock className="w-6 h-6 text-zinc-400" />}
                </div>

                <div>
                  <h4 className="text-xs md:text-sm font-black text-zinc-900 line-clamp-1">
                    {sticker.thaiTitle}
                  </h4>
                  <span className="text-[10px] font-bold text-zinc-500">{sticker.name}</span>
                </div>

                <div className="mt-2 w-full pt-2 border-t border-zinc-200">
                  {sticker.isUnlocked ? (
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" /> ปลดล็อกแล้ว
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded-full flex items-center justify-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> ยังล็อกอยู่
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TEACHER AWARD MODAL */}
      {isAwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white sketch-border rounded-[24px_16px_22px_18px] p-6 max-w-lg w-full shadow-[8px_8px_0px_#18181b] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                <div>
                  <h3 className="text-base md:text-lg font-black text-zinc-900">
                    มอบสติกเกอร์เกียรติยศ & ดาวให้นักเรียน
                  </h3>
                  <span className="text-xs font-semibold text-zinc-500">
                    เลือกสติกเกอร์และเพิ่มคะแนนดาวเพื่อเสริมแรงบวก
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAwardModalOpen(false)}
                className="p-1.5 hover:bg-zinc-100 rounded-full border border-zinc-300 cursor-pointer"
              >
                <X className="w-5 h-5 text-zinc-700" />
              </button>
            </div>

            {/* Select Student */}
            <div>
              <label className="block text-xs font-black text-zinc-800 mb-1">นักเรียนที่จะมอบให้:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-bold"
              >
                {studentRecords.map((std) => (
                  <option key={std.id} value={std.id}>
                    เลขที่ {std.studentNo} {std.name} ({std.classRoom}) - ดาวปัจจุบัน: {std.totalStars} ⭐
                  </option>
                ))}
              </select>
            </div>

            {/* Choose Sticker */}
            <div>
              <label className="block text-xs font-black text-zinc-800 mb-1.5">
                เลือกสติกเกอร์เกียรติยศที่จะมอบ:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableStickersToAward.map((stk) => (
                  <div
                    key={stk.id}
                    onClick={() => setSelectedStickerChoice(stk.id)}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer text-center transition-all flex flex-col items-center justify-center ${
                      selectedStickerChoice === stk.id
                        ? 'bg-amber-300 border-zinc-900 shadow-[3px_3px_0px_#000] scale-102 font-black'
                        : 'bg-zinc-50 border-zinc-300 hover:bg-zinc-100 font-bold'
                    }`}
                  >
                    <span className="text-2xl mb-1">{stk.icon}</span>
                    <span className="text-[11px] leading-tight text-zinc-900">{stk.thaiTitle}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus Stars */}
            <div>
              <label className="block text-xs font-black text-zinc-800 mb-1">
                ⭐ มอบดาวโบนัสพิเศษ (Stars):
              </label>
              <div className="flex items-center gap-2">
                {[20, 50, 100].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setBonusStarsChoice(star)}
                    className={`flex-1 py-2 rounded-xl border-2 font-black text-xs cursor-pointer ${
                      bonusStarsChoice === star
                        ? 'bg-amber-400 border-zinc-900 shadow-[2px_2px_0px_#000]'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-700'
                    }`}
                  >
                    +{star} ดาว ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Award Note */}
            <div>
              <label className="block text-xs font-black text-zinc-800 mb-1">
                💬 ข้อความชื่นชมและคำแนะนำจากครู:
              </label>
              <textarea
                rows={2}
                value={teacherAwardNote}
                onChange={(e) => setTeacherAwardNote(e.target.value)}
                placeholder="พิมพ์ข้อความชื่นชม..."
                className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-semibold sketch-input"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setIsAwardModalOpen(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-300 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmAward}
                className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black text-xs md:text-sm rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#000]"
              >
                <Sparkles className="w-4 h-4" />
                <span>ยืนยันมอบรางวัล ✨</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT STICKER MODAL */}
      {inspectSticker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white sketch-border rounded-[24px_16px_22px_18px] p-6 max-w-sm w-full shadow-[8px_8px_0px_#18181b] space-y-4 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 border-3 border-zinc-900 flex items-center justify-center text-4xl mx-auto shadow-[3px_3px_0px_#000]">
              {inspectSticker.icon}
            </div>

            <div>
              <h3 className="text-lg font-black text-zinc-900">{inspectSticker.thaiTitle}</h3>
              <span className="text-xs font-bold text-zinc-500">{inspectSticker.name}</span>
            </div>

            <p className="text-xs font-semibold text-zinc-700 bg-amber-50/70 p-3 rounded-xl border border-amber-300">
              {inspectSticker.description}
            </p>

            <div className="text-[11px] font-bold text-zinc-600 space-y-1">
              <div>🎯 เงื่อนไข: {inspectSticker.condition}</div>
              {inspectSticker.isUnlocked && inspectSticker.unlockedAt && (
                <div className="text-emerald-700 font-black">
                  ✨ ปลดล็อกเมื่อ: {inspectSticker.unlockedAt}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setInspectSticker(null)}
              className="w-full py-2.5 bg-zinc-900 text-white font-black text-xs rounded-xl cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
