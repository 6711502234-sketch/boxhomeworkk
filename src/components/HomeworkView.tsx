import React, { useState } from 'react';
import { UserProfile, Homework, HomeworkStatus, AssignmentTask, StudentRecord } from '../types';
import { AvatarDisplay } from './DoodleAvatars';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { triggerFestiveConfetti, triggerStarBurst } from '../utils/confetti';
import {
  UploadCloud,
  FileText,
  Link as LinkIcon,
  PlusCircle,
  ExternalLink,
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  X,
  Save,
  Trash2,
  Paperclip,
  Check,
  Sparkles,
  PackageCheck,
  MessageSquare,
  Filter,
  Award,
  UserCheck,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  Send,
  Eye,
  CheckSquare,
  Users,
  UserX,
  FileCheck,
  Download,
  Image as ImageIcon,
  Copy,
  Globe,
  Smartphone,
  Laptop
} from 'lucide-react';
import {
  ContentLinkViewerModal,
  normalizeExternalUrl,
  detectPlatform,
  copyToClipboardSafely
} from './ContentLinkViewerModal';
import { compressImageFile } from '../utils/storage';

interface HomeworkViewProps {
  currentUser: UserProfile;
  homeworkList: Homework[];
  assignmentTasks: AssignmentTask[];
  studentRecords?: StudentRecord[];
  onCreateAssignmentTask?: (task: AssignmentTask) => void;
  onUpdateAssignmentTask?: (task: AssignmentTask) => void;
  onDeleteAssignmentTask?: (id: string) => void;
  onSubmitHomework: (homework: Homework) => void;
  onUpdateHomework: (updated: Homework) => void;
  onDeleteHomework: (id: string) => void;
  onAwardStars: (amount: number, reason: string) => void;
}

