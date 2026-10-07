import React, { useState, useMemo, useCallback } from 'react';
import {
  UserProfile,
  StudentRecord,
  Homework,
  AssignmentTask,
  QuizLesson,
  StudentExamScore,
  TeacherEvaluation,
  TeacherReflectionTopic,
} from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import { DoodleStar } from './DoodleIcons';
import { triggerFestiveConfetti, triggerStarBurst } from '../utils/confetti';
import { isClassMatching } from '../utils/classMatching';
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
  Heart,
  Trash2,
  Plus
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface TeacherDashboardViewProps {
  currentUser: UserProfile;
  studentRecords: StudentRecord[];
  homeworkList: Homework[];
  assignmentTasks?: AssignmentTask[];
  quizLessons: QuizLesson[];
  examScores: StudentExamScore[];
  evaluations: TeacherEvaluation[];
  reflectionTopics?: TeacherReflectionTopic[];
  onUpdateStudentRecord?: (student: StudentRecord) => void;
  onAddStudent?: (student: StudentRecord) => void;
  onAwardStars?: (stars: number, reason: string) => void;
  onOpenGoogleSheets?: () => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  currentUser,
  studentRecords,
  homeworkList,
  assignmentTasks = [],
  quizLessons,
  examScores,
  evaluations,
  reflectionTopics = [],
  onUpdateStudentRecord,
  onAddStudent,
  onAwardStars,
  onOpenGoogleSheets,
  onDeleteStudent,
}) => {
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Add Student State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState(
    currentUser.teachingClasses?.[0] || 'ม.2/1'
  );
  const [newStudentNo, setNewStudentNo] = useState('');

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !onAddStudent) return;
    const cleanNo = newStudentNo.trim() || String(studentRecords.length + 1);
    const cleanClass = newStudentClass.trim() || 'ม.2/1';
    const created: StudentRecord = {
      id: 'std-' + Date.now(),
      teacherId: currentUser.id,
      name: newStudentName.trim(),
      studentIdCode: `STD-${cleanClass.replace(/[^0-9]/g, '') || '201'}${cleanNo.padStart(2, '0')}`,
      classRoom: cleanClass,
      studentNo: cleanNo,
      avatar: 'student-boy-glasses',
      totalStars: 0,
      unlockedStickers: [],
      awardedBadges: [],
      homeworkCount: 0,
      quizScores: {},
    };
    onAddStudent(created);
    setSelectedStudentId(created.id);
    setNewStudentName('');
    setNewStudentNo('');
    setIsAddStudentOpen(false);
    triggerStarBurst();
  };

  // Student Deletion State
  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string>('');

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

  // Handle Confirm Student Deletion
  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    const id = studentToDelete.id;
    const name = studentToDelete.name;
    if (onDeleteStudent) {
      onDeleteStudent(id);
    }
    setStudentToDelete(null);
    setDeleteSuccessMsg(`ลบข้อมูล ${name} ออกจากระบบเรียบร้อยแล้ว`);
    setTimeout(() => setDeleteSuccessMsg(''), 4000);
    if (selectedStudentId === id) {
      const remaining = studentRecords.filter((s) => s.id !== id);
      setSelectedStudentId(remaining[0]?.id || '');
    }
  };

  // Classrooms list derived from the teacher's account and real student usage in each classroom
  const classrooms = useMemo(() => {
    const set = new Set<string>();
    const addRoom = (raw?: string) => {
      if (!raw) return;
      raw.split(',').forEach((part) => {
        const clean = part.trim();
        if (clean && clean !== 'ทุกห้อง' && clean !== 'all') {
          set.add(clean);
        }
      });
    };
    (currentUser.teachingClasses || []).forEach(addRoom);
    assignmentTasks.forEach((t) => addRoom(t.targetClass));
    quizLessons.forEach((l) => addRoom(l.targetClass));
    reflectionTopics.forEach((t) => addRoom(t.targetClass));
    studentRecords.forEach((s) => addRoom(s.classRoom));
    homeworkList.forEach((h) => addRoom(h.studentClass));
    examScores.forEach((e) => addRoom(e.studentClass));
    evaluations.forEach((ev) => addRoom(ev.studentClass));
    return Array.from(set).sort();
  }, [
    currentUser.teachingClasses,
    assignmentTasks,
    quizLessons,
    reflectionTopics,
    studentRecords,
    homeworkList,
    examScores,
    evaluations,
  ]);

  // Students belonging to the currently selected classroom (without search query)
  const cohortStudents = useMemo(() => {
    return studentRecords.filter((s) => {
      if (classFilter === 'all') return true;
      return isClassMatching(s.classRoom, classFilter);
    });
  }, [studentRecords, classFilter]);

  // Filtered Students (by classroom + search query)
  const filteredStudents = useMemo(() => {
    return cohortStudents.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentIdCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNo.includes(searchQuery);
      return matchSearch;
    });
  }, [cohortStudents, searchQuery]);

  // Currently selected student record (scoped to the selected classroom)
  const currentStudent = useMemo(() => {
    return (
      filteredStudents.find((s) => s.id === selectedStudentId) ||
      cohortStudents.find((s) => s.id === selectedStudentId) ||
      filteredStudents[0] ||
      cohortStudents[0] ||
      null
    );
  }, [filteredStudents, cohortStudents, selectedStudentId]);

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

  // Calculate Metrics for the Selected Student strictly from real activity
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

    const reviewed = studentHomeworks.filter(
      (h) => h.status === 'reviewed' || typeof h.teacherScore === 'number'
    );
    const pending = studentHomeworks.filter((h) => h.status === 'pending');

    const totalHwScore = reviewed.reduce((sum, h) => sum + (h.teacherScore || 0), 0);
    const maxPossibleHwScore = reviewed.reduce((sum, h) => sum + (h.maxScore || 10), 0);
    const hwAvgPercent =
      maxPossibleHwScore > 0
        ? Math.round((totalHwScore / maxPossibleHwScore) * 100)
        : studentHomeworks.length > 0
        ? 100
        : 0;

    const totalQuizScore = studentExams.reduce((sum, e) => sum + e.score, 0);
    const maxPossibleQuizScore = studentExams.reduce((sum, e) => sum + e.maxScore, 0);
    const quizAvgPercent =
      maxPossibleQuizScore > 0 ? Math.round((totalQuizScore / maxPossibleQuizScore) * 100) : 0;

    const assignedTasksForStudent = assignmentTasks.filter((t) =>
      isClassMatching(currentStudent.classRoom, t.targetClass)
    );
    const targetTaskCount = Math.max(1, assignedTasksForStudent.length || 1);
    const submissionRate =
      studentHomeworks.length > 0
        ? Math.min(100, Math.round((studentHomeworks.length / targetTaskCount) * 100))
        : 0;

    const reflectionAvg =
      studentReflections.length > 0
        ? studentReflections.reduce((s, r) => s + r.ratingStars, 0) / studentReflections.length
        : 0;
    const reflectionScore =
      studentReflections.length > 0 ? Math.min(100, Math.round((reflectionAvg / 5) * 100)) : 0;

    const consistencyScore =
      currentStudent.totalStars > 0
        ? Math.min(100, Math.round((currentStudent.totalStars / 300) * 100))
        : 0;

    return {
      submissionRate,
      hwAvgScore: hwAvgPercent,
      quizAvgScore: quizAvgPercent,
      reflectionScore,
      consistencyScore,
      reviewedCount: reviewed.length,
      pendingCount: pending.length,
    };
  }, [currentStudent, studentHomeworks, studentExams, studentReflections, assignmentTasks]);

  // Helper to compute real 3-Dimensions metrics for any classroom filter ('all' or specific room)
  const computeMetricsForClassroom = useCallback(
    (roomFilter: string) => {
      const studentsInRoom = studentRecords.filter((s) =>
        roomFilter === 'all' ? true : isClassMatching(s.classRoom, roomFilter)
      );

      const relevantEvals = evaluations.filter((ev) =>
        roomFilter === 'all' ? true : isClassMatching(ev.studentClass, roomFilter)
      );
      const relevantHw = homeworkList.filter((h) =>
        roomFilter === 'all' ? true : isClassMatching(h.studentClass, roomFilter)
      );
      const relevantExams = examScores.filter((e) =>
        roomFilter === 'all' ? true : isClassMatching(e.studentClass, roomFilter)
      );
      const relevantTasks = assignmentTasks.filter((t) =>
        roomFilter === 'all' ? true : isClassMatching(roomFilter, t.targetClass)
      );

      // Unique real active students in this classroom
      const activeStudentKeySet = new Set<string>();
      relevantEvals.forEach((e) => activeStudentKeySet.add(e.studentId || e.studentName.toLowerCase()));
      relevantHw.forEach((h) => activeStudentKeySet.add(h.studentId || h.studentName.toLowerCase()));
      relevantExams.forEach((e) => activeStudentKeySet.add(e.studentId || e.studentName.toLowerCase()));

      const totalStudentsInCohort = Math.max(studentsInRoom.length, activeStudentKeySet.size);

      // 1. Assessment AS Learning (ผู้เรียนประเมินตนเอง / เพื่อนร่วมชั้นเรียนประเมิน)
      const asLearningEvals = relevantEvals.filter(
        (e) => !e.assessmentType || e.assessmentType === 'Assessment as Learning'
      );
      const targetAsEvals = asLearningEvals.length > 0 ? asLearningEvals : relevantEvals;
      const uniqueReflectingStudents = new Set(
        targetAsEvals.map((e) => e.studentId || e.studentName.toLowerCase())
      );
      const reflectionParticipationRate =
        totalStudentsInCohort > 0 && targetAsEvals.length > 0
          ? Math.min(100, Math.round((uniqueReflectingStudents.size / totalStudentsInCohort) * 100))
          : 0;
      const avgSelfRatingStars =
        targetAsEvals.length > 0
          ? targetAsEvals.reduce((sum, e) => sum + e.ratingStars, 0) / targetAsEvals.length
          : 0;
      const selfAwarenessPercent =
        targetAsEvals.length > 0 ? Math.min(100, Math.round((avgSelfRatingStars / 5) * 100)) : 0;
      const asLearningScore =
        targetAsEvals.length > 0
          ? Math.min(100, Math.round(selfAwarenessPercent * 0.6 + reflectionParticipationRate * 0.4))
          : 0;

      // 2. Assessment FOR Learning (ครูทำหน้าที่ให้ Feedback ชี้แนะเพื่อการพัฒนา)
      const forLearningEvals = relevantEvals.filter(
        (e) => e.assessmentType === 'Assessment for Learning'
      );
      const reviewedHw = relevantHw.filter(
        (h) => h.status === 'reviewed' || typeof h.teacherScore === 'number'
      );
      const totalHwScore = reviewedHw.reduce((sum, h) => sum + (h.teacherScore || 0), 0);
      const maxPossibleHwScore = reviewedHw.reduce((sum, h) => sum + (h.maxScore || 10), 0);
      const hwAvgPercent =
        maxPossibleHwScore > 0
          ? Math.round((totalHwScore / maxPossibleHwScore) * 100)
          : relevantHw.length > 0
          ? 100
          : forLearningEvals.length > 0
          ? Math.round(
              (forLearningEvals.reduce((s, e) => s + e.ratingStars, 0) /
                (forLearningEvals.length * 5)) *
                100
            )
          : 0;
      const expectedSubmissions = Math.max(
        1,
        totalStudentsInCohort * Math.max(1, relevantTasks.length)
      );
      const hwSubmissionProgress =
        totalStudentsInCohort > 0 && (relevantHw.length > 0 || forLearningEvals.length > 0)
          ? Math.min(
              100,
              Math.round(
                ((relevantHw.length + forLearningEvals.length) / expectedSubmissions) * 100
              )
            )
          : 0;
      const forLearningScore =
        relevantHw.length > 0 || forLearningEvals.length > 0
          ? Math.min(100, Math.round(hwAvgPercent * 0.6 + hwSubmissionProgress * 0.4))
          : 0;

      // 3. Assessment OF Learning (ครูประเมินเพื่อตัดสินผลสัมฤทธิ์)
      const ofLearningEvals = relevantEvals.filter(
        (e) => e.assessmentType === 'Assessment of Learning'
      );
      const totalExamScore = relevantExams.reduce((sum, e) => sum + e.score, 0);
      const maxPossibleExamScore = relevantExams.reduce((sum, e) => sum + e.maxScore, 0);
      const examAvgPercent =
        maxPossibleExamScore > 0
          ? Math.round((totalExamScore / maxPossibleExamScore) * 100)
          : ofLearningEvals.length > 0
          ? Math.round(
              (ofLearningEvals.reduce((s, e) => s + e.ratingStars, 0) /
                (ofLearningEvals.length * 5)) *
                100
            )
          : 0;
      const passedExams = relevantExams.filter(
        (e) => e.maxScore > 0 && e.score / e.maxScore >= 0.6
      );
      const passingRatePercent =
        relevantExams.length > 0
          ? Math.round((passedExams.length / relevantExams.length) * 100)
          : ofLearningEvals.length > 0
          ? 100
          : 0;
      const ofLearningScore =
        relevantExams.length > 0 || ofLearningEvals.length > 0
          ? Math.min(100, Math.round(examAvgPercent * 0.7 + passingRatePercent * 0.3))
          : 0;

      const activePillars = [asLearningScore, forLearningScore, ofLearningScore].filter(
        (v) => v > 0
      );
      const overallTriadAvg =
        activePillars.length > 0
          ? Math.round((asLearningScore + forLearningScore + ofLearningScore) / 3)
          : 0;

      return {
        asLearningScore,
        forLearningScore,
        ofLearningScore,
        overallTriadAvg,
        avgSelfRatingStars: Number(avgSelfRatingStars.toFixed(1)),
        reflectionParticipationRate,
        hwAvgPercent,
        hwSubmissionProgress,
        examAvgPercent,
        passingRatePercent,
        totalEvals: relevantEvals.length,
        totalHw: relevantHw.length,
        totalExams: relevantExams.length,
        totalStudents: studentsInRoom.length,
        activeStudentsCount: activeStudentKeySet.size,
      };
    },
    [studentRecords, evaluations, homeworkList, examScores, assignmentTasks]
  );

  // 🌟 THE 3 DIMENSIONS OF ASSESSMENT ANALYTICS (Cohort / Class Level)
  const classAssessmentMetrics = useMemo(
    () => computeMetricsForClassroom(classFilter),
    [computeMetricsForClassroom, classFilter]
  );

  // Room-by-Room Comparison Data across all classrooms in the teacher's account
  const classroomComparisonBarData = useMemo(() => {
    return classrooms.map((room) => {
      const m = computeMetricsForClassroom(room);
      return {
        name: room,
        'As Learning': m.asLearningScore,
        'For Learning': m.forLearningScore,
        'Of Learning': m.ofLearningScore,
        เฉลี่ยรวม: m.overallTriadAvg,
        จำนวนนักเรียนจริง: m.totalStudents,
        ส่งงานและสะท้อนคิด: m.totalHw + m.totalExams + m.totalEvals,
      };
    });
  }, [classrooms, computeMetricsForClassroom]);

  // Individual Student 3-Pillars Assessment (strictly from real student activity)
  const studentAssessmentMetrics = useMemo(() => {
    if (!currentStudent) return null;

    // 1. As Learning (ผู้เรียนประเมินตนเอง / เพื่อนร่วมชั้นเรียนประเมิน)
    const selfRatingAvg =
      studentReflections.length > 0
        ? studentReflections.reduce((s, e) => s + e.ratingStars, 0) / studentReflections.length
        : 0;
    const asLearningScore =
      studentReflections.length > 0
        ? Math.min(
            100,
            Math.round((selfRatingAvg / 5) * 70 + Math.min(30, studentReflections.length * 15))
          )
        : 0;

    // 2. For Learning (ครูทำหน้าที่ให้ Feedback พัฒนาชิ้นงานระหว่างทาง)
    const forLearningScore =
      studentHomeworks.length > 0
        ? Math.min(
            100,
            Math.round(studentMetrics.hwAvgScore * 0.6 + studentMetrics.submissionRate * 0.4)
          )
        : 0;

    // 3. Of Learning (ครูประเมินเพื่อตัดสินผลสัมฤทธิ์)
    const ofLearningScore = studentExams.length > 0 ? studentMetrics.quizAvgScore : 0;

    const overallTriadAvg = Math.round(
      (asLearningScore + forLearningScore + ofLearningScore) / 3
    );

    const hasAnyActivity =
      studentReflections.length > 0 || studentHomeworks.length > 0 || studentExams.length > 0;

    let levelText = 'รอข้อมูลการใช้งานจากนักเรียน';
    let levelBadge = 'bg-zinc-100 text-zinc-700 border-zinc-400';
    if (hasAnyActivity) {
      if (overallTriadAvg >= 80) {
        levelText = 'ระดับดีเยี่ยม (Mastery 🌟)';
        levelBadge = 'bg-emerald-100 text-emerald-950 border-emerald-400';
      } else if (overallTriadAvg >= 70) {
        levelText = 'ระดับดี (Proficient 👍)';
        levelBadge = 'bg-sky-100 text-sky-950 border-sky-400';
      } else if (overallTriadAvg >= 50) {
        levelText = 'ระดับพอใช้ (Developing 💡)';
        levelBadge = 'bg-amber-100 text-amber-950 border-amber-400';
      } else {
        levelText = 'ควรส่งเสริมเป็นพิเศษ (Needs Support 📌)';
        levelBadge = 'bg-rose-100 text-rose-950 border-rose-400';
      }
    }

    return {
      asLearningScore,
      forLearningScore,
      ofLearningScore,
      overallTriadAvg,
      selfRatingAvg: Number(selfRatingAvg.toFixed(1)),
      levelText,
      levelBadge,
      hasAnyActivity,
    };
  }, [currentStudent, studentReflections, studentHomeworks, studentExams, studentMetrics]);

  // Radar Chart Data for Individual Student Competencies (real scores, 0 if no data)
  const radarData = useMemo(() => {
    return [
      {
        subject: 'As Learning (ประเมินตนเอง/เพื่อน)',
        score: studentAssessmentMetrics?.asLearningScore ?? 0,
        fullMark: 100,
      },
      {
        subject: 'For Learning (ครูให้ Feedback)',
        score: studentAssessmentMetrics?.forLearningScore ?? 0,
        fullMark: 100,
      },
      {
        subject: 'Of Learning (ผลสัมฤทธิ์สอบ)',
        score: studentAssessmentMetrics?.ofLearningScore ?? 0,
        fullMark: 100,
      },
      {
        subject: 'การส่งงานตรงเวลา',
        score: studentMetrics.submissionRate,
        fullMark: 100,
      },
      {
        subject: 'ดาวรางวัลสะสม',
        score: studentMetrics.consistencyScore,
        fullMark: 100,
      },
    ];
  }, [studentMetrics, studentAssessmentMetrics]);

  // Triad Comparison Chart Data
  const triadBarData = useMemo(() => {
    return [
      {
        name: 'As Learning',
        label: 'Assessment as Learning',
        คะแนน: classAssessmentMetrics.asLearningScore,
        เกณฑ์เป้าหมาย: 100,
        คำอธิบาย: 'ผู้เรียนประเมินตนเอง / เพื่อนร่วมชั้นเรียนประเมิน',
      },
      {
        name: 'For Learning',
        label: 'Assessment for Learning',
        คะแนน: classAssessmentMetrics.forLearningScore,
        เกณฑ์เป้าหมาย: 100,
        คำอธิบาย: 'ครูทำหน้าที่ให้ Feedback เพื่อพัฒนา',
      },
      {
        name: 'Of Learning',
        label: 'Assessment of Learning',
        คะแนน: classAssessmentMetrics.ofLearningScore,
        เกณฑ์เป้าหมาย: 100,
        คำอธิบาย: 'ครูประเมินเพื่อตัดสินผลสัมฤทธิ์',
      },
    ];
  }, [classAssessmentMetrics]);

  // Homework & Quiz progress comparison for this student (real items only)
  const homeworkComparisonData = useMemo(() => {
    const hwItems = studentHomeworks.map((h, i) => ({
      name:
        h.title.length > 14 ? h.title.substring(0, 12) + '...' : h.title || `งานที่ ${i + 1}`,
      คะแนนที่ได้: h.teacherScore ?? 0,
      คะแนนเต็ม: h.maxScore || 10,
    }));
    const examItems = studentExams.map((e, i) => ({
      name:
        e.lessonTitle.length > 14
          ? e.lessonTitle.substring(0, 12) + '...'
          : e.lessonTitle || `สอบที่ ${i + 1}`,
      คะแนนที่ได้: e.score,
      คะแนนเต็ม: e.maxScore || 10,
    }));
    return [...hwItems, ...examItems];
  }, [studentHomeworks, studentExams]);

  // Class Overview Stats (scoped to the selected classroom)
  const classStats = useMemo(() => {
    const totalStudents = cohortStudents.length;
    const totalHwSubmitted = classAssessmentMetrics.totalHw;
    const totalExamsTaken = classAssessmentMetrics.totalExams;
    const totalReflections = classAssessmentMetrics.totalEvals;
    const totalStarsAll = cohortStudents.reduce((sum, s) => sum + s.totalStars, 0);
    const avgStars = totalStudents > 0 ? Math.round(totalStarsAll / totalStudents) : 0;
    return {
      totalStudents,
      activeStudentsCount: classAssessmentMetrics.activeStudentsCount,
      totalHwSubmitted,
      totalExamsTaken,
      totalReflections,
      totalStarsAll,
      avgStars,
    };
  }, [cohortStudents, classAssessmentMetrics]);

  // Class Comparison Top Students Data for Bar Chart (scoped to selected classroom)
  const topStudentsBarData = useMemo(() => {
    return [...cohortStudents]
      .sort((a, b) => b.totalStars - a.totalStars)
      .slice(0, 12)
      .map((s) => {
        const stdHw = homeworkList.filter(
          (h) =>
            h.studentId === s.id ||
            (h.studentName && h.studentName.toLowerCase() === s.name.toLowerCase())
        );
        const stdExams = examScores.filter(
          (e) =>
            e.studentId === s.id ||
            (e.studentName && e.studentName.toLowerCase() === s.name.toLowerCase())
        );
        const hwTotalScore = stdHw.reduce((sum, h) => sum + (h.teacherScore || 0), 0);
        const examTotalScore = stdExams.reduce((sum, e) => sum + e.score, 0);
        return {
          name: `${s.name.split(' ')[0] || s.name} (${s.classRoom})`,
          ดาวสะสม: s.totalStars,
          ชิ้นงานที่ส่ง: Math.max(s.homeworkCount || 0, stdHw.length) * 10 + hwTotalScore,
          คะแนนสอบรวม: examTotalScore * 10,
        };
      });
  }, [cohortStudents, homeworkList, examScores]);

  // Cohort & Class-wide Learning Progress & Reflection Interest Analytics (strictly real data)
  const reflectionAnalytics = useMemo(() => {
    const activeEvaluations = evaluations.filter((ev) => {
      if (classFilter === 'all') return true;
      return isClassMatching(ev.studentClass, classFilter);
    });
    const activeHomeworks = homeworkList.filter((h) => {
      if (classFilter === 'all') return true;
      return isClassMatching(h.studentClass, classFilter);
    });
    const activeExams = examScores.filter((e) => {
      if (classFilter === 'all') return true;
      return isClassMatching(e.studentClass, classFilter);
    });

    const totalEvals = activeEvaluations.length;
    const totalStudentsInCohort = cohortStudents.length;

    // Unique students who have shared reflections
    const uniqueParticipatingStudentIds = new Set(
      activeEvaluations.map((ev) => ev.studentId || ev.studentName.toLowerCase())
    );
    const participationRate =
      totalStudentsInCohort > 0 && totalEvals > 0
        ? Math.min(100, Math.round((uniqueParticipatingStudentIds.size / totalStudentsInCohort) * 100))
        : totalEvals > 0
        ? 100
        : 0;

    // Star rating distribution
    const count5 = activeEvaluations.filter((e) => e.ratingStars === 5).length;
    const count4 = activeEvaluations.filter((e) => e.ratingStars === 4).length;
    const count3 = activeEvaluations.filter((e) => e.ratingStars === 3).length;
    const countLow = activeEvaluations.filter((e) => e.ratingStars <= 2).length;

    const percent5 = totalEvals > 0 ? Math.round((count5 / totalEvals) * 100) : 0;
    const percent4 = totalEvals > 0 ? Math.round((count4 / totalEvals) * 100) : 0;
    const percent3 = totalEvals > 0 ? Math.round((count3 / totalEvals) * 100) : 0;
    const percentLow = totalEvals > 0 ? Math.round((countLow / totalEvals) * 100) : 0;

    // Average rating & interest score (0 - 100%)
    const avgStars =
      totalEvals > 0
        ? activeEvaluations.reduce((acc, e) => acc + e.ratingStars, 0) / totalEvals
        : 0;
    const overallInterestPercent =
      totalEvals > 0 ? Math.min(100, Math.round((avgStars / 5) * 100)) : 0;

    // Progress in 4 Core Dimensions (%) from real student usage
    // 1. ความเข้าใจในบทเรียน (Understanding): combines reflection understanding + real quiz/homework accuracy
    const reflectionUnderstanding =
      totalEvals > 0 ? Math.round(((count5 + count4 * 0.8 + count3 * 0.6) / totalEvals) * 100) : 0;
    const understandingSources = [
      ...(totalEvals > 0 ? [reflectionUnderstanding] : []),
      ...(activeExams.length > 0 ? [classAssessmentMetrics.examAvgPercent] : []),
      ...(activeHomeworks.length > 0 ? [classAssessmentMetrics.hwAvgPercent] : []),
    ];
    const understandingPercent =
      understandingSources.length > 0
        ? Math.min(
            100,
            Math.round(
              understandingSources.reduce((a, b) => a + b, 0) / understandingSources.length
            )
          )
        : 0;

    // 2. ความสนุกและกระตือรือร้นในกิจกรรม (Activity Excitement & Engagement):
    const activityEngagementPercent =
      totalEvals > 0 ? Math.min(100, Math.round((avgStars / 5) * 100)) : 0;

    // 3. ความตั้งใจและส่งงานตรงเวลา (Submission Progress):
    const relevantTasks = assignmentTasks.filter((t) =>
      classFilter === 'all' ? true : isClassMatching(classFilter, t.targetClass)
    );
    const relevantLessons = quizLessons.filter((l) =>
      classFilter === 'all' ? true : isClassMatching(classFilter, l.targetClass)
    );
    const expectedTotalItems = Math.max(
      1,
      Math.max(1, totalStudentsInCohort) *
        Math.max(1, relevantTasks.length + relevantLessons.length)
    );
    const totalSubmittedItems = activeHomeworks.length + activeExams.length;
    const submissionProgressPercent =
      totalSubmittedItems > 0
        ? Math.min(100, Math.round((totalSubmittedItems / expectedTotalItems) * 100))
        : 0;

    // 4. การมีส่วนร่วมสะท้อนคิด (Reflection Participation):
    const reflectionParticipationPercent = participationRate;

    // Interest level label & color
    let interestLevelText = 'รอข้อมูลสะท้อนคิดจากนักเรียน';
    let interestLevelColor = 'text-zinc-700 bg-zinc-100 border-zinc-300';
    if (totalEvals > 0) {
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
  }, [
    evaluations,
    homeworkList,
    examScores,
    assignmentTasks,
    quizLessons,
    classFilter,
    cohortStudents,
    classAssessmentMetrics,
  ]);

  // Individual Student Reflection Interest Analytics (strictly real data)
  const currentStudentReflectionAnalytics = useMemo(() => {
    if (!currentStudent) return null;
    const myEvals = evaluations.filter(
      (ev) =>
        ev.studentId === currentStudent.id ||
        (ev.studentName && ev.studentName.toLowerCase() === currentStudent.name.toLowerCase())
    );

    const total = myEvals.length;
    const avgStars = total > 0 ? myEvals.reduce((s, e) => s + e.ratingStars, 0) / total : 0;
    const interestPercent = total > 0 ? Math.min(100, Math.round((avgStars / 5) * 100)) : 0;
    const latestEval = myEvals[0] || null;

    let status = 'ยังไม่ได้ส่งมุมสะท้อนคิด';
    let statusColor = 'text-zinc-700 bg-zinc-100 border-zinc-300';
    if (total > 0) {
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
            <div className="text-[10px] font-black text-zinc-500">
              นักเรียนใน{classFilter === 'all' ? 'บัญชีครู' : `ห้อง ${classFilter}`}
            </div>
            <div className="text-lg font-black text-zinc-900">{classStats.totalStudents} คน</div>
          </div>
          <div className="bg-amber-100 px-3.5 py-2 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] text-center">
            <div className="text-[10px] font-black text-amber-800">ชิ้นงานที่ส่งจริง</div>
            <div className="text-lg font-black text-amber-950">{classStats.totalHwSubmitted} ชิ้น</div>
          </div>
          <div className="bg-purple-100 px-3.5 py-2 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] text-center">
            <div className="text-[10px] font-black text-purple-800">สอบ / สะท้อนคิด</div>
            <div className="text-lg font-black text-purple-950">
              {classStats.totalExamsTaken} / {classStats.totalReflections}
            </div>
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

      {/* Classroom Selector Bar (เลือกดูกราฟประเมินแยกตามแต่ละห้องในบัญชีคุณครู) */}
      <div className="bg-white sketch-border rounded-[20px_14px_18px_16px] p-4 shadow-[4px_4px_0px_#18181b] border-2 border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-200 border-2 border-zinc-900 flex items-center justify-center text-base font-black shadow-[1.5px_1.5px_0px_#000] shrink-0">
            🏫
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-zinc-900">
              เลือกห้องเรียนในบัญชีคุณครูเพื่อดูกราฟประเมินตามข้อมูลนักเรียนที่ใช้งานจริง
            </div>
            <div className="text-[11px] font-semibold text-zinc-600">
              {classrooms.length === 0
                ? 'ยังไม่มีข้อมูลห้องเรียนในระบบ — กรุณาเพิ่มนักเรียน หรือมอบหมายงาน/แบบทดสอบ/มุมสะท้อนคิดในห้องเรียนของคุณครู'
                : `กำลังแสดงข้อมูลจริงของ: ${
                    classFilter === 'all' ? `ทุกห้องในบัญชีครู (${classrooms.length} ห้อง)` : `ชั้นเรียน ${classFilter}`
                  } • นักเรียนใช้งานจริง ${classStats.activeStudentsCount}/${classStats.totalStudents} คน`}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setClassFilter('all')}
            className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black cursor-pointer transition-all ${
              classFilter === 'all'
                ? 'bg-amber-300 text-zinc-950 border-zinc-900 shadow-[2px_2px_0px_#000]'
                : 'bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
            }`}
          >
            ทุกห้องในบัญชี ({studentRecords.length} คน)
          </button>
          {classrooms.map((room) => {
            const roomCount = studentRecords.filter((s) =>
              isClassMatching(s.classRoom, room)
            ).length;
            return (
              <button
                key={room}
                type="button"
                onClick={() => setClassFilter(room)}
                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black cursor-pointer transition-all ${
                  classFilter === room
                    ? 'bg-amber-300 text-zinc-950 border-zinc-900 shadow-[2px_2px_0px_#000]'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                {room} ({roomCount} คน)
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎯 THE 3 DIMENSIONS OF ASSESSMENT FRAMEWORK (AS, FOR, OF LEARNING) */}
      {/* การประเมินผลการเรียนรู้ 3 มิติ: Assessment as, for, of Learning */}
      {/* ========================================================================= */}
      <div className="bg-white sketch-border rounded-[24px_16px_22px_18px] p-5 md:p-6 shadow-[5px_5px_0px_#18181b] border-2 border-zinc-900 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-300 border-2 border-zinc-900 flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000] shrink-0">
              🎯
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-zinc-900">
                  การประเมินผลการเรียนรู้ 3 มิติ (The 3 Dimensions of Assessment)
                </h3>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full border border-zinc-900 shadow-2xs bg-emerald-300 text-zinc-950">
                  วิชาการ & มาตรฐานการศึกษา
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-600 mt-0.5">
                ประเมินครบทั้ง 3 มิติ: <strong>Assessment as Learning</strong> (ผู้เรียนประเมินตนเอง/เพื่อนร่วมชั้นเรียนประเมิน), <strong>Assessment for Learning</strong> (ครูทำหน้าที่ให้ Feedback) และ <strong>Assessment of Learning</strong> (ครูประเมินเพื่อตัดสิน)
              </p>
            </div>
          </div>

          {/* Triad Overall Score Pill */}
          <div className="flex items-center gap-2.5 bg-[#FFFDF5] px-4 py-2 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-bold text-zinc-500">
                คะแนนเฉลี่ย 3 มิติ ({classFilter === 'all' ? 'ทุกห้อง' : classFilter})
              </div>
              <div className="text-xs font-black text-zinc-900">
                {classAssessmentMetrics.totalEvals === 0 &&
                classAssessmentMetrics.totalHw === 0 &&
                classAssessmentMetrics.totalExams === 0
                  ? 'รอข้อมูลจากนักเรียนในห้องเรียน'
                  : classAssessmentMetrics.overallTriadAvg >= 80
                  ? 'ผลการประเมินดีเยี่ยม 🌟'
                  : classAssessmentMetrics.overallTriadAvg >= 50
                  ? 'ผลการประเมินระดับดี 👍'
                  : 'กำลังสะสมข้อมูลการประเมิน 📊'}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-400 border-2 border-zinc-900 flex flex-col items-center justify-center font-black text-zinc-950 shadow-xs">
              <span className="text-sm leading-none font-black">{classAssessmentMetrics.overallTriadAvg}%</span>
              <span className="text-[9px] font-bold text-purple-950">เฉลี่ยรวม</span>
            </div>
          </div>
        </div>

        {/* 3 Pillars Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Assessment AS Learning */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/40 p-4.5 rounded-2xl border-2 border-purple-400 shadow-[3px_3px_0px_#9333ea] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-200 border-2 border-zinc-900 flex items-center justify-center text-lg shadow-xs">
                    🧠
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider block">
                      มิติที่ 1
                    </span>
                    <h4 className="text-sm md:text-base font-black text-zinc-900 leading-tight">
                      Assessment as Learning
                    </h4>
                  </div>
                </div>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-purple-200 text-purple-950 border border-purple-400">
                  {classAssessmentMetrics.asLearningScore}%
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-purple-200 space-y-1 text-xs">
                <span className="font-black text-purple-950 block">ผู้เรียนประเมินตนเอง / เพื่อนร่วมชั้นเรียนประเมิน</span>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  ผู้เรียนประเมินตนเองผ่านการสะท้อนคิด (Self-Reflection) ตรวจสอบความเข้าใจ และการประเมินร่วมกันของเพื่อนร่วมชั้นเรียน (Peer Assessment) ผ่านมุมสะท้อน
                </p>
              </div>
            </div>

            {/* Progress Bar & Indicators */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700">
                <span>ประเมินตนเอง & เพื่อนประเมิน:</span>
                <span className="font-black text-purple-900">ดีเยี่ยม (Self & Peer Assessment)</span>
              </div>
              <div className="w-full h-3 bg-zinc-100 rounded-full border border-zinc-300 overflow-hidden p-0.5">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${classAssessmentMetrics.asLearningScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold pt-0.5">
                <span>⭐ ประเมินตนเองเฉลี่ย {classAssessmentMetrics.avgSelfRatingStars}/5</span>
                <span>💬 การมีส่วนร่วม {classAssessmentMetrics.reflectionParticipationRate}%</span>
              </div>
            </div>
          </div>

          {/* 2. Assessment FOR Learning */}
          <div className="bg-gradient-to-br from-sky-50 via-white to-sky-50/40 p-4.5 rounded-2xl border-2 border-sky-400 shadow-[3px_3px_0px_#0284c7] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-200 border-2 border-zinc-900 flex items-center justify-center text-lg shadow-xs">
                    🛠️
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-sky-700 tracking-wider block">
                      มิติที่ 2
                    </span>
                    <h4 className="text-sm md:text-base font-black text-zinc-900 leading-tight">
                      Assessment for Learning
                    </h4>
                  </div>
                </div>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-sky-200 text-sky-950 border border-sky-400">
                  {classAssessmentMetrics.forLearningScore}%
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-sky-200 space-y-1 text-xs">
                <span className="font-black text-sky-950 block">ครูทำหน้าที่ให้ Feedback ชี้แนะเพื่อพัฒนา</span>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  ครูทำหน้าที่ให้ Feedback ชี้แนะแนวทางพัฒนา ตรวจชิ้นงาน/การบ้านอย่างต่อเนื่อง เพื่อให้นักเรียนนำผลสะท้อนกลับไปปรับปรุงแก้ไขและต่อยอดการเรียนรู้
                </p>
              </div>
            </div>

            {/* Progress Bar & Indicators */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700">
                <span>ผลสะท้อนกลับ & พัฒนาชิ้นงาน:</span>
                <span className="font-black text-sky-900">ระดับดีมาก (Formative Feedback)</span>
              </div>
              <div className="w-full h-3 bg-zinc-100 rounded-full border border-zinc-300 overflow-hidden p-0.5">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${classAssessmentMetrics.forLearningScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold pt-0.5">
                <span>📦 การบ้านเฉลี่ย {classAssessmentMetrics.hwAvgPercent}%</span>
                <span>📝 ส่งงานแล้ว {classAssessmentMetrics.totalHw} ชิ้น</span>
              </div>
            </div>
          </div>

          {/* 3. Assessment OF Learning */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-4.5 rounded-2xl border-2 border-emerald-400 shadow-[3px_3px_0px_#059669] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-200 border-2 border-zinc-900 flex items-center justify-center text-lg shadow-xs">
                    🎯
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block">
                      มิติที่ 3
                    </span>
                    <h4 className="text-sm md:text-base font-black text-zinc-900 leading-tight">
                      Assessment of Learning
                    </h4>
                  </div>
                </div>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 border border-emerald-400">
                  {classAssessmentMetrics.ofLearningScore}%
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 space-y-1 text-xs">
                <span className="font-black text-emerald-950 block">ครูประเมินเพื่อตัดสินผลสัมฤทธิ์ปลายทาง</span>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  ครูประเมินเพื่อตัดสินผลการเรียนรู้และสรุปผลสัมฤทธิ์ปลายทาง (Summative Assessment) วัดความรอบรู้ตามเกณฑ์ตัวชี้วัดผ่านชุดแบบทดสอบ เพื่อตัดสินผลคะแนน
                </p>
              </div>
            </div>

            {/* Progress Bar & Indicators */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700">
                <span>ผลการตัดสินและการทดสอบ:</span>
                <span className="font-black text-emerald-900">ผ่านเกณฑ์ยอดเยี่ยม (Summative Mastery)</span>
              </div>
              <div className="w-full h-3 bg-zinc-100 rounded-full border border-zinc-300 overflow-hidden p-0.5">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${classAssessmentMetrics.ofLearningScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold pt-0.5">
                <span>🧪 สอบเฉลี่ย {classAssessmentMetrics.examAvgPercent}%</span>
                <span>🏆 ผ่านเกณฑ์ {classAssessmentMetrics.passingRatePercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Chart of the 3 Dimensions */}
        <div className="bg-[#FFFDF5] p-4.5 rounded-2xl border-2 border-zinc-300 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs sm:text-sm font-black text-zinc-900">
                กราฟเปรียบเทียบสมรรถนะการประเมิน 3 มิติ (Assessment Triad Chart):
              </span>
            </div>
            <span className="text-[11px] font-bold text-zinc-500">
              เกณฑ์คะแนนเต็ม 100% (จำแนกตาม As, For, Of Learning)
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={triadBarData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                  labelFormatter={(label) => `มิติการประเมิน: ${label}`}
                />
                <Bar dataKey="คะแนน" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Room-by-Room Comparison Chart when teacher has classrooms */}
          {classroomComparisonBarData.length > 0 && (
            <div className="pt-3 border-t border-zinc-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs sm:text-sm font-black text-zinc-900">
                  🏫 กราฟเปรียบเทียบผลการประเมิน 3 มิติแยกตามห้องเรียนในบัญชีครู:
                </span>
                <span className="text-[11px] font-bold text-zinc-500">
                  อิงตามข้อมูลนักเรียนที่ใช้งานจริงของแต่ละห้อง ({classroomComparisonBarData.length} ห้อง)
                </span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={classroomComparisonBarData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(val: any, name: any) => [`${val}%`, name]} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                    <Bar dataKey="As Learning" fill="#a855f7" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="For Learning" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Of Learning" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Left Column: Student List & Filter (5 cols on lg, 4 cols on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-white sketch-border rounded-[20px_16px_22px_18px] p-4 sm:p-5 shadow-[4px_4px_0px_#18181b] space-y-3.5 border-2 border-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
              <div className="flex items-center gap-2 text-sm sm:text-base font-black text-zinc-900">
                <Users className="w-4 h-4 text-sky-600" />
                <span>รายชื่อนักเรียน ({filteredStudents.length})</span>
              </div>
              {onAddStudent ? (
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen((v) => !v)}
                  className="px-2.5 py-1 bg-amber-300 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-lg border border-zinc-900 shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มนักเรียน</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-zinc-500">คลิกเพื่อดูผลประเมิน</span>
              )}
            </div>

            {isAddStudentOpen && (
              <form
                onSubmit={handleAddStudentSubmit}
                className="p-3 bg-amber-50/80 rounded-xl border-2 border-zinc-900 space-y-2"
              >
                <div className="text-xs font-black text-zinc-900">เพิ่มรายชื่อนักเรียนใหม่</div>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="ชื่อ-นามสกุลนักเรียน *"
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-zinc-300 text-xs font-bold"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    placeholder="ชั้นเรียน เช่น ม.2/1 *"
                    className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-zinc-300 text-xs font-bold"
                  />
                  <input
                    type="text"
                    required
                    value={newStudentNo}
                    onChange={(e) => setNewStudentNo(e.target.value)}
                    placeholder="เลขที่ เช่น 1 *"
                    className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-zinc-300 text-xs font-bold"
                  />
                </div>
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentOpen(false)}
                    className="px-2.5 py-1 bg-white text-zinc-700 text-xs font-bold rounded-lg border border-zinc-300 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 text-xs font-black rounded-lg border border-zinc-900 cursor-pointer"
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            )}

            {/* Filter by Room & Search */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ, รหัสนักเรียน..."
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 rounded-xl border-2 border-zinc-300 focus:border-zinc-900 text-xs sm:text-sm font-bold"
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

            {/* Delete Student Success Notification */}
            {deleteSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>{deleteSuccessMsg}</span>
              </div>
            )}

            {/* Scrollable Student Cards List */}
            <div className="max-h-[580px] overflow-y-auto space-y-2.5 pr-1">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs font-semibold">
                  ไม่พบลำดับนักเรียนที่ตรงกับคำค้นหา
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = student.id === selectedStudentId;
                  return (
                    <div
                      key={student.id}
                      className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2.5 text-left ${
                        isSelected
                          ? 'bg-amber-300 border-zinc-900 shadow-[3px_3px_0px_#18181b]'
                          : 'bg-[#FFFDF5] border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setIsSaved(false);
                        }}
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left"
                      >
                        <div className="w-11 h-11 rounded-xl border-2 border-zinc-900 bg-white flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          <AvatarDisplay avatarId={student.avatar} size="md" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-black text-zinc-900 truncate">
                              {student.name}
                            </span>
                            <span className="text-xs font-black text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-lg border border-amber-300 ml-1 shrink-0 inline-flex items-center gap-1">
                              <DoodleStar className="w-3.5 h-3.5 shrink-0" />
                              <span>{student.totalStars}</span>
                            </span>
                          </div>
                          <div className="text-xs font-bold text-zinc-600 flex items-center gap-1.5 mt-0.5">
                            <span>เลขที่ {student.studentNo}</span>
                            <span>•</span>
                            <span className="bg-stone-100 px-1 rounded border border-stone-200">{student.classRoom}</span>
                            <span>•</span>
                            <span className="text-emerald-700">{student.homeworkCount} งาน</span>
                          </div>
                        </div>
                      </button>

                      {onDeleteStudent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStudentToDelete(student);
                          }}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg border border-transparent hover:border-rose-300 cursor-pointer transition-colors shrink-0"
                          title={`ลบ ${student.name} ออกจากระบบ`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Individual Student Deep-Dive Graphs & Rubrics (7 cols on lg, 8 cols on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
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
                      <h3 className="text-xl font-bold text-zinc-900">{currentStudent.name}</h3>
                      <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300">
                        {currentStudent.classRoom} (เลขที่ {currentStudent.studentNo})
                      </span>
                    </div>
                    <div className="text-xs font-medium text-zinc-600 mt-1 flex flex-wrap items-center gap-3">
                      <span>รหัส: <strong className="text-zinc-800 font-bold">{currentStudent.studentIdCode}</strong></span>
                      <span>•</span>
                      <span>ดาวสะสม: <strong className="text-amber-600 font-bold">⭐ {currentStudent.totalStars}</strong></span>
                      <span>•</span>
                      <span>ส่งชิ้นงานแล้ว: <strong className="text-emerald-600 font-bold">{studentHomeworks.length} รายการ</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 bg-zinc-50 p-2 rounded-xl border border-zinc-300">
                    <div className="text-center px-2">
                      <div className="text-[10px] font-bold text-zinc-500">ตรวจแล้ว</div>
                      <div className="text-sm font-bold text-emerald-700">{studentMetrics.reviewedCount}</div>
                    </div>
                    <div className="w-px h-6 bg-zinc-300" />
                    <div className="text-center px-2">
                      <div className="text-[10px] font-bold text-zinc-500">รอตรวจ</div>
                      <div className="text-sm font-bold text-amber-600">{studentMetrics.pendingCount}</div>
                    </div>
                    <div className="w-px h-6 bg-zinc-300" />
                    <div className="text-center px-2">
                      <div className="text-[10px] font-bold text-zinc-500">ทำแบบทดสอบ</div>
                      <div className="text-sm font-bold text-purple-700">{studentExams.length} ครั้ง</div>
                    </div>
                  </div>

                  {onDeleteStudent && (
                    <button
                      type="button"
                      onClick={() => setStudentToDelete(currentStudent)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 text-xs font-bold rounded-xl border border-rose-300 cursor-pointer shadow-xs transition-colors shrink-0"
                      title={`ลบ ${currentStudent.name} ออกจากระบบ`}
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>ลบนักเรียน</span>
                    </button>
                  )}
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

              {/* Individual Student 3-Pillars Assessment Card (Assessment as, for, of Learning) */}
              {studentAssessmentMetrics && (
                <div className="bg-white sketch-border rounded-[22px_18px_20px_16px] p-5 shadow-[4px_4px_0px_#18181b] border-2 border-zinc-900 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-zinc-900 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-200 border-2 border-zinc-900 flex items-center justify-center text-lg shadow-[1.5px_1.5px_0px_#000] shrink-0">
                        🎯
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-zinc-900">
                          ผลการประเมิน 3 มิติ: {currentStudent.name} (The 3 Dimensions of Assessment)
                        </h4>
                        <span className="text-[11px] font-semibold text-zinc-600">
                          คะแนนรวมเฉลี่ย 3 มิติ: <strong className="text-purple-950 font-black">{studentAssessmentMetrics.overallTriadAvg}%</strong>
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${studentAssessmentMetrics.levelBadge}`}>
                      {studentAssessmentMetrics.levelText}
                    </span>
                  </div>

                  {/* 3 Progress Bars: As, For, Of Learning */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Dimension 1: As Learning */}
                    <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-300 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black text-purple-950">
                        <span className="flex items-center gap-1">
                          <span>🧠</span>
                          <span>As Learning</span>
                        </span>
                        <span className="text-sm font-black text-purple-900">
                          {studentAssessmentMetrics.asLearningScore}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden border border-purple-300">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${studentAssessmentMetrics.asLearningScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600 block">
                        ผู้เรียนประเมินตนเอง / เพื่อนร่วมชั้นประเมิน
                      </span>
                    </div>

                    {/* Dimension 2: For Learning */}
                    <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-300 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black text-sky-950">
                        <span className="flex items-center gap-1">
                          <span>🛠️</span>
                          <span>For Learning</span>
                        </span>
                        <span className="text-sm font-black text-sky-900">
                          {studentAssessmentMetrics.forLearningScore}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-sky-100 rounded-full overflow-hidden border border-sky-300">
                        <div
                          className="h-full bg-sky-500 rounded-full transition-all duration-500"
                          style={{ width: `${studentAssessmentMetrics.forLearningScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600 block">
                        ครูทำหน้าที่ให้ Feedback พัฒนางาน
                      </span>
                    </div>

                    {/* Dimension 3: Of Learning */}
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-300 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                        <span className="flex items-center gap-1">
                          <span>🎯</span>
                          <span>Of Learning</span>
                        </span>
                        <span className="text-sm font-black text-emerald-900">
                          {studentAssessmentMetrics.ofLearningScore}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-emerald-100 rounded-full overflow-hidden border border-emerald-300">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${studentAssessmentMetrics.ofLearningScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600 block">
                        ครูประเมินเพื่อตัดสินผลสัมฤทธิ์
                      </span>
                    </div>
                  </div>

                  {/* Individual Diagnostic Feedback */}
                  <div className="bg-[#FFFDF5] p-3 rounded-xl border border-zinc-300 text-xs space-y-1">
                    <span className="font-black text-zinc-900 flex items-center gap-1">
                      <span>💡</span>
                      <span>บทวิเคราะห์ทางวิชาการและแนวทางพัฒนาสำหรับ {currentStudent.name}:</span>
                    </span>
                    <p className="text-[11px] text-zinc-700 leading-relaxed font-medium">
                      {studentAssessmentMetrics.asLearningScore >= 80
                        ? `นักเรียนมีความสามารถในการสะท้อนตนเอง (Assessment as Learning) อยู่ในเกณฑ์ดีเยี่ยม สามารถตรวจสอบความก้าวหน้าในการเรียนรู้ของตนเองได้อย่างมีเป้าหมาย`
                        : `ควรส่งเสริมให้นักเรียนร่วมสะท้อนความรู้สึกและความเข้าใจในมุมสะท้อนคิดอย่างสม่ำเสมอ`}
                      {studentAssessmentMetrics.forLearningScore >= 80
                        ? ` ควบคู่กับความรับผิดชอบในการส่งชิ้นงานระหว่างทาง (Assessment for Learning) ที่ยอดเยี่ยม`
                        : ` และกระตุ้นการส่งงานให้ตรงเวลา`}
                      {studentAssessmentMetrics.ofLearningScore >= 80
                        ? ` ส่งผลให้ผลสัมฤทธิ์ปลายทาง (Assessment of Learning) อยู่ในเกณฑ์มาตรฐานระดับสูง`
                        : ` แนะนำให้ทบทวนข้อสอบเพื่อเพิ่มคะแนนผลสัมฤทธิ์ปลายทาง`}
                    </p>
                  </div>
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
                    {homeworkComparisonData.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                        <span className="text-xs font-bold text-zinc-600">
                          ยังไม่มีข้อมูลคะแนนชิ้นงานหรือแบบทดสอบที่ส่งเข้ามา
                        </span>
                        <span className="text-[11px] font-medium text-zinc-400 mt-1">
                          เมื่อนักเรียนส่งการบ้านหรือทำแบบทดสอบ กราฟจะแสดงคะแนนจริงทันที
                        </span>
                      </div>
                    ) : (
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
                    )}
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
                  <span className="text-xs font-bold text-zinc-600">บันทึกโดยคุณครู</span>
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
              🏆 กราฟเปรียบเทียบดาวสะสมและผลงานรวมของนักเรียน ({classFilter === 'all' ? 'ทุกห้องในบัญชีครู' : `ชั้น ${classFilter}`})
            </h3>
          </div>
          <span className="text-xs font-bold text-zinc-500">
            อิงตามข้อมูลนักเรียนที่ใช้งานจริง ({cohortStudents.length} คน)
          </span>
        </div>

        <div className="h-64 w-full">
          {topStudentsBarData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
              <span className="text-sm font-bold text-zinc-600">
                ยังไม่มีข้อมูลนักเรียนใน{classFilter === 'all' ? 'บัญชีคุณครู' : `ห้อง ${classFilter}`}
              </span>
              <span className="text-xs font-medium text-zinc-400 mt-1">
                เมื่อมีนักเรียนเข้าใช้งานส่งงาน ทำแบบทดสอบ หรือคุณครูเพิ่มรายชื่อนักเรียน กราฟจะแสดงข้อมูลจริงโดยอัตโนมัติ
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStudentsBarData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                <Bar dataKey="ดาวสะสม" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="ชิ้นงานที่ส่ง" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="คะแนนสอบรวม" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Confirm Delete Student Modal */}
      <ConfirmDeleteModal
        isOpen={!!studentToDelete}
        title="ยืนยันการลบนักเรียนออกจากระบบ"
        itemType="นักเรียน"
        itemName={studentToDelete ? `${studentToDelete.name} (เลขที่ ${studentToDelete.studentNo} ${studentToDelete.classRoom})` : ''}
        description="เมื่อลบแล้ว ข้อมูลนักเรียนคนนี้จะถูกนำออกจากระบบทันที คุณครูสามารถเพิ่มใหม่ได้ภายหลัง"
        onConfirm={handleConfirmDelete}
        onClose={() => setStudentToDelete(null)}
      />

    </div>
  );
};
