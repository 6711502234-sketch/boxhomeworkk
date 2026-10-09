import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './services/firebase';

import {
  UserProfile,
  UserRole,
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
import { CloudDeployModal } from './components/CloudDeployModal';
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
  saveReflectionToFirestore,
  saveStudentRecordToFirestore,
  saveExamScoreToFirestore,
  saveLessonToFirestore,
  deleteDocumentFromFirestore,
  TASKS_COLLECTION,
  HOMEWORKS_COLLECTION,
  EVALUATIONS_COLLECTION,
  REFLECTIONS_COLLECTION,
  STUDENT_RECORDS_COLLECTION,
  LESSONS_COLLECTION,
  subscribeToTasksFromFirestore,
  subscribeToHomeworksFromFirestore,
  subscribeToEvaluationsFromFirestore,
  subscribeToReflectionsFromFirestore,
  subscribeToStudentRecordsFromFirestore,
  subscribeToExamScoresFromFirestore,
  subscribeToLessonsFromFirestore,
  subscribeToUsersFromFirestore,
  findExistingUserInFirestore,
  broadcastRealtimeUpdate,
  subscribeToBroadcastRealtime,
} from './services/firebaseSync';
import { isClassMatching } from './utils/classMatching';
import { safeGetItem, safeSetItem } from './utils/storage';

import { Download } from 'lucide-react';

