import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Homework, AssignmentTask, TeacherEvaluation, TeacherReflectionTopic } from '../types';

// Collection references
export const USERS_COLLECTION = 'users';
export const HOMEWORKS_COLLECTION = 'homeworks';
export const TASKS_COLLECTION = 'assignmentTasks';
export const EVALUATIONS_COLLECTION = 'evaluations';
export const REFLECTIONS_COLLECTION = 'reflectionTopics';

/**
 * Save or update user profile in Firestore
 */
export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userDocRef, {
      ...user,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('User synced to Firestore:', user.id);
  } catch (error) {
    console.warn('Could not sync user to Firestore:', error);
  }
}

/**
 * Save assignment task to Firestore
 */
export async function saveTaskToFirestore(task: AssignmentTask): Promise<void> {
  try {
    const taskDocRef = doc(db, TASKS_COLLECTION, task.id);
    await setDoc(taskDocRef, task, { merge: true });
    console.log('Task synced to Firestore:', task.id);
  } catch (error) {
    console.warn('Could not sync task to Firestore:', error);
  }
}

/**
 * Save homework submission to Firestore
 */
export async function saveHomeworkToFirestore(hw: Homework): Promise<void> {
  try {
    const hwDocRef = doc(db, HOMEWORKS_COLLECTION, hw.id);
    await setDoc(hwDocRef, hw, { merge: true });
    console.log('Homework synced to Firestore:', hw.id);
  } catch (error) {
    console.warn('Could not sync homework to Firestore:', error);
  }
}

/**
 * Save evaluation to Firestore
 */
export async function saveEvaluationToFirestore(evaluation: TeacherEvaluation): Promise<void> {
  try {
    const evalDocRef = doc(db, EVALUATIONS_COLLECTION, evaluation.id);
    await setDoc(evalDocRef, evaluation, { merge: true });
    console.log('Evaluation synced to Firestore:', evaluation.id);
  } catch (error) {
    console.warn('Could not sync evaluation to Firestore:', error);
  }
}

/**
 * Real-time listener for tasks
 */
export function subscribeToTasksFromFirestore(onUpdate: (tasks: AssignmentTask[]) => void) {
  try {
    const q = query(collection(db, TASKS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const tasks: AssignmentTask[] = [];
      snapshot.forEach((docSnap) => {
        tasks.push(docSnap.data() as AssignmentTask);
      });
      if (tasks.length > 0) {
        onUpdate(tasks);
      }
    }, (err) => {
      console.warn('Firestore tasks subscription info:', err.message);
    });
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
    return onSnapshot(q, (snapshot) => {
      const homeworks: Homework[] = [];
      snapshot.forEach((docSnap) => {
        homeworks.push(docSnap.data() as Homework);
      });
      if (homeworks.length > 0) {
        onUpdate(homeworks);
      }
    }, (err) => {
      console.warn('Firestore homeworks subscription info:', err.message);
    });
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
    return onSnapshot(q, (snapshot) => {
      const evals: TeacherEvaluation[] = [];
      snapshot.forEach((docSnap) => {
        evals.push(docSnap.data() as TeacherEvaluation);
      });
      if (evals.length > 0) {
        onUpdate(evals);
      }
    }, (err) => {
      console.warn('Firestore evaluations subscription info:', err.message);
    });
  } catch (e) {
    console.warn('Firestore subscribe error:', e);
    return () => {};
  }
}
