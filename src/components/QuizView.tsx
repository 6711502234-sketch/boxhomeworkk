import React, { useState } from 'react';
import { QuizLesson, UserProfile, StudentExamScore } from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import { QuizEditorModal } from './QuizEditorModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { GoogleSheetsModal } from './GoogleSheetsModal';
import { sendScoreToGoogleSheets } from '../utils/googleSheets';
import { triggerFestiveConfetti, triggerStarBurst } from '../utils/confetti';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  Zap,
  Check,
  Search,
  Users,
  GraduationCap,
  Eye,
  TrendingUp,
  FileCheck,
  Plus,
  Edit3,
  Trash2,
  Layers,
  Calendar,
  Clock,
  ListOrdered,
  FileSpreadsheet
} from 'lucide-react';

interface QuizViewProps {
  currentUser: UserProfile;
  lessons: QuizLesson[];
  examScores: StudentExamScore[];
  onCreateLesson?: (lesson: QuizLesson) => void;
  onUpdateLesson?: (lesson: QuizLesson) => void;
  onDeleteLesson?: (lessonId: string) => void;
  onFinishQuiz: (lessonId: string, score: number, earnedStars: number) => void;
  onAwardStars: (amount: number, reason: string) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  currentUser,
  lessons,
  examScores,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  onFinishQuiz,
  onAwardStars,
}) => {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [filterReview, setFilterReview] = useState<'all' | 'correct' | 'wrong'>('all');

  // Teacher specific state
  const [teacherTab, setTeacherTab] = useState<'quizzes' | 'scores'>('quizzes');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [inspectingQuestionLesson, setInspectingQuestionLesson] = useState<QuizLesson | null>(null);

  // Modal State for Create/Edit Quiz
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizLesson | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState<{ id: string; title: string } | null>(null);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState<boolean>(false);

  const isTeacher = currentUser.role === 'teacher';
  const activeLesson = lessons.find((l) => l.id === activeLessonId);

  const handleStartLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setFilterReview('all');
  };

  const handleOpenCreateModal = () => {
    setEditingQuiz(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (lesson: QuizLesson) => {
    setEditingQuiz(lesson);
    setIsEditorOpen(true);
  };

  const handleDeleteQuizWithConfirm = (lessonId: string, lessonTitle?: string) => {
    setDeletingQuiz({ id: lessonId, title: lessonTitle || '' });
  };

  const handleConfirmDeleteQuiz = () => {
    if (deletingQuiz && onDeleteLesson) {
      onDeleteLesson(deletingQuiz.id);
    }
    setDeletingQuiz(null);
  };

  const handleSaveQuiz = (lessonPayload: QuizLesson) => {
    if (editingQuiz) {
      if (onUpdateLesson) {
        onUpdateLesson(lessonPayload);
      }
    } else {
      if (onCreateLesson) {
        onCreateLesson(lessonPayload);
      }
    }
    triggerFestiveConfetti();
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleCalculateAndSubmit = () => {
    if (!activeLesson) return;

    let score = 0;
    activeLesson.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });

    let earnedStars = score * 10;
    if (score === activeLesson.questions.length) {
      earnedStars += 30; // Perfect bonus
    }

    setIsSubmitted(true);
    onFinishQuiz(activeLesson.id, score, earnedStars);
    onAwardStars(
      earnedStars,
      `ทำแบบทดสอบ ${activeLesson.title} ได้ ${score}/${activeLesson.questions.length} (+${earnedStars} ⭐)`
    );

    // Auto-sync score to Google Sheets if configured
    try {
      const sheetsUrl = localStorage.getItem('hw_box_sheets_webhook_url');
      if (sheetsUrl && sheetsUrl.trim()) {
        const submittedAt = new Date().toLocaleString('th-TH', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
        sendScoreToGoogleSheets(
          {
            studentId: currentUser.id,
            studentName: currentUser.name,
            studentClass: currentUser.classRoom,
            studentNo: currentUser.studentNo,
            lessonId: activeLesson.id,
            lessonTitle: activeLesson.title,
            score,
            maxScore: activeLesson.questions.length,
            submittedAt,
            earnedStars,
          },
          sheetsUrl
        ).catch((err) => console.log('Sheets auto-sync notice:', err));
      }
    } catch (e) {
      console.error(e);
    }

    if (score >= Math.ceil(activeLesson.questions.length * 0.7)) {
      triggerFestiveConfetti();
    } else {
      triggerStarBurst();
    }
  };

  // Filter exam scores for teacher dashboard
  const availableClasses = Array.from(
    new Set(examScores.map((s) => s.studentClass).filter(Boolean))
  ).sort();

  const filteredExamScores = examScores.filter((record) => {
    const matchLesson = selectedLessonFilter === 'all' || record.lessonId === selectedLessonFilter;
    const matchClass = selectedClassFilter === 'all' || record.studentClass === selectedClassFilter || record.studentClass.includes(selectedClassFilter);
    const matchSearch =
      record.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      record.studentNo.includes(searchStudent) ||
      record.lessonTitle.toLowerCase().includes(searchStudent.toLowerCase());

    return matchLesson && matchClass && matchSearch;
  });

  // Calculate teacher summary metrics
  const totalSubmissions = examScores.length;
  const averageScore =
    totalSubmissions > 0
      ? (examScores.reduce((acc, curr) => acc + curr.score, 0) / totalSubmissions).toFixed(1)
      : '0.0';
  const highestScore =
    totalSubmissions > 0 ? Math.max(...examScores.map((s) => s.score)) : 0;
  const totalQuestionsCount = lessons.reduce((acc, curr) => acc + curr.questions.length, 0);

  // ==========================================
  // TEACHER DASHBOARD
  // ==========================================
  if (isTeacher && !activeLesson) {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-[#E0F2FE] sketch-border rounded-[22px_14px_24px_16px] p-5 md:p-6 shadow-[5px_5px_0px_#18181b] relative overflow-hidden">
          <div className="washi-tape -top-2 left-10 rotate-[-3deg] bg-amber-200" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-sky-300 sketch-border rounded-[14px_10px_16px_12px] flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000]">
                📊
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-zinc-900">
                    2. แบบทดสอบ (Teacher Quiz Hub)
                  </h2>
                  <span className="bg-purple-300 text-purple-950 font-black text-xs px-2.5 py-0.5 rounded-full border border-zinc-900">
                    ครูผู้สอน
                  </span>
                </div>
                <p className="text-xs md:text-sm font-semibold text-zinc-700 mt-0.5">
                  สร้างและโพสต์แบบทดสอบใหม่ให้นักเรียนทำ พร้อมติดตามคะแนนสอบรายบุคคลอัตโนมัติ
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 bg-amber-300 hover:bg-amber-400 text-zinc-950 font-black text-xs md:text-sm rounded-xl sketch-btn flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ โพสต์แบบทดสอบใหม่</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-[18px_12px_16px_14px] sketch-border shadow-[3px_3px_0px_#18181b]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-600">ชุดแบบทดสอบ</span>
              <Layers className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{lessons.length} ชุด</div>
            <span className="text-[11px] font-semibold text-purple-700">ทั้งหมด {totalQuestionsCount} ข้อ</span>
          </div>

          <div className="bg-white p-4 rounded-[18px_12px_16px_14px] sketch-border shadow-[3px_3px_0px_#18181b]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-600">นักเรียนเข้าสอบแล้ว</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{totalSubmissions} ครั้ง</div>
            <span className="text-[11px] font-semibold text-emerald-700">ส่งคำตอบครบถ้วน</span>
          </div>

          <div className="bg-white p-4 rounded-[18px_12px_16px_14px] sketch-border shadow-[3px_3px_0px_#18181b]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-600">คะแนนเฉลี่ย</span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">{averageScore} คะแนน</div>
            <span className="text-[11px] font-semibold text-zinc-600">จากทุกชุดข้อสอบ</span>
          </div>

          <div className="bg-white p-4 rounded-[18px_12px_16px_14px] sketch-border shadow-[3px_3px_0px_#18181b]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-600">คะแนนสูงสุด</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-800 mt-1">{highestScore} คะแนน</div>
            <span className="text-[11px] font-semibold text-emerald-700">ทำคะแนนได้ดีเยี่ยม</span>
          </div>
        </div>

        {/* Teacher Navigation Tabs (Quizzes vs Scores) */}
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-zinc-900 pb-2">
          <button
            type="button"
            onClick={() => setTeacherTab('quizzes')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              teacherTab === 'quizzes'
                ? 'bg-amber-300 text-zinc-950 border-2 border-zinc-900 shadow-[2px_2px_0px_#000]'
                : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>📋 ชุดแบบทดสอบทั้งหมด ({lessons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTeacherTab('scores')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              teacherTab === 'scores'
                ? 'bg-amber-300 text-zinc-950 border-2 border-zinc-900 shadow-[2px_2px_0px_#000]'
                : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-100'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>📊 ตารางคะแนนสอบรายบุคคล ({examScores.length})</span>
          </button>
        </div>

        {/* TAB 1: QUIZZES MANAGEMENT */}
        {teacherTab === 'quizzes' && (
          <div className="space-y-4">
            {/* Top Action Box */}
            <div className="bg-white p-4 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm md:text-base font-black text-zinc-900">
                  รายการชุดข้อสอบที่เปิดให้นักเรียนทำ ({lessons.length} ชุด)
                </h3>
                <p className="text-xs font-semibold text-zinc-600">
                  สามารถกดเพิ่มข้อสอบใหม่ แก้ไขชุดคำถาม หรือกดดูเฉลยและทดลองทำได้
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoogleSheetsModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs font-black rounded-xl border-2 border-emerald-500 flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>📊 บันทึกคะแนนลง Google Sheets</span>
                </button>
              </div>
            </div>

            {/* Quiz Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessons.map((lesson) => {
                const submissionsForLesson = examScores.filter((s) => s.lessonId === lesson.id);
                return (
                  <div
                    key={lesson.id}
                    className="bg-white sketch-border rounded-[22px_16px_20px_18px] p-5 shadow-[5px_5px_0px_#18181b] flex flex-col justify-between space-y-4 relative group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-[14px_10px_16px_12px] bg-amber-100 border-2 border-zinc-900 flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000]">
                            {lesson.icon || '🧪'}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="bg-sky-100 text-sky-900 font-bold text-[10px] px-2 py-0.5 rounded border border-sky-400">
                                {lesson.subject || 'วิทยาศาสตร์'}
                              </span>
                              <span className="bg-purple-100 text-purple-900 font-bold text-[10px] px-2 py-0.5 rounded border border-purple-400">
                                {lesson.targetClass || 'ทุกห้อง'}
                              </span>
                            </div>
                            <h4 className="text-base font-black text-zinc-900 mt-1">
                              {lesson.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(lesson)}
                            className="p-1.5 hover:bg-zinc-100 text-zinc-700 rounded-lg border border-zinc-300 cursor-pointer"
                            title="แก้ไขชุดข้อสอบนี้"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuizWithConfirm(lesson.id, lesson.title)}
                            className="p-1.5 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-300 cursor-pointer"
                            title="ลบชุดข้อสอบนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-zinc-600 line-clamp-2 mb-3">
                        {lesson.subtitle}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-300 font-bold text-amber-950 flex items-center gap-1">
                          <ListOrdered className="w-3.5 h-3.5 text-amber-700" />
                          <span>{lesson.questions.length} ข้อคำถาม</span>
                        </span>

                        <span className="px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-300 font-bold text-emerald-950 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-700" />
                          <span>สอบแล้ว {submissionsForLesson.length} คน</span>
                        </span>

                        {lesson.dueDate && (
                          <span className="px-2.5 py-1 bg-zinc-100 rounded-lg border border-zinc-300 font-semibold text-zinc-700 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            <span>ส่งก่อน: {lesson.dueDate}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-200 gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectingQuestionLesson(lesson)}
                        className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold rounded-xl border border-zinc-900 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูข้อสอบ & เฉลย</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartLesson(lesson.id)}
                        className="flex-1 py-2 bg-amber-300 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl border border-zinc-900 cursor-pointer flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000]"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>ทดลองทำ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT SCOREBOOK */}
        {teacherTab === 'scores' && (
          <div className="bg-white sketch-border rounded-[22px_16px_20px_18px] p-5 shadow-[5px_5px_0px_#18181b] space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b-2 border-zinc-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-700" />
                <h3 className="text-base md:text-lg font-black text-zinc-900">
                  ตารางบันทึกคะแนนสอบรายบุคคล (Student Scorebook)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    placeholder="ค้นหาชื่อหรือเลขที่..."
                    className="w-full bg-zinc-50 pl-8 pr-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs font-semibold"
                  />
                </div>

                {/* Lesson Filter */}
                <select
                  value={selectedLessonFilter}
                  onChange={(e) => setSelectedLessonFilter(e.target.value)}
                  className="bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs font-bold"
                >
                  <option value="all">📚 ทุกชุดแบบทดสอบ</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.icon} {l.title}
                    </option>
                  ))}
                </select>

                {/* Class Filter */}
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs font-bold"
                >
                  <option value="all">🏫 ทุกห้อง</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                  {availableClasses.length === 0 && (
                    <>
                      <option value="ห้อง 1">ห้อง 1</option>
                      <option value="ห้อง 2">ห้อง 2</option>
                    </>
                  )}
                </select>

                <button
                  type="button"
                  onClick={() => setIsGoogleSheetsModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
                  title="เปิดหน้าต่างตั้งค่า Google Sheets และ Apps Script"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>บันทึกลง Google Sheets</span>
                </button>
              </div>
            </div>

            {/* Table */}
            {filteredExamScores.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 font-semibold text-xs">
                ไม่พบข้อมูลคะแนนสอบตามตัวกรองที่เลือก
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b-2 border-zinc-900 bg-amber-100/70 text-zinc-900 font-black">
                      <th className="py-2.5 px-3">เลขที่ / ห้อง</th>
                      <th className="py-2.5 px-3">นักเรียน</th>
                      <th className="py-2.5 px-3">บทเรียนที่สอบ</th>
                      <th className="py-2.5 px-3 text-center">สถานะ</th>
                      <th className="py-2.5 px-3 text-center">คะแนนที่ได้</th>
                      <th className="py-2.5 px-3 text-right">เวลาที่ส่งผลสอบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-semibold">
                    {filteredExamScores.map((item) => {
                      const isPerfect = item.score === item.maxScore;
                      const isPass = item.score >= Math.ceil(item.maxScore * 0.7);
                      return (
                        <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                              เลขที่ {item.studentNo} ({item.studentClass})
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-zinc-900 flex items-center gap-2">
                            <AvatarDisplay avatar={item.studentAvatar} className="w-7 h-7" />
                            <span>{item.studentName}</span>
                          </td>
                          <td className="py-3 px-3 text-zinc-700">
                            <span className="font-bold">{item.lessonTitle}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="bg-emerald-100 text-emerald-950 font-black text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-500">
                              ✓ สอบแล้ว
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`font-black text-sm px-2.5 py-0.5 rounded-md border ${
                                isPerfect
                                  ? 'bg-amber-300 text-amber-950 border-amber-500 shadow-[1px_1px_0px_#000]'
                                  : isPass
                                  ? 'bg-emerald-200 text-emerald-950 border-emerald-500'
                                  : 'bg-orange-100 text-orange-950 border-orange-400'
                              }`}
                            >
                              {item.score} / {item.maxScore}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-xs text-zinc-500 font-medium">
                            {item.submittedAt}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal Inspecting Test Questions */}
        {inspectingQuestionLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF5] sketch-border-lg rounded-[26px_18px_24px_20px] p-6 md:p-8 max-w-2xl w-full relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{inspectingQuestionLesson.icon}</span>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900">
                      ชุดข้อสอบและเฉลย: {inspectingQuestionLesson.title}
                    </h3>
                    <p className="text-xs font-semibold text-zinc-600">
                      ทั้งหมด {inspectingQuestionLesson.questions.length} ข้อ พร้อมคำอธิบายเฉลยละเอียด
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingQuestionLesson(null)}
                  className="w-8 h-8 rounded-full bg-rose-200 hover:bg-rose-300 border-2 border-zinc-900 flex items-center justify-center font-bold text-zinc-900 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {inspectingQuestionLesson.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-xl bg-white border-2 border-zinc-900/60 shadow-[2px_2px_0px_#000] space-y-2"
                  >
                    <div className="flex items-center justify-between font-black text-xs text-zinc-700">
                      <span>ข้อที่ {idx + 1}</span>
                      <span className="bg-amber-200 px-2 py-0.5 rounded text-zinc-950">⭐ 10 คะแนน</span>
                    </div>

                    <h4 className="text-sm font-black text-zinc-900">{q.question}</h4>

                    {q.imageUrl && (
                      <div className="my-2 max-h-48 max-w-sm rounded-xl border border-zinc-300 bg-white p-1 overflow-hidden">
                        <img src={q.imageUrl} alt={`ภาพประกอบข้อ ${idx + 1}`} className="max-h-44 w-auto mx-auto object-contain rounded-lg" />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctIndex;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg border font-semibold flex items-center gap-1.5 ${
                              isCorrect
                                ? 'bg-emerald-100 border-emerald-600 text-emerald-950 font-black'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full border border-zinc-900 flex items-center justify-center text-[10px] shrink-0 font-bold">
                              {isCorrect ? '✓' : String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-300 text-xs text-sky-950 font-semibold mt-2">
                        <span className="font-black text-sky-900">💡 เฉลย & คำอธิบาย:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setInspectingQuestionLesson(null)}
                className="w-full py-2.5 bg-zinc-900 text-white font-black text-xs rounded-xl cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}

        {/* Modal Create / Edit Quiz */}
        <QuizEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveQuiz}
          onDelete={handleDeleteQuizWithConfirm}
          initialQuiz={editingQuiz}
          authorName={currentUser.name}
        />
      </div>
    );
  }

  // ==========================================
  // STUDENT VIEW - Lesson Selection
  // ==========================================
  if (!activeLesson) {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-[#E0F2FE] sketch-border rounded-[22px_14px_24px_16px] p-5 md:p-6 shadow-[5px_5px_0px_#18181b] relative overflow-hidden">
          <div className="washi-tape -top-2 left-10 rotate-[-3deg] bg-amber-200" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-sky-300 sketch-border rounded-[14px_10px_16px_12px] flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000]">
                🧪
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-zinc-900">
                    2. แบบทดสอบ
                  </h2>
                  <span className="bg-amber-300 text-zinc-950 font-black text-xs px-2.5 py-0.5 rounded-full border border-zinc-900">
                    {lessons.length} ชุดบทเรียน
                  </span>
                </div>
                <p className="text-xs md:text-sm font-semibold text-zinc-700 mt-0.5">
                  ตรวจคำตอบอัตโนมัติ พร้อมบทวิเคราะห์เฉลยและทริกทำข้อสอบอย่างละเอียดทุกข้อ!
                </p>
              </div>
            </div>
            <div className="text-xs bg-white px-3 py-1.5 rounded-xl border-2 border-zinc-900 font-bold shadow-[2px_2px_0px_#000]">
              ⭐ รับดาวสูงสุดตามจำนวนข้อที่ตอบถูก
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="bg-white sketch-border-lg rounded-[22px_16px_20px_18px] p-6 shadow-[6px_6px_0px_#18181b] flex flex-col justify-between relative group hover:translate-y-[-3px] transition-all"
            >
              <div
                className={`washi-tape -top-3.5 ${
                  idx % 2 === 0 ? 'left-8 bg-emerald-200 rotate-[-2deg]' : 'right-8 bg-amber-200 rotate-[3deg]'
                }`}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-[16px_12px_18px_10px] border-3 border-zinc-900 bg-amber-100 flex items-center justify-center text-3xl shadow-[3px_3px_0px_#18181b] group-hover:rotate-6 transition-transform">
                    {lesson.icon || '🧪'}
                  </div>
                  {lesson.bestScore !== undefined && (
                    <span className="bg-emerald-100 text-emerald-950 font-black text-xs px-3 py-1 rounded-full border-2 border-emerald-500 shadow-[2px_2px_0px_#000]">
                      🏆 สถิติสูงสุด: {lesson.bestScore}/{lesson.questions.length}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-sky-100 text-sky-900 font-bold text-[10px] px-2 py-0.5 rounded border border-sky-400">
                    {lesson.subject || 'วิทยาศาสตร์'}
                  </span>
                  <span className="bg-purple-100 text-purple-900 font-bold text-[10px] px-2 py-0.5 rounded border border-purple-400">
                    {lesson.targetClass || 'ทุกห้อง'}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-2">
                  {lesson.title}
                </h3>
                <p className="text-xs md:text-sm font-semibold text-zinc-600 mb-4 leading-relaxed">
                  {lesson.subtitle}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 border border-zinc-900">
                    📝 {lesson.questions.length} ข้อ ปรนัย 4 ตัวเลือก
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-zinc-900">
                    ⭐ ข้อละ 10 ดาว (+โบนัส 30)
                  </span>
                  {lesson.dueDate && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-300">
                      📅 ส่งก่อน: {lesson.dueDate}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleStartLesson(lesson.id)}
                className="w-full py-3 bg-[#FEF08A] hover:bg-amber-300 text-zinc-950 font-black text-sm rounded-xl sketch-btn flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#18181b]"
              >
                <span>{lesson.bestScore !== undefined ? 'ทำแบบทดสอบอีกครั้ง' : 'เริ่มทำแบบทดสอบ'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE QUIZ / QUESTION SCREEN
  // ==========================================
  const currentQ = activeLesson.questions[currentQuestionIdx];
  const answeredCount = Object.keys(userAnswers).length;

  const calculateScore = () => {
    let s = 0;
    activeLesson.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) s++;
    });
    return s;
  };

  const finalScore = isSubmitted ? calculateScore() : 0;

  return (
    <div className="space-y-6">
      {/* Quiz Top Navigation Bar */}
      <div className="bg-white sketch-border rounded-[18px_12px_16px_14px] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[4px_4px_0px_#18181b]">
        <button
          type="button"
          onClick={() => setActiveLessonId(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-950 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-900 cursor-pointer self-start sm:self-auto"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{isTeacher ? 'กลับสู่หน้าจัดการข้อสอบ' : 'เปลี่ยนบทเรียน'}</span>
        </button>

        <div className="text-center">
          <h3 className="text-sm md:text-base font-black text-zinc-900">
            {activeLesson.title}
          </h3>
          <div className="text-xs font-semibold text-zinc-500">
            {isSubmitted
              ? `ตรวจเสร็จสิ้น: ได้ ${finalScore}/${activeLesson.questions.length} คะแนน`
              : `ตอบแล้ว ${answeredCount} จาก ${activeLesson.questions.length} ข้อ`}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 max-w-full">
          {activeLesson.questions.map((q, idx) => {
            const isAnswered = userAnswers[q.id] !== undefined;
            const isCurrent = idx === currentQuestionIdx;
            const isCorrect = userAnswers[q.id] === q.correctIndex;

            let badgeStyle = 'bg-zinc-100 text-zinc-500 border-zinc-300';
            if (isSubmitted) {
              badgeStyle = isCorrect
                ? 'bg-emerald-400 text-zinc-950 border-zinc-900 font-black'
                : 'bg-rose-400 text-white border-zinc-900 font-black';
            } else if (isCurrent) {
              badgeStyle = 'bg-amber-400 text-zinc-950 border-zinc-900 font-black scale-110 shadow-[2px_2px_0px_#000]';
            } else if (isAnswered) {
              badgeStyle = 'bg-sky-200 text-sky-950 border-zinc-900 font-bold';
            }

            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`w-7 h-7 rounded-lg border-2 text-xs flex items-center justify-center transition-all cursor-pointer ${badgeStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question / Result Screen */}
      {!isSubmitted ? (
        <div className="bg-white sketch-border-lg rounded-[24px_16px_22px_18px] p-6 md:p-8 shadow-[6px_6px_0px_#18181b] relative">
          <div className="washi-tape -top-3.5 left-16 bg-amber-300 rotate-[-2deg]" />

          {/* Question Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-200 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-amber-300 border-2 border-zinc-900 font-black flex items-center justify-center text-base shadow-[1.5px_1.5px_0px_#000]">
                {currentQuestionIdx + 1}
              </span>
              <span className="text-sm font-black text-zinc-600 uppercase tracking-wider">
                คำถามข้อที่ {currentQuestionIdx + 1} / {activeLesson.questions.length}
              </span>
            </div>
            <span className="text-sm font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-md border border-amber-400 shadow-[1px_1px_0px_#000]">
              ⭐ 10 ดาว
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-lg md:text-2xl font-black text-zinc-900 mb-4 leading-relaxed">
            {currentQ?.question}
          </h3>

          {/* Question Image (if attached by teacher) */}
          {currentQ?.imageUrl && (
            <div className="mb-6 max-h-72 max-w-lg mx-auto rounded-2xl border-2 border-zinc-900 bg-white p-2 shadow-[3px_3px_0px_#18181b] overflow-hidden flex items-center justify-center">
              <img
                src={currentQ.imageUrl}
                alt={`ภาพประกอบโจทย์ข้อที่ ${currentQuestionIdx + 1}`}
                className="max-h-64 w-auto object-contain rounded-xl"
              />
            </div>
          )}

          {/* Choices */}
          <div className="space-y-3.5 mb-8">
            {currentQ?.options.map((opt, optIdx) => {
              const isSelected = userAnswers[currentQ.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`w-full p-4.5 rounded-[18px_12px_16px_14px] border-3 text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100 border-zinc-900 shadow-[4px_4px_0px_#18181b] translate-x-1'
                      : 'bg-[#FFFDF5] border-zinc-400 hover:border-zinc-900 hover:bg-amber-50/50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 border-zinc-900 flex items-center justify-center text-sm font-black shrink-0 mt-0.5 ${
                      isSelected ? 'bg-amber-400 text-zinc-950' : 'bg-white text-zinc-800'
                    }`}
                  >
                    {isSelected ? '✓' : String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="text-sm md:text-base font-bold text-zinc-900 leading-normal">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-zinc-200">
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 text-zinc-800 font-bold text-xs md:text-sm rounded-xl border-2 border-zinc-900 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ข้อก่อนหน้า</span>
            </button>

            {currentQuestionIdx < activeLesson.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs md:text-sm rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#18181b]"
              >
                <span>ข้อถัดไป</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCalculateAndSubmit}
                className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black text-sm rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#18181b]"
              >
                <Check className="w-4 h-4" />
                <span>ส่งคำตอบ & ตรวจคะแนน ✨</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* RESULT & ANALYSIS SCREEN */
        <div className="space-y-6">
          {/* Result Banner */}
          <div className="bg-[#FFFDF5] sketch-border-lg rounded-[24px_16px_22px_18px] p-6 md:p-8 shadow-[6px_6px_0px_#18181b] relative overflow-hidden text-center">
            <div className="washi-tape -top-3.5 left-1/2 -translate-x-1/2 bg-amber-300 rotate-[-1deg]" />

            <div className="inline-block p-4 rounded-full bg-amber-100 border-3 border-zinc-900 text-5xl mb-3 shadow-[3px_3px_0px_#000]">
              {finalScore === activeLesson.questions.length
                ? '👑'
                : finalScore >= Math.ceil(activeLesson.questions.length * 0.8)
                ? '🏆'
                : finalScore >= Math.ceil(activeLesson.questions.length * 0.5)
                ? '🌟'
                : '💪'}
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mb-1">
              {finalScore === activeLesson.questions.length
                ? `ยอดเยี่ยมสมบูรณ์แบบ! เต็ม ${finalScore}/${activeLesson.questions.length}`
                : finalScore >= Math.ceil(activeLesson.questions.length * 0.8)
                ? 'ผ่านเกณฑ์ระดับยอดเยี่ยม!'
                : finalScore >= Math.ceil(activeLesson.questions.length * 0.5)
                ? 'ผ่านเกณฑ์พื้นฐาน ทำได้ดีมาก!'
                : 'พยายามได้ดี ทบทวนแล้วลองใหม่อีกครั้งนะ!'}
            </h3>

            <p className="text-sm font-semibold text-zinc-600 mb-4">
              คุณทำแบบทดสอบ: <span className="font-black text-zinc-900">{activeLesson.title}</span>
            </p>

            {/* Score & Stars Box */}
            <div className="inline-flex items-center gap-6 bg-white px-8 py-4 rounded-[20px_14px_18px_16px] border-3 border-zinc-900 shadow-[4px_4px_0px_#18181b] mb-6">
              <div>
                <div className="text-xs font-black text-zinc-500 uppercase">คะแนนที่ได้</div>
                <div className="text-3xl md:text-4xl font-black text-amber-900">
                  {finalScore} <span className="text-lg text-zinc-400">/ {activeLesson.questions.length}</span>
                </div>
              </div>
              <div className="w-px h-10 bg-zinc-300" />
              <div>
                <div className="text-xs font-black text-zinc-500 uppercase">ดาวที่ได้รับ</div>
                <div className="text-3xl md:text-4xl font-black text-amber-500 flex items-center gap-1">
                  ⭐ +{finalScore * 10 + (finalScore === activeLesson.questions.length ? 30 : 0)}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleStartLesson(activeLesson.id)}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs md:text-sm rounded-xl border-2 border-zinc-900 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ทำแบบทดสอบอีกครั้ง</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLessonId(null)}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs md:text-sm rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#18181b]"
              >
                <span>{isTeacher ? 'กลับสู่หน้าจัดการข้อสอบ' : 'กลับสู่หน้ารวมบทเรียน'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Deep Question Analysis & Review */}
          <div className="bg-white sketch-border-lg rounded-[22px_16px_20px_18px] p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-zinc-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-700" />
                <h4 className="text-lg font-black text-zinc-900">
                  เฉลยและบทวิเคราะห์คำตอบอย่างละเอียด ({activeLesson.questions.length} ข้อ)
                </h4>
              </div>

              {/* Review Filters */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-300 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterReview('all')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterReview === 'all' ? 'bg-zinc-900 text-white font-black' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  ทั้งหมด ({activeLesson.questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterReview('correct')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterReview === 'correct'
                      ? 'bg-emerald-600 text-white font-black'
                      : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  ตอบถูก ({finalScore})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterReview('wrong')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterReview === 'wrong' ? 'bg-rose-600 text-white font-black' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  ตอบผิด ({activeLesson.questions.length - finalScore})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {activeLesson.questions
                .filter((q) => {
                  const isCorrect = userAnswers[q.id] === q.correctIndex;
                  if (filterReview === 'correct') return isCorrect;
                  if (filterReview === 'wrong') return !isCorrect;
                  return true;
                })
                .map((q, idx) => {
                  const isCorrect = userAnswers[q.id] === q.correctIndex;
                  const userAnswerIdx = userAnswers[q.id];

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-4 md:p-5 rounded-[18px_12px_16px_14px] border-2 space-y-3 ${
                        isCorrect ? 'bg-emerald-50/70 border-emerald-400' : 'bg-rose-50/70 border-rose-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center text-white ${
                              isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          >
                            {isCorrect ? '✓' : '✕'}
                          </span>
                          <span className="text-xs font-black text-zinc-500 uppercase">ข้อที่ {idx + 1}</span>
                        </div>
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                            isCorrect
                              ? 'bg-emerald-200 text-emerald-950 border-emerald-600'
                              : 'bg-rose-200 text-rose-950 border-rose-600'
                          }`}
                        >
                          {isCorrect ? 'ตอบถูกต้อง (+10 ⭐)' : 'ตอบไม่ถูกต้อง'}
                        </span>
                      </div>

                      <h5 className="text-sm md:text-base font-black text-zinc-900">{q.question}</h5>

                      {q.imageUrl && (
                        <div className="my-2 max-h-52 max-w-sm rounded-xl border border-zinc-300 bg-white p-1 overflow-hidden">
                          <img src={q.imageUrl} alt={`ภาพประกอบข้อ ${idx + 1}`} className="max-h-48 w-auto mx-auto object-contain rounded-lg" />
                        </div>
                      )}

                      {/* Options breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, optIdx) => {
                          const isOptCorrect = optIdx === q.correctIndex;
                          const isOptSelected = optIdx === userAnswerIdx;

                          let style = 'bg-white/80 border-zinc-200 text-zinc-700';
                          if (isOptCorrect) {
                            style = 'bg-emerald-200 border-emerald-600 text-emerald-950 font-black';
                          } else if (isOptSelected && !isOptCorrect) {
                            style = 'bg-rose-200 border-rose-500 text-rose-950 font-bold line-through';
                          }

                          return (
                            <div key={optIdx} className={`p-2.5 rounded-xl border flex items-center gap-2 ${style}`}>
                              <span className="w-5 h-5 rounded-full border border-zinc-900 flex items-center justify-center text-[10px] font-bold shrink-0 bg-white">
                                {isOptCorrect ? '✓' : String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      {q.explanation && (
                        <div className="p-3 bg-white/95 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-800">
                          <div className="font-black text-sky-900 mb-0.5 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>เฉลยและหลักการทางวิทยาศาสตร์:</span>
                          </div>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Quiz Modal */}
      <ConfirmDeleteModal
        isOpen={deletingQuiz !== null}
        title="ยืนยันการลบชุดแบบทดสอบ"
        itemName={deletingQuiz?.title}
        itemType="ชุดแบบทดสอบ"
        description="เมื่อลบแล้ว ชุดคำถามและประวัติการสอบของชุดนี้จะถูกนำออกจากระบบทันที"
        onConfirm={handleConfirmDeleteQuiz}
        onClose={() => setDeletingQuiz(null)}
      />

      {/* Google Sheets Sync & Setup Modal */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        examScores={examScores}
      />
    </div>
  );
};
