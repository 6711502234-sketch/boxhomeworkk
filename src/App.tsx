import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  ActiveTab,
  Homework,
  TeacherEvaluation,
  QuizLesson,
  StickerAchievement,
  StudentExamScore,
  StudentRecord,
  AwardedBadgeItem,
  AssignmentTask,
  TeacherReflectionTopic,
} from './types';
import { initialQuizLessons } from './data/quizData';
import {
  initialStickers,
  sampleInitialHomeworks,
  sampleInitialEvaluations,
  sampleStudentExamScores,
  sampleStudentRecords,
  sampleInitialAssignmentTasks,
  sampleReflectionTopics,
} from './data/stickersData';
import { triggerFestiveConfetti, triggerStarBurst } from './utils/confetti';
import { downloadStandaloneHtml } from './utils/singleFileGenerator';

import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { HomeworkView } from './components/HomeworkView';
import { QuizView } from './components/QuizView';
import { ScorebookView } from './components/ScorebookView';
import { TeacherEvaluationView } from './components/TeacherEvaluationView';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import { LoginView } from './components/LoginView';
import { CelebrationModal } from './components/CelebrationModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { ProfilePictureModal } from './components/ProfilePictureModal';
import {
  getGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  sendToGoogleSheets,
  SyncPayload,
} from './services/googleSheetsService';
import {
  saveUserProfileToFirestore,
  saveTaskToFirestore,
  saveHomeworkToFirestore,
  saveEvaluationToFirestore,
  subscribeToTasksFromFirestore,
  subscribeToHomeworksFromFirestore,
  subscribeToEvaluationsFromFirestore,
} from './services/firebaseSync';
import { safeGetItem, safeSetItem } from './utils/storage';

import { Download } from 'lucide-react';

