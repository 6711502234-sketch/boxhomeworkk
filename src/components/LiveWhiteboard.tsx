import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { UserProfile, WhiteboardSession, WhiteboardMessage, CustomTopicPreset, UserRole } from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import { fileToCompressedBase64 } from '../utils/imageCompressor';
import { isClassMatching } from '../utils/classMatching';
import { safeGetItem, safeSetItem } from '../utils/storage';
import {
  MessageSquare,
  Play,
  Square,
  Trash2,
  Image as ImageIcon,
  Send,
  X,
  Sparkles,
  Users,
  CheckCircle,
  Clock,
  Maximize2,
  RefreshCw,
  PlusCircle,
  BookOpen,
  ArrowLeft,
  Eye,
  Calendar,
  AlertTriangle,
  Search,
  UserCheck,
  Edit2,
  Edit3,
  Check,
} from 'lucide-react';

export interface WhiteboardParticipant {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  classRoom?: string;
  studentNo?: string;
  lastActive: number; // timestamp
  hasMessaged?: boolean;
  messageCount?: number;
}

interface LiveWhiteboardProps {
  currentUser: UserProfile;
  sessions: WhiteboardSession[];
  messages: WhiteboardMessage[];
  onStartSession: (sessionData: {
    title: string;
    topicCategory?: string;
    promptQuestion: string;
    imageUrl?: string;
    targetClass: string;
  }) => void;
  onEndSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onSendMessage: (data: { sessionId: string; text: string; imageUrl?: string }) => void;
  onDeleteMessage: (messageId: string) => void;
  onUpdateSession?: (session: WhiteboardSession) => void;
  onEditMessage?: (messageId: string, updatedText: string) => void;
  availableClasses?: string[];
  onClearAllEndedSessions?: () => void;
}

export interface TopicPreset {
  category: string;
  label: string;
  defaultTitle: string;
  defaultPrompt: string;
}

export const TOPIC_PRESETS: TopicPreset[] = [
  {
    category: 'คำถามชวนคิดทั่วไป',
    label: 'คำถามชวนคิดทั่วไป (คำถามชวนคุยประจำคาบเรียน)',
    defaultTitle: 'คำถามชวนคิดประจำคาบเรียน',
    defaultPrompt: 'จากบทเรียนในวันนี้ นักเรียนมีข้อคิดเห็น ความรู้สึก หรือสิ่งที่อยากแบ่งปันกับคุณครูและเพื่อนๆ อย่างไรบ้าง?',
  },
  {
    category: 'Assessment as Learning',
    label: 'Assessment as Learning (การประเมินเพื่อพัฒนาการเรียนรู้ด้วยตนเอง)',
    defaultTitle: 'Assessment as Learning: สะท้อนคิดและประเมินการเรียนรู้ด้วยตนเอง',
    defaultPrompt: 'วันนี้เราได้เรียนรู้อะไรใหม่บ้าง? นักเรียนคิดว่าตนเองเข้าใจเนื้อหามากน้อยแค่ไหน และมีวิธีพัฒนาการเรียนรู้ของตนเองอย่างไรในหัวข้อนี้?',
  },
  {
    category: 'Assessment for Learning',
    label: 'Assessment for Learning (การประเมินเพื่อพัฒนาการเรียนรู้ระหว่างเรียน)',
    defaultTitle: 'Assessment for Learning: สำรวจความเข้าใจและข้อสงสัยระหว่างเรียน',
    defaultPrompt: 'จากกิจกรรมและเนื้อหาในคาบเรียนนี้ มีจุดไหนที่นักเรียนยังสงสัย อยากให้ครูอธิบายเพิ่มเติม หรืออยากให้ปรับรูปแบบกิจกรรมอย่างไรบ้าง?',
  },
  {
    category: 'Assessment of Learning',
    label: 'Assessment of Learning (การประเมินเพื่อสรุปผลการเรียนรู้)',
    defaultTitle: 'Assessment of Learning: สรุปองค์ความรู้และการนำไปประยุกต์ใช้',
    defaultPrompt: 'สรุปใจความสำคัญที่ได้จากบทเรียนนี้คืออะไร และนักเรียนสามารถนำความรู้นี้ไปประยุกต์ใช้ในชีวิตประจำวันหรือชิ้นงานได้อย่างไรบ้าง?',
  },
  {
    category: '💡 คำถามชวนคิดสะท้อนบทเรียน',
    label: '💡 คำถามชวนคิดสะท้อนบทเรียน',
    defaultTitle: 'คำถามชวนคิดสะท้อนบทเรียน',
    defaultPrompt: 'นักเรียนคิดว่าเนื้อหาในวันนี้ มีความน่าสนใจหรือนำไปปรับใช้ในชีวิตจริงได้อย่างไรบ้าง?',
  },
  {
    category: '💬 แลกเปลี่ยนความคิดเห็นประจำคาบ',
    label: '💬 แลกเปลี่ยนความคิดเห็นประจำคาบ',
    defaultTitle: 'แลกเปลี่ยนความคิดเห็นประจำคาบ',
    defaultPrompt: 'เพื่อนๆ มีมุมมองหรือแนวคิดในประเด็นนี้อย่างไร มาร่วมพิมพ์แลกเปลี่ยนและแชร์ภาพกันนะ!',
  },
  {
    category: '🧠 ระดมสมองและไอเดียใหม่ (Brainstorm)',
    label: '🧠 ระดมสมองและไอเดียใหม่ (Brainstorm)',
    defaultTitle: 'ระดมสมองและไอเดียใหม่',
    defaultPrompt: 'ถ้าให้นักเรียนออกแบบหรือคิดวิธีแก้ปัญหานี้ นักเรียนจะมีไอเดียอะไรบ้าง พิมพ์หรือวาดรูปส่งขึ้นมาได้เลย!',
  },
  {
    category: '📝 ถอดบทเรียนสิ่งที่ได้เรียนรู้',
    label: '📝 ถอดบทเรียนสิ่งที่ได้เรียนรู้',
    defaultTitle: 'ถอดบทเรียนสิ่งที่ได้เรียนรู้',
    defaultPrompt: '3 สิ่งที่นักเรียนเข้าใจชัดเจนที่สุด และ 1 สิ่งที่ยังอยากค้นคว้าเพิ่มเติมคืออะไร?',
  },
  {
    category: '❓ ถาม-ตอบข้อสงสัยสดในห้องเรียน',
    label: '❓ ถาม-ตอบข้อสงสัยสดในห้องเรียน',
    defaultTitle: 'ถาม-ตอบข้อสงสัยสดในห้องเรียน',
    defaultPrompt: 'มีข้อสงสัยหรือคำถามตรงจุดไหนเกี่ยวกับบทเรียน พิมพ์ถามคุณครูขึ้นกระดานขาวได้เลยจ้า',
  },
  {
    category: '🎯 สรุปใจความสำคัญประจำวัน',
    label: '🎯 สรุปใจความสำคัญประจำวัน',
    defaultTitle: 'สรุปใจความสำคัญประจำวัน',
    defaultPrompt: 'ร่วมกันสรุปประเด็นหลักของวันนี้ใน 1-2 ประโยค หรือส่งภาพโน้ตสรุปของนักเรียน!',
  },
];

export const FORMAT_EXPLANATIONS: Record<string, string> = {
  'คำถามชวนคิดทั่วไป': 'คำถามกระตุ้นความคิดชวนคุยประจำคาบเรียน เพื่อเปิดประเด็นแลกเปลี่ยนและสะท้อนความรู้สึก',
  'Assessment as Learning': 'การประเมินเพื่อพัฒนาการเรียนรู้ด้วยตนเอง — ส่งเสริมให้นักเรียนกำกับ ติดตาม และประเมินตนเองเพื่อตั้งเป้าหมายพัฒนาตนเอง',
  'Assessment for Learning': 'การประเมินเพื่อพัฒนาการเรียนรู้ระหว่างเรียน — สังเกต สำรวจความเข้าใจ และข้อสงสัยเพื่อนำมาปรับกระบวนการเรียนการสอน',
  'Assessment of Learning': 'การประเมินผลสรุปการเรียนรู้ — สรุปองค์ความรู้ที่ได้รับหลังจบบทเรียนและการนำความรู้ไปประยุกต์ใช้',
  '💡 คำถามชวนคิดสะท้อนบทเรียน': 'สะท้อนคิดเกี่ยวกับประโยชน์และการนำไปปรับใช้ในชีวิตจริง',
  '💬 แลกเปลี่ยนความคิดเห็นประจำคาบ': 'เปิดเวทีสนทนา แลกเปลี่ยนมุมมอง และส่งภาพความคิดเห็นร่วมกัน',
  '🧠 ระดมสมองและไอเดียใหม่ (Brainstorm)': 'เปิดรับไอเดียสร้างสรรค์ใหม่ๆ ทั้งข้อความและภาพวาดจากทุกคน',
  '📝 ถอดบทเรียนสิ่งที่ได้เรียนรู้': 'สรุปสิ่งที่เข้าใจชัดเจน และประเด็นที่ต้องการศึกษาต่อยอด',
  '❓ ถาม-ตอบข้อสงสัยสดในห้องเรียน': 'ถาม-ตอบข้อสงสัยแบบเรียลไทม์ระหว่างครูและนักเรียน',
  '🎯 สรุปใจความสำคัญประจำวัน': 'สังเคราะห์ประเด็นหลักของบทเรียนร่วมกัน',
};

