import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  browserLocalPersistence,
  setPersistence,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../firebase-applet-config.json';

/* ------------------------------------------------------------------
   1) อ่านค่า config จาก Environment Variables ของ Vite (พร้อม fallback)
------------------------------------------------------------------ */
const env = import.meta.env;

const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MSG_SENDER_ID || appletConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || appletConfig.appId,
};

export const firestoreDatabaseId: string | undefined =
  env.VITE_FIREBASE_DATABASE_ID || (appletConfig as any).firestoreDatabaseId;

/* ------------------------------------------------------------------
   2) เตือนตั้งแต่ตอน dev ถ้าค่าขาด จะได้ไม่ไปงงตอน login ไม่ติด
------------------------------------------------------------------ */
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(
    '[firebase] ค่า config ขาด:',
    missingKeys.join(', '),
    '\nตรวจสอบไฟล์ .env (ตอน dev) และ Environment Variables บน Vercel (ตอน deploy)'
  );
}

/* ------------------------------------------------------------------
   3) init แบบกัน HMR สร้าง app ซ้ำ + เชื่อมต่อ Firestore Database ID จริง
------------------------------------------------------------------ */
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firestoreDatabaseId
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    return true;
  }
}
testConnection();

/* ------------------------------------------------------------------
   4) Google provider — ไม่ล็อกโดเมน ใครมีบัญชี Google ก็เข้าได้
------------------------------------------------------------------ */
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('email');
googleProvider.addScope('profile');

/* ------------------------------------------------------------------
   5) จำ session ไว้ใน localStorage — ปิดเบราว์เซอร์แล้วยัง login อยู่
------------------------------------------------------------------ */
setPersistence(auth, browserLocalPersistence).catch((err) =>
  console.warn('[firebase] ตั้งค่า persistence ไม่สำเร็จ:', err)
);

/* ------------------------------------------------------------------
   6) re-export ให้ไฟล์อื่นเรียกจากที่เดียว
------------------------------------------------------------------ */
export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
};
export type { FirebaseUser };

export default app;