export default function App() {
  /* ---------- 0. Auth state ---------- */
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const profileUnsubRef = useRef<null | (() => void)>(null);

  /* ---------- 1. User Profile ---------- */
  const [user, setUser] = useState<UserProfile>(() => {
    const remember = safeGetItem<string>('hw_box_remember_login', 'true') === 'true';
    const savedGoogle = safeGetItem<UserProfile | null>('hw_box_saved_google_user', null);
    if (remember && savedGoogle) return savedGoogle;
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

  const [assignmentTasks, setAssignmentTasks] = useState<AssignmentTask[]>(() => {
    const saved = safeGetItem<AssignmentTask[]>('hw_box_assignment_tasks_single', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [homeworkList, setHomeworkList] = useState<Homework[]>(() => {
    const saved = safeGetItem<Homework[]>('hw_box_homeworks', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>(() => {
    const saved = safeGetItem<TeacherEvaluation[]>('hw_box_evaluations', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [lessons, setLessons] = useState<QuizLesson[]>(() => {
    const saved = safeGetItem<QuizLesson[]>('hw_box_lessons_single', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [stickers, setStickers] = useState<StickerAchievement[]>(() => {
    const saved = safeGetItem<StickerAchievement[]>('hw_box_stickers', []);
    return Array.isArray(saved) && saved.length > 0 ? saved : initialStickers;
  });

  const [examScores, setExamScores] = useState<StudentExamScore[]>(() => {
    const saved = safeGetItem<StudentExamScore[]>('hw_box_exam_scores', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [studentRecords, setStudentRecords] = useState<StudentRecord[]>(() => {
    const saved = safeGetItem<StudentRecord[]>('hw_box_student_records', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [reflectionTopics, setReflectionTopics] = useState<TeacherReflectionTopic[]>(() => {
    const saved = safeGetItem<TeacherReflectionTopic[]>('hw_box_reflection_topics', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    const saved = safeGetItem<UserProfile[]>('hw_box_registered_users', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('homework');
  const [celebration, setCelebration] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    starAmount?: number;
    icon?: string;
  }>({ isOpen: false, title: '', message: '' });

  /* =========================================================
     AUTH: ฟังสถานะ Google login + โหลดโปรไฟล์จาก Firestore
     ========================================================= */
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      // เคลียร์ listener โปรไฟล์เก่าก่อนเสมอ
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }

      const localLoggedIn = safeGetItem<string>('hw_box_logged_in', 'false') === 'true';
      const localUser = safeGetItem<UserProfile | null>('hw_box_user', null);

      if (!localLoggedIn) {
        setIsAuthenticated(false);
        setAuthReady(true);
        return;
      }

      if (!fbUser) {
        if (localUser) {
          setUser(localUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setAuthReady(true);
        return;
      }

      // หากมีเซสชันที่ล็อกอินไว้แล้ว ให้ดึงข้อมูลตามอีเมลที่ล็อกอินจริงเท่านั้น ห้ามนำข้อมูลของบัญชีเก่ามาปน
      const activeEmail = fbUser.email?.trim().toLowerCase();
      findExistingUserInFirestore({
        uid: fbUser.uid,
        email: activeEmail,
      })
        .then((existing) => {
          if (existing) {
            setUser(existing);
            setIsAuthenticated(true);
            safeSetItem('hw_box_saved_google_user', existing);
            safeSetItem('hw_box_user', existing);
          } else if (
            localUser &&
            (!activeEmail ||
              (localUser.googleEmail &&
                localUser.googleEmail.trim().toLowerCase() === activeEmail))
          ) {
            setUser(localUser);
            setIsAuthenticated(true);
          }
          setAuthReady(true);
        })
        .catch(() => {
          if (
            localUser &&
            (!activeEmail ||
              (localUser.googleEmail &&
                localUser.googleEmail.trim().toLowerCase() === activeEmail))
          ) {
            setUser(localUser);
            setIsAuthenticated(true);
          }
          setAuthReady(true);
        });
    });

    return () => {
      unsubAuth();
      if (profileUnsubRef.current) profileUnsubRef.current();
    };
  }, []);

  /* ---------- Persist to storage ---------- */
  useEffect(() => {
    if (isAuthenticated) {
      safeSetItem('hw_box_user', user);
    }
  }, [user, isAuthenticated]);
  useEffect(() => { safeSetItem('hw_box_logged_in', isAuthenticated ? 'true' : 'false'); }, [isAuthenticated]);
  useEffect(() => {
    safeSetItem('hw_box_assignment_tasks_single', assignmentTasks);
    safeSetItem('hw_box_assignment_tasks', assignmentTasks);
  }, [assignmentTasks]);
  useEffect(() => { safeSetItem('hw_box_homeworks', homeworkList); }, [homeworkList]);
  useEffect(() => { safeSetItem('hw_box_evaluations', evaluations); }, [evaluations]);
  useEffect(() => {
    safeSetItem('hw_box_lessons_single', lessons);
    safeSetItem('hw_box_lessons', lessons);
  }, [lessons]);
  useEffect(() => { safeSetItem('hw_box_stickers', stickers); }, [stickers]);
  useEffect(() => { safeSetItem('hw_box_exam_scores', examScores); }, [examScores]);
  useEffect(() => { safeSetItem('hw_box_student_records', studentRecords); }, [studentRecords]);
  useEffect(() => { safeSetItem('hw_box_reflection_topics', reflectionTopics); }, [reflectionTopics]);
  useEffect(() => { safeSetItem('hw_box_registered_users', registeredUsers); }, [registeredUsers]);

  /* ---------- Real-time Firestore sync ---------- */
  useEffect(() => {
    const unsubUsers = subscribeToUsersFromFirestore((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setRegisteredUsers((prev) => {
          const map = new Map<string, UserProfile>();
          firestoreUsers.forEach((u) => map.set(u.id, u));
          prev.forEach((u) => {
            if (!map.has(u.id)) map.set(u.id, u);
          });
          return Array.from(map.values());
        });
      }
    });
    const unsubTasks = subscribeToTasksFromFirestore((firestoreTasks) => {
      if (firestoreTasks && firestoreTasks.length > 0) {
        setAssignmentTasks((prev) => {
          const map = new Map<string, AssignmentTask>();
          firestoreTasks.forEach((t) => map.set(t.id, t));
          prev.forEach((t) => { if (!map.has(t.id)) map.set(t.id, t); });
          const merged = Array.from(map.values());
          if (
            merged.length === prev.length &&
            merged.every((item, idx) =>
              item.id === prev[idx]?.id &&
              item.createdAt === prev[idx]?.createdAt &&
              item.title === prev[idx]?.title)
          ) return prev;
          return merged;
        });
      }
    });

    const unsubHws = subscribeToHomeworksFromFirestore((firestoreHws) => {
      if (firestoreHws && firestoreHws.length > 0) {
        setHomeworkList((prev) => {
          const map = new Map<string, Homework>();
          firestoreHws.forEach((h) => map.set(h.id, h));
          prev.forEach((h) => { if (!map.has(h.id)) map.set(h.id, h); });
          const merged = Array.from(map.values());
          if (
            merged.length === prev.length &&
            merged.every((item, idx) =>
              item.id === prev[idx]?.id &&
              item.status === prev[idx]?.status &&
              item.teacherScore === prev[idx]?.teacherScore)
          ) return prev;
          return merged;
        });
      }
    });

    const unsubEvals = subscribeToEvaluationsFromFirestore((firestoreEvals) => {
      if (firestoreEvals && firestoreEvals.length > 0) {
        setEvaluations((prev) => {
          const map = new Map<string, TeacherEvaluation>();
          firestoreEvals.forEach((e) => map.set(e.id, e));
          prev.forEach((e) => { if (!map.has(e.id)) map.set(e.id, e); });
          const merged = Array.from(map.values());
          if (
            merged.length === prev.length &&
            merged.every((item, idx) =>
              item.id === prev[idx]?.id && item.teacherReply === prev[idx]?.teacherReply)
          ) return prev;
          return merged;
        });
      }
    });

    const unsubReflections = subscribeToReflectionsFromFirestore((firestoreTopics) => {
      if (firestoreTopics && firestoreTopics.length > 0) {
        setReflectionTopics((prev) => {
          const map = new Map<string, TeacherReflectionTopic>();
          firestoreTopics.forEach((t) => map.set(t.id, t));
          prev.forEach((t) => { if (!map.has(t.id)) map.set(t.id, t); });
          return Array.from(map.values());
        });
      }
    });

    const unsubStudentRecords = subscribeToStudentRecordsFromFirestore((firestoreRecords) => {
      if (firestoreRecords && firestoreRecords.length > 0) {
        setStudentRecords((prev) => {
          const map = new Map<string, StudentRecord>();
          firestoreRecords.forEach((s) => map.set(s.id, s));
          prev.forEach((s) => { if (!map.has(s.id)) map.set(s.id, s); });
          return Array.from(map.values());
        });
      }
    });

    const unsubExamScores = subscribeToExamScoresFromFirestore((firestoreScores) => {
      if (firestoreScores && firestoreScores.length > 0) {
        setExamScores((prev) => {
          const map = new Map<string, StudentExamScore>();
          firestoreScores.forEach((s) => map.set(s.id, s));
          prev.forEach((s) => { if (!map.has(s.id)) map.set(s.id, s); });
          return Array.from(map.values());
        });
      }
    });

    const unsubLessons = subscribeToLessonsFromFirestore((firestoreLessons) => {
      if (firestoreLessons && firestoreLessons.length > 0) {
        setLessons((prev) => {
          const map = new Map<string, QuizLesson>();
          firestoreLessons.forEach((l) => map.set(l.id, l));
          prev.forEach((l) => { if (!map.has(l.id)) map.set(l.id, l); });
          return Array.from(map.values());
        });
      }
    });

    const unsubBroadcast = subscribeToBroadcastRealtime((type, payload) => {
      if (type === 'NEW_TASK' || type === 'UPDATE_TASKS') setAssignmentTasks(payload);
      else if (type === 'NEW_HOMEWORK' || type === 'UPDATE_HOMEWORKS') setHomeworkList(payload);
      else if (type === 'NEW_EVALUATION' || type === 'UPDATE_EVALUATIONS') setEvaluations(payload);
      else if (type === 'UPDATE_STUDENT_RECORDS') setStudentRecords(payload);
      else if (type === 'UPDATE_REFLECTIONS') setReflectionTopics(payload);
      else if (type === 'UPDATE_EXAM_SCORES') setExamScores(payload);
      else if (type === 'UPDATE_LESSONS') setLessons(payload);
    });

    return () => {
      if (typeof unsubUsers === 'function') unsubUsers();
      if (typeof unsubTasks === 'function') unsubTasks();
      if (typeof unsubHws === 'function') unsubHws();
      if (typeof unsubEvals === 'function') unsubEvals();
      if (typeof unsubReflections === 'function') unsubReflections();
      if (typeof unsubStudentRecords === 'function') unsubStudentRecords();
      if (typeof unsubExamScores === 'function') unsubExamScores();
      if (typeof unsubLessons === 'function') unsubLessons();
      if (typeof unsubBroadcast === 'function') unsubBroadcast();
    };
  }, []);

  const handleCreateReflectionTopic = (topic: TeacherReflectionTopic) => {
    const withOwner: TeacherReflectionTopic = {
      ...topic,
      teacherId: topic.teacherId || user.id,
      authorTeacher: topic.authorTeacher || user.name,
    };
    setReflectionTopics((prev) => {
      const next = [withOwner, ...prev];
      broadcastRealtimeUpdate('UPDATE_REFLECTIONS', next);
      return next;
    });
    saveReflectionToFirestore(withOwner);
  };

  const handleUpdateReflectionTopic = (updated: TeacherReflectionTopic) => {
    setReflectionTopics((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? updated : t));
      broadcastRealtimeUpdate('UPDATE_REFLECTIONS', next);
      return next;
    });
    saveReflectionToFirestore(updated);
  };

  const handleDeleteReflectionTopic = (topicId: string) => {
    setReflectionTopics((prev) => {
      const next = prev.filter((t) => t.id !== topicId);
      broadcastRealtimeUpdate('UPDATE_REFLECTIONS', next);
      return next;
    });
    deleteDocumentFromFirestore(REFLECTIONS_COLLECTION, topicId);
  };

  /* ---------- Google Sheets auto-sync ---------- */
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

  /* ---------- Migration: Clean leftover sample data so teacher accounts only have teacher-added data ---------- */
  useEffect(() => {
    if (localStorage.getItem('hw_box_clean_teacher_v5') !== 'true') {
      localStorage.setItem('hw_box_clean_teacher_v5', 'true');
      const sampleTaskIds = new Set(sampleInitialAssignmentTasks.map((t) => t.id));
      const sampleHwIds = new Set(sampleInitialHomeworks.map((h) => h.id));
      const sampleEvalIds = new Set(sampleInitialEvaluations.map((e) => e.id));
      const sampleLessonIds = new Set(initialQuizLessons.map((l) => l.id));
      const sampleExamIds = new Set(sampleStudentExamScores.map((s) => s.id));
      const sampleStudentIds = new Set(sampleStudentRecords.map((s) => s.id));
      const sampleTopicIds = new Set(sampleReflectionTopics.map((t) => t.id));

      setAssignmentTasks((prev) => prev.filter((t) => !sampleTaskIds.has(t.id)));
      setHomeworkList((prev) => prev.filter((h) => !sampleHwIds.has(h.id)));
      setEvaluations((prev) => prev.filter((e) => !sampleEvalIds.has(e.id)));
      setLessons((prev) => prev.filter((l) => !sampleLessonIds.has(l.id)));
      setExamScores((prev) => prev.filter((s) => !sampleExamIds.has(s.id)));
      setStudentRecords((prev) => prev.filter((s) => !sampleStudentIds.has(s.id)));
      setReflectionTopics((prev) => prev.filter((t) => !sampleTopicIds.has(t.id)));
    }
  }, []);

  /* ---------- Stickers ---------- */
  const checkAndUnlockSticker = useCallback((stickerId: string) => {
    setStickers((prev) => {
      const target = prev.find((s) => s.id === stickerId);
      if (target && !target.isUnlocked) {
        const updated = prev.map((s) =>
          s.id === stickerId
            ? { ...s, isUnlocked: true, unlockedAt: new Date().toLocaleDateString('th-TH') }
            : s
        );
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
  }, []);

  // ซิงก์รายการสติกเกอร์ให้ตรงกับบัญชีที่เข้าสู่ระบบปัจจุบันเสมอ (ไม่นำสติกเกอร์ของบัญชีอื่นมาปน)
  useEffect(() => {
    const unlockedSet = new Set(user.unlockedStickers || []);
    setStickers(
      initialStickers.map((s) => ({
        ...s,
        isUnlocked: unlockedSet.has(s.id),
      }))
    );
  }, [user.id, user.unlockedStickers]);

  useEffect(() => {
    if (user.role !== 'student') return;
    const myHws = homeworkList.filter((h) => h.studentId === user.id);
    const myEvals = evaluations.filter((e) => e.studentId === user.id);
    if (myHws.length >= 1) checkAndUnlockSticker('first-step');
    if (myEvals.some((e) => e.overallRating === 5 || e.ratingStars === 5)) checkAndUnlockSticker('super-critic');
    if (user.totalStars >= 100) checkAndUnlockSticker('century-star');
    if (myHws.length >= 3 && user.totalStars >= 200) checkAndUnlockSticker('homework-legend');
  }, [user.id, user.role, user.totalStars, homeworkList, evaluations, checkAndUnlockSticker]);

  /* ---------- Login (สำหรับ LoginView แบบเดิม) ---------- */
  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    setIsAuthenticated(true);
    safeSetItem('hw_box_logged_in', 'true');
    safeSetItem('hw_box_user', newUser);
    if (newUser.googleEmail) {
      safeSetItem('hw_box_saved_google_user', newUser);
      safeSetItem('hw_box_remember_login', 'true');
    }
    setRegisteredUsers((prev) => {
      const filtered = prev.filter((u) => u.id !== newUser.id);
      const updated = [newUser, ...filtered];
      safeSetItem('hw_box_registered_users', updated);
      return updated;
    });
    saveUserProfileToFirestore(newUser);

    if (newUser.role === 'student') {
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
      setStudentRecords((prev) => {
        const exists = prev.some(
          (s) => s.id === newUser.id ||
            (newUser.studentIdCode && s.studentIdCode === newUser.studentIdCode)
        );
        if (!exists) {
          const updated = [...prev, newRecord];
          safeSetItem('hw_box_student_records', updated);
          broadcastRealtimeUpdate('UPDATE_STUDENT_RECORDS', updated);
          return updated;
        }
        return prev;
      });
      saveStudentRecordToFirestore(newRecord);
    }
    triggerStarBurst();
  };

  /* ---------- Logout (ออกจาก Firebase และล้างข้อมูลบัญชีเดิมออกทั้งหมด) ---------- */
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('signOut error:', e);
    }
    setIsAuthenticated(false);
    safeSetItem('hw_box_logged_in', 'false');
    safeSetItem('hw_box_remember_login', 'false');
    safeSetItem('hw_box_saved_google_user', null);
    safeSetItem('hw_box_user', null);
  };

  const handleAwardStars = (amount: number, reason: string) => {
    setUser((prev) => ({ ...prev, totalStars: prev.totalStars + amount }));
    triggerStarBurst();
    setCelebration({
      isOpen: true,
      title: `ได้รับดาวเพิ่ม +${amount} ⭐`,
      message: reason,
      starAmount: amount,
      icon: '⭐',
    });
  };

  const handleCreateAssignmentTask = (newTask: AssignmentTask) => {
    const taskWithOwner: AssignmentTask = {
      ...newTask,
      teacherId: newTask.teacherId || user.id,
      authorTeacher: newTask.authorTeacher || user.name,
    };
    setAssignmentTasks((prev) => {
      const next = [taskWithOwner, ...prev];
      broadcastRealtimeUpdate('UPDATE_TASKS', next);
      return next;
    });
    saveTaskToFirestore(taskWithOwner);
    triggerFestiveConfetti();
  };

  const handleUpdateAssignmentTask = (updatedTask: AssignmentTask) => {
    setAssignmentTasks((prev) => {
      const next = prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      broadcastRealtimeUpdate('UPDATE_TASKS', next);
      return next;
    });
    saveTaskToFirestore(updatedTask);
  };

  const handleDeleteAssignmentTask = (taskId: string) => {
    setAssignmentTasks((prev) => {
      const next = prev.filter((t) => t.id !== taskId);
      broadcastRealtimeUpdate('UPDATE_TASKS', next);
      return next;
    });
    deleteDocumentFromFirestore(TASKS_COLLECTION, taskId);
  };

  const handleSubmitHomework = (newHw: Homework) => {
    setHomeworkList((prev) => {
      const next = [newHw, ...prev];
      broadcastRealtimeUpdate('UPDATE_HOMEWORKS', next);
      return next;
    });
    saveHomeworkToFirestore(newHw);
    handleAwardStars(50, 'ส่งชิ้นงานการบ้านเรียบร้อย (+50 ดาว)');
    setStudentRecords((prev) => {
      const next = prev.map((s) => (s.id === user.id ? { ...s, homeworkCount: s.homeworkCount + 1 } : s));
      broadcastRealtimeUpdate('UPDATE_STUDENT_RECORDS', next);
      return next;
    });
  };

  const handleUpdateHomework = (updated: Homework) => {
    setHomeworkList((prev) => {
      const next = prev.map((h) => (h.id === updated.id ? updated : h));
      broadcastRealtimeUpdate('UPDATE_HOMEWORKS', next);
      return next;
    });
    saveHomeworkToFirestore(updated);
  };

  const handleDeleteHomework = (id: string) => {
    setHomeworkList((prev) => {
      const next = prev.filter((h) => h.id !== id);
      broadcastRealtimeUpdate('UPDATE_HOMEWORKS', next);
      return next;
    });
    deleteDocumentFromFirestore(HOMEWORKS_COLLECTION, id);
  };

  const handleSubmitEvaluation = (newEval: TeacherEvaluation) => {
    setEvaluations((prev) => {
      const next = [newEval, ...prev];
      broadcastRealtimeUpdate('UPDATE_EVALUATIONS', next);
      return next;
    });
    saveEvaluationToFirestore(newEval);
    handleAwardStars(30, 'ส่งบันทึกมุมสะท้อนถึงคุณครู (+30 ดาว)');
  };

  const handleTeacherReply = (evalId: string, replyText: string) => {
    const repliedAt = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
    let updatedEval: TeacherEvaluation | null = null;
    setEvaluations((prev) => {
      const next = prev.map((e) => {
        if (e.id === evalId) {
          const up = { ...e, teacherReply: replyText, teacherRepliedAt: repliedAt };
          updatedEval = up;
          return up;
        }
        return e;
      });
      broadcastRealtimeUpdate('UPDATE_EVALUATIONS', next);
      return next;
    });
    if (updatedEval) saveEvaluationToFirestore(updatedEval);
  };

  const handleDeleteEvaluation = (evalId: string) => {
    setEvaluations((prev) => {
      const next = prev.filter((e) => e.id !== evalId);
      broadcastRealtimeUpdate('UPDATE_EVALUATIONS', next);
      return next;
    });
    deleteDocumentFromFirestore(EVALUATIONS_COLLECTION, evalId);
  };

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

    setStudentRecords((prev) => {
      const next = prev.map((std) => {
        if (std.id === studentId) {
          const has = std.unlockedStickers.includes(stickerId);
          return {
            ...std,
            totalStars: std.totalStars + bonusStars,
            unlockedStickers: has ? std.unlockedStickers : [...std.unlockedStickers, stickerId],
            awardedBadges: [newBadge, ...(std.awardedBadges || [])],
          };
        }
        return std;
      });
      broadcastRealtimeUpdate('UPDATE_STUDENT_RECORDS', next);
      return next;
    });

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

  const handleAddStudentRecord = (newStudent: StudentRecord) => {
    const withTeacher: StudentRecord = {
      ...newStudent,
      teacherId: newStudent.teacherId || user.id,
    };
    setStudentRecords((prev) => {
      const next = [withTeacher, ...prev];
      safeSetItem('hw_box_student_records', next);
      broadcastRealtimeUpdate('UPDATE_STUDENT_RECORDS', next);
      return next;
    });
    saveStudentRecordToFirestore(withTeacher);
  };

  const handleUpdateStudentRecord = (updatedStudent: StudentRecord) => {
    setStudentRecords((prev) => {
      const next = prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
      broadcastRealtimeUpdate('UPDATE_STUDENT_RECORDS', next);
      return next;
    });
    saveStudentRecordToFirestore(updatedStudent);
    if (user.id === updatedStudent.id) {
      setUser((prev) => ({ ...prev, totalStars: updatedStudent.totalStars }));
    }
  };

  const handleDeleteStudentRecord = (studentId: string) => {
    setStudentRecords((prev) => {
      const next = prev.filter((s) => s.id !== studentId);
      safeSetItem('hw_box_student_records', next);
      broadcastRealtimeUpdate('UPDATE_STUDENT_RECORDS', next);
      return next;
    });
    deleteDocumentFromFirestore(STUDENT_RECORDS_COLLECTION, studentId);
  };

  const handleCreateLesson = (newLesson: QuizLesson) => {
    const lessonWithOwner: QuizLesson = {
      ...newLesson,
      teacherId: newLesson.teacherId || user.id,
      authorTeacher: newLesson.authorTeacher || user.name,
    };
    setLessons((prev) => {
      const next = [lessonWithOwner, ...prev];
      broadcastRealtimeUpdate('UPDATE_LESSONS', next);
      return next;
    });
    saveLessonToFirestore(lessonWithOwner);
    triggerFestiveConfetti();
  };

  const handleUpdateLesson = (updatedLesson: QuizLesson) => {
    setLessons((prev) => {
      const next = prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l));
      broadcastRealtimeUpdate('UPDATE_LESSONS', next);
      return next;
    });
    saveLessonToFirestore(updatedLesson);
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessons((prev) => {
      const next = prev.filter((l) => l.id !== lessonId);
      broadcastRealtimeUpdate('UPDATE_LESSONS', next);
      return next;
    });
    deleteDocumentFromFirestore(LESSONS_COLLECTION, lessonId);
  };

  const handleFinishQuiz = (lessonId: string, score: number, _earnedStars: number) => {
    setLessons((prev) =>
      prev.map((l) =>
        l.id === lessonId
          ? {
              ...l,
              bestScore: Math.max(l.bestScore ?? 0, score),
              lastAttemptAt: new Date().toLocaleDateString('th-TH'),
            }
          : l
      )
    );

    const targetLesson = lessons.find((l) => l.id === lessonId);
    const lessonTitle =
      targetLesson?.title ||
      (lessonId === 'ev-technology'
        ? '1. เทคโนโลยีรถยนต์ไฟฟ้า (EV)'
        : '2. กลศาสตร์และกฎการเคลื่อนที่ (Physics)');
    const maxScore = targetLesson?.questions?.length || 10;

    const newScoreEntry: StudentExamScore = {
      id: 'exam-' + Date.now(),
      teacherId: targetLesson?.teacherId,
      studentId: user.id,
      studentName: user.name,
      studentNo: user.studentNo || '1',
      studentClass: user.classRoom || 'ห้อง 1',
      studentAvatar: user.avatar,
      lessonId,
      lessonTitle,
      score,
      maxScore,
      submittedAt: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    setExamScores((prev) => {
      const next = [newScoreEntry, ...prev];
      broadcastRealtimeUpdate('UPDATE_EXAM_SCORES', next);
      return next;
    });
    saveExamScoreToFirestore(newScoreEntry);

    setStudentRecords((prev) => {
      const next = prev.map((s) => {
        if (s.id === user.id) {
          const updated: StudentRecord = {
            ...s,
            quizScores: {
              ...(s.quizScores || {}),
              [lessonId]: Math.max(s.quizScores?.[lessonId] ?? 0, score),
            },
          };
          saveStudentRecordToFirestore(updated);
          return updated;
        }
        return s;
      });
      broadcastRealtimeUpdate('UPDATE_STUDENT_RECORDS', next);
      return next;
    });

    if (lessonId === 'ev-technology' && score >= 8) checkAndUnlockSticker('ev-master');
    if (score === 10) checkAndUnlockSticker('quiz-champion');
  };

  const handleUpdateUserProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    safeSetItem('hw_box_user', updatedUser);
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

  const handleRegisterStudent = (newRecord: StudentRecord, newUser: UserProfile) => {
    setStudentRecords((prev) => {
      const idx = prev.findIndex(
        (s) => s.id === newRecord.id ||
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

  /* ---------- Scoped Data per Teacher Account & Classrooms ---------- */
  const isTeacherRole = user.role === 'teacher';

  const visibleAssignmentTasks = isTeacherRole
    ? assignmentTasks.filter(
        (t) => t.teacherId === user.id || (!t.teacherId && t.authorTeacher === user.name)
      )
    : assignmentTasks;

  const teacherTaskIds = new Set(visibleAssignmentTasks.map((t) => t.id));

  const visibleLessons = isTeacherRole
    ? lessons.filter(
        (l) => l.teacherId === user.id || (!l.teacherId && l.authorTeacher === user.name)
      )
    : lessons.map((l) => {
        const myAttempts = examScores.filter(
          (s) => s.studentId === user.id && s.lessonId === l.id
        );
        const myBest =
          myAttempts.length > 0
            ? Math.max(...myAttempts.map((a) => a.score))
            : undefined;
        const myLast = myAttempts[0]?.submittedAt;
        return {
          ...l,
          bestScore: myBest,
          lastAttemptAt: myLast,
        };
      });

  const teacherLessonIds = new Set(visibleLessons.map((l) => l.id));

  const visibleReflectionTopics = isTeacherRole
    ? reflectionTopics.filter(
        (t) => t.teacherId === user.id || (!t.teacherId && t.authorTeacher === user.name)
      )
    : reflectionTopics;

  const teacherTopicIds = new Set(visibleReflectionTopics.map((t) => t.id));

  const teacherAddedStudents = isTeacherRole
    ? studentRecords.filter((s) => s.teacherId === user.id)
    : [];

  // Determine the classrooms active in this teacher's account
  // Note: A brand-new teacher account with no added tasks/lessons/topics/students/classes starts with 0 classrooms
  const teacherHasAddedContent =
    visibleAssignmentTasks.length > 0 ||
    visibleLessons.length > 0 ||
    visibleReflectionTopics.length > 0 ||
    teacherAddedStudents.length > 0 ||
    (Array.isArray(user.teachingClasses) && user.teachingClasses.some((c) => c && c.trim() !== '' && c.trim() !== 'ทุกห้อง'));

  const teacherClassrooms = (() => {
    if (!isTeacherRole || !teacherHasAddedContent) return [] as string[];
    const set = new Set<string>();
    const addRoomRaw = (raw?: string) => {
      if (!raw) return;
      raw.split(',').forEach((part) => {
        const clean = part.trim();
        if (clean && clean !== 'ทุกห้อง' && clean !== 'all') {
          set.add(clean);
        }
      });
    };
    (user.teachingClasses || []).forEach(addRoomRaw);
    visibleAssignmentTasks.forEach((t) => addRoomRaw(t.targetClass));
    visibleLessons.forEach((l) => addRoomRaw(l.targetClass));
    visibleReflectionTopics.forEach((t) => addRoomRaw(t.targetClass));
    teacherAddedStudents.forEach((s) => addRoomRaw(s.classRoom));
    return Array.from(set);
  })();

  const matchesTeacherClassroom = (studentClass?: string) => {
    if (!studentClass || teacherClassrooms.length === 0) return false;
    return teacherClassrooms.some((room) => isClassMatching(studentClass, room));
  };

  const visibleHomeworkList = isTeacherRole
    ? homeworkList.filter(
        (h) =>
          h.teacherId === user.id ||
          (h.taskId && teacherTaskIds.has(h.taskId)) ||
          matchesTeacherClassroom(h.studentClass)
      )
    : homeworkList.filter((h) => h.studentId === user.id);

  const visibleExamScores = isTeacherRole
    ? examScores.filter(
        (s) =>
          s.teacherId === user.id ||
          teacherLessonIds.has(s.lessonId) ||
          matchesTeacherClassroom(s.studentClass)
      )
    : examScores.filter((s) => s.studentId === user.id);

  const visibleEvaluations = isTeacherRole
    ? evaluations.filter(
        (e) =>
          e.teacherId === user.id ||
          (e.topicId && teacherTopicIds.has(e.topicId)) ||
          matchesTeacherClassroom(e.studentClass)
      )
    : evaluations.filter((e) => e.studentId === user.id);

  const teacherInteractedStudentIds = new Set<string>([
    ...visibleHomeworkList.map((h) => h.studentId),
    ...visibleExamScores.map((s) => s.studentId),
    ...visibleEvaluations.map((e) => e.studentId),
  ]);

  const visibleStudentRecords = (() => {
    const baseList = isTeacherRole
      ? studentRecords.filter(
          (s) =>
            s.teacherId === user.id ||
            teacherInteractedStudentIds.has(s.id) ||
            matchesTeacherClassroom(s.classRoom)
        )
      : studentRecords;

    const map = new Map<string, StudentRecord>();
    baseList.forEach((s) => map.set(s.id, { ...s }));

    // Ensure every real student who submitted homework, took a quiz, or posted a reflection in these classrooms is included
    const ensureStudentFromActivity = (
      studentId: string,
      studentName: string,
      studentClass: string,
      studentNo?: string,
      studentAvatar?: string
    ) => {
      if (!studentId && !studentName) return;
      const existing =
        (studentId && map.get(studentId)) ||
        Array.from(map.values()).find(
          (s) =>
            s.name.toLowerCase() === (studentName || '').toLowerCase() &&
            isClassMatching(s.classRoom, studentClass)
        );
      if (!existing) {
        const id = studentId || `std-${studentName}-${studentClass}`;
        const cleanClass = studentClass || teacherClassrooms[0] || 'ม.2/1';
        const cleanNo = studentNo || String(map.size + 1);
        map.set(id, {
          id,
          teacherId: user.id,
          name: studentName || 'นักเรียน',
          studentIdCode: `STD-${cleanClass.replace(/[^0-9]/g, '') || '201'}${String(cleanNo).padStart(2, '0')}`,
          classRoom: cleanClass,
          studentNo: String(cleanNo),
          avatar: studentAvatar || 'student-boy-glasses',
          totalStars: 100,
          unlockedStickers: ['first-step'],
          awardedBadges: [],
          homeworkCount: 0,
          quizScores: {},
        });
      }
    };

    if (!isTeacherRole || teacherHasAddedContent || teacherInteractedStudentIds.size > 0) {
      visibleHomeworkList.forEach((h) =>
        ensureStudentFromActivity(h.studentId, h.studentName, h.studentClass, h.studentNo, h.studentAvatar)
      );
      visibleExamScores.forEach((s) =>
        ensureStudentFromActivity(s.studentId, s.studentName, s.studentClass, s.studentNo, s.studentAvatar)
      );
      visibleEvaluations.forEach((e) =>
        ensureStudentFromActivity(e.studentId, e.studentName, e.studentClass, e.studentNo, e.studentAvatar)
      );
    }

    // Enrich each student record with real counts & scores from actual system usage
    return Array.from(map.values()).map((student) => {
      const myHws = visibleHomeworkList.filter(
        (h) =>
          h.studentId === student.id ||
          (h.studentName && h.studentName.toLowerCase() === student.name.toLowerCase())
      );
      const myExams = visibleExamScores.filter(
        (e) =>
          e.studentId === student.id ||
          (e.studentName && e.studentName.toLowerCase() === student.name.toLowerCase())
      );
      const myEvals = visibleEvaluations.filter(
        (ev) =>
          ev.studentId === student.id ||
          (ev.studentName && ev.studentName.toLowerCase() === student.name.toLowerCase())
      );

      const computedQuizScores: Record<string, number> = { ...(student.quizScores || {}) };
      myExams.forEach((ex) => {
        computedQuizScores[ex.lessonId] = Math.max(computedQuizScores[ex.lessonId] ?? 0, ex.score);
      });

      const realHwCount = Math.max(student.homeworkCount || 0, myHws.length);
      const activityStars =
        myHws.reduce((sum, h) => sum + (h.earnedStars || 50), 0) +
        myExams.reduce((sum, e) => sum + e.score * 10, 0) +
        myEvals.length * 20 +
        (student.awardedBadges || []).reduce((sum, b) => sum + (b.starsAdded || 0), 0);

      return {
        ...student,
        homeworkCount: realHwCount,
        quizScores: computedQuizScores,
        totalStars: Math.max(student.totalStars || 0, activityStars),
      };
    });
  })();

  /* ---------- Render ---------- */
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5] text-stone-600">
        กำลังตรวจสอบการเข้าสู่ระบบ...
      </div>
    );
  }

  const isAuthBridgeMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('google_auth_bridge') === '1';

  if (!isAuthenticated || isAuthBridgeMode) {
    return (
      <>
        <LoginView
          onLogin={handleLogin}
          studentRecords={studentRecords}
          registeredUsers={registeredUsers}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
        />
        <CloudDeployModal
          isOpen={isCloudModalOpen}
          onClose={() => setIsCloudModalOpen(false)}
          counts={{
            tasks: assignmentTasks.length,
            homeworks: homeworkList.length,
            evaluations: evaluations.length,
            reflections: reflectionTopics.length,
            students: studentRecords.length,
            exams: examScores.length,
            lessons: lessons.length,
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] notebook-grid p-3 sm:p-5 md:p-8 flex flex-col justify-between font-['JaoTomato_Thin','JaoTomato','เจ้ามะเขือเทศ','Mali',sans-serif]">
      <div className="max-w-6xl w-full mx-auto">
        <Header
          user={user}
          onLogout={handleLogout}
          onOpenGoogleSheets={user.role === 'teacher' ? () => setIsGoogleSheetsModalOpen(true) : undefined}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
        />

        <NavigationTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={user.role}
          pendingHomeworkCount={visibleHomeworkList.filter((h) => h.status === 'pending').length}
        />

        <main className="mb-10">
          {activeTab === 'homework' && (
            <HomeworkView
              currentUser={user}
              homeworkList={visibleHomeworkList}
              assignmentTasks={visibleAssignmentTasks}
              studentRecords={visibleStudentRecords}
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
              lessons={visibleLessons}
              examScores={visibleExamScores}
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
              quizLessons={visibleLessons}
              homeworkList={visibleHomeworkList}
              studentRecords={visibleStudentRecords}
              onAwardStickerToStudent={handleAwardStickerToStudent}
              onUpdateStudentRecord={handleUpdateStudentRecord}
              onAddStudent={handleAddStudentRecord}
              onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
            />
          )}

          {activeTab === 'reflection' && (
            <TeacherEvaluationView
              currentUser={user}
              evaluations={visibleEvaluations}
              topics={visibleReflectionTopics}
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
              studentRecords={visibleStudentRecords}
              homeworkList={visibleHomeworkList}
              assignmentTasks={visibleAssignmentTasks}
              quizLessons={visibleLessons}
              examScores={visibleExamScores}
              evaluations={visibleEvaluations}
              reflectionTopics={visibleReflectionTopics}
              onUpdateStudentRecord={handleUpdateStudentRecord}
              onAddStudent={handleAddStudentRecord}
              onAwardStars={handleAwardStars}
              onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
              onDeleteStudent={handleDeleteStudentRecord}
            />
          )}
        </main>
      </div>

      <footer className="max-w-6xl w-full mx-auto pt-6 border-t border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-normal text-stone-600 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-stone-900 font-medium">TaskHub</span>
          <span>• ระบบสารสนเทศการเรียนรู้</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={downloadStandaloneHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-stone-900 rounded-lg cursor-pointer font-normal border border-amber-500 shadow-xs transition-colors"
            title="ดาวน์โหลดไฟล์ Single File HTML สำหรับรันแบบ Offline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก Single File HTML</span>
          </button>
        </div>
      </footer>

      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        studentRecords={visibleStudentRecords}
        homeworkList={visibleHomeworkList}
        examScores={visibleExamScores}
        evaluations={visibleEvaluations}
      />

      <CelebrationModal
        isOpen={celebration.isOpen}
        onClose={() => setCelebration((prev) => ({ ...prev, isOpen: false }))}
        title={celebration.title}
        message={celebration.message}
        starAmount={celebration.starAmount}
        icon={celebration.icon}
      />

      <ProfilePictureModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUserProfile}
      />

      <CloudDeployModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        counts={{
          tasks: visibleAssignmentTasks.length,
          homeworks: visibleHomeworkList.length,
          evaluations: visibleEvaluations.length,
          reflections: visibleReflectionTopics.length,
          students: visibleStudentRecords.length,
          exams: visibleExamScores.length,
          lessons: visibleLessons.length,
        }}
      />
    </div>
  );
}