// Presets for Grade Levels
const GRADE_OPTIONS = [
  { value: 'all', label: 'ทุกระดับชั้น (ประกาศรวมทุกชั้น)' },
  { value: 'ม.1', label: 'มัธยมศึกษาปีที่ 1 (ม.1)' },
  { value: 'ม.2', label: 'มัธยมศึกษาปีที่ 2 (ม.2)' },
  { value: 'ม.3', label: 'มัธยมศึกษาปีที่ 3 (ม.3)' },
  { value: 'ม.4', label: 'มัธยมศึกษาปีที่ 4 (ม.4)' },
  { value: 'ม.5', label: 'มัธยมศึกษาปีที่ 5 (ม.5)' },
  { value: 'ม.6', label: 'มัธยมศึกษาปีที่ 6 (ม.6)' },
  { value: 'ป.1', label: 'ประถมศึกษาปีที่ 1 (ป.1)' },
  { value: 'ป.2', label: 'ประถมศึกษาปีที่ 2 (ป.2)' },
  { value: 'ป.3', label: 'ประถมศึกษาปีที่ 3 (ป.3)' },
  { value: 'ป.4', label: 'ประถมศึกษาปีที่ 4 (ป.4)' },
  { value: 'ป.5', label: 'ประถมศึกษาปีที่ 5 (ป.5)' },
  { value: 'ป.6', label: 'ประถมศึกษาปีที่ 6 (ป.6)' },
  { value: 'custom', label: '✏️ กำหนดระดับชั้นเอง...' },
];

// Presets for Rooms
const ROOM_OPTIONS = [
  { value: 'all', label: 'ทุกห้องเรียน (รวมทุกห้องในระดับชั้นนี้)' },
  { value: '1', label: 'ห้อง 1 (/1)' },
  { value: '2', label: 'ห้อง 2 (/2)' },
  { value: '3', label: 'ห้อง 3 (/3)' },
  { value: '4', label: 'ห้อง 4 (/4)' },
  { value: '5', label: 'ห้อง 5 (/5)' },
  { value: '6', label: 'ห้อง 6 (/6)' },
  { value: '7', label: 'ห้อง 7 (/7)' },
  { value: '8', label: 'ห้อง 8 (/8)' },
  { value: '9', label: 'ห้อง 9 (/9)' },
  { value: '10', label: 'ห้อง 10 (/10)' },
  { value: 'custom', label: '✏️ กำหนดห้องเอง...' },
];

