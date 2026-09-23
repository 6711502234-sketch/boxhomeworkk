import React, { useState } from 'react';
import { UserProfile, Homework, TeacherEvaluation, QuizLesson } from '../types';
import { triggerFestiveConfetti } from '../utils/confetti';
import {
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  MessageSquare,
  Sparkles,
  Award,
  BookOpen,
  Send,
  X,
  Check
} from 'lucide-react';

interface TeacherHubViewProps {
  currentUser: UserProfile;
  homeworkList: Homework[];
  evaluations: TeacherEvaluation[];
  lessons: QuizLesson[];
  onReviewHomework: (
    homeworkId: string,
    score: number,
    comment: string,
    status: 'reviewed' | 'needs_fix'
  ) => void;
  onAwardStars: (amount: number, reason: string) => void;
}

export const TeacherHubView: React.FC<TeacherHubViewProps> = ({
  currentUser,
  homeworkList,
  evaluations,
  lessons,
  onReviewHomework,
  onAwardStars,
}) => {
  const [selectedReviewHw, setSelectedReviewHw] = useState<Homework | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(10);
  const [commentInput, setCommentInput] = useState<string>('ทำงานได้ยอดเยี่ยม ชัดเจน ครบถ้วนตามตัวชี้วัด ม.3!');
  const [statusInput, setStatusInput] = useState<'reviewed' | 'needs_fix'>('reviewed');

  // Compute evaluation stats
  const totalEvals = evaluations.length;
  const avgRating =
    totalEvals > 0
      ? (evaluations.reduce((sum, e) => sum + e.ratingStars, 0) / totalEvals).toFixed(1)
      : '5.0';

  const pendingHomeworks = homeworkList.filter((h) => h.status === 'pending');
  const reviewedHomeworks = homeworkList.filter((h) => h.status === 'reviewed');

  const openReviewModal = (hw: Homework) => {
    setSelectedReviewHw(hw);
    setScoreInput(hw.teacherScore ?? 10);
    setCommentInput(hw.teacherComment || 'ทำงานได้ยอดเยี่ยม ชัดเจน ครบถ้วนตามตัวชี้วัด ม.3!');
    setStatusInput(hw.status === 'needs_fix' ? 'needs_fix' : 'reviewed');
  };

  const handleSaveReview = () => {
    if (!selectedReviewHw) return;

    onReviewHomework(selectedReviewHw.id, scoreInput, commentInput, statusInput);
    triggerFestiveConfetti();
    setSelectedReviewHw(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#F3E8FF] sketch-border rounded-[24px_16px_22px_18px] p-6 shadow-[5px_5px_0px_#18181b] relative overflow-hidden">
        <div className="washi-tape -top-2 left-10 rotate-[-2deg] bg-amber-300" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-purple-300 sketch-border rounded-[16px_12px_14px_10px] flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000]">
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-zinc-900">
                  ห้องพักครู & แดชบอร์ดผู้สอน (Teacher Hub)
                </h2>
                <span className="bg-purple-200 text-purple-950 font-black text-xs px-2.5 py-0.5 rounded-full border border-zinc-900">
                  ระดับชั้น ม.3
                </span>
              </div>
              <p className="text-xs md:text-sm font-semibold text-zinc-700 mt-0.5">
                ตรวจการบ้าน ให้คะแนนและฟีดแบ็ก พร้อมสรุปความคิดเห็นและผลประเมินจากนักเรียน
              </p>
            </div>
          </div>
          <div className="text-xs bg-white px-3.5 py-2 rounded-xl border-2 border-zinc-900 font-bold shadow-[2px_2px_0px_#000]">
            ผู้ดูแล: {currentUser.name}
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white sketch-border rounded-[18px_12px_16px_14px] p-4 shadow-[4px_4px_0px_#18181b]">
          <div className="text-xs font-bold text-zinc-500">การบ้านที่รอตรวจ</div>
          <div className="text-3xl font-black text-amber-600 mt-1">
            {pendingHomeworks.length}{' '}
            <span className="text-xs font-bold text-zinc-500">งาน</span>
          </div>
        </div>

        <div className="bg-white sketch-border rounded-[18px_12px_16px_14px] p-4 shadow-[4px_4px_0px_#18181b]">
          <div className="text-xs font-bold text-zinc-500">การบ้านที่ตรวจแล้ว</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">
            {reviewedHomeworks.length}{' '}
            <span className="text-xs font-bold text-zinc-500">งาน</span>
          </div>
        </div>

        <div className="bg-white sketch-border rounded-[18px_12px_16px_14px] p-4 shadow-[4px_4px_0px_#18181b]">
          <div className="text-xs font-bold text-zinc-500">คะแนนความพึงพอใจเฉลี่ย</div>
          <div className="text-3xl font-black text-pink-600 mt-1 flex items-center gap-1">
            ⭐ {avgRating}{' '}
            <span className="text-xs font-bold text-zinc-500">/ 5.0</span>
          </div>
        </div>

        <div className="bg-white sketch-border rounded-[18px_12px_16px_14px] p-4 shadow-[4px_4px_0px_#18181b]">
          <div className="text-xs font-bold text-zinc-500">จำนวนเสียงสะท้อนจากนักเรียน</div>
          <div className="text-3xl font-black text-sky-600 mt-1">
            {totalEvals}{' '}
            <span className="text-xs font-bold text-zinc-500">แบบประเมิน</span>
          </div>
        </div>
      </div>

      {/* Homework Review Queue Section */}
      <div className="bg-white sketch-border-lg rounded-[24px_16px_22px_18px] p-6 shadow-[5px_5px_0px_#18181b]">
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-200 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <h3 className="text-lg md:text-xl font-black text-zinc-900">
              คลังตรวจการบ้านนักเรียน ม.3 (Submission Queue)
            </h3>
          </div>
          <span className="text-xs bg-amber-100 text-amber-900 font-black px-3 py-1 rounded-full border border-zinc-900">
            ทั้งหมด {homeworkList.length} รายการ
          </span>
        </div>

        {homeworkList.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 font-bold text-sm">
            ยังไม่มีนักเรียนส่งการบ้านเข้ามาในขณะนี้
          </div>
        ) : (
          <div className="space-y-3">
            {homeworkList.map((hw) => (
              <div
                key={hw.id}
                className="bg-[#FFFDF5] p-4 rounded-[18px_12px_16px_14px] border-2 border-zinc-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[2px_2px_0px_#000]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200 border border-zinc-900">
                      {hw.subject}
                    </span>
                    {hw.status === 'reviewed' ? (
                      <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> ตรวจแล้ว ({hw.teacherScore}/10)
                      </span>
                    ) : hw.status === 'needs_fix' ? (
                      <span className="text-[11px] font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded border border-orange-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> แจ้งให้นักเรียนแก้ไข
                      </span>
                    ) : (
                      <span className="text-[11px] font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> รอการตรวจ
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-zinc-900">
                    {hw.title}
                  </h4>
                  <div className="text-xs font-semibold text-zinc-600 flex items-center gap-2">
                    <span>
                      {hw.studentAvatar} {hw.studentName} ({hw.studentClass})
                    </span>
                    <span>• ส่งเมื่อ: {hw.submittedAt}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openReviewModal(hw)}
                  className="px-4 py-2 bg-purple-300 hover:bg-purple-400 text-zinc-950 font-black text-xs rounded-xl sketch-btn cursor-pointer shrink-0 shadow-[2px_2px_0px_#000]"
                >
                  {hw.status === 'reviewed' ? 'แก้ไขผลตรวจ / เพิ่มคำติชม' : 'ตรวจงานและให้คะแนน ✏️'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Evaluation Feedback Wall */}
      <div className="bg-[#FFFDF5] sketch-border-lg rounded-[24px_16px_22px_18px] p-6 shadow-[5px_5px_0px_#18181b]">
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-200 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <h3 className="text-lg md:text-xl font-black text-zinc-900">
              เสียงสะท้อนและผลประเมินจากนักเรียน (Student Feedback)
            </h3>
          </div>
          <span className="text-xs font-bold text-zinc-600">
            เฉลี่ย ⭐ {avgRating} / 5.0
          </span>
        </div>

        {evaluations.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 font-bold text-sm">
            ยังไม่มีแบบประเมินถูกส่งเข้ามา
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluations.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-[18px_12px_16px_14px] border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500 font-black">
                    {'⭐'.repeat(item.ratingStars)}
                    <span className="text-xs text-zinc-700 ml-1">
                      ({item.ratingStars}/5 ดาว)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400">
                    {item.submittedAt}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-zinc-800">
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                    <span className="font-bold text-rose-900">💡 สิ่งที่อยากให้ครูปรับปรุง:</span>
                    <p className="mt-0.5 italic">{item.improvementText}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-sky-50 border border-sky-200">
                    <span className="font-bold text-sky-900">💌 สิ่งที่อยากแนะนำครู:</span>
                    <p className="mt-0.5 italic">{item.recommendationText}</p>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-zinc-500 pt-1 flex items-center justify-between">
                  <span>ผู้ประเมิน: {item.studentName}</span>
                  <span>{item.studentClass}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReviewHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF5] sketch-border-lg rounded-[26px_18px_24px_20px] p-6 md:p-8 max-w-lg w-full relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="washi-tape -top-3 left-10 bg-purple-300 rotate-[-2deg]" />

            <button
              onClick={() => setSelectedReviewHw(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-rose-200 hover:bg-rose-300 border-2 border-zinc-900 flex items-center justify-center font-bold text-zinc-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-zinc-900 mb-1">
              ตรวจและให้คะแนนการบ้าน
            </h3>
            <p className="text-xs font-bold text-zinc-600 mb-4">
              งาน: {selectedReviewHw.title} ({selectedReviewHw.studentName})
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border-2 border-zinc-900 mb-4 text-xs space-y-1 font-semibold text-zinc-800">
              <div><span className="font-bold">คำอธิบายงาน:</span> {selectedReviewHw.description}</div>
              {selectedReviewHw.link && (
                <div>
                  <span className="font-bold">ลิงก์แนบ:</span>{' '}
                  <a
                    href={selectedReviewHw.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 underline font-bold"
                  >
                    เปิดดูผลงาน
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  สถานะการตรวจ
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as any)}
                  className="w-full bg-white p-2 rounded-xl sketch-input text-xs font-semibold"
                >
                  <option value="reviewed">🟢 ตรวจผ่านเรียบร้อย (Reviewed)</option>
                  <option value="needs_fix">🟠 ส่งกลับให้นักเรียนแก้ไข (Needs Revision)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  คะแนนที่ได้ (เต็ม 10 คะแนน)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={scoreInput}
                  onChange={(e) => setScoreInput(Number(e.target.value))}
                  className="w-full bg-white p-2.5 rounded-xl sketch-input text-sm font-black text-amber-900"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  ข้อเสนอแนะและคำชมจากคุณครู
                </label>
                <textarea
                  rows={3}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-xl sketch-input text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedReviewHw(null)}
                className="flex-1 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-xs rounded-xl sketch-btn"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="flex-1 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black text-xs rounded-xl sketch-btn flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#18181b]"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกผลการตรวจ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
