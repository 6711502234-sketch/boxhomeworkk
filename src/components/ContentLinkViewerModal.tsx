import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  X,
  Globe,
  Share2,
  FileText,
  Download,
  AlertCircle,
  Sparkles,
  Smartphone,
  Laptop,
  Maximize2
} from 'lucide-react';

export interface ContentLinkViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  attachmentName?: string;
  attachmentData?: string;
  attachmentType?: string;
  onCopySuccess?: (msg: string) => void;
}

// Normalize URL to guarantee valid protocol for any browser / platform
export const normalizeExternalUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  let trimmed = rawUrl.trim();
  trimmed = trimmed.replace(/^["']|["']$/g, '');
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

// Detect platform information from URL
export interface PlatformInfo {
  name: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  icon: string;
  canEmbed: boolean;
  embedUrl?: string;
  platformTip: string;
}

export const detectPlatform = (url?: string, fileName?: string): PlatformInfo => {
  const norm = normalizeExternalUrl(url);
  const lowerUrl = norm.toLowerCase();
  const lowerFile = (fileName || '').toLowerCase();

  // 1. Google Drive / Docs / Sheets / Slides
  if (lowerUrl.includes('drive.google.com') || lowerUrl.includes('docs.google.com')) {
    let embedUrl: string | undefined = undefined;
    if (lowerUrl.includes('/view') || lowerUrl.includes('/edit')) {
      embedUrl = norm.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');
    } else if (lowerUrl.includes('file/d/')) {
      const match = norm.match(/file\/d\/([^/]+)/);
      if (match && match[1]) {
        embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    } else if (lowerUrl.includes('presentation/d/')) {
      const match = norm.match(/presentation\/d\/([^/]+)/);
      if (match && match[1]) {
        embedUrl = `https://docs.google.com/presentation/d/${match[1]}/embed`;
      }
    } else if (lowerUrl.includes('document/d/')) {
      const match = norm.match(/document\/d\/([^/]+)/);
      if (match && match[1]) {
        embedUrl = `https://docs.google.com/document/d/${match[1]}/preview`;
      }
    }

    return {
      name: 'Google Drive / Google Docs',
      badgeBg: 'bg-emerald-100',
      textColor: 'text-emerald-950',
      borderColor: 'border-emerald-400',
      icon: '📁',
      canEmbed: !!embedUrl,
      embedUrl,
      platformTip: 'เปิดดูได้ทุกอุปกรณ์ รองรับแอป Google Drive บน iOS (iPhone/iPad) และ Android',
    };
  }

  // 2. Canva
  if (lowerUrl.includes('canva.com')) {
    return {
      name: 'Canva Presentation / ใบงาน',
      badgeBg: 'bg-cyan-100',
      textColor: 'text-cyan-950',
      borderColor: 'border-cyan-400',
      icon: '🎨',
      canEmbed: false, // Canva restricts X-Frame-Options
      platformTip: 'เปิดดูในแอป Canva หรือเบราว์เซอร์ Safari, Chrome, Edge ได้อย่างราบรื่น',
    };
  }

  // 3. YouTube
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    let embedUrl: string | undefined = undefined;
    const match = norm.match(/(?:youtu\.be\/|watch\?v=|embed\/)([^&?/]+)/);
    if (match && match[1]) {
      embedUrl = `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=0&rel=0`;
    }
    return {
      name: 'YouTube Video',
      badgeBg: 'bg-rose-100',
      textColor: 'text-rose-950',
      borderColor: 'border-rose-400',
      icon: '🎬',
      canEmbed: !!embedUrl,
      embedUrl,
      platformTip: 'สามารถรับชมวิดีโอในระบบ หรือเปิดดูผ่านแอป YouTube ได้โดยตรง',
    };
  }

  // 4. PDF
  if (lowerUrl.endsWith('.pdf') || lowerFile.endsWith('.pdf')) {
    return {
      name: 'เอกสาร PDF',
      badgeBg: 'bg-amber-100',
      textColor: 'text-amber-950',
      borderColor: 'border-amber-400',
      icon: '📄',
      canEmbed: true,
      embedUrl: norm,
      platformTip: 'รองรับการอ่านเอกสาร PDF ทั้งบนแท็บเล็ต ไอแพด มือถือ และคอมพิวเตอร์',
    };
  }

  // 5. Image
  if (lowerUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/) || lowerFile.match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) {
    return {
      name: 'รูปภาพสื่อการสอน',
      badgeBg: 'bg-purple-100',
      textColor: 'text-purple-950',
      borderColor: 'border-purple-400',
      icon: '🖼️',
      canEmbed: true,
      embedUrl: norm,
      platformTip: 'สามารถดูรูปภาพขยายเต็มจอ และบันทึกลงอุปกรณ์ได้ทันที',
    };
  }

  // 6. Generic Website
  let domain = 'เว็บไซต์ภายนอก';
  try {
    const parsed = new URL(norm);
    domain = parsed.hostname;
  } catch (e) {
    // Ignore URL parse error
  }

  return {
    name: domain,
    badgeBg: 'bg-sky-100',
    textColor: 'text-sky-950',
    borderColor: 'border-sky-400',
    icon: '🌐',
    canEmbed: false,
    platformTip: 'เปิดดูผ่านเบราว์เซอร์หลักได้ทุกระบบปฏิบัติการ (iOS, Android, Windows, Mac)',
  };
};

export const copyToClipboardSafely = async (text: string): Promise<boolean> => {
  if (!text) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // Fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (e) {
    return false;
  }
};