export const LiveWhiteboard: React.FC<LiveWhiteboardProps> = ({
  currentUser,
  sessions,
  messages,
  onStartSession,
  onEndSession,
  onDeleteSession,
  onSendMessage,
  onDeleteMessage,
  onUpdateSession,
  onEditMessage,
  availableClasses = ['ห้อง 1', 'ห้อง 2', 'ห้อง 3'],
  onClearAllEndedSessions,
}) => {
  const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'admin';

  // Filter sessions strictly according to user privacy:
  // For Admin: All sessions
  // For Teacher: Only sessions created by this teacher
  // For Student: Only sessions matching student's classroom
  const visibleSessions = useMemo(() => {
    if (currentUser.role === 'admin') {
      return sessions;
    } else if (currentUser.role === 'teacher') {
      return sessions.filter((s) => s.teacherId === currentUser.id);
    } else {
      return sessions.filter((s) => isClassMatching(currentUser.classRoom, s.targetClass));
    }
  }, [sessions, currentUser.id, currentUser.classRoom, currentUser.role]);

  // Active session (if any)
  const activeSession = visibleSessions.find((s) => s.status === 'active') || null;

  // Past / ended sessions
  const endedSessions = visibleSessions.filter((s) => s.status === 'ended');

  // Viewing session state: either specific session ID (active or past) or null
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);

  const currentSession = useMemo(() => {
    if (viewingSessionId) {
      return visibleSessions.find((s) => s.id === viewingSessionId) || null;
    }
    return activeSession;
  }, [viewingSessionId, activeSession, visibleSessions]);

  // Messages for the currently viewed session, sorted by timestamp
  const currentMessages = useMemo(() => {
    if (!currentSession) return [];
    return messages
      .filter((m) => m.sessionId === currentSession.id)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [messages, currentSession?.id]);

  // =================================================================
  // CUSTOM PRESETS & CONVERSATION FORMAT SEARCH (FOR TEACHERS & STUDENTS)
  // =================================================================
  const [customPresets, setCustomPresets] = useState<CustomTopicPreset[]>(() => {
    return safeGetItem<CustomTopicPreset[]>('hw_box_custom_topic_presets', []);
  });

  useEffect(() => {
    const handleStorage = () => {
      setCustomPresets(safeGetItem<CustomTopicPreset[]>('hw_box_custom_topic_presets', []));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const allTopicPresets = useMemo(() => {
    return [
      ...TOPIC_PRESETS,
      ...customPresets.map((c) => ({
        category: c.category,
        label: c.label,
        defaultTitle: c.defaultTitle,
        defaultPrompt: c.defaultPrompt,
      })),
    ];
  }, [customPresets]);

  // Search & Filter state for Conversation Formats (Presets in Creation Form)
  const [formatSearchText, setFormatSearchText] = useState('');
  const [formatCategoryFilter, setFormatCategoryFilter] = useState('all');

  const uniquePresetCategories = useMemo(() => {
    return Array.from(new Set(allTopicPresets.map((p) => p.category)));
  }, [allTopicPresets]);

  const filteredTopicPresets = useMemo(() => {
    let list = allTopicPresets;
    if (formatCategoryFilter !== 'all') {
      list = list.filter((p) => p.category === formatCategoryFilter);
    }
    if (formatSearchText.trim()) {
      const q = formatSearchText.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.category.toLowerCase().includes(q) ||
          p.label.toLowerCase().includes(q) ||
          p.defaultTitle.toLowerCase().includes(q) ||
          p.defaultPrompt.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allTopicPresets, formatCategoryFilter, formatSearchText]);

  // Search & Filter state for History Sessions (For Both Teachers & Students)
  const [historySearchText, setHistorySearchText] = useState('');
  const [historyFormatFilter, setHistoryFormatFilter] = useState('all');

  const historyCategories = useMemo(() => {
    const cats = new Set<string>();
    endedSessions.forEach((s) => {
      if (s.topicCategory) cats.add(s.topicCategory);
    });
    return Array.from(cats);
  }, [endedSessions]);

  const filteredEndedSessions = useMemo(() => {
    return endedSessions.filter((s) => {
      if (historyFormatFilter !== 'all' && s.topicCategory !== historyFormatFilter) return false;
      if (historySearchText.trim()) {
        const q = historySearchText.toLowerCase().trim();
        const matchFormat = (s.topicCategory || '').toLowerCase().includes(q);
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchPrompt = s.promptQuestion.toLowerCase().includes(q);
        const matchTarget = s.targetClass.toLowerCase().includes(q);
        const matchTeacher = (s.authorTeacher || s.teacherName || '').toLowerCase().includes(q);
        if (!matchFormat && !matchTitle && !matchPrompt && !matchTarget && !matchTeacher) {
          return false;
        }
      }
      return true;
    });
  }, [endedSessions, historyFormatFilter, historySearchText]);

  // ==========================================
  // REQUIREMENT 2: TARGET GROUP (GRADE & ROOM)
  // ==========================================
  const [gradeSelect, setGradeSelect] = useState<string>('ม.2');
  const [customGradeInput, setCustomGradeInput] = useState<string>('');
  const [roomSelect, setRoomSelect] = useState<string>('1');
  const [customRoomInput, setCustomRoomInput] = useState<string>('');
  const [isManualTargetOverride, setIsManualTargetOverride] = useState<boolean>(false);
  const [manualTargetText, setManualTargetText] = useState<string>('ม.2/1');

  // Calculate formatted target string
  const computedTargetClass = useMemo(() => {
    if (isManualTargetOverride) {
      return manualTargetText.trim() || 'ทุกห้อง';
    }

    const effectiveGrade = gradeSelect === 'custom' ? customGradeInput.trim() : gradeSelect;
    const effectiveRoom = roomSelect === 'custom' ? customRoomInput.trim() : roomSelect;

    if (effectiveGrade === 'all' && effectiveRoom === 'all') {
      return 'ทุกระดับชั้น - ทุกห้อง';
    }
    if (effectiveGrade === 'all') {
      return `ทุกระดับชั้น ห้อง ${effectiveRoom}`;
    }
    if (effectiveRoom === 'all') {
      return `${effectiveGrade} ทุกห้อง`;
    }
    // Specific grade and room e.g. "ม.2/1"
    return `${effectiveGrade}/${effectiveRoom}`;
  }, [
    isManualTargetOverride,
    manualTargetText,
    gradeSelect,
    customGradeInput,
    roomSelect,
    customRoomInput,
  ]);

  // Form State for Starting a Session (Teacher)
  const [category, setCategory] = useState(TOPIC_PRESETS[0].category);
  const [title, setTitle] = useState(TOPIC_PRESETS[0].defaultTitle);
  const [promptQuestion, setPromptQuestion] = useState(TOPIC_PRESETS[0].defaultPrompt);
  const [teacherImage, setTeacherImage] = useState<string | null>(null);
  const [isCompressingTeacherImg, setIsCompressingTeacherImg] = useState(false);

  // Chat input state
  const [inputText, setInputText] = useState('');
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [isCompressingChatImg, setIsCompressingChatImg] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Lightbox modal for full-size images
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // File input refs
  const teacherFileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // REQUIREMENT 1: SAFE IN-APP DELETE MODAL
  // ==========================================
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  // Execute single session deletion
  const handleConfirmDeleteSession = () => {
    if (!sessionToDelete) return;
    onDeleteSession(sessionToDelete.id);
    if (viewingSessionId === sessionToDelete.id) {
      setViewingSessionId(null);
    }
    setSessionToDelete(null);
  };

  // Execute bulk clear of all ended sessions
  const handleConfirmClearAll = () => {
    if (onClearAllEndedSessions) {
      onClearAllEndedSessions();
    } else {
      endedSessions.forEach((s) => onDeleteSession(s.id));
    }
    if (viewingSessionId && endedSessions.some((s) => s.id === viewingSessionId)) {
      setViewingSessionId(null);
    }
    setIsConfirmingClearAll(false);
  };

  // =================================================================
  // REQUIREMENT: EDIT CONVERSATION HISTORY (SESSION & MESSAGES) FOR TEACHERS
  // =================================================================
  const [editingSession, setEditingSession] = useState<WhiteboardSession | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPromptQuestion, setEditPromptQuestion] = useState('');
  const [editTopicCategory, setEditTopicCategory] = useState('');
  const [editTargetClass, setEditTargetClass] = useState('');
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<'active' | 'ended'>('ended');
  const [isCompressingEditImg, setIsCompressingEditImg] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const openEditSessionModal = (session: WhiteboardSession) => {
    setEditingSession(session);
    setEditTitle(session.title);
    setEditPromptQuestion(session.promptQuestion);
    setEditTopicCategory(session.topicCategory || 'คำถามชวนคิดทั่วไป');
    setEditTargetClass(session.targetClass);
    setEditImageUrl(session.imageUrl || null);
    setEditStatus(session.status);
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingEditImg(true);
    try {
      const base64 = await fileToCompressedBase64(file);
      setEditImageUrl(base64);
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setIsCompressingEditImg(false);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  const handleSaveSessionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !editTitle.trim() || !editPromptQuestion.trim()) return;

    const updated: WhiteboardSession = {
      ...editingSession,
      title: editTitle.trim(),
      promptQuestion: editPromptQuestion.trim(),
      topicCategory: editTopicCategory,
      targetClass: editTargetClass.trim() || 'ทุกห้อง',
      imageUrl: editImageUrl || undefined,
      status: editStatus,
    };

    if (onUpdateSession) {
      onUpdateSession(updated);
    } else {
      const all = safeGetItem<WhiteboardSession[]>('hw_box_whiteboard_sessions', []);
      const next = all.map((s) => (s.id === updated.id ? updated : s));
      safeSetItem('hw_box_whiteboard_sessions', next);
    }

    setEditingSession(null);
  };

  // Inline Message Editing State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');

  const handleSaveEditedMessage = (messageId: string) => {
    if (!editingMessageText.trim()) return;

    if (onEditMessage) {
      onEditMessage(messageId, editingMessageText.trim());
    } else {
      const all = safeGetItem<WhiteboardMessage[]>('hw_box_whiteboard_messages', []);
      const next = all.map((m) =>
        m.id === messageId
          ? {
              ...m,
              text: editingMessageText.trim(),
              isEdited: true,
              editedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
            }
          : m
      );
      safeSetItem('hw_box_whiteboard_messages', next);
    }

    setEditingMessageId(null);
    setEditingMessageText('');
  };

  // =================================================================
  // REQUIREMENT 3: PARTICIPANTS TRACKING & ATTENDANCE INFORMATION
  // =================================================================
  const [participants, setParticipants] = useState<WhiteboardParticipant[]>([]);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');

  // Register and sync presence for the currently viewed session
  useEffect(() => {
    if (!currentSession) {
      setParticipants([]);
      return;
    }

    const storageKey = `hw_box_wb_presence_${currentSession.id}`;
    let isMounted = true;

    // Helper to read and update presence list
    const syncPresence = () => {
      const stored = safeGetItem<WhiteboardParticipant[]>(storageKey, []);
      const now = Date.now();

      const myEntry: WhiteboardParticipant = {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
        classRoom: currentUser.classRoom,
        studentNo: currentUser.studentNo,
        lastActive: now,
      };

      const map = new Map<string, WhiteboardParticipant>();

      // Load existing stored entrants
      stored.forEach((p) => {
        if (p && p.id) map.set(p.id, p);
      });

      // Add/update current user
      map.set(currentUser.id, myEntry);

      // Add all authors from messages in this session
      currentMessages.forEach((msg) => {
        if (!map.has(msg.senderId)) {
          map.set(msg.senderId, {
            id: msg.senderId,
            name: msg.senderName,
            role: msg.senderRole,
            avatar: msg.senderAvatar,
            classRoom: msg.senderClass,
            studentNo: msg.senderNo,
            lastActive: msg.timestamp || now,
            hasMessaged: true,
          });
        }
      });

      // Calculate message count for each participant
      const msgCountMap = new Map<string, number>();
      currentMessages.forEach((m) => {
        msgCountMap.set(m.senderId, (msgCountMap.get(m.senderId) || 0) + 1);
      });

      const updatedList: WhiteboardParticipant[] = Array.from(map.values()).map((p) => ({
        ...p,
        messageCount: msgCountMap.get(p.id) || 0,
        hasMessaged: (msgCountMap.get(p.id) || 0) > 0,
      }));

      safeSetItem(storageKey, updatedList);
      if (isMounted) {
        setParticipants(updatedList);
      }
    };

    syncPresence();

    // Broadcast join event
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('hw_box_whiteboard_presence_channel');
      channel.postMessage({
        type: 'USER_JOINED',
        sessionId: currentSession.id,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          avatar: currentUser.avatar,
          classRoom: currentUser.classRoom,
          studentNo: currentUser.studentNo,
          lastActive: Date.now(),
        },
      });

      channel.onmessage = (event) => {
        if (event.data?.sessionId === currentSession.id) {
          syncPresence();
        }
      };
    } catch {
      // BroadcastChannel fallback
    }

    // Ping interval to keep user active
    const interval = setInterval(() => {
      syncPresence();
    }, 12000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (channel) {
        channel.close();
      }
    };
  }, [currentSession?.id, currentUser, currentMessages.length]);

  // Filtered participants in modal
  const filteredParticipants = useMemo(() => {
    if (!participantSearch.trim()) return participants;
    const q = participantSearch.toLowerCase();
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.classRoom && p.classRoom.toLowerCase().includes(q)) ||
        (p.studentNo && p.studentNo.includes(q))
    );
  }, [participants, participantSearch]);

  const teacherParticipants = filteredParticipants.filter((p) => p.role === 'teacher');
  const studentParticipants = filteredParticipants.filter((p) => p.role === 'student');

  // Auto scroll to latest message
  useEffect(() => {
    if (currentMessages.length > 0 && currentSession?.status === 'active') {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages.length, currentSession?.status]);

  // Handle selecting a preset category: auto fills title and prompt template
  const handleSelectCategory = (cat: string) => {
    setCategory(cat);
    const found = allTopicPresets.find((p) => p.category === cat);
    if (found) {
      setTitle(found.defaultTitle);
      setPromptQuestion(found.defaultPrompt);
    }
  };

  const handleSelectPreset = (preset: TopicPreset) => {
    setCategory(preset.category);
    setTitle(preset.defaultTitle);
    setPromptQuestion(preset.defaultPrompt);
  };

  // Handle teacher image file select
  const handleTeacherImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingTeacherImg(true);
      const base64 = await fileToCompressedBase64(file, 900, 0.75);
      setTeacherImage(base64);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCompressingTeacherImg(false);
      if (teacherFileInputRef.current) teacherFileInputRef.current.value = '';
    }
  };

  // Handle chat message image select
  const handleChatImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingChatImg(true);
      const base64 = await fileToCompressedBase64(file, 800, 0.75);
      setChatImage(base64);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCompressingChatImg(false);
      if (chatFileInputRef.current) chatFileInputRef.current.value = '';
    }
  };

  // Teacher starts a new Live Whiteboard session
  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptQuestion.trim()) return;

    onStartSession({
      title: title.trim() || category,
      topicCategory: category,
      promptQuestion: promptQuestion.trim(),
      imageUrl: teacherImage || undefined,
      targetClass: computedTargetClass,
    });

    setViewingSessionId(null);
    setTeacherImage(null);
  };

  // Send message to whiteboard
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;
    if (!inputText.trim() && !chatImage) return;

    setIsSending(true);
    onSendMessage({
      sessionId: currentSession.id,
      text: inputText.trim(),
      imageUrl: chatImage || undefined,
    });

    setInputText('');
    setChatImage(null);
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          EDIT CONVERSATION HISTORY MODAL (FOR TEACHERS)
         ======================================================== */}
      {editingSession && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl border-4 border-stone-900 shadow-[8px_8px_0px_#18181b] max-w-lg w-full p-5 sm:p-6 my-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-stone-900 flex items-center justify-center text-lg shadow-xs">
                  ✏️
                </div>
                <div>
                  <h4 className="text-base font-black text-stone-900">
                    แก้ไขประวัติบทสนทนา (Edit Discussion)
                  </h4>
                  <p className="text-[11px] font-bold text-stone-500">
                    แก้ไขหัวข้อ คำถาม รูปแบบ หรือห้องเรียนเป้าหมาย
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="p-1 hover:bg-stone-100 rounded-lg text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSessionEdit} className="space-y-3.5">
              {/* Title */}
              <div>
                <label className="block text-xs font-black text-stone-800 mb-1">
                  📌 ชื่อหัวข้อบทสนทนา
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  placeholder="เช่น ถอดบทเรียนวิทยาศาสตร์, แลกเปลี่ยนความคิดเห็น..."
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-300 focus:border-stone-900 rounded-xl text-xs font-bold text-stone-900 outline-none"
                />
              </div>

              {/* Topic Category / Preset */}
              <div>
                <label className="block text-xs font-black text-stone-800 mb-1">
                  🏷️ รูปแบบการสนทนา
                </label>
                <select
                  value={editTopicCategory}
                  onChange={(e) => setEditTopicCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-300 focus:border-stone-900 rounded-xl text-xs font-bold text-stone-900 outline-none"
                >
                  {allTopicPresets.map((p, idx) => (
                    <option key={idx} value={p.category}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prompt Question */}
              <div>
                <label className="block text-xs font-black text-stone-800 mb-1">
                  💬 คำถามชวนคิด / โจทย์ที่ต้องการให้นักเรียนตอบ
                </label>
                <textarea
                  value={editPromptQuestion}
                  onChange={(e) => setEditPromptQuestion(e.target.value)}
                  rows={3}
                  required
                  placeholder="พิมพ์คำถามชวนคิด..."
                  className="w-full p-3 bg-stone-50 border-2 border-stone-300 focus:border-stone-900 rounded-xl text-xs font-bold text-stone-900 outline-none leading-relaxed"
                />
              </div>

              {/* Target Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    🎯 ห้องเรียนเป้าหมาย
                  </label>
                  <input
                    type="text"
                    value={editTargetClass}
                    onChange={(e) => setEditTargetClass(e.target.value)}
                    placeholder="เช่น ม.2/1, ห้อง 1, ทุกห้อง"
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-300 focus:border-stone-900 rounded-xl text-xs font-bold text-stone-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    ⚡ สถานะบทสนทนา
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'ended')}
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-300 focus:border-stone-900 rounded-xl text-xs font-bold text-stone-900 outline-none"
                  >
                    <option value="ended">🏁 สิ้นสุดการสนทนาแล้ว (เก็บบันทึกประวัติ)</option>
                    <option value="active">🟢 กำลังสนทนาสด (เปิดรับคำตอบต่อ)</option>
                  </select>
                </div>
              </div>

              {/* Image attachment */}
              <div>
                <label className="block text-xs font-black text-stone-800 mb-1">
                  📷 รูปภาพประกอบคำถาม (ถ้ามี)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={isCompressingEditImg}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>{editImageUrl ? 'เปลี่ยนรูปภาพ' : 'แนบรูปภาพใหม่'}</span>
                  </button>
                  {editImageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditImageUrl(null)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-300 cursor-pointer"
                    >
                      ลบรูปภาพ
                    </button>
                  )}
                  {isCompressingEditImg && (
                    <span className="text-[11px] text-amber-700 font-bold animate-pulse">
                      กำลังประมวลผลรูป...
                    </span>
                  )}
                </div>

                {editImageUrl && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={editImageUrl}
                      alt="รูปภาพประกอบ"
                      className="h-24 w-auto rounded-xl border-2 border-stone-300 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 text-xs font-black rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-transform active:translate-y-0.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          CONFIRMATION MODAL: DELETE SINGLE SESSION
         ======================================================== */}
      {sessionToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl border-4 border-stone-900 shadow-[6px_6px_0px_#18181b] max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border-2 border-rose-400 flex items-center justify-center shrink-0 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-stone-900">
                  ยืนยันการลบบทสนทนานี้?
                </h4>
                <p className="text-xs text-stone-600 font-semibold leading-relaxed">
                  คุณต้องการลบบทสนทนา{' '}
                  <span className="font-black text-stone-900">"{sessionToDelete.title}"</span>{' '}
                  ใช่หรือไม่?
                </p>
                <p className="text-[11px] text-rose-700 font-bold">
                  ⚠️ คำตอบ รูปภาพ และข้อมูลในกระดานนี้จะถูกลบออกจากระบบอย่างถาวร
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSession}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ยืนยันลบประวัติบทสนทนา</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CONFIRMATION MODAL: BULK CLEAR ALL ENDED SESSIONS
         ======================================================== */}
      {isConfirmingClearAll && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl border-4 border-stone-900 shadow-[6px_6px_0px_#18181b] max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border-2 border-rose-400 flex items-center justify-center shrink-0 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-stone-900">
                  ยืนยันล้างประวัติกิจกรรมทั้งหมด?
                </h4>
                <p className="text-xs text-stone-600 font-semibold leading-relaxed">
                  คุณต้องการลบประวัติกระดานสนทนาที่ผ่านมาทั้งหมดจำนวน{' '}
                  <span className="font-black text-rose-700">{endedSessions.length} รายการ</span>{' '}
                  ใช่หรือไม่?
                </p>
                <p className="text-[11px] text-stone-500 font-medium">
                  ประวัติบทสนทนาและคำตอบในอดีตทั้งหมดจะถูกล้างออกจากระบบอย่างถาวร
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsConfirmingClearAll(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ยืนยันล้างทั้งหมด ({endedSessions.length} บทเรียน)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PARTICIPANTS DETAIL MODAL (รายชื่อคนที่เข้ามาในกระดาน)
         ======================================================== */}
      {showParticipantsModal && currentSession && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl border-4 border-stone-900 shadow-[6px_6px_0px_#18181b] max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-amber-100 via-amber-50 to-purple-50 border-b-2 border-stone-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-stone-900 flex items-center justify-center text-lg shadow-[1.5px_1.5px_0px_#000]">
                  👥
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-stone-900">
                    ผู้ที่เข้ามาในกระดานสนทนานี้
                  </h4>
                  <p className="text-[11px] font-bold text-stone-600">
                    ทั้งหมด {participants.length} คน (นักเรียน {studentParticipants.length} คน)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowParticipantsModal(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search filter in modal */}
            <div className="p-3 border-b border-stone-200 bg-stone-50">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  placeholder="ค้นหาชื่อนักเรียน, ห้อง หรือเลขที่..."
                  className="w-full bg-white pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>

            {/* Modal Body - List of Participants */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Teachers section */}
              {teacherParticipants.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-black text-stone-500 uppercase tracking-wider block">
                    🧑‍🏫 คุณครูผู้สร้างกระดาน ({teacherParticipants.length})
                  </span>
                  {teacherParticipants.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <AvatarDisplay avatar={t.avatar} className="w-8 h-8" />
                        <div>
                          <span className="text-xs font-black text-purple-950 block">
                            {t.name}
                          </span>
                          <span className="text-[10px] text-purple-700 font-bold">
                            คุณครูผู้สอน
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-purple-200 text-purple-900 font-black px-2 py-0.5 rounded-full">
                        ผู้ดูแลกระดาน
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Students section */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-stone-500 uppercase tracking-wider block">
                  🎒 นักเรียนที่เข้ามาในกระดาน ({studentParticipants.length} คน)
                </span>

                {studentParticipants.length === 0 ? (
                  <div className="py-6 text-center bg-stone-50 rounded-xl border-2 border-dashed border-stone-200 text-stone-500 text-xs font-bold">
                    ยังไม่มีนักเรียนเข้ามาในกระดานสนทนานี้
                  </div>
                ) : (
                  studentParticipants.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <AvatarDisplay avatar={s.avatar} className="w-8 h-8" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-stone-900">{s.name}</span>
                            {s.studentNo && (
                              <span className="text-[10px] text-stone-500 font-bold">
                                เลขที่ {s.studentNo}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-500 font-semibold block">
                            ห้อง: {s.classRoom || 'ไม่ระบุ'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {s.hasMessaged ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>ตอบแล้ว ({s.messageCount || 1})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>เข้ามาดูแล้ว</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 font-bold">
              <span>🎯 เป้าหมาย: {currentSession.targetClass}</span>
              <button
                type="button"
                onClick={() => setShowParticipantsModal(false)}
                className="px-4 py-1.5 bg-stone-900 text-white font-black rounded-xl text-xs cursor-pointer hover:bg-stone-800"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {previewImageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl border-2 border-stone-800">
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-md cursor-pointer border border-white"
            >
              ✕
            </button>
            <img
              src={previewImageUrl}
              alt="ดูภาพขนาดใหญ่"
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* Main Live Whiteboard Card */}
      <div className="bg-white sketch-border-lg rounded-[26px_20px_24px_18px] p-4 sm:p-6 shadow-[5px_5px_0px_#18181b] border-2 border-stone-900 space-y-5">
        {/* Top Header of the Whiteboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 border-2 border-stone-900 flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000]">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-xl font-black text-stone-900 tracking-tight">
                  กระดานขาวสนทนาสด (Live Whiteboard)
                </h3>
                {activeSession ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black bg-rose-500 text-white px-2.5 py-0.5 rounded-full border border-rose-600 shadow-xs animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>กำลังสนทนาสด</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full border border-stone-300">
                    กระดานร่วมแลกเปลี่ยน
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-stone-600 mt-0.5">
                {isTeacher
                  ? 'เลือกรูปแบบการสนทนา ระบุชั้นและห้องเป้าหมาย แล้วกดเริ่มสนทนาสดได้ทันที'
                  : 'กระดานร่วมตอบคำถาม แลกเปลี่ยนความคิดเห็น และส่งรูปภาพกับคุณครูและเพื่อนๆ ในห้องเรียน'}
              </p>
            </div>
          </div>

          {/* Navigation / Action buttons on header */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* If viewing a past session, provide Back button */}
            {viewingSessionId && (
              <button
                type="button"
                onClick={() => setViewingSessionId(null)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-bold rounded-xl border border-stone-400 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับไปหน้าหลัก</span>
              </button>
            )}

            {/* If Teacher has active session: Stop conversation button */}
            {isTeacher && currentSession && currentSession.status === 'active' && (
              <button
                type="button"
                onClick={() => onEndSession(currentSession.id)}
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-black rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-all hover:translate-y-[-1px]"
                title="จบการสนทนานี้และเก็บบันทึกบทสนทนาไว้ในระบบ"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>หยุดสนทนา</span>
              </button>
            )}

            {/* If Teacher: Delete currently viewed session button (with in-app modal) */}
            {isTeacher && currentSession && (
              <button
                type="button"
                onClick={() =>
                  setSessionToDelete({ id: currentSession.id, title: currentSession.title })
                }
                className="px-3 py-1.5 bg-stone-100 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs sm:text-sm font-bold rounded-xl border border-stone-300 hover:border-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="ลบบทสนทนานี้แบบเรียลไทม์"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบบทสนทนานี้</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            TEACHER SETUP VIEW (WHEN NO ACTIVE SESSION AND NOT VIEWING PAST)
           ======================================================== */}
        {isTeacher && !activeSession && !viewingSessionId && (
          <div className="p-5 bg-gradient-to-br from-amber-50/80 via-white to-purple-50/40 rounded-2xl border-2 border-dashed border-amber-300 space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <span className="text-xl">⚙️</span>
              <div>
                <h4 className="text-sm sm:text-base font-black">
                  ตั้งค่าและเริ่มกระดานขาวสนทนาสดใหม่
                </h4>
                <p className="text-xs text-stone-600 font-semibold">
                  เลือกรูปแบบการสนทนา ระบุระดับชั้นและห้องเรียนเป้าหมาย
                  ระบบจะใส่หัวข้อและคำถามแนะนำให้อัตโนมัติ
                </p>
              </div>
            </div>

            <form onSubmit={handleStart} className="space-y-4">
              {/* 1. รูปแบบการสนทนา (ค้นหารูปแบบการสนทนาได้ + ตัวกรองหมวดหมู่ + พรีวิวการเลือก) */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">💬</span>
                    <label className="text-xs sm:text-sm font-black text-stone-900">
                      ค้นหาและเลือกรูปแบบการสนทนา <span className="text-rose-500">*</span>
                    </label>
                  </div>

                  <span className="text-[11px] text-stone-500 font-bold">
                    พบ {filteredTopicPresets.length} รูปแบบ
                  </span>
                </div>

                {/* Search Bar for Conversation Formats */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formatSearchText}
                    onChange={(e) => setFormatSearchText(e.target.value)}
                    placeholder="🔍 ค้นหารูปแบบการสนทนา (พิมพ์ เช่น Assessment as Learning, สะท้อนคิด, ระดมสมอง, ประเมิน...)"
                    className="w-full bg-stone-50 pl-9 pr-9 py-2 rounded-xl border border-stone-400 text-xs sm:text-sm font-bold text-stone-900 focus:ring-2 focus:ring-amber-300"
                  />
                  {formatSearchText && (
                    <button
                      type="button"
                      onClick={() => setFormatSearchText('')}
                      className="absolute right-2.5 top-2.5 w-5 h-5 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-xs font-bold text-stone-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Filter Chips for Quick Picking */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-stone-500 mr-0.5">หมวดหมู่:</span>
                  <button
                    type="button"
                    onClick={() => setFormatCategoryFilter('all')}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      formatCategoryFilter === 'all'
                        ? 'bg-stone-900 text-white border-stone-900 font-black'
                        : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    ทั้งหมด ({allTopicPresets.length})
                  </button>
                  {uniquePresetCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormatCategoryFilter(cat)}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        formatCategoryFilter === cat
                          ? 'bg-amber-400 text-stone-950 border-stone-900 font-black shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Selected Format Summary Bar */}
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-300 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>รูปแบบที่เลือกอยู่:</span>
                    </span>
                    <span className="text-xs font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-lg border border-amber-400">
                      🏷️ {category}
                    </span>
                  </div>

                  {FORMAT_EXPLANATIONS[category] && (
                    <span className="text-[11px] text-amber-800 font-medium italic">
                      💡 {FORMAT_EXPLANATIONS[category]}
                    </span>
                  )}
                </div>

                {/* Preset Cards Picker Grid */}
                <div className="max-h-56 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                  {filteredTopicPresets.length === 0 ? (
                    <div className="py-5 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300 text-xs text-stone-500 font-bold space-y-1">
                      <div>ไม่พบรูปแบบการสนทนาที่ค้นหา "{formatSearchText}"</div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormatSearchText('');
                          setFormatCategoryFilter('all');
                        }}
                        className="text-purple-700 underline text-xs font-black cursor-pointer"
                      >
                        ล้างการค้นหาเพื่อดูทั้งหมด
                      </button>
                    </div>
                  ) : (
                    filteredTopicPresets.map((p) => {
                      const isSelected = category === p.category;
                      return (
                        <div
                          key={p.category + p.defaultTitle}
                          onClick={() => handleSelectPreset(p)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-100/80 border-stone-900 shadow-[2px_2px_0px_#000] scale-[1.01]'
                              : 'bg-white hover:bg-stone-50 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full border border-amber-300">
                              {p.category}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>เลือกอยู่</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-black text-stone-900 leading-snug">
                            {p.defaultTitle}
                          </div>
                          <div className="text-[11px] text-stone-600 font-medium line-clamp-1 mt-0.5 italic">
                            "{p.defaultPrompt}"
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Dropdown fallback selector */}
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2 text-xs flex-wrap">
                  <span className="text-stone-500 font-bold">หรือเลือกจากรายการด่วน:</span>
                  <select
                    value={category}
                    onChange={(e) => handleSelectCategory(e.target.value)}
                    className="bg-stone-50 px-2.5 py-1 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 max-w-xs"
                  >
                    {allTopicPresets.map((p) => (
                      <option key={p.category} value={p.category}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. REQUIREMENT 2: เมนูกลุ่มเป้าหมายปรับให้ครูสามารถระบุระดับชั้นและห้องได้ */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>เมนูกลุ่มเป้าหมาย (ระบุระดับชั้นและห้องเรียน)</span>
                    <span className="text-rose-500">*</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsManualTargetOverride(!isManualTargetOverride)}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                  >
                    {isManualTargetOverride ? 'สลับเป็นเลือกชั้นและห้อง' : 'หรือพิมพ์ระบุกลุ่มเป้าหมายเอง'}
                  </button>
                </div>

                {!isManualTargetOverride ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 2.1 เลือกระดับชั้น */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        1. เลือกระดับชั้น
                      </label>
                      <select
                        value={gradeSelect}
                        onChange={(e) => setGradeSelect(e.target.value)}
                        className="w-full bg-stone-50 p-2 rounded-xl border border-stone-400 text-xs font-bold text-stone-900"
                      >
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>

                      {gradeSelect === 'custom' && (
                        <input
                          type="text"
                          required
                          value={customGradeInput}
                          onChange={(e) => setCustomGradeInput(e.target.value)}
                          placeholder="พิมพ์ระดับชั้น เช่น ม.2, ป.5..."
                          className="mt-1.5 w-full bg-white p-2 rounded-xl border border-amber-500 text-xs font-bold text-stone-900"
                        />
                      )}
                    </div>

                    {/* 2.2 เลือกห้องเรียน */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        2. เลือกห้องเรียน
                      </label>
                      <select
                        value={roomSelect}
                        onChange={(e) => setRoomSelect(e.target.value)}
                        className="w-full bg-stone-50 p-2 rounded-xl border border-stone-400 text-xs font-bold text-stone-900"
                      >
                        {ROOM_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>

                      {roomSelect === 'custom' && (
                        <input
                          type="text"
                          required
                          value={customRoomInput}
                          onChange={(e) => setCustomRoomInput(e.target.value)}
                          placeholder="พิมพ์ห้องเรียน เช่น 1, 2, ห้องพิเศษ..."
                          className="mt-1.5 w-full bg-white p-2 rounded-xl border border-amber-500 text-xs font-bold text-stone-900"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      ระบุกลุ่มเป้าหมาย (พิมพ์ได้ทั้งชั้นและห้อง เช่น ม.2/1 หรือ ม.2 ห้อง 1 หรือ ทุกห้อง)
                    </label>
                    <input
                      type="text"
                      required
                      value={manualTargetText}
                      onChange={(e) => setManualTargetText(e.target.value)}
                      placeholder="เช่น ม.2/1, ม.2/2, ห้อง 1, ทุกห้อง..."
                      className="w-full bg-white p-2 rounded-xl border border-purple-400 text-xs font-bold text-stone-900"
                    />
                  </div>
                )}

                {/* Target Preview Tag */}
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="text-stone-600 font-bold">
                    นักเรียนที่จะมองเห็นกระดานนี้:
                  </span>
                  <span className="px-2.5 py-1 bg-amber-200 text-amber-950 font-black rounded-lg border border-amber-400 text-xs">
                    🏷️ {computedTargetClass}
                  </span>
                </div>
              </div>

              {/* 3. ชื่อหัวข้อคำถาม */}
              <div>
                <label className="block text-xs font-black text-stone-800 mb-1">
                  หัวข้อ / ประเด็นการสนทนา <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น คำถามชวนคิดประจำคาบเรียน, สะท้อนคิดและประเมินตนเอง..."
                  className="w-full bg-white p-2.5 rounded-xl border-2 border-stone-900 text-xs sm:text-sm font-bold text-stone-900 shadow-[2px_2px_0px_#000]"
                />
              </div>

              {/* 4. คำถามหรือโจทย์ที่ครูโพสต์ถามนักเรียน */}
              <div>
                <label className="block text-xs font-black text-stone-800 mb-1">
                  คำถาม / โจทย์ชวนคิดที่คุณครูต้องการถามนักเรียน <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={promptQuestion}
                  onChange={(e) => setPromptQuestion(e.target.value)}
                  placeholder="พิมพ์คำถาม หรือโจทย์ชวนคิดเพื่อให้นักเรียนทุกคนช่วยกันพิมพ์ตอบและส่งรูปภาพขึ้นกระดานขาว..."
                  className="w-full bg-white p-3 rounded-xl border-2 border-stone-900 text-xs sm:text-sm font-bold text-stone-900 shadow-[2px_2px_0px_#000] focus:ring-2 focus:ring-amber-300 leading-relaxed"
                />
              </div>

              {/* 5. แนบรูปภาพประกอบคำถาม & ปุ่มเริ่ม */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={teacherFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleTeacherImageSelect}
                  />
                  <button
                    type="button"
                    onClick={() => teacherFileInputRef.current?.click()}
                    disabled={isCompressingTeacherImg}
                    className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>{teacherImage ? 'เปลี่ยนรูปภาพประกอบ' : '📷 แนบรูปภาพโจทย์ / ภาพประกอบ'}</span>
                  </button>
                  {isCompressingTeacherImg && (
                    <span className="text-xs text-amber-700 animate-pulse font-bold">
                      กำลังประมวลผลรูป...
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 text-sm font-black rounded-xl border-2 border-stone-900 shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition-all hover:translate-y-[-1px]"
                >
                  <Play className="w-4 h-4 fill-stone-950" />
                  <span>เริ่มกระดานสนทนาสด</span>
                </button>
              </div>

              {/* Preview of Teacher Attached Image */}
              {teacherImage && (
                <div className="relative inline-block mt-2 p-1.5 bg-white rounded-xl border-2 border-stone-900 shadow-sm">
                  <img
                    src={teacherImage}
                    alt="รูปภาพประกอบของครู"
                    className="h-28 w-auto rounded-lg object-cover cursor-pointer"
                    onClick={() => setPreviewImageUrl(teacherImage)}
                  />
                  <button
                    type="button"
                    onClick={() => setTeacherImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-md cursor-pointer border border-white"
                    title="ลบรูปภาพ"
                  >
                    ✕
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ========================================================
            WHITEBOARD BOARD VIEW (ACTIVE SESSION OR VIEWING PAST SESSION)
           ======================================================== */}
        {currentSession ? (
          <div className="space-y-4">
            {/* Whiteboard Surface Box */}
            <div className="relative bg-gradient-to-b from-stone-50 via-white to-amber-50/20 rounded-2xl border-4 border-stone-800 shadow-[inner_0px_2px_6px_rgba(0,0,0,0.06)] p-4 sm:p-6 overflow-hidden">
              {/* Marker Rail Deco */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-stone-300 via-stone-400 to-stone-300 border-b border-stone-400" />

              {/* ====================================================
                  REQUIREMENT 3: PARTICIPANT ATTENDANCE INFO BAR
                 ==================================================== */}
              <div className="mb-3 p-2.5 sm:p-3 bg-gradient-to-r from-amber-100/90 via-amber-50 to-emerald-50/70 rounded-xl border-2 border-stone-800 shadow-[2px_2px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-stone-900">
                    <Users className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>เข้ามาในกระดานสนทนาแล้ว:</span>
                    <span className="text-base font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                      {participants.length} คน
                    </span>
                  </div>

                  {/* Avatar stack preview of who entered */}
                  <div className="flex items-center -space-x-2 overflow-hidden ml-1">
                    {participants.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="inline-block border-2 border-white rounded-full shadow-xs"
                        title={`${p.name} (${p.classRoom || 'ห้องเรียน'})`}
                      >
                        <AvatarDisplay avatar={p.avatar} className="w-6 h-6" />
                      </div>
                    ))}
                    {participants.length > 5 && (
                      <div className="w-6 h-6 rounded-full bg-stone-800 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                        +{participants.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowParticipantsModal(true)}
                    className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-900 text-xs font-black rounded-xl border-2 border-stone-900 shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ดูรายชื่อผู้เข้าร่วม ({participants.length} คน)</span>
                  </button>
                </div>
              </div>

              {/* Whiteboard Prompt Card */}
              <div className="bg-white rounded-xl border-2 border-stone-900 p-4 shadow-[3px_3px_0px_#18181b] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <AvatarDisplay avatar={currentSession.teacherAvatar} className="w-8 h-8" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-stone-900">
                          {currentSession.authorTeacher || currentSession.teacherName}
                        </span>
                        <span className="text-[10px] font-black bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-300">
                          🧑‍🏫 คุณครูผู้สอน
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-bold">
                        กลุ่มเป้าหมาย: <span className="text-stone-800 font-black">{currentSession.targetClass}</span> • เริ่มเมื่อ: {currentSession.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                    {currentSession.topicCategory && (
                      <span className="text-[11px] font-black bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-400 shadow-2xs">
                        🏷️ รูปแบบการสนทนา: {currentSession.topicCategory}
                      </span>
                    )}
                    {currentSession.status === 'active' ? (
                      <span className="text-[11px] font-black bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>เปิดรับคำตอบสด</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold bg-stone-200 text-stone-800 px-2.5 py-0.5 rounded-full border border-stone-300">
                        🏁 จบการสนทนาแล้ว (เก็บบันทึกไว้)
                      </span>
                    )}

                    {isTeacher && (
                      <button
                        type="button"
                        onClick={() => openEditSessionModal(currentSession)}
                        className="text-[11px] font-black bg-white hover:bg-amber-100 text-stone-900 px-2.5 py-0.5 rounded-full border border-stone-800 shadow-2xs flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5"
                        title="แก้ไขหัวข้อ คำถาม หรือข้อมูลกระดานนี้"
                      >
                        <Edit2 className="w-3 h-3 text-amber-700" />
                        <span>แก้ไขข้อมูลกระดาน</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Title & Prompt */}
                <div>
                  <h4 className="text-sm sm:text-base font-black text-stone-900 mb-1">
                    📌 {currentSession.title}
                  </h4>
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs sm:text-sm font-bold text-stone-800 leading-relaxed">
                    "{currentSession.promptQuestion}"
                  </div>

                  {currentSession.topicCategory && FORMAT_EXPLANATIONS[currentSession.topicCategory] && (
                    <div className="mt-2 text-[11px] text-stone-600 font-medium italic bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                      <span>💡</span>
                      <span>แนวทางรูปแบบการสนทนานี้: {FORMAT_EXPLANATIONS[currentSession.topicCategory]}</span>
                    </div>
                  )}

                  {/* Attached Teacher Image (if any) */}
                  {currentSession.imageUrl && (
                    <div className="mt-3">
                      <div className="relative inline-block group">
                        <img
                          src={currentSession.imageUrl}
                          alt="ภาพประกอบคำถาม"
                          className="max-h-56 max-w-full sm:max-w-md rounded-xl border-2 border-stone-800 object-cover cursor-pointer shadow-sm hover:opacity-95 transition-opacity"
                          onClick={() => setPreviewImageUrl(currentSession.imageUrl || null)}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewImageUrl(currentSession.imageUrl || null)}
                          className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 hover:bg-black text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>ขยายภาพ</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Messages Stream */}
              <div className="mt-4 space-y-3 min-h-[160px] max-h-[460px] overflow-y-auto p-2 pr-3 scrollbar-thin">
                {currentMessages.length === 0 ? (
                  <div className="py-8 text-center bg-white/70 rounded-xl border-2 border-dashed border-stone-300 space-y-2">
                    <span className="text-3xl block">💬</span>
                    <p className="text-xs sm:text-sm font-bold text-stone-700">
                      ยังไม่มีคำตอบบนกระดานขาว
                    </p>
                    <p className="text-[11px] text-stone-500 font-medium">
                      {isTeacher
                        ? 'รอคำตอบและรูปภาพจากนักเรียน...'
                        : 'พิมพ์คำตอบ หรือถ่ายรูปผลงานส่งขึ้นกระดานขาวได้เลย!'}
                    </p>
                  </div>
                ) : (
                  currentMessages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    const isMsgTeacher = msg.senderRole === 'teacher';

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <AvatarDisplay
                            avatar={msg.senderAvatar}
                            className="w-8 h-8 shrink-0 mt-0.5"
                          />
                        )}

                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 border-2 shadow-[2px_2px_0px_#000] space-y-1.5 ${
                            isMsgTeacher
                              ? 'bg-purple-50 border-purple-900 text-purple-950'
                              : isMe
                              ? 'bg-amber-100 border-stone-900 text-stone-900'
                              : 'bg-white border-stone-900 text-stone-900'
                          }`}
                        >
                          {/* Sender Info Bar */}
                          <div className="flex items-center justify-between gap-2 text-[11px] font-bold pb-1 border-b border-black/10">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black truncate max-w-[150px]">
                                {msg.senderName}
                              </span>
                              {isMsgTeacher ? (
                                <span className="text-[9px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded font-black">
                                  ครูผู้สอน
                                </span>
                              ) : (
                                msg.senderClass && (
                                  <span className="text-[9px] bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded font-bold">
                                    {msg.senderClass} {msg.senderNo ? `เลขที่ ${msg.senderNo}` : ''}
                                  </span>
                                )
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-stone-400">
                              <span className="text-[10px]">{msg.createdAt}</span>
                              {/* Edit button: Teacher or author can edit message */}
                              {(isTeacher || isMe) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMessageId(msg.id);
                                    setEditingMessageText(msg.text || '');
                                  }}
                                  className="text-stone-400 hover:text-amber-600 cursor-pointer transition-colors p-0.5"
                                  title="แก้ไขข้อความนี้"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                              {/* Real-time delete button: Teacher can delete any, Student can delete own */}
                              {(isTeacher || isMe) && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteMessage(msg.id)}
                                  className="text-stone-400 hover:text-rose-600 cursor-pointer transition-colors p-0.5"
                                  title="ลบข้อความนี้"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Message Text or Inline Edit */}
                          {editingMessageId === msg.id ? (
                            <div className="pt-1 space-y-1.5">
                              <textarea
                                value={editingMessageText}
                                onChange={(e) => setEditingMessageText(e.target.value)}
                                className="w-full p-2 bg-white rounded-xl border-2 border-amber-400 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditingMessageText('');
                                  }}
                                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold cursor-pointer"
                                >
                                  ยกเลิก
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditedMessage(msg.id)}
                                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black rounded-lg text-[10px] border border-stone-900 cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>บันทึก</span>
                                </button>
                              </div>
                            </div>
                          ) : msg.text ? (
                            <div>
                              <p className="text-xs sm:text-sm font-semibold whitespace-pre-wrap leading-relaxed">
                                {msg.text}
                              </p>
                              {msg.isEdited && (
                                <span className="text-[9px] text-stone-400 italic font-normal">
                                  (แก้ไขแล้ว {msg.editedAt || ''})
                                </span>
                              )}
                            </div>
                          ) : null}

                          {/* Message Image */}
                          {msg.imageUrl && (
                            <div className="pt-1">
                              <img
                                src={msg.imageUrl}
                                alt="รูปภาพที่ส่ง"
                                className="max-h-48 max-w-full rounded-xl border border-stone-400 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setPreviewImageUrl(msg.imageUrl || null)}
                              />
                            </div>
                          )}
                        </div>

                        {isMe && (
                          <AvatarDisplay
                            avatar={msg.senderAvatar}
                            className="w-8 h-8 shrink-0 mt-0.5"
                          />
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Whiteboard Bottom Rail */}
              <div className="mt-3 pt-2 border-t-2 border-stone-300 flex items-center justify-between text-xs text-stone-500 font-bold px-1">
                <span className="flex items-center gap-1.5">
                  <span>🖊️ กระดานสนทนาสด</span>
                  <span className="text-[11px] font-normal">
                    (ข้อความและรูปภาพจะแสดงแบบเรียลไทม์)
                  </span>
                </span>
                <span>{currentMessages.length} ข้อความ</span>
              </div>
            </div>

            {/* MESSAGE INPUT AREA (ONLY WHEN ACTIVE) */}
            {currentSession.status === 'active' ? (
              <form
                onSubmit={handleSendMessage}
                className="bg-stone-50 p-3 sm:p-4 rounded-2xl border-2 border-stone-900 shadow-[3px_3px_0px_#000] space-y-2.5"
              >
                {/* Image Preview before send */}
                {chatImage && (
                  <div className="relative inline-block p-1 bg-white rounded-xl border border-stone-400 shadow-xs">
                    <img
                      src={chatImage}
                      alt="รูปที่แนบ"
                      className="h-20 w-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setChatImage(null)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs"
                      title="ลบรูปภาพ"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={chatFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleChatImageSelect}
                  />

                  {/* Attachment button */}
                  <button
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    disabled={isCompressingChatImg}
                    className="p-2.5 bg-white hover:bg-stone-100 text-stone-700 rounded-xl border-2 border-stone-900 shadow-[1.5px_1.5px_0px_#000] cursor-pointer shrink-0 transition-transform active:translate-y-0.5"
                    title="แนบรูปภาพหรือถ่ายภาพคำตอบ"
                  >
                    <ImageIcon className="w-5 h-5 text-amber-600" />
                  </button>

                  {/* Text input */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isTeacher
                        ? 'ครูพิมพ์ข้อความสนทนาสด หรือแนะนำนักเรียน...'
                        : 'พิมพ์คำตอบของคุณส่งถึงคุณครูและเพื่อนๆ...'
                    }
                    className="flex-1 bg-white p-2.5 rounded-xl border-2 border-stone-900 text-xs sm:text-sm font-bold text-stone-900 shadow-[1.5px_1.5px_0px_#000] focus:ring-2 focus:ring-amber-300"
                  />

                  {/* Send Button (Pure discussion - No score) */}
                  <button
                    type="submit"
                    disabled={(!inputText.trim() && !chatImage) || isSending}
                    className={`px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0 transition-all ${
                      (!inputText.trim() && !chatImage) || isSending
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none border-stone-300'
                        : isTeacher
                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                        : 'bg-amber-400 hover:bg-amber-500 text-stone-950'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isTeacher ? 'ส่งข้อความ' : 'ส่งคำตอบ'}
                    </span>
                    <span className="sm:hidden">ส่ง</span>
                  </button>
                </div>

                {isCompressingChatImg && (
                  <p className="text-[11px] text-amber-700 font-bold animate-pulse">
                    กำลังประมวลผลรูปภาพ...
                  </p>
                )}
              </form>
            ) : (
              <div className="p-4 bg-stone-100 rounded-2xl border-2 border-stone-300 text-center space-y-1">
                <span className="text-xl">🏁</span>
                <p className="text-xs sm:text-sm font-bold text-stone-700">
                  บทสนทนานี้สิ้นสุดแล้ว (เก็บบันทึกไว้ในระบบ)
                </p>
                <p className="text-[11px] text-stone-500 font-medium">
                  {isTeacher
                    ? 'คุณครูสามารถเก็บข้อความและรูปภาพนี้ไว้ดูย้อนหลัง หรือกดปุ่ม "ลบบทสนทนานี้" ด้านบนหากไม่ต้องการเก็บไว้'
                    : 'คุณสามารถอ่านคำตอบและดูรูปภาพย้อนหลังบนกระดานขาวได้ตามปกติ'}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Student sees this when no session is active or being viewed */
          !isTeacher && endedSessions.length === 0 && (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 space-y-2">
              <span className="text-3xl block">⏳</span>
              <p className="text-base font-bold text-stone-800">
                ยังไม่มีกระดานสนทนาสดที่เปิดอยู่ในห้องเรียนของคุณ
              </p>
              <p className="text-xs text-stone-500 font-medium max-w-sm mx-auto">
                เมื่อคุณครูเริ่มกระดานขาวสนทนาสด จะมีแจ้งเตือนสีแดง "🔴 สนทนาสด!" ที่เมนูด้านบนทันที
              </p>
            </div>
          )
        )}

        {/* ========================================================
            REQUIREMENT 1: PAST SESSIONS LIST (เก็บบันทึก หรือ เลือกลบได้)
           ======================================================== */}
        {endedSessions.length > 0 && !viewingSessionId && (
          <div className="pt-4 border-t-2 border-stone-200 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm sm:text-base font-black text-stone-900">
                  {isTeacher
                    ? `ประวัติบทสนทนาที่เคยสนทนาไปแล้ว (${endedSessions.length} บทเรียน)`
                    : `ประวัติกระดานสนทนาที่ผ่านมา (${endedSessions.length} บทเรียน)`}
                </h4>
              </div>

              {/* Action buttons on history header: Clear all for teacher */}
              {isTeacher && endedSessions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClearAll(true)}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="ล้างประวัติบทสนทนาที่ผ่านมาทั้งหมด"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างประวัติทั้งหมด ({endedSessions.length})</span>
                </button>
              )}
            </div>

            <p className="text-xs font-semibold text-stone-500">
              {isTeacher
                ? 'คุณครูสามารถค้นหาตามรูปแบบการสนทนา เปิดดูบทสนทนาที่เก็บบันทึกไว้ หรือกดปุ่ม "ลบประวัติ" หากต้องการลบออกจากระบบ'
                : 'ค้นหาตามรูปแบบการสนทนา หรือคลิกเพื่อเปิดดูกระดานคำถามและคำตอบย้อนหลัง'}
            </p>

            {/* Search & Filter Bar for Conversation Formats in History */}
            <div className="p-3 bg-stone-100 rounded-xl border border-stone-300 space-y-2">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={historySearchText}
                    onChange={(e) => setHistorySearchText(e.target.value)}
                    placeholder="🔍 ค้นหารูปแบบการสนทนา (เช่น Assessment as Learning, สะท้อนคิด...) หรือหัวข้อ..."
                    className="w-full bg-white pl-9 pr-8 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-300"
                  />
                  {historySearchText && (
                    <button
                      type="button"
                      onClick={() => setHistorySearchText('')}
                      className="absolute right-2 top-2 w-5 h-5 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-xs font-bold text-stone-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-[11px] font-bold text-stone-500 whitespace-nowrap">รูปแบบ:</span>
                  <select
                    value={historyFormatFilter}
                    onChange={(e) => setHistoryFormatFilter(e.target.value)}
                    className="w-full sm:w-auto bg-white px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900"
                  >
                    <option value="all">ทุกรูปแบบ ({endedSessions.length})</option>
                    {historyCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status and count of matched results */}
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 px-1">
                <span>
                  แสดง {filteredEndedSessions.length} จาก {endedSessions.length} บทเรียนที่เคยสนทนา
                </span>
                {(historySearchText || historyFormatFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistorySearchText('');
                      setHistoryFormatFilter('all');
                    }}
                    className="text-purple-700 hover:text-purple-900 underline cursor-pointer"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                )}
              </div>
            </div>

            {filteredEndedSessions.length === 0 ? (
              <div className="py-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 space-y-2">
                <span className="text-2xl block">🔍</span>
                <p className="text-xs sm:text-sm font-bold text-stone-700">
                  ไม่พบบทสนทนาที่ตรงกับรูปแบบการสนทนาที่ค้นหา
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setHistorySearchText('');
                    setHistoryFormatFilter('all');
                  }}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-stone-950 text-xs font-black rounded-lg border border-stone-900 cursor-pointer shadow-xs"
                >
                  แสดงบทสนทนาทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredEndedSessions.map((session) => {
                  const sessionMsgCount = messages.filter((m) => m.sessionId === session.id).length;

                  return (
                    <div
                      key={session.id}
                      className="p-4 bg-stone-50/80 hover:bg-white rounded-2xl border-2 border-stone-300 shadow-[2px_2px_0px_#000] flex flex-col justify-between gap-3 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                            🏷️ {session.topicCategory || 'คำถามชวนคิด'}
                          </span>
                          <span className="text-[10px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                            เป้าหมาย: {session.targetClass}
                          </span>
                          <span className="text-[10px] text-stone-500 font-semibold">
                            {session.createdAt}
                          </span>
                        </div>

                        <h5 className="text-sm font-black text-stone-900 leading-snug line-clamp-1 mb-1">
                          📌 {session.title}
                        </h5>

                        <p className="text-xs text-stone-600 font-medium line-clamp-2 italic">
                          "{session.promptQuestion}"
                        </p>

                        {session.topicCategory && FORMAT_EXPLANATIONS[session.topicCategory] && (
                          <div className="mt-1.5 text-[10px] text-stone-500 font-medium line-clamp-1">
                            💡 {FORMAT_EXPLANATIONS[session.topicCategory]}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                          <span>{sessionMsgCount} ข้อความ</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Open and keep / view session */}
                          <button
                            type="button"
                            onClick={() => setViewingSessionId(session.id)}
                            className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-stone-950 text-xs font-black rounded-lg border border-stone-900 shadow-[1px_1px_0px_#000] flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5"
                            title="เปิดดูกระดานสนทนานี้ที่เก็บบันทึกไว้"
                          >
                            <Eye className="w-3 h-3" />
                            <span>เปิดดู</span>
                          </button>

                          {/* Teacher delete past session (Opens safe in-app confirmation modal) */}
                          {isTeacher && (
                            <button
                              type="button"
                              onClick={() =>
                                setSessionToDelete({ id: session.id, title: session.title })
                              }
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                              title="ลบประวัติบทสนทนานี้ออกจากระบบ"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>ลบประวัติ</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
