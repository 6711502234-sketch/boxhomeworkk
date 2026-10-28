import React, { useState, useMemo, useEffect } from 'react';
import {
  UserProfile,
  TeacherEvaluation,
  TeacherReflectionTopic,
  AssessmentType,
  WhiteboardSession,
  WhiteboardMessage,
} from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { TeacherTopicModal, ASSESSMENT_OPTIONS } from './TeacherTopicModal';
import { GoogleSheetsIcon } from './GoogleSheetsModal';
import { LiveWhiteboard } from './LiveWhiteboard';
import { triggerFestiveConfetti, triggerStarBurst } from '../utils/confetti';
import { isClassMatching } from '../utils/classMatching';
import { safeGetItem, safeSetItem } from '../utils/storage';
import {
  Star,
  Send,
  Sparkles,
  Search,
  MessageCircle,
  Reply,
  Heart,
  Filter,
  Trash2,
  Edit3,
  Pin,
  PlusCircle,
  MessageSquarePlus,
  Users,
  Calendar,
  Layers,
  ChevronDown,
  Eye,
  CheckCircle,
  Info,
  X,
  HelpCircle,
  Smile,
} from 'lucide-react';

interface TeacherEvaluationViewProps {
  currentUser: UserProfile;
  evaluations: TeacherEvaluation[];
  topics?: TeacherReflectionTopic[];
  whiteboardSessions?: WhiteboardSession[];
  whiteboardMessages?: WhiteboardMessage[];
  onStartWhiteboardSession?: (data: {
    title: string;
    topicCategory?: string;
    promptQuestion: string;
    imageUrl?: string;
    targetClass: string;
  }) => void;
  onEndWhiteboardSession?: (sessionId: string) => void;
  onDeleteWhiteboardSession?: (sessionId: string) => void;
  onClearAllWhiteboardSessions?: () => void;
  onSendWhiteboardMessage?: (data: { sessionId: string; text: string; imageUrl?: string }) => void;
  onDeleteWhiteboardMessage?: (messageId: string) => void;
  onUpdateWhiteboardSession?: (session: WhiteboardSession) => void;
  onEditWhiteboardMessage?: (messageId: string, updatedText: string) => void;
  onSubmitEvaluation: (newEval: TeacherEvaluation) => void;
  onTeacherReply?: (evalId: string, replyText: string) => void;
  onDeleteEvaluation?: (evalId: string) => void;
  onAwardStars: (amount: number, reason: string) => void;
  onCreateTopic?: (topic: TeacherReflectionTopic) => void;
  onUpdateTopic?: (topic: TeacherReflectionTopic) => void;
  onDeleteTopic?: (topicId: string) => void;
  onOpenGoogleSheets?: () => void;
}

const RATING_DESCRIPTIONS: Record<number, { title: string; subtitle: string; emoji: string; color: string }> = {
  1: {
    title: '1/5 ดาว (อยากให้ปรับปรุง)',
    subtitle: 'กิจกรรมยังยากเกินไป หรือยังไม่ค่อยเข้าใจเนื้อหา',
    emoji: '🥺',
    color: 'bg-rose-100 border-rose-400 text-rose-800',
  },
  2: {
    title: '2/5 ดาว (พอใช้ได้)',
    subtitle: 'อยากให้มีกิจกรรมหลากหลายและเพิ่มเวลาอธิบายเพิ่มเติม',
    emoji: '😐',
    color: 'bg-orange-100 border-orange-400 text-orange-800',
  },
  3: {
    title: '3/5 ดาว (ปานกลาง / สนุกดี)',
    subtitle: 'กิจกรรมสนุกดี แต่ยังอยากได้ลูกเล่นและการทดลองเพิ่ม',
    emoji: '🙂',
    color: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  },
  4: {
    title: '4/5 ดาว (สนุกมาก)',
    subtitle: 'เข้าใจง่าย กิจกรรมน่าสนใจและได้ร่วมสนุกกับเพื่อนๆ',
    emoji: '😄',
    color: 'bg-lime-100 border-lime-400 text-lime-800',
  },
  5: {
    title: '5/5 ดาว (สนุกมากที่สุด!)',
    subtitle: 'เลิฟคาบนี้มาก! ครูสอนเข้าใจง่าย กิจกรรมสุดยอด อยากเรียนอีก',
    emoji: '🥳',
    color: 'bg-emerald-100 border-emerald-500 text-emerald-900',
  },
};

