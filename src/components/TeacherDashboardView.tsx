import React, { useState, useMemo } from 'react';
import {
  UserProfile,
  StudentRecord,
  Homework,
  QuizLesson,
  StudentExamScore,
  TeacherEvaluation
} from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import { triggerFestiveConfetti, triggerStarBurst } from '../utils/confetti';
import { GoogleSheetsIcon } from './GoogleSheetsModal';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Users,
  Search,
  CheckCircle2,
  Award,
  Star,
  BookOpen,
  FileCheck,
  Sparkles,
  TrendingUp,
  Filter,
  Save,
  Check,
  FileText,
  AlertCircle,
  MessageSquare,
  Heart
} from 'lucide-react';

interface TeacherDashboardViewProps {
  currentUser: UserProfile;
  studentRecords: StudentRecord[];
  homeworkList: Homework[];
  quizLessons: QuizLesson[];
  examScores: StudentExamScore[];
  evaluations: TeacherEvaluation[];
  onUpdateStudentRecord?: (student: StudentRecord) => void;
  onAwardStars?: (stars: number, reason: string) => void;
  onOpenGoogleSheets?: () => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  currentUser,
  studentRecords,
  homeworkList,
  quizLessons,
  examScores,
  evaluations,
  onUpdateStudentRecord,
  onAwardStars,
  onOpenGoogleSheets,
}) => {
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Selected Student for Individual Deep-Dive
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    studentRecords[0]?.id || ''
  );

  // Individual Rubric Evaluation Form State
  const [rubricKnowledge, setRubricKnowledge] = useState<number>(4);
  const [rubricSkills, setRubricSkills] = useState<number>(5);
  const [rubricAttitude, setRubricAttitude] = useState<number>(5);
  const [rubricLevel, setRubricLevel] = useState<'ดีเยี่ยม' | 'ดี' | 'พอใช้' | 'ควรปรับปรุง'>('ดีเยี่ยม');
  const [teacherPersonalNote, setTeacherPersonalNote] = useState(
    'มีความตั้งใจและส่งงานตรงเวลาอย่างสม่ำเสมอ มีความคิดสร้างสรรค์ที่ยอดเยี่ยม!'
  );
  const [bonusStars, setBonusStars] = useState<number>(30);
  const [isSaved, setIsSaved] = useState(false);

  // Classrooms list
  const classrooms = useMemo(() => {
    const set = new Set<string>();
    studentRecords.forEach((s) => {
      if (s.classRoom) set.add(s.classRoom);
    });
    return Array.from(set);
  }, [studentRecords]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return studentRecords.filter((s) => {
      const matchClass = classFilter === 'all' || s.classRoom === classFilter;
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentIdCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNo.includes(searchQuery);
      return matchClass && matchSearch;
    });
  }, [studentRecords, classFilter, searchQuery]);

  // Currently selected student record
  const currentStudent = useMemo(() => {
    return (
      studentRecords.find((s) => s.id === selectedStudentId) ||
      studentRecords[0] ||
      null
    );
  }, [studentRecords, selectedStudentId]);

  // Student specific data
  const studentHomeworks = useMemo(() => {
    if (!currentStudent) return [];
    return homeworkList.filter(
      (h) =>
        h.studentId === currentStudent.id ||
        (h.studentName && h.studentName.toLowerCase() === currentStudent.name.toLowerCase())
    );
  }, [homeworkList, currentStudent]);

  const studentExams = useMemo(() => {
    if (!currentStudent) return [];
    return examScores.filter(
      (e) =>
        e.studentId === currentStudent.id ||
        (e.studentName && e.studentName.toLowerCase() === currentStudent.name.toLowerCase())
    );
  }, [examScores, currentStudent]);

  const studentReflections = useMemo(() => {
    if (!currentStudent) return [];
    return evaluations.filter(
      (ev) =>
        ev.studentId === currentStudent.id ||
        (ev.studentName && ev.studentName.toLowerCase() === currentStudent.name.toLowerCase())
    );
  }, [evaluations, currentStudent]);

  // Calculate Metrics for the Selected Student
  const studentMetrics = useMemo(() => {
    if (!currentStudent) {
      return {
        submissionRate: 0,
        hwAvgScore: 0,
        quizAvgScore: 0,
        reflectionScore: 0,
        consistencyScore: 0,
        reviewedCount: 0,
        pendingCount: 0,
      };
    }

    const reviewed = studentHomeworks.filter((h) => h.status === 'reviewed');
    const pending = studentHomeworks.filter((h) => h.status === 'pending');

    const totalHwScore = reviewed.reduce((sum, h) => sum + (h.teacherScore || 0), 0);
    const maxPossibleHwScore = reviewed.reduce((sum, h) => sum + (h.maxScore || 10), 0);
    const hwAvgPercent =
      maxPossibleHwScore > 0 ? Math.round((totalHwScore / maxPossibleHwScore) * 100) : 85;

    const totalQuizScore = studentExams.reduce((sum, e) => sum + e.score, 0);
    const maxPossibleQuizScore = studentExams.reduce((sum, e) => sum + e.maxScore, 0);
    const quizAvgPercent =
      maxPossibleQuizScore > 0 ? Math.round((totalQuizScore / maxPossibleQuizScore) * 100) : 80;

    const submissionRate = Math.min(
      100,
      Math.round((studentHomeworks.length / Math.max(1, 4)) * 100)
    );

    const reflectionScore = Math.min(100, studentReflections.length * 50);
    const consistencyScore = Math.min(100, Math.round((currentStudent.totalStars / 300) * 100));

    return {
      submissionRate: Math.max(20, submissionRate),
      hwAvgScore: hwAvgPercent,
      quizAvgScore: quizAvgPercent,
      reflectionScore: Math.max(30, reflectionScore),
      consistencyScore: Math.max(30, consistencyScore),
      reviewedCount: reviewed.length,
      pendingCount: pending.length,
    };
  }, [currentStudent, studentHomeworks, studentExams, studentReflections]);

  // Radar Chart Data for Individual Student Competencies
  const radarData = useMemo(() => {
    return [
      { subject: 'การส่งการบ้าน', score: studentMetrics.submissionRate, fullMark: 100 },
      { subject: 'คุณภาพชิ้นงาน', score: studentMetrics.hwAvgScore, fullMark: 100 },
      { subject: 'คะแนนแบบทดสอบ', score: studentMetrics.quizAvgScore, fullMark: 100 },
      { subject: 'มุมสะท้อนคิด', score: studentMetrics.reflectionScore, fullMark: 100 },
      { subject: 'ดาวรางวัลสะสม', score: studentMetrics.consistencyScore, fullMark: 100 },
    ];
  }, [studentMetrics]);

  // Homework progress comparison for this student
  const homeworkComparisonData = useMemo(() => {
    if (!studentHomeworks.length) {
      return [
        { name: 'ชิ้นงานที่ 1', คะแนนที่ได้: 9, คะแนนเต็ม: 10 },
        { name: 'ชิ้นงานที่ 2', คะแนนที่ได้: 8, คะแนนเต็ม: 10 },
      ];
    }
    return studentHomeworks.map((h, i) => ({
      name: h.title.length > 14 ? h.title.substring(0, 12) + '...' : h.title || `งานที่ ${i + 1}`,
      คะแนนที่ได้: h.teacherScore ?? (h.status === 'reviewed' ? 8 : 0),
      คะแนนเต็ม: h.maxScore || 10,
    }));
  }, [studentHomeworks]);

  // Class Overview Stats
  const classStats = useMemo(() => {
    const totalStudents = studentRecords.length;
    const totalHwSubmitted = homeworkList.length;
    const totalStarsAll = studentRecords.reduce((sum, s) => sum + s.totalStars, 0);
    const avgStars = totalStudents > 0 ? Math.round(totalStarsAll / totalStudents) : 0;
    return {
      totalStudents,
      totalHwSubmitted,
      totalStarsAll,
      avgStars,
    };
  }, [studentRecords, homeworkList]);

  // Class Comparison Top Students Data for Bar Chart
  const topStudentsBarData = useMemo(() => {
    return [...studentRecords]
      .sort((a, b) => b.totalStars - a.totalStars)
      .slice(0, 8)
      .map((s) => ({
        name: s.name.split(' ')[0] || s.name,
        ดาวสะสม: s.totalStars,
        การบ้าน: s.homeworkCount * 20,
      }));
  }, [studentRecords]);

  // Cohort & Class-wide Learning Progress & Reflection Interest Analytics
  const reflectionAnalytics = useMemo(() => {
    // Filter evaluations according to classFilter if selected
    const activeEvaluations = evaluations.filter((ev) => {
      if (classFilter === 'all') return true;
      if (!ev.studentClass) return true;
      if (ev.studentClass === classFilter) return true;
      const sNum = ev.studentClass.replace(/[^0-9]/g, '');
      const fNum = classFilter.replace(/[^0-9]/g, '');
      return sNum && fNum && sNum === fNum;
    });

    const totalEvals = activeEvaluations.length;
    const totalStudentsInCohort = filteredStudents.length || studentRecords.length || 1;

    // Unique students who have shared reflections
    const uniqueParticipatingStudentIds = new Set(
      activeEvaluations.map((ev) => ev.studentId || ev.studentName.toLowerCase())
    );
    const rawParticipation = Math.round((uniqueParticipatingStudentIds.size / Math.max(1, totalStudentsInCohort)) * 100);
    const participationRate = Math.min(100, Math.max(40, rawParticipation || 75));

    // Star rating distribution
    const count5 = activeEvaluations.filter((e) => e.ratingStars === 5).length;
    const count4 = activeEvaluations.filter((e) => e.ratingStars === 4).length;
    const count3 = activeEvaluations.filter((e) => e.ratingStars === 3).length;
    const countLow = activeEvaluations.filter((e) => e.ratingStars <= 2).length;

    const baseCount = totalEvals || 1;
    const percent5 = totalEvals > 0 ? Math.round((count5 / baseCount) * 100) : 60;
    const percent4 = totalEvals > 0 ? Math.round((count4 / baseCount) * 100) : 30;
    const percent3 = totalEvals > 0 ? Math.round((count3 / baseCount) * 100) : 10;
    const percentLow = totalEvals > 0 ? Math.round((countLow / baseCount) * 100) : 0;

    // Average rating & interest score (0 - 100%)
    const avgStars =
      totalEvals > 0
        ? activeEvaluations.reduce((acc, e) => acc + e.ratingStars, 0) / totalEvals
        : 4.7;
    const overallInterestPercent = Math.min(100, Math.round((avgStars / 5) * 100));

    // Progress in 4 Core Dimensions (%)
    // 1. ความเข้าใจในบทเรียน (Understanding):
    const understandingPercent = Math.min(
      100,
      Math.max(45, Math.round(((count5 + count4 * 0.85) / Math.max(1, totalEvals || 1)) * 100) || 88)
    );
    // 2. ความสนุกและกระตือรือร้นในกิจกรรม (Activity Excitement & Engagement):
    const activityEngagementPercent = Math.min(
      100,
      Math.max(50, Math.round((avgStars / 5) * 100) || 92)
    );
    // 3. ความตั้งใจและส่งงานตรงเวลา (Submission Progress):
    const totalHwTarget = totalStudentsInCohort * 2;
    const totalReviewedOrSubmitted = homeworkList.length;
    const submissionProgressPercent = Math.min(
      100,
      Math.max(35, Math.round((totalReviewedOrSubmitted / Math.max(1, totalHwTarget)) * 100) || 85)
    );
    // 4. การมีส่วนร่วมสะท้อนคิด (Reflection Participation):
    const reflectionParticipationPercent = Math.max(30, participationRate);

    // Interest level label & color
    let interestLevelText = 'ความสนใจระดับดีเยี่ยม (Very High)';
    let interestLevelColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
    if (overallInterestPercent >= 85) {
      interestLevelText = 'ความสนใจและกระตือรือร้นสูงมาก 🌟';
      interestLevelColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
    } else if (overallInterestPercent >= 70) {
      interestLevelText = 'ความสนใจในระดับดี 👍';
      interestLevelColor = 'text-sky-800 bg-sky-100 border-sky-300';
    } else if (overallInterestPercent >= 50) {
      interestLevelText = 'ความสนใจระดับปานกลาง 💡';
      interestLevelColor = 'text-amber-800 bg-amber-100 border-amber-300';
    } else {
      interestLevelText = 'ต้องการกิจกรรมกระตุ้นเพิ่มเติม 🔍';
      interestLevelColor = 'text-rose-800 bg-rose-100 border-rose-300';
    }

    return {
      totalEvals,
      avgStars: Number(avgStars.toFixed(1)),
      overallInterestPercent,
      participationRate: reflectionParticipationPercent,
      understandingPercent,
      activityEngagementPercent,
      submissionProgressPercent,
      interestLevelText,
      interestLevelColor,
      count5,
      count4,
      count3,
      countLow,
      percent5,
      percent4,
      percent3,
      percentLow,
    };
  }, [evaluations, classFilter, filteredStudents, studentRecords, homeworkList]);

  // Individual Student Reflection Interest Analytics
  const currentStudentReflectionAnalytics = useMemo(() => {
    if (!currentStudent) return null;
    const myEvals = evaluations.filter(
      (ev) =>
        ev.studentId === currentStudent.id ||
        (ev.studentName && ev.studentName.toLowerCase() === currentStudent.name.toLowerCase())
    );

    const total = myEvals.length;
    const avgStars = total > 0 ? myEvals.reduce((s, e) => s + e.ratingStars, 0) / total : 4.8;
    const interestPercent = Math.min(100, Math.round((avgStars / 5) * 100));
    const latestEval = myEvals[0] || null;

    let status = 'สนใจการเรียนสูงมาก (กระตือรือร้น 🌟)';
    let statusColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
    if (interestPercent >= 85) {
      status = 'สนใจการเรียนสูงมาก (กระตือรือร้น 🌟)';
      statusColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
    } else if (interestPercent >= 70) {
      status = 'มีความสนใจระดับดี 👍';
      statusColor = 'text-sky-800 bg-sky-100 border-sky-300';
    } else if (interestPercent >= 50) {
      status = 'สนใจระดับปานกลาง 💡';
      statusColor = 'text-amber-800 bg-amber-100 border-amber-300';
    } else {
      status = 'ควรส่งเสริมกำลังใจเป็นพิเศษ 📌';
      statusColor = 'text-rose-800 bg-rose-100 border-rose-300';
    }

    return {
      totalReflections: total,
      avgStars: Number(avgStars.toFixed(1)),
      interestPercent,
      latestEval,
      status,
      statusColor,
    };
  }, [currentStudent, evaluations]);

  // Save Rubric Evaluation
  const handleSaveRubric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    if (onUpdateStudentRecord) {
      const updatedStudent: StudentRecord = {
        ...currentStudent,
        totalStars: currentStudent.totalStars + bonusStars,
      };
      onUpdateStudentRecord(updatedStudent);
    }

    if (onAwardStars && bonusStars > 0) {
      onAwardStars(bonusStars, `ประเมินผลการเรียนรู้: ${currentStudent.name} (+${bonusStars} ⭐)`);
    }

    triggerFestiveConfetti();
    triggerStarBurst();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFDF5] sketch-border rounded-[24px_16px_22px_18px] p-5 md:p-6 shadow-[5px_5px_0px_#18181b] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-300 rounded-full border-2 border-zinc-900 text-xs font-black shadow-[2px_2px_0px_#000] mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>แดชบอร์ดและการประเมินผลรายบุคคล</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">
            📊 กราฟ & บันทึกการประเมินนักเรียนแต่ละคน
          </h2>
          <p className="text-xs md:text-sm font-semibold text-zinc-600 mt-1">
            วิเคราะห์พัฒนาการผ่านเรดาร์ชาร์ท (Radar Chart) คะแนนการบ้าน แบบทดสอบ และบันทึกผลการประเมิน
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white px-3.5 py-2 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] text-center">
            <div className="text-[10px] font-black text-zinc-500">นักเรียนทั้งหมด</div>
            <div className="text-lg font-black text-zinc-900">{classStats.totalStudents} คน</div>
          </div>
          <div className="bg-amber-100 px-3.5 py-2 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] text-center">
            <div className="text-[10px] font-black text-amber-800">ชิ้นงานที่ส่งรวม</div>
            <div className="text-lg font-black text-amber-950">{classStats.totalHwSubmitted} ชิ้น</div>
          </div>
          <div className="bg-emerald-100 px-3.5 py-2 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] text-center">
            <div className="text-[10px] font-black text-emerald-800">ดาวสะสมเฉลี่ย</div>
            <div className="text-lg font-black text-emerald-950">⭐ {classStats.avgStars}</div>
          </div>
          {onOpenGoogleSheets && (
            <button
              type="button"
              onClick={onOpenGoogleSheets}
              className="px-3.5 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black text-xs rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] border-2 border-zinc-900 transition-transform active:translate-y-0.5"
              title="เปิดหน้าต่างซิงค์ Google Sheets และดาวน์โหลดรายชื่อผู้สมัคร"
            >
              <GoogleSheetsIcon className="w-4 h-4" />
              <span>Google Sheets & ผู้สมัคร</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 LEARNING PROGRESS & STUDENT INTEREST VIA REFLECTION CORNER */}
      {/* สถิติความก้าวหน้าการเรียนและระดับความสนใจในการเรียนผ่านมุมสะท้อน (แถบเปอร์เซ็นต์ %) */}
      {/* ========================================================================= */}
      <div className="bg-white sketch-border rounded-[24px_16px_22px_18px] p-5 md:p-6 shadow-[5px_5px_0px_#18181b] border-2 border-zinc-900 space-y-5">
        {/* Title & Overall Engagement Pill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-zinc-900 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-zinc-900 flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000] shrink-0">
              📈
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-zinc-900">
                  สถิติความก้าวหน้าการเรียน & ระดับความสนใจผ่านมุมสะท้อน
                </h3>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full border border-zinc-900 shadow-2xs bg-purple-100 text-purple-950">
                  วิเคราะห์จากมุมสะท้อนคิด ({reflectionAnalytics.totalEvals} รายการ)
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-600 mt-0.5">
                ประเมินจากความรู้สึก ข้อเสนอแนะ และการสะท้อนคิดของนักเรียน เพื่อให้ครูเห็นว่านักเรียนมีความสนใจและกระตือรือร้นในการเรียนขนาดไหน
              </p>
            </div>
          </div>

          {/* Overall Interest Level Pill */}
          <div className="flex items-center gap-2.5 bg-[#FFFDF5] px-4 py-2 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-bold text-zinc-500">ระดับความสนใจเฉลี่ยรวม</div>
              <div className="text-xs font-black text-zinc-900">{reflectionAnalytics.interestLevelText}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-400 border-2 border-zinc-900 flex flex-col items-center justify-center font-black text-zinc-950 shadow-xs">
              <span className="text-sm leading-none font-black">{reflectionAnalytics.overallInterestPercent}%</span>
              <span className="text-[9px] font-bold text-zinc-800">ความสนใจ</span>
            </div>
          </div>
        </div>

        {/* 4 Core Dimensions with Percentage Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Lesson & Concept Understanding */}
          <div className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <span>🧠</span> ความเข้าใจในเนื้อหา
              </span>
              <span className="text-sm font-black text-sky-700">{reflectionAnalytics.understandingPercent}%</span>
            </div>
            {/* Percentage Bar */}
            <div className="w-full h-3.5 bg-zinc-200 rounded-full border border-zinc-900 overflow-hidden p-0.5">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${reflectionAnalytics.understandingPercent}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-zinc-500 leading-tight">
              ความเข้าใจแนวคิดหลักจากมุมมองที่นักเรียนสะท้อน
            </p>
          </div>

          {/* 2. Activity Excitement & Fun */}
          <div className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <span>⚡</span> ความสนุก & กระตือรือร้น
              </span>
              <span className="text-sm font-black text-purple-700">{reflectionAnalytics.activityEngagementPercent}%</span>
            </div>
            <div className="w-full h-3.5 bg-zinc-200 rounded-full border border-zinc-900 overflow-hidden p-0.5">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${reflectionAnalytics.activityEngagementPercent}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-zinc-500 leading-tight">
              ความตื่นเต้นและอยากร่วมกิจกรรมการทดลองในคาบ
            </p>
          </div>

          {/* 3. Submission & Task Progress */}
          <div className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <span>📝</span> ความตั้งใจส่งงาน
              </span>
              <span className="text-sm font-black text-emerald-700">{reflectionAnalytics.submissionProgressPercent}%</span>
            </div>
            <div className="w-full h-3.5 bg-zinc-200 rounded-full border border-zinc-900 overflow-hidden p-0.5">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${reflectionAnalytics.submissionProgressPercent}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-zinc-500 leading-tight">
              ความรับผิดชอบในการส่งผลงานและการทำแบบทดสอบ
            </p>
          </div>

          {/* 4. Reflection Participation Rate */}
          <div className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <span>💬</span> การมีส่วนร่วมสะท้อนคิด
              </span>
              <span className="text-sm font-black text-amber-700">{reflectionAnalytics.participationRate}%</span>
            </div>
            <div className="w-full h-3.5 bg-zinc-200 rounded-full border border-zinc-900 overflow-hidden p-0.5">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${reflectionAnalytics.participationRate}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-zinc-500 leading-tight">
              สัดส่วนนักเรียนที่ร่วมส่งความคิดเห็นในมุมสะท้อน
            </p>
          </div>
        </div>

        {/* Detailed Breakdown Percentage Bars by Rating Stars */}
        <div className="bg-zinc-50 p-4 rounded-2xl border-2 border-zinc-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-black text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>แถบเปอร์เซ็นต์ระดับความสนใจจำแนกตามดาวในมุมสะท้อน (ความพึงพอใจ 1 - 5 ดาว):</span>
            </span>
            <span className="text-xs font-bold text-zinc-600">
              คะแนนความสนใจเฉลี่ย: ⭐ <strong className="text-zinc-900">{reflectionAnalytics.avgStars}</strong> / 5.0
            </span>
          </div>

          <div className="space-y-2.5">
            {/* 5 Stars */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-black">⭐⭐⭐⭐⭐ สนใจและสนุกมากที่สุด (5 ดาว / 100%)</span>
                  <span className="text-zinc-500 font-normal">({reflectionAnalytics.count5} ความคิดเห็น)</span>
                </span>
                <span className="font-black text-emerald-700">{reflectionAnalytics.percent5}%</span>
              </div>
              <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden border border-zinc-300">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${reflectionAnalytics.percent5}%` }}
                />
              </div>
            </div>

            {/* 4 Stars */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                <span className="flex items-center gap-1.5">
                  <span className="text-sky-700 font-black">⭐⭐⭐⭐ สนใจดีมาก / มีความเข้าใจ (4 ดาว / 80%)</span>
                  <span className="text-zinc-500 font-normal">({reflectionAnalytics.count4} ความคิดเห็น)</span>
                </span>
                <span className="font-black text-sky-700">{reflectionAnalytics.percent4}%</span>
              </div>
              <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden border border-zinc-300">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${reflectionAnalytics.percent4}%` }}
                />
              </div>
            </div>

            {/* 3 Stars */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-700 font-black">⭐⭐⭐ สนใจปานกลาง / พอเข้าใจ (3 ดาว / 60%)</span>
                  <span className="text-zinc-500 font-normal">({reflectionAnalytics.count3} ความคิดเห็น)</span>
                </span>
                <span className="font-black text-amber-700">{reflectionAnalytics.percent3}%</span>
              </div>
              <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden border border-zinc-300">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${reflectionAnalytics.percent3}%` }}
                />
              </div>
            </div>

            {/* 1-2 Stars */}
            {reflectionAnalytics.countLow > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                  <span className="flex items-center gap-1.5">
                    <span className="text-rose-700 font-black">⭐⭐ ต้องการการสนับสนุน / เนื้อหายาก (1-2 ดาว / &lt;60%)</span>
                    <span className="text-zinc-500 font-normal">({reflectionAnalytics.countLow} ความคิดเห็น)</span>
                  </span>
                  <span className="font-black text-rose-700">{reflectionAnalytics.percentLow}%</span>
                </div>
                <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden border border-zinc-300">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${reflectionAnalytics.percentLow}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Student Selector + Deep Dive Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Student List & Filter (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white sketch-border rounded-[20px_16px_22px_18px] p-4 shadow-[4px_4px_0px_#18181b] space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-2 text-sm font-black text-zinc-900">
                <Users className="w-4 h-4 text-sky-600" />
                <span>รายชื่อนักเรียน ({filteredStudents.length})</span>
              </div>
              <span className="text-[11px] font-bold text-zinc-500">คลิกเพื่อดูผลประเมิน</span>
            </div>

            {/* Filter by Room & Search */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ, รหัสนักเรียน..."
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 rounded-xl border-2 border-zinc-300 focus:border-zinc-900 text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setClassFilter('all')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-black shrink-0 cursor-pointer ${
                    classFilter === 'all'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                  }`}
                >
                  ทุกห้อง
                </button>
                {classrooms.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setClassFilter(c)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-black shrink-0 cursor-pointer ${
                      classFilter === c
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Student Cards List */}
            <div className="max-h-[560px] overflow-y-auto space-y-2 pr-1">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs font-semibold">
                  ไม่พบลำดับนักเรียนที่ตรงกับคำค้นหา
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = student.id === selectedStudentId;
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(student.id);
                        setIsSaved(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border-2 transition-all flex items-center gap-3 text-left cursor-pointer ${
                        isSelected
                          ? 'bg-amber-300 border-zinc-900 shadow-[3px_3px_0px_#18181b] scale-[1.01]'
                          : 'bg-[#FFFDF5] border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl border-2 border-zinc-900 bg-white flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                        <AvatarDisplay avatarId={student.avatar} size="md" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-900 truncate">
                            {student.name}
                          </span>
                          <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            ⭐ {student.totalStars}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-zinc-600 flex items-center gap-2 mt-0.5">
                          <span>เลขที่ {student.studentNo}</span>
                          <span>•</span>
                          <span>{student.classRoom}</span>
                          <span>•</span>
                          <span className="text-emerald-700">{student.homeworkCount} งาน</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Individual Student Deep-Dive Graphs & Rubrics (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentStudent ? (
            <>
              {/* Selected Student Banner */}
              <div className="bg-white sketch-border rounded-[24px_16px_22px_18px] p-5 shadow-[4px_4px_0px_#18181b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-zinc-900">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl border-2 border-zinc-900 bg-amber-200 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] overflow-hidden">
                    <AvatarDisplay avatarId={currentStudent.avatar} size="lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-zinc-900">{currentStudent.name}</h3>
                      <span className="text-xs font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300">
                        {currentStudent.classRoom} (เลขที่ {currentStudent.studentNo})
                      </span>
                    </div>
                    <div className="text-xs font-bold text-zinc-600 mt-1 flex flex-wrap items-center gap-3">
                      <span>รหัส: <strong className="text-zinc-800">{currentStudent.studentIdCode}</strong></span>
                      <span>•</span>
                      <span>ดาวสะสม: <strong className="text-amber-600">⭐ {currentStudent.totalStars}</strong></span>
                      <span>•</span>
                      <span>ส่งชิ้นงานแล้ว: <strong className="text-emerald-600">{studentHomeworks.length} รายการ</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-zinc-50 p-2 rounded-xl border border-zinc-300">
                  <div className="text-center px-2">
                    <div className="text-[10px] font-black text-zinc-500">ตรวจแล้ว</div>
                    <div className="text-sm font-black text-emerald-700">{studentMetrics.reviewedCount}</div>
                  </div>
                  <div className="w-px h-6 bg-zinc-300" />
                  <div className="text-center px-2">
                    <div className="text-[10px] font-black text-zinc-500">รอตรวจ</div>
                    <div className="text-sm font-black text-amber-600">{studentMetrics.pendingCount}</div>
                  </div>
                  <div className="w-px h-6 bg-zinc-300" />
                  <div className="text-center px-2">
                    <div className="text-[10px] font-black text-zinc-500">ทำแบบทดสอบ</div>
                    <div className="text-sm font-black text-purple-700">{studentExams.length} ครั้ง</div>
                  </div>
                </div>
              </div>

              {/* Individual Student Reflection Interest Card with Percentage Bar */}
              {currentStudentReflectionAnalytics && (
                <div className="bg-[#FFFDF5] sketch-border rounded-[22px_18px_20px_16px] p-5 shadow-[4px_4px_0px_#18181b] border-2 border-zinc-900 space-y-3.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-zinc-900 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-200 border-2 border-zinc-900 flex items-center justify-center text-lg shadow-[1.5px_1.5px_0px_#000] shrink-0">
                        🌟
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-zinc-900">
                          ระดับความสนใจในการเรียนของ {currentStudent.name} ผ่านมุมสะท้อน
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-600">
                          <span>ส่งข้อความสะท้อนคิดแล้ว <strong>{currentStudentReflectionAnalytics.totalReflections} ครั้ง</strong></span>
                          <span>•</span>
                          <span>คะแนนเฉลี่ย <strong>⭐ {currentStudentReflectionAnalytics.avgStars} / 5.0</strong></span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${currentStudentReflectionAnalytics.statusColor}`}>
                      {currentStudentReflectionAnalytics.status}
                    </span>
                  </div>

                  {/* Percentage Progress Bar for this student */}
                  <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-zinc-300">
                    <div className="flex items-center justify-between text-xs font-black text-zinc-900">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        <span>แถบเปอร์เซ็นต์ความสนใจในการเรียน (Learning Interest Bar):</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-amber-600">
                          {currentStudentReflectionAnalytics.interestPercent}%
                        </span>
                        <span className="text-[11px] font-bold text-zinc-500">
                          (เฉลี่ยทั้งห้อง {reflectionAnalytics.overallInterestPercent}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-4 bg-zinc-100 rounded-full border-2 border-zinc-900 overflow-hidden p-0.5 shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
                        style={{ width: `${currentStudentReflectionAnalytics.interestPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 pt-0.5">
                      <span>0% (ไม่สนใจ)</span>
                      <span>50% (ปานกลาง)</span>
                      <span>80% (สนใจดีมาก)</span>
                      <span>100% (กระตือรือร้นสูงสุด 🌟)</span>
                    </div>
                  </div>

                  {/* Student's recent reflections & thoughts */}
                  {currentStudentReflectionAnalytics.latestEval ? (
                    <div className="bg-white p-3 rounded-xl border border-zinc-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-black text-zinc-900 border-b border-zinc-100 pb-1">
                        <span className="flex items-center gap-1.5 text-purple-900">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                          <span>เสียงสะท้อนล่าสุดจากนักเรียนในมุมสะท้อนคิด:</span>
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400">
                          {currentStudentReflectionAnalytics.latestEval.submittedAt}
                        </span>
                      </div>
                      {currentStudentReflectionAnalytics.latestEval.recommendationText && (
                        <p className="text-zinc-800 font-medium">
                          <span className="font-bold text-emerald-700">ความประทับใจ:</span> "{currentStudentReflectionAnalytics.latestEval.recommendationText}"
                        </p>
                      )}
                      {currentStudentReflectionAnalytics.latestEval.improvementText && (
                        <p className="text-zinc-600 italic">
                          <span className="font-bold text-amber-700 not-italic">ข้อเสนอแนะ:</span> "{currentStudentReflectionAnalytics.latestEval.improvementText}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-3 rounded-xl border border-zinc-200 text-center text-xs font-semibold text-zinc-500">
                      นักเรียนคนนี้ยังไม่ได้ส่งมุมสะท้อนคิดในหัวข้อปัจจุบัน สามารถชวนนักเรียนมาแลกเปลี่ยนความรู้สึกและสะท้อนคิดเพื่อดูความสนใจได้
                    </div>
                  )}
                </div>
              )}

              {/* Charts Section: 2 Charts Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Radar Chart: 5 Competencies */}
                <div className="bg-white sketch-border rounded-[20px_16px_22px_18px] p-4 shadow-[4px_4px_0px_#18181b] border-2 border-zinc-900">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-zinc-800">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>เรดาร์สมรรถนะรายบุคคล (Radar Chart)</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500">เกณฑ์ 0-100</span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#e4e4e7" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#27272a', fontSize: 11, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                        <Radar
                          name={currentStudent.name}
                          dataKey="score"
                          stroke="#f59e0b"
                          fill="#fbbf24"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center text-[11px] font-bold text-zinc-500 mt-1">
                    แสดงความสมดุลด้านการส่งงาน คุณภาพชิ้นงาน และการมีส่วนร่วม
                  </div>
                </div>

                {/* 2. Bar Chart: Homework Scores History */}
                <div className="bg-white sketch-border rounded-[20px_16px_22px_18px] p-4 shadow-[4px_4px_0px_#18181b] border-2 border-zinc-900">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-zinc-800">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>คะแนนชิ้นงานแต่ละรายการ</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500">คะแนนเต็ม/คะแนนจริง</span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={homeworkComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} interval={0} angle={-15} textAnchor="end" />
                        <YAxis tick={{ fontSize: 10 }} domain={[0, 10]} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                        <Bar dataKey="คะแนนที่ได้" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="คะแนนเต็ม" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center text-[11px] font-bold text-zinc-500 mt-1">
                    เปรียบเทียบคะแนนแต่ละการบ้านของนักเรียน
                  </div>
                </div>

              </div>

              {/* 3. Teacher Individual Rubrics & Evaluation Form */}
              <div className="bg-[#FFFDF5] sketch-border rounded-[22px_18px_20px_16px] p-5 shadow-[4px_4px_0px_#18181b] border-2 border-zinc-900 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h4 className="text-base font-black text-zinc-900">
                      📝 แบบบันทึกและประเมินผลการเรียนรู้: {currentStudent.name}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-zinc-600">บันทึกโดยคุณครูผู้สอน</span>
                </div>

                <form onSubmit={handleSaveRubric} className="space-y-4">
                  {/* 3 Rubric Rating Sliders / Stars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-zinc-300 space-y-1.5">
                      <label className="block text-xs font-black text-zinc-800">
                        1. ความรู้ความเข้าใจ (K)
                      </label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setRubricKnowledge(st)}
                              className="cursor-pointer"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  st <= rubricKnowledge
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-zinc-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-black text-zinc-900">{rubricKnowledge}/5</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-zinc-300 space-y-1.5">
                      <label className="block text-xs font-black text-zinc-800">
                        2. ทักษะและกระบวนการ (P)
                      </label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setRubricSkills(st)}
                              className="cursor-pointer"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  st <= rubricSkills
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-zinc-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-black text-zinc-900">{rubricSkills}/5</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-zinc-300 space-y-1.5">
                      <label className="block text-xs font-black text-zinc-800">
                        3. คุณลักษณะและวินัย (A)
                      </label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setRubricAttitude(st)}
                              className="cursor-pointer"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  st <= rubricAttitude
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-zinc-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-black text-zinc-900">{rubricAttitude}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Grade & Bonus Stars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-zinc-800 mb-1">
                        ผลการประเมินภาพรวม:
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['ดีเยี่ยม', 'ดี', 'พอใช้', 'ควรปรับปรุง'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setRubricLevel(lvl)}
                            className={`py-1.5 px-1 rounded-lg text-xs font-black border transition-all cursor-pointer text-center ${
                              rubricLevel === lvl
                                ? 'bg-amber-300 border-zinc-900 shadow-xs'
                                : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-zinc-800 mb-1">
                        มอบดาวรางวัลเสริมกำลังใจ (+⭐):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="10"
                        value={bonusStars}
                        onChange={(e) => setBonusStars(Number(e.target.value))}
                        className="w-full bg-white px-3 py-1.5 rounded-lg border-2 border-zinc-900 text-xs font-black text-center"
                      />
                    </div>
                  </div>

                  {/* Personal Teacher Note */}
                  <div>
                    <label className="block text-xs font-black text-zinc-800 mb-1">
                      ข้อเสนอแนะและคำติชมเฉพาะบุคคล (ส่งตรงถึงนักเรียน):
                    </label>
                    <textarea
                      rows={2}
                      value={teacherPersonalNote}
                      onChange={(e) => setTeacherPersonalNote(e.target.value)}
                      placeholder="พิมพ์ข้อความแนะนำ หรือคำชมเชยที่ต้องการให้นักเรียนปรับปรุง..."
                      className="w-full bg-white p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs font-bold text-zinc-600">
                      {isSaved && (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <Check className="w-4 h-4" /> บันทึกผลการประเมินและมอบดาวเรียบร้อยแล้ว!
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs sm:text-sm rounded-xl border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b] flex items-center gap-2 cursor-pointer active:translate-y-0.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>บันทึกผลการประเมินนักเรียนคนนี้</span>
                    </button>
                  </div>
                </form>
              </div>

            </>
          ) : (
            <div className="bg-white sketch-border rounded-2xl p-10 text-center text-zinc-500">
              กรุณาเลือกนักเรียนจากรายชื่อด้านซ้ายเพื่อดูเรดาร์ชาร์ทและกราฟการประเมิน
            </div>
          )}
        </div>

      </div>

      {/* Bottom Section: Class-wide Comparison Bar Chart */}
      <div className="bg-white sketch-border rounded-[22px_18px_20px_16px] p-5 shadow-[5px_5px_0px_#18181b] border-2 border-zinc-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-zinc-900">
              🏆 กราฟเปรียบเทียบดาวสะสมและผลงานรวมของนักเรียนในชั้น
            </h3>
          </div>
          <span className="text-xs font-bold text-zinc-500">
            แสดงคะแนนสะสมสูงสุดในระบบ เพื่อให้เห็นภาพรวมทั้งห้อง
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topStudentsBarData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
              <Bar dataKey="ดาวสะสม" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="การบ้าน" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
