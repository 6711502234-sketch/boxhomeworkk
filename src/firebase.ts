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
import { getFirestore } from 'firebase/firestore';

/* ------------------------------------------------------------------
   1) อ่านค่า config จาก Environment Variables ของ Vite
      ตัวแปรทุกตัวต้องขึ้นต้นด้วย VITE_ ถึงจะถูก inject เข้า bundle
------------------------------------------------------------------ */
const env = import.meta.env;

const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MSG_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

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
   3) init แบบกัน HMR สร้าง app ซ้ำ
------------------------------------------------------------------ */
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

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