export default function App() {
  // 0. Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return safeGetItem<string>('hw_box_logged_in', 'false') === 'true';
  });

  // 1. User Profile State (persisted to safe storage)
  const [user, setUser] = useState<UserProfile>(() => {
    return safeGetItem<UserProfile>('hw_box_user', {
      id: 'std-01',
      name: 'เด็กชายสมชาย สายวิทย์',
      role: 'student',
      classRoom: 'ห้อง 1',
      studentNo: '12',
      avatar: '🧑‍🎓',
      totalStars: 100,
      unlockedStickers: ['first-step'],
      studentIdCode: 'STD-30112',
    });
  });

  // 2. Assignment Tasks (Posted by Teacher)
  const [assignmentTasks, setAssignmentTasks] = useState<AssignmentTask[]>(() => {
    const saved = safeGetItem<AssignmentTask[]>('hw_box_assignment_tasks_single', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return sampleInitialAssignmentTasks.slice(0, 1);
  });

  // 3. Homework List State
  const [homeworkList, setHomeworkList] = useState<Homework[]>(() => {
    const saved = safeGetItem<Homework[]>('hw_box_homeworks', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return sampleInitialHomeworks;
  });

  // 4. Teacher Evaluations List
  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>(() => {
    const saved = safeGetItem<TeacherEvaluation[]>('hw_box_evaluations', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return sampleInitialEvaluations;
  });

  // 5. Quiz Lessons State
  const [lessons, setLessons] = useState<QuizLesson[]>(() => {
    const saved = safeGetItem<QuizLesson[]>('hw_box_lessons_single', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return initialQuizLessons.slice(0, 1);
  });

  // 6. Stickers State
  const [stickers, setStickers] = useState<StickerAchievement[]>(() => {
    const saved = safeGetItem<StickerAchievement[]>('hw_box_stickers', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return initialStickers;
  });

  // 7. Student Exam Scores (For Teacher & Classroom tracking)
  const [examScores, setExamScores] = useState<StudentExamScore[]>(() => {
    const saved = safeGetItem<StudentExamScore[]>('hw_box_exam_scores', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return sampleStudentExamScores;
  });

  // 8. Student Records (For Scorebook & Awarding stickers)
  const [studentRecords, setStudentRecords] = useState<StudentRecord[]>(() => {
    const saved = safeGetItem<StudentRecord[]>('hw_box_student_records', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return sampleStudentRecords;
  });

  // 9. Teacher Reflection Topics
  const [reflectionTopics, setReflectionTopics] = useState<TeacherReflectionTopic[]>(() => {
    const saved = safeGetItem<TeacherReflectionTopic[]>('hw_box_reflection_topics', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return sampleReflectionTopics;
  });

  // Google Sheets Modal State
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState<boolean>(false);

  // Profile Picture & Info Edit Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Active Tab (Strictly 4 requested tabs)
  const [activeTab, setActiveTab] = useState<ActiveTab>('homework');

  // Celebration Modal State
  const [celebration, setCelebration] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    starAmount?: number;
    icon?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  // Save to safe storage on changes
  useEffect(() => {
    safeSetItem('hw_box_user', user);
  }, [user]);

  useEffect(() => {
    safeSetItem('hw_box_logged_in', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    safeSetItem('hw_box_assignment_tasks_single', assignmentTasks);
    safeSetItem('hw_box_assignment_tasks', assignmentTasks);
  }, [assignmentTasks]);

  useEffect(() => {
    safeSetItem('hw_box_homeworks', homeworkList);
  }, [homeworkList]);

  useEffect(() => {
    safeSetItem('hw_box_evaluations', evaluations);
  }, [evaluations]);

  useEffect(() => {
    safeSetItem('hw_box_lessons_single', lessons);
    safeSetItem('hw_box_lessons', lessons);
  }, [lessons]);

  useEffect(() => {
    safeSetItem('hw_box_stickers', stickers);
  }, [stickers]);

  useEffect(() => {
    safeSetItem('hw_box_exam_scores', examScores);
  }, [examScores]);

  useEffect(() => {
    safeSetItem('hw_box_student_records', studentRecords);
  }, [studentRecords]);

  useEffect(() => {
    safeSetItem('hw_box_reflection_topics', reflectionTopics);
  }, [reflectionTopics]);

  // Real-time Firestore synchronization with change-check to prevent re-render freezing
  useEffect(() => {
    const unsubTasks = subscribeToTasksFromFirestore((firestoreTasks) => {
      if (firestoreTasks && firestoreTasks.length > 0) {
        setAssignmentTasks((prev) => {
          const map = new Map<string, AssignmentTask>();
          firestoreTasks.forEach((t) => map.set(t.id, t));
          prev.forEach((t) => {
            if (!map.has(t.id)) map.set(t.id, t);
          });
          const merged = Array.from(map.values());
          if (
            merged.length === prev.length &&
            merged.every(
              (item, idx) =>
                item.id === prev[idx]?.id &&
                item.createdAt === prev[idx]?.createdAt &&
                item.title === prev[idx]?.title
            )
          ) {
            return prev;
          }
          return merged;
        });
      }
    });

    const unsubHws = subscribeToHomeworksFromFirestore((firestoreHws) => {
      if (firestoreHws && firestoreHws.length > 0) {
        setHomeworkList((prev) => {
          const map = new Map<string, Homework>();
          firestoreHws.forEach((h) => map.set(h.id, h));
          prev.forEach((h) => {
            if (!map.has(h.id)) map.set(h.id, h);
          });
          const merged = Array.from(map.values());
          if (
            merged.length === prev.length &&
            merged.every(
              (item, idx) =>
                item.id === prev[idx]?.id &&
                item.status === prev[idx]?.status &&
                item.teacherScore === prev[idx]?.teacherScore
            )
          ) {
            return prev;
          }
          return merged;
        });
      }
    });

    const unsubEvals = subscribeToEvaluationsFromFirestore((firestoreEvals) => {
      if (firestoreEvals && firestoreEvals.length > 0) {
        setEvaluations((prev) => {
          const map = new Map<string, TeacherEvaluation>();
          firestoreEvals.forEach((e) => map.set(e.id, e));
          prev.forEach((e) => {
            if (!map.has(e.id)) map.set(e.id, e);
          });
          const merged = Array.from(map.values());
          if (
            merged.length === prev.length &&
            merged.every((item, idx) => item.id === prev[idx]?.id && item.teacherReply === prev[idx]?.teacherReply)
          ) {
            return prev;
          }
          return merged;
        });
      }
    });

    return () => {
      if (typeof unsubTasks === 'function') unsubTasks();
      if (typeof unsubHws === 'function') unsubHws();
      if (typeof unsubEvals === 'function') unsubEvals();
    };
  }, []);

  const handleCreateReflectionTopic = (topic: TeacherReflectionTopic) => {
    setReflectionTopics((prev) => [topic, ...prev]);
  };

  const handleUpdateReflectionTopic = (updated: TeacherReflectionTopic) => {
    setReflectionTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteReflectionTopic = (topicId: string) => {
    setReflectionTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  // Auto-sync classroom dataset to Google Sheets when enabled
  useEffect(() => {
    const config = getGoogleSheetsConfig();
    if (!config.webAppUrl || !config.autoSync) return;

    const timer = setTimeout(async () => {
      try {
        const payload: SyncPayload = {
          action: 'sync_all',
          timestamp: new Date().toLocaleString('th-TH'),
          studentRecords: studentRecords.map((s) => ({
            studentId: s.id,
            studentName: s.name,
            studentClass: s.classRoom,
            studentNo: s.studentNo,
            totalStars: s.totalStars,
            homeworkCompletedCount: s.homeworkCompletedCount,
            totalHomeworkScore: s.totalHomeworkScore,
            quizCompletedCount: s.quizCompletedCount,
            totalQuizScore: s.totalQuizScore,
          })),
          homeworkSubmissions: homeworkList.map((h) => ({
            homeworkId: h.id,
            title: h.title,
            subject: h.subject,
            studentName: h.studentName,
            studentClass: h.studentClass,
            studentNo: h.studentNo,
            status: h.status,
            score: h.score,
            maxScore: h.maxScore,
            submittedAt: h.submittedAt,
            feedback: h.feedback,
          })),
          examScores: examScores.map((e) => ({
            id: e.id,
            studentName: e.studentName,
            studentClass: e.studentClass,
            lessonTitle: e.lessonTitle,
            score: e.score,
            maxScore: e.maxScore,
            submittedAt: e.submittedAt,
          })),
          evaluations: evaluations.map((ev) => ({
            id: ev.id,
            topicTitle: ev.topicTitle,
            studentName: ev.studentName,
            studentClass: ev.studentClass,
            ratingStars: ev.ratingStars,
            improvementText: ev.improvementText,
            recommendationText: ev.recommendationText,
            submittedAt: ev.submittedAt,
          })),
        };

        const res = await sendToGoogleSheets(config.webAppUrl, payload);
        if (res.success) {
          saveGoogleSheetsConfig({
            ...config,
            lastSyncedAt: new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
            lastSyncStatus: 'success',
          });
        }
      } catch (err) {
        console.warn('Google Sheets auto-sync silent notice:', err);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [studentRecords, homeworkList, examScores, evaluations]);

  // Migration effect: Ensure cache is cleaned so only 1 task post and 1 quiz exist and class is clean
  useEffect(() => {
    if (localStorage.getItem('hw_box_universal_grades_v4') !== 'true') {
      localStorage.setItem('hw_box_universal_grades_v4', 'true');
      const singleTask = sampleInitialAssignmentTasks.slice(0, 1);
      const singleLesson = initialQuizLessons.slice(0, 1);
      setAssignmentTasks(singleTask);
      setLessons(singleLesson);
      localStorage.setItem('hw_box_assignment_tasks_single', JSON.stringify(singleTask));
      localStorage.setItem('hw_box_lessons_single', JSON.stringify(singleLesson));
      localStorage.setItem('hw_box_assignment_tasks', JSON.stringify(singleTask));
      localStorage.setItem('hw_box_lessons', JSON.stringify(singleLesson));
      localStorage.setItem('hw_box_exam_scores', JSON.stringify(sampleStudentExamScores));
      localStorage.setItem('hw_box_student_records', JSON.stringify(sampleStudentRecords));
      localStorage.setItem('hw_box_stickers', JSON.stringify(initialStickers));

      // Clean existing user profile if it had old ม.3 classRoom
      const savedUserStr = localStorage.getItem('hw_box_user');
      if (savedUserStr) {
        try {
          const u = JSON.parse(savedUserStr);
          if (u.classRoom && u.classRoom.includes('ม.3')) {
            u.classRoom = u.classRoom.replace('ม.3/', 'ห้อง ').replace('ม.3', 'ห้อง 1');
            setUser(u);
            localStorage.setItem('hw_box_user', JSON.stringify(u));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Check & Unlock Stickers Helper
  const checkAndUnlockSticker = (stickerId: string) => {
    setStickers((prev) => {
      const target = prev.find((s) => s.id === stickerId);
      if (target && !target.isUnlocked) {
        // Unlock it!
        const updated = prev.map((s) =>
          s.id === stickerId
            ? { ...s, isUnlocked: true, unlockedAt: new Date().toLocaleDateString('th-TH') }
            : s
        );

        // Show celebratory popup
        setTimeout(() => {
          triggerFestiveConfetti();
          setCelebration({
            isOpen: true,
            title: `ปลดล็อกสติกเกอร์: ${target.thaiTitle}! 🎖️`,
            message: `ยินดีด้วย! คุณได้รับสติกเกอร์ความสำเร็จ "${target.name}" เข้าสู่สมุดคะแนนเรียบร้อยแล้ว`,
            icon: target.icon,
          });
        }, 500);

        return updated;
      }
      return prev;
    });
  };

  // Check all achievement conditions whenever stars or lists change
  useEffect(() => {
    if (user.role !== 'student') return;

    // 1. First Step (Submitting 1st homework)
    if (homeworkList.length >= 1) {
      checkAndUnlockSticker('first-step');
    }

    // 2. Super Critic (5-star review given)
    const hasFiveStarEval = evaluations.some((e) => e.overallRating === 5);
    if (hasFiveStarEval) {
      checkAndUnlockSticker('super-critic');
    }

    // 5. Century Star (100+ stars)
    if (user.totalStars >= 100) {
      checkAndUnlockSticker('century-star');
    }

    // 6. Homework Legend (all reviewed with great scores)
    if (homeworkList.length >= 3 && user.totalStars >= 200) {
      checkAndUnlockSticker('homework-legend');
    }
  }, [user.totalStars, homeworkList.length, evaluations]);

  // Handle Login
  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    setIsAuthenticated(true);
    safeSetItem('hw_box_logged_in', 'true');
    safeSetItem('hw_box_user', newUser);
    saveUserProfileToFirestore(newUser);

    if (newUser.role === 'student') {
      setStudentRecords((prev) => {
        const exists = prev.some(
          (s) =>
            s.id === newUser.id ||
            (newUser.studentIdCode && s.studentIdCode === newUser.studentIdCode)
        );
        if (!exists) {
          const newRecord: StudentRecord = {
            id: newUser.id,
            name: newUser.name,
            studentIdCode: newUser.studentIdCode || 'STD-' + Math.floor(1000 + Math.random() * 9000),
            classRoom: newUser.classRoom || 'ห้อง 1',
            studentNo: newUser.studentNo || '01',
            avatar: newUser.avatar || '🧑‍🎓',
            totalStars: newUser.totalStars || 100,
            unlockedStickers: newUser.unlockedStickers || ['first-step'],
            awardedBadges: [],
            homeworkCount: 0,
            quizScores: {},
          };
          const updated = [...prev, newRecord];
          safeSetItem('hw_box_student_records', updated);
          return updated;
        }
        return prev;
      });
    }

    triggerStarBurst();
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hw_box_logged_in');
  };

  // Award Stars with animation
  const handleAwardStars = (amount: number, reason: string) => {
    setUser((prev) => {
      const newStars = prev.totalStars + amount;
      return {
        ...prev,
        totalStars: newStars,
      };
    });

    triggerStarBurst();
    setCelebration({
      isOpen: true,
      title: `ได้รับดาวเพิ่ม +${amount} ⭐`,
      message: reason,
      starAmount: amount,
      icon: '⭐',
    });
  };

  // Assignment Tasks Management
  const handleCreateAssignmentTask = (newTask: AssignmentTask) => {
    setAssignmentTasks((prev) => [newTask, ...prev]);
    saveTaskToFirestore(newTask);
    triggerFestiveConfetti();
  };

  const handleUpdateAssignmentTask = (updatedTask: AssignmentTask) => {
    setAssignmentTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    saveTaskToFirestore(updatedTask);
  };

  const handleDeleteAssignmentTask = (taskId: string) => {
    setAssignmentTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Student Submit Homework
  const handleSubmitHomework = (newHw: Homework) => {
    setHomeworkList((prev) => [newHw, ...prev]);
    saveHomeworkToFirestore(newHw);
    handleAwardStars(50, 'ส่งชิ้นงานการบ้านเรียบร้อย (+50 ดาว)');

    // Update student record homework count
    setStudentRecords((prev) =>
      prev.map((s) => (s.id === user.id ? { ...s, homeworkCount: s.homeworkCount + 1 } : s))
    );
  };

  // Teacher Review / Edit Homework
  const handleUpdateHomework = (updated: Homework) => {
    setHomeworkList((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    saveHomeworkToFirestore(updated);
  };

  // Delete Homework
  const handleDeleteHomework = (id: string) => {
    setHomeworkList((prev) => prev.filter((h) => h.id !== id));
  };

  // Student Submit Teacher Evaluation
  const handleSubmitEvaluation = (newEval: TeacherEvaluation) => {
    setEvaluations((prev) => [newEval, ...prev]);
    saveEvaluationToFirestore(newEval);
    handleAwardStars(30, 'ส่งบันทึกมุมสะท้อนถึงคุณครู (+30 ดาว)');
  };

  // Teacher reply to evaluation
  const handleTeacherReply = (evalId: string, replyText: string) => {
    const repliedAt = new Date().toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    setEvaluations((prev) =>
      prev.map((e) =>
        e.id === evalId
          ? {
              ...e,
              teacherReply: replyText,
              teacherRepliedAt: repliedAt,
            }
          : e
      )
    );
  };

  const handleDeleteEvaluation = (evalId: string) => {
    setEvaluations((prev) => prev.filter((e) => e.id !== evalId));
  };

  // Teacher award sticker to student
  const handleAwardStickerToStudent = (
    studentId: string,
    stickerId: string,
    stickerName: string,
    thaiTitle: string,
    icon: string,
    bonusStars: number,
    note: string
  ) => {
    const newBadge: AwardedBadgeItem = {
      id: 'badge-' + Date.now(),
      stickerId,
      stickerName,
      thaiTitle,
      icon,
      awardedAt: new Date().toLocaleDateString('th-TH'),
      awardedBy: user.name,
      note,
      starsAdded: bonusStars,
    };

    setStudentRecords((prev) =>
      prev.map((std) => {
        if (std.id === studentId) {
          const alreadyHasSticker = std.unlockedStickers.includes(stickerId);
          return {
            ...std,
            totalStars: std.totalStars + bonusStars,
            unlockedStickers: alreadyHasSticker ? std.unlockedStickers : [...std.unlockedStickers, stickerId],
            awardedBadges: [newBadge, ...(std.awardedBadges || [])],
          };
        }
        return std;
      })
    );

    // If awarding to the currently logged in student, update their live profile
    if (user.id === studentId) {
      setUser((prev) => ({
        ...prev,
        totalStars: prev.totalStars + bonusStars,
        unlockedStickers: prev.unlockedStickers.includes(stickerId)
          ? prev.unlockedStickers
          : [...prev.unlockedStickers, stickerId],
      }));
    }
  };

  // Update Student Record directly (e.g. from score input fields)
  const handleUpdateStudentRecord = (updatedStudent: StudentRecord) => {
    setStudentRecords((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    if (user.id === updatedStudent.id) {
      setUser((prev) => ({
        ...prev,
        totalStars: updatedStudent.totalStars,
      }));
    }
  };

  // Create, Update, Delete Quiz Lessons (For Teacher)
  const handleCreateLesson = (newLesson: QuizLesson) => {
    setLessons((prev) => [newLesson, ...prev]);
    triggerFestiveConfetti();
  };

  const handleUpdateLesson = (updatedLesson: QuizLesson) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l))
    );
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  // Quiz Finish
  const handleFinishQuiz = (lessonId: string, score: number, earnedStars: number) => {
    setLessons((prev) =>
      prev.map((l) => {
        if (l.id === lessonId) {
          const currentBest = l.bestScore ?? 0;
          return {
            ...l,
            bestScore: Math.max(currentBest, score),
            lastAttemptAt: new Date().toLocaleDateString('th-TH'),
          };
        }
        return l;
      })
    );

    // Also record into student exam scores
    const targetLesson = lessons.find((l) => l.id === lessonId);
    const lessonTitle =
      targetLesson?.title ||
      (lessonId === 'ev-technology'
        ? '1. เทคโนโลยีรถยนต์ไฟฟ้า (EV)'
        : '2. กลศาสตร์และกฎการเคลื่อนที่ (Physics)');
    const maxScore = targetLesson?.questions?.length || 10;

    const newScoreEntry: StudentExamScore = {
      id: 'exam-' + Date.now(),
      studentId: user.id,
      studentName: user.name,
      studentNo: user.studentNo || '12',
      studentClass: user.classRoom || 'ห้อง 1',
      studentAvatar: user.avatar,
      lessonId,
      lessonTitle,
      score,
      maxScore,
      submittedAt: new Date().toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    setExamScores((prev) => [newScoreEntry, ...prev]);

    if (lessonId === 'ev-technology' && score >= 8) {
      checkAndUnlockSticker('ev-master');
    }
    if (score === 10) {
      checkAndUnlockSticker('quiz-champion');
    }
  };

  // Student / Teacher Profile update handler (avatar, name, room, studentNo)
  const handleUpdateUserProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('hw_box_user', JSON.stringify(updatedUser));

    // If it's a student, synchronize studentRecords so their avatar, name, room, and studentNo update everywhere!
    if (updatedUser.role === 'student') {
      setStudentRecords((prev) => {
        const index = prev.findIndex(
          (rec) =>
            (updatedUser.studentIdCode && rec.studentIdCode === updatedUser.studentIdCode) ||
            rec.id === updatedUser.id ||
            rec.studentNo === updatedUser.studentNo
        );
        if (index >= 0) {
          const updatedList = [...prev];
          updatedList[index] = {
            ...updatedList[index],
            name: updatedUser.name,
            avatar: updatedUser.avatar,
            classRoom: updatedUser.classRoom,
            studentNo: updatedUser.studentNo,
          };
          return updatedList;
        }
        return prev;
      });
    }
  };

  // Handle Student Registration
  const handleRegisterStudent = (newRecord: StudentRecord, newUser: UserProfile) => {
    setStudentRecords((prev) => {
      const idx = prev.findIndex(
        (s) =>
          s.id === newRecord.id ||
          (newRecord.studentIdCode && s.studentIdCode === newRecord.studentIdCode)
      );
      let updated: StudentRecord[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...newRecord };
      } else {
        updated = [newRecord, ...prev];
      }
      safeSetItem('hw_box_student_records', updated);
      return updated;
    });

    handleLogin(newUser);
  };

  // Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={handleLogin}
        initialRole={user.role}
        studentRecords={studentRecords}
        onRegisterStudent={handleRegisterStudent}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] notebook-grid p-3 sm:p-5 md:p-8 flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto">
        {/* Header */}
        <Header
          user={user}
          onLogout={handleLogout}
          onOpenGoogleSheets={user.role === 'teacher' ? () => setIsGoogleSheetsModalOpen(true) : undefined}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* Navigation Tabs (4 Core Tabs) */}
        <NavigationTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={user.role}
          pendingHomeworkCount={homeworkList.filter((h) => h.status === 'pending').length}
        />

        {/* Main Content Area */}
        <main className="mb-10">
          {activeTab === 'homework' && (
            <HomeworkView
              currentUser={user}
              homeworkList={homeworkList}
              assignmentTasks={assignmentTasks}
              studentRecords={studentRecords}
              onSubmitHomework={handleSubmitHomework}
              onUpdateHomework={handleUpdateHomework}
              onDeleteHomework={handleDeleteHomework}
              onCreateAssignmentTask={handleCreateAssignmentTask}
              onUpdateAssignmentTask={handleUpdateAssignmentTask}
              onDeleteAssignmentTask={handleDeleteAssignmentTask}
              onAwardStars={handleAwardStars}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              currentUser={user}
              lessons={lessons}
              examScores={examScores}
              onCreateLesson={handleCreateLesson}
              onUpdateLesson={handleUpdateLesson}
              onDeleteLesson={handleDeleteLesson}
              onFinishQuiz={handleFinishQuiz}
              onAwardStars={handleAwardStars}
            />
          )}

          {activeTab === 'scorebook' && (
            <ScorebookView
              currentUser={user}
              stickers={stickers}
              quizLessons={lessons}
              homeworkList={homeworkList}
              studentRecords={studentRecords}
              onAwardStickerToStudent={handleAwardStickerToStudent}
              onUpdateStudentRecord={handleUpdateStudentRecord}
              onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
            />
          )}

          {activeTab === 'reflection' && (
            <TeacherEvaluationView
              currentUser={user}
              evaluations={evaluations}
              topics={reflectionTopics}
              onSubmitEvaluation={handleSubmitEvaluation}
              onTeacherReply={handleTeacherReply}
              onDeleteEvaluation={handleDeleteEvaluation}
              onAwardStars={handleAwardStars}
              onCreateTopic={handleCreateReflectionTopic}
              onUpdateTopic={handleUpdateReflectionTopic}
              onDeleteTopic={handleDeleteReflectionTopic}
              onOpenGoogleSheets={user.role === 'teacher' ? () => setIsGoogleSheetsModalOpen(true) : undefined}
            />
          )}

          {activeTab === 'dashboard' && user.role === 'teacher' && (
            <TeacherDashboardView
              currentUser={user}
              studentRecords={studentRecords}
              homeworkList={homeworkList}
              quizLessons={lessons}
              examScores={examScores}
              evaluations={evaluations}
              onUpdateStudentRecord={handleUpdateStudentRecord}
              onAwardStars={handleAwardStars}
              onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-6 border-t-3 border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-zinc-600 pb-4">
        <div className="flex items-center gap-2">
          <span>📦 กล่องการบ้าน (Homework Box)</span>
          <span>• สไตล์ภาพวาดลายเส้นการ์ตูน</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={downloadStandaloneHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-zinc-950 rounded-lg sketch-btn cursor-pointer font-black shadow-[2px_2px_0px_#000]"
            title="ดาวน์โหลดไฟล์ Single File HTML สำหรับรันแบบ Offline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก Single File HTML</span>
          </button>
        </div>
      </footer>

      {/* Google Sheets Sync & Integration Modal */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        studentRecords={studentRecords}
        homeworkList={homeworkList}
        examScores={examScores}
        evaluations={evaluations}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={celebration.isOpen}
        onClose={() => setCelebration((prev) => ({ ...prev, isOpen: false }))}
        title={celebration.title}
        message={celebration.message}
        starAmount={celebration.starAmount}
        icon={celebration.icon}
      />

      {/* Profile Picture & Info Management Modal */}
      <ProfilePictureModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUserProfile}
      />
    </div>
  );
}