export const TeacherEvaluationView: React.FC<TeacherEvaluationViewProps> = ({
  currentUser,
  evaluations,
  topics = [],
  whiteboardSessions = [],
  whiteboardMessages = [],
  onStartWhiteboardSession,
  onEndWhiteboardSession,
  onDeleteWhiteboardSession,
  onClearAllWhiteboardSessions,
  onSendWhiteboardMessage,
  onDeleteWhiteboardMessage,
  onUpdateWhiteboardSession,
  onEditWhiteboardMessage,
  onSubmitEvaluation,
  onTeacherReply,
  onDeleteEvaluation,
  onAwardStars,
  onCreateTopic,
  onUpdateTopic,
  onDeleteTopic,
  onOpenGoogleSheets,
}) => {
  const isTeacher = currentUser.role === 'teacher';

  // Filter visible topics: Teachers strictly see their own; Students see topics for their classroom
  const visibleTopics = useMemo(() => {
    return topics.filter((topic) => {
      if (isTeacher) {
        return (
          topic.teacherId === currentUser.id ||
          (!topic.teacherId && topic.authorTeacher === currentUser.name)
        );
      }
      return isClassMatching(currentUser.classRoom, topic.targetClass);
    });
  }, [topics, isTeacher, currentUser.id, currentUser.name, currentUser.classRoom]);

  // Topic Management State (Teacher Post)
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TeacherReflectionTopic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<TeacherReflectionTopic | null>(null);
  const [presetAssessmentType, setPresetAssessmentType] = useState<AssessmentType>('คำถามชวนคิดทั่วไป');

  // Teacher Quick Inline Post Box State
  const [quickPostTitle, setQuickPostTitle] = useState('');
  const [quickPostPrompt, setQuickPostPrompt] = useState('');
  const [quickPostClass, setQuickPostClass] = useState(
    currentUser.teachingClasses && currentUser.teachingClasses.length > 0
      ? currentUser.teachingClasses[0]
      : 'ทุกห้อง'
  );
  const [quickPostAssessmentType, setQuickPostAssessmentType] = useState<AssessmentType>('คำถามชวนคิดทั่วไป');
  const [quickPostPinned, setQuickPostPinned] = useState(true);

  // Fallback general topic so students ALWAYS have a question to answer even if no custom topics were posted
  const fallbackGeneralTopic: TeacherReflectionTopic = useMemo(() => ({
    id: 'general',
    title: 'ชวนคุยและสะท้อนคิด: คาบเรียนและสิ่งที่ได้เรียนรู้วันนี้',
    promptQuestion: 'จากคาบเรียนในวันนี้ นักเรียนเข้าใจเนื้อหาตรงไหนมากที่สุด ชอบกิจกรรมไหน และมีเรื่องไหนที่ยังสงสัยหรืออยากให้คุณครูช่วยอธิบายเพิ่มเติมบ้างจ๊ะ?',
    targetClass: 'ทุกห้อง',
    authorTeacher: 'คุณครูประจำวิชา',
    teacherAvatar: 'teacher-female-glasses',
    createdAt: 'ประจำวัน',
    assessmentType: 'คำถามชวนคิดทั่วไป',
    pinned: true,
  }), []);

  const effectiveTopics = useMemo(() => {
    return visibleTopics.length > 0 ? visibleTopics : [fallbackGeneralTopic];
  }, [visibleTopics, fallbackGeneralTopic]);

  // Student Form State
  const defaultSelectedTopic = effectiveTopics.find((t) => t.pinned) || effectiveTopics[0] || null;
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    defaultSelectedTopic ? defaultSelectedTopic.id : 'general'
  );
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [improvementText, setImprovementText] = useState<string>('');
  const [recommendationText, setRecommendationText] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showSuccessCard, setShowSuccessCard] = useState<boolean>(false);
  const [revealAnonymousForTeacher, setRevealAnonymousForTeacher] = useState<boolean>(true);
  const [studentViewMode, setStudentViewMode] = useState<'form' | 'community'>('form');

  // Student Community Feed Filter State
  const [studentFeedTab, setStudentFeedTab] = useState<'all' | 'mine' | 'replied'>('all');
  const [studentFeedSearch, setStudentFeedSearch] = useState('');
  const [studentFeedTopicFilter, setStudentFeedTopicFilter] = useState('all');

  // Interactive Post Reactions (Hearts & Cheers)
  const [postReactions, setPostReactions] = useState<Record<string, { likes: number; cheered: boolean }>>(() => {
    return safeGetItem<Record<string, { likes: number; cheered: boolean }>>('hw_box_reflection_reactions', {}) || {};
  });

  const toggleCheerPost = (postId: string) => {
    setPostReactions((prev) => {
      const current = prev[postId] || { likes: 0, cheered: false };
      const updated = {
        ...prev,
        [postId]: {
          likes: current.cheered ? Math.max(0, current.likes - 1) : current.likes + 1,
          cheered: !current.cheered,
        },
      };
      safeSetItem('hw_box_reflection_reactions', updated);
      return updated;
    });
  };

  // Inline Quick Answering on Question Card State
  const [inlineReplyingTopicId, setInlineReplyingTopicId] = useState<string | null>(null);
  const [inlineAnswerText, setInlineAnswerText] = useState<string>('');
  const [inlineRatingStars, setInlineRatingStars] = useState<number>(5);
  const [inlineRecommendation, setInlineRecommendation] = useState<string>('');
  const [inlineIsAnonymous, setInlineIsAnonymous] = useState<boolean>(false);

  // Filter & Search State
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3_lower'>('all');
  const [classFilter, setClassFilter] = useState('all');

  // Teacher Reply State
  const [replyingEvalId, setReplyingEvalId] = useState<string | null>(null);
  const [replyTextInput, setReplyTextInput] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<TeacherEvaluation | null>(null);

  // Teacher Author Inspection State
  const [inspectedAuthorEval, setInspectingAuthorEval] = useState<TeacherEvaluation | null>(null);
  const [modalReplyText, setModalReplyText] = useState<string>('');

  const currentDisplayRating = hoveredRating || ratingStars;
  const ratingInfo = RATING_DESCRIPTIONS[currentDisplayRating] || RATING_DESCRIPTIONS[5];

  // Currently active topic chosen by student to respond to
  const activeStudentTopic =
    effectiveTopics.find((t) => t.id === selectedTopicId) ||
    topics.find((t) => t.id === selectedTopicId) ||
    effectiveTopics[0];

  // Student's previous answer for the currently selected topic (if any)
  const myPreviousAnswerForTopic = useMemo(() => {
    if (isTeacher) return null;
    return evaluations.find(
      (e) =>
        e.studentId === currentUser.id &&
        (e.topicId === selectedTopicId || (!e.topicId && selectedTopicId === 'general'))
    );
  }, [evaluations, currentUser.id, selectedTopicId, isTeacher]);

  // Keep form inputs synced when selecting a topic
  useEffect(() => {
    if (!isTeacher) {
      if (myPreviousAnswerForTopic) {
        setImprovementText(myPreviousAnswerForTopic.improvementText || '');
        setRecommendationText(myPreviousAnswerForTopic.recommendationText || '');
        setRatingStars(myPreviousAnswerForTopic.ratingStars || 5);
        setIsAnonymous(myPreviousAnswerForTopic.isAnonymous || false);
      } else {
        setImprovementText('');
        setRecommendationText('');
        setRatingStars(5);
        setIsAnonymous(false);
      }
    }
  }, [selectedTopicId, myPreviousAnswerForTopic, isTeacher]);

  // Helper to select topic and smoothly scroll to the answer form
  const selectTopicForStudent = (topicId: string, scrollToForm: boolean = true) => {
    setSelectedTopicId(topicId);
    setStudentViewMode('form');
    setShowSuccessCard(false);

    const prev = evaluations.find(
      (e) => e.studentId === currentUser.id && (e.topicId === topicId || (!e.topicId && topicId === 'general'))
    );
    if (prev) {
      setImprovementText(prev.improvementText || '');
      setRecommendationText(prev.recommendationText || '');
      setRatingStars(prev.ratingStars || 5);
      setIsAnonymous(prev.isAnonymous || false);
    } else {
      setImprovementText('');
      setRecommendationText('');
      setRatingStars(5);
      setIsAnonymous(false);
    }

    if (scrollToForm) {
      setTimeout(() => {
        const formEl =
          document.getElementById('student-reflection-unified-section') ||
          document.getElementById('student-reflection-form');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const ta =
            formEl.querySelector<HTMLTextAreaElement>('#student-answer-textarea') ||
            formEl.querySelector<HTMLTextAreaElement>('textarea');
          if (ta) ta.focus();
        }
      }, 50);
    }
  };

  // Inline answering helpers for question cards
  const handleToggleInlineReply = (topic: TeacherReflectionTopic) => {
    if (inlineReplyingTopicId === topic.id) {
      setInlineReplyingTopicId(null);
      return;
    }
    const prev = evaluations.find(
      (e) => e.studentId === currentUser.id && (e.topicId === topic.id || (!e.topicId && topic.id === 'general'))
    );
    setInlineReplyingTopicId(topic.id);
    setSelectedTopicId(topic.id);
    if (prev) {
      setInlineAnswerText(prev.improvementText || '');
      setInlineRecommendation(prev.recommendationText || '');
      setInlineRatingStars(prev.ratingStars || 5);
      setInlineIsAnonymous(prev.isAnonymous || false);
    } else {
      setInlineAnswerText('');
      setInlineRecommendation('');
      setInlineRatingStars(5);
      setInlineIsAnonymous(false);
    }
  };

  const handleInlineSubmit = (topic: TeacherReflectionTopic) => {
    const trimmed = inlineAnswerText.trim();
    if (!trimmed) {
      alert('กรุณาพิมพ์คำตอบของคุณก่อนกดส่งนะจ๊ะ');
      return;
    }

    const prev = evaluations.find(
      (e) => e.studentId === currentUser.id && (e.topicId === topic.id || (!e.topicId && topic.id === 'general'))
    );

    const newEval: TeacherEvaluation = {
      id: prev?.id || 'eval-' + Date.now(),
      topicId: topic.id,
      topicTitle: topic.title,
      assessmentType: topic.assessmentType,
      teacherId: topic.teacherId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.classRoom,
      studentNo: currentUser.studentNo,
      studentAvatar: currentUser.avatar,
      ratingStars: inlineRatingStars,
      improvementText: trimmed,
      recommendationText: inlineRecommendation.trim(),
      submittedAt: new Date().toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      isAnonymous: inlineIsAnonymous,
      teacherReply: prev?.teacherReply,
      teacherRepliedAt: prev?.teacherRepliedAt,
    };

    onSubmitEvaluation(newEval);
    onAwardStars(30, 'ตอบคำถามมุมสะท้อนถึงคุณครู (+30 ⭐)');
    triggerFestiveConfetti();
    setInlineReplyingTopicId(null);
    setInlineAnswerText('');
    setShowSuccessCard(true);
  };

  // Handle Quick Question Post by Teacher
  const handleQuickPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPostTitle.trim() || !quickPostPrompt.trim() || !onCreateTopic) return;

    const newTopic: TeacherReflectionTopic = {
      id: 'topic-' + Date.now(),
      assessmentType: quickPostAssessmentType,
      title: quickPostTitle.trim(),
      promptQuestion: quickPostPrompt.trim(),
      targetClass: quickPostClass.trim() || 'ทุกห้อง',
      authorTeacher: currentUser.name || 'คุณครู',
      teacherId: currentUser.id,
      teacherAvatar: currentUser.avatar || 'teacher-female-glasses',
      createdAt: new Date().toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      pinned: quickPostPinned,
    };

    onCreateTopic(newTopic);
    setQuickPostTitle('');
    setQuickPostPrompt('');
    setQuickPostPinned(false);
    triggerFestiveConfetti();
  };

  // Student submit answer to teacher's question
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = improvementText.trim();
    if (!trimmed) {
      alert('กรุณาพิมพ์คำตอบของคุณต่อคำถามก่อนกดส่งนะจ๊ะ');
      return;
    }

    const matchedTopic =
      effectiveTopics.find((t) => t.id === selectedTopicId) ||
      topics.find((t) => t.id === selectedTopicId) ||
      defaultSelectedTopic ||
      fallbackGeneralTopic;

    const newEval: TeacherEvaluation = {
      id: myPreviousAnswerForTopic?.id || 'eval-' + Date.now(),
      topicId: matchedTopic ? matchedTopic.id : undefined,
      topicTitle: matchedTopic ? matchedTopic.title : 'สะท้อนคิดทั่วไป',
      assessmentType: matchedTopic?.assessmentType,
      teacherId: matchedTopic?.teacherId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.classRoom,
      studentNo: currentUser.studentNo,
      studentAvatar: currentUser.avatar,
      ratingStars,
      improvementText: trimmed,
      recommendationText: recommendationText.trim(),
      submittedAt: new Date().toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      isAnonymous,
      teacherReply: myPreviousAnswerForTopic?.teacherReply,
      teacherRepliedAt: myPreviousAnswerForTopic?.teacherRepliedAt,
    };

    onSubmitEvaluation(newEval);
    onAwardStars(30, 'ตอบคำถามมุมสะท้อนถึงคุณครู (+30 ⭐)');
    triggerFestiveConfetti();
    setShowSuccessCard(true);
  };

  const handleSendReply = (evalId: string) => {
    if (!replyTextInput.trim() || !onTeacherReply) return;

    onTeacherReply(evalId, replyTextInput.trim());
    setReplyingEvalId(null);
    setReplyTextInput('');
    triggerFestiveConfetti();
  };

  const handleTogglePinTopic = (topic: TeacherReflectionTopic) => {
    if (onUpdateTopic) {
      onUpdateTopic({
        ...topic,
        pinned: !topic.pinned,
      });
      triggerStarBurst();
    }
  };

  const availableClasses = Array.from(
    new Set(evaluations.map((e) => e.studentClass).filter(Boolean))
  ).sort();

  // Filter evaluations
  const filteredEvaluations = evaluations.filter((item) => {
    const matchSearch =
      item.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      item.improvementText.toLowerCase().includes(searchStudent.toLowerCase()) ||
      item.recommendationText.toLowerCase().includes(searchStudent.toLowerCase()) ||
      item.studentClass.toLowerCase().includes(searchStudent.toLowerCase());

    const matchClass =
      classFilter === 'all' || item.studentClass === classFilter || item.studentClass.includes(classFilter);

    let matchRating = true;
    if (ratingFilter === '5') matchRating = item.ratingStars === 5;
    else if (ratingFilter === '4') matchRating = item.ratingStars === 4;
    else if (ratingFilter === '3_lower') matchRating = item.ratingStars <= 3;

    let matchTopic = true;
    if (selectedTopicFilter !== 'all') {
      matchTopic = item.topicId === selectedTopicFilter;
    }

    return matchSearch && matchClass && matchRating && matchTopic;
  });

  // Filtered posts for student community wall
  const studentFilteredPosts = useMemo(() => {
    return evaluations.filter((item) => {
      if (studentFeedTab === 'mine' && item.studentId !== currentUser.id) return false;
      if (studentFeedTab === 'replied' && !item.teacherReply) return false;
      if (studentFeedTopicFilter !== 'all' && item.topicId !== studentFeedTopicFilter) return false;
      if (studentFeedSearch.trim()) {
        const q = studentFeedSearch.toLowerCase();
        const match =
          item.studentName.toLowerCase().includes(q) ||
          (item.improvementText || '').toLowerCase().includes(q) ||
          (item.recommendationText || '').toLowerCase().includes(q) ||
          (item.topicTitle || '').toLowerCase().includes(q) ||
          (item.teacherReply || '').toLowerCase().includes(q) ||
          (item.studentClass || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [evaluations, studentFeedTab, studentFeedTopicFilter, studentFeedSearch, currentUser.id]);

  const avgRating =
    evaluations.length > 0
      ? (evaluations.reduce((acc, curr) => acc + curr.ratingStars, 0) / evaluations.length).toFixed(1)
      : '0.0';

  const count5Star = evaluations.filter((e) => e.ratingStars === 5).length;
  const count4Star = evaluations.filter((e) => e.ratingStars === 4).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FCE7F3] sketch-border rounded-[22px_14px_24px_16px] p-5 md:p-6 shadow-[5px_5px_0px_#18181b] relative overflow-hidden">
        <div className="washi-tape top-[-6px] left-8 rotate-[-3deg] bg-yellow-200" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-300 sketch-border rounded-[12px_16px_10px_14px] flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000]">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-zinc-900">
                  {isTeacher
                    ? '4. มุมสะท้อนความคิด: ครูโพสต์คำถาม & ตอบกลับนักเรียน'
                    : '4. มุมสะท้อนความคิด'}
                </h2>
                {isTeacher && (
                  <span className="bg-amber-300 text-stone-900 font-medium text-xs px-2.5 py-0.5 rounded-full border border-amber-500">
                    สำหรับคุณครู
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm font-semibold text-zinc-700 mt-0.5">
                {isTeacher
                  ? 'คุณครูสามารถเปิดกระดานขาวสนทนาสด หรือดูประวัติบทสนทนาที่ผ่านมาและตอบกลับนักเรียนได้ทันที'
                  : 'กระดานขาวสนทนาสด ร่วมแลกเปลี่ยนความคิดเห็นและส่งรูปภาพกับคุณครูและเพื่อนๆ ในชั้นเรียน'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isTeacher && onOpenGoogleSheets && (
              <button
                type="button"
                onClick={onOpenGoogleSheets}
                className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-black rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer hover:translate-y-[-1px] transition-all"
                title="ซิงค์ข้อมูลมุมสะท้อนความคิดไปยัง Google Sheets"
              >
                <GoogleSheetsIcon className="w-4 h-4" />
                <span>Google Sheets</span>
              </button>
            )}

            {isTeacher && (
              <div className="text-xs bg-white/90 px-3.5 py-2 rounded-xl border-2 border-zinc-900 font-bold text-zinc-800 shadow-[2px_2px_0px_#000] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>ความสุขการเรียน: ⭐ {avgRating} ({evaluations.length} คำตอบ)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIVE WHITEBOARD (กระดานขาวสนทนาสด พร้อมส่งรูปภาพและตอบพร้อมกันหลายคน) */}
      {onStartWhiteboardSession && onEndWhiteboardSession && onDeleteWhiteboardSession && onSendWhiteboardMessage && onDeleteWhiteboardMessage && (
        <LiveWhiteboard
          currentUser={currentUser}
          sessions={whiteboardSessions}
          messages={whiteboardMessages}
          onStartSession={onStartWhiteboardSession}
          onEndSession={onEndWhiteboardSession}
          onDeleteSession={onDeleteWhiteboardSession}
          onClearAllEndedSessions={onClearAllWhiteboardSessions}
          onSendMessage={onSendWhiteboardMessage}
          onDeleteMessage={onDeleteWhiteboardMessage}
          onUpdateSession={onUpdateWhiteboardSession}
          onEditMessage={onEditWhiteboardMessage}
          availableClasses={
            availableClasses.length > 0
              ? availableClasses
              : currentUser.teachingClasses && currentUser.teachingClasses.length > 0
              ? currentUser.teachingClasses
              : ['ห้อง 1', 'ห้อง 2', 'ห้อง 3']
          }
        />
      )}

      {/* TEACHER DASHBOARD: VIEW STUDENT REPLIES & REPLY BACK */}
      {isTeacher && (
        <div className="space-y-4">
          {/* Header & Filter Bar */}
          <div className="bg-white sketch-border rounded-[18px_12px_16px_14px] p-4 shadow-[4px_4px_0px_#18181b] flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="ค้นหาชื่อนักเรียน หรือคำตอบ..."
                className="w-full bg-zinc-50 pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Topic Filter */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-300 text-xs font-bold">
                <span className="px-2 text-zinc-500">เลือกคำถาม:</span>
                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="bg-white px-2 py-1 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 max-w-[200px]"
                >
                  <option value="all">ทุกคำถาม ({evaluations.length})</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-300 text-xs font-bold overflow-x-auto">
                <span className="px-2 text-zinc-500">ห้อง:</span>
                <button
                  type="button"
                  onClick={() => setClassFilter('all')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    classFilter === 'all'
                      ? 'bg-zinc-900 text-white font-black'
                      : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  ทั้งหมด
                </button>
                {availableClasses.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setClassFilter(cls)}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      classFilter === cls
                        ? 'bg-purple-600 text-white font-black'
                        : 'text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>

              {/* Reveal Anonymous Names Toggle for Teacher */}
              <button
                type="button"
                onClick={() => setRevealAnonymousForTeacher((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[1.5px_1.5px_0px_#000] transition-colors shrink-0 ${
                  revealAnonymousForTeacher
                    ? 'bg-amber-300 hover:bg-amber-400 text-zinc-950 border-zinc-900'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-400'
                }`}
                title="เปิด/ปิดการแสดงข้อมูลนักเรียนที่ส่งแบบไม่ระบุตัวตน"
              >
                <span>{revealAnonymousForTeacher ? '👁️ ครูเปิดดูข้อมูลจริง' : '🎭 ซ่อนข้อมูลตามที่นักเรียนส่ง'}</span>
              </button>
            </div>
          </div>

          {/* Student Answers List */}
          {filteredEvaluations.length === 0 ? (
            <div className="bg-white sketch-border rounded-[22px_16px_20px_18px] p-8 text-center shadow-[4px_4px_0px_#18181b]">
              <div className="text-4xl mb-2">💬</div>
              <h4 className="font-black text-zinc-800 text-base">
                ยังไม่มีคำตอบจากนักเรียนในเงื่อนไขที่เลือก
              </h4>
              <p className="text-xs text-zinc-500 font-semibold mt-1">
                เมื่อนักเรียนกดส่งคำตอบ จะปรากฏขึ้นที่นี่แบบเรียลไทม์
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-black text-zinc-700 px-1">
                <span>
                  แสดงคำตอบจากนักเรียน: {filteredEvaluations.length} รายการ
                  {selectedTopicFilter !== 'all' && ' (กรองเฉพาะคำถามนี้)'}
                </span>
              </div>

              {filteredEvaluations.map((item) => {
                const isReplying = replyingEvalId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-white sketch-border rounded-[22px_16px_20px_18px] p-5 md:p-6 shadow-[5px_5px_0px_#18181b] space-y-4 relative"
                  >
                    {/* Header: Student Info & Question Tag */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-zinc-200">
                      <div className="flex items-center gap-3">
                        {item.isAnonymous ? (
                          <div className="w-12 h-12 rounded-2xl bg-sky-50 border-2 border-sky-400 flex items-center justify-center text-2xl shadow-[2px_2px_0px_#0284c7]">
                            🎭
                          </div>
                        ) : (
                          <AvatarDisplay avatar={item.studentAvatar} className="w-12 h-12" />
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.isAnonymous ? (
                              <>
                                <span className="text-xs font-black bg-sky-100 text-sky-950 px-2.5 py-0.5 rounded-full border border-sky-400 flex items-center gap-1">
                                  <span>🎭</span>
                                  <span>ส่งแบบไม่ระบุตัวตน</span>
                                </span>
                                <span className="text-xs font-black bg-white text-sky-900 px-2 py-0.5 rounded-md border border-sky-300">
                                  ห้อง {item.studentClass} {item.studentNo ? `เลขที่ ${item.studentNo}` : ''}
                                </span>
                              </>
                            ) : (
                              <h4 className="text-base font-black text-zinc-900">
                                {item.studentName}
                              </h4>
                            )}
                            {!item.isAnonymous && (
                              <span className="text-[11px] font-black bg-sky-50 text-sky-950 px-2 py-0.5 rounded border border-sky-200">
                                ห้อง {item.studentClass} {item.studentNo ? `เลขที่ ${item.studentNo}` : ''}
                              </span>
                            )}
                            {item.topicTitle && (
                              <span className="text-[11px] font-bold bg-purple-100 text-purple-950 px-2.5 py-0.5 rounded-full border border-purple-300 flex items-center gap-1">
                                <span>📌 คำถาม:</span>
                                <span className="truncate max-w-[200px]">{item.topicTitle}</span>
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            ส่งคำตอบเมื่อ: {item.submittedAt}
                          </span>
                        </div>
                      </div>

                      {/* Actions & Rating */}
                      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                        {item.ratingStars && (
                          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-300 text-xs font-bold text-amber-900">
                            <span>⭐</span>
                            <span>{item.ratingStars}/5 ดาว</span>
                          </div>
                        )}

                        {item.isAnonymous && (
                          <button
                            type="button"
                            onClick={() => setInspectingAuthorEval(item)}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white text-xs font-black rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
                            title="ตรวจสอบข้อมูลห้องและเลขที่"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ดูข้อมูล</span>
                          </button>
                        )}

                        {onDeleteEvaluation && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-300 cursor-pointer"
                            title="ลบคำตอบนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content: THE STUDENT'S ANSWER (PROMINENT) */}
                    <div className="space-y-3">
                      <div className="p-4 bg-sky-50/80 rounded-2xl border-2 border-sky-300 space-y-1.5">
                        <div className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                          <span>💬</span>
                          <span>คำตอบของนักเรียน:</span>
                        </div>
                        <p className="text-sm md:text-base font-semibold text-zinc-900 leading-relaxed whitespace-pre-wrap pl-2">
                          "{item.improvementText}"
                        </p>
                      </div>

                      {item.recommendationText && (
                        <div className="p-3 bg-pink-50/80 rounded-xl border border-pink-200 text-xs font-semibold text-pink-950 flex items-start gap-2">
                          <span className="text-base shrink-0">💌</span>
                          <div>
                            <span className="font-black text-pink-900 block">ข้อความเพิ่มเติม / กำลังใจถึงคุณครู:</span>
                            <span className="italic">"{item.recommendationText}"</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Teacher Reply Section */}
                    {item.teacherReply ? (
                      <div className="p-3.5 bg-purple-50 rounded-xl border-2 border-purple-400 space-y-1">
                        <div className="flex items-center justify-between text-xs font-black text-purple-950">
                          <span className="flex items-center gap-1">
                            <span>👩‍🏫</span>
                            <span>คุณครูตอบกลับนักเรียนแล้ว:</span>
                          </span>
                          {item.teacherRepliedAt && (
                            <span className="text-[10px] font-semibold text-purple-700">
                              {item.teacherRepliedAt}
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-purple-950 italic pl-5">
                          "{item.teacherReply}"
                        </p>
                      </div>
                    ) : (
                      <div className="pt-1">
                        {isReplying ? (
                          <div className="p-3 bg-purple-50 rounded-xl border-2 border-purple-400 space-y-2">
                            <label className="block text-xs font-black text-purple-950">
                              พิมพ์ข้อความตอบกลับ {item.studentName}:
                            </label>
                            <textarea
                              rows={2}
                              value={replyTextInput}
                              onChange={(e) => setReplyTextInput(e.target.value)}
                              placeholder="เช่น ขอบคุณสำหรับคำตอบนะจ๊ะ ตอบได้ตรงประเด็นและมีความคิดสร้างสรรค์มาก..."
                              className="w-full bg-white p-2.5 rounded-xl sketch-input text-xs font-semibold"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingEvalId(null);
                                  setReplyTextInput('');
                                }}
                                className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-lg cursor-pointer"
                              >
                                ยกเลิก
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendReply(item.id)}
                                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-lg sketch-btn flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>ส่งคำตอบกลับ</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingEvalId(item.id);
                              setReplyTextInput('');
                            }}
                            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-purple-100 text-zinc-800 hover:text-purple-950 text-xs font-bold rounded-lg border border-zinc-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>พิมพ์ตอบกลับนักเรียนคนนี้</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONFIRM DELETE EVALUATION MODAL */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={true}
          title="ยืนยันการลบคำตอบนี้?"
          itemName={`คำตอบของ ${deleteTarget.studentName}`}
          itemType="คำตอบของนักเรียน"
          description="เมื่อลบคำตอบนี้แล้ว จะไม่สามารถกู้คืนได้"
          onConfirm={() => {
            if (onDeleteEvaluation) onDeleteEvaluation(deleteTarget.id);
            setDeleteTarget(null);
            triggerStarBurst();
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* TEACHER INSPECT ANONYMOUS AUTHOR MODAL */}
      {inspectedAuthorEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white sketch-border-lg rounded-[26px_18px_24px_20px] p-6 max-w-lg w-full relative shadow-[8px_8px_0px_#18181b] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-200">
              <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                <span>🎭 ข้อมูลนักเรียนที่ส่งแบบไม่ระบุตัวตน</span>
              </h3>
              <button
                type="button"
                onClick={() => setInspectingAuthorEval(null)}
                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-sky-50 rounded-xl border border-sky-300 space-y-2">
              <div className="flex items-center gap-3">
                <AvatarDisplay avatar={inspectedAuthorEval.studentAvatar} className="w-12 h-12" />
                <div>
                  <h4 className="font-black text-sm text-sky-950">
                    ชื่อจริง: {inspectedAuthorEval.studentName}
                  </h4>
                  <p className="text-xs font-bold text-sky-800">
                    ห้อง {inspectedAuthorEval.studentClass}{' '}
                    {inspectedAuthorEval.studentNo ? `เลขที่ ${inspectedAuthorEval.studentNo}` : ''}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    ส่งเมื่อ: {inspectedAuthorEval.submittedAt}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-800">
              <span className="font-black text-zinc-900 block mb-1">คำตอบของนักเรียน:</span>
              "{inspectedAuthorEval.improvementText}"
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingAuthorEval(null)}
                className="px-4 py-2 bg-zinc-900 text-white font-black text-xs rounded-xl"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
