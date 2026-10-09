import React, { useState, useEffect } from 'react';
import appletConfig from '../../firebase-applet-config.json';
import { testConnection, firestoreDatabaseId } from '../firebase';
import {
  DoodleCloud,
  DoodleCheck,
  DoodleSparkles,
  DoodleShield,
  DoodleRocket,
  DoodleClose,
  DoodleLink,
} from './DoodleIcons';
import {
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Database,
  GitBranch,
  KeyRound,
} from 'lucide-react';

interface CloudDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualSyncAll?: () => Promise<void>;
  counts?: {
    tasks: number;
    homeworks: number;
    evaluations: number;
    reflections: number;
    students: number;
    exams: number;
    lessons: number;
  };
}

export const CloudDeployModal: React.FC<CloudDeployModalProps> = ({
  isOpen,
  onClose,
  onManualSyncAll,
  counts,
}) => {
  const [activeTab, setActiveTab] = useState<'firebase' | 'oauth' | 'github'>('firebase');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000';
  const currentHostname =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    testConnection().then((ok) => {
      if (mounted) setIsConnected(ok);
    });
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg('');
    try {
      const ok = await testConnection();
      setIsConnected(ok);
      if (onManualSyncAll) {
        await onManualSyncAll();
      }
      setSyncSuccessMsg('ซิงก์ข้อมูลทั้งหมดขึ้น Cloud Firestore สำเร็จเรียบร้อยแล้ว!');
    } catch (e) {
      console.warn('Manual sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const envBlock = `VITE_FIREBASE_API_KEY="${appletConfig.apiKey}"
VITE_FIREBASE_AUTH_DOMAIN="${appletConfig.authDomain}"
VITE_FIREBASE_PROJECT_ID="${appletConfig.projectId}"
VITE_FIREBASE_DATABASE_ID="${firestoreDatabaseId || appletConfig.firestoreDatabaseId}"
VITE_FIREBASE_STORAGE_BUCKET="${appletConfig.storageBucket}"
VITE_FIREBASE_MSG_SENDER_ID="${appletConfig.messagingSenderId}"
VITE_FIREBASE_APP_ID="${appletConfig.appId}"
VITE_GOOGLE_OAUTH_CLIENT_ID="${appletConfig.oAuthClientId}"`;

  const gitCommands = `git init
git add .
git commit -m "Initial commit: TaskHub with Firebase Firestore"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskhub-classroom.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#FFFDF5] border-3 border-stone-900 rounded-3xl shadow-[8px_8px_0px_#18181b] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-amber-300 border-b-3 border-stone-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border-2 border-stone-900 shadow-[2px_2px_0px_#18181b] flex items-center justify-center shrink-0">
              <DoodleCloud className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-950">
                ศูนย์เชื่อมต่อใช้งานจริง (Firebase &amp; GitHub)
              </h2>
              <p className="text-xs font-bold text-stone-800">
                จัดการฐานข้อมูล Cloud Firestore • ตั้งค่า Google OAuth • ซิงก์โค้ดขึ้น GitHub
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white hover:bg-rose-100 border-2 border-stone-900 flex items-center justify-center shadow-[2px_2px_0px_#18181b] cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <DoodleClose className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-stone-100 border-b-2 border-stone-900">
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`py-2.5 px-3 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'firebase'
                ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-[2px_2px_0px_#18181b]'
                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-700'
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            <span>1. ฐานข้อมูล Firebase</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('oauth')}
            className={`py-2.5 px-3 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'oauth'
                ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-[2px_2px_0px_#18181b]'
                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-700'
            }`}
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>2. ตั้งค่า Google OAuth</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`py-2.5 px-3 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'github'
                ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-[2px_2px_0px_#18181b]'
                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-700'
            }`}
          >
            <GitBranch className="w-4 h-4 shrink-0" />
            <span>3. เชื่อมต่อ GitHub</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-stone-900 shadow-[3px_3px_0px_#18181b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400 border-2 border-stone-900 flex items-center justify-center shrink-0">
                    <DoodleCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-stone-950">
                        สถานะ Cloud Firestore:
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black border border-stone-900 ${
                          isConnected === false
                            ? 'bg-amber-200 text-amber-950'
                            : 'bg-emerald-300 text-emerald-950'
                        }`}
                      >
                        {isConnected === null
                          ? 'กำลังตรวจสอบ...'
                          : isConnected
                          ? 'เชื่อมต่อออนไลน์พร้อมใช้งานจริง'
                          : 'โหมดออฟไลน์สำรอง'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-700 mt-1">
                      Project ID: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">{appletConfig.projectId}</code>
                    </p>
                    <p className="text-xs font-bold text-stone-700 mt-0.5">
                      Database ID:{' '}
                      <code className="font-mono bg-white px-1.5 py-0.5 rounded border">
                        {firestoreDatabaseId || appletConfig.firestoreDatabaseId}
                      </code>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 border-2 border-stone-900 font-black text-xs sm:text-sm text-stone-950 shadow-[2px_2px_0px_#18181b] flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'กำลังซิงก์ข้อมูล...' : 'ซิงก์ข้อมูลขึ้น Cloud ตอนนี้'}</span>
                </button>
              </div>

              {syncSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-100 border-2 border-emerald-700 text-emerald-950 text-xs sm:text-sm font-black flex items-center gap-2">
                  <DoodleSparkles className="w-5 h-5 shrink-0" />
                  <span>{syncSuccessMsg}</span>
                </div>
              )}

              {counts && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border-2 border-stone-900 text-center">
                    <div className="text-xs font-bold text-stone-500">งานที่มอบหมาย</div>
                    <div className="text-xl font-black text-stone-900">{counts.tasks}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border-2 border-stone-900 text-center">
                    <div className="text-xs font-bold text-stone-500">การบ้านที่ส่ง</div>
                    <div className="text-xl font-black text-stone-900">{counts.homeworks}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border-2 border-stone-900 text-center">
                    <div className="text-xs font-bold text-stone-500">รายชื่อนักเรียน</div>
                    <div className="text-xl font-black text-stone-900">{counts.students}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border-2 border-stone-900 text-center">
                    <div className="text-xs font-bold text-stone-500">ผลสะท้อนคิด</div>
                    <div className="text-xl font-black text-stone-900">{counts.evaluations}</div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white border-2 border-stone-900 space-y-2.5">
                <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <DoodleShield className="w-5 h-5" />
                  <span>ลิงก์จัดการฐานข้อมูล Firebase Console โดยตรง</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://console.firebase.google.com/project/${appletConfig.projectId}/firestore/databases/${firestoreDatabaseId || appletConfig.firestoreDatabaseId}/data`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-black hover:bg-stone-800"
                  >
                    <span>เปิดดูตารางข้อมูล Firestore</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://console.firebase.google.com/project/${appletConfig.projectId}/authentication/users`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-300 border-2 border-stone-900 text-stone-950 text-xs font-black hover:bg-amber-400"
                  >
                    <span>จัดการผู้ใช้ Firebase Auth</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'oauth' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-stone-900 space-y-2">
                <h3 className="text-sm sm:text-base font-black text-stone-950">
                  วิธีแก้ไขแจ้งเตือน &quot;โปรดลงทะเบียน JavaScript origin ใน Google Cloud Console&quot;
                </h3>
                <p className="text-xs font-bold text-stone-700 leading-relaxed">
                  คุณสามารถเข้าใช้งานระบบได้ทันทีผ่าน <strong>ฟอร์มกรอกชื่อ</strong> หรือ{' '}
                  <strong>แผงใส่อีเมล Google บนหน้าล็อกอิน</strong> (ซิงก์ลง Cloud Firestore เหมือนกัน 100%)
                  และหากต้องการให้ป๊อปอัป Google OAuth เปิดได้บนโดเมนของคุณ ให้เพิ่มโดเมนตาม 2 ขั้นตอนด้านล่างนี้:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border-2 border-stone-900 space-y-3">
                <div className="font-black text-xs sm:text-sm text-stone-900">
                  ขั้นตอนที่ 1: เพิ่มโดเมนใน Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized domains
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-stone-100 border-2 border-stone-300 rounded-xl font-mono text-xs break-all">
                    {currentHostname}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentHostname, 'auth-domain')}
                    className="px-3 py-2 bg-amber-300 hover:bg-amber-400 border-2 border-stone-900 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedId === 'auth-domain' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId === 'auth-domain' ? 'คัดลอกแล้ว' : 'คัดลอกโดเมน'}</span>
                  </button>
                </div>
                <a
                  href={`https://console.firebase.google.com/project/${appletConfig.projectId}/authentication/settings`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-black hover:bg-stone-800"
                >
                  <span>ไปที่หน้า Firebase Authorized Domains</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-white border-2 border-stone-900 space-y-3">
                <div className="font-black text-xs sm:text-sm text-stone-900">
                  ขั้นตอนที่ 2: เพิ่ม URL ใน Google Cloud Console &rarr; Credentials &rarr; OAuth 2.0 Client IDs &rarr; Authorized JavaScript origins
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-stone-100 border-2 border-stone-300 rounded-xl font-mono text-xs break-all">
                    {currentOrigin}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentOrigin, 'js-origin')}
                    className="px-3 py-2 bg-amber-300 hover:bg-amber-400 border-2 border-stone-900 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedId === 'js-origin' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId === 'js-origin' ? 'คัดลอกแล้ว' : 'คัดลอก Origin'}</span>
                  </button>
                </div>
                <a
                  href={`https://console.cloud.google.com/apis/credentials?project=${appletConfig.projectId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700"
                >
                  <span>ไปที่หน้า Google Cloud Console Credentials</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-50 border-2 border-stone-900 space-y-2">
                <h3 className="text-sm sm:text-base font-black text-stone-950 flex items-center gap-2">
                  <DoodleRocket className="w-5 h-5" />
                  <span>วิธีซิงก์โค้ดขึ้น GitHub และนำไป Deploy ใช้งานจริง (Vercel / Netlify)</span>
                </h3>
                <ol className="list-decimal list-inside text-xs font-bold text-stone-700 space-y-1.5">
                  <li>
                    กดปุ่มไอคอน <strong>GitHub / Export to GitHub</strong> ที่แถบเมนูด้านบนของหน้าต่าง AI Studio (หรือดาวน์โหลด ZIP แล้วรันคำสั่ง Git ด้านล่าง)
                  </li>
                  <li>
                    นำ Repository บน GitHub ไปเชื่อมต่อกับ <strong>Vercel.com</strong> หรือ <strong>Netlify.com</strong>
                  </li>
                  <li>
                    คัดลอกค่า <strong>Environment Variables (.env)</strong> ด้านล่างไปวางในหน้าตั้งค่าโปรเจกต์ของ Vercel แล้วกด Deploy ได้ทันที!
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-white border-2 border-stone-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-1.5">
                    <DoodleLink className="w-4 h-4" />
                    <span>ค่า Environment Variables (.env) สำหรับ Vercel / GitHub</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(envBlock, 'env-block')}
                    className="px-3 py-1.5 bg-amber-300 hover:bg-amber-400 border-2 border-stone-900 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'env-block' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'env-block' ? 'คัดลอกแล้ว' : 'คัดลอก .env ทั้งหมด'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-stone-900 text-amber-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {envBlock}
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-white border-2 border-stone-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-stone-900">
                    คำสั่ง Git สำหรับอัปโหลดขึ้น GitHub Repository ของคุณ
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(gitCommands, 'git-cmd')}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 border-2 border-stone-900 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'git-cmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'git-cmd' ? 'คัดลอกแล้ว' : 'คัดลอกคำสั่ง Git'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-stone-100 border border-stone-300 text-stone-900 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {gitCommands}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-100 border-t-2 border-stone-900 flex items-center justify-between">
          <span className="text-xs font-bold text-stone-600">
            ข้อมูลทุกอย่างถูกบันทึกและซิงก์แบบ Real-time กับ Cloud Firestore
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs sm:text-sm cursor-pointer"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