export const HomeworkView: React.FC<HomeworkViewProps> = ({
  currentUser,
  homeworkList,
  assignmentTasks = [],
  studentRecords = [],
  onCreateAssignmentTask,
  onUpdateAssignmentTask,
  onDeleteAssignmentTask,
  onSubmitHomework,
  onUpdateHomework,
  onDeleteHomework,
  onAwardStars,
}) => {
  const isTeacher = currentUser.role === 'teacher';

  // Sub-tab selection:
  // For Teacher: 'tasks' (ชิ้นงานที่โพสต์มอบหมาย) vs 'submissions' (ตรวจงานและกรอกคะแนน)
  // For Student: 'tasks' (ชิ้นงานที่ได้รับมอบหมาย) vs 'submit' (ส่งผลงาน/ประวัติการส่ง)
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'submissions' | 'submit'>(
    isTeacher ? 'tasks' : 'tasks'
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'needs_fix'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [taskFilter, setTaskFilter] = useState<string>('all');

  // Inline Quick Score State for Teacher: { [homeworkId: string]: string | number }
  const [inlineScores, setInlineScores] = useState<Record<string, string>>({});
  const [savedFeedbackId, setSavedFeedbackId] = useState<string | null>(null);

  // --- Modal State: Task Submissions Roster & Inspector (For Teacher & Student) ---
  const [rosterModalTask, setRosterModalTask] = useState<AssignmentTask | null>(null);
  const [rosterSubTab, setRosterSubTab] = useState<'submitted' | 'pending'>('submitted');
  const [rosterSearch, setRosterSearch] = useState<string>('');

  // --- Modal State: Post/Edit Assignment Task (For Teacher) ---
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('วิทยาศาสตร์และเทคโนโลยี');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskTargetClass, setTaskTargetClass] = useState('ทุกห้อง');
  const [taskMaxScore, setTaskMaxScore] = useState<number>(10);
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAttachmentName, setTaskAttachmentName] = useState('');
  const [taskAttachmentLink, setTaskAttachmentLink] = useState('');
  const [taskAttachmentData, setTaskAttachmentData] = useState<string>('');
  const [taskAttachmentType, setTaskAttachmentType] = useState<string>('');
  const [taskAttachmentSize, setTaskAttachmentSize] = useState<string>('');
  const [taskRewardStars, setTaskRewardStars] = useState<number>(50);

  // --- Student Submission Form State ---
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState<string>('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('วิทยาศาสตร์และเทคโนโลยี');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileData, setAttachedFileData] = useState<string>('');
  const [attachedFileType, setAttachedFileType] = useState<string>('');
  const [attachedFileSize, setAttachedFileSize] = useState<string>('');

  // --- Detail / Grading Modal State ---
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [editingHomeworkTarget, setEditingHomeworkTarget] = useState<Homework | null>(null);
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('วิทยาศาสตร์และเทคโนโลยี');
  const [editDescription, setEditDescription] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editAttachedFile, setEditAttachedFile] = useState('');
  const [editAttachedData, setEditAttachedData] = useState<string>('');
  const [editAttachedType, setEditAttachedType] = useState<string>('');
  const [editAttachedSize, setEditAttachedSize] = useState<string>('');

  // Helper function to detect file type from name or mime
  const detectFileType = (fileName: string, mime?: string): 'pdf' | 'image' | 'docx' | 'other' => {
    const l = fileName.toLowerCase();
    if (l.endsWith('.pdf') || mime?.includes('pdf')) return 'pdf';
    if (l.endsWith('.png') || l.endsWith('.jpg') || l.endsWith('.jpeg') || l.endsWith('.webp') || mime?.startsWith('image/')) return 'image';
    if (l.endsWith('.docx') || l.endsWith('.doc') || mime?.includes('word') || mime?.includes('officedocument')) return 'docx';
    return 'other';
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Teacher grading inputs in modal
  const [teacherScoreInput, setTeacherScoreInput] = useState<number>(10);
  const [teacherCommentInput, setTeacherCommentInput] = useState<string>('ทำงานได้ยอดเยี่ยม ชัดเจน ครบถ้วนตามตัวชี้วัด!');
  const [teacherStatusInput, setTeacherStatusInput] = useState<HomeworkStatus>('reviewed');
  const [bonusStarsInput, setBonusStarsInput] = useState<number>(10);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    type: 'task' | 'homework';
  } | null>(null);

  // Content Link Viewer Modal State (multi-platform accessibility)
  const [linkViewerTarget, setLinkViewerTarget] = useState<{
    isOpen: boolean;
    title: string;
    url?: string;
    attachmentName?: string;
    attachmentData?: string;
    attachmentType?: string;
  }>({
    isOpen: false,
    title: '',
  });

  // Global toast notification for link copying
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const handleOpenLinkViewer = (
    url?: string,
    title: string = '',
    attachmentName?: string,
    attachmentData?: string,
    attachmentType?: string
  ) => {
    setLinkViewerTarget({
      isOpen: true,
      url: url ? normalizeExternalUrl(url) : undefined,
      title,
      attachmentName,
      attachmentData,
      attachmentType,
    });
  };

  const handleCopyLink = async (url: string) => {
    const norm = normalizeExternalUrl(url);
    const ok = await copyToClipboardSafely(norm);
    if (ok) {
      setCopyToast('คัดลอกลิงก์สำเร็จแล้ว! สามารถนำไปเปิดใน Chrome, Safari หรือแอปใดก็ได้');
      setTimeout(() => setCopyToast(null), 3000);
    }
  };

  // --------------------------------------------------------------------------
  // Handlers for Teacher Assignment Tasks
  // --------------------------------------------------------------------------
  const handleOpenCreateTaskModal = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskSubject('วิทยาศาสตร์และเทคโนโลยี');
    setTaskDescription('');
    setTaskTargetClass('ทุกห้อง');
    setTaskMaxScore(10);
    setTaskDueDate('15 ก.ย. 2569');
    setTaskAttachmentName('');
    setTaskAttachmentLink('');
    setTaskAttachmentData('');
    setTaskAttachmentType('');
    setTaskAttachmentSize('');
    setTaskRewardStars(50);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: AssignmentTask) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskSubject(task.subject);
    setTaskDescription(task.description);
    setTaskTargetClass(task.targetClass);
    setTaskMaxScore(task.maxScore);
    setTaskDueDate(task.dueDate);
    setTaskAttachmentName(task.attachmentName || '');
    setTaskAttachmentLink(task.attachmentLink || '');
    setTaskAttachmentData(task.attachmentData || '');
    setTaskAttachmentType(task.attachmentType || '');
    setTaskAttachmentSize(task.attachmentSize || '');
    setTaskRewardStars(task.rewardStars);
    setIsTaskModalOpen(true);
  };

  const handleTeacherTaskFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const type = detectFileType(file.name, file.type);
      const size = formatBytes(file.size);
      setTaskAttachmentName(file.name);
      setTaskAttachmentType(type);
      setTaskAttachmentSize(size);

      try {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImageFile(file);
          setTaskAttachmentData(compressed);
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setTaskAttachmentData(reader.result);
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.warn('File processing notice:', err);
      }
    }
  };

  const handleSaveAssignmentTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const cleanLink = taskAttachmentLink.trim() ? normalizeExternalUrl(taskAttachmentLink) : undefined;
    const cleanName = taskAttachmentName.trim() || (cleanLink ? 'สื่อการสอน / ลิงก์ใบงาน' : undefined);

    if (editingTaskId) {
      // Update existing task
      const existing = assignmentTasks.find((t) => t.id === editingTaskId);
      if (existing && onUpdateAssignmentTask) {
        const updated: AssignmentTask = {
          ...existing,
          title: taskTitle.trim(),
          subject: taskSubject.trim() || 'วิทยาศาสตร์และเทคโนโลยี',
          description: taskDescription.trim(),
          targetClass: taskTargetClass,
          maxScore: Number(taskMaxScore) || 10,
          dueDate: taskDueDate.trim() || 'ไม่มีกำหนด',
          attachmentName: cleanName,
          attachmentLink: cleanLink,
          attachmentData: taskAttachmentData || undefined,
          attachmentType: taskAttachmentType || (cleanName ? detectFileType(cleanName) : undefined),
          attachmentSize: taskAttachmentSize || undefined,
          rewardStars: Number(taskRewardStars) || 50,
        };
        onUpdateAssignmentTask(updated);
      }
    } else {
      // Create new task
      const newTask: AssignmentTask = {
        id: 'task-' + Date.now(),
        title: taskTitle.trim(),
        subject: taskSubject.trim() || 'วิทยาศาสตร์และเทคโนโลยี',
        description: taskDescription.trim(),
        targetClass: taskTargetClass,
        maxScore: Number(taskMaxScore) || 10,
        dueDate: taskDueDate.trim() || '15 ก.ย. 2569',
        createdAt: new Date().toLocaleDateString('th-TH', { dateStyle: 'medium' }),
        authorTeacher: currentUser.name,
        attachmentName: cleanName,
        attachmentLink: cleanLink,
        attachmentData: taskAttachmentData || undefined,
        attachmentType: taskAttachmentType || (cleanName ? detectFileType(cleanName) : undefined),
        attachmentSize: taskAttachmentSize || undefined,
        rewardStars: Number(taskRewardStars) || 50,
      };
      if (onCreateAssignmentTask) {
        onCreateAssignmentTask(newTask);
      }
      triggerFestiveConfetti();
    }

    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    const task = assignmentTasks.find((t) => t.id === taskId);
    setDeleteTarget({
      id: taskId,
      title: task ? task.title : 'ชิ้นงานที่มอบหมาย',
      type: 'task',
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'task') {
      if (onDeleteAssignmentTask) {
        onDeleteAssignmentTask(deleteTarget.id);
      }
    } else if (deleteTarget.type === 'homework') {
      if (onDeleteHomework) {
        onDeleteHomework(deleteTarget.id);
      }
      if (selectedHomework?.id === deleteTarget.id) {
        setSelectedHomework(null);
      }
    }
    setDeleteTarget(null);
  };

  // --------------------------------------------------------------------------
  // Handlers for Student Submissions
  // --------------------------------------------------------------------------
  const handleSelectTaskToSubmit = (task: AssignmentTask) => {
    setSelectedTaskForSubmission(task.id);
    setTitle(`ส่งผลงาน: ${task.title}`);
    setSubject(task.subject);
    setActiveSubTab('submit');
  };

  const handleStudentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const type = detectFileType(file.name, file.type);
      const size = formatBytes(file.size);
      setAttachedFileName(file.name);
      setAttachedFileType(type);
      setAttachedFileSize(size);

      try {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImageFile(file);
          setAttachedFileData(compressed);
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setAttachedFileData(reader.result);
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.warn('Student file upload processing notice:', err);
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedTask = assignmentTasks.find((t) => t.id === selectedTaskForSubmission);

    const newHw: Homework = {
      id: 'hw-' + Date.now(),
      taskId: selectedTaskForSubmission || undefined,
      title: title.trim(),
      subject: subject.trim() || matchedTask?.subject || 'วิทยาศาสตร์และเทคโนโลยี',
      description: description.trim() || 'ส่งการบ้านเรียบร้อยครับ/ค่ะ',
      link: link.trim(),
      attachedFileName: attachedFileName || (link ? 'ผลงาน_ลิงก์แนบ.url' : 'ไฟล์การบ้าน.pdf'),
      attachedFileData: attachedFileData || undefined,
      attachedFileType: attachedFileType || (attachedFileName ? detectFileType(attachedFileName) : undefined),
      attachedFileSize: attachedFileSize || undefined,
      submittedAt: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      updatedAt: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.classRoom,
      studentAvatar: currentUser.avatar,
      status: 'pending',
      maxScore: matchedTask?.maxScore || 10,
      earnedStars: matchedTask?.rewardStars || 50,
    };

    onSubmitHomework(newHw);
    onAwardStars(matchedTask?.rewardStars || 50, `ส่งชิ้นงาน: ${title} (+${matchedTask?.rewardStars || 50} ⭐)`);
    triggerFestiveConfetti();

    // Reset Form
    setTitle('');
    setDescription('');
    setLink('');
    setAttachedFileName('');
    setAttachedFileData('');
    setAttachedFileType('');
    setAttachedFileSize('');
    setSelectedTaskForSubmission('');
  };

  // --------------------------------------------------------------------------
  // Handlers for Teacher Score Entry (Direct Inline Input & Modal)
  // --------------------------------------------------------------------------
  const handleInlineScoreChange = (hwId: string, value: string) => {
    setInlineScores((prev) => ({
      ...prev,
      [hwId]: value,
    }));
  };

  const handleSaveInlineScore = (hw: Homework) => {
    const rawVal = inlineScores[hw.id];
    const scoreNum = rawVal !== undefined && rawVal !== '' ? Number(rawVal) : (hw.teacherScore ?? 10);
    const max = hw.maxScore || 10;
    const finalScore = Math.min(Math.max(0, scoreNum), max);

    const updated: Homework = {
      ...hw,
      teacherScore: finalScore,
      status: 'reviewed',
      teacherComment: hw.teacherComment || 'ครูตรวจและบันทึกคะแนนเรียบร้อยแล้ว ยอดเยี่ยมมาก!',
      updatedAt: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    onUpdateHomework(updated);
    setSavedFeedbackId(hw.id);
    setTimeout(() => setSavedFeedbackId(null), 2500);
    triggerStarBurst();
  };

  const openDetailModal = (hw: Homework) => {
    setSelectedHomework(hw);
    setIsEditingModal(false);
    setEditTitle(hw.title);
    setEditDescription(hw.description);
    setEditLink(hw.link);
    setEditAttachedFile(hw.attachedFileName || '');
    setTeacherScoreInput(hw.teacherScore ?? (hw.maxScore || 10));
    setTeacherCommentInput(hw.teacherComment || 'ทำงานได้เรียบร้อย ถูกต้องตามหลักการและตัวชี้วัดยอดเยี่ยมมาก!');
    setTeacherStatusInput(hw.status === 'needs_fix' ? 'needs_fix' : 'reviewed');
    setBonusStarsInput(10);
  };

  const handleTeacherGradeHomework = () => {
    if (!selectedHomework) return;

    const updated: Homework = {
      ...selectedHomework,
      status: teacherStatusInput,
      teacherScore: Number(teacherScoreInput),
      teacherComment: teacherCommentInput.trim(),
      earnedStars: selectedHomework.earnedStars + (teacherStatusInput === 'reviewed' ? bonusStarsInput : 0),
      updatedAt: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    onUpdateHomework(updated);
    setSelectedHomework(updated);
    triggerFestiveConfetti();
  };

  const handleSaveEditedHomework = () => {
    if (!selectedHomework || !editTitle.trim()) return;

    const updated: Homework = {
      ...selectedHomework,
      title: editTitle.trim(),
      description: editDescription.trim(),
      link: editLink.trim(),
      attachedFileName: editAttachedFile,
      updatedAt: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    onUpdateHomework(updated);
    setSelectedHomework(updated);
    setIsEditingModal(false);
  };

  // --- Student Edit Submitted Homework Handlers ---
  const handleOpenEditSubmission = (hw: Homework) => {
    setEditingHomeworkTarget(hw);
    setEditTitle(hw.title);
    setEditSubject(hw.subject);
    setEditDescription(hw.description);
    setEditLink(hw.link || '');
    setEditAttachedFile(hw.attachedFileName || '');
    setEditAttachedData(hw.attachedFileData || '');
    setEditAttachedType(hw.attachedFileType || (hw.attachedFileName ? detectFileType(hw.attachedFileName) : ''));
    setEditAttachedSize(hw.attachedFileSize || '');
  };

  const handleEditSubmissionFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const type = detectFileType(file.name, file.type);
      const size = formatBytes(file.size);
      setEditAttachedFile(file.name);
      setEditAttachedType(type);
      setEditAttachedSize(size);

      try {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImageFile(file);
          setEditAttachedData(compressed);
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setEditAttachedData(reader.result);
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.warn('Edit file upload notice:', err);
      }
    }
  };

  const handleSaveStudentEditedSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHomeworkTarget || !editTitle.trim()) return;

    // If teacher had marked it as 'needs_fix', revert to 'pending' upon student re-submission
    const nextStatus = editingHomeworkTarget.status === 'needs_fix' ? 'pending' : editingHomeworkTarget.status;

    const updated: Homework = {
      ...editingHomeworkTarget,
      title: editTitle.trim(),
      subject: editSubject.trim() || editingHomeworkTarget.subject,
      description: editDescription.trim(),
      link: editLink.trim(),
      attachedFileName: editAttachedFile || (editLink.trim() ? 'ผลงาน_ลิงก์แนบ.url' : undefined),
      attachedFileData: editAttachedData || undefined,
      attachedFileType: editAttachedType || (editAttachedFile ? detectFileType(editAttachedFile) : undefined),
      attachedFileSize: editAttachedSize || undefined,
      status: nextStatus,
      updatedAt: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    onUpdateHomework(updated);
    setEditingHomeworkTarget(null);
    triggerFestiveConfetti();
    setCopyToast('บันทึกการแก้ไขชิ้นงานเรียบร้อยแล้ว! ข้อมูลได้รับการอัปเดตแล้ว ✨');
    setTimeout(() => setCopyToast(null), 3500);
  };

  // Counts & Filter logic
  const pendingCount = homeworkList.filter((h) => h.status === 'pending').length;
  const reviewedCount = homeworkList.filter((h) => h.status === 'reviewed').length;
  const needsFixCount = homeworkList.filter((h) => h.status === 'needs_fix').length;

  const availableClasses = Array.from(
    new Set([
      ...homeworkList.map((h) => h.studentClass),
      ...studentRecords.map((s) => s.classRoom),
    ].filter(Boolean))
  ).sort();

  const filteredHomeworkList = homeworkList.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentClass.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchClass = classFilter === 'all' || item.studentClass === classFilter || item.studentClass.includes(classFilter);
    const matchTask = taskFilter === 'all' || item.taskId === taskFilter;

    return matchSearch && matchStatus && matchClass && (isTeacher ? true : item.studentId === currentUser.id || true);
  });

  const mySubmissions = homeworkList.filter((h) => h.studentId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="sketch-border rounded-[22px_14px_24px_16px] p-5 md:p-6 shadow-[5px_5px_0px_#18181b] relative overflow-hidden bg-[#FEF08A]"
      >
        <div className="washi-tape -top-2 left-12 rotate-[-2deg] bg-pink-200" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-amber-400 sketch-border rounded-[14px_10px_16px_12px] flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000]">
              {isTeacher ? '📦' : '📝'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-zinc-900">
                  {isTeacher
                    ? '1. เพิ่มชิ้นงาน (สามารถโพสต์งานให้นักเรียนทำได้)'
                    : '1. เพิ่มชิ้นงาน & ส่งภาระงานที่ได้รับมอบหมาย'}
                </h2>
                {isTeacher ? (
                  <span className="bg-purple-300 text-purple-950 font-black text-xs px-2.5 py-0.5 rounded-full border border-zinc-900 shadow-[1px_1px_0px_#000]">
                    โหมดคุณครูผู้สอน
                  </span>
                ) : (
                  <span className="bg-emerald-300 text-emerald-950 font-black text-xs px-2.5 py-0.5 rounded-full border border-zinc-900 shadow-[1px_1px_0px_#000]">
                    +50 ⭐ ทุกชิ้นงาน
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm font-semibold text-zinc-700 mt-0.5">
                {isTeacher
                  ? 'โพสต์ชิ้นงาน/ภาระงานใหม่ให้นักเรียนทำ ตรวจสอบงานที่ส่ง และกรอกคะแนนประเมินผลงานนักเรียน'
                  : 'ดูรายการชิ้นงานที่ครูโพสต์มอบหมาย แนบไฟล์ผลงาน/ลิงก์ส่งการบ้าน และติดตามคะแนนที่ครูตรวจ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isTeacher ? (
              <button
                type="button"
                onClick={handleOpenCreateTaskModal}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-xl sketch-btn flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_#18181b]"
              >
                <Plus className="w-4 h-4" />
                <span>➕ โพสต์ชิ้นงานใหม่</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border-2 border-zinc-900 text-xs font-bold shadow-[2px_2px_0px_#000]">
                <span>ชิ้นงานที่ครูมอบหมาย: {assignmentTasks.length} ชิ้น</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 border-b-2 border-zinc-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('tasks')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs md:text-sm border-2 border-zinc-900 flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'tasks'
              ? 'bg-amber-300 text-zinc-950 shadow-[3px_3px_0px_#18181b] translate-y-[-2px]'
              : 'bg-white text-zinc-700 hover:bg-amber-50 shadow-[1px_1px_0px_#000]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isTeacher ? '➕ เพิ่มชิ้นงาน (โพสต์งานให้นักเรียนทำ)' : '📋 ชิ้นงานที่ได้รับมอบหมาย'}</span>
          <span className="bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            {assignmentTasks.length}
          </span>
        </button>

        {isTeacher ? (
          <button
            type="button"
            onClick={() => setActiveSubTab('submissions')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs md:text-sm border-2 border-zinc-900 flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'submissions'
                ? 'bg-amber-300 text-zinc-950 shadow-[3px_3px_0px_#18181b] translate-y-[-2px]'
                : 'bg-white text-zinc-700 hover:bg-amber-50 shadow-[1px_1px_0px_#000]'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>📝 ตรวจการบ้าน & กรอกคะแนน</span>
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                {pendingCount} รอตรวจ
              </span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveSubTab('submit')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs md:text-sm border-2 border-zinc-900 flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'submit'
                ? 'bg-amber-300 text-zinc-950 shadow-[3px_3px_0px_#18181b] translate-y-[-2px]'
                : 'bg-white text-zinc-700 hover:bg-amber-50 shadow-[1px_1px_0px_#000]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>📤 ส่งผลงาน & ประวัติการส่งของฉัน</span>
            <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              ส่งแล้ว {mySubmissions.length}
            </span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ASSIGNMENT TASKS LIST (ทั้งครูและนักเรียน) */}
      {/* ========================================================================= */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/70 p-3.5 rounded-xl border border-amber-300 text-xs font-semibold text-zinc-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {isTeacher
                  ? 'คุณครูสามารถกดปุ่ม "➕ โพสต์ชิ้นงานใหม่" ด้านบนเพื่อมอบหมายภาระงาน ใบงาน หรือโครงงานให้นักเรียนทำได้'
                  : 'เลือกชิ้นงานที่ต้องการทำ จากนั้นกดปุ่ม "📤 ส่งชิ้นงานนี้" เพื่อแนบไฟล์หรือลิงก์ผลงาน'}
              </span>
            </div>
          </div>

          {assignmentTasks.length === 0 ? (
            <div className="bg-white sketch-border rounded-[22px_16px_20px_18px] p-10 text-center shadow-[4px_4px_0px_#18181b]">
              <div className="text-5xl mb-3">📋</div>
              <h4 className="text-lg font-black text-zinc-900">ยังไม่มีชิ้นงานที่โพสต์มอบหมาย</h4>
              <p className="text-xs font-semibold text-zinc-500 mt-1">
                {isTeacher ? 'กดปุ่มด้านบนเพื่อเริ่มโพสต์งานชิ้นแรก' : 'รอคุณครูโพสต์มอบหมายงานใหม่'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignmentTasks.map((task) => {
                const submissionsForTask = homeworkList.filter((h) => h.taskId === task.id);
                const isSubmittedByMe = mySubmissions.some((h) => h.taskId === task.id);
                const mySubmissionItem = mySubmissions.find((h) => h.taskId === task.id);

                return (
                  <div
                    key={task.id}
                    className="bg-white sketch-border rounded-[20px_14px_18px_16px] p-5 shadow-[4px_4px_0px_#18181b] flex flex-col justify-between hover:translate-y-[-2px] transition-all relative"
                  >
                    <div className="space-y-2.5">
                      {/* Tags & Class */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-950 border border-zinc-900">
                          {task.subject}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          <span className="bg-purple-100 text-purple-950 px-2 py-0.5 rounded border border-purple-300">
                            🏫 {task.targetClass}
                          </span>
                          <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded border border-emerald-400 font-black">
                            ⭐ +{task.rewardStars}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-zinc-900 leading-snug">
                        {task.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs font-semibold text-zinc-600 line-clamp-3">
                        {task.description}
                      </p>

                      {/* Details Box */}
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-[11px] font-bold text-zinc-700 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-zinc-600">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" /> กำหนดส่ง:
                          </span>
                          <span className="font-black text-rose-600">{task.dueDate}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-zinc-600">
                            <Award className="w-3.5 h-3.5 text-amber-500" /> คะแนนเต็ม:
                          </span>
                          <span className="font-black text-zinc-900">{task.maxScore} คะแนน</span>
                        </div>

                      </div>

                      {/* Learning Materials & Content Link (Accessible on Any Platform) */}
                      {(task.attachmentLink || task.attachmentData || task.attachmentName) && (() => {
                        const platform = detectPlatform(task.attachmentLink, task.attachmentName);
                        const normalizedLink = task.attachmentLink ? normalizeExternalUrl(task.attachmentLink) : '';
                        return (
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 via-sky-50/50 to-white border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-zinc-200 pb-1.5">
                              <span className="flex items-center gap-1.5 text-xs font-black text-zinc-900">
                                <Paperclip className="w-3.5 h-3.5 text-amber-700" />
                                <span>สื่อการสอน/ลิงก์เนื้อหาที่ครูแนบ:</span>
                              </span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${platform.badgeBg} ${platform.textColor} ${platform.borderColor}`}>
                                {platform.icon} {platform.name}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 text-xs font-bold text-zinc-800">
                              <span className="truncate" title={task.attachmentName || 'สื่อการสอนจากคุณครู'}>
                                📄 {task.attachmentName || 'ลิงก์สื่อการสอน/ใบงาน'}
                              </span>
                              {task.attachmentSize && (
                                <span className="text-[10px] text-zinc-500 font-normal shrink-0">
                                  ({task.attachmentSize})
                                </span>
                              )}
                            </div>

                            {/* Multi-Platform Action Buttons: 100% accessible on any device */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              {normalizedLink && (
                                <>
                                  <a
                                    href={normalizedLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 min-w-[130px] px-2.5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl sketch-btn flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#18181b] cursor-pointer transition-transform active:scale-95"
                                    title="กดเพื่อเปิดดูเนื้อหาในแท็บใหม่ เปิดได้ทุกแพลตฟอร์ม"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                    <span>เปิดดูเนื้อหา ↗</span>
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenLinkViewer(
                                        task.attachmentLink,
                                        task.title,
                                        task.attachmentName,
                                        task.attachmentData,
                                        task.attachmentType
                                      )
                                    }
                                    className="px-2.5 py-2 bg-white hover:bg-amber-100 text-zinc-900 font-bold text-xs rounded-xl border-2 border-zinc-900 shadow-[1.5px_1.5px_0px_#18181b] flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                                    title="เปิดดูตัวอย่างเนื้อหาในระบบ"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                                    <span>ดูในแอป</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleCopyLink(normalizedLink)}
                                    className="p-2 bg-white hover:bg-zinc-100 text-zinc-800 rounded-xl border-2 border-zinc-900 shadow-[1.5px_1.5px_0px_#18181b] cursor-pointer transition-transform active:scale-95"
                                    title="คัดลอกลิงก์ไปเปิดในเบราว์เซอร์หรือแอปอื่น"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {task.attachmentData && (
                                <a
                                  href={task.attachmentData}
                                  download={task.attachmentName || 'ใบงานที่ครูมอบหมาย'}
                                  className="flex-1 min-w-[130px] px-2.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl sketch-btn flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#18181b] cursor-pointer transition-transform active:scale-95"
                                >
                                  <Download className="w-3.5 h-3.5 shrink-0" />
                                  <span>ดาวน์โหลดไฟล์</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-3 border-t-2 border-zinc-100 flex items-center justify-between gap-2">
                      {isTeacher ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRosterModalTask(task);
                              setRosterSubTab('submitted');
                              setRosterSearch('');
                            }}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#18181b]"
                            title="คลิกเพื่อดูรายชื่อนักเรียนที่ส่งงานและเข้าไปดูผลงาน"
                          >
                            <Eye className="w-4 h-4" />
                            <span>ดูชิ้นงาน ({submissionsForTask.length} คนส่ง)</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditTaskModal(task)}
                              className="p-2 bg-amber-100 hover:bg-amber-200 text-zinc-800 rounded-xl border border-zinc-400 cursor-pointer shadow-[1px_1px_0px_#000]"
                              title="แก้ไขชิ้นงาน"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl border border-rose-300 cursor-pointer shadow-[1px_1px_0px_#000]"
                              title="ลบชิ้นงาน"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {isSubmittedByMe ? (
                            <div className="flex flex-wrap items-center justify-between w-full gap-2">
                              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> ส่งแล้ว
                                {mySubmissionItem?.teacherScore !== undefined && (
                                  <span>({mySubmissionItem.teacherScore}/{task.maxScore} คะแนน)</span>
                                )}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {mySubmissionItem && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditSubmission(mySubmissionItem)}
                                    className="px-2.5 py-1 bg-amber-300 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-lg border border-zinc-900 shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5"
                                    title="แก้ไขชิ้นงานที่ส่งไปแล้ว"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>แก้ไขงาน</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setActiveSubTab('submit')}
                                  className="text-xs font-bold text-sky-700 hover:underline cursor-pointer"
                                >
                                  ดูงานที่ส่ง ↗
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelectTaskToSubmit(task)}
                              className="w-full py-2 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black text-xs rounded-xl sketch-btn flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>📤 ส่งชิ้นงานนี้ (+{task.rewardStars} ⭐)</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TEACHER SUBMISSIONS BOARD WITH DIRECT SCORE INPUT FIELDS */}
      {/* ========================================================================= */}
      {isTeacher && activeSubTab === 'submissions' && (
        <div className="space-y-4">
          {/* Teacher Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div
              onClick={() => setStatusFilter('all')}
              className={`p-3.5 rounded-[18px_12px_16px_14px] border-2 border-zinc-900 cursor-pointer transition-all ${
                statusFilter === 'all'
                  ? 'bg-amber-300 shadow-[4px_4px_0px_#18181b] translate-y-[-2px]'
                  : 'bg-white shadow-[2px_2px_0px_#000] hover:bg-amber-50'
              }`}
            >
              <div className="text-xs font-bold text-zinc-600">ผลงานทั้งหมด</div>
              <div className="text-2xl font-black text-zinc-950 mt-0.5">{homeworkList.length} งาน</div>
            </div>

            <div
              onClick={() => setStatusFilter('pending')}
              className={`p-3.5 rounded-[18px_12px_16px_14px] border-2 border-zinc-900 cursor-pointer transition-all ${
                statusFilter === 'pending'
                  ? 'bg-sky-300 shadow-[4px_4px_0px_#18181b] translate-y-[-2px]'
                  : 'bg-white shadow-[2px_2px_0px_#000] hover:bg-sky-50'
              }`}
            >
              <div className="text-xs font-bold text-sky-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> รอการตรวจ
              </div>
              <div className="text-2xl font-black text-sky-950 mt-0.5">{pendingCount} งาน</div>
            </div>

            <div
              onClick={() => setStatusFilter('reviewed')}
              className={`p-3.5 rounded-[18px_12px_16px_14px] border-2 border-zinc-900 cursor-pointer transition-all ${
                statusFilter === 'reviewed'
                  ? 'bg-emerald-300 shadow-[4px_4px_0px_#18181b] translate-y-[-2px]'
                  : 'bg-white shadow-[2px_2px_0px_#000] hover:bg-emerald-50'
              }`}
            >
              <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> ตรวจเรียบร้อย
              </div>
              <div className="text-2xl font-black text-emerald-950 mt-0.5">{reviewedCount} งาน</div>
            </div>

            <div
              onClick={() => setStatusFilter('needs_fix')}
              className={`p-3.5 rounded-[18px_12px_16px_14px] border-2 border-zinc-900 cursor-pointer transition-all ${
                statusFilter === 'needs_fix'
                  ? 'bg-orange-300 shadow-[4px_4px_0px_#18181b] translate-y-[-2px]'
                  : 'bg-white shadow-[2px_2px_0px_#000] hover:bg-orange-50'
              }`}
            >
              <div className="text-xs font-bold text-orange-800 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> ส่งกลับแก้ไข
              </div>
              <div className="text-2xl font-black text-orange-950 mt-0.5">{needsFixCount} งาน</div>
            </div>
          </div>

          {/* Filter Bar for Teacher */}
          <div className="bg-white sketch-border rounded-[18px_12px_16px_14px] p-4 shadow-[4px_4px_0px_#18181b] flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่องาน หรือชื่อนักเรียน..."
                className="w-full bg-zinc-50 pl-9 pr-3 py-2 rounded-xl border border-zinc-300 focus:border-zinc-900 text-xs font-semibold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Task filter */}
              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="bg-zinc-100 px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-800"
              >
                <option value="all">📋 ทุกชิ้นงานที่มอบหมาย</option>
                {assignmentTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title.substring(0, 30)}...
                  </option>
                ))}
              </select>

              {/* Class Filter */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-300 text-xs font-bold overflow-x-auto">
                <span className="px-2 text-zinc-500">ห้อง:</span>
                <button
                  type="button"
                  onClick={() => setClassFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    classFilter === 'all' ? 'bg-zinc-900 text-white font-black' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  ทั้งหมด
                </button>
                {availableClasses.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setClassFilter(cls)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      classFilter === cls ? 'bg-purple-600 text-white font-black' : 'text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-300 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'all' ? 'bg-zinc-900 text-white font-black' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'pending' ? 'bg-sky-600 text-white font-black' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  รอตรวจ
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('reviewed')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'reviewed' ? 'bg-emerald-600 text-white font-black' : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  ตรวจแล้ว
                </button>
              </div>
            </div>
          </div>

          {/* Teacher Submissions List with Inline Editable Score Input Fields */}
          {filteredHomeworkList.length === 0 ? (
            <div className="bg-white sketch-border rounded-[22px_16px_20px_18px] p-10 text-center shadow-[4px_4px_0px_#18181b]">
              <div className="text-5xl mb-3">📭</div>
              <h4 className="text-lg font-black text-zinc-900">ไม่พบรายการผลงานตามเงื่อนไขที่เลือก</h4>
              <p className="text-xs font-semibold text-zinc-500 mt-1">ลองเปลี่ยนคำค้นหาหรือรีเซ็ตตัวกรองสถานะ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHomeworkList.map((hw) => {
                const currentScoreVal =
                  inlineScores[hw.id] !== undefined
                    ? inlineScores[hw.id]
                    : hw.teacherScore !== undefined
                    ? hw.teacherScore
                    : '';
                const max = hw.maxScore || 10;
                const isSaved = savedFeedbackId === hw.id;

                return (
                  <div
                    key={hw.id}
                    className="bg-white hover:bg-amber-50/30 sketch-border rounded-[20px_14px_18px_16px] p-5 shadow-[4px_4px_0px_#18181b] transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-950 border border-zinc-900">
                          {hw.subject}
                        </span>

                        {hw.status === 'reviewed' ? (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-950 border border-emerald-500 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                            ตรวจแล้ว: ได้ {hw.teacherScore ?? 10}/{max} คะแนน
                          </span>
                        ) : hw.status === 'needs_fix' ? (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-950 border border-orange-500 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-orange-700" /> รอให้นักเรียนแก้ไข
                          </span>
                        ) : (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-950 border border-sky-500 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-sky-700" /> รอคุณครูตรวจ
                          </span>
                        )}

                        <span className="text-xs font-bold text-zinc-500">
                          ส่งเมื่อ: {hw.submittedAt}
                        </span>
                      </div>

                      <h4 className="text-base md:text-lg font-black text-zinc-900">
                        {hw.title}
                      </h4>

                      <p className="text-xs md:text-sm font-semibold text-zinc-600">
                        {hw.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-bold text-zinc-700">
                        <div className="bg-zinc-100 px-2.5 py-1 rounded-xl border border-zinc-300 flex items-center gap-2">
                          <AvatarDisplay avatar={hw.studentAvatar} className="w-6 h-6" />
                          <span>{hw.studentName} ({hw.studentClass})</span>
                        </div>

                        {hw.link && (
                          <a
                            href={hw.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-700 hover:underline flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-300 font-bold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> เปิดดูผลงาน/ลิงก์
                          </a>
                        )}

                        {hw.attachedFileName && (
                          hw.attachedFileData ? (
                            <a
                              href={hw.attachedFileData}
                              download={hw.attachedFileName}
                              className="text-zinc-800 hover:text-black flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-xl border border-zinc-300 font-bold transition-colors cursor-pointer"
                              title="คลิกเพื่อดาวน์โหลดไฟล์แนบ"
                            >
                              {hw.attachedFileType === 'image' || hw.attachedFileName.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                              ) : hw.attachedFileType === 'pdf' || hw.attachedFileName.toLowerCase().endsWith('.pdf') ? (
                                <FileText className="w-3.5 h-3.5 text-rose-600" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              )}
                              <span className="truncate max-w-[140px]">{hw.attachedFileName}</span>
                              <Download className="w-3 h-3 text-zinc-500" />
                            </a>
                          ) : (
                            <span className="text-zinc-600 flex items-center gap-1 bg-zinc-100 px-2.5 py-1 rounded-xl border border-zinc-300">
                              <FileText className="w-3.5 h-3.5" /> {hw.attachedFileName}
                            </span>
                          )
                        )}
                      </div>

                      {/* Attached Image Thumbnail on Card */}
                      {(hw.attachedFileType === 'image' || hw.attachedFileName?.match(/\.(jpg|jpeg|png|webp)$/i)) && hw.attachedFileData && (
                        <div className="pt-1">
                          <img
                            src={hw.attachedFileData}
                            alt="ภาพตัวอย่าง"
                            className="max-h-24 w-auto rounded-lg border border-zinc-200 object-contain bg-white"
                          />
                        </div>
                      )}

                      {/* Teacher Comment */}
                      {hw.teacherComment && (
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-950">
                          <span className="font-bold">💬 คำติชมของครู:</span> "{hw.teacherComment}"
                        </div>
                      )}
                    </div>

                    {/* Right: Direct Editable Score Input Field & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-end sm:items-center lg:items-end gap-3 shrink-0 w-full lg:w-auto bg-amber-50/70 p-3.5 rounded-2xl border-2 border-amber-300">
                      <div className="w-full">
                        <label className="block text-[11px] font-black text-zinc-800 mb-1">
                          ✏️ ช่องกรอกคะแนน (คะแนนเต็ม {max}):
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={max}
                            step="0.5"
                            value={currentScoreVal}
                            onChange={(e) => handleInlineScoreChange(hw.id, e.target.value)}
                            placeholder={`0-${max}`}
                            className="w-20 px-2 py-1.5 bg-white border-2 border-zinc-900 rounded-xl text-center font-black text-sm focus:bg-yellow-50 focus:ring-2 focus:ring-purple-400"
                          />
                          <span className="text-xs font-bold text-zinc-600">/ {max}</span>
                          <button
                            type="button"
                            onClick={() => handleSaveInlineScore(hw)}
                            className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black text-xs rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>บันทึก</span>
                          </button>
                        </div>
                        {isSaved && (
                          <span className="text-[10px] font-black text-emerald-700 mt-1 flex items-center gap-0.5 animate-bounce">
                            <Check className="w-3 h-3" /> บันทึกคะแนนสำเร็จ!
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => openDetailModal(hw)}
                          className="flex-1 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl sketch-btn flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#18181b]"
                        >
                          <Eye className="w-4 h-4" />
                          <span>🔍 เข้าไปดูชิ้นงาน & ตรวจละเอียด</span>
                        </button>
                        {isTeacher && (
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                id: hw.id,
                                title: `${hw.title} (${hw.studentName})`,
                                type: 'homework',
                              })
                            }
                            className="p-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl border border-rose-300 cursor-pointer shadow-[2px_2px_0px_#000] shrink-0"
                            title="ลบผลงานนี้"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ========================================================================= */}
      {/* VIEW 3: STUDENT SUBMISSION FORM & MY SUBMISSIONS */}
      {/* ========================================================================= */}
      {!isTeacher && activeSubTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left Form: Submit New Work */}
          <div className="lg:col-span-6 xl:col-span-5 bg-white sketch-border rounded-[22px_16px_20px_18px] p-4 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="text-base sm:text-lg font-black text-zinc-900">แบบฟอร์มส่งชิ้นงาน</h3>
              </div>
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-400 shrink-0">
                +50 ⭐
              </span>
            </div>

            {/* If an assignment task is selected, show Teacher's Assignment Details Prominently */}
            {(() => {
              const matchedTask = assignmentTasks.find((item) => item.id === selectedTaskForSubmission);
              if (!matchedTask) return null;
              return (
                <div className="bg-gradient-to-br from-amber-50/95 via-yellow-50/90 to-orange-50/80 rounded-2xl border-2 border-amber-400 p-3.5 sm:p-4 shadow-[3px_3px_0px_#18181b] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-amber-200/90 pb-2">
                    <span className="text-xs font-black bg-amber-300 text-amber-950 px-2.5 py-0.5 rounded-lg border border-amber-500 shadow-[1px_1px_0px_#000] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-900" />
                      วิชา: {matchedTask.subject}
                    </span>
                    <span className="text-xs font-black text-rose-700 bg-white px-2.5 py-0.5 rounded-full border border-rose-300 shadow-2xs flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-rose-600" />
                      กำหนดส่ง: {matchedTask.dueDate}
                    </span>
                  </div>

                  {/* Title of Assignment ordered by Teacher */}
                  <div>
                    <div className="text-[11px] font-black text-amber-900 mb-0.5 flex items-center gap-1">
                      <span>📌 หัวข้อการบ้านที่คุณครูสั่ง:</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-zinc-950 leading-snug break-words">
                      {matchedTask.title}
                    </h4>
                  </div>

                  {/* Full Description & Instructions ordered by Teacher */}
                  <div className="bg-white/95 rounded-xl border border-amber-300 p-3 shadow-2xs space-y-1">
                    <div className="text-xs font-black text-amber-950 flex items-center gap-1.5 mb-0.5">
                      <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>รายละเอียดและข้อกำหนดที่ครูสั่งการบ้าน:</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-zinc-800 leading-relaxed whitespace-pre-line break-words pl-0.5">
                      {matchedTask.description}
                    </p>
                  </div>

                  {/* Scores & Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-zinc-700">
                    <span className="bg-white px-2 py-0.5 rounded-lg border border-zinc-300 shadow-2xs">
                      🎯 คะแนนเต็ม: <strong className="text-zinc-950">{matchedTask.maxScore}</strong> คะแนน
                    </span>
                    <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-300 shadow-2xs font-black">
                      ⭐ รางวัลส่งงาน: +{matchedTask.rewardStars || 50} ดาว
                    </span>
                    {matchedTask.authorTeacher && (
                      <span className="bg-white px-2 py-0.5 rounded-lg border border-zinc-300 shadow-2xs">
                        👨‍🏫 ครูผู้สั่ง: <strong className="text-zinc-900">{matchedTask.authorTeacher}</strong>
                      </span>
                    )}
                    {matchedTask.targetClass && (
                      <span className="bg-white px-2 py-0.5 rounded-lg border border-zinc-300 shadow-2xs">
                        🏫 ห้อง: <strong>{matchedTask.targetClass}</strong>
                      </span>
                    )}
                  </div>

                  {/* Teacher's Learning Material & Content Link Banner */}
                  {(matchedTask.attachmentName || matchedTask.attachmentLink || matchedTask.attachmentData) && (() => {
                    const platform = detectPlatform(matchedTask.attachmentLink, matchedTask.attachmentName);
                    const normalizedLink = matchedTask.attachmentLink ? normalizeExternalUrl(matchedTask.attachmentLink) : '';
                    return (
                      <div className="p-3 bg-white/95 rounded-xl border-2 border-amber-400 shadow-2xs space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-xs font-black text-zinc-900 flex items-center gap-1.5 min-w-0">
                            <Paperclip className="w-4 h-4 text-amber-700 shrink-0" />
                            <span className="shrink-0">สื่อการสอน/ลิงก์เนื้อหาจากครู:</span>
                            <span className="font-black text-zinc-950 truncate">
                              {matchedTask.attachmentName || 'เอกสารประกอบและลิงก์ใบงาน'}
                            </span>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${platform.badgeBg} ${platform.textColor} ${platform.borderColor}`}>
                            {platform.icon} {platform.name}
                          </span>
                        </div>

                        {/* Action buttons allowing students on ANY platform to open or copy */}
                        <div className="flex flex-wrap items-center gap-2">
                          {normalizedLink && (
                            <>
                              <a
                                href={normalizedLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-[140px] px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl sketch-btn flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-transform active:scale-95"
                              >
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                <span>เปิดดูเนื้อหาในแท็บใหม่ ↗</span>
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenLinkViewer(
                                    matchedTask.attachmentLink,
                                    matchedTask.title,
                                    matchedTask.attachmentName,
                                    matchedTask.attachmentData,
                                    matchedTask.attachmentType
                                  )
                                }
                                className="px-3 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl border-2 border-zinc-900 shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-900" />
                                <span>ดูในหน้านี้</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(normalizedLink)}
                                className="p-2 bg-white hover:bg-zinc-100 text-zinc-800 rounded-xl border-2 border-zinc-900 shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-transform active:scale-95"
                                title="คัดลอกลิงก์"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {matchedTask.attachmentData && (
                            <a
                              href={matchedTask.attachmentData}
                              download={matchedTask.attachmentName || 'ใบงานที่ครูมอบหมาย'}
                              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl sketch-btn flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-transform active:scale-95"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>ดาวน์โหลดใบงาน</span>
                            </a>
                          )}
                        </div>
                        <div className="text-[10px] font-semibold text-zinc-500">
                          💡 รองรับการเปิดดูบนมือถือ iPhone, iPad, Android และคอมพิวเตอร์ทุกเครื่อง
                        </div>
                      </div>
                    );
                  })()}

                  {/* Option to clear and pick another */}
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/70">
                    <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> ผูกกับชิ้นงานนี้เรียบร้อย
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTaskForSubmission('');
                        setTitle('');
                        setSubject('');
                      }}
                      className="text-[11px] font-black text-rose-700 hover:text-rose-900 underline cursor-pointer"
                    >
                      เปลี่ยนการบ้าน / ส่งงานทั่วไป
                    </button>
                  </div>
                </div>
              );
            })()}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              {/* Select Task Dropdown */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  📌 เลือกชิ้นงานที่ต้องการส่ง:
                </label>
                <select
                  value={selectedTaskForSubmission}
                  onChange={(e) => {
                    setSelectedTaskForSubmission(e.target.value);
                    const t = assignmentTasks.find((item) => item.id === e.target.value);
                    if (t) {
                      setTitle(`ส่งผลงาน: ${t.title}`);
                      setSubject(t.subject);
                    }
                  }}
                  className="w-full min-h-[44px] bg-amber-50/70 p-2.5 rounded-xl border-2 border-zinc-900 text-xs sm:text-sm font-bold cursor-pointer"
                >
                  <option value="">-- เลือกจากชิ้นงานที่ครูมอบหมาย (หรือส่งงานทั่วไป) --</option>
                  {assignmentTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.subject} - กำหนดส่ง: {t.dueDate})
                    </option>
                  ))}
                </select>
              </div>

              {/* If NO task is selected yet, provide a quick preview list of all assignment tasks */}
              {!selectedTaskForSubmission && assignmentTasks.length > 0 && (
                <div className="bg-amber-50/50 p-3 sm:p-3.5 rounded-2xl border-2 border-amber-300 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>เลือกการบ้านที่ครูสั่งไว้ เพื่อแสดงหัวข้อและรายละเอียด:</span>
                    </span>
                    <span className="text-[11px] font-bold bg-amber-200 px-2 py-0.5 rounded-md border border-amber-400 shrink-0">
                      {assignmentTasks.length} ชิ้นงาน
                    </span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {assignmentTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTaskForSubmission(t.id);
                          setTitle(`ส่งผลงาน: ${t.title}`);
                          setSubject(t.subject);
                        }}
                        className="bg-white hover:bg-amber-100/70 p-2.5 sm:p-3 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] cursor-pointer transition-all hover:translate-y-[-1px] space-y-1"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-zinc-900 line-clamp-1">
                            📌 {t.title}
                          </span>
                          <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded border border-amber-400 shrink-0">
                            {t.subject}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-zinc-600 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-bold text-zinc-500 pt-1 border-t border-zinc-100">
                          <span className="text-rose-600">📅 ส่ง: {t.dueDate}</span>
                          <div className="flex items-center gap-1.5">
                            {(t.attachmentLink || t.attachmentData) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenLinkViewer(
                                    t.attachmentLink,
                                    t.title,
                                    t.attachmentName,
                                    t.attachmentData,
                                    t.attachmentType
                                  );
                                }}
                                className="text-[10px] font-black text-sky-900 bg-sky-100 hover:bg-sky-200 px-2 py-0.5 rounded-md border border-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
                                title="คลิกเพื่อเปิดดูลิงก์สื่อการสอนของครู"
                              >
                                <ExternalLink className="w-2.5 h-2.5 text-sky-700" />
                                <span>ดูสื่อการสอน/ลิงก์ครู 👁️</span>
                              </button>
                            )}
                            <span className="text-emerald-700 font-black flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> เลือกชิ้นงานนี้
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  หัวข้อ / ชื่องานที่ส่ง <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น รายงานการวิเคราะห์ระบบแบตเตอรี่ EV..."
                  className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-bold sketch-input"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">วิชา / กลุ่มสาระ</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-bold sketch-input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">คำอธิบายสรุป / บันทึกถึงคุณครู</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="สรุปแนวคิด หรือสิ่งที่จะนำเสนอให้คุณครูทราบ..."
                  className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-semibold sketch-input"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">แนบลิงก์ผลงาน (Google Drive / ลิงก์ผลงาน / URL)</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-zinc-50 pl-9 pr-3 py-2 rounded-xl border-2 border-zinc-900 text-xs font-semibold sketch-input"
                  />
                </div>
              </div>

              {/* File Attachment (PDF, JPG, PNG, DOCX) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-700">
                    แนบไฟล์ผลงาน (รองรับ PDF, JPG, PNG, DOCX):
                  </label>
                  {attachedFileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFileName('');
                        setAttachedFileData('');
                        setAttachedFileType('');
                        setAttachedFileSize('');
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> ลบไฟล์แนบ
                    </button>
                  )}
                </div>

                {!attachedFileName ? (
                  <label className="bg-zinc-50 hover:bg-zinc-100 p-3 rounded-xl border-2 border-dashed border-zinc-400 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer transition-colors">
                    <Paperclip className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span>คลิกเลือกไฟล์ชิ้นงาน (PDF, JPG, PNG, DOCX)...</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.doc,application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleStudentFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="p-3 bg-white rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] space-y-2">
                    <div className="flex items-center gap-2">
                      {attachedFileType === 'image' || attachedFileName.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-black border border-sky-300">
                          JPG / PNG
                        </span>
                      ) : attachedFileType === 'pdf' || attachedFileName.toLowerCase().endsWith('.pdf') ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300">
                          PDF
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black border border-indigo-300">
                          DOCX
                        </span>
                      )}

                      <span className="text-xs font-bold text-zinc-800 truncate flex-1">{attachedFileName}</span>
                      {attachedFileSize && (
                        <span className="text-[11px] font-semibold text-zinc-500 shrink-0">{attachedFileSize}</span>
                      )}
                    </div>

                    {/* Image thumbnail preview if image */}
                    {(attachedFileType === 'image' || attachedFileName.match(/\.(jpg|jpeg|png|webp)$/i)) && attachedFileData && (
                      <div className="max-h-36 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center p-1">
                        <img src={attachedFileData} alt="ภาพตัวอย่างผลงาน" className="max-h-32 w-auto object-contain rounded" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-sm rounded-xl sketch-btn flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#18181b]"
              >
                <Send className="w-4 h-4" />
                <span>ส่งชิ้นงานเข้ากล่องการบ้าน (+50 ⭐)</span>
              </button>
            </form>
          </div>

          {/* Right: My Submitted Works with Scores */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3.5 sm:p-4 rounded-xl sketch-border shadow-[3px_3px_0px_#000]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3 className="text-sm sm:text-base font-black text-zinc-900">
                  ประวัติการส่งชิ้นงานของฉัน ({mySubmissions.length} รายการ)
                </h3>
              </div>
              <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-300">
                นักเรียน: {currentUser.name}
              </span>
            </div>

            {mySubmissions.length === 0 ? (
              <div className="bg-white sketch-border rounded-[22px_16px_20px_18px] p-6 sm:p-8 text-center shadow-[4px_4px_0px_#18181b]">
                <div className="text-4xl mb-2">📭</div>
                <h4 className="text-base font-black text-zinc-900">คุณยังไม่ได้ส่งชิ้นงานใดๆ</h4>
                <p className="text-xs font-semibold text-zinc-500 mt-1 max-w-md mx-auto">
                  เลือกหัวข้อการบ้านจากรายการด้านซ้าย หรือเลือกจากแท็บ "ชิ้นงานที่ได้รับมอบหมาย" เพื่อดูรายละเอียดและส่งงาน
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mySubmissions.map((hw) => {
                  return (
                    <div
                      key={hw.id}
                      className="bg-white sketch-border rounded-[18px_14px_16px_14px] p-3.5 sm:p-4 shadow-[3px_3px_0px_#18181b] space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-950 border border-zinc-900">
                          {hw.subject}
                        </span>

                        {hw.status === 'reviewed' ? (
                          <span className="text-xs font-black px-3 py-1 rounded-lg bg-emerald-100 text-emerald-950 border-2 border-emerald-500 flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                            ครูตรวจแล้ว: ได้ {hw.teacherScore ?? 10}/{hw.maxScore || 10} คะแนน ⭐
                          </span>
                        ) : hw.status === 'needs_fix' ? (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-950 border border-orange-500 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-orange-700" /> รอให้นักเรียนแก้ไข
                          </span>
                        ) : (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-950 border border-sky-500 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-sky-700" /> รอคุณครูตรวจและให้คะแนน
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-zinc-900 break-words">{hw.title}</h4>
                      <p className="text-xs font-semibold text-zinc-600 break-words leading-relaxed">{hw.description}</p>

                      {/* Teacher's Original Assignment Topic & Details if matched */}
                      {(() => {
                        const originalTask = assignmentTasks.find((t) => t.id === hw.taskId) ||
                          assignmentTasks.find((t) => hw.title.includes(t.title) || t.title.includes(hw.title.replace('ส่งผลงาน:', '').trim()));
                        if (!originalTask) return null;
                        return (
                          <div className="bg-amber-50/90 rounded-xl border border-amber-300 p-3 text-xs space-y-1.5 shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-1 text-amber-950 font-black">
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span>หัวข้อที่ครูสั่ง: <strong className="text-zinc-950">{originalTask.title}</strong></span>
                              </span>
                              <span className="text-[11px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                                📅 กำหนดส่ง: {originalTask.dueDate}
                              </span>
                            </div>
                            <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200">
                              <div className="text-[11px] font-black text-amber-900 mb-0.5 flex items-center gap-1">
                                <FileText className="w-3 h-3 text-amber-700 shrink-0" /> รายละเอียดคำสั่งที่ครูสั่งการบ้าน:
                              </div>
                              <p className="text-zinc-800 font-semibold text-xs leading-relaxed whitespace-pre-line break-words">
                                {originalTask.description}
                              </p>
                            </div>
                            {/* Teacher's Attachment in My Submissions */}
                            {(originalTask.attachmentLink || originalTask.attachmentData || originalTask.attachmentName) && (() => {
                              const p = detectPlatform(originalTask.attachmentLink, originalTask.attachmentName);
                              const nLink = originalTask.attachmentLink ? normalizeExternalUrl(originalTask.attachmentLink) : '';
                              return (
                                <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200 space-y-1.5">
                                  <div className="flex flex-wrap items-center justify-between gap-1">
                                    <span className="text-[11px] font-black text-amber-950 flex items-center gap-1">
                                      <Paperclip className="w-3 h-3 text-amber-700 shrink-0" /> สื่อการสอน/ลิงก์ที่ครูแนบ:
                                    </span>
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${p.badgeBg} ${p.textColor} ${p.borderColor}`}>
                                      {p.icon} {p.name}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    {nLink && (
                                      <>
                                        <a
                                          href={nLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[11px] font-black bg-sky-500 hover:bg-sky-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                                        >
                                          <ExternalLink className="w-3 h-3" /> เปิดลิงก์เนื้อหา ↗
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOpenLinkViewer(
                                              originalTask.attachmentLink,
                                              originalTask.title,
                                              originalTask.attachmentName,
                                              originalTask.attachmentData,
                                              originalTask.attachmentType
                                            )
                                          }
                                          className="text-[11px] font-bold bg-white hover:bg-zinc-100 text-zinc-900 px-2 py-1 rounded-lg border border-zinc-300 flex items-center gap-1 cursor-pointer"
                                        >
                                          <Eye className="w-3 h-3 text-amber-700" /> ดูในระบบ
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleCopyLink(nLink)}
                                          className="text-[11px] font-bold bg-white hover:bg-zinc-100 text-zinc-800 p-1 rounded-lg border border-zinc-300 cursor-pointer"
                                          title="คัดลอกลิงก์"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                      </>
                                    )}
                                    {originalTask.attachmentData && (
                                      <a
                                        href={originalTask.attachmentData}
                                        download={originalTask.attachmentName || 'เอกสารประกอบ'}
                                        className="text-[11px] font-black bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                                      >
                                        <Download className="w-3 h-3" /> ดาวน์โหลดไฟล์
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            {originalTask.authorTeacher && (
                              <div className="text-[11px] font-bold text-zinc-500 pt-0.5 flex items-center gap-1">
                                <span>👨‍🏫 คุณครูผู้สั่ง: {originalTask.authorTeacher}</span>
                                {originalTask.targetClass && <span>• 🏫 ห้อง: {originalTask.targetClass}</span>}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-zinc-600">
                        <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                          📅 ส่งเมื่อ: {hw.submittedAt}
                        </span>
                        {hw.link && (
                          <div className="flex items-center gap-1">
                            <a
                              href={normalizeExternalUrl(hw.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-700 hover:underline flex items-center gap-1 bg-sky-50 px-2 py-0.5 rounded border border-sky-300 break-all text-xs font-bold"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" /> เปิดดูลิงก์ที่แนบ ↗
                            </a>
                            <button
                              type="button"
                              onClick={() => handleOpenLinkViewer(hw.link, hw.title, 'ลิงก์ผลงานที่แนบ')}
                              className="p-1 text-zinc-600 hover:text-zinc-900 bg-white rounded border border-zinc-300 cursor-pointer"
                              title="ดูตัวอย่างลิงก์ในระบบ"
                            >
                              <Eye className="w-3 h-3 text-amber-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(hw.link!)}
                              className="p-1 text-zinc-600 hover:text-zinc-900 bg-white rounded border border-zinc-300 cursor-pointer"
                              title="คัดลอกลิงก์"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {hw.attachedFileName && (
                          <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300 flex items-center gap-1 max-w-full truncate">
                            <FileText className="w-3 h-3 shrink-0" /> <span className="truncate">{hw.attachedFileName}</span>
                          </span>
                        )}
                        {hw.updatedAt && hw.updatedAt !== hw.submittedAt && (
                          <span className="bg-sky-100 text-sky-900 border border-sky-300 px-2 py-0.5 rounded text-[11px] font-black flex items-center gap-1">
                            🔄 แก้ไขล่าสุด: {hw.updatedAt}
                          </span>
                        )}
                      </div>

                      {/* Teacher Comment */}
                      {hw.teacherComment && (
                        <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-xs font-semibold text-emerald-950 space-y-1 mt-2">
                          <div className="font-black flex items-center gap-1 text-emerald-900">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0" /> คำติชมและข้อเสนอแนะจากคุณครู:
                          </div>
                          <p className="whitespace-pre-line break-words">"{hw.teacherComment}"</p>
                        </div>
                      )}

                      {/* Student Action Bar: Edit Submitted Work & Delete */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200/80 mt-1">
                        <div className="text-[11px] font-semibold text-zinc-500">
                          {hw.status === 'needs_fix' ? (
                            <span className="text-orange-700 font-black flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> ครูแนะนำให้ปรับปรุงชิ้นงานนี้
                            </span>
                          ) : hw.status === 'reviewed' ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> ตรวจแล้ว (สามารถแก้ไขข้อมูลเพิ่มเติมได้)
                            </span>
                          ) : (
                            <span className="text-sky-700 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> แก้ไขข้อมูลหรือเปลี่ยนไฟล์แนบได้ตลอดก่อนครูตรวจ
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSubmission(hw)}
                            className="px-3.5 py-1.5 bg-amber-300 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] border border-zinc-900 transition-transform active:translate-y-0.5"
                            title="แก้ไขชิ้นงานที่ส่งไปแล้ว"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>✏️ แก้ไขชิ้นงานนี้</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                id: hw.id,
                                title: hw.title,
                                type: 'homework',
                              })
                            }
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 font-bold text-xs rounded-xl border border-rose-200 cursor-pointer shadow-2xs"
                            title="ลบผลงานนี้เพื่อส่งใหม่"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: TEACHER POST / EDIT ASSIGNMENT TASK */}
      {/* ========================================================================= */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white sketch-border rounded-[24px_16px_22px_18px] p-6 max-w-xl w-full shadow-[8px_8px_0px_#18181b] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <h3 className="text-lg font-black text-zinc-900">
                  {editingTaskId ? 'แก้ไขชิ้นงานที่มอบหมาย' : '➕ โพสต์ชิ้นงานใหม่ให้นักเรียนทำ'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1.5 hover:bg-zinc-100 rounded-full border border-zinc-300 cursor-pointer"
              >
                <X className="w-5 h-5 text-zinc-700" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignmentTask} className="space-y-3.5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  หัวข้อ / ชื่อภาระงาน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="เช่น ใบงานที่ 3: การประยุกต์ใช้กฎการอนุรักษ์พลังงาน..."
                  className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-bold sketch-input"
                />
              </div>

              {/* Subject & Target Class */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold text-zinc-800 mb-1">วิชา / กลุ่มสาระ</label>
                  <input
                    type="text"
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-bold sketch-input"
                  />
                </div>

                <div className="sm:col-span-7">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-zinc-800">
                      ห้องเรียนเป้าหมาย (ระบุเลขห้องได้)
                    </label>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                      ระบุเลข 1, 2, 3... ได้
                    </span>
                  </div>
                  <input
                    type="text"
                    list="task-targetclass-list"
                    value={taskTargetClass}
                    onChange={(e) => setTaskTargetClass(e.target.value)}
                    placeholder="พิมพ์เลขห้อง เช่น 1, 2, 3 หรือ ทุกห้อง..."
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-bold sketch-input"
                  />
                  <datalist id="task-targetclass-list">
                    <option value="ทุกห้อง" />
                    <option value="ห้อง 1" />
                    <option value="ห้อง 2" />
                    <option value="ห้อง 3" />
                    <option value="ห้อง 4" />
                    <option value="ห้อง 5" />
                    <option value="ห้อง 6" />
                  </datalist>

                  {/* Quick room number selection buttons */}
                  <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-0.5">
                    <span className="text-[10px] font-bold text-zinc-500 shrink-0">เลือกด่วน:</span>
                    {['ทุกห้อง', '1', '2', '3', '4', '5', '6'].map((num) => {
                      const val = num === 'ทุกห้อง' ? 'ทุกห้อง' : `ห้อง ${num}`;
                      const isSelected = taskTargetClass === val || taskTargetClass === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setTaskTargetClass(val)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-black border transition-all cursor-pointer shrink-0 ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-700 shadow-2xs'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900 hover:bg-purple-50'
                          }`}
                        >
                          {num === 'ทุกห้อง' ? 'ทุกห้อง' : `ห้อง ${num}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  คำสั่ง / คำชี้แจงและเกณฑ์การประเมิน
                </label>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="ระบุสิ่งที่ให้นักเรียนทำ รูปแบบการส่ง และเกณฑ์การให้คะแนน..."
                  className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-semibold sketch-input"
                />
              </div>

              {/* Max Score & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">คะแนนเต็ม</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={taskMaxScore}
                    onChange={(e) => setTaskMaxScore(Number(e.target.value))}
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-black sketch-input text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">กำหนดส่ง</label>
                  <input
                    type="text"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    placeholder="เช่น 15 ก.ย. 2569"
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-bold sketch-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">ดาวรางวัลเมื่อส่ง</label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={taskRewardStars}
                    onChange={(e) => setTaskRewardStars(Number(e.target.value))}
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-black sketch-input text-center"
                  />
                </div>
              </div>

              {/* Attachments (PDF, JPG, PNG, DOCX) & Link */}
              <div className="space-y-2 bg-zinc-50 p-3.5 rounded-xl border-2 border-zinc-300">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-zinc-800">
                    📎 แนบเอกสารใบงาน หรือ วางลิงก์สื่อการสอน (ขนาดพอดีเท่ากัน):
                  </label>
                  {taskAttachmentName && (
                    <button
                      type="button"
                      onClick={() => {
                        setTaskAttachmentName('');
                        setTaskAttachmentData('');
                        setTaskAttachmentType('');
                        setTaskAttachmentSize('');
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> ล้างไฟล์
                    </button>
                  )}
                </div>

                {/* Symmetrical 2-Column Grid: Upload File (50%) & Paste Link (50%) with Equal Height */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Button */}
                  <label className="w-full min-h-[48px] h-12 bg-white hover:bg-zinc-100/90 px-3.5 py-2.5 rounded-xl border-2 border-dashed border-zinc-400 hover:border-zinc-900 flex items-center justify-center gap-2 text-xs font-bold text-zinc-700 hover:text-zinc-950 cursor-pointer transition-all shadow-2xs group">
                    <Paperclip className="w-4 h-4 text-zinc-500 group-hover:text-zinc-800 shrink-0" />
                    <span className="truncate max-w-[200px]">
                      {taskAttachmentName
                        ? `${taskAttachmentName} ${taskAttachmentSize ? `(${taskAttachmentSize})` : ''}`
                        : 'คลิกเลือกไฟล์แนบ (PDF / JPG / PNG / DOCX)...'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.doc,application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleTeacherTaskFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Paste Link Input */}
                  <div className="relative w-full min-h-[48px] h-12">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={taskAttachmentLink}
                      onChange={(e) => setTaskAttachmentLink(e.target.value)}
                      placeholder="หรือวางลิงก์ เช่น Google Drive, Canva..."
                      className="w-full h-full bg-white pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-zinc-400 focus:border-zinc-900 text-xs font-bold text-zinc-800 placeholder:text-zinc-400 outline-none shadow-2xs transition-all"
                    />
                  </div>
                </div>

                {/* Preview for Teacher uploaded image */}
                {(taskAttachmentType === 'image' || taskAttachmentName.match(/\.(jpg|jpeg|png|webp)$/i)) && taskAttachmentData && (
                  <div className="max-h-32 rounded-lg overflow-hidden border border-zinc-200 bg-white p-1 flex items-center justify-center">
                    <img src={taskAttachmentData} alt="ตัวอย่างสื่อการสอน" className="max-h-28 w-auto object-contain rounded" />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                {editingTaskId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsTaskModalOpen(false);
                      setDeleteTarget({
                        id: editingTaskId,
                        title: taskTitle,
                        type: 'task',
                      });
                    }}
                    className="mr-auto px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-xl border border-rose-300 cursor-pointer flex items-center gap-1.5 shadow-[1px_1px_0px_#000]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบโพสต์ชิ้นงานนี้</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-300 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingTaskId ? 'บันทึกการแก้ไข' : 'โพสต์ชิ้นงานนี้ทันที'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TEACHER TASK SUBMISSIONS ROSTER & STUDENT WORKS VIEWER */}
      {/* ========================================================================= */}
      {rosterModalTask && (() => {
        const task = rosterModalTask;
        const taskSubmissions = homeworkList.filter((h) => h.taskId === task.id);
        const submittedStudentIds = new Set(taskSubmissions.map((h) => h.studentId));
        
        // Target students in class
        const targetStudents = studentRecords.filter((s) => {
          if (task.targetClass === 'ทุกห้อง' || !task.targetClass) return true;
          if (s.classRoom === task.targetClass) return true;
          const sNum = (s.classRoom || '').replace(/[^0-9]/g, '');
          const tNum = (task.targetClass || '').replace(/[^0-9]/g, '');
          if (sNum && tNum && sNum === tNum) return true;
          return false;
        });

        const unsubmittedList = targetStudents.filter((s) => !submittedStudentIds.has(s.id));

        // Filtered submissions
        const filteredSubmissions = taskSubmissions.filter((h) => {
          if (!rosterSearch.trim()) return true;
          const q = rosterSearch.toLowerCase();
          return (
            h.studentName.toLowerCase().includes(q) ||
            h.title.toLowerCase().includes(q) ||
            (h.studentClass && h.studentClass.toLowerCase().includes(q))
          );
        });

        // Filtered unsubmitted
        const filteredUnsubmitted = unsubmittedList.filter((s) => {
          if (!rosterSearch.trim()) return true;
          const q = rosterSearch.toLowerCase();
          return (
            s.name.toLowerCase().includes(q) ||
            s.studentNo.includes(q) ||
            (s.studentIdCode && s.studentIdCode.toLowerCase().includes(q))
          );
        });

        const reviewedCount = taskSubmissions.filter((h) => h.status === 'reviewed').length;
        const pendingCount = taskSubmissions.filter((h) => h.status === 'pending').length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white sketch-border rounded-[24px_16px_22px_18px] p-5 sm:p-6 max-w-4xl w-full shadow-[8px_8px_0px_#18181b] space-y-4 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-3 gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-amber-300 text-amber-950 border border-zinc-900">
                      {task.subject}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                      🏫 {task.targetClass}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                      📅 กำหนดส่ง: {task.dueDate}
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-400">
                      ⭐ คะแนนเต็ม {task.maxScore} คะแนน
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 mt-1">
                    📋 รายชื่อนักเรียนและผลงาน: {task.title}
                  </h3>
                  <p className="text-xs font-semibold text-zinc-600">
                    {task.description}
                  </p>
                  {(task.attachmentLink || task.attachmentData || task.attachmentName) && (() => {
                    const p = detectPlatform(task.attachmentLink, task.attachmentName);
                    const nLink = task.attachmentLink ? normalizeExternalUrl(task.attachmentLink) : '';
                    return (
                      <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-zinc-700 font-black">
                          <Paperclip className="w-3.5 h-3.5 text-amber-700" />
                          <span>สื่อการสอนที่แนบ:</span>
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${p.badgeBg} ${p.textColor} ${p.borderColor}`}>
                          {p.icon} {p.name}
                        </span>
                        {nLink && (
                          <>
                            <a
                              href={nLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white bg-sky-500 hover:bg-sky-600 px-2.5 py-1 rounded-lg flex items-center gap-1 font-black cursor-pointer shadow-2xs"
                            >
                              <ExternalLink className="w-3 h-3" /> เปิดลิงก์ ↗
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenLinkViewer(
                                  task.attachmentLink,
                                  task.title,
                                  task.attachmentName,
                                  task.attachmentData,
                                  task.attachmentType
                                )
                              }
                              className="bg-white hover:bg-zinc-100 text-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-amber-700" /> ดูในแอป
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(nLink)}
                              className="bg-white hover:bg-zinc-100 text-zinc-800 p-1 rounded-lg border border-zinc-300 cursor-pointer"
                              title="คัดลอกลิงก์"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        {task.attachmentData && (
                          <a
                            href={task.attachmentData}
                            download={task.attachmentName || 'ใบงาน'}
                            className="text-white bg-emerald-500 hover:bg-emerald-600 px-2.5 py-1 rounded-lg flex items-center gap-1 font-black cursor-pointer shadow-2xs"
                          >
                            <Download className="w-3 h-3" /> ดาวน์โหลด ({task.attachmentName || 'ไฟล์'})
                          </a>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <button
                  type="button"
                  onClick={() => setRosterModalTask(null)}
                  className="p-1.5 hover:bg-zinc-100 rounded-full border border-zinc-300 cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5 text-zinc-700" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-center">
                  <div className="text-[11px] font-bold text-zinc-600">ส่งแล้วทั้งหมด</div>
                  <div className="text-xl font-black text-zinc-900">{taskSubmissions.length} คน</div>
                </div>
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-300 text-center">
                  <div className="text-[11px] font-bold text-sky-700">รอครูตรวจ & ให้คะแนน</div>
                  <div className="text-xl font-black text-sky-950">{pendingCount} คน</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-center">
                  <div className="text-[11px] font-bold text-emerald-700">ตรวจแล้วเรียบร้อย</div>
                  <div className="text-xl font-black text-emerald-950">{reviewedCount} คน</div>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-300 text-center">
                  <div className="text-[11px] font-bold text-rose-700">ยังไม่ส่งงาน</div>
                  <div className="text-xl font-black text-rose-950">{unsubmittedList.length} คน</div>
                </div>
              </div>

              {/* Search & Tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRosterSubTab('submitted')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black border-2 border-zinc-900 flex items-center gap-1.5 cursor-pointer transition-all ${
                      rosterSubTab === 'submitted'
                        ? 'bg-emerald-300 text-zinc-950 shadow-[2px_2px_0px_#000]'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>นักเรียนที่ส่งผลงานแล้ว ({taskSubmissions.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRosterSubTab('pending')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black border-2 border-zinc-900 flex items-center gap-1.5 cursor-pointer transition-all ${
                      rosterSubTab === 'pending'
                        ? 'bg-rose-300 text-zinc-950 shadow-[2px_2px_0px_#000]'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    <UserX className="w-4 h-4" />
                    <span>ยังไม่ส่งงาน ({unsubmittedList.length})</span>
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="ค้นหาชื่อหรือเลขที่นักเรียน..."
                    className="w-full bg-zinc-50 pl-9 pr-3 py-1.5 rounded-xl border border-zinc-300 text-xs font-semibold focus:border-zinc-900"
                  />
                </div>
              </div>

              {/* TAB CONTENT: SUBMITTED LIST */}
              {rosterSubTab === 'submitted' && (
                <div className="space-y-3">
                  {filteredSubmissions.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-300">
                      <div className="text-3xl mb-1">📭</div>
                      <p className="text-xs font-black text-zinc-700">ยังไม่มีนักเรียนส่งชิ้นงานนี้</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        เมื่อนักเรียนกดส่งงาน ผลงานและลิงก์จะปรากฏที่นี่เพื่อให้คุณครูเข้าไปดูและตรวจให้คะแนน
                      </p>
                    </div>
                  ) : (
                    filteredSubmissions.map((hw) => {
                      const max = hw.maxScore || task.maxScore || 10;
                      const currentScoreVal =
                        inlineScores[hw.id] !== undefined
                          ? inlineScores[hw.id]
                          : hw.teacherScore !== undefined
                          ? hw.teacherScore
                          : '';
                      const isSaved = savedFeedbackId === hw.id;

                      return (
                        <div
                          key={hw.id}
                          className="bg-white hover:bg-amber-50/40 p-4 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                        >
                          {/* Student & Work Info */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="shrink-0 pt-0.5">
                              <AvatarDisplay avatar={hw.studentAvatar} className="w-12 h-12" />
                            </div>

                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black text-sm text-zinc-900">
                                  {hw.studentName}
                                </span>
                                <span className="text-xs font-bold px-2 py-0.5 bg-zinc-100 rounded border border-zinc-300 text-zinc-700">
                                  {hw.studentClass}
                                </span>
                                <span className="text-[11px] font-semibold text-zinc-500">
                                  ส่งเมื่อ: {hw.submittedAt}
                                </span>

                                {hw.status === 'reviewed' ? (
                                  <span className="text-[11px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-500 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-700" />
                                    ตรวจแล้ว: {hw.teacherScore ?? 10}/{max} คะแนน
                                  </span>
                                ) : hw.status === 'needs_fix' ? (
                                  <span className="text-[11px] font-black px-2 py-0.5 rounded bg-orange-100 text-orange-950 border border-orange-500">
                                    ⚠️ ส่งกลับแก้ไข
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-black px-2 py-0.5 rounded bg-sky-100 text-sky-950 border border-sky-500 animate-pulse">
                                    ⏳ รอคุณครูตรวจ
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-bold text-zinc-800 line-clamp-2">
                                <span className="text-zinc-500 font-semibold">รายละเอียดที่ส่ง: </span>
                                {hw.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-bold">
                                {hw.link && (
                                  <a
                                    href={hw.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-700 hover:underline flex items-center gap-1 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-300"
                                  >
                                    <ExternalLink className="w-3 h-3" /> เปิดผลงาน (ลิงก์/Drive)
                                  </a>
                                )}

                                {hw.attachedFileName && (
                                  <span className="text-zinc-700 flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-300">
                                    <FileText className="w-3 h-3" /> {hw.attachedFileName}
                                  </span>
                                )}
                              </div>

                              {hw.teacherComment && (
                                <div className="text-xs font-semibold text-emerald-900 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                                  <span className="font-black">💬 คำติชม: </span>"{hw.teacherComment}"
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Score Box & View Work Button */}
                          <div className="flex flex-row md:flex-col items-center md:items-end gap-2.5 shrink-0 w-full md:w-auto bg-amber-50/80 p-3 rounded-xl border border-amber-300">
                            <div className="flex items-center gap-1.5">
                              <label className="text-xs font-black text-zinc-800">คะแนน:</label>
                              <input
                                type="number"
                                min="0"
                                max={max}
                                step="0.5"
                                value={currentScoreVal}
                                onChange={(e) => handleInlineScoreChange(hw.id, e.target.value)}
                                placeholder={`0-${max}`}
                                className="w-16 px-1.5 py-1 bg-white border-2 border-zinc-900 rounded-lg text-center font-black text-xs"
                              />
                              <span className="text-xs font-bold text-zinc-600">/{max}</span>
                              <button
                                type="button"
                                onClick={() => handleSaveInlineScore(hw)}
                                className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black text-xs rounded-lg border border-zinc-900 shadow-[1px_1px_0px_#000] cursor-pointer"
                              >
                                บันทึก
                              </button>
                            </div>

                            {isSaved && (
                              <span className="text-[10px] font-black text-emerald-700">
                                ✓ บันทึกสำเร็จ
                              </span>
                            )}

                            <div className="flex items-center gap-1.5 w-full">
                              <button
                                type="button"
                                onClick={() => {
                                  setRosterModalTask(null);
                                  openDetailModal(hw);
                                }}
                                className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl sketch-btn flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_#000]"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{isTeacher ? '🔍 ตรวจละเอียด' : '🔍 ดูรายละเอียด'}</span>
                              </button>
                              {!isTeacher && hw.studentId === currentUser.id && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRosterModalTask(null);
                                    handleOpenEditSubmission(hw);
                                  }}
                                  className="px-3 py-1.5 bg-amber-300 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl sketch-btn flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_#000] border border-zinc-900"
                                  title="แก้ไขชิ้นงานของฉัน"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>แก้ไขงาน</span>
                                </button>
                              )}
                              {isTeacher && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget({
                                      id: hw.id,
                                      title: `${hw.title} (${hw.studentName})`,
                                      type: 'homework',
                                    })
                                  }
                                  className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl border border-rose-300 cursor-pointer shadow-[1px_1px_0px_#000]"
                                  title="ลบผลงานนี้"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB CONTENT: UN-SUBMITTED LIST */}
              {rosterSubTab === 'pending' && (
                <div className="space-y-2.5">
                  {filteredUnsubmitted.length === 0 ? (
                    <div className="p-8 text-center bg-emerald-50 rounded-2xl border-2 border-emerald-300">
                      <div className="text-3xl mb-1">🎉</div>
                      <p className="text-sm font-black text-emerald-950">นักเรียนทุกคนส่งชิ้นงานนี้ครบถ้วนแล้ว!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredUnsubmitted.map((std) => (
                        <div
                          key={std.id}
                          className="bg-white p-3 rounded-xl border-2 border-zinc-300 flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <AvatarDisplay avatar={std.avatar} className="w-10 h-10" />
                            <div>
                              <div className="text-xs font-black text-zinc-900">{std.name}</div>
                              <div className="text-[11px] font-bold text-zinc-500">
                                {std.classRoom} • เลขที่ {std.studentNo} {std.studentIdCode ? `(${std.studentIdCode})` : ''}
                              </div>
                            </div>
                          </div>

                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                            ยังไม่ส่งงาน
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Close button */}
              <div className="flex justify-end pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setRosterModalTask(null)}
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs rounded-xl cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 3: TEACHER DETAILED GRADING & FEEDBACK MODAL */}
      {/* ========================================================================= */}
      {selectedHomework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white sketch-border rounded-[24px_16px_22px_18px] p-6 max-w-2xl w-full shadow-[8px_8px_0px_#18181b] space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                <AvatarDisplay avatar={selectedHomework.studentAvatar} className="w-12 h-12" />
                <div>
                  <h3 className="text-base md:text-lg font-black text-zinc-900">
                    ตรวจประเมินผลงานและกรอกคะแนนนักเรียน
                  </h3>
                  <span className="text-xs font-bold text-zinc-600">
                    นักเรียน: {selectedHomework.studentName} ({selectedHomework.studentClass})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHomework(null)}
                className="p-1.5 hover:bg-zinc-100 rounded-full border border-zinc-300 cursor-pointer"
              >
                <X className="w-5 h-5 text-zinc-700" />
              </button>
            </div>

            {/* Submission Preview Card */}
            <div className="bg-amber-50/70 p-4 rounded-xl border-2 border-amber-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-0.5 rounded bg-amber-200 text-amber-950 border border-zinc-900">
                  {selectedHomework.subject}
                </span>
                <span className="text-xs font-bold text-zinc-500">
                  ส่งเมื่อ: {selectedHomework.submittedAt}
                </span>
              </div>

              <h4 className="text-base font-black text-zinc-900">{selectedHomework.title}</h4>
              <p className="text-xs font-semibold text-zinc-700">{selectedHomework.description}</p>

              <div className="space-y-2 pt-1 text-xs font-bold">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedHomework.link && (
                    <a
                      href={selectedHomework.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 hover:underline flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-sky-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> เปิดผลงานที่ส่ง (URL)
                    </a>
                  )}

                  {selectedHomework.attachedFileName && (
                    selectedHomework.attachedFileData ? (
                      <a
                        href={selectedHomework.attachedFileData}
                        download={selectedHomework.attachedFileName}
                        className="bg-white hover:bg-zinc-100 px-3 py-1.5 rounded-xl border-2 border-zinc-900 flex items-center gap-2 text-zinc-900 shadow-[2px_2px_0px_#18181b] transition-transform active:scale-95"
                        title="คลิกเพื่อดาวน์โหลดไฟล์"
                      >
                        {selectedHomework.attachedFileType === 'image' || selectedHomework.attachedFileName.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                          <ImageIcon className="w-4 h-4 text-sky-600" />
                        ) : selectedHomework.attachedFileType === 'pdf' || selectedHomework.attachedFileName.toLowerCase().endsWith('.pdf') ? (
                          <FileText className="w-4 h-4 text-rose-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-indigo-600" />
                        )}
                        <span>{selectedHomework.attachedFileName}</span>
                        {selectedHomework.attachedFileSize && (
                          <span className="text-[11px] text-zinc-500 font-normal">({selectedHomework.attachedFileSize})</span>
                        )}
                        <Download className="w-3.5 h-3.5 text-zinc-600 ml-1" />
                      </a>
                    ) : (
                      <span className="bg-white px-3 py-1.5 rounded-xl border border-zinc-300 flex items-center gap-1 text-zinc-700">
                        <FileText className="w-3.5 h-3.5" /> {selectedHomework.attachedFileName}
                      </span>
                    )
                  )}
                </div>

                {/* Preview Image if attached */}
                {(selectedHomework.attachedFileType === 'image' || selectedHomework.attachedFileName?.match(/\.(jpg|jpeg|png|webp)$/i)) && selectedHomework.attachedFileData && (
                  <div className="mt-2 p-2 bg-white rounded-xl border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b]">
                    <div className="flex items-center justify-between pb-1.5 text-[11px] text-zinc-600 border-b mb-2">
                      <span className="flex items-center gap-1 font-black text-zinc-800">
                        <ImageIcon className="w-3.5 h-3.5 text-sky-600" /> ภาพถ่ายชิ้นงานที่นักเรียนส่ง
                      </span>
                      <a
                        href={selectedHomework.attachedFileData}
                        download={selectedHomework.attachedFileName || 'homework.png'}
                        className="text-sky-700 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> ดาวน์โหลดภาพต้นฉบับ
                      </a>
                    </div>
                    <img
                      src={selectedHomework.attachedFileData}
                      alt="ภาพผลงานนักเรียน"
                      className="max-h-80 w-auto mx-auto rounded-lg object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Grading Form */}
            <div className="space-y-3.5 pt-1">
              {/* Score Input */}
              <div className="bg-white p-4 rounded-xl border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-zinc-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>ช่องกรอกคะแนนที่ได้ของนักเรียน (คะแนนเต็ม {selectedHomework.maxScore || 10}):</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[10, 9, 8, 7].map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setTeacherScoreInput(sc)}
                        className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded border border-amber-400 cursor-pointer"
                      >
                        +{sc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max={selectedHomework.maxScore || 10}
                    step="0.5"
                    value={teacherScoreInput}
                    onChange={(e) => setTeacherScoreInput(Number(e.target.value))}
                    className="w-28 px-3 py-2 bg-yellow-50 border-2 border-zinc-900 rounded-xl text-center font-black text-xl shadow-[2px_2px_0px_#000]"
                  />
                  <span className="text-sm font-bold text-zinc-700">
                    / {selectedHomework.maxScore || 10} คะแนน
                  </span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">สถานะการตรวจ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTeacherStatusInput('reviewed')}
                    className={`py-2 px-3 rounded-xl border-2 font-black text-xs flex items-center justify-center gap-2 cursor-pointer ${
                      teacherStatusInput === 'reviewed'
                        ? 'bg-emerald-300 border-zinc-900 shadow-[2px_2px_0px_#000]'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-800" />
                    <span>ตรวจผ่านเรียบร้อย (มีคะแนน)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTeacherStatusInput('needs_fix')}
                    className={`py-2 px-3 rounded-xl border-2 font-black text-xs flex items-center justify-center gap-2 cursor-pointer ${
                      teacherStatusInput === 'needs_fix'
                        ? 'bg-orange-300 border-zinc-900 shadow-[2px_2px_0px_#000]'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-600'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 text-orange-800" />
                    <span>ส่งกลับให้นักเรียนแก้ไข</span>
                  </button>
                </div>
              </div>

              {/* Teacher Comment */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  คำติชม / ข้อเสนอแนะของคุณครู
                </label>
                <textarea
                  rows={3}
                  value={teacherCommentInput}
                  onChange={(e) => setTeacherCommentInput(e.target.value)}
                  placeholder="พิมพ์คำแนะนำ หรือสิ่งที่นักเรียนทำได้ดี..."
                  className="w-full bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-semibold sketch-input"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget({
                        id: selectedHomework.id,
                        title: `${selectedHomework.title} (${selectedHomework.studentName})`,
                        type: 'homework',
                      });
                    }}
                    className="mr-auto px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-300 cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>ลบผลงานนี้</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedHomework(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-300 cursor-pointer"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={handleTeacherGradeHomework}
                  className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-zinc-950 font-black text-xs md:text-sm rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#18181b]"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกคะแนนและคำติชม ✨</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: STUDENT EDIT SUBMITTED HOMEWORK MODAL */}
      {/* ========================================================================= */}
      {editingHomeworkTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFDF5] sketch-border-lg rounded-[26px_18px_24px_20px] p-5 sm:p-7 max-w-xl w-full shadow-[8px_8px_0px_#18181b] relative max-h-[92vh] overflow-y-auto space-y-4">
            {/* Washi Tape */}
            <div className="washi-tape -top-3.5 left-12 bg-amber-200 rotate-[-2deg]" />

            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-300 border-2 border-zinc-900 flex items-center justify-center text-xl shadow-[2px_2px_0px_#000] shrink-0">
                  ✏️
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-zinc-900">
                    แก้ไขชิ้นงานที่ส่งไปแล้ว
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-zinc-600 mt-0.5">
                    <span>ผู้ส่ง: {editingHomeworkTarget.studentName}</span>
                    {editingHomeworkTarget.status === 'needs_fix' ? (
                      <span className="bg-orange-100 text-orange-900 border border-orange-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                        ⚠️ ครูแจ้งให้แก้ไข
                      </span>
                    ) : editingHomeworkTarget.status === 'reviewed' ? (
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                        ✓ ตรวจแล้ว ({editingHomeworkTarget.teacherScore ?? 10}/{editingHomeworkTarget.maxScore || 10} คะแนน)
                      </span>
                    ) : (
                      <span className="bg-sky-100 text-sky-900 border border-sky-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                        ⏳ รอตรวจ
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingHomeworkTarget(null)}
                className="p-1.5 hover:bg-zinc-100 rounded-full border border-zinc-300 cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5 text-zinc-700" />
              </button>
            </div>

            {/* Teacher Feedback Banner if provided */}
            {editingHomeworkTarget.teacherComment && (
              <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-amber-900">
                  <MessageSquare className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>คำแนะนำจากคุณครูที่ควรปรับปรุง:</span>
                </div>
                <p className="font-semibold whitespace-pre-line break-words pl-5">
                  "{editingHomeworkTarget.teacherComment}"
                </p>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSaveStudentEditedSubmission} className="space-y-3.5">
              {/* Title */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  หัวข้อชิ้นงาน / ชื่อการบ้าน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="พิมพ์หัวข้อชิ้นงาน..."
                  className="w-full bg-white px-3 py-2.5 rounded-xl border-2 border-zinc-900 text-xs sm:text-sm font-bold sketch-input"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  กลุ่มสาระ / รายวิชา
                </label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="เช่น วิทยาศาสตร์และเทคโนโลยี"
                  className="w-full bg-white px-3 py-2 rounded-xl border-2 border-zinc-900 text-xs font-bold sketch-input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  คำอธิบายผลงาน / สรุปสิ่งที่ได้เรียนรู้:
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="อธิบายรายละเอียดผลงาน ขั้นตอนการทำ หรือสิ่งที่ได้เรียนรู้..."
                  className="w-full bg-white p-2.5 rounded-xl border-2 border-zinc-900 text-xs font-semibold sketch-input"
                />
              </div>

              {/* Link */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-zinc-800">
                    ลิงก์ผลงานที่ส่ง (Google Drive, Canva, Docs, YouTube ฯลฯ):
                  </label>
                  {editLink && (
                    <a
                      href={normalizeExternalUrl(editLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-sky-700 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> ทดสอบเปิดลิงก์ ↗
                    </a>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    placeholder="https://drive.google.com/... หรือ https://canva.com/..."
                    className="w-full bg-white pl-9 pr-3 py-2.5 rounded-xl border-2 border-zinc-900 text-xs font-semibold sketch-input"
                  />
                </div>
              </div>

              {/* File Attachment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-zinc-800">
                    ไฟล์แนบผลงาน (PDF, JPG, PNG, DOCX):
                  </label>
                  {editAttachedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditAttachedFile('');
                        setEditAttachedData('');
                        setEditAttachedType('');
                        setEditAttachedSize('');
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> ลบไฟล์แนบนี้
                    </button>
                  )}
                </div>

                {!editAttachedFile ? (
                  <label className="bg-white hover:bg-zinc-50 p-3.5 rounded-xl border-2 border-dashed border-zinc-400 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer transition-colors">
                    <Paperclip className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span>คลิกเพื่อแนบไฟล์ผลงานใหม่ (PDF, JPG, PNG, DOCX)...</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.doc,application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleEditSubmissionFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="p-3 bg-white rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {editAttachedType === 'image' || editAttachedFile.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-black border border-sky-300 shrink-0">
                            JPG / PNG
                          </span>
                        ) : editAttachedType === 'pdf' || editAttachedFile.toLowerCase().endsWith('.pdf') ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300 shrink-0">
                            PDF
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black border border-indigo-300 shrink-0">
                            DOCX
                          </span>
                        )}
                        <span className="text-xs font-bold text-zinc-800 truncate">{editAttachedFile}</span>
                        {editAttachedSize && (
                          <span className="text-[11px] font-semibold text-zinc-500 shrink-0">({editAttachedSize})</span>
                        )}
                      </div>

                      <label className="text-[11px] font-bold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer shrink-0">
                        เปลี่ยนไฟล์
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.doc,application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleEditSubmissionFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Preview Image if image attached */}
                    {(editAttachedType === 'image' || editAttachedFile.match(/\.(jpg|jpeg|png|webp)$/i)) && editAttachedData && (
                      <div className="max-h-40 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center p-1">
                        <img src={editAttachedData} alt="ภาพผลงานที่แนบ" className="max-h-36 w-auto object-contain rounded" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status info note */}
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-[11px] font-semibold text-sky-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  เมื่อกดบันทึก ข้อมูลชิ้นงานจะอัปเดตทันที พร้อมบันทึกเวลาที่แก้ไขล่าสุด และหากคุณครูส่งกลับมาให้แก้ไข ระบบจะเปลี่ยนสถานะเป็นรอตรวจให้อัตโนมัติ
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setEditingHomeworkTarget(null)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-300 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs sm:text-sm rounded-xl sketch-btn flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#18181b]"
                >
                  <Save className="w-4 h-4" />
                  <span>💾 บันทึกการแก้ไขชิ้นงาน ✨</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Post & Homework Deletion */}
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.type === 'task' ? 'ยืนยันการลบโพสต์ชิ้นงาน' : 'ยืนยันการลบผลงานที่ส่ง'}
        itemName={deleteTarget?.title}
        itemType={deleteTarget?.type === 'task' ? 'โพสต์ชิ้นงานที่มอบหมาย' : 'ผลงานของนักเรียน'}
        description={
          deleteTarget?.type === 'task'
            ? 'เมื่อลบโพสต์ชิ้นงานนี้แล้ว นักเรียนจะไม่สามารถส่งงานนี้ได้อีก และข้อมูลการส่งงานของภาระงานนี้จะถูกนำออกจากระบบ'
            : 'เมื่อลบผลงานนี้แล้ว นักเรียนจะสามารถส่งผลงานใหม่ได้'
        }
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Universal Content Link Viewer Modal (Multi-Platform Accessible) */}
      <ContentLinkViewerModal
        isOpen={linkViewerTarget.isOpen}
        onClose={() => setLinkViewerTarget((prev) => ({ ...prev, isOpen: false }))}
        title={linkViewerTarget.title}
        url={linkViewerTarget.url}
        attachmentName={linkViewerTarget.attachmentName}
        attachmentData={linkViewerTarget.attachmentData}
        attachmentType={linkViewerTarget.attachmentType}
        onCopySuccess={(msg) => {
          setCopyToast(msg);
          setTimeout(() => setCopyToast(null), 3000);
        }}
      />

      {/* Floating Copy Feedback Toast */}
      {copyToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-[4px_4px_0px_#000] border-2 border-emerald-400 flex items-center gap-2 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{copyToast}</span>
        </div>
      )}
    </div>
  );
};