export const ContentLinkViewerModal: React.FC<ContentLinkViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  attachmentName,
  attachmentData,
  attachmentType,
  onCopySuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const normalizedUrl = normalizeExternalUrl(url);
  const platform = detectPlatform(normalizedUrl, attachmentName);

  useEffect(() => {
    setCopied(false);
    setIframeError(false);
  }, [url, isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!normalizedUrl) return;
    const ok = await copyToClipboardSafely(normalizedUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      if (onCopySuccess) {
        onCopySuccess('คัดลอกลิงก์สำเร็จแล้ว! นำไปเปิดใน Chrome, Safari หรือแอปใดก็ได้');
      }
    }
  };

  const handleOpenDirect = () => {
    if (!normalizedUrl) return;
    // Standard safe anchor click
    const a = document.createElement('a');
    a.href = normalizedUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white sketch-border rounded-[24px_16px_22px_18px] max-w-3xl w-full shadow-[8px_8px_0px_#18181b] border-2 border-zinc-900 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 p-4 sm:p-5 border-b-2 border-zinc-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 border-zinc-900 flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000] shrink-0">
              {platform.icon}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${platform.badgeBg} ${platform.textColor} ${platform.borderColor}`}>
                  {platform.name}
                </span>
                <span className="text-[11px] font-bold text-zinc-800 bg-white/80 px-2 py-0.5 rounded-md border border-zinc-300 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-zinc-600" />
                  <Laptop className="w-3 h-3 text-zinc-600" />
                  เปิดได้ทุกแพลตฟอร์ม
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-950 mt-1 leading-snug break-words">
                {attachmentName || title || 'ลิงก์สื่อการสอนจากคุณครู'}
              </h3>
              {title && attachmentName && (
                <p className="text-xs font-semibold text-zinc-700 truncate mt-0.5">
                  📌 การบ้าน: {title}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/80 rounded-full border border-zinc-400 cursor-pointer shrink-0 transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5 text-zinc-900" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Universal Platform Tip Banner */}
          <div className="bg-[#FFFDF5] p-3 sm:p-3.5 rounded-xl border-2 border-amber-300 shadow-2xs flex items-start gap-2.5 text-xs text-zinc-800">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-black text-amber-950">คำแนะนำการเปิดดูเนื้อหา:</span>
              <p className="font-semibold text-zinc-700 leading-relaxed">
                {platform.platformTip} หากระบบหรือเบราว์เซอร์ในเครื่องของคุณมีข้อจำกัด สามารถกด <strong>[เปิดในแท็บใหม่]</strong> หรือ <strong>[คัดลอกลิงก์]</strong> ไปวางในเบราว์เซอร์ใดก็ได้
              </p>
            </div>
          </div>

          {/* Action Launch Bar */}
          <div className="bg-zinc-50 p-3.5 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b] space-y-3">
            {/* Display the URL */}
            {normalizedUrl && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-zinc-300 text-xs">
                <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="font-mono text-zinc-700 truncate flex-1 select-all" title={normalizedUrl}>
                  {normalizedUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    copied
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>คัดลอกแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกลิงก์</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Big Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {normalizedUrl && (
                <a
                  href={normalizedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleOpenDirect}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm rounded-xl sketch-btn flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>เปิดลิงก์เนื้อหาในแท็บใหม่ (แนะนำ)</span>
                </a>
              )}

              {attachmentData ? (
                <a
                  href={attachmentData}
                  download={attachmentName || 'เอกสารประกอบการเรียน'}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-xl sketch-btn flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>ดาวน์โหลดไฟล์แนบ ({attachmentName || 'ไฟล์'})</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs sm:text-sm rounded-xl sketch-btn flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>{copied ? 'คัดลอกลิงก์แล้ว ✅' : 'คัดลอกลิงก์ไปเปิดในแอป/เบราว์เซอร์'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Embedded Preview / Content Frame */}
          <div className="border-2 border-zinc-900 rounded-2xl overflow-hidden bg-zinc-100 min-h-[280px] sm:min-h-[360px] flex flex-col">
            <div className="bg-zinc-800 text-zinc-200 px-3.5 py-2 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>ตัวอย่างการแสดงผลเนื้อหา (Preview):</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">
                {platform.canEmbed && !iframeError ? 'แสดงผลตัวอย่างในระบบ' : 'คลิกเปิดดูผ่านลิงก์โดยตรง'}
              </span>
            </div>

            {/* Content Display */}
            <div className="flex-1 flex items-center justify-center p-2 bg-zinc-50 min-h-[250px] sm:min-h-[320px]">
              {/* If File is Base64 Image */}
              {(attachmentType === 'image' || (attachmentName && attachmentName.match(/\.(jpg|jpeg|png|webp|gif)$/i))) && attachmentData ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                  <img
                    src={attachmentData}
                    alt={attachmentName || 'รูปภาพสื่อการสอน'}
                    className="max-h-[420px] max-w-full object-contain rounded-lg border border-zinc-300 shadow-sm"
                  />
                  <div className="mt-2 text-xs font-bold text-zinc-600">
                    รูปภาพขนาดเต็ม ({attachmentName})
                  </div>
                </div>
              ) : platform.canEmbed && platform.embedUrl && !iframeError ? (
                <div className="w-full h-[360px] sm:h-[450px] relative bg-white">
                  <iframe
                    src={platform.embedUrl}
                    title={title || 'Content Viewer'}
                    className="w-full h-full border-0 rounded-b-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onError={() => setIframeError(true)}
                  />
                </div>
              ) : (
                /* Fallback Card for Sites that block iframes (Canva, Drive login walls, etc.) */
                <div className="max-w-md w-full p-6 text-center space-y-3 my-auto">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 border-2 border-zinc-900 flex items-center justify-center text-3xl shadow-[2px_2px_0px_#000]">
                    {platform.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-zinc-900">
                      เนื้อหาจาก {platform.name}
                    </h4>
                    <p className="text-xs font-semibold text-zinc-600 mt-1 leading-relaxed">
                      เพื่อความปลอดภัยและความคมชัดของสื่อการสอนบนมือถือและคอมพิวเตอร์ ระบบได้จัดเตรียมลิงก์ให้กดเข้าไปดูได้โดยตรง
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    {normalizedUrl && (
                      <a
                        href={normalizedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleOpenDirect}
                        className="w-full sm:w-auto px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl sketch-btn flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>กดเพื่อเปิดดูเนื้อหาทันที ↗</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'คัดลอกแล้ว ✅' : 'คัดลอกลิงก์'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-zinc-50 border-t-2 border-zinc-900 flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
            <span>✅ รองรับการเปิดดูทุกแพลตฟอร์ม (Android, iOS, iPadOS, Windows, macOS)</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-black text-xs rounded-xl border-2 border-zinc-900 shadow-[1px_1px_0px_#000] cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
