import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  WhiteboardSession,
  WhiteboardMessage,
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
import { AdminView } from './components/AdminView';
import { LoginView } from './components/LoginView';
import { CelebrationModal } from './components/CelebrationModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { ProfilePictureModal } from './components/ProfilePictureModal';
import { AdminProfileModal } from './components/AdminProfileModal';
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
  USERS_COLLECTION,
  TASKS_COLLECTION,
  HOMEWORKS_COLLECTION,
  EVALUATIONS_COLLECTION,
  REFLECTIONS_COLLECTION,
  STUDENT_RECORDS_COLLECTION,
  EXAM_SCORES_COLLECTION,
  LESSONS_COLLECTION,
  WHITEBOARD_SESSIONS_COLLECTION,
  WHITEBOARD_MESSAGES_COLLECTION,
  subscribeToTasksFromFirestore,
  subscribeToHomeworksFromFirestore,
  subscribeToEvaluationsFromFirestore,
  subscribeToReflectionsFromFirestore,
  subscribeToStudentRecordsFromFirestore,
  subscribeToExamScoresFromFirestore,
  subscribeToLessonsFromFirestore,
  subscribeToUsersFromFirestore,
  subscribeToWhiteboardSessionsFromFirestore,
  subscribeToWhiteboardMessagesFromFirestore,
  saveWhiteboardSessionToFirestore,
  saveWhiteboardMessageToFirestore,
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
  const deletedLessonIdsRef = useRef<Set<string>>(new Set());

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
    return Array.isArray(saved) && saved.length > 0 ? saved : sampleInitialEvaluations;
  });

  const [lessons, setLessons] = useState<QuizLesson[]>(() => {
    const saved = safeGetItem<QuizLesson[]>('hw_box_lessons_single', []);
    return Array.isArray(saved) && saved.length > 0 ? saved : initialQuizLessons;
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
    return Array.isArray(saved) && saved.length > 0 ? saved : sampleReflectionTopics;
  });

  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    const saved = safeGetItem<UserProfile[]>('hw_box_registered_users', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [whiteboardSessions, setWhiteboardSessions] = useState<WhiteboardSession[]>(() => {
    const saved = safeGetItem<WhiteboardSession[]>('hw_box_whiteboard_sessions', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [whiteboardMessages, setWhiteboardMessages] = useState<WhiteboardMessage[]>(() => {
    const saved = safeGetItem<WhiteboardMessage[]>('hw_box_whiteboard_messages', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAdminProfileModalOpen, setIsAdminProfileModalOpen] = useState<boolean>(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const remember = safeGetItem<string>('hw_box_remember_login', 'true') === 'true';
    const savedGoogle = safeGetItem<UserProfile | null>('hw_box_saved_google_user', null);
    const u = (remember && savedGoogle) ? savedGoogle : safeGetItem<UserProfile | null>('hw_box_user', null);
    if (u?.role === 'admin') return 'admin_dashboard';
    return 'homework';
  });
  const [celebration, setCelebration] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    starAmount?: number;
    icon?: string;
  }>({ isOpen: false, title: '', message: '' });

  // Guard tab consistency when user role changes
  useEffect(() => {
    if (user.role === 'admin') {
      if (!activeTab.startsWith('admin_') && activeTab !== 'admin') {
        setActiveTab('admin_dashboard');
      }
    } else if (user.role === 'teacher') {
      if (activeTab.startsWith('admin_') || activeTab === 'admin') {
        setActiveTab('homework');
      }
    } else if (user.role === 'student') {
      if (activeTab.startsWith('admin_') || activeTab === 'admin' || activeTab === 'dashboard') {
        setActiveTab('homework');
      }
    }
  }, [user.role, activeTab]);

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
      if (Array.isArray(firestoreLessons)) {
        setLessons((prev) => {
          const map = new Map<string, QuizLesson>();
          firestoreLessons.forEach((l) => {
            if (!deletedLessonIdsRef.current.has(l.id)) {
              map.set(l.id, l);
            }
          });
          const result = Array.from(map.values());
          safeSetItem('hw_box_lessons_single', result);
          safeSetItem('hw_box_lessons', result);
          return result;
        });
      }
    });

    const unsubWhiteboardSessions = subscribeToWhiteboardSessionsFromFirestore((sessions) => {
      if (Array.isArray(sessions)) {
        setWhiteboardSessions(sessions);
        safeSetItem('hw_box_whiteboard_sessions', sessions);
      }
    });

    const unsubWhiteboardMessages = subscribeToWhiteboardMessagesFromFirestore((messages) => {
      if (Array.isArray(messages)) {
        setWhiteboardMessages(messages);
        safeSetItem('hw_box_whiteboard_messages', messages);
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
      else if (type === 'UPDATE_WHITEBOARD_SESSIONS') {
        setWhiteboardSessions(payload);
        safeSetItem('hw_box_whiteboard_sessions', payload);
      } else if (type === 'UPDATE_WHITEBOARD_MESSAGES') {
        setWhiteboardMessages(payload);
        safeSetItem('hw_box_whiteboard_messages', payload);
      }
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
      if (typeof unsubWhiteboardSessions === 'function') unsubWhiteboardSessions();
      if (typeof unsubWhiteboardMessages === 'function') unsubWhiteboardMessages();
      if (typeof unsubBroadcast === 'function') unsubBroadcast();
    };
  }, []);

  const handleCreateReflectionTopic = (topic: TeacherReflectionTopic) => {
    const withOwner: TeacherReflectionTopic = {
      ...topic,
      teacherId: topic.teacherId || user.id,
      authorTeacher: topic.authorTeacher || user.name,
      teacherAvatar: topic.teacherAvatar || user.avatar || 'teacher-female-glasses',
    };
    setReflectionTopics((prev) => {
      const next = [withOwner, ...prev];
      safeSetItem('hw_box_reflection_topics', next);
      broadcastRealtimeUpdate('UPDATE_REFLECTIONS', next);
      return next;
    });
    saveReflectionToFirestore(withOwner);
  };

  const handleUpdateReflectionTopic = (updated: TeacherReflectionTopic) => {
    const withOwner: TeacherReflectionTopic = {
      ...updated,
      teacherId: updated.teacherId || user.id,
      authorTeacher: updated.authorTeacher || user.name,
    };
    setReflectionTopics((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? withOwner : t));
      safeSetItem('hw_box_reflection_topics', next);
      broadcastRealtimeUpdate('UPDATE_REFLECTIONS', next);
      return next;
    });
    saveReflectionToFirestore(withOwner);
  };

  const handleDeleteReflectionTopic = (topicId: string) => {
    setReflectionTopics((prev) => {
      const next = prev.filter((t) => t.id !== topicId);
      safeSetItem('hw_box_reflection_topics', next);
      broadcastRealtimeUpdate('UPDATE_REFLECTIONS', next);
      return next;
    });
    deleteDocumentFromFirestore(REFLECTIONS_COLLECTION, topicId);
  };

  /* ---------- Whiteboard Handlers ---------- */
  const handleStartWhiteboardSession = (sessionData: {
    title: string;
    topicCategory?: string;
    promptQuestion: string;
    imageUrl?: string;
    targetClass: string;
  }) => {
    const newSession: WhiteboardSession = {
      id: `wb-session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      teacherId: user.id,
      teacherName: user.name || 'คุณครู',
      authorTeacher: user.name || 'คุณครู',
      teacherAvatar: user.avatar || 'teacher-female-glasses',
      title: sessionData.title,
      topicCategory: sessionData.topicCategory || 'คำถามชวนคิดสะท้อนบทเรียน',
      promptQuestion: sessionData.promptQuestion,
      imageUrl: sessionData.imageUrl,
      targetClass: sessionData.targetClass,
      status: 'active',
      createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
    };

    setWhiteboardSessions((prev) => {
      // Mark any other active sessions of this teacher as ended, then prepend new one
      const updated = [
        newSession,
        ...prev.map((s) =>
          s.teacherId === user.id && s.status === 'active'
            ? { ...s, status: 'ended' as const, endedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.' }
            : s
        ),
      ];
      safeSetItem('hw_box_whiteboard_sessions', updated);
      broadcastRealtimeUpdate('UPDATE_WHITEBOARD_SESSIONS', updated);
      return updated;
    });

    saveWhiteboardSessionToFirestore(newSession);
    triggerFestiveConfetti();
  };

  const handleEndWhiteboardSession = (sessionId: string) => {
    setWhiteboardSessions((prev) => {
      const next = prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'ended' as const,
              endedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
            }
          : s
      );
      safeSetItem('hw_box_whiteboard_sessions', next);
      broadcastRealtimeUpdate('UPDATE_WHITEBOARD_SESSIONS', next);
      const target = next.find((s) => s.id === sessionId);
      if (target) saveWhiteboardSessionToFirestore(target);
      return next;
    });
  };

  const handleDeleteWhiteboardSession = (sessionId: string) => {
    setWhiteboardSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      safeSetItem('hw_box_whiteboard_sessions', next);
      broadcastRealtimeUpdate('UPDATE_WHITEBOARD_SESSIONS', next);
      return next;
    });
    deleteDocumentFromFirestore(WHITEBOARD_SESSIONS_COLLECTION, sessionId);

    setWhiteboardMessages((prev) => {
      const toDelete = prev.filter((m) => m.sessionId === sessionId);
      toDelete.forEach((m) => deleteDocumentFromFirestore(WHITEBOARD_MESSAGES_COLLECTION, m.id));
      const next = prev.filter((m) => m.sessionId !== sessionId);
      safeSetItem('hw_box_whiteboard_messages', next);
      broadcastRealtimeUpdate('UPDATE_WHITEBOARD_MESSAGES', next);
      return next;
    });
  };

  const handleClearEndedWhiteboardSessions = () => {
    const toDeleteSessions = whiteboardSessions.filter(
      (s) => s.teacherId === user.id && s.status === 'ended'
    );
    if (toDeleteSessions.length === 0) return;
    const toDeleteIds = new Set(toDeleteSessions.map((s) => s.id));

    setWhiteboardSessions((prev) => {
      const next = prev.filter((s) => !toDeleteIds.has(s.id));
      safeSetItem('hw_box_whiteboard_sessions', next);
      broadcastRealtimeUpdate('UPDATE_WHITEBOARD_SESSIONS', next);
      return next;
    });

    toDeleteSessions.forEach((s) => {
      deleteDocumentFromFirestore(WHITEBOARD_SESSIONS_COLLECTION, s.id);
    });

    setWhiteboardMessages((prev) => {
      const toDeleteMsgs = prev.filter((m) => toDeleteIds.has(m.sessionId));
      toDeleteMsgs.forEach((m) => deleteDocumentFromFirestore(WHITEBOARD_MESSAGES_COLLECTION, m.id));
      const next = prev.filter((m) => !toDeleteIds.has(m.sessionId));
      safeSetItem('hw_box_whiteboard_messages', next);
      broadcastRealtimeUpdate('UPDATE_WHITEBOARD_MESSAGES', next);
      return next;
    });
  };

  const handleSendWhiteboardMessage = (data: {
    sessionId: string;
    text: string;
    imageUrl?: string;
  }) => {
    const isStudent = user.role === 'student';
    const newMsg: WhiteboardMessage = {
      id: `wb-msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      sessionId: data.sessionId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      senderAvatar: user.avatar,
      senderClass: user.classRoom,
      senderNo: user.studentNo,
      text: data.text,
      imageUrl: data.imageUrl,
      createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      timestamp: Date.now(),
    };

    setWhiteboardMessages((prev) => {
      const next = [...prev, newMsg];
      safeSetItem('hw_box_whiteboard_messages', next);
      broadcastRealtimeUpdate('UPDATE_WHITEBOARD_MESSAGES', next);
      return next;
    });

    saveWhiteboardMessageToFirestore(newMsg);
  };

  const handleDeleteWhiteboardMessage = (messageId: string) => {
    setWhiteboardMessages((prev) => {
      const next = prev.filter((m) => m.id !== messageId);
      safeSetItem('hw_box_whiteboard_messages', next);
      broadcastRealtimeUpdate('UPDATE_WHITEBOARD_MESSAGES', next);
      return next;
    });
    deleteDocumentFromFirestore(WHITEBOARD_MESSAGES_COLLECTION, messageId);
  };

  const handleUpdateWhiteboardSession = (updatedSession: WhiteboardSession) => {
    setWhiteboardSessions((prev) => {
      const next = prev.map((s) => (s.id === updatedSession.id ? updatedSession : s));
      safeSetItem('hw_box_whiteboard_sessions', next);
      broadcastRealtimeUpdate('UPDATE_WHITEBOARD_SESSIONS', next);
      return next;
    });
    saveWhiteboardSessionToFirestore(updatedSession);
  };

  const handleEditWhiteboardMessage = (messageId: string, updatedText: string) => {
    setWhiteboardMessages((prev) => {
      const next = prev.map((m) => {
        if (m.id === messageId) {
          return {
            ...m,
            text: updatedText,
            isEdited: true,
            editedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
          };
        }
        return m;
      });
      safeSetItem('hw_box_whiteboard_messages', next);
      broadcastRealtimeUpdate('UPDATE_WHITEBOARD_MESSAGES', next);
      const target = next.find((m) => m.id === messageId);
      if (target) {
        saveWhiteboardMessageToFirestore(target);
      }
      return next;
    });
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
    if (newUser.role === 'admin') {
      setActiveTab('admin_dashboard');
    } else {
      setActiveTab('homework');
    }
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
    saveUserProfileToFirestore(newUser).catch((err) =>
      console.warn('saveUserProfileToFirestore background notice:', err)
    );

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
        const index = prev.findIndex(
          (s) => s.id === newUser.id ||
            (newUser.studentIdCode && s.studentIdCode === newUser.studentIdCode)
        );
        let updated: StudentRecord[];
        if (index === -1) {
          updated = [...prev, newRecord];
        } else {
          updated = prev.map((s, idx) => {
            if (idx === index) {
              return {
                ...s,
                name: newUser.name || s.name,
                classRoom: newUser.classRoom || s.classRoom,
                studentNo: newUser.studentNo || s.studentNo,
                avatar: newUser.avatar || s.avatar,
                studentIdCode: newUser.studentIdCode || s.studentIdCode,
              };
            }
            return s;
          });
        }
        safeSetItem('hw_box_student_records', updated);
        broadcastRealtimeUpdate('UPDATE_STUDENT_RECORDS', updated);
        return updated;
      });
      saveStudentRecordToFirestore(newRecord).catch((err) =>
        console.warn('saveStudentRecordToFirestore background notice:', err)
      );
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
      const existingIdx = prev.findIndex((e) => e.id === newEval.id);
      const next = existingIdx >= 0
        ? prev.map((item, idx) => (idx === existingIdx ? newEval : item))
        : [newEval, ...prev];
      safeSetItem('hw_box_evaluations', next);
      broadcastRealtimeUpdate('UPDATE_EVALUATIONS', next);
      return next;
    });
    saveEvaluationToFirestore(newEval);
    handleAwardStars(30, 'ส่งคำตอบมุมสะท้อนความคิด (+30 ดาว)');
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
    deletedLessonIdsRef.current.add(lessonId);
    setLessons((prev) => {
      const next = prev.filter((l) => l.id !== lessonId);
      safeSetItem('hw_box_lessons_single', next);
      safeSetItem('hw_box_lessons', next);
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
    safeSetItem('hw_box_saved_google_user', updatedUser);
    saveUserProfileToFirestore(updatedUser).catch(() => {});
    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.id === updatedUser.id);
      const next = exists
        ? prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        : [updatedUser, ...prev];
      safeSetItem('hw_box_registered_users', next);
      return next;
    });

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
          saveStudentRecordToFirestore(updatedList[index]);
          return updatedList;
        }
        return prev;
      });
    }
  };

  const handleAddHomework = (newHw: Homework) => {
    setHomeworkList((prev) => {
      const next = [newHw, ...prev];
      safeSetItem('hw_box_homeworks', next);
      broadcastRealtimeUpdate('UPDATE_HOMEWORKS', next);
      return next;
    });
    saveHomeworkToFirestore(newHw);
    triggerFestiveConfetti();
  };

  const handleAddUser = (newUser: UserProfile) => {
    setRegisteredUsers((prev) => {
      const next = [newUser, ...prev.filter((u) => u.id !== newUser.id)];
      safeSetItem('hw_box_registered_users', next);
      return next;
    });
    saveUserProfileToFirestore(newUser).catch(() => {});
    if (newUser.role === 'student') {
      const newRec: StudentRecord = {
        id: newUser.id,
        name: newUser.name,
        studentIdCode: newUser.studentIdCode || `STD-${Math.floor(1000 + Math.random() * 9000)}`,
        classRoom: newUser.classRoom || 'ห้อง 1',
        studentNo: newUser.studentNo || '01',
        avatar: newUser.avatar || '🧑‍🎓',
        totalStars: newUser.totalStars || 100,
        unlockedStickers: newUser.unlockedStickers || ['first-step'],
        awardedBadges: [],
        homeworkCount: 0,
        quizScores: {},
      };
      handleAddStudentRecord(newRec);
    }
    triggerFestiveConfetti();
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setRegisteredUsers((prev) => {
      const next = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      safeSetItem('hw_box_registered_users', next);
      return next;
    });
    saveUserProfileToFirestore(updatedUser).catch(() => {});
    if (user.id === updatedUser.id) {
      setUser(updatedUser);
      safeSetItem('hw_box_user', updatedUser);
    }
    if (updatedUser.role === 'student') {
      setStudentRecords((prev) =>
        prev.map((s) => {
          if (s.id === updatedUser.id) {
            const up: StudentRecord = {
              ...s,
              name: updatedUser.name,
              classRoom: updatedUser.classRoom,
              studentNo: updatedUser.studentNo,
              avatar: updatedUser.avatar,
              studentIdCode: updatedUser.studentIdCode || s.studentIdCode,
            };
            saveStudentRecordToFirestore(up);
            return up;
          }
          return s;
        })
      );
    }
  };

  const handleDeleteUser = (userId: string) => {
    setRegisteredUsers((prev) => {
      const next = prev.filter((u) => u.id !== userId);
      safeSetItem('hw_box_registered_users', next);
      return next;
    });
    deleteDocumentFromFirestore(USERS_COLLECTION, userId);
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setRegisteredUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === userId) {
          const up = { ...u, role: newRole };
          saveUserProfileToFirestore(up).catch(() => {});
          return up;
        }
        return u;
      });
      safeSetItem('hw_box_registered_users', next);
      return next;
    });
    if (user.id === userId) {
      setUser((prev) => ({ ...prev, role: newRole }));
    }
  };

  const handleAddExamScore = (newScore: StudentExamScore) => {
    setExamScores((prev) => {
      const next = [newScore, ...prev];
      safeSetItem('hw_box_exam_scores', next);
      broadcastRealtimeUpdate('UPDATE_EXAM_SCORES', next);
      return next;
    });
    saveExamScoreToFirestore(newScore);
  };

  const handleUpdateExamScore = (updatedScore: StudentExamScore) => {
    setExamScores((prev) => {
      const next = prev.map((s) => (s.id === updatedScore.id ? updatedScore : s));
      safeSetItem('hw_box_exam_scores', next);
      broadcastRealtimeUpdate('UPDATE_EXAM_SCORES', next);
      return next;
    });
    saveExamScoreToFirestore(updatedScore);
  };

  const handleDeleteExamScore = (scoreId: string) => {
    setExamScores((prev) => {
      const next = prev.filter((s) => s.id !== scoreId);
      safeSetItem('hw_box_exam_scores', next);
      broadcastRealtimeUpdate('UPDATE_EXAM_SCORES', next);
      return next;
    });
    deleteDocumentFromFirestore(EXAM_SCORES_COLLECTION, scoreId);
  };

  const handleUpdateEvaluation = (updatedEval: TeacherEvaluation) => {
    setEvaluations((prev) => {
      const next = prev.map((e) => (e.id === updatedEval.id ? updatedEval : e));
      safeSetItem('hw_box_evaluations', next);
      broadcastRealtimeUpdate('UPDATE_EVALUATIONS', next);
      return next;
    });
    saveEvaluationToFirestore(updatedEval);
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
  /* ---------- Scoped Data per Teacher & Admin Account & Classrooms (Optimized with useMemo) ---------- */
  const isTeacherRole = user.role === 'teacher' || user.role === 'admin';
  const isAdminRole = user.role === 'admin';

  const visibleAssignmentTasks = useMemo(() => {
    if (isAdminRole) return assignmentTasks;
    return isTeacherRole
      ? assignmentTasks.filter(
          (t) => t.teacherId === user.id || (!t.teacherId && t.authorTeacher === user.name)
        )
      : assignmentTasks;
  }, [isAdminRole, isTeacherRole, assignmentTasks, user.id, user.name]);

  const teacherTaskIds = useMemo(() => {
    return new Set(visibleAssignmentTasks.map((t) => t.id));
  }, [visibleAssignmentTasks]);

  const visibleLessons = useMemo(() => {
    if (isAdminRole) return lessons;
    if (isTeacherRole) {
      return lessons.filter(
        (l) => l.teacherId === user.id || (!l.teacherId && l.authorTeacher === user.name)
      );
    }
    // Pre-group student's exam scores by lessonId for fast O(1) retrieval
    const scoreMap = new Map<string, StudentExamScore[]>();
    for (let i = 0; i < examScores.length; i++) {
      const s = examScores[i];
      if (s.studentId === user.id) {
        let arr = scoreMap.get(s.lessonId);
        if (!arr) {
          arr = [];
          scoreMap.set(s.lessonId, arr);
        }
        arr.push(s);
      }
    }
    return lessons.map((l) => {
      const myAttempts = scoreMap.get(l.id);
      let myBest: number | undefined = undefined;
      let myLast: string | undefined = undefined;
      if (myAttempts && myAttempts.length > 0) {
        myBest = myAttempts.reduce((max, a) => Math.max(max, a.score), 0);
        myLast = myAttempts[0]?.submittedAt;
      }
      return {
        ...l,
        bestScore: myBest,
        lastAttemptAt: myLast,
      };
    });
  }, [isAdminRole, isTeacherRole, lessons, examScores, user.id, user.name]);

  const teacherLessonIds = useMemo(() => {
    return new Set(visibleLessons.map((l) => l.id));
  }, [visibleLessons]);

  const visibleReflectionTopics = useMemo(() => {
    if (isAdminRole) return reflectionTopics;
    return isTeacherRole
      ? reflectionTopics.filter(
          (t) => t.teacherId === user.id || (!t.teacherId && t.authorTeacher === user.name)
        )
      : reflectionTopics;
  }, [isAdminRole, isTeacherRole, reflectionTopics, user.id, user.name]);

  const teacherTopicIds = useMemo(() => {
    return new Set(visibleReflectionTopics.map((t) => t.id));
  }, [visibleReflectionTopics]);

  const teacherAddedStudents = useMemo(() => {
    return isTeacherRole
      ? studentRecords.filter((s) => s.teacherId === user.id)
      : [];
  }, [isTeacherRole, studentRecords, user.id]);

  const teacherHasAddedContent = useMemo(() => {
    return (
      visibleAssignmentTasks.length > 0 ||
      visibleLessons.length > 0 ||
      visibleReflectionTopics.length > 0 ||
      teacherAddedStudents.length > 0 ||
      (Array.isArray(user.teachingClasses) &&
        user.teachingClasses.some((c) => c && c.trim() !== '' && c.trim() !== 'ทุกห้อง'))
    );
  }, [
    visibleAssignmentTasks.length,
    visibleLessons.length,
    visibleReflectionTopics.length,
    teacherAddedStudents.length,
    user.teachingClasses,
  ]);

  const teacherClassrooms = useMemo(() => {
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
  }, [
    isTeacherRole,
    teacherHasAddedContent,
    user.teachingClasses,
    visibleAssignmentTasks,
    visibleLessons,
    visibleReflectionTopics,
    teacherAddedStudents,
  ]);

  const matchesTeacherClassroom = useCallback(
    (studentClass?: string) => {
      if (!studentClass || teacherClassrooms.length === 0) return false;
      return teacherClassrooms.some((room) => isClassMatching(studentClass, room));
    },
    [teacherClassrooms]
  );

  const visibleHomeworkList = useMemo(() => {
    if (isAdminRole) return homeworkList;
    return isTeacherRole
      ? homeworkList.filter(
          (h) =>
            h.teacherId === user.id ||
            (h.taskId && teacherTaskIds.has(h.taskId)) ||
            matchesTeacherClassroom(h.studentClass)
        )
      : homeworkList.filter((h) => h.studentId === user.id);
  }, [isAdminRole, isTeacherRole, homeworkList, user.id, teacherTaskIds, matchesTeacherClassroom]);

  const visibleExamScores = useMemo(() => {
    if (isAdminRole) return examScores;
    return isTeacherRole
      ? examScores.filter(
          (s) =>
            s.teacherId === user.id ||
            teacherLessonIds.has(s.lessonId) ||
            matchesTeacherClassroom(s.studentClass)
        )
      : examScores.filter((s) => s.studentId === user.id);
  }, [isAdminRole, isTeacherRole, examScores, user.id, teacherLessonIds, matchesTeacherClassroom]);

  const visibleEvaluations = useMemo(() => {
    if (isAdminRole) return evaluations;
    return isTeacherRole
      ? evaluations.filter(
          (e) =>
            e.teacherId === user.id ||
            (e.topicId && teacherTopicIds.has(e.topicId))
        )
      : evaluations.filter(
          (e) =>
            e.studentId === user.id ||
            (e.studentClass && isClassMatching(user.classRoom, e.studentClass)) ||
            (!e.studentClass && (e.topicId ? teacherTopicIds.has(e.topicId) : true))
        );
  }, [isAdminRole, isTeacherRole, evaluations, user.id, user.classRoom, teacherTopicIds]);

  const teacherInteractedStudentIds = useMemo(() => {
    const set = new Set<string>();
    visibleHomeworkList.forEach((h) => set.add(h.studentId));
    visibleExamScores.forEach((s) => set.add(s.studentId));
    visibleEvaluations.forEach((e) => set.add(e.studentId));
    return set;
  }, [visibleHomeworkList, visibleExamScores, visibleEvaluations]);

  const visibleStudentRecords = useMemo(() => {
    const baseList = isAdminRole
      ? studentRecords
      : isTeacherRole
      ? studentRecords.filter(
          (s) =>
            s.teacherId === user.id ||
            teacherInteractedStudentIds.has(s.id) ||
            matchesTeacherClassroom(s.classRoom)
        )
      : studentRecords;

    const map = new Map<string, StudentRecord>();
    baseList.forEach((s) => map.set(s.id, { ...s }));

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

    // Pre-group by studentId and studentName for fast O(1) aggregations
    const hwByStudent = new Map<string, Homework[]>();
    for (let i = 0; i < visibleHomeworkList.length; i++) {
      const h = visibleHomeworkList[i];
      const keyId = h.studentId;
      const keyName = h.studentName?.toLowerCase();
      if (keyId) {
        let arr = hwByStudent.get(keyId);
        if (!arr) { arr = []; hwByStudent.set(keyId, arr); }
        arr.push(h);
      }
      if (keyName && keyName !== keyId) {
        let arr = hwByStudent.get(keyName);
        if (!arr) { arr = []; hwByStudent.set(keyName, arr); }
        arr.push(h);
      }
    }

    const examByStudent = new Map<string, StudentExamScore[]>();
    for (let i = 0; i < visibleExamScores.length; i++) {
      const e = visibleExamScores[i];
      const keyId = e.studentId;
      const keyName = e.studentName?.toLowerCase();
      if (keyId) {
        let arr = examByStudent.get(keyId);
        if (!arr) { arr = []; examByStudent.set(keyId, arr); }
        arr.push(e);
      }
      if (keyName && keyName !== keyId) {
        let arr = examByStudent.get(keyName);
        if (!arr) { arr = []; examByStudent.set(keyName, arr); }
        arr.push(e);
      }
    }

    const evalByStudent = new Map<string, TeacherEvaluation[]>();
    for (let i = 0; i < visibleEvaluations.length; i++) {
      const ev = visibleEvaluations[i];
      const keyId = ev.studentId;
      const keyName = ev.studentName?.toLowerCase();
      if (keyId) {
        let arr = evalByStudent.get(keyId);
        if (!arr) { arr = []; evalByStudent.set(keyId, arr); }
        arr.push(ev);
      }
      if (keyName && keyName !== keyId) {
        let arr = evalByStudent.get(keyName);
        if (!arr) { arr = []; evalByStudent.set(keyName, arr); }
        arr.push(ev);
      }
    }

    return Array.from(map.values()).map((student) => {
      const nameKey = student.name.toLowerCase();
      const myHws = hwByStudent.get(student.id) || (nameKey ? hwByStudent.get(nameKey) : undefined) || [];
      const myExams = examByStudent.get(student.id) || (nameKey ? examByStudent.get(nameKey) : undefined) || [];
      const myEvals = evalByStudent.get(student.id) || (nameKey ? evalByStudent.get(nameKey) : undefined) || [];

      const computedQuizScores: Record<string, number> = { ...(student.quizScores || {}) };
      for (let i = 0; i < myExams.length; i++) {
        const ex = myExams[i];
        computedQuizScores[ex.lessonId] = Math.max(computedQuizScores[ex.lessonId] ?? 0, ex.score);
      }

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
  }, [
    isTeacherRole,
    studentRecords,
    user.id,
    teacherInteractedStudentIds,
    matchesTeacherClassroom,
    teacherHasAddedContent,
    teacherClassrooms,
    visibleHomeworkList,
    visibleExamScores,
    visibleEvaluations,
  ]);

  const hasActiveReflectionLive = useMemo(() => {
    if (user.role === 'student') {
      return whiteboardSessions.some(
        (s) => s.status === 'active' && isClassMatching(user.classRoom, s.targetClass)
      );
    } else if (user.role === 'teacher') {
      return whiteboardSessions.some(
        (s) => s.status === 'active' && s.teacherId === user.id
      );
    }
    return false;
  }, [user.role, user.classRoom, user.id, whiteboardSessions]);

  const adminSubTab = useMemo<
    | 'dashboard'
    | 'profile'
    | 'homework'
    | 'users'
    | 'tasks'
    | 'quizzes'
    | 'exam_scores'
    | 'scorebook'
    | 'gradebook'
    | 'reflections'
    | 'reports'
    | 'presets'
  >(() => {
    switch (activeTab) {
      case 'admin_dashboard':
      case 'dashboard':
      case 'admin':
        return 'dashboard';
      case 'admin_profile':
        return 'profile';
      case 'admin_homework':
        return 'homework';
      case 'admin_users':
        return 'users';
      case 'admin_tasks':
        return 'tasks';
      case 'admin_quizzes':
        return 'quizzes';
      case 'admin_exam_scores':
        return 'exam_scores';
      case 'admin_scorebook':
        return 'scorebook';
      case 'admin_gradebook':
        return 'gradebook';
      case 'admin_reflections':
        return 'reflections';
      case 'admin_reports':
        return 'reports';
      case 'admin_presets':
        return 'presets';
      default:
        return 'dashboard';
    }
  }, [activeTab]);

  /* ---------- Render ---------- */
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5] text-stone-600">
        กำลังตรวจสอบการเข้าสู่ระบบ...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={handleLogin}
        studentRecords={studentRecords}
        registeredUsers={registeredUsers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] notebook-grid p-3 sm:p-5 md:p-6 flex flex-col justify-between font-['JaoTomato_Thin','JaoTomato','เจ้ามะเขือเทศ','Mali',sans-serif]">
      <div className="max-w-6xl w-full mx-auto">
        <Header
          user={user}
          onLogout={handleLogout}
          onOpenGoogleSheets={user.role === 'teacher' ? () => setIsGoogleSheetsModalOpen(true) : undefined}
          onOpenProfileModal={() => {
            if (user.role === 'admin') {
              setActiveTab('admin_profile');
            } else {
              setIsProfileModalOpen(true);
            }
          }}
          onOpenAdminProfile={() => setActiveTab('admin_profile')}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
        />

        <NavigationTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={user.role}
          pendingHomeworkCount={visibleHomeworkList.filter((h) => h.status === 'pending').length}
          hasActiveReflectionLive={hasActiveReflectionLive}
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
              whiteboardSessions={whiteboardSessions}
              whiteboardMessages={whiteboardMessages}
              onStartWhiteboardSession={handleStartWhiteboardSession}
              onEndWhiteboardSession={handleEndWhiteboardSession}
              onDeleteWhiteboardSession={handleDeleteWhiteboardSession}
              onClearAllWhiteboardSessions={handleClearEndedWhiteboardSessions}
              onSendWhiteboardMessage={handleSendWhiteboardMessage}
              onDeleteWhiteboardMessage={handleDeleteWhiteboardMessage}
              onUpdateWhiteboardSession={handleUpdateWhiteboardSession}
              onEditWhiteboardMessage={handleEditWhiteboardMessage}
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

          {user.role === 'admin' && (
            <AdminView
              currentUser={user}
              currentSubTab={adminSubTab}
              onSelectSubTab={(tab) => setActiveTab(('admin_' + tab) as ActiveTab)}
              studentRecords={studentRecords}
              registeredUsers={registeredUsers}
              whiteboardSessions={whiteboardSessions}
              whiteboardMessages={whiteboardMessages}
              assignmentTasks={assignmentTasks}
              homeworkList={homeworkList}
              quizLessons={lessons}
              examScores={examScores}
              evaluations={evaluations}
              reflectionTopics={reflectionTopics}
              onUpdateUserProfile={handleUpdateUserProfile}
              onAddHomework={handleAddHomework}
              onUpdateHomework={handleUpdateHomework}
              onDeleteHomework={handleDeleteHomework}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onUpdateUserRole={handleUpdateUserRole}
              onAddTask={handleCreateAssignmentTask}
              onUpdateTask={handleUpdateAssignmentTask}
              onDeleteTask={handleDeleteAssignmentTask}
              onAddLesson={handleCreateLesson}
              onUpdateLesson={handleUpdateLesson}
              onDeleteLesson={handleDeleteLesson}
              onAddExamScore={handleAddExamScore}
              onUpdateExamScore={handleUpdateExamScore}
              onDeleteExamScore={handleDeleteExamScore}
              onAddStudentRecord={handleAddStudentRecord}
              onUpdateStudentRecord={handleUpdateStudentRecord}
              onDeleteStudentRecord={handleDeleteStudentRecord}
              onAddEvaluation={handleSubmitEvaluation}
              onUpdateEvaluation={handleUpdateEvaluation}
              onDeleteEvaluation={handleDeleteEvaluation}
              onAddReflectionTopic={handleCreateReflectionTopic}
              onUpdateReflectionTopic={handleUpdateReflectionTopic}
              onDeleteReflectionTopic={handleDeleteReflectionTopic}
              onAwardStars={handleAwardStars}
              onDeleteWhiteboardSession={handleDeleteWhiteboardSession}
              onEndWhiteboardSession={handleEndWhiteboardSession}
              onSwitchUser={(targetUser) => {
                setUser(targetUser);
                safeSetItem('hw_box_user', targetUser);
                triggerFestiveConfetti();
              }}
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

      <AdminProfileModal
        isOpen={isAdminProfileModalOpen}
        onClose={() => setIsAdminProfileModalOpen(false)}
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
