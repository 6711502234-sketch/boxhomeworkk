import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  UserProfile,
  Homework,
  AssignmentTask,
  TeacherEvaluation,
  TeacherReflectionTopic,
  StudentRecord,
  StudentExamScore,
  QuizLesson,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (
    error instanceof Error &&
    error.message.toLowerCase().includes('missing or insufficient permissions')
  ) {
    throw new Error(JSON.stringify(errInfo));
  }
}

/**
 * Recursively remove undefined fields before writing to Firestore
 */
export function sanitizeForFirestore<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => (item === undefined ? null : sanitizeForFirestore(item))) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const cleaned: Record<string, any> = {};
    Object.entries(value as Record<string, any>).forEach(([k, v]) => {
      if (v !== undefined) {
        cleaned[k] = sanitizeForFirestore(v);
      }
    });
    return cleaned as T;
  }
  return value;
}

// Collection references
export const USERS_COLLECTION = 'users';
export const HOMEWORKS_COLLECTION = 'homeworks';
export const TASKS_COLLECTION = 'assignmentTasks';
export const EVALUATIONS_COLLECTION = 'evaluations';
export const REFLECTIONS_COLLECTION = 'reflectionTopics';
export const STUDENT_RECORDS_COLLECTION = 'studentRecords';
export const EXAM_SCORES_COLLECTION = 'examScores';
export const LESSONS_COLLECTION = 'quizLessons';

/**
 * Delete a document from Firestore collection
 */
export async function deleteDocumentFromFirestore(collectionName: string, docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}

/**
 * Save or update student record in Firestore
 */
export async function saveStudentRecordToFirestore(record: StudentRecord): Promise<void> {
  try {
    const docRef = doc(db, STUDENT_RECORDS_COLLECTION, record.id);
    await setDoc(docRef, sanitizeForFirestore(record), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STUDENT_RECORDS_COLLECTION}/${record.id}`);
  }
}

/**
 * Real-time listener for student records
 */
export function subscribeToStudentRecordsFromFirestore(onUpdate: (records: StudentRecord[]) => void) {
  try {
    const q = query(collection(db, STUDENT_RECORDS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const records: StudentRecord[] = [];
        snapshot.forEach((docSnap) => {
          records.push(docSnap.data() as StudentRecord);
        });
        const hasRemovals = snapshot.docChanges().some((c) => c.type === 'removed');
        if (records.length > 0 || hasRemovals) {
          onUpdate(records);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, STUDENT_RECORDS_COLLECTION);
      }
    );
  } catch (e) {
    console.warn('Firestore subscribe error:', e);
    return () => {};
  }
}

/**
 * Save or update exam score in Firestore
 */
export async function saveExamScoreToFirestore(score: StudentExamScore): Promise<void> {
  try {
    const docRef = doc(db, EXAM_SCORES_COLLECTION, score.id);
    await setDoc(docRef, sanitizeForFirestore(score), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${EXAM_SCORES_COLLECTION}/${score.id}`);
  }
}

/**
 * Real-time listener for exam scores
 */
export function subscribeToExamScoresFromFirestore(onUpdate: (scores: StudentExamScore[]) => void) {
  try {
    const q = query(collection(db, EXAM_SCORES_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const scores: StudentExamScore[] = [];
        snapshot.forEach((docSnap) => {
          scores.push(docSnap.data() as StudentExamScore);
        });
        const hasRemovals = snapshot.docChanges().some((c) => c.type === 'removed');
        if (scores.length > 0 || hasRemovals) {
          onUpdate(scores);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, EXAM_SCORES_COLLECTION);
      }
    );
  } catch (e) {
    console.warn('Firestore subscribe error:', e);
    return () => {};
  }
}

/**
 * Save or update quiz lesson in Firestore
 */
export async function saveLessonToFirestore(lesson: QuizLesson): Promise<void> {
  try {
    const docRef = doc(db, LESSONS_COLLECTION, lesson.id);
    await setDoc(docRef, sanitizeForFirestore(lesson), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${LESSONS_COLLECTION}/${lesson.id}`);
  }
}

/**
 * Real-time listener for quiz lessons
 */
export function subscribeToLessonsFromFirestore(onUpdate: (lessons: QuizLesson[]) => void) {
  try {
    const q = query(collection(db, LESSONS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const lessons: QuizLesson[] = [];
        snapshot.forEach((docSnap) => {
          lessons.push(docSnap.data() as QuizLesson);
        });
        const hasRemovals = snapshot.docChanges().some((c) => c.type === 'removed');
        if (lessons.length > 0 || hasRemovals) {
          onUpdate(lessons);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, LESSONS_COLLECTION);
      }
    );
  } catch (e) {
    console.warn('Firestore subscribe error:', e);
    return () => {};
  }
}

/**
 * Save or update user profile in Firestore
 */
export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(
      userDocRef,
      sanitizeForFirestore({
        ...user,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${user.id}`);
  }
}

/**
 * Save assignment task to Firestore
 */
export async function saveTaskToFirestore(task: AssignmentTask): Promise<void> {
  try {
    const taskDocRef = doc(db, TASKS_COLLECTION, task.id);
    await setDoc(taskDocRef, sanitizeForFirestore(task), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${TASKS_COLLECTION}/${task.id}`);
  }
}

/**
 * Save homework submission to Firestore
 */
export async function saveHomeworkToFirestore(hw: Homework): Promise<void> {
  try {
    const hwDocRef = doc(db, HOMEWORKS_COLLECTION, hw.id);
    await setDoc(hwDocRef, sanitizeForFirestore(hw), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${HOMEWORKS_COLLECTION}/${hw.id}`);
  }
}

/**
 * Save evaluation to Firestore
 */
export async function saveEvaluationToFirestore(evaluation: TeacherEvaluation): Promise<void> {
  try {
    const evalDocRef = doc(db, EVALUATIONS_COLLECTION, evaluation.id);
    await setDoc(evalDocRef, sanitizeForFirestore(evaluation), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${EVALUATIONS_COLLECTION}/${evaluation.id}`);
  }
}

/**
 * Real-time listener for tasks
 */
export function subscribeToTasksFromFirestore(onUpdate: (tasks: AssignmentTask[]) => void) {
  try {
    const q = query(collection(db, TASKS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const tasks: AssignmentTask[] = [];
        snapshot.forEach((docSnap) => {
          tasks.push(docSnap.data() as AssignmentTask);
        });
        const hasRemovals = snapshot.docChanges().some((c) => c.type === 'removed');
        if (tasks.length > 0 || hasRemovals) {
          onUpdate(tasks);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, TASKS_COLLECTION);
      }
    );
  } catch (e) {
    console.warn('Firestore subscribe error:', e);
    return () => {};
  }
}

/**
 * Real-time listener for homeworks
 */
export function subscribeToHomeworksFromFirestore(onUpdate: (hws: Homework[]) => void) {
  try {
    const q = query(collection(db, HOMEWORKS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const homeworks: Homework[] = [];
        snapshot.forEach((docSnap) => {
          homeworks.push(docSnap.data() as Homework);
        });
        const hasRemovals = snapshot.docChanges().some((c) => c.type === 'removed');
        if (homeworks.length > 0 || hasRemovals) {
          onUpdate(homeworks);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, HOMEWORKS_COLLECTION);
      }
    );
  } catch (e) {
    console.warn('Firestore subscribe error:', e);
    return () => {};
  }
}

/**
 * Real-time listener for evaluations
 */
export function subscribeToEvaluationsFromFirestore(onUpdate: (evals: TeacherEvaluation[]) => void) {
  try {
    const q = query(collection(db, EVALUATIONS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const evals: TeacherEvaluation[] = [];
        snapshot.forEach((docSnap) => {
          evals.push(docSnap.data() as TeacherEvaluation);
        });
        const hasRemovals = snapshot.docChanges().some((c) => c.type === 'removed');
        if (evals.length > 0 || hasRemovals) {
          onUpdate(evals);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, EVALUATIONS_COLLECTION);
      }
    );
  } catch (e) {
    console.warn('Firestore subscribe error:', e);
    return () => {};
  }
}

/**
 * Save reflection topic to Firestore
 */
export async function saveReflectionToFirestore(topic: TeacherReflectionTopic): Promise<void> {
  try {
    const topicDocRef = doc(db, REFLECTIONS_COLLECTION, topic.id);
    await setDoc(topicDocRef, sanitizeForFirestore(topic), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${REFLECTIONS_COLLECTION}/${topic.id}`);
  }
}

/**
 * Real-time listener for reflection topics
 */
export function subscribeToReflectionsFromFirestore(onUpdate: (topics: TeacherReflectionTopic[]) => void) {
  try {
    const q = query(collection(db, REFLECTIONS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const topics: TeacherReflectionTopic[] = [];
        snapshot.forEach((docSnap) => {
          topics.push(docSnap.data() as TeacherReflectionTopic);
        });
        const hasRemovals = snapshot.docChanges().some((c) => c.type === 'removed');
        if (topics.length > 0 || hasRemovals) {
          onUpdate(topics);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, REFLECTIONS_COLLECTION);
      }
    );
  } catch (e) {
    console.warn('Firestore subscribe error:', e);
    return () => {};
  }
}

// Cross-tab real-time broadcast channel
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('taskhub_realtime_channel')
  : null;

export function broadcastRealtimeUpdate(type: string, payload: any) {
  try {
    if (syncChannel) {
      syncChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
  } catch (e) {
    console.error('BroadcastChannel error:', e);
  }
}

export function subscribeToBroadcastRealtime(onMessage: (type: string, payload: any) => void) {
  if (!syncChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      onMessage(event.data.type, event.data.payload);
    }
  };
  syncChannel.addEventListener('message', handler);
  return () => {
    syncChannel.removeEventListener('message', handler);
  };
}
