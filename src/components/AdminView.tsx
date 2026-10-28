import React, { useState, useMemo, useCallback } from 'react';
import {
  UserProfile,
  UserRole,
  StudentRecord,
  AssignmentTask,
  Homework,
  QuizLesson,
  StudentExamScore,
  TeacherEvaluation,
  TeacherReflectionTopic,
  WhiteboardSession,
  WhiteboardMessage,
  CustomTopicPreset,
  HomeworkStatus,
} from '../types';
import { TOPIC_PRESETS, TopicPreset } from './LiveWhiteboard';
import { AvatarDisplay } from './DoodleAvatars';
import {
  DoodleShield,
  DoodleStudent,
  DoodleTeacher,
  DoodleStar,
  DoodleCheck,
  DoodleZap,
  DoodleSparkles,
} from './DoodleIcons';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { triggerFestiveConfetti, triggerStarBurst } from '../utils/confetti';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Users,
  Shield,
  MessageSquare,
  BookOpen,
  FileText,
  Award,
  Download,
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  Eye,
  EyeOff,
  X,
  Star,
  ChevronRight,
  BarChart3,
  Check,
  KeyRound,
  Lock,
  User,
  RefreshCw,
  LayoutGrid,
  CheckSquare,
  Bookmark,
  GraduationCap,
  Sparkles,
  Phone,
  Building,
  Mail,
  Calendar,
  Layers,
  HelpCircle,
  ArrowUpDown,
  Smile,
} from 'lucide-react';

export const ThaiGarudaEmblem: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    aria-label="ตราครุฑพ่าห์"
  >
    <g fill="currentColor">
      {/* Crown / Chada */}
      <path d="M50 3 L53 13 L57 14 L54 17 L58 23 L52 24 L50 27 L48 24 L42 23 L46 17 L43 14 L47 13 Z" />
      {/* Head & Beak */}
      <circle cx="50" cy="30" r="4.5" />
      <path d="M48 31 L52 31 L50 37 Z" />
      {/* Torso & Pectorals */}
      <path d="M43 35 C41 42 44 48 50 48 C56 48 59 42 57 35 C54 36 46 36 43 35 Z" />
      {/* Upraised Wings (Left Wing) */}
      <path d="M43 36 C37 32 29 22 19 20 C21 26 26 34 31 38 C23 35 14 32 7 34 C11 40 19 46 28 48 C19 47 11 48 5 52 C11 56 21 58 32 57 C23 59 15 64 11 70 C19 70 28 66 37 62 C37 56 40 45 44 42 Z" />
      {/* Upraised Wings (Right Wing) */}
      <path d="M57 36 C63 32 71 22 81 20 C79 26 74 34 69 38 C77 35 86 32 93 34 C89 40 81 46 72 48 C81 47 89 48 95 52 C89 56 79 58 68 57 C77 59 85 64 89 70 C81 70 72 66 63 62 C63 56 60 45 56 42 Z" />
      {/* Lower Body & Waist Belt */}
      <path d="M45 49 L55 49 L57 58 L43 58 Z" />
      <path d="M42 59 L58 59 L50 67 Z" />
      {/* Thighs & Claws */}
      <path d="M43 62 C40 68 36 74 33 80 C36 82 40 82 43 78 C44 74 46 68 47 64 Z" />
      <path d="M57 62 C60 68 64 74 67 80 C64 82 60 82 57 78 C56 74 54 68 53 64 Z" />
      {/* Tail Feathers */}
      <path d="M47 67 L53 67 L55 86 C52 90 48 90 45 86 Z" />
      <path d="M43 70 L41 85 C44 86 46 86 47 84 Z" />
      <path d="M57 70 L59 85 C56 86 54 86 53 84 Z" />
      {/* Talons */}
      <path d="M31 80 C29 84 32 87 36 85 C37 83 35 81 33 80 Z" />
      <path d="M69 80 C71 84 68 87 64 85 C63 83 65 81 67 80 Z" />
    </g>
  </svg>
);

interface AdminViewProps {
  currentUser: UserProfile;
  studentRecords: StudentRecord[];
  registeredUsers: UserProfile[];
  whiteboardSessions: WhiteboardSession[];
  whiteboardMessages: WhiteboardMessage[];
  assignmentTasks: AssignmentTask[];
  homeworkList: Homework[];
  quizLessons: QuizLesson[];
  examScores: StudentExamScore[];
  evaluations: TeacherEvaluation[];
  reflectionTopics: TeacherReflectionTopic[];
  onUpdateUserProfile?: (profile: UserProfile) => void;
  onAddHomework?: (hw: Homework) => void;
  onUpdateHomework?: (hw: Homework) => void;
  onDeleteHomework?: (id: string) => void;
  onAddUser?: (user: UserProfile) => void;
  onUpdateUser?: (user: UserProfile) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateUserRole?: (userId: string, newRole: UserRole) => void;
  onAddTask?: (task: AssignmentTask) => void;
  onUpdateTask?: (task: AssignmentTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddLesson?: (lesson: QuizLesson) => void;
  onUpdateLesson?: (lesson: QuizLesson) => void;
  onDeleteLesson?: (lessonId: string) => void;
  onAddExamScore?: (score: StudentExamScore) => void;
  onUpdateExamScore?: (score: StudentExamScore) => void;
  onDeleteExamScore?: (scoreId: string) => void;
  onAddStudentRecord?: (record: StudentRecord) => void;
  onUpdateStudentRecord?: (record: StudentRecord) => void;
  onDeleteStudentRecord?: (studentId: string) => void;
  onAddEvaluation?: (evaluation: TeacherEvaluation) => void;
  onUpdateEvaluation?: (evaluation: TeacherEvaluation) => void;
  onDeleteEvaluation?: (evalId: string) => void;
  onAddReflectionTopic?: (topic: TeacherReflectionTopic) => void;
  onUpdateReflectionTopic?: (topic: TeacherReflectionTopic) => void;
  onDeleteReflectionTopic?: (topicId: string) => void;
  onAwardStars?: (amount: number, reason: string) => void;
  onDeleteWhiteboardSession?: (sessionId: string) => void;
  onEndWhiteboardSession?: (sessionId: string) => void;
  onSwitchUser?: (newUser: UserProfile) => void;
  onCustomPresetsChange?: (presets: CustomTopicPreset[]) => void;
  onOpenAdminProfileModal?: () => void;
  currentSubTab?: AdminTab;
  onSelectSubTab?: (tab: AdminTab) => void;
}

type AdminTab =
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
  | 'presets';

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  studentRecords,
  registeredUsers,
  whiteboardSessions,
  whiteboardMessages,
  assignmentTasks,
  homeworkList,
  quizLessons,
  examScores,
  evaluations,
  reflectionTopics,
  onUpdateUserProfile,
  onAddHomework,
  onUpdateHomework,
  onDeleteHomework,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateUserRole,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onAddExamScore,
  onUpdateExamScore,
  onDeleteExamScore,
  onAddStudentRecord,
  onUpdateStudentRecord,
  onDeleteStudentRecord,
  onAddEvaluation,
  onUpdateEvaluation,
  onDeleteEvaluation,
  onAddReflectionTopic,
  onUpdateReflectionTopic,
  onDeleteReflectionTopic,
  onAwardStars,
  onDeleteWhiteboardSession,
  onEndWhiteboardSession,
  onSwitchUser,
  onCustomPresetsChange,
  onOpenAdminProfileModal,
  currentSubTab,
  onSelectSubTab,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(currentSubTab || 'dashboard');
  const [toastMessage, setToastMessage] = useState<string>('');

  React.useEffect(() => {
    if (currentSubTab && currentSubTab !== activeTab) {
      setActiveTab(currentSubTab);
    }
  }, [currentSubTab]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (onSelectSubTab) onSelectSubTab(tab);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // =================================================================
  // 1. ADMIN PROFILE STATE
  // =================================================================
  const [profileName, setProfileName] = useState(currentUser.name || 'ผู้ดูแลระบบ TaskHub');
  const [profileUsername, setProfileUsername] = useState(
    currentUser.usernameOrEmail || (currentUser.googleEmail ? currentUser.googleEmail.split('@')[0] : 'admin')
  );
  const [profileEmail, setProfileEmail] = useState(
    currentUser.googleEmail || '6711502234@chandra.ac.th'
  );
  const [profileDepartment, setProfileDepartment] = useState(
    currentUser.department || currentUser.subjectDepartment || 'กลุ่มบริหารงานวิชาการและเทคโนโลยี'
  );
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '02-123-4567');
  const [profilePassword, setProfilePassword] = useState(currentUser.password || 'admin123');
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar || '🛡️');

  const avatarOptions = [
    '🛡️', '👑', '🧑‍💼', '👩‍💼', '🧑‍🏫', '🧙‍♂️', '🦉', '⭐', '🔥', '🚀',
    'student-boy-glasses', 'teacher-female-glasses', 'student-girl-ponytail', 'teacher-male-tie'
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('กรุณาระบุชื่อผู้ดูแลระบบ');
      return;
    }
    const updated: UserProfile = {
      ...currentUser,
      name: profileName.trim(),
      usernameOrEmail: profileUsername.trim(),
      googleEmail: profileEmail.trim(),
      department: profileDepartment.trim(),
      phone: profilePhone.trim(),
      password: profilePassword.trim(),
      avatar: profileAvatar,
    };
    if (onUpdateUserProfile) onUpdateUserProfile(updated);
    triggerStarBurst();
    showToast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
  };

  // =================================================================
  // 2. HOMEWORK SUBMISSIONS CRUD + SEARCH
  // =================================================================
  const [homeworkSearch, setHomeworkSearch] = useState('');
  const [homeworkStatusFilter, setHomeworkStatusFilter] = useState<string>('all');
  const [isHwModalOpen, setIsHwModalOpen] = useState(false);
  const [editingHw, setEditingHw] = useState<Homework | null>(null);

  // Homework modal form state
  const [hwStudentName, setHwStudentName] = useState('');
  const [hwClass, setHwClass] = useState('ม.2/1');
  const [hwStudentNo, setHwStudentNo] = useState('1');
  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('วิทยาศาสตร์');
  const [hwScore, setHwScore] = useState<number>(10);
  const [hwMaxScore, setHwMaxScore] = useState<number>(10);
  const [hwStatus, setHwStatus] = useState<HomeworkStatus>('graded');
  const [hwFeedback, setHwFeedback] = useState('');
  const [hwLink, setHwLink] = useState('');

  const filteredHomeworks = useMemo(() => {
    return homeworkList.filter((hw) => {
      const matchSearch =
        hw.studentName.toLowerCase().includes(homeworkSearch.toLowerCase()) ||
        hw.title.toLowerCase().includes(homeworkSearch.toLowerCase()) ||
        hw.studentClass.toLowerCase().includes(homeworkSearch.toLowerCase()) ||
        (hw.subject && hw.subject.toLowerCase().includes(homeworkSearch.toLowerCase()));
      const matchStatus =
        homeworkStatusFilter === 'all' || hw.status === homeworkStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [homeworkList, homeworkSearch, homeworkStatusFilter]);

  const openAddHomework = () => {
    setEditingHw(null);
    setHwStudentName('');
    setHwClass('ม.2/1');
    setHwStudentNo('1');
    setHwTitle('');
    setHwSubject('วิทยาศาสตร์');
    setHwScore(10);
    setHwMaxScore(10);
    setHwStatus('graded');
    setHwFeedback('ทำได้ดีมาก มีความตั้งใจ');
    setHwLink('');
    setIsHwModalOpen(true);
  };

  const openEditHomework = (hw: Homework) => {
    setEditingHw(hw);
    setHwStudentName(hw.studentName);
    setHwClass(hw.studentClass);
    setHwStudentNo(hw.studentNo || '1');
    setHwTitle(hw.title);
    setHwSubject(hw.subject || 'วิทยาศาสตร์');
    setHwScore(hw.score ?? 10);
    setHwMaxScore(hw.maxScore ?? 10);
    setHwStatus(hw.status);
    setHwFeedback(hw.teacherFeedback || '');
    setHwLink(hw.linkUrl || '');
    setIsHwModalOpen(true);
  };

  const handleSaveHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwStudentName.trim() || !hwTitle.trim()) return;

    if (editingHw) {
      const updated: Homework = {
        ...editingHw,
        studentName: hwStudentName.trim(),
        studentClass: hwClass.trim(),
        studentNo: hwStudentNo.trim(),
        title: hwTitle.trim(),
        subject: hwSubject.trim(),
        score: hwScore,
        maxScore: hwMaxScore,
        status: hwStatus,
        teacherFeedback: hwFeedback.trim(),
        teacherComment: hwFeedback.trim(),
        feedback: hwFeedback.trim(),
        linkUrl: hwLink.trim() || undefined,
        updatedAt: new Date().toLocaleDateString('th-TH'),
      };
      if (onUpdateHomework) onUpdateHomework(updated);
      showToast('แก้ไขข้อมูลการส่งการบ้านสำเร็จ');
    } else {
      const newHw: Homework = {
        id: 'hw-' + Date.now(),
        studentId: 'std-' + Date.now(),
        studentName: hwStudentName.trim(),
        studentClass: hwClass.trim(),
        studentNo: hwStudentNo.trim(),
        studentAvatar: 'student-boy-glasses',
        title: hwTitle.trim(),
        subject: hwSubject.trim(),
        description: hwFeedback.trim() || hwTitle.trim(),
        link: hwLink.trim() || '',
        score: hwScore,
        maxScore: hwMaxScore,
        status: hwStatus,
        submittedAt: new Date().toLocaleDateString('th-TH'),
        updatedAt: new Date().toLocaleDateString('th-TH'),
        teacherFeedback: hwFeedback.trim(),
        teacherComment: hwFeedback.trim(),
        feedback: hwFeedback.trim(),
        linkUrl: hwLink.trim() || undefined,
        earnedStars: 50,
      };
      if (onAddHomework) onAddHomework(newHw);
      showToast('เพิ่มรายการส่งการบ้านเรียบร้อย');
    }
    setIsHwModalOpen(false);
  };

  // =================================================================
  // 3. USER MANAGEMENT & ROLE PERMISSION CRUD + SEARCH
  // =================================================================
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // User modal form state
  const [formUserName, setFormUserName] = useState('');
  const [formUserEmail, setFormUserEmail] = useState('');
  const [formUserPassword, setFormUserPassword] = useState('123456');
  const [formUserRole, setFormUserRole] = useState<UserRole>('student');
  const [formUserClass, setFormUserClass] = useState('ม.2/1');
  const [formUserNo, setFormUserNo] = useState('1');
  const [formUserAvatar, setFormUserAvatar] = useState('🧑‍🎓');

  // Combined list of users
  const allUsersList = useMemo(() => {
    const map = new Map<string, UserProfile>();
    if (registeredUsers && registeredUsers.length > 0) {
      registeredUsers.forEach((u) => map.set(u.id, u));
    }
    // Also include students from studentRecords if not present
    studentRecords.forEach((std) => {
      if (!map.has(std.id)) {
        map.set(std.id, {
          id: std.id,
          name: std.name,
          role: 'student',
          classRoom: std.classRoom,
          studentNo: std.studentNo,
          studentIdCode: std.studentIdCode,
          avatar: std.avatar,
          totalStars: std.totalStars,
          unlockedStickers: std.unlockedStickers,
        });
      }
    });
    // Ensure current admin is included
    if (!map.has(currentUser.id)) {
      map.set(currentUser.id, currentUser);
    }
    return Array.from(map.values());
  }, [registeredUsers, studentRecords, currentUser]);

  const filteredUsers = useMemo(() => {
    return allUsersList.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.googleEmail && u.googleEmail.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.usernameOrEmail && u.usernameOrEmail.toLowerCase().includes(userSearch.toLowerCase())) ||
        u.classRoom.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.role.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [allUsersList, userSearch, userRoleFilter]);

  const openAddUser = () => {
    setEditingUser(null);
    setFormUserName('');
    setFormUserEmail('');
    setFormUserPassword('123456');
    setFormUserRole('student');
    setFormUserClass('ม.2/1');
    setFormUserNo('1');
    setFormUserAvatar('student-boy-glasses');
    setIsUserModalOpen(true);
  };

  const openEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setFormUserName(user.name);
    setFormUserEmail(user.googleEmail || user.usernameOrEmail || '');
    setFormUserPassword(user.password || '123456');
    setFormUserRole(user.role);
    setFormUserClass(user.classRoom || 'ม.2/1');
    setFormUserNo(user.studentNo || '1');
    setFormUserAvatar(user.avatar || '🧑‍🎓');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserName.trim()) return;

    if (editingUser) {
      const updated: UserProfile = {
        ...editingUser,
        name: formUserName.trim(),
        googleEmail: formUserEmail.trim() || undefined,
        usernameOrEmail: formUserEmail.trim() || undefined,
        password: formUserPassword.trim(),
        role: formUserRole,
        classRoom: formUserClass.trim(),
        studentNo: formUserNo.trim(),
        avatar: formUserAvatar,
      };
      if (onUpdateUser) onUpdateUser(updated);
      if (onUpdateUserRole && editingUser.role !== formUserRole) {
        onUpdateUserRole(editingUser.id, formUserRole);
      }
      showToast('แก้ไขข้อมูลผู้ใช้เรียบร้อย');
    } else {
      const newId = `user-${Date.now()}`;
      const newUser: UserProfile = {
        id: newId,
        name: formUserName.trim(),
        googleEmail: formUserEmail.trim() || undefined,
        usernameOrEmail: formUserEmail.trim() || undefined,
        password: formUserPassword.trim(),
        role: formUserRole,
        classRoom: formUserClass.trim(),
        studentNo: formUserNo.trim(),
        avatar: formUserAvatar,
        totalStars: formUserRole === 'student' ? 100 : 0,
        unlockedStickers: ['first-step'],
      };
      if (onAddUser) onAddUser(newUser);
      showToast('เพิ่มผู้ใช้งานสำเร็จ');
    }
    setIsUserModalOpen(false);
  };

  // =================================================================
  // 4. ASSIGNMENT TASKS (ชิ้นงาน) CRUD + SEARCH
  // =================================================================
  const [taskSearch, setTaskSearch] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AssignmentTask | null>(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('วิทยาศาสตร์');
  const [taskTargetClass, setTaskTargetClass] = useState('ทุกห้อง');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('30 มี.ค. 2569');
  const [taskStars, setTaskStars] = useState<number>(50);
  const [taskMaxScore, setTaskMaxScore] = useState<number>(10);

  const filteredTasks = useMemo(() => {
    return assignmentTasks.filter((t) => {
      return (
        t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.subject.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.targetClass.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(taskSearch.toLowerCase())
      );
    });
  }, [assignmentTasks, taskSearch]);

  const openAddTask = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskSubject('วิทยาศาสตร์');
    setTaskTargetClass('ทุกห้อง');
    setTaskDesc('');
    setTaskDueDate('30 มี.ค. 2569');
    setTaskStars(50);
    setTaskMaxScore(10);
    setIsTaskModalOpen(true);
  };

  const openEditTask = (t: AssignmentTask) => {
    setEditingTask(t);
    setTaskTitle(t.title);
    setTaskSubject(t.subject);
    setTaskTargetClass(t.targetClass);
    setTaskDesc(t.description);
    setTaskDueDate(t.dueDate);
    setTaskStars(t.rewardStars || 50);
    setTaskMaxScore(t.maxScore || 10);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTask) {
      const updated: AssignmentTask = {
        ...editingTask,
        title: taskTitle.trim(),
        subject: taskSubject.trim(),
        targetClass: taskTargetClass.trim(),
        description: taskDesc.trim(),
        dueDate: taskDueDate.trim(),
        rewardStars: taskStars,
        maxScore: taskMaxScore,
        updatedAt: new Date().toLocaleDateString('th-TH'),
      };
      if (onUpdateTask) onUpdateTask(updated);
      showToast('แก้ไขข้อมูลชิ้นงานเรียบร้อย');
    } else {
      const newTask: AssignmentTask = {
        id: 'task-' + Date.now(),
        title: taskTitle.trim(),
        subject: taskSubject.trim(),
        targetClass: taskTargetClass.trim(),
        description: taskDesc.trim(),
        dueDate: taskDueDate.trim(),
        rewardStars: taskStars,
        maxScore: taskMaxScore,
        createdAt: new Date().toLocaleDateString('th-TH'),
        authorTeacher: currentUser.name,
        teacherId: currentUser.id,
      };
      if (onAddTask) onAddTask(newTask);
      showToast('เพิ่มชิ้นงานใหม่สำเร็จ');
    }
    setIsTaskModalOpen(false);
  };

  // =================================================================
  // 5. QUIZ LESSONS (แบบทดสอบ) CRUD + SEARCH
  // =================================================================
  const [quizSearch, setQuizSearch] = useState('');
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizLesson | null>(null);

  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizClass, setQuizClass] = useState('ม.2');
  const [quizQuestionsCount, setQuizQuestionsCount] = useState<number>(5);

  const filteredQuizzes = useMemo(() => {
    return quizLessons.filter((q) => {
      return (
        q.title.toLowerCase().includes(quizSearch.toLowerCase()) ||
        q.description.toLowerCase().includes(quizSearch.toLowerCase()) ||
        (q.targetClass && q.targetClass.toLowerCase().includes(quizSearch.toLowerCase()))
      );
    });
  }, [quizLessons, quizSearch]);

  const openAddQuiz = () => {
    setEditingQuiz(null);
    setQuizTitle('');
    setQuizDesc('');
    setQuizClass('ม.2');
    setQuizQuestionsCount(5);
    setIsQuizModalOpen(true);
  };

  const openEditQuiz = (q: QuizLesson) => {
    setEditingQuiz(q);
    setQuizTitle(q.title);
    setQuizDesc(q.description);
    setQuizClass(q.targetClass || 'ม.2');
    setQuizQuestionsCount(q.questions?.length || 5);
    setIsQuizModalOpen(true);
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    if (editingQuiz) {
      const updated: QuizLesson = {
        ...editingQuiz,
        title: quizTitle.trim(),
        description: quizDesc.trim(),
        targetClass: quizClass.trim(),
      };
      if (onUpdateLesson) onUpdateLesson(updated);
      showToast('แก้ไขแบบทดสอบเรียบร้อย');
    } else {
      // Generate default questions if needed
      const questions = Array.from({ length: quizQuestionsCount }).map((_, i) => ({
        id: i + 1,
        question: `ข้อที่ ${i + 1}: ความรู้ทั่วไปเกี่ยวกับ ${quizTitle}`,
        options: ['คำตอบข้อ ก (ถูกต้อง)', 'คำตอบข้อ ข', 'คำตอบข้อ ค', 'คำตอบข้อ ง'],
        correctIndex: 0,
        explanation: 'เป็นคำตอบที่ถูกต้องตามหลักการ',
      }));

      const newQuiz: QuizLesson = {
        id: 'quiz-' + Date.now(),
        title: quizTitle.trim(),
        subtitle: quizDesc.trim() || 'แบบทดสอบเพื่อการเรียนรู้',
        icon: '📝',
        description: quizDesc.trim(),
        targetClass: quizClass.trim(),
        teacherId: currentUser.id,
        authorTeacher: currentUser.name,
        questions,
        totalQuestions: questions.length,
        bestScore: 0,
      };
      if (onAddLesson) onAddLesson(newQuiz);
      showToast('เพิ่มแบบทดสอบใหม่สำเร็จ');
    }
    setIsQuizModalOpen(false);
  };

  // =================================================================
  // 6. EXAM SCORES (คะแนนสอบรายบุคคล) CRUD + SEARCH
  // =================================================================
  const [scoreSearch, setScoreSearch] = useState('');
  const [scoreClassFilter, setScoreClassFilter] = useState('all');
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<StudentExamScore | null>(null);

  const [scoreStudentName, setScoreStudentName] = useState('');
  const [scoreClass, setScoreClass] = useState('ม.2/1');
  const [scoreLessonTitle, setScoreLessonTitle] = useState('1. เทคโนโลยีรถยนต์ไฟฟ้า (EV)');
  const [scoreValue, setScoreValue] = useState<number>(8);
  const [scoreMax, setScoreMax] = useState<number>(10);

  const filteredExamScores = useMemo(() => {
    return examScores.filter((s) => {
      const matchSearch =
        s.studentName.toLowerCase().includes(scoreSearch.toLowerCase()) ||
        s.lessonTitle.toLowerCase().includes(scoreSearch.toLowerCase()) ||
        (s.studentClass && s.studentClass.toLowerCase().includes(scoreSearch.toLowerCase()));
      const matchClass =
        scoreClassFilter === 'all' || s.studentClass === scoreClassFilter;
      return matchSearch && matchClass;
    });
  }, [examScores, scoreSearch, scoreClassFilter]);

  const openAddScore = () => {
    setEditingScore(null);
    setScoreStudentName('');
    setScoreClass('ม.2/1');
    setScoreLessonTitle(quizLessons[0]?.title || '1. แบบทดสอบวิทยาศาสตร์');
    setScoreValue(8);
    setScoreMax(10);
    setIsScoreModalOpen(true);
  };

  const openEditScore = (s: StudentExamScore) => {
    setEditingScore(s);
    setScoreStudentName(s.studentName);
    setScoreClass(s.studentClass || 'ม.2/1');
    setScoreLessonTitle(s.lessonTitle);
    setScoreValue(s.score);
    setScoreMax(s.maxScore);
    setIsScoreModalOpen(true);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreStudentName.trim()) return;

    if (editingScore) {
      const updated: StudentExamScore = {
        ...editingScore,
        studentName: scoreStudentName.trim(),
        studentClass: scoreClass.trim(),
        lessonTitle: scoreLessonTitle.trim(),
        score: scoreValue,
        maxScore: scoreMax,
      };
      if (onUpdateExamScore) onUpdateExamScore(updated);
      showToast('แก้ไขคะแนนสอบเรียบร้อย');
    } else {
      const newScore: StudentExamScore = {
        id: 'exam-' + Date.now(),
        studentId: 'std-' + Date.now(),
        studentName: scoreStudentName.trim(),
        studentNo: '1',
        studentClass: scoreClass.trim(),
        studentAvatar: 'student-boy-glasses',
        lessonId: 'lesson-custom',
        lessonTitle: scoreLessonTitle.trim(),
        score: scoreValue,
        maxScore: scoreMax,
        submittedAt: new Date().toLocaleDateString('th-TH'),
      };
      if (onAddExamScore) onAddExamScore(newScore);
      showToast('บันทึกคะแนนสอบเรียบร้อย');
    }
    setIsScoreModalOpen(false);
  };

  // =================================================================
  // 7. SCOREBOOK (สมุดคะแนนนักเรียน) CRUD + SEARCH
  // =================================================================
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('all');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  const [stdName, setStdName] = useState('');
  const [stdCode, setStdCode] = useState('');
  const [stdClass, setStdClass] = useState('ม.2/1');
  const [stdNo, setStdNo] = useState('1');
  const [stdStars, setStdStars] = useState<number>(100);

  const filteredStudents = useMemo(() => {
    return studentRecords.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.studentIdCode.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.classRoom.toLowerCase().includes(studentSearch.toLowerCase());
      const matchClass =
        studentClassFilter === 'all' || s.classRoom === studentClassFilter;
      return matchSearch && matchClass;
    });
  }, [studentRecords, studentSearch, studentClassFilter]);

  const openAddStudent = () => {
    setEditingStudent(null);
    setStdName('');
    setStdCode(`STD-${Math.floor(10000 + Math.random() * 90000)}`);
    setStdClass('ม.2/1');
    setStdNo('1');
    setStdStars(100);
    setIsStudentModalOpen(true);
  };

  const openEditStudent = (s: StudentRecord) => {
    setEditingStudent(s);
    setStdName(s.name);
    setStdCode(s.studentIdCode);
    setStdClass(s.classRoom);
    setStdNo(s.studentNo);
    setStdStars(s.totalStars);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stdName.trim()) return;

    if (editingStudent) {
      const updated: StudentRecord = {
        ...editingStudent,
        name: stdName.trim(),
        studentIdCode: stdCode.trim(),
        classRoom: stdClass.trim(),
        studentNo: stdNo.trim(),
        totalStars: stdStars,
      };
      if (onUpdateStudentRecord) onUpdateStudentRecord(updated);
      showToast('แก้ไขข้อมูลสมุดคะแนนเรียบร้อย');
    } else {
      const newRec: StudentRecord = {
        id: 'std-' + Date.now(),
        name: stdName.trim(),
        studentIdCode: stdCode.trim() || `STD-${Date.now().toString().slice(-5)}`,
        classRoom: stdClass.trim(),
        studentNo: stdNo.trim(),
        avatar: 'student-boy-glasses',
        totalStars: stdStars,
        unlockedStickers: ['first-step'],
        awardedBadges: [],
        homeworkCount: 0,
        quizScores: {},
      };
      if (onAddStudentRecord) onAddStudentRecord(newRec);
      showToast('เพิ่มนักเรียนในสมุดคะแนนสำเร็จ');
    }
    setIsStudentModalOpen(false);
  };

  // =================================================================
  // 8. GRADEBOOK / EVALUATIONS (ตารางกรอกคะแนน) CRUD + SEARCH
  // =================================================================
  const [evalSearch, setEvalSearch] = useState('');
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState<TeacherEvaluation | null>(null);

  const [evalStudentName, setEvalStudentName] = useState('');
  const [evalClass, setEvalClass] = useState('ม.2/1');
  const [evalTopic, setEvalTopic] = useState('การสะท้อนคิดเรื่อง เทคโนโลยีสะอาด');
  const [evalRating, setEvalRating] = useState<number>(5);
  const [evalFeedback, setEvalFeedback] = useState('มีความเข้าใจในเนื้อหาอย่างลึกซึ้ง');
  const [evalReply, setEvalReply] = useState('ครูเห็นด้วย ขอให้ต่อยอดความคิดนี้ต่อไป');

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((e) => {
      return (
        e.studentName.toLowerCase().includes(evalSearch.toLowerCase()) ||
        e.topicTitle.toLowerCase().includes(evalSearch.toLowerCase()) ||
        e.studentClass.toLowerCase().includes(evalSearch.toLowerCase()) ||
        e.teacherFeedback.toLowerCase().includes(evalSearch.toLowerCase())
      );
    });
  }, [evaluations, evalSearch]);

  const openAddEval = () => {
    setEditingEval(null);
    setEvalStudentName('');
    setEvalClass('ม.2/1');
    setEvalTopic(reflectionTopics[0]?.title || 'กิจกรรมสะท้อนคิด');
    setEvalRating(5);
    setEvalFeedback('มีความคิดสร้างสรรค์ ยอดเยี่ยม');
    setEvalReply('ครูภูมิใจในความก้าวหน้า');
    setIsEvalModalOpen(true);
  };

  const openEditEval = (ev: TeacherEvaluation) => {
    setEditingEval(ev);
    setEvalStudentName(ev.studentName);
    setEvalClass(ev.studentClass);
    setEvalTopic(ev.topicTitle);
    setEvalRating(ev.ratingStars);
    setEvalFeedback(ev.teacherFeedback);
    setEvalReply(ev.teacherReply || '');
    setIsEvalModalOpen(true);
  };

  const handleSaveEval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalStudentName.trim() || !evalTopic.trim()) return;

    if (editingEval) {
      const updated: TeacherEvaluation = {
        ...editingEval,
        studentName: evalStudentName.trim(),
        studentClass: evalClass.trim(),
        topicTitle: evalTopic.trim(),
        ratingStars: evalRating,
        improvementText: evalFeedback.trim(),
        recommendationText: evalReply.trim(),
        teacherFeedback: evalFeedback.trim(),
        teacherReply: evalReply.trim(),
      };
      if (onUpdateEvaluation) onUpdateEvaluation(updated);
      showToast('แก้ไขข้อมูลตารางกรอกคะแนนเรียบร้อย');
    } else {
      const newEv: TeacherEvaluation = {
        id: 'eval-' + Date.now(),
        studentId: 'std-' + Date.now(),
        studentName: evalStudentName.trim(),
        studentNo: '1',
        studentClass: evalClass.trim(),
        topicId: 'topic-custom',
        topicTitle: evalTopic.trim(),
        assessmentType: 'Assessment for Learning',
        ratingStars: evalRating,
        improvementText: evalFeedback.trim(),
        recommendationText: evalReply.trim(),
        teacherFeedback: evalFeedback.trim(),
        teacherReply: evalReply.trim(),
        submittedAt: new Date().toLocaleDateString('th-TH'),
        isAnonymous: false,
      };
      if (onAddEvaluation) onAddEvaluation(newEv);
      showToast('บันทึกการประเมินเรียบร้อย');
    }
    setIsEvalModalOpen(false);
  };

  // =================================================================
  // 9. REFLECTION TOPICS & WHITEBOARD CRUD + SEARCH
  // =================================================================
  const [topicSearch, setTopicSearch] = useState('');
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TeacherReflectionTopic | null>(null);

  const [tTitle, setTTitle] = useState('');
  const [tPrompt, setTPrompt] = useState('');
  const [tCategory, setTCategory] = useState('การเรียนรู้ & ความเข้าใจ');
  const [tClass, setTClass] = useState('ทุกห้อง');

  const filteredTopics = useMemo(() => {
    return reflectionTopics.filter((t) => {
      return (
        t.title.toLowerCase().includes(topicSearch.toLowerCase()) ||
        t.promptQuestion.toLowerCase().includes(topicSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(topicSearch.toLowerCase())
      );
    });
  }, [reflectionTopics, topicSearch]);

  const openAddTopic = () => {
    setEditingTopic(null);
    setTTitle('');
    setTPrompt('');
    setTCategory('การเรียนรู้ & ความเข้าใจ');
    setTClass('ทุกห้อง');
    setIsTopicModalOpen(true);
  };

  const openEditTopic = (top: TeacherReflectionTopic) => {
    setEditingTopic(top);
    setTTitle(top.title);
    setTPrompt(top.promptQuestion);
    setTCategory(top.category);
    setTClass(top.targetClass || 'ทุกห้อง');
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tTitle.trim() || !tPrompt.trim()) return;

    if (editingTopic) {
      const updated: TeacherReflectionTopic = {
        ...editingTopic,
        title: tTitle.trim(),
        promptQuestion: tPrompt.trim(),
        category: tCategory.trim(),
        targetClass: tClass.trim(),
      };
      if (onUpdateReflectionTopic) onUpdateReflectionTopic(updated);
      showToast('แก้ไขหัวข้อสะท้อนคิดเรียบร้อย');
    } else {
      const newTop: TeacherReflectionTopic = {
        id: 'ref-' + Date.now(),
        title: tTitle.trim(),
        promptQuestion: tPrompt.trim(),
        category: tCategory.trim(),
        targetClass: tClass.trim(),
        assessmentType: 'Assessment for Learning',
        createdAt: new Date().toLocaleDateString('th-TH'),
        authorTeacher: currentUser.name,
      };
      if (onAddReflectionTopic) onAddReflectionTopic(newTop);
      showToast('เพิ่มหัวข้อสะท้อนคิดสำเร็จ');
    }
    setIsTopicModalOpen(false);
  };

  // =================================================================
  // 10. CONVERSATION FORMATS & TOPIC PRESETS
  // =================================================================
  const [customPresets, setCustomPresets] = useState<CustomTopicPreset[]>(() => {
    return safeGetItem<CustomTopicPreset[]>('hw_box_custom_topic_presets', []);
  });
  const [presetSearch, setPresetSearch] = useState('');
  const [presetCategoryFilter, setPresetCategoryFilter] = useState('all');
  const [isAddingPresetModalOpen, setIsAddingPresetModalOpen] = useState(false);

  const [newPresetCategory, setNewPresetCategory] = useState('');
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetTitle, setNewPresetTitle] = useState('');
  const [newPresetPrompt, setNewPresetPrompt] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');

  const allPresets = useMemo(() => {
    return [
      ...TOPIC_PRESETS.map((p, idx) => ({ ...p, id: `preset-std-${idx}`, isCustom: false })),
      ...customPresets.map((c) => ({
        id: c.id,
        category: c.category,
        label: c.label,
        defaultTitle: c.defaultTitle,
        defaultPrompt: c.defaultPrompt,
        isCustom: true,
      })),
    ];
  }, [customPresets]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(allPresets.map((p) => p.category)));
  }, [allPresets]);

  const filteredPresets = useMemo(() => {
    let list = allPresets;
    if (presetCategoryFilter !== 'all') {
      list = list.filter((p) => p.category === presetCategoryFilter);
    }
    if (presetSearch.trim()) {
      const q = presetSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.category.toLowerCase().includes(q) ||
          p.label.toLowerCase().includes(q) ||
          p.defaultTitle.toLowerCase().includes(q) ||
          p.defaultPrompt.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allPresets, presetCategoryFilter, presetSearch]);

  const handleSaveNewPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetCategory.trim() || !newPresetTitle.trim() || !newPresetPrompt.trim()) return;

    const newPreset: CustomTopicPreset = {
      id: 'preset-' + Date.now(),
      category: newPresetCategory.trim(),
      label: newPresetLabel.trim() || `${newPresetCategory.trim()} (${newPresetTitle.trim()})`,
      defaultTitle: newPresetTitle.trim(),
      defaultPrompt: newPresetPrompt.trim(),
      description: newPresetDesc.trim(),
      createdBy: currentUser.name,
      createdAt: new Date().toLocaleDateString('th-TH'),
    };

    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    safeSetItem('hw_box_custom_topic_presets', updated);
    if (onCustomPresetsChange) onCustomPresetsChange(updated);

    setNewPresetCategory('');
    setNewPresetLabel('');
    setNewPresetTitle('');
    setNewPresetPrompt('');
    setNewPresetDesc('');
    setIsAddingPresetModalOpen(false);
    triggerFestiveConfetti();
    showToast('เพิ่มรูปแบบการสนทนาใหม่เรียบร้อย');
  };

  const handleDeleteCustomPreset = (presetId: string) => {
    const updated = customPresets.filter((p) => p.id !== presetId);
    setCustomPresets(updated);
    safeSetItem('hw_box_custom_topic_presets', updated);
    if (onCustomPresetsChange) onCustomPresetsChange(updated);
    showToast('ลบรูปแบบการสนทนาเรียบร้อย');
  };

  // =================================================================
  // 11. REPORTS GENERATOR (CSV EXPORT & OFFICIAL PRINT PREVIEW MODAL)
  // =================================================================
  // =================================================================
  // 11. REPORTS GENERATOR (CSV EXPORT & OFFICIAL PRINT PREVIEW MODAL)
  // =================================================================
  const [reportType, setReportType] = useState<'overview' | 'homework' | 'quiz' | 'scorebook' | 'reflection'>('overview');
  const [reportClassFilter, setReportClassFilter] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Admin credentials for report verification & official documentation
  const adminUsername = currentUser.usernameOrEmail || (currentUser.googleEmail ? currentUser.googleEmail.split('@')[0] : 'admin');
  const adminPassword = currentUser.password || 'admin123';

  // Flexible classroom matcher (supports typing e.g. "1", "ม.1", "ห้อง 1", case-insensitive)
  const isClassMatched = useCallback(
    (targetClass?: string) => {
      const q = (reportClassFilter || '').trim().toLowerCase();
      if (!q || q === 'all' || q === 'ทุกห้อง' || q === 'ทุกห้องเรียน') return true;
      if (!targetClass) return false;
      return targetClass.toLowerCase().includes(q);
    },
    [reportClassFilter]
  );

  // Available classes across datasets
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    studentRecords.forEach((s) => s.classRoom && set.add(s.classRoom));
    homeworkList.forEach((h) => h.studentClass && set.add(h.studentClass));
    examScores.forEach((e) => e.studentClass && set.add(e.studentClass));
    return Array.from(set).sort();
  }, [studentRecords, homeworkList, examScores]);

  // Computed student roster for Overview reports (Student Name first)
  const overviewStudents = useMemo(() => {
    const filtered = studentRecords.filter((s) => isClassMatched(s.classRoom));
    return filtered.map((s) => {
      const myHws = homeworkList.filter(
        (h) =>
          (h.studentId && h.studentId === s.id) ||
          (h.studentName && h.studentName.toLowerCase() === s.name.toLowerCase())
      );
      const gradedHws = myHws.filter((h) => h.status === 'graded');
      const passedHws = gradedHws.filter((h) => (h.score || 0) >= (h.maxScore || 10) * 0.6);

      const myExams = examScores.filter(
        (e) =>
          (e.studentId && e.studentId === s.id) ||
          (e.studentName && e.studentName.toLowerCase() === s.name.toLowerCase())
      );
      const passedExams = myExams.filter((e) => e.score >= (e.maxScore || 10) * 0.6);
      const avgExamPct =
        myExams.length > 0
          ? Math.round(
              myExams.reduce((sum, e) => sum + (e.score / (e.maxScore || 1)) * 100, 0) /
                myExams.length
            )
          : 0;

      const myEvals = evaluations.filter(
        (e) =>
          (e.studentId && e.studentId === s.id) ||
          (e.studentName && e.studentName.toLowerCase() === s.name.toLowerCase())
      );
      const avgMood =
        myEvals.length > 0
          ? (myEvals.reduce((sum, e) => sum + e.ratingStars, 0) / myEvals.length).toFixed(1)
          : '-';

      const isTop = (s.totalStars || 0) >= 150 && (avgExamPct >= 75 || myHws.length >= 2);
      const isPass = (avgExamPct >= 60 || myExams.length === 0) && (passedHws.length >= gradedHws.length * 0.6);
      const statusLabel = isTop ? 'ดีเยี่ยม' : isPass ? 'ผ่านเกณฑ์' : 'ควรติดตาม';

      return {
        id: s.id,
        name: s.name,
        studentNo: s.studentNo || '-',
        studentIdCode: s.studentIdCode || '-',
        classRoom: s.classRoom || '-',
        avatar: s.avatar,
        hwTotal: myHws.length,
        hwGraded: gradedHws.length,
        hwPassed: passedHws.length,
        examCount: myExams.length,
        examPassed: passedExams.length,
        avgExamPct,
        stars: s.totalStars || 0,
        evalCount: myEvals.length,
        avgMood,
        statusLabel,
      };
    });
  }, [studentRecords, isClassMatched, homeworkList, examScores, evaluations]);

  // CSV Generator Helper (with UTF-8 BOM \uFEFF for Excel Thai font rendering)
  const downloadCSV = (
    filename: string,
    headers: string[],
    rows: (string | number)[][],
    metaRows?: (string | number)[][]
  ) => {
    const metaLines = metaRows
      ? metaRows.map((r) =>
          r.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
        )
      : [];

    const dataLines = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((r) =>
        r.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ];

    const csvContent =
      '\uFEFF' +
      (metaLines.length > 0 ? metaLines.join('\r\n') + '\r\n' : '') +
      dataLines.join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerStarBurst();
    showToast(`ดาวน์โหลดไฟล์ ${filename}.csv สำเร็จ`);
  };

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const dateThai = new Date().toLocaleDateString('th-TH', { dateStyle: 'long' });
    const classLabel = reportClassFilter.trim() ? reportClassFilter : 'ทุกห้องเรียน';

    // Official metadata rows with Admin username
    const metaRows: (string | number)[][] = [
      ['รายงานสรุประบบสารสนเทศและการเรียนรู้ TaskHub'],
      ['หัวข้อรายงาน', reportStats.title],
      ['ห้องเรียนที่เลือก', classLabel],
      ['วันที่ออกรายงาน', dateThai],
      ['ผู้จัดทำรายงาน (Admin)', currentUser.name],
      ['ชื่อผู้ใช้งานแอดมิน (Admin Username)', adminUsername],
      ['จำนวนรายการทั้งหมด', `${reportStats.total} รายการ`],
      [],
    ];

    if (reportType === 'overview') {
      const fHw = homeworkList.filter((h) => isClassMatched(h.studentClass));
      const fExam = examScores.filter((s) => isClassMatched(s.studentClass));
      const fStudents = studentRecords.filter((s) => isClassMatched(s.classRoom));
      const fEvals = evaluations.filter((e) => isClassMatched(e.studentClass));

      const gradedHw = fHw.filter((h) => h.status === 'graded');
      const hwPass = gradedHw.filter((h) => (h.score || 0) >= (h.maxScore || 10) * 0.6).length;
      const hwGradedPct = fHw.length > 0 ? Math.round((gradedHw.length / fHw.length) * 100) : 100;
      const hwPassPct = gradedHw.length > 0 ? Math.round((hwPass / gradedHw.length) * 100) : 100;
      const examPass = fExam.filter((s) => s.score >= (s.maxScore || 10) * 0.6).length;
      const examPassPct = fExam.length > 0 ? Math.round((examPass / fExam.length) * 100) : 100;

      const headers = [
        'ลำดับ',
        'ชื่อ - นามสกุล นักเรียน',
        'ห้องเรียน',
        'เลขที่',
        'การบ้านที่ส่ง (งาน)',
        'การบ้านที่ตรวจแล้ว',
        'การสอบ (ครั้ง)',
        'คะแนนสอบเฉลี่ย (%)',
        'ดาวสะสม (ดวง)',
        'มุมสะท้อนคิด (เรื่อง)',
        'ผลการประเมิน',
      ];
      const studentRows = overviewStudents.map((st, i) => [
        i + 1,
        st.name,
        st.classRoom,
        st.studentNo,
        st.hwTotal,
        st.hwGraded,
        st.examCount,
        `${st.avgExamPct}%`,
        st.stars,
        st.evalCount,
        st.statusLabel,
      ]);

      const summaryRows: (string | number)[][] = [
        [],
        ['=== สรุปผลการประเมิน ๔ มิติหลัก (Executive Summary Matrix) ===', '', '', '', '', '', '', '', '', '', ''],
        ['มิติการประเมิน (Pillar)', 'รายการตัวชี้วัด', 'ข้อมูลสถิติที่บันทึก', 'ร้อยละความสำเร็จ / ค่าเฉลี่ย', 'เกณฑ์การประเมิน', '', '', '', '', '', ''],
        ['๑. การส่งการบ้านและภาระงาน', 'จำนวนชิ้นงานที่นักเรียนส่งทั้งหมด', `${fHw.length} รายการ (ตรวจเสร็จสิ้น ${hwGradedPct}%)`, `ผ่านเกณฑ์ ${hwPassPct}%`, hwPassPct >= 70 ? 'ดีเยี่ยม' : 'ผ่านเกณฑ์', '', '', '', '', '', ''],
        ['๒. ผลสัมฤทธิ์แบบทดสอบ', 'จำนวนครั้งที่เข้าสอบรวม', `${fExam.length} ครั้ง (เฉลี่ย ${reportStats.overview?.avgExamScore || 0} คะแนน)`, `ผ่านเกณฑ์ ${examPassPct}%`, examPassPct >= 60 ? 'ผ่านเกณฑ์' : 'ต้องพัฒนา', '', '', '', '', '', ''],
        ['๓. สมุดคะแนนและดาวสะสม', 'นักเรียนที่มีข้อมูลในระบบ', `${fStudents.length} คน (รวม ${reportStats.overview?.totalStars || 0} ⭐)`, `เฉลี่ย ${reportStats.overview?.avgStars || 0} ดวง/คน`, 'มีส่วนร่วมสม่ำเสมอ', '', '', '', '', '', ''],
        ['๔. มุมสะท้อนความคิด', 'รายการสะท้อนคิดของนักเรียน', `${fEvals.length} หัวข้อ (เฉลี่ย ${reportStats.overview?.avgEvalRating || 0}/5 ⭐)`, `พึงพอใจ ${reportStats.overview?.evalHappyPct || 0}%`, 'ดูแลใกล้ชิด', '', '', '', '', '', ''],
      ];

      downloadCSV(`รายงานสรุปภาพรวมระบบทั้งหมด_${timestamp}`, headers, [...studentRows, ...summaryRows], metaRows);
    } else if (reportType === 'homework') {
      const filtered = homeworkList.filter((h) => isClassMatched(h.studentClass));
      const headers = ['ลำดับ', 'ชื่อนักเรียน', 'ชั้นเรียน', 'เลขที่', 'ชิ้นงาน/การบ้าน', 'วิชา', 'คะแนน', 'คะแนนเต็ม', 'สถานะ', 'วันที่ส่ง', 'ความเห็นครู'];
      const rows = filtered.map((h, i) => [
        i + 1,
        h.studentName,
        h.studentClass,
        h.studentNo || '-',
        h.title,
        h.subject || '-',
        h.score ?? '-',
        h.maxScore ?? '-',
        h.status === 'graded' ? 'ตรวจแล้ว' : 'รอตรวจ',
        h.submittedAt,
        h.teacherFeedback || '-',
      ]);
      downloadCSV(`รายงานการส่งการบ้าน_${timestamp}`, headers, rows, metaRows);
    } else if (reportType === 'quiz') {
      const filtered = examScores.filter((s) => isClassMatched(s.studentClass));
      const headers = ['ลำดับ', 'ชื่อนักเรียน', 'ชั้นเรียน', 'เลขที่', 'แบบทดสอบ', 'คะแนนที่ได้', 'คะแนนเต็ม', 'ร้อยละ', 'ผลการประเมิน', 'วันที่บันทึก'];
      const rows = filtered.map((s, i) => {
        const pct = Math.round((s.score / (s.maxScore || 1)) * 100);
        return [
          i + 1,
          s.studentName,
          s.studentClass || '-',
          s.studentNo || '-',
          s.lessonTitle,
          s.score,
          s.maxScore,
          `${pct}%`,
          pct >= 60 ? 'ผ่านเกณฑ์' : 'ควรปรับปรุง',
          s.submittedAt,
        ];
      });
      downloadCSV(`รายงานคะแนนแบบทดสอบ_${timestamp}`, headers, rows, metaRows);
    } else if (reportType === 'scorebook') {
      const filtered = studentRecords.filter((s) => isClassMatched(s.classRoom));
      const headers = ['ลำดับ', 'รหัสนักเรียน', 'ชื่อ - สกุล', 'ชั้นเรียน', 'เลขที่', 'ดาวสะสมรวม (ดวง)', 'จำนวนการบ้านที่ส่ง', 'จำนวนตราสัญลักษณ์/สติกเกอร์'];
      const rows = filtered.map((s, i) => [
        i + 1,
        s.studentIdCode,
        s.name,
        s.classRoom,
        s.studentNo,
        s.totalStars,
        s.homeworkCount || 0,
        s.unlockedStickers.length,
      ]);
      downloadCSV(`รายงานสรุปคะแนนนักเรียน_${timestamp}`, headers, rows, metaRows);
    } else {
      const filtered = evaluations.filter((e) => isClassMatched(e.studentClass));
      const headers = ['ลำดับ', 'ชื่อนักเรียน', 'ชั้นเรียน', 'หัวข้อสะท้อนคิด', 'ประเภทการประเมิน', 'ระดับดาวประเมิน (1-5)', 'ความคิดเห็นการสะท้อนคิด', 'การตอบกลับของคุณครู', 'วันที่'];
      const rows = filtered.map((e, i) => [
        i + 1,
        e.studentName,
        e.studentClass,
        e.topicTitle,
        e.assessmentType,
        e.ratingStars,
        e.teacherFeedback,
        e.teacherReply || '-',
        e.submittedAt,
      ]);
      downloadCSV(`รายงานมุมสะท้อนความคิด_${timestamp}`, headers, rows, metaRows);
    }
  };

  // Report statistics for letterhead & analysis box
  const reportStats = useMemo(() => {
    if (reportType === 'overview') {
      const fHw = homeworkList.filter((h) => isClassMatched(h.studentClass));
      const fExam = examScores.filter((s) => isClassMatched(s.studentClass));
      const fStudents = studentRecords.filter((s) => isClassMatched(s.classRoom));
      const fEvals = evaluations.filter((e) => isClassMatched(e.studentClass));

      const gradedHw = fHw.filter((h) => h.status === 'graded');
      const hwPass = gradedHw.filter((h) => (h.score || 0) >= (h.maxScore || 10) * 0.6).length;
      const hwGradedPct = fHw.length > 0 ? Math.round((gradedHw.length / fHw.length) * 100) : 100;
      const hwPassPct = gradedHw.length > 0 ? Math.round((hwPass / gradedHw.length) * 100) : 100;

      const examPass = fExam.filter((s) => s.score >= (s.maxScore || 10) * 0.6).length;
      const examPassPct = fExam.length > 0 ? Math.round((examPass / fExam.length) * 100) : 100;
      const totalExamScore = fExam.reduce((sum, s) => sum + s.score, 0);
      const avgExamScore = fExam.length > 0 ? (totalExamScore / fExam.length).toFixed(1) : '0';

      const totalStars = fStudents.reduce((sum, s) => sum + s.totalStars, 0);
      const avgStars = fStudents.length > 0 ? (totalStars / fStudents.length).toFixed(0) : '0';

      const totalEvalStars = fEvals.reduce((sum, e) => sum + e.ratingStars, 0);
      const avgEvalRating = fEvals.length > 0 ? (totalEvalStars / fEvals.length).toFixed(1) : '0';
      const evalHappyCount = fEvals.filter((e) => e.ratingStars >= 4).length;
      const evalHappyPct = fEvals.length > 0 ? Math.round((evalHappyCount / fEvals.length) * 100) : 100;

      const overallPassPct = Math.round(((hwPassPct + examPassPct) / 2) || 90);

      return {
        total: fHw.length + fExam.length + fStudents.length + fEvals.length,
        submitted: fHw.length + fExam.length,
        gradedCount: gradedHw.length + fExam.length,
        avg: `สอบ ${avgExamScore} / การบ้านผ่าน ${hwPassPct}%`,
        passedCount: hwPass + examPass,
        passedPct: overallPassPct,
        title: 'ภาพรวมระบบสารสนเทศ การจัดการเรียนรู้ และผลสัมฤทธิ์ทางการศึกษา',
        code: '๐๐',
        overview: {
          totalStudents: fStudents.length,
          totalHw: fHw.length,
          gradedHwCount: gradedHw.length,
          hwGradedPct,
          hwPassPct,
          totalExams: fExam.length,
          examPassPct,
          avgExamScore,
          totalStars,
          avgStars,
          totalEvals: fEvals.length,
          avgEvalRating,
          evalHappyPct,
        },
      };
    } else if (reportType === 'homework') {
      const filtered = homeworkList.filter((h) => isClassMatched(h.studentClass));
      const graded = filtered.filter((h) => h.status === 'graded');
      const totalScore = graded.reduce((sum, h) => sum + (h.score || 0), 0);
      const avgScore = graded.length > 0 ? (totalScore / graded.length).toFixed(1) : '0';
      const passed = graded.filter((h) => (h.score || 0) >= (h.maxScore || 10) * 0.6).length;
      return {
        total: filtered.length,
        submitted: filtered.length,
        gradedCount: graded.length,
        avg: avgScore,
        passedCount: passed,
        passedPct: graded.length > 0 ? Math.round((passed / graded.length) * 100) : 0,
        title: 'การส่งการบ้านและชิ้นงานภาระงาน',
        code: '๐๑',
        overview: undefined,
      };
    } else if (reportType === 'quiz') {
      const filtered = examScores.filter((s) => isClassMatched(s.studentClass));
      const totalScore = filtered.reduce((sum, s) => sum + s.score, 0);
      const avgScore = filtered.length > 0 ? (totalScore / filtered.length).toFixed(1) : '0';
      const passed = filtered.filter((s) => s.score >= (s.maxScore || 10) * 0.6).length;
      return {
        total: filtered.length,
        submitted: filtered.length,
        gradedCount: filtered.length,
        avg: avgScore,
        passedCount: passed,
        passedPct: filtered.length > 0 ? Math.round((passed / filtered.length) * 100) : 0,
        title: 'ผลสัมฤทธิ์คะแนนแบบทดสอบวัดผลการเรียนรู้',
        code: '๐๒',
        overview: undefined,
      };
    } else if (reportType === 'scorebook') {
      const filtered = studentRecords.filter((s) => isClassMatched(s.classRoom));
      const totalStars = filtered.reduce((sum, s) => sum + s.totalStars, 0);
      const avgStars = filtered.length > 0 ? (totalStars / filtered.length).toFixed(0) : '0';
      const passed = filtered.filter((s) => s.totalStars >= 100).length;
      return {
        total: filtered.length,
        submitted: filtered.length,
        gradedCount: filtered.length,
        avg: avgStars,
        passedCount: passed,
        passedPct: filtered.length > 0 ? Math.round((passed / filtered.length) * 100) : 0,
        title: 'สมุดคะแนนและดาวสะสมเกียรติยศนักเรียน',
        code: '๐๓',
        overview: undefined,
      };
    } else {
      const filtered = evaluations.filter((e) => isClassMatched(e.studentClass));
      const totalStars = filtered.reduce((sum, e) => sum + e.ratingStars, 0);
      const avgStars = filtered.length > 0 ? (totalStars / filtered.length).toFixed(1) : '0';
      const passed = filtered.filter((e) => e.ratingStars >= 3).length;
      return {
        total: filtered.length,
        submitted: filtered.length,
        gradedCount: filtered.length,
        avg: avgStars,
        passedCount: passed,
        passedPct: filtered.length > 0 ? Math.round((passed / filtered.length) * 100) : 0,
        title: 'มุมสะท้อนความคิดและการประเมินการเรียนรู้',
        code: '๐๔',
        overview: undefined,
      };
    }
  }, [reportType, isClassMatched, homeworkList, examScores, studentRecords, evaluations]);

  // Column Bar Chart metrics per report category (แผนภูมิแท่ง)
  const currentChartBars = useMemo(() => {
    if (reportType === 'overview') {
      const o = reportStats.overview;
      if (!o) return [];
      return [
        {
          id: 'hw_graded',
          shortLabel: 'ตรวจการบ้าน',
          value: o.hwGradedPct || 100,
          displayValue: `${o.hwGradedPct || 100}%`,
          barColor: 'bg-emerald-500',
          textColor: 'text-emerald-700',
          note: `${o.gradedHwCount}/${o.totalHw} งาน`,
        },
        {
          id: 'hw_pass',
          shortLabel: 'การบ้านผ่าน',
          value: o.hwPassPct || 100,
          displayValue: `${o.hwPassPct || 100}%`,
          barColor: 'bg-teal-500',
          textColor: 'text-teal-700',
          note: 'เกณฑ์ ≥60%',
        },
        {
          id: 'quiz_pass',
          shortLabel: 'สอบผ่านเกณฑ์',
          value: o.examPassPct || 100,
          displayValue: `${o.examPassPct || 100}%`,
          barColor: 'bg-purple-500',
          textColor: 'text-purple-700',
          note: `${o.totalExams} ครั้ง`,
        },
        {
          id: 'exam_avg',
          shortLabel: 'คะแนนสอบเฉลี่ย',
          value: Math.min(100, Math.round((Number(o.avgExamScore || 0) / 10) * 100)),
          displayValue: `${o.avgExamScore || 0}/10`,
          barColor: 'bg-blue-500',
          textColor: 'text-blue-700',
          note: 'คิดเป็น %',
        },
        {
          id: 'stars_active',
          shortLabel: 'ดาวสะสม/คน',
          value: Math.min(100, Math.round(((Number(o.avgStars || 50)) / 200) * 100)),
          displayValue: `${o.avgStars || 0} ⭐`,
          barColor: 'bg-amber-400',
          textColor: 'text-amber-800',
          note: 'เป้าหมาย 200',
        },
        {
          id: 'eval_happy',
          shortLabel: 'พึงพอใจการเรียน',
          value: o.evalHappyPct || 100,
          displayValue: `${o.evalHappyPct || 100}%`,
          barColor: 'bg-pink-500',
          textColor: 'text-pink-700',
          note: `${o.avgEvalRating}/5 ⭐`,
        },
      ];
    } else if (reportType === 'homework') {
      const filtered = homeworkList.filter((h) => isClassMatched(h.studentClass));
      const total = filtered.length || 1;
      const graded = filtered.filter((h) => h.status === 'graded').length;
      const pending = total - graded;
      const passed = filtered.filter((h) => (h.score || 0) >= (h.maxScore || 10) * 0.6).length;
      const gradedPct = Math.round((graded / total) * 100);
      const passPct = Math.round((passed / total) * 100);
      const pendingPct = Math.round((pending / total) * 100);
      return [
        {
          id: 'hw_total',
          shortLabel: 'ส่งงานทั้งหมด',
          value: 100,
          displayValue: `${total} งาน`,
          barColor: 'bg-stone-800',
          textColor: 'text-stone-900',
          note: '100%',
        },
        {
          id: 'hw_graded',
          shortLabel: 'ตรวจเสร็จแล้ว',
          value: gradedPct,
          displayValue: `${gradedPct}%`,
          barColor: 'bg-emerald-500',
          textColor: 'text-emerald-700',
          note: `${graded} งาน`,
        },
        {
          id: 'hw_pass',
          shortLabel: 'งานผ่านเกณฑ์',
          value: passPct,
          displayValue: `${passPct}%`,
          barColor: 'bg-teal-500',
          textColor: 'text-teal-700',
          note: `${passed} งาน`,
        },
        {
          id: 'hw_pending',
          shortLabel: 'งานรอตรวจ',
          value: pendingPct,
          displayValue: `${pendingPct}%`,
          barColor: 'bg-amber-500',
          textColor: 'text-amber-800',
          note: `${pending} งาน`,
        },
      ];
    } else if (reportType === 'quiz') {
      const filtered = examScores.filter((s) => isClassMatched(s.studentClass));
      const total = filtered.length || 1;
      const passed = filtered.filter((s) => s.score >= (s.maxScore || 10) * 0.6).length;
      const high = filtered.filter((s) => s.score >= (s.maxScore || 10) * 0.8).length;
      const mid = filtered.filter((s) => s.score >= (s.maxScore || 10) * 0.6 && s.score < (s.maxScore || 10) * 0.8).length;
      const low = total - passed;
      return [
        {
          id: 'quiz_pass',
          shortLabel: 'สอบผ่านเกณฑ์',
          value: Math.round((passed / total) * 100),
          displayValue: `${Math.round((passed / total) * 100)}%`,
          barColor: 'bg-purple-600',
          textColor: 'text-purple-700',
          note: `≥60% (${passed} คน)`,
        },
        {
          id: 'quiz_high',
          shortLabel: 'ระดับดีเยี่ยม',
          value: Math.round((high / total) * 100),
          displayValue: `${Math.round((high / total) * 100)}%`,
          barColor: 'bg-emerald-500',
          textColor: 'text-emerald-700',
          note: `≥80% (${high} คน)`,
        },
        {
          id: 'quiz_mid',
          shortLabel: 'ระดับปานกลาง',
          value: Math.round((mid / total) * 100),
          displayValue: `${Math.round((mid / total) * 100)}%`,
          barColor: 'bg-blue-500',
          textColor: 'text-blue-700',
          note: `60-79% (${mid} คน)`,
        },
        {
          id: 'quiz_low',
          shortLabel: 'ควรปรับปรุง',
          value: Math.round((low / total) * 100),
          displayValue: `${Math.round((low / total) * 100)}%`,
          barColor: 'bg-rose-500',
          textColor: 'text-rose-700',
          note: `<60% (${low} คน)`,
        },
      ];
    } else if (reportType === 'scorebook') {
      const filtered = studentRecords.filter((s) => isClassMatched(s.classRoom));
      const total = filtered.length || 1;
      const gold = filtered.filter((s) => (s.totalStars || 0) >= 200).length;
      const silver = filtered.filter((s) => (s.totalStars || 0) >= 100 && (s.totalStars || 0) < 200).length;
      const bronze = filtered.filter((s) => (s.totalStars || 0) < 100).length;
      const fullHw = filtered.filter((s) => (s.homeworkCount || 0) >= 5).length;
      return [
        {
          id: 'star_gold',
          shortLabel: 'ดาวทอง (>200)',
          value: Math.round((gold / total) * 100),
          displayValue: `${Math.round((gold / total) * 100)}%`,
          barColor: 'bg-amber-400',
          textColor: 'text-amber-800',
          note: `${gold} คน`,
        },
        {
          id: 'star_silver',
          shortLabel: 'ดาวเงิน (100-200)',
          value: Math.round((silver / total) * 100),
          displayValue: `${Math.round((silver / total) * 100)}%`,
          barColor: 'bg-slate-400',
          textColor: 'text-slate-700',
          note: `${silver} คน`,
        },
        {
          id: 'star_bronze',
          shortLabel: 'ดาวทองแดง (<100)',
          value: Math.round((bronze / total) * 100),
          displayValue: `${Math.round((bronze / total) * 100)}%`,
          barColor: 'bg-orange-400',
          textColor: 'text-orange-800',
          note: `${bronze} คน`,
        },
        {
          id: 'hw_completed',
          shortLabel: 'ส่งงานสม่ำเสมอ',
          value: Math.round((fullHw / total) * 100),
          displayValue: `${Math.round((fullHw / total) * 100)}%`,
          barColor: 'bg-emerald-500',
          textColor: 'text-emerald-700',
          note: `≥5 งาน (${fullHw} คน)`,
        },
      ];
    } else {
      const filtered = evaluations.filter((e) => isClassMatched(e.studentClass));
      const total = filtered.length || 1;
      const star5 = filtered.filter((e) => e.ratingStars === 5).length;
      const star4 = filtered.filter((e) => e.ratingStars === 4).length;
      const star3 = filtered.filter((e) => e.ratingStars === 3).length;
      const starLow = filtered.filter((e) => e.ratingStars <= 2).length;
      const replied = filtered.filter((e) => e.teacherReply).length;
      return [
        {
          id: 'eval_5',
          shortLabel: 'สุขมาก (5 ดาว)',
          value: Math.round((star5 / total) * 100),
          displayValue: `${Math.round((star5 / total) * 100)}%`,
          barColor: 'bg-pink-500',
          textColor: 'text-pink-700',
          note: `${star5} เรื่อง`,
        },
        {
          id: 'eval_4',
          shortLabel: 'สุขดี (4 ดาว)',
          value: Math.round((star4 / total) * 100),
          displayValue: `${Math.round((star4 / total) * 100)}%`,
          barColor: 'bg-purple-500',
          textColor: 'text-purple-700',
          note: `${star4} เรื่อง`,
        },
        {
          id: 'eval_3',
          shortLabel: 'ปานกลาง (3 ดาว)',
          value: Math.round((star3 / total) * 100),
          displayValue: `${Math.round((star3 / total) * 100)}%`,
          barColor: 'bg-amber-400',
          textColor: 'text-amber-800',
          note: `${star3} เรื่อง`,
        },
        {
          id: 'eval_low',
          shortLabel: 'ควรดูแล (1-2 ดาว)',
          value: Math.round((starLow / total) * 100),
          displayValue: `${Math.round((starLow / total) * 100)}%`,
          barColor: 'bg-rose-500',
          textColor: 'text-rose-700',
          note: `${starLow} เรื่อง`,
        },
        {
          id: 'eval_replied',
          shortLabel: 'ครูตอบกลับแล้ว',
          value: Math.round((replied / total) * 100),
          displayValue: `${Math.round((replied / total) * 100)}%`,
          barColor: 'bg-emerald-500',
          textColor: 'text-emerald-700',
          note: `${replied} เรื่อง`,
        },
      ];
    }
  }, [reportType, reportStats.overview, homeworkList, isClassMatched, examScores, studentRecords, evaluations]);

  // Word Document (.doc) Generator with Microsoft Word XML headers and UTF-8 BOM
  const downloadWordDoc = (filename: string, contentHtml: string) => {
    const docWrapper = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${filename}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt; /* A4 */
      margin: 1.0in 1.0in 1.0in 1.0in;
      mso-header-margin: 36.0pt;
      mso-footer-margin: 36.0pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'TH Sarabun New', 'TH SarabunPSK', 'Cordia New', Tahoma, sans-serif;
      font-size: 16pt;
      color: #000000;
      line-height: 1.25;
    }
    .header-center { text-align: center; }
    .garuda { font-size: 26pt; font-weight: bold; text-align: center; line-height: 1.1; margin-bottom: 6pt; }
    .title-large { font-size: 20pt; font-weight: bold; text-align: center; margin: 4pt 0; }
    .title-sub { font-size: 16pt; font-weight: bold; text-align: center; margin: 2pt 0; }
    .memo-table { width: 100%; border: none; margin-bottom: 12pt; border-collapse: collapse; }
    .memo-table td { border: none; padding: 2pt 4pt; font-size: 16pt; vertical-align: top; }
    .stat-table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
    .stat-table td, .stat-table th { border: 1pt solid #000; padding: 6pt; font-size: 14pt; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 10pt; }
    .data-table th { border: 1pt solid #000; padding: 6pt 4pt; background-color: #f2f2f2; font-weight: bold; text-align: center; font-size: 14pt; }
    .data-table td { border: 1pt solid #000; padding: 5pt 4pt; font-size: 14pt; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .sig-table { width: 100%; border-collapse: collapse; margin-top: 25pt; }
    .sig-table td { border: none; padding: 8pt 4pt; text-align: center; vertical-align: top; font-size: 14pt; width: 33.33%; }
  </style>
</head>
<body>
  <div class="Section1">
    ${contentHtml}
  </div>
</body>
</html>`;

    const blob = new Blob(['\uFEFF' + docWrapper], {
      type: 'application/msword;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `${filename}.doc`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerStarBurst();
    showToast(`ส่งออกเอกสาร ${filename}.doc สำเร็จ`);
  };

  const handleExportWordDoc = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const dateThai = new Date().toLocaleDateString('th-TH', { dateStyle: 'long' });
    const classLabel = reportClassFilter.trim() ? reportClassFilter : 'ทุกห้องเรียน';

    let tableHeaders = '';
    let tableRows = '';

    if (reportType === 'overview') {
      const fHw = homeworkList.filter((h) => isClassMatched(h.studentClass));
      const fExam = examScores.filter((s) => isClassMatched(s.studentClass));
      const fStudents = studentRecords.filter((s) => isClassMatched(s.classRoom));
      const fEvals = evaluations.filter((e) => isClassMatched(e.studentClass));
      const gradedHw = fHw.filter((h) => h.status === 'graded');
      const hwPass = gradedHw.filter((h) => (h.score || 0) >= (h.maxScore || 10) * 0.6).length;
      const hwGradedPct = fHw.length > 0 ? Math.round((gradedHw.length / fHw.length) * 100) : 100;
      const hwPassPct = gradedHw.length > 0 ? Math.round((hwPass / gradedHw.length) * 100) : 100;
      const examPass = fExam.filter((s) => s.score >= (s.maxScore || 10) * 0.6).length;
      const examPassPct = fExam.length > 0 ? Math.round((examPass / fExam.length) * 100) : 100;

      // 1. Student Roster Table FIRST (ขึ้นก่อน)
      tableHeaders = `<tr>
        <th style="width: 6%;">ลำดับ</th>
        <th style="width: 14%;">รหัสนักเรียน</th>
        <th style="width: 24%;">ชื่อ - นามสกุล นักเรียน</th>
        <th style="width: 12%;">ห้อง / เลขที่</th>
        <th style="width: 10%;">ส่งงาน (ชิ้น)</th>
        <th style="width: 12%;">ผลสอบเฉลี่ย</th>
        <th style="width: 10%;">ดาวสะสม</th>
        <th style="width: 12%;">ผลการประเมิน</th>
      </tr>`;
      tableRows = overviewStudents
        .map(
          (st, i) => `<tr>
        <td class="text-center">${i + 1}</td>
        <td class="text-center" style="font-family: monospace;">${st.studentIdCode}</td>
        <td class="bold">${st.name}</td>
        <td class="text-center">${st.classRoom} (${st.studentNo})</td>
        <td class="text-center">${st.hwTotal} งาน (ตรวจแล้ว ${st.hwGraded})</td>
        <td class="text-center bold">${st.avgExamPct}%</td>
        <td class="text-center bold" style="color: #b45309;">${st.stars} ⭐</td>
        <td class="text-center bold" style="color: ${st.statusLabel === 'ดีเยี่ยม' ? '#047857' : st.statusLabel === 'ผ่านเกณฑ์' ? '#1d4ed8' : '#b91c1c'};">${st.statusLabel}</td>
      </tr>`
        )
        .join('');
    } else if (reportType === 'homework') {
      const filtered = homeworkList.filter((h) => isClassMatched(h.studentClass));
      tableHeaders = `<tr>
        <th style="width: 8%;">ลำดับ</th>
        <th style="width: 25%;">ชื่อ - นามสกุล นักเรียน</th>
        <th style="width: 15%;">ห้อง/เลขที่</th>
        <th style="width: 27%;">ชิ้นงาน / ภาระงาน</th>
        <th style="width: 12%;">คะแนน</th>
        <th style="width: 13%;">สถานะ</th>
      </tr>`;
      tableRows = filtered
        .map(
          (h, i) => `<tr>
        <td class="text-center">${i + 1}</td>
        <td class="bold">${h.studentName}</td>
        <td class="text-center">${h.studentClass} (${h.studentNo || '-'})</td>
        <td>${h.title}</td>
        <td class="text-center bold">${h.score ?? '-'} / ${h.maxScore ?? 10}</td>
        <td class="text-center">${h.status === 'graded' ? 'ตรวจแล้ว' : 'รอตรวจ'}</td>
      </tr>`
        )
        .join('');
    } else if (reportType === 'quiz') {
      const filtered = examScores.filter((s) => isClassMatched(s.studentClass));
      tableHeaders = `<tr>
        <th style="width: 8%;">ลำดับ</th>
        <th style="width: 25%;">ชื่อ - นามสกุล นักเรียน</th>
        <th style="width: 15%;">ห้อง/เลขที่</th>
        <th style="width: 27%;">ชื่อแบบทดสอบ</th>
        <th style="width: 12%;">คะแนนที่ได้</th>
        <th style="width: 13%;">ผลการประเมิน</th>
      </tr>`;
      tableRows = filtered
        .map((s, i) => {
          const pct = Math.round((s.score / (s.maxScore || 1)) * 100);
          return `<tr>
          <td class="text-center">${i + 1}</td>
          <td class="bold">${s.studentName}</td>
          <td class="text-center">${s.studentClass || '-'} (${s.studentNo || '-'})</td>
          <td>${s.lessonTitle}</td>
          <td class="text-center bold">${s.score} / ${s.maxScore} (${pct}%)</td>
          <td class="text-center bold">${pct >= 60 ? 'ผ่านเกณฑ์' : 'ควรปรับปรุง'}</td>
        </tr>`;
        })
        .join('');
    } else if (reportType === 'scorebook') {
      const filtered = studentRecords.filter((s) => isClassMatched(s.classRoom));
      tableHeaders = `<tr>
        <th style="width: 8%;">ลำดับ</th>
        <th style="width: 18%;">รหัสนักเรียน</th>
        <th style="width: 26%;">ชื่อ - นามสกุล นักเรียน</th>
        <th style="width: 16%;">ชั้น / เลขที่</th>
        <th style="width: 16%;">ดาวสะสม (ดวง)</th>
        <th style="width: 16%;">งานที่ส่งแล้ว</th>
      </tr>`;
      tableRows = filtered
        .map(
          (s, i) => `<tr>
        <td class="text-center">${i + 1}</td>
        <td class="text-center font-mono">${s.studentIdCode}</td>
        <td class="bold">${s.name}</td>
        <td class="text-center">${s.classRoom} (${s.studentNo})</td>
        <td class="text-center bold">${s.totalStars} ⭐</td>
        <td class="text-center">${s.homeworkCount || 0} ชิ้น</td>
      </tr>`
        )
        .join('');
    } else {
      const filtered = evaluations.filter((e) => isClassMatched(e.studentClass));
      tableHeaders = `<tr>
        <th style="width: 8%;">ลำดับ</th>
        <th style="width: 24%;">ชื่อ - นามสกุล นักเรียน</th>
        <th style="width: 14%;">ห้องเรียน</th>
        <th style="width: 26%;">หัวข้อการสะท้อนคิด</th>
        <th style="width: 14%;">ระดับประเมิน</th>
        <th style="width: 14%;">การตอบกลับ</th>
      </tr>`;
      tableRows = filtered
        .map(
          (e, i) => `<tr>
        <td class="text-center">${i + 1}</td>
        <td class="bold">${e.studentName}</td>
        <td class="text-center">${e.studentClass}</td>
        <td>${e.topicTitle}</td>
        <td class="text-center bold">${e.ratingStars} / 5 ⭐</td>
        <td class="text-center">${e.teacherReply ? 'ตอบกลับแล้ว' : 'รอการตอบกลับ'}</td>
      </tr>`
        )
        .join('');
    }

    const htmlContent = `
      <div class="header-center">
        <div class="garuda">ตราครุฑ</div>
        <div class="title-large">บันทึกข้อความ</div>
      </div>
      <table class="memo-table">
        <tr>
          <td style="width: 18%; font-weight: bold;">ส่วนราชการ</td>
          <td style="width: 82%;">กลุ่มบริหารงานวิชาการและวัดผล โรงเรียนมัธยมศึกษา TaskHub สำนักงานเขตพื้นที่การศึกษามัธยมศึกษา</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ที่</td>
          <td>ศธ ๐๔๒๒๕/รป.๒๕๖๙-${reportStats.code} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>วันที่</b> ${dateThai}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">เรื่อง</td>
          <td><b>รายงานสรุป${reportStats.title} ประจำภาคเรียนที่ ๑ ปีการศึกษา ๒๕๖๙</b></td>
        </tr>
        <tr>
          <td style="font-weight: bold;">เรียน</td>
          <td>ผู้อำนวยการโรงเรียนมัธยมศึกษา TaskHub</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ผู้ดูแลระบบ (Admin)</td>
          <td>${currentUser.name} &nbsp;&nbsp;|&nbsp;&nbsp; <b>ชื่อผู้ใช้ (Username):</b> <code>${adminUsername}</code></td>
        </tr>
      </table>

      <p style="text-indent: 2.5em; line-height: 1.5; margin: 10pt 0;">
        ตามที่กลุ่มบริหารงานวิชาการ ได้ดำเนินการจัดการเรียนรู้และการวัดประเมินผลผู้เรียนผ่านระบบสารสนเทศและการบริหารจัดการการเรียนรู้ TaskHub ในระดับชั้นเรียน <b>${classLabel}</b> บัดนี้ การประเมินผลและรวบรวมข้อมูลได้เสร็จสิ้นสมบูรณ์เป็นที่เรียบร้อยแล้ว จึงขอรายงานสรุปผลการดำเนินงานเพื่อโปรดพิจารณา ดังปรากฏรายละเอียดในตารางข้อมูลต่อไปนี้
      </p>

      <table class="stat-table">
        <tr style="background-color: #f7f7f7;">
          <th style="width: 25%;">จำนวนรายการทั้งหมด</th>
          <th style="width: 25%;">ผู้จัดทำรายงาน (Admin)</th>
          <th style="width: 25%;">เกณฑ์เฉลี่ยผลสัมฤทธิ์</th>
          <th style="width: 25%;">สถานะการประเมิน</th>
        </tr>
        <tr>
          <td class="text-center bold">${reportStats.total} รายการ</td>
          <td class="text-center">${currentUser.name}<br/><span style="font-size: 11pt; color: #555;">(User: ${adminUsername})</span></td>
          <td class="text-center bold">${reportStats.avg}</td>
          <td class="text-center bold" style="color: #047857;">ผ่านเกณฑ์ ${reportStats.passedPct}%</td>
        </tr>
      </table>

      <div style="margin-top: 10pt; margin-bottom: 4pt; font-weight: bold; font-size: 15pt;">
        ส่วนที่ ๑: รายชื่อนักเรียนและตารางผลการประเมิน (Student Roster & Assessment)
      </div>
      <table class="data-table">
        <thead>
          ${tableHeaders}
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <!-- ส่วนที่ ๒: แผนภูมิแท่งสรุปผลสัมฤทธิ์ทางการศึกษา (ไว้ล่าง) -->
      <div style="margin-top: 16pt; margin-bottom: 6pt; font-weight: bold; font-size: 15pt;">
        ส่วนที่ ๒: แผนภูมิแท่งสรุปผลสัมฤทธิ์ทางการศึกษา (Column Bar Chart Summary)
      </div>
      <table class="stat-table" style="margin-top: 4pt;">
        <tr style="background-color: #f2f2f2;">
          <th style="width: 25%;">ตัวชี้วัดผลสัมฤทธิ์</th>
          <th style="width: 20%;">ค่าสถิติ / รายการ</th>
          <th style="width: 15%;">ร้อยละ</th>
          <th style="width: 40%;">แผนภูมิแท่งเปรียบเทียบ</th>
        </tr>
        ${currentChartBars
          .map(
            (bar) => `
          <tr>
            <td class="bold">${bar.shortLabel}</td>
            <td class="text-center">${bar.note || bar.displayValue}</td>
            <td class="text-center bold">${bar.value}%</td>
            <td>
              <div style="background-color: #f3f4f6; height: 16pt; width: 100%; border: 1pt solid #4b5563;">
                <div style="background-color: #1e3a8a; height: 100%; width: ${Math.max(6, Math.min(100, bar.value))}%; text-align: right; color: white; font-size: 10pt; font-weight: bold; padding-right: 4pt; line-height: 16pt;">
                  ${bar.displayValue}
                </div>
              </div>
            </td>
          </tr>`
          )
          .join('')}
      </table>

      ${
        reportType === 'overview'
          ? `
      <div style="margin-top: 16pt; margin-bottom: 6pt; font-weight: bold; font-size: 15pt;">
        ส่วนที่ ๓: ตารางจำแนกผลการดำเนินงาน ๔ ด้านหลัก (Executive Summary Matrix)
      </div>
      <table class="data-table" style="margin-top: 4pt;">
        <thead>
          <tr>
            <th style="width: 25%;">ด้านการประเมิน (๔ ด้านหลัก)</th>
            <th style="width: 30%;">ดัชนีชี้วัดผลสัมฤทธิ์</th>
            <th style="width: 15%;">จำนวนผลลัพธ์</th>
            <th style="width: 15%;">ร้อยละ / ค่าเฉลี่ย</th>
            <th style="width: 15%;">การประเมินผล</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="bold">๑. การส่งการบ้านและภาระงาน</td>
            <td>อัตราการส่งงานและการตรวจการบ้านของครู</td>
            <td class="text-center">${reportStats.overview?.totalHw || 0} งาน (ตรวจแล้ว ${reportStats.overview?.gradedHwCount || 0})</td>
            <td class="text-center bold">${reportStats.overview?.hwGradedPct || 100}%</td>
            <td class="text-center bold" style="color: #047857;">ตรวจเสร็จสิ้น</td>
          </tr>
          <tr>
            <td class="bold">๑. การส่งการบ้านและภาระงาน</td>
            <td>นักเรียนที่ส่งงานผ่านเกณฑ์คะแนน (>= 60%)</td>
            <td class="text-center">${reportStats.overview?.totalHw || 0} งาน</td>
            <td class="text-center bold">${reportStats.overview?.hwPassPct || 100}%</td>
            <td class="text-center bold" style="color: #047857;">ผ่านเกณฑ์</td>
          </tr>
          <tr>
            <td class="bold">๒. ผลสัมฤทธิ์แบบทดสอบ</td>
            <td>จำนวนการทำแบบทดสอบวัดผลการเรียนรู้</td>
            <td class="text-center">${reportStats.overview?.totalExams || 0} ครั้ง</td>
            <td class="text-center bold">เฉลี่ย ${reportStats.overview?.avgExamScore || 0} คะแนน</td>
            <td class="text-center bold" style="color: #047857;">มาตรฐานวิชาการ</td>
          </tr>
          <tr>
            <td class="bold">๒. ผลสัมฤทธิ์แบบทดสอบ</td>
            <td>นักเรียนที่สอบผ่านเกณฑ์ร้อยละ ๖๐ ขึ้นไป</td>
            <td class="text-center">${reportStats.overview?.totalExams || 0} ครั้ง</td>
            <td class="text-center bold">${reportStats.overview?.examPassPct || 100}%</td>
            <td class="text-center bold" style="color: #047857;">ผ่านเกณฑ์</td>
          </tr>
          <tr>
            <td class="bold">๓. สมุดคะแนนและดาวสะสม</td>
            <td>จำนวนนักเรียนและยอดดาวสะสมเกียรติยศ</td>
            <td class="text-center">${reportStats.overview?.totalStudents || 0} คน (${reportStats.overview?.totalStars || 0} ⭐)</td>
            <td class="text-center bold">เฉลี่ย ${reportStats.overview?.avgStars || 0} ดาว/คน</td>
            <td class="text-center bold" style="color: #b45309;">ดีเด่น</td>
          </tr>
          <tr>
            <td class="bold">๔. มุมสะท้อนคิดและสุขภาวะ</td>
            <td>การมีส่วนร่วมสะท้อนคิดและความพึงพอใจ</td>
            <td class="text-center">${reportStats.overview?.totalEvals || 0} เรื่อง</td>
            <td class="text-center bold">เฉลี่ย ${reportStats.overview?.avgEvalRating || 0} / 5 ⭐</td>
            <td class="text-center bold" style="color: #be185d;">พึงพอใจ ${reportStats.overview?.evalHappyPct || 100}%</td>
          </tr>
        </tbody>
      </table>
      `
          : ''
      }

      <p style="text-indent: 2.5em; line-height: 1.5; margin-top: 15pt;">
        จึงเรียนมาเพื่อโปรดทราบและพิจารณาให้ความเห็นชอบ
      </p>

      <table class="sig-table">
        <tr>
          <td>
            <div>(ลงชื่อ)....................................................</div>
            <div style="margin-top: 6pt; font-weight: bold;">(${currentUser.name})</div>
            <div style="font-size: 13pt; color: #555;">${currentUser.role === 'admin' ? 'ผู้ดูแลระบบและจัดทำรายงาน (Admin)' : 'ครูผู้สอนกลุ่มสาระฯ'}</div>
            <div style="font-size: 11pt; color: #333; margin-top: 3pt;">ชื่อผู้ใช้ (Username): <b>${adminUsername}</b></div>
            <div style="font-size: 13pt; color: #555;">วันที่ ....../....../............</div>
          </td>
          <td>
            <div>(ลงชื่อ)....................................................</div>
            <div style="margin-top: 6pt; font-weight: bold;">(นางสาวพิมพ์ใจ วิจิตรศิลป์)</div>
            <div style="font-size: 13pt; color: #555;">หัวหน้ากลุ่มงานวัดและประเมินผล</div>
            <div style="font-size: 13pt; color: #555;">วันที่ ....../....../............</div>
          </td>
          <td>
            <div>(ลงชื่อ)....................................................</div>
            <div style="margin-top: 6pt; font-weight: bold;">(นายดนัย สิทธิเดช)</div>
            <div style="font-size: 13pt; color: #555;">ผู้อำนวยการโรงเรียนมัธยมศึกษา TaskHub</div>
            <div style="font-size: 13pt; color: #555;">วันที่ ....../....../............</div>
          </td>
        </tr>
      </table>
    `;

    downloadWordDoc(`เอกสารรายงาน_${reportType}_${timestamp}`, htmlContent);
  };

  // =================================================================
  // 12. DASHBOARD KPI METRICS
  // =================================================================
  const kpis = useMemo(() => {
    const totalUsers = allUsersList.length;
    const studentCount = allUsersList.filter((u) => u.role === 'student').length;
    const teacherCount = allUsersList.filter((u) => u.role === 'teacher').length;
    const adminCount = allUsersList.filter((u) => u.role === 'admin').length;

    const totalHomeworks = homeworkList.length;
    const gradedHomeworks = homeworkList.filter((h) => h.status === 'graded').length;
    const pendingHomeworks = totalHomeworks - gradedHomeworks;
    const hwGradedPercent = totalHomeworks > 0 ? Math.round((gradedHomeworks / totalHomeworks) * 100) : 0;

    const totalQuizzes = quizLessons.length;
    const totalExamAttempts = examScores.length;
    const avgScorePct =
      totalExamAttempts > 0
        ? Math.round(
            (examScores.reduce((acc, s) => acc + (s.score / (s.maxScore || 1)) * 100, 0) /
              totalExamAttempts)
          )
        : 0;

    const totalStarsAccumulated = studentRecords.reduce((acc, s) => acc + (s.totalStars || 0), 0);
    const totalReflections = evaluations.length;
    const activeTasks = assignmentTasks.length;

    return {
      totalUsers,
      studentCount,
      teacherCount,
      adminCount,
      totalHomeworks,
      gradedHomeworks,
      pendingHomeworks,
      hwGradedPercent,
      totalQuizzes,
      totalExamAttempts,
      avgScorePct,
      totalStarsAccumulated,
      totalReflections,
      activeTasks,
    };
  }, [allUsersList, homeworkList, quizLessons, examScores, studentRecords, evaluations, assignmentTasks]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-stone-900 text-amber-300 border-2 border-amber-400 px-5 py-3 rounded-2xl shadow-[4px_4px_0px_#000] text-sm font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER BANNER */}
      <div className="bg-stone-900 text-amber-300 border-2 border-stone-900 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#18181b] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-400 border-2 border-amber-200 rounded-2xl flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000] shrink-0 text-stone-950">
              <DoodleShield className="w-8 h-8 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                  ศูนย์ควบคุมและบริหารระบบ (Admin Console)
                </h1>
                <span className="bg-amber-400 text-stone-950 text-xs font-black px-3 py-1 rounded-full border border-stone-900 shadow-xs">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 font-bold mt-1">
                จัดการบัญชีผู้ใช้ • ข้อมูลการบ้าน • แบบทดสอบ • สมุดคะแนน • มุมสะท้อนคิด และออกรายงาน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-stone-800 border border-stone-700 px-3.5 py-1.5 rounded-xl text-xs font-mono text-amber-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ผู้ดูแล: {currentUser.name}</span>
            </div>
            <div className="bg-stone-800/90 border border-stone-700 px-3 py-1.5 rounded-xl text-[11px] font-mono text-stone-300 flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">User:</span>
              <span className="text-white font-bold">{adminUsername}</span>
            </div>
          </div>
        </div>

        {/* SUBTAB NAVIGATION BAR */}
        <div className="mt-6 pt-4 border-t border-stone-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: 'dashboard', label: '📊 แดชบอร์ดภาพรวม', desc: 'KPIs & สถิติ' },
            { id: 'profile', label: '👤 ข้อมูลส่วนตัว Admin', desc: 'แก้ไขโปรไฟล์' },
            { id: 'users', label: '👥 ผู้ใช้และสิทธิ์', desc: 'CRUD & กำหนดสิทธิ์' },
            { id: 'homework', label: '📚 การส่งการบ้าน', desc: 'CRUD & ตรวจงาน' },
            { id: 'tasks', label: '📋 ชิ้นงาน/ภาระงาน', desc: 'มอบหมายงาน' },
            { id: 'quizzes', label: '📝 แบบทดสอบ', desc: 'คลังข้อสอบ' },
            { id: 'exam_scores', label: '🎯 คะแนนสอบรายคน', desc: 'คะแนนทดสอบ' },
            { id: 'scorebook', label: '🏆 สมุดคะแนน', desc: 'ดาวสะสม & สติกเกอร์' },
            { id: 'gradebook', label: '📑 ตารางกรอกคะแนน', desc: 'การประเมินผล' },
            { id: 'reflections', label: '💭 มุมสะท้อนคิด', desc: 'หัวข้อ & ไวท์บอร์ด' },
            { id: 'reports', label: '🖨️ ออกรายงานสรุป', desc: 'CSV & พิมพ์ PDF' },
            { id: 'presets', label: '💬 รูปแบบสนทนา', desc: 'Presets & สนทนา' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as AdminTab)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-stone-950 border-2 border-amber-300 shadow-[2px_2px_0px_#000] scale-105'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================
          TAB 1: DASHBOARD OVERVIEW (แดชบอร์ดภาพรวม)
          ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border-2 border-stone-900 rounded-2xl p-4 shadow-[4px_4px_0px_#18181b]">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-black">ผู้ใช้ทั้งหมด</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-stone-900">{kpis.totalUsers} <span className="text-xs font-normal text-stone-500">คน</span></div>
              <div className="text-[10px] font-bold text-stone-500 mt-1">
                นร. {kpis.studentCount} • ครู {kpis.teacherCount} • แอดมิน {kpis.adminCount}
              </div>
            </div>

            <div className="bg-white border-2 border-stone-900 rounded-2xl p-4 shadow-[4px_4px_0px_#18181b]">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-black">การส่งการบ้าน</span>
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{kpis.totalHomeworks} <span className="text-xs font-normal text-stone-500">งาน</span></div>
              <div className="text-[10px] font-bold text-emerald-600 mt-1">
                ตรวจแล้ว {kpis.gradedHomeworks} ({kpis.hwGradedPercent}%)
              </div>
            </div>

            <div className="bg-white border-2 border-stone-900 rounded-2xl p-4 shadow-[4px_4px_0px_#18181b]">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-black">ชิ้นงานเปิดรับ</span>
                <Layers className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-800">{kpis.activeTasks} <span className="text-xs font-normal text-stone-500">ชิ้น</span></div>
              <div className="text-[10px] font-bold text-stone-500 mt-1">ภาระงานที่มอบหมาย</div>
            </div>

            <div className="bg-white border-2 border-stone-900 rounded-2xl p-4 shadow-[4px_4px_0px_#18181b]">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-black">แบบทดสอบ</span>
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-800">{kpis.totalQuizzes} <span className="text-xs font-normal text-stone-500">ชุด</span></div>
              <div className="text-[10px] font-bold text-stone-500 mt-1">ทำข้อสอบ {kpis.totalExamAttempts} ครั้ง</div>
            </div>

            <div className="bg-white border-2 border-stone-900 rounded-2xl p-4 shadow-[4px_4px_0px_#18181b]">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-black">คะแนนสอบเฉลี่ย</span>
                <Award className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700">{kpis.avgScorePct}%</div>
              <div className="text-[10px] font-bold text-stone-500 mt-1">เกณฑ์ผ่านมาตรฐาน</div>
            </div>

            <div className="bg-white border-2 border-stone-900 rounded-2xl p-4 shadow-[4px_4px_0px_#18181b]">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-black">ดาวสะสมรวม</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-900">{kpis.totalStarsAccumulated} ⭐</div>
              <div className="text-[10px] font-bold text-stone-500 mt-1">สะท้อนคิด {kpis.totalReflections} รายการ</div>
            </div>
          </div>

          {/* Distribution & Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>อัตราการตรวจการบ้านและชิ้นงาน</span>
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                    <span>การบ้านที่ตรวจแล้ว</span>
                    <span>{kpis.gradedHomeworks} / {kpis.totalHomeworks} งาน ({kpis.hwGradedPercent}%)</span>
                  </div>
                  <div className="w-full h-4 bg-stone-100 border-2 border-stone-900 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${kpis.hwGradedPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                    <span>คะแนนเฉลี่ยการทำแบบทดสอบ</span>
                    <span>{kpis.avgScorePct}%</span>
                  </div>
                  <div className="w-full h-4 bg-stone-100 border-2 border-stone-900 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${kpis.avgScorePct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-600">
                <span>รอตรวจ: <strong className="text-rose-600">{kpis.pendingHomeworks} งาน</strong></span>
                <span>จำนวนนักเรียนในระบบ: <strong className="text-stone-900">{kpis.studentCount} คน</strong></span>
              </div>
            </div>

            <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-600" />
                <span>ห้องเรียนที่มีข้อมูลในระบบ ({availableClasses.length} ห้อง)</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {availableClasses.map((cls) => {
                  const studentCount = studentRecords.filter((s) => s.classRoom === cls).length;
                  return (
                    <span
                      key={cls}
                      className="px-3 py-1.5 bg-amber-50 border-2 border-stone-900 rounded-xl text-xs font-black text-stone-900 shadow-[2px_2px_0px_#000]"
                    >
                      {cls} ({studentCount} คน)
                    </span>
                  );
                })}
                {availableClasses.length === 0 && (
                  <span className="text-xs text-stone-500 font-bold">ยังไม่มีข้อมูลห้องเรียน</span>
                )}
              </div>

              <div className="pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>ออกรายงานสรุปภาพรวมทั้งหมด</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Feeds */}
          <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b]">
            <h2 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-stone-700" />
              <span>รายการเคลื่อนไหวล่าสุด (Recent Submissions)</span>
            </h2>
            <div className="divide-y divide-stone-200">
              {homeworkList.slice(0, 5).map((hw) => (
                <div key={hw.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-amber-100 border border-stone-900 flex items-center justify-center font-bold">
                      📚
                    </span>
                    <div>
                      <div className="font-black text-stone-900">{hw.studentName} ({hw.studentClass})</div>
                      <div className="text-stone-500 font-bold">{hw.title} • {hw.submittedAt}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold border text-[11px] ${
                      hw.status === 'graded'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                        : 'bg-amber-100 text-amber-800 border-amber-400'
                    }`}
                  >
                    {hw.status === 'graded' ? `ตรวจแล้ว (${hw.score}/${hw.maxScore})` : 'รอตรวจ'}
                  </span>
                </div>
              ))}
              {homeworkList.length === 0 && (
                <div className="text-center py-6 text-xs text-stone-500 font-bold">
                  ยังไม่มีรายการส่งการบ้าน
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: ADMIN PROFILE (ข้อมูลส่วนตัว Admin)
          ========================================================= */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto bg-white border-2 border-stone-900 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#18181b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-stone-200 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-200 border-2 border-stone-900 flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000]">
                <DoodleShield className="w-7 h-7 text-stone-900" />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-900">แก้ไขข้อมูลส่วนตัวผู้ดูแลระบบ (Admin Profile)</h2>
                <p className="text-xs font-bold text-stone-500">ปรับปรุงข้อมูลบัญชี ชื่อผู้ใช้ รหัสผ่าน และการติดต่อ</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar Picker */}
            <div>
              <label className="block text-sm font-black text-stone-800 mb-2">เลือกรูปโปรไฟล์ / อวตารแอดมิน</label>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {avatarOptions.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setProfileAvatar(av)}
                    className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-xl cursor-pointer transition-all ${
                      profileAvatar === av
                        ? 'border-stone-900 bg-amber-300 shadow-[2px_2px_0px_#000] scale-110'
                        : 'border-stone-300 bg-stone-50 hover:bg-stone-100'
                    }`}
                  >
                    <AvatarDisplay avatar={av} className="w-8 h-8" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">
                  ชื่อ-สกุล ที่แสดง (Display Name) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-stone-50 pl-9 pr-3 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-bold focus:bg-white focus:border-stone-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">
                  ชื่อผู้ใช้ (Username สำหรับล็อกอิน) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    className="w-full bg-stone-50 pl-9 pr-3 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-bold font-mono focus:bg-white focus:border-stone-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">
                  อีเมลผู้ดูแลระบบ (Admin Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-stone-50 pl-9 pr-3 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-bold font-mono focus:bg-white focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">
                  รหัสผ่านเข้าสู่ระบบ (Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showProfilePassword ? 'text' : 'password'}
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full bg-stone-50 pl-9 pr-10 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-bold font-mono focus:bg-white focus:border-stone-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfilePassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                  >
                    {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">กลุ่มสาระ / ฝ่ายงาน (Department)</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileDepartment}
                    onChange={(e) => setProfileDepartment(e.target.value)}
                    className="w-full bg-stone-50 pl-9 pr-3 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-bold focus:bg-white focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">เบอร์โทรศัพท์ติดต่อ (Phone)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-stone-50 pl-9 pr-3 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-bold focus:bg-white focus:border-stone-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <button
                type="submit"
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-black text-base rounded-xl border-2 border-stone-900 shadow-[3px_3px_0px_#18181b] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-0.5"
              >
                <CheckCircle className="w-5 h-5 text-amber-400" />
                <span>บันทึกข้อมูลส่วนตัว Admin</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          TAB 3: USERS & ROLE PERMISSION MANAGEMENT
          ========================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>จัดการข้อมูลผู้ใช้งานและกำหนดสิทธิ์ (Users & Permissions)</span>
              </h2>
              <p className="text-xs font-bold text-stone-500">
                เพิ่ม ลบ แก้ไข ค้นหา และสลับสิทธิ์การใช้งาน (นักเรียน / คุณครู / ผู้ดูแลระบบ)
              </p>
            </div>
            <button
              type="button"
              onClick={openAddUser}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มผู้ใช้งาน</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="ค้นหาชื่อผู้ใช้, อีเมล, ชั้นเรียน หรือบทบาท..."
                className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold focus:bg-white focus:border-stone-900"
              />
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
              {['all', 'student', 'teacher', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                    userRoleFilter === r
                      ? 'bg-stone-900 text-amber-300 border-stone-900 font-black'
                      : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {r === 'all' ? 'ทั้งหมด' : r === 'student' ? 'นักเรียน' : r === 'teacher' ? 'คุณครู' : 'แอดมิน'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border-2 border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 border-b-2 border-stone-200 text-stone-700 font-black">
                <tr>
                  <th className="p-3">ผู้ใช้งาน</th>
                  <th className="p-3">บัญชี / อีเมล</th>
                  <th className="p-3">ห้องเรียน</th>
                  <th className="p-3">กำหนดสิทธิ์ (Role)</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-bold">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3 flex items-center gap-2.5">
                      <AvatarDisplay avatar={u.avatar} className="w-8 h-8" />
                      <div>
                        <div className="font-black text-stone-900">{u.name}</div>
                        <div className="text-[10px] text-stone-500 font-mono">{u.id}</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-stone-600">
                      {u.googleEmail || u.usernameOrEmail || '-'}
                    </td>
                    <td className="p-3 text-stone-700">
                      {u.classRoom || '-'}
                    </td>
                    <td className="p-3">
                      {/* Direct Role Assignment Selector */}
                      <select
                        value={u.role}
                        onChange={(e) => {
                          const newR = e.target.value as UserRole;
                          if (onUpdateUserRole) onUpdateUserRole(u.id, newR);
                          showToast(`เปลี่ยนสิทธิ์ของ ${u.name} เป็น ${newR}`);
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-black cursor-pointer shadow-xs ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-stone-900 border-amber-400'
                            : u.role === 'teacher'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                            : 'bg-blue-100 text-blue-900 border-blue-400'
                        }`}
                      >
                        <option value="student">นักเรียน (Student)</option>
                        <option value="teacher">คุณครู (Teacher)</option>
                        <option value="admin">ผู้ดูแล (Admin)</option>
                      </select>
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditUser(u)}
                        className="p-1.5 bg-stone-100 hover:bg-amber-200 text-stone-800 rounded-lg border border-stone-300 cursor-pointer"
                        title="แก้ไขข้อมูลผู้ใช้"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onDeleteUser) onDeleteUser(u.id);
                          showToast(`ลบผู้ใช้ ${u.name} เรียบร้อย`);
                        }}
                        className="p-1.5 bg-stone-100 hover:bg-rose-200 text-rose-700 rounded-lg border border-stone-300 cursor-pointer"
                        title="ลบผู้ใช้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-stone-500 font-bold">
                      ไม่พบข้อมูลผู้ใช้งานที่ค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: HOMEWORK SUBMISSIONS CRUD + SEARCH
          ========================================================= */}
      {activeTab === 'homework' && (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-600" />
                <span>จัดการข้อมูลการส่งการบ้าน (Homework Submissions)</span>
              </h2>
              <p className="text-xs font-bold text-stone-500">
                เพิ่ม ลบ แก้ไข ค้นหา และตรวจให้คะแนนการส่งการบ้านของนักเรียน
              </p>
            </div>
            <button
              type="button"
              onClick={openAddHomework}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรายการส่งการบ้าน</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={homeworkSearch}
                onChange={(e) => setHomeworkSearch(e.target.value)}
                placeholder="ค้นหาชื่อนักเรียน, หัวข้องาน, หรือห้องเรียน..."
                className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold focus:bg-white focus:border-stone-900"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {['all', 'graded', 'pending'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setHomeworkStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    homeworkStatusFilter === st
                      ? 'bg-stone-900 text-amber-300 border-stone-900 font-black'
                      : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {st === 'all' ? 'ทั้งหมด' : st === 'graded' ? 'ตรวจแล้ว' : 'รอตรวจ'}
                </button>
              ))}
            </div>
          </div>

          {/* Homework Table */}
          <div className="overflow-x-auto border-2 border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 border-b-2 border-stone-200 text-stone-700 font-black">
                <tr>
                  <th className="p-3">นักเรียน</th>
                  <th className="p-3">ชิ้นงาน/การบ้าน</th>
                  <th className="p-3">ห้อง/เลขที่</th>
                  <th className="p-3">คะแนน</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3">ความเห็นครู</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-bold">
                {filteredHomeworks.map((hw) => (
                  <tr key={hw.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3">
                      <div className="font-black text-stone-900">{hw.studentName}</div>
                      <div className="text-[10px] text-stone-500">{hw.submittedAt}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-black text-stone-900">{hw.title}</div>
                      <div className="text-[10px] text-stone-500">{hw.subject}</div>
                    </td>
                    <td className="p-3 text-stone-700">
                      {hw.studentClass} เลขที่ {hw.studentNo || '-'}
                    </td>
                    <td className="p-3 font-mono font-black text-emerald-800">
                      {hw.score !== undefined ? `${hw.score}/${hw.maxScore || 10}` : '-'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          hw.status === 'graded'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                            : 'bg-amber-100 text-amber-800 border-amber-400'
                        }`}
                      >
                        {hw.status === 'graded' ? 'ตรวจแล้ว' : 'รอตรวจ'}
                      </span>
                    </td>
                    <td className="p-3 text-stone-600 max-w-xs truncate">
                      {hw.teacherFeedback || '-'}
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditHomework(hw)}
                        className="p-1.5 bg-stone-100 hover:bg-amber-200 text-stone-800 rounded-lg border border-stone-300 cursor-pointer"
                        title="แก้ไข / ให้คะแนน"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onDeleteHomework) onDeleteHomework(hw.id);
                          showToast('ลบรายการการบ้านเรียบร้อย');
                        }}
                        className="p-1.5 bg-stone-100 hover:bg-rose-200 text-rose-700 rounded-lg border border-stone-300 cursor-pointer"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredHomeworks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-stone-500 font-bold">
                      ไม่พบข้อมูลการส่งการบ้าน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: ASSIGNMENT TASKS (ชิ้นงาน/ภาระงาน)
          ========================================================= */}
      {activeTab === 'tasks' && (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <Layers className="w-6 h-6 text-amber-600" />
                <span>จัดการข้อมูลชิ้นงานและภาระงาน (Assignment Tasks)</span>
              </h2>
              <p className="text-xs font-bold text-stone-500">
                เพิ่ม ลบ แก้ไข ค้นหา ภาระงานที่เปิดรับ และกำหนดดาวรางวัล
              </p>
            </div>
            <button
              type="button"
              onClick={openAddTask}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มชิ้นงานใหม่</span>
            </button>
          </div>

          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="ค้นหาชิ้นงาน, วิชา, ห้องเรียน..."
              className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold focus:bg-white focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 bg-stone-50 border-2 border-stone-300 hover:border-stone-900 rounded-2xl transition-all shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-black mr-2">
                      {t.subject}
                    </span>
                    <span className="px-2.5 py-0.5 bg-stone-200 text-stone-800 rounded-full text-[10px] font-black">
                      ห้อง: {t.targetClass}
                    </span>
                    <h3 className="text-base font-black text-stone-900 mt-1">{t.title}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditTask(t)}
                      className="p-1.5 bg-white hover:bg-amber-100 text-stone-800 rounded-lg border border-stone-300 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteTask) onDeleteTask(t.id);
                        showToast('ลบชิ้นงานเรียบร้อย');
                      }}
                      className="p-1.5 bg-white hover:bg-rose-100 text-rose-700 rounded-lg border border-stone-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 font-medium">{t.description}</p>

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-500">
                  <span>กำหนดส่ง: <strong className="text-stone-800">{t.dueDate}</strong></span>
                  <span className="text-amber-800 font-black flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    +{t.rewardStars} ดาว
                  </span>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="col-span-2 text-center py-8 text-xs text-stone-500 font-bold">
                ไม่พบชิ้นงานที่ค้นหา
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 6: QUIZZES (แบบทดสอบ)
          ========================================================= */}
      {activeTab === 'quizzes' && (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                <span>จัดการข้อมูลแบบทดสอบ (Quiz Lessons)</span>
              </h2>
              <p className="text-xs font-bold text-stone-500">
                เพิ่ม ลบ แก้ไข คลังข้อสอบ และคำถามวัดผลการเรียนรู้
              </p>
            </div>
            <button
              type="button"
              onClick={openAddQuiz}
              className="px-4 py-2.5 bg-purple-400 hover:bg-purple-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มแบบทดสอบ</span>
            </button>
          </div>

          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quizSearch}
              onChange={(e) => setQuizSearch(e.target.value)}
              placeholder="ค้นหาชื่อแบบทดสอบ, คำอธิบาย..."
              className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold focus:bg-white focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredQuizzes.map((q) => (
              <div
                key={q.id}
                className="p-4 bg-stone-50 border-2 border-stone-300 hover:border-stone-900 rounded-2xl transition-all shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 border border-purple-300 rounded-full text-[10px] font-black mr-2">
                      {q.questions?.length || 0} ข้อคำถาม
                    </span>
                    <span className="px-2.5 py-0.5 bg-stone-200 text-stone-800 rounded-full text-[10px] font-black">
                      ชั้น: {q.targetClass || 'ทั่วไป'}
                    </span>
                    <h3 className="text-base font-black text-stone-900 mt-1">{q.title}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditQuiz(q)}
                      className="p-1.5 bg-white hover:bg-amber-100 text-stone-800 rounded-lg border border-stone-300 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteLesson) onDeleteLesson(q.id);
                        showToast('ลบแบบทดสอบเรียบร้อย');
                      }}
                      className="p-1.5 bg-white hover:bg-rose-100 text-rose-700 rounded-lg border border-stone-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-600 font-medium">{q.description}</p>
                <div className="pt-2 border-t border-stone-200 text-[11px] font-bold text-stone-500">
                  ครูผู้จัดทำ: {q.authorTeacher || 'ส่วนกลาง'}
                </div>
              </div>
            ))}
            {filteredQuizzes.length === 0 && (
              <div className="col-span-2 text-center py-8 text-xs text-stone-500 font-bold">
                ไม่พบแบบทดสอบที่ค้นหา
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 7: EXAM SCORES (คะแนนสอบรายบุคคล)
          ========================================================= */}
      {activeTab === 'exam_scores' && (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-rose-600" />
                <span>ตารางคะแนนสอบรายบุคคล (Individual Exam Scores)</span>
              </h2>
              <p className="text-xs font-bold text-stone-500">
                เพิ่ม ลบ แก้ไข ค้นหา คะแนนการทำแบบทดสอบและสถิติรายนักเรียน
              </p>
            </div>
            <button
              type="button"
              onClick={openAddScore}
              className="px-4 py-2.5 bg-rose-400 hover:bg-rose-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มคะแนนสอบ</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={scoreSearch}
              onChange={(e) => setScoreSearch(e.target.value)}
              placeholder="ค้นหาชื่อนักเรียน, แบบทดสอบ, ห้องเรียน..."
              className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold focus:bg-white focus:border-stone-900"
            />
          </div>

          <div className="overflow-x-auto border-2 border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 border-b-2 border-stone-200 text-stone-700 font-black">
                <tr>
                  <th className="p-3">นักเรียน</th>
                  <th className="p-3">ห้องเรียน</th>
                  <th className="p-3">แบบทดสอบ</th>
                  <th className="p-3">คะแนนที่ได้</th>
                  <th className="p-3">ร้อยละ</th>
                  <th className="p-3">ผลสอบ</th>
                  <th className="p-3">วันที่สอบ</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-bold">
                {filteredExamScores.map((s) => {
                  const pct = Math.round((s.score / (s.maxScore || 1)) * 100);
                  const isPass = pct >= 60;
                  return (
                    <tr key={s.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3 font-black text-stone-900">{s.studentName}</td>
                      <td className="p-3 text-stone-700">{s.studentClass || '-'}</td>
                      <td className="p-3 text-stone-800">{s.lessonTitle}</td>
                      <td className="p-3 font-mono font-black text-rose-700">{s.score} / {s.maxScore}</td>
                      <td className="p-3 font-mono font-black">{pct}%</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            isPass
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                              : 'bg-rose-100 text-rose-900 border-rose-400'
                          }`}
                        >
                          {isPass ? 'ผ่านเกณฑ์' : 'ปรับปรุง'}
                        </span>
                      </td>
                      <td className="p-3 text-stone-500">{s.submittedAt}</td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEditScore(s)}
                          className="p-1.5 bg-stone-100 hover:bg-amber-200 text-stone-800 rounded-lg border border-stone-300 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onDeleteExamScore) onDeleteExamScore(s.id);
                            showToast('ลบคะแนนสอบเรียบร้อย');
                          }}
                          className="p-1.5 bg-stone-100 hover:bg-rose-200 text-rose-700 rounded-lg border border-stone-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredExamScores.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-stone-500 font-bold">
                      ไม่พบข้อมูลคะแนนสอบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 8: SCOREBOOK (สมุดคะแนน)
          ========================================================= */}
      {activeTab === 'scorebook' && (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <DoodleStar className="w-6 h-6 text-amber-500" />
                <span>จัดการข้อมูลสมุดคะแนน (Scorebook & Rewards)</span>
              </h2>
              <p className="text-xs font-bold text-stone-500">
                เพิ่ม ลบ แก้ไข ค้นหา ดาวสะสม สติกเกอร์เกียรติยศ และอันดับนักเรียน
              </p>
            </div>
            <button
              type="button"
              onClick={openAddStudent}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มนักเรียนในสมุดคะแนน</span>
            </button>
          </div>

          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, รหัสนักเรียน, หรือชั้นเรียน..."
              className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold focus:bg-white focus:border-stone-900"
            />
          </div>

          <div className="overflow-x-auto border-2 border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 border-b-2 border-stone-200 text-stone-700 font-black">
                <tr>
                  <th className="p-3">นักเรียน</th>
                  <th className="p-3">รหัสประจำตัว</th>
                  <th className="p-3">ชั้น / เลขที่</th>
                  <th className="p-3">ดาวสะสม ⭐</th>
                  <th className="p-3">สติกเกอร์ที่ปลดล็อก</th>
                  <th className="p-3">ส่งการบ้าน</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-bold">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3 flex items-center gap-2">
                      <AvatarDisplay avatar={s.avatar} className="w-8 h-8" />
                      <span className="font-black text-stone-900">{s.name}</span>
                    </td>
                    <td className="p-3 font-mono text-stone-700">{s.studentIdCode}</td>
                    <td className="p-3 text-stone-700">{s.classRoom} (เลขที่ {s.studentNo})</td>
                    <td className="p-3 font-mono font-black text-amber-800 text-sm">
                      {s.totalStars} ⭐
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[11px] font-black">
                        {s.unlockedStickers.length} ชิ้น
                      </span>
                    </td>
                    <td className="p-3 text-stone-600">{s.homeworkCount || 0} ชิ้น</td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...s, totalStars: s.totalStars + 50 };
                          if (onUpdateStudentRecord) onUpdateStudentRecord(updated);
                          triggerStarBurst();
                          showToast(`มอบดาว +50 ⭐ ให้ ${s.name}`);
                        }}
                        className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-stone-900 rounded-lg text-[10px] font-black border border-stone-400 cursor-pointer"
                        title="มอบดาวโบนัส +50 ดาว"
                      >
                        +50 ⭐
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditStudent(s)}
                        className="p-1.5 bg-stone-100 hover:bg-amber-200 text-stone-800 rounded-lg border border-stone-300 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onDeleteStudentRecord) onDeleteStudentRecord(s.id);
                          showToast('ลบนักเรียนเรียบร้อย');
                        }}
                        className="p-1.5 bg-stone-100 hover:bg-rose-200 text-rose-700 rounded-lg border border-stone-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-stone-500 font-bold">
                      ไม่พบข้อมูลนักเรียน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 9: GRADEBOOK (ตารางกรอกคะแนน & ประเมิน)
          ========================================================= */}
      {activeTab === 'gradebook' && (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-blue-600" />
                <span>ตารางกรอกคะแนนและการประเมินผล (Gradebook & Evaluations)</span>
              </h2>
              <p className="text-xs font-bold text-stone-500">
                เพิ่ม ลบ แก้ไข ค้นหา การประเมินดาว 1-5 ดวง และการตอบกลับของครู
              </p>
            </div>
            <button
              type="button"
              onClick={openAddEval}
              className="px-4 py-2.5 bg-blue-400 hover:bg-blue-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรายการประเมิน</span>
            </button>
          </div>

          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={evalSearch}
              onChange={(e) => setEvalSearch(e.target.value)}
              placeholder="ค้นหาชื่อนักเรียน, หัวข้อ, ข้อคิดเห็น..."
              className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold focus:bg-white focus:border-stone-900"
            />
          </div>

          <div className="overflow-x-auto border-2 border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 border-b-2 border-stone-200 text-stone-700 font-black">
                <tr>
                  <th className="p-3">นักเรียน</th>
                  <th className="p-3">ห้องเรียน</th>
                  <th className="p-3">กิจกรรม/หัวข้อ</th>
                  <th className="p-3">คะแนนประเมิน (ดาว)</th>
                  <th className="p-3">ข้อคิดเห็นนักเรียน</th>
                  <th className="p-3">การตอบกลับของครู</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-bold">
                {filteredEvaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3 font-black text-stone-900">{ev.studentName}</td>
                    <td className="p-3 text-stone-700">{ev.studentClass}</td>
                    <td className="p-3 text-stone-800">{ev.topicTitle}</td>
                    <td className="p-3 text-amber-500 text-sm whitespace-nowrap">
                      {'⭐'.repeat(Math.max(1, Math.min(5, ev.ratingStars)))}
                    </td>
                    <td className="p-3 text-stone-600 max-w-xs truncate">{ev.teacherFeedback}</td>
                    <td className="p-3 text-emerald-800 max-w-xs truncate">{ev.teacherReply || '-'}</td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditEval(ev)}
                        className="p-1.5 bg-stone-100 hover:bg-amber-200 text-stone-800 rounded-lg border border-stone-300 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onDeleteEvaluation) onDeleteEvaluation(ev.id);
                          showToast('ลบรายการประเมินเรียบร้อย');
                        }}
                        className="p-1.5 bg-stone-100 hover:bg-rose-200 text-rose-700 rounded-lg border border-stone-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEvaluations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-stone-500 font-bold">
                      ไม่พบข้อมูลการประเมิน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 10: REFLECTIONS & WHITEBOARD (มุมสะท้อนคิด)
          ========================================================= */}
      {activeTab === 'reflections' && (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-pink-600" />
                <span>จัดการข้อมูลมุมสะท้อนความคิด & ไวท์บอร์ด (Reflections)</span>
              </h2>
              <p className="text-xs font-bold text-stone-500">
                เพิ่ม ลบ แก้ไข ค้นหา คำถามกระตุ้นคิด และควบคุมกระดานสนทนาสด
              </p>
            </div>
            <button
              type="button"
              onClick={openAddTopic}
              className="px-4 py-2.5 bg-pink-400 hover:bg-pink-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มหัวข้อสะท้อนคิด</span>
            </button>
          </div>

          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder="ค้นหาหัวข้อสะท้อนคิด, คำถามชวนคิด..."
              className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold focus:bg-white focus:border-stone-900"
            />
          </div>

          <div className="space-y-3">
            {filteredTopics.map((top) => (
              <div
                key={top.id}
                className="p-4 bg-stone-50 border-2 border-stone-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-pink-100 text-pink-900 border border-pink-300 rounded-full text-[10px] font-black">
                      {top.category}
                    </span>
                    <span className="px-2.5 py-0.5 bg-stone-200 text-stone-800 rounded-full text-[10px] font-black">
                      ห้อง: {top.targetClass || 'ทุกห้อง'}
                    </span>
                    <span className="text-xs font-bold text-stone-400">• {top.createdAt}</span>
                  </div>
                  <h3 className="text-base font-black text-stone-900">{top.title}</h3>
                  <p className="text-xs font-medium text-stone-600">คำถาม: {top.promptQuestion}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => openEditTopic(top)}
                    className="p-2 bg-white hover:bg-amber-100 text-stone-800 rounded-xl border border-stone-300 cursor-pointer shadow-xs"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteReflectionTopic) onDeleteReflectionTopic(top.id);
                      showToast('ลบหัวข้อสะท้อนคิดเรียบร้อย');
                    }}
                    className="p-2 bg-white hover:bg-rose-100 text-rose-700 rounded-xl border border-stone-300 cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredTopics.length === 0 && (
              <div className="text-center py-8 text-xs text-stone-500 font-bold">
                ไม่พบหัวข้อสะท้อนคิดที่ค้นหา
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 11: REPORTS (ออกรายงานสรุปข้อมูล)
          ========================================================= */}
      {activeTab === 'reports' && (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <Printer className="w-6 h-6 text-stone-900" />
                <span>ออกรายงานสรุปข้อมูลทางการศึกษา (Report Center)</span>
              </h2>
              <p className="text-xs font-bold text-stone-500">
                ส่งออกข้อมูลเป็นไฟล์ Excel CSV (รองรับภาษาไทย) และดูตัวอย่างพิมพ์รายงานแบบ PDF ทางการ
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
                title="ส่งออกตารางข้อมูลเป็นไฟล์ CSV สำหรับ Excel พร้อม UTF-8 BOM"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด CSV (Excel)</span>
              </button>
              <button
                type="button"
                onClick={handleExportWordDoc}
                className="px-3.5 py-2.5 bg-blue-400 hover:bg-blue-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
                title="ส่งออกเป็นเอกสาร Microsoft Word (.doc) พร้อมจัดรูปแบบและตราครุฑทางการ"
              >
                <FileText className="w-4 h-4" />
                <span>ส่งออกเอกสาร Word (.doc)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
                title="เปิดดูตัวอย่างและพิมพ์ หรือบันทึกเป็น PDF ทางการ"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>ดูตัวอย่างและพิมพ์ (PDF)</span>
              </button>
            </div>
          </div>

          {/* Report Category Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { id: 'overview', label: '1. ภาพรวมระบบทั้งหมด', count: homeworkList.length + examScores.length + studentRecords.length + evaluations.length, icon: '📊' },
              { id: 'homework', label: '2. รายการส่งการบ้าน', count: homeworkList.length, icon: '📚' },
              { id: 'quiz', label: '3. คะแนนแบบทดสอบ', count: examScores.length, icon: '🎯' },
              { id: 'scorebook', label: '4. สรุปคะแนนนักเรียน', count: studentRecords.length, icon: '🏆' },
              { id: 'reflection', label: '5. มุมสะท้อนความคิด', count: evaluations.length, icon: '💭' },
            ].map((rep) => (
              <button
                key={rep.id}
                type="button"
                onClick={() => setReportType(rep.id as any)}
                className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                  reportType === rep.id
                    ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-[3px_3px_0px_#000] scale-[1.02]'
                    : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                <div className="text-xl mb-1">{rep.icon}</div>
                <div className="text-xs font-black">{rep.label}</div>
                <div className="text-[10px] font-bold opacity-80 mt-0.5">{rep.count} รายการ</div>
              </button>
            ))}
          </div>

          {/* Filter by class with free-typing input & quick selection chips */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-stone-50 border-2 border-stone-200 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 text-xs font-black text-stone-800 shrink-0">
                  <Filter className="w-4 h-4 text-amber-600" />
                  <span>กรองตามห้องเรียน (พิมพ์ได้):</span>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    list="admin-report-class-suggestions"
                    value={reportClassFilter}
                    onChange={(e) => setReportClassFilter(e.target.value)}
                    placeholder="พิมพ์ชื่อห้องเรียน เช่น ม.1/1, ห้อง 1, 2..."
                    className="w-full pl-8 pr-8 py-2 bg-white border-2 border-stone-300 focus:border-stone-900 rounded-xl text-xs font-bold text-stone-900 outline-none transition-all shadow-xs"
                  />
                  {reportClassFilter && (
                    <button
                      type="button"
                      onClick={() => setReportClassFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                      title="ล้างการค้นหา"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <datalist id="admin-report-class-suggestions">
                    {availableClasses.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Admin Username Verification Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-950">
                <Shield className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-[11px]">
                  ผู้ดูแลระบบ: <span className="font-mono">{adminUsername}</span>
                </span>
              </div>
            </div>

            {/* Quick classroom chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs px-1">
              <span className="text-[11px] font-bold text-stone-500">เลือกด่วน:</span>
              <button
                type="button"
                onClick={() => setReportClassFilter('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  !reportClassFilter || reportClassFilter === 'all'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                ทุกห้องเรียน
              </button>
              {availableClasses.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setReportClassFilter(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    reportClassFilter.toLowerCase() === c.toLowerCase()
                      ? 'bg-amber-400 text-stone-950 border-stone-900 font-black shadow-xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* =========================================================
              ส่วนที่ ๑: รายชื่อนักเรียนและตารางผลการประเมิน (ขึ้นก่อน / FIRST)
              ========================================================= */}
          <div className="border-2 border-stone-900 rounded-3xl p-5 bg-white shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm sm:text-base font-black text-stone-900">
                  {reportType === 'overview'
                    ? '๑. รายชื่อนักเรียนและตารางสรุปผลการประเมินรายบุคคล'
                    : `๑. รายชื่อนักเรียนและข้อมูล${reportStats.title}`}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-black">
                พบข้อมูลทั้งหมด {reportType === 'overview' ? overviewStudents.length : reportStats.total} รายการ
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border-2 border-stone-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-100 border-b-2 border-stone-200 font-black text-stone-900">
                  {reportType === 'overview' && (
                    <tr>
                      <th className="p-3 text-center w-12">ลำดับ</th>
                      <th className="p-3">ชื่อ - นามสกุล นักเรียน</th>
                      <th className="p-3 text-center">ห้อง/เลขที่</th>
                      <th className="p-3 text-center">การบ้าน (ตรวจแล้ว)</th>
                      <th className="p-3 text-center">ผลสอบ (คะแนนเฉลี่ย)</th>
                      <th className="p-3 text-center">ดาวสะสม (ดวง)</th>
                      <th className="p-3 text-center">มุมสะท้อนคิด</th>
                      <th className="p-3 text-center">ผลการประเมิน</th>
                    </tr>
                  )}
                  {reportType === 'homework' && (
                    <tr>
                      <th className="p-3 text-center w-12">ลำดับ</th>
                      <th className="p-3">ชื่อ - นามสกุล นักเรียน</th>
                      <th className="p-3 text-center">ห้อง/เลขที่</th>
                      <th className="p-3">ชิ้นงาน / การบ้าน</th>
                      <th className="p-3 text-center">วิชา</th>
                      <th className="p-3 text-center">คะแนน</th>
                      <th className="p-3 text-center">สถานะ</th>
                      <th className="p-3">ความเห็นครู</th>
                    </tr>
                  )}
                  {reportType === 'quiz' && (
                    <tr>
                      <th className="p-3 text-center w-12">ลำดับ</th>
                      <th className="p-3">ชื่อ - นามสกุล นักเรียน</th>
                      <th className="p-3 text-center">ห้อง/เลขที่</th>
                      <th className="p-3">ชื่อแบบทดสอบ</th>
                      <th className="p-3 text-center">คะแนนที่ได้</th>
                      <th className="p-3 text-center">ร้อยละ</th>
                      <th className="p-3 text-center">ผลการประเมิน</th>
                    </tr>
                  )}
                  {reportType === 'scorebook' && (
                    <tr>
                      <th className="p-3 text-center w-12">ลำดับ</th>
                      <th className="p-3">รหัสนักเรียน</th>
                      <th className="p-3">ชื่อ - นามสกุล นักเรียน</th>
                      <th className="p-3 text-center">ชั้น / เลขที่</th>
                      <th className="p-3 text-center">ดาวสะสม (ดวง)</th>
                      <th className="p-3 text-center">ส่งงานแล้ว</th>
                      <th className="p-3 text-center">สติกเกอร์</th>
                    </tr>
                  )}
                  {reportType === 'reflection' && (
                    <tr>
                      <th className="p-3 text-center w-12">ลำดับ</th>
                      <th className="p-3">ชื่อ - นามสกุล นักเรียน</th>
                      <th className="p-3 text-center">ห้องเรียน</th>
                      <th className="p-3">หัวข้อการสะท้อนคิด</th>
                      <th className="p-3 text-center">ระดับดาว</th>
                      <th className="p-3">ความคิดเห็นนักเรียน</th>
                      <th className="p-3 text-center">การตอบกลับ</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-stone-200 font-medium bg-white">
                  {reportType === 'overview' &&
                    overviewStudents.map((st, i) => (
                      <tr key={st.id || i} className="hover:bg-amber-50/50 transition-colors">
                        <td className="p-3 text-center font-mono">{i + 1}</td>
                        <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                          <AvatarDisplay avatar={st.avatar} className="w-6 h-6 inline-block" />
                          <span>{st.name}</span>
                        </td>
                        <td className="p-3 text-center text-stone-700">
                          {st.classRoom} ({st.studentNo})
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-stone-900">{st.hwTotal} งาน</span>
                          <span className="text-[11px] text-emerald-700 ml-1">({st.hwGraded} ตรวจแล้ว)</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-purple-800">{st.avgExamPct}%</span>
                          <span className="text-[10px] text-stone-500 ml-1">({st.examCount} ครั้ง)</span>
                        </td>
                        <td className="p-3 text-center font-bold text-amber-800">
                          {st.stars} ⭐
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-pink-700">{st.avgMood} / 5 ⭐</span>
                          <span className="text-[10px] text-stone-500 ml-1">({st.evalCount} เรื่อง)</span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                              st.statusLabel === 'ดีเยี่ยม'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : st.statusLabel === 'ผ่านเกณฑ์'
                                ? 'bg-blue-100 text-blue-900 border-blue-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            {st.statusLabel}
                          </span>
                        </td>
                      </tr>
                    ))}

                  {reportType === 'homework' &&
                    homeworkList
                      .filter((h) => isClassMatched(h.studentClass))
                      .map((h, i) => (
                        <tr key={h.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="p-3 text-center font-mono">{i + 1}</td>
                          <td className="p-3 font-bold text-stone-900">{h.studentName}</td>
                          <td className="p-3 text-center text-stone-700">{h.studentClass} ({h.studentNo || '-'})</td>
                          <td className="p-3 font-medium text-stone-800">{h.title}</td>
                          <td className="p-3 text-center text-stone-600">{h.subject || '-'}</td>
                          <td className="p-3 text-center font-bold text-emerald-700">{h.score ?? '-'} / {h.maxScore ?? 10}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.status === 'graded' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                              {h.status === 'graded' ? 'ตรวจแล้ว' : 'รอตรวจ'}
                            </span>
                          </td>
                          <td className="p-3 text-stone-500 text-[11px] truncate max-w-[150px]">{h.teacherFeedback || '-'}</td>
                        </tr>
                      ))}

                  {reportType === 'quiz' &&
                    examScores
                      .filter((s) => isClassMatched(s.studentClass))
                      .map((s, i) => {
                        const pct = Math.round((s.score / (s.maxScore || 1)) * 100);
                        const isPass = pct >= 60;
                        return (
                          <tr key={s.id} className="hover:bg-amber-50/50 transition-colors">
                            <td className="p-3 text-center font-mono">{i + 1}</td>
                            <td className="p-3 font-bold text-stone-900">{s.studentName}</td>
                            <td className="p-3 text-center text-stone-700">{s.studentClass || '-'} ({s.studentNo || '-'})</td>
                            <td className="p-3 font-medium text-stone-800">{s.lessonTitle}</td>
                            <td className="p-3 text-center font-bold text-purple-700">{s.score} / {s.maxScore}</td>
                            <td className="p-3 text-center font-bold text-stone-900">{pct}%</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isPass ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                                {isPass ? 'ผ่านเกณฑ์' : 'ควรปรับปรุง'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                  {reportType === 'scorebook' &&
                    studentRecords
                      .filter((s) => isClassMatched(s.classRoom))
                      .map((s, i) => (
                        <tr key={s.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="p-3 text-center font-mono">{i + 1}</td>
                          <td className="p-3 font-mono text-stone-600">{s.studentIdCode}</td>
                          <td className="p-3 font-bold text-stone-900">{s.name}</td>
                          <td className="p-3 text-center text-stone-700">{s.classRoom} ({s.studentNo})</td>
                          <td className="p-3 text-center font-bold text-amber-800">{s.totalStars} ⭐</td>
                          <td className="p-3 text-center">{s.homeworkCount || 0} ชิ้น</td>
                          <td className="p-3 text-center font-bold text-stone-700">{s.unlockedStickers.length} ดวง</td>
                        </tr>
                      ))}

                  {reportType === 'reflection' &&
                    evaluations
                      .filter((e) => isClassMatched(e.studentClass))
                      .map((e, i) => (
                        <tr key={e.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="p-3 text-center font-mono">{i + 1}</td>
                          <td className="p-3 font-bold text-stone-900">{e.studentName}</td>
                          <td className="p-3 text-center text-stone-700">{e.studentClass}</td>
                          <td className="p-3 font-medium text-stone-800">{e.topicTitle}</td>
                          <td className="p-3 text-center font-bold text-pink-700">{e.ratingStars} ⭐</td>
                          <td className="p-3 text-stone-600 text-[11px] truncate max-w-[200px]">{e.teacherFeedback || '-'}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.teacherReply ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-600'}`}>
                              {e.teacherReply ? 'ตอบกลับแล้ว' : 'รอตอบกลับ'}
                            </span>
                          </td>
                        </tr>
                      ))}

                  {((reportType === 'overview' && overviewStudents.length === 0) ||
                    (reportType === 'homework' && homeworkList.filter((h) => isClassMatched(h.studentClass)).length === 0) ||
                    (reportType === 'quiz' && examScores.filter((s) => isClassMatched(s.studentClass)).length === 0) ||
                    (reportType === 'scorebook' && studentRecords.filter((s) => isClassMatched(s.classRoom)).length === 0) ||
                    (reportType === 'reflection' && evaluations.filter((e) => isClassMatched(e.studentClass)).length === 0)) && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-500 font-bold">
                        ไม่พบข้อมูลนักเรียนตามเงื่อนไขห้องเรียนที่เลือก
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================================
              ส่วนที่ ๒: แผนภูมิแท่งเปรียบเทียบผลสัมฤทธิ์ (ไว้ล่าง - ใช้กราฟแผนภูมิแท่ง)
              ========================================================= */}
          <div className="border-2 border-stone-900 rounded-3xl p-5 sm:p-6 bg-white shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm sm:text-base font-black text-stone-900">
                  ๒. แผนภูมิแท่งแสดงผลสัมฤทธิ์ทางการศึกษา (Column Bar Chart)
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-black self-start sm:self-auto">
                {reportClassFilter ? `ห้องเรียน: ${reportClassFilter}` : 'ทุกห้องเรียน'}
              </span>
            </div>

            {/* Vertical Column Bar Chart Canvas */}
            <div className="relative pt-6 pb-2">
              {/* Y-Axis Grid Lines */}
              <div className="absolute inset-0 top-6 bottom-14 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-stone-400">
                {[100, 75, 50, 25, 0].map((pct) => (
                  <div key={pct} className="flex items-center gap-2 w-full">
                    <span className="w-8 text-right shrink-0">{pct}%</span>
                    <div className="w-full border-b border-dashed border-stone-200" />
                  </div>
                ))}
              </div>

              {/* The Vertical Bars Area */}
              <div className="relative ml-10 h-60 sm:h-64 flex items-end justify-around gap-2 sm:gap-4 px-2 sm:px-4 border-b-2 border-stone-900 pb-1">
                {currentChartBars.map((bar) => (
                  <div key={bar.id} className="flex-1 flex flex-col justify-end items-center h-full max-w-[85px] group">
                    {/* Top Value Tag */}
                    <div className="mb-2 px-1.5 py-0.5 bg-stone-900 text-white rounded text-[10px] sm:text-xs font-black shadow-xs whitespace-nowrap transform group-hover:-translate-y-1 transition-transform">
                      {bar.displayValue}
                    </div>

                    {/* Bar Column */}
                    <div className="w-full relative flex justify-center h-full items-end">
                      <div
                        className={`w-full max-w-[48px] rounded-t-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] transition-all duration-700 ${bar.barColor}`}
                        style={{ height: `${Math.max(bar.value, 6)}%` }}
                      />
                    </div>

                    {/* X-Axis Label below baseline */}
                    <div className="absolute -bottom-14 sm:-bottom-12 flex flex-col items-center text-center">
                      <span className="text-[10px] sm:text-xs font-black text-stone-800 line-clamp-1">
                        {bar.shortLabel}
                      </span>
                      {bar.note && (
                        <span className="text-[9px] sm:text-[10px] text-stone-500 font-bold hidden sm:inline">
                          {bar.note}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Spacer for bottom labels */}
              <div className="h-14 sm:h-12" />
            </div>
          </div>

          {/* 4-Pillars Summary Matrix Table (Shown for Overview) */}
          {reportType === 'overview' && (
            <div className="border-2 border-stone-900 rounded-3xl p-5 bg-white shadow-[4px_4px_0px_#000] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                  <span>๓. ตารางจำแนกผลการดำเนินงาน ๔ ด้านหลัก (Executive Summary Matrix)</span>
                </h3>
                <span className="text-xs font-bold text-stone-500">เกณฑ์มาตรฐาน สพฐ.</span>
              </div>

              <div className="overflow-x-auto rounded-xl border-2 border-stone-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-100 border-b-2 border-stone-200 font-black text-stone-900">
                    <tr>
                      <th className="p-2.5">ด้านการประเมิน (Pillar)</th>
                      <th className="p-2.5">เป้าหมาย / ตัวชี้วัด</th>
                      <th className="p-2.5 text-center">ยอดที่บันทึก</th>
                      <th className="p-2.5 text-center">ร้อยละ / ค่าเฉลี่ย</th>
                      <th className="p-2.5 text-center">ผลการประเมิน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-medium">
                    <tr>
                      <td className="p-2.5 font-bold text-stone-900">๑. การส่งการบ้านและภาระงาน</td>
                      <td className="p-2.5 text-stone-600">อัตราการส่งงานและการตรวจของครู</td>
                      <td className="p-2.5 text-center">{reportStats.overview?.totalHw || 0} ชิ้น</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700">{reportStats.overview?.hwGradedPct || 100}%</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                          ตรวจเสร็จสิ้น
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-stone-900">๒. ผลสัมฤทธิ์แบบทดสอบ</td>
                      <td className="p-2.5 text-stone-600">ร้อยละนักเรียนสอบผ่านเกณฑ์ (≥ 60%)</td>
                      <td className="p-2.5 text-center">{reportStats.overview?.totalExams || 0} ครั้ง</td>
                      <td className="p-2.5 text-center font-bold text-purple-700">{reportStats.overview?.examPassPct || 100}%</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300">
                          ผ่านเกณฑ์มาตรฐาน
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-stone-900">๓. สมุดคะแนนและดาวสะสม</td>
                      <td className="p-2.5 text-stone-600">การมีส่วนร่วมและการสะสมดาวเกียรติยศ</td>
                      <td className="p-2.5 text-center">{reportStats.overview?.totalStudents || 0} คน</td>
                      <td className="p-2.5 text-center font-bold text-amber-800">{reportStats.overview?.avgStars || 0} ⭐/คน</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          ระดับดีเยี่ยม
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-stone-900">๔. มุมสะท้อนคิดและสุขภาวะ</td>
                      <td className="p-2.5 text-stone-600">ระดับความรู้สึกและความพึงพอใจการเรียน</td>
                      <td className="p-2.5 text-center">{reportStats.overview?.totalEvals || 0} เรื่อง</td>
                      <td className="p-2.5 text-center font-bold text-pink-700">{reportStats.overview?.avgEvalRating || 0} / 5 ⭐</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-pink-100 text-pink-900 border border-pink-300">
                          พึงพอใจ {reportStats.overview?.evalHappyPct || 100}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 12: PRESETS (รูปแบบการสนทนา & เครื่องมือ)
          ========================================================= */}
      {activeTab === 'presets' && (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#18181b] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-amber-600" />
                <span>จัดการและค้นหารูปแบบการสนทนา (Conversation Presets)</span>
              </h2>
              <p className="text-xs font-bold text-stone-500">
                เพิ่ม ลบ ค้นหา และแยกหมวดหมู่รูปแบบคำถามในการสนทนากลุ่มและกระดานไวท์บอร์ด
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingPresetModalOpen(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรูปแบบใหม่</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                placeholder="ค้นหาตามหมวดหมู่, คำถาม, หรือคำสำคัญ..."
                className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold focus:bg-white focus:border-stone-900"
              />
            </div>
            <select
              value={presetCategoryFilter}
              onChange={(e) => setPresetCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-stone-50 border-2 border-stone-300 rounded-xl text-xs font-bold"
            >
              <option value="all">ทุกหมวดหมู่ ({allPresets.length})</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Presets List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredPresets.map((p, idx) => (
              <div
                key={p.id || idx}
                className="p-4 bg-stone-50 border-2 border-stone-300 rounded-2xl flex flex-col justify-between gap-2 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-black">
                      {p.category}
                    </span>
                    {p.isCustom && p.id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomPreset(p.id!)}
                        className="p-1 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                        title="ลบรูปแบบนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-stone-900 mt-1">{p.defaultTitle}</h3>
                  <p className="text-xs text-stone-600 font-medium mt-1">{p.defaultPrompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          PRINTABLE REPORT PREVIEW MODAL (OFFICIAL PDF / PRINT & WORD DOC)
          ========================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Print media query override for perfect A4 printing */}
          <style>{`
            @media print {
              body {
                background: white !important;
                color: black !important;
              }
              body * {
                visibility: hidden !important;
              }
              #official-report-printable, #official-report-printable * {
                visibility: visible !important;
              }
              #official-report-printable {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 10mm 15mm !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
              }
              @page {
                size: A4 portrait;
                margin: 8mm 12mm;
              }
            }
          `}</style>

          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-8 border-4 border-stone-900 shadow-[8px_8px_0px_#000] my-6 max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:m-0 print:p-0">
            {/* Header / Actions toolbar (Hidden in print) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-stone-300 mb-6 gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-stone-900" />
                <div>
                  <h3 className="font-black text-base sm:text-lg text-stone-900 leading-tight">
                    ตัวอย่างรายงานราชการทางการ (Official Document Preview)
                  </h3>
                  <p className="text-[11px] font-bold text-stone-500">
                    แบบฟอร์มครุฑทางการ • พิมพ์ PDF พอดีกระดาษ A4 หรือส่งออกเป็นไฟล์ Word (.doc)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[1px_1px_0px_#000] flex items-center gap-1 cursor-pointer"
                  title="ดาวน์โหลดไฟล์ CSV สำหรับ Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportWordDoc}
                  className="px-3 py-1.5 bg-blue-400 hover:bg-blue-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[1px_1px_0px_#000] flex items-center gap-1 cursor-pointer"
                  title="ดาวน์โหลดเป็นเอกสาร Word (.doc)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Word (.doc)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                  title="สั่งพิมพ์หรือบันทึกเป็น PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์ / บันทึก PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-600 cursor-pointer"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Report Document Body (A4 Printable Layout) */}
            <div id="official-report-printable" className="space-y-5 text-stone-950 font-sans leading-relaxed text-sm">
              {/* Official Thai Garuda Emblem & Memo Header */}
              <div className="text-center pt-2 pb-1 space-y-1">
                <div className="flex justify-center text-stone-950 mb-1">
                  <ThaiGarudaEmblem className="w-16 h-16 sm:w-20 sm:h-20 text-stone-950" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-950">
                  บันทึกข้อความ
                </h1>
              </div>

              {/* Official Memo Letterhead Table */}
              <div className="border-b-2 border-stone-950 pb-3 text-xs sm:text-sm font-medium space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="font-black text-stone-950 shrink-0">ส่วนราชการ:</span>
                  <span>กลุ่มบริหารงานวิชาการและวัดผล โรงเรียนมัธยมศึกษา TaskHub สำนักงานเขตพื้นที่การศึกษามัธยมศึกษา</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-950 shrink-0">ที่:</span>
                    <span>ศธ ๐๔๒๒๕/รป.๒๕๖๙-{reportStats.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-950 shrink-0">วันที่:</span>
                    <span>{new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-black text-stone-950 shrink-0">เรื่อง:</span>
                  <span className="font-black">รายงานสรุป{reportStats.title} ประจำภาคเรียนที่ ๑ ปีการศึกษา ๒๕๖๙</span>
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <span className="font-black text-stone-950 shrink-0">เรียน:</span>
                  <span>ผู้อำนวยการโรงเรียนมัธยมศึกษา TaskHub</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap pt-1 text-xs sm:text-sm">
                  <span className="font-black text-stone-950 shrink-0">ข้อมูลรับรองระบบ (Admin):</span>
                  <span>
                    ชื่อผู้ใช้ (Username): <b className="font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">{adminUsername}</b>
                  </span>
                </div>
              </div>

              {/* Introductory Paragraph */}
              <p className="text-xs sm:text-sm text-justify indent-8 text-stone-800 leading-normal">
                ตามที่กลุ่มบริหารงานวิชาการ ได้ดำเนินการจัดการเรียนรู้และการวัดประเมินผลผู้เรียนผ่านระบบสารสนเทศและการบริหารจัดการการเรียนรู้ TaskHub ในระดับชั้นเรียน <b>{reportClassFilter.trim() ? reportClassFilter : 'ทุกห้องเรียน'}</b> บัดนี้ การจัดเก็บรวบรวมข้อมูลและการประเมินผลได้ดำเนินการเสร็จสิ้นเรียบร้อยแล้ว จึงขอรายงานสรุปผลการดำเนินงานเพื่อโปรดพิจารณา ดังปรากฏรายละเอียดในตารางข้อมูลต่อไปนี้
              </p>

              {/* Statistical Summary Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-stone-50 rounded-xl border-2 border-stone-900 text-center text-xs">
                <div>
                  <div className="text-[11px] font-bold text-stone-600">จำนวนรายการประเมิน</div>
                  <div className="text-lg font-black text-stone-900 mt-0.5">{reportStats.total} รายการ</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-stone-600">ผู้จัดทำและรายงาน (Admin)</div>
                  <div className="text-sm font-black text-stone-900 mt-0.5 truncate">{currentUser.name}</div>
                  <div className="text-[10px] font-mono text-stone-600">User: {adminUsername}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-stone-600">เกณฑ์คะแนนเฉลี่ย</div>
                  <div className="text-lg font-black text-amber-700 mt-0.5">{reportStats.avg}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-stone-600">ระดับผลสัมฤทธิ์</div>
                  <div className="text-lg font-black text-emerald-700 mt-0.5">ผ่านเกณฑ์ {reportStats.passedPct}%</div>
                </div>
              </div>

              {/* OVERVIEW PRINTABLE: VISUAL CHARTS & 4-PILLAR MATRIX */}
              {reportType === 'overview' ? (
                <div className="space-y-4">
                  {/* 1. Student Roster and Individual Assessment Table (ขึ้นก่อน - FIRST) */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-black text-stone-900 flex items-center justify-between">
                      <span>ส่วนที่ ๑: รายชื่อนักเรียนและตารางสรุปผลการประเมินรายบุคคล (Student Assessment Roster)</span>
                      <span className="text-[10px] font-mono text-stone-600">รวม {overviewStudents.length} คน</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse border-2 border-stone-950">
                        <thead>
                          <tr className="bg-stone-100 border-b-2 border-stone-950 font-black text-stone-950">
                            <th className="p-2 border border-stone-950 text-center w-10">ลำดับ</th>
                            <th className="p-2 border border-stone-950 text-center w-24">รหัส</th>
                            <th className="p-2 border border-stone-950">ชื่อ - สกุล นักเรียน</th>
                            <th className="p-2 border border-stone-950 text-center w-20">ห้อง/เลขที่</th>
                            <th className="p-2 border border-stone-950 text-center w-24">ส่งงาน (ชิ้น)</th>
                            <th className="p-2 border border-stone-950 text-center w-24">ผลสอบเฉลี่ย</th>
                            <th className="p-2 border border-stone-950 text-center w-20">ดาวสะสม</th>
                            <th className="p-2 border border-stone-950 text-center w-24">ผลการประเมิน</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-950 font-medium">
                          {overviewStudents.map((st, i) => (
                            <tr key={st.id} className="border-b border-stone-950">
                              <td className="p-2 border border-stone-950 text-center font-mono">{i + 1}</td>
                              <td className="p-2 border border-stone-950 text-center font-mono text-[11px]">{st.studentIdCode}</td>
                              <td className="p-2 border border-stone-950 font-bold">{st.name}</td>
                              <td className="p-2 border border-stone-950 text-center">{st.classRoom} ({st.studentNo})</td>
                              <td className="p-2 border border-stone-950 text-center">{st.hwTotal} งาน (ตรวจ {st.hwGraded})</td>
                              <td className="p-2 border border-stone-950 text-center font-bold">{st.avgExamPct}%</td>
                              <td className="p-2 border border-stone-950 text-center font-bold text-amber-900">{st.stars} ⭐</td>
                              <td className="p-2 border border-stone-950 text-center">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${
                                    st.statusLabel === 'ดีเยี่ยม'
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : st.statusLabel === 'ผ่านเกณฑ์'
                                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                                      : 'bg-rose-100 text-rose-900 border-rose-300'
                                  }`}
                                >
                                  {st.statusLabel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. Official Visual Column Bar Chart (ไว้ล่าง - แผนภูมิแท่ง) */}
                  <div className="p-3 bg-stone-50 rounded-xl border-2 border-stone-900 space-y-2 break-inside-avoid">
                    <div className="text-xs font-black text-stone-900 flex items-center justify-between border-b border-stone-300 pb-1.5">
                      <span>ส่วนที่ ๒: แผนภูมิแท่งสรุปภาพรวมผลสัมฤทธิ์ทางการศึกษา (Column Bar Chart Summary)</span>
                      <span className="text-[10px] font-mono text-stone-600">สเกล ๐ - ๑๐๐%</span>
                    </div>

                    <div className="relative pt-6 pb-2 px-2 bg-white rounded-lg border border-stone-300">
                      {/* Y-axis guidelines */}
                      <div className="absolute inset-x-8 top-6 bottom-14 flex flex-col justify-between pointer-events-none opacity-40">
                        <div className="border-b border-dashed border-stone-400 w-full flex justify-end">
                          <span className="text-[9px] font-mono text-stone-500 -mt-2 pr-1">100%</span>
                        </div>
                        <div className="border-b border-dashed border-stone-400 w-full flex justify-end">
                          <span className="text-[9px] font-mono text-stone-500 -mt-2 pr-1">75%</span>
                        </div>
                        <div className="border-b border-dashed border-stone-400 w-full flex justify-end">
                          <span className="text-[9px] font-mono text-stone-500 -mt-2 pr-1">50%</span>
                        </div>
                        <div className="border-b border-dashed border-stone-400 w-full flex justify-end">
                          <span className="text-[9px] font-mono text-stone-500 -mt-2 pr-1">25%</span>
                        </div>
                        <div className="border-b-2 border-stone-900 w-full flex justify-end">
                          <span className="text-[9px] font-mono text-stone-700 -mt-2 pr-1">0%</span>
                        </div>
                      </div>

                      {/* Column Bars */}
                      <div className="relative z-10 flex items-end justify-around gap-2 h-40 sm:h-44 px-3 pb-12">
                        {currentChartBars.map((bar) => {
                          const heightPct = Math.max(8, Math.min(100, bar.value));
                          return (
                            <div key={bar.id} className="flex-1 flex flex-col items-center h-full justify-end max-w-[85px]">
                              {/* Top Value Badge */}
                              <div className="mb-1 text-[10px] font-black font-mono text-stone-950 px-1 py-0.5 bg-stone-100 rounded border border-stone-300 shadow-xs">
                                {bar.displayValue}
                              </div>

                              {/* Vertical Column Bar */}
                              <div className="w-full flex justify-center h-full items-end">
                                <div
                                  className={`w-6 sm:w-8 rounded-t-md border-2 border-stone-900 shadow-xs ${bar.barColor}`}
                                  style={{ height: `${heightPct}%` }}
                                />
                              </div>

                              {/* Bottom Label and Note */}
                              <div className="absolute -bottom-1 text-center w-full max-w-[95px] leading-tight">
                                <div className="text-[10px] font-bold text-stone-900 truncate">
                                  {bar.shortLabel}
                                </div>
                                <div className="text-[9px] text-stone-500 font-mono truncate">
                                  {bar.note || `${bar.value}%`}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 3. Official 4-Pillars Evaluation Table */}
                  <div className="overflow-x-auto space-y-1.5 break-inside-avoid">
                    <div className="text-xs font-black text-stone-900">
                      ส่วนที่ ๓: ตารางจำแนกผลการดำเนินงาน ๔ ด้านหลัก (Executive Summary Matrix)
                    </div>
                    <table className="w-full text-left text-xs border-collapse border-2 border-stone-950">
                      <thead>
                        <tr className="bg-stone-100 border-b-2 border-stone-950 font-black text-stone-950">
                          <th className="p-2 border border-stone-950 w-8 text-center">ที่</th>
                          <th className="p-2 border border-stone-950 w-36">ด้านการประเมิน (๔ ด้านหลัก)</th>
                          <th className="p-2 border border-stone-950">ดัชนีชี้วัดผลสัมฤทธิ์</th>
                          <th className="p-2 border border-stone-950 text-center w-28">ยอดที่บันทึก</th>
                          <th className="p-2 border border-stone-950 text-center w-28">ร้อยละ / ค่าเฉลี่ย</th>
                          <th className="p-2 border border-stone-950 text-center w-28">ผลการประเมิน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-950 font-medium">
                        <tr className="border-b border-stone-950">
                          <td className="p-2 border border-stone-950 text-center font-mono">๑</td>
                          <td className="p-2 border border-stone-950 font-bold">การส่งการบ้านและภาระงาน</td>
                          <td className="p-2 border border-stone-950">อัตราการส่งงานและการตรวจให้คะแนนของครูผู้สอน</td>
                          <td className="p-2 border border-stone-950 text-center">{reportStats.overview?.totalHw || 0} รายการ</td>
                          <td className="p-2 border border-stone-950 text-center font-bold">ตรวจแล้ว {reportStats.overview?.hwGradedPct || 100}%</td>
                          <td className="p-2 border border-stone-950 text-center font-bold">ตรวจเสร็จสิ้น</td>
                        </tr>
                        <tr className="border-b border-stone-950">
                          <td className="p-2 border border-stone-950 text-center font-mono">๒</td>
                          <td className="p-2 border border-stone-950 font-bold">ผลสัมฤทธิ์แบบทดสอบ</td>
                          <td className="p-2 border border-stone-950">ผลการทดสอบวัดความรู้และอัตราการผ่านเกณฑ์</td>
                          <td className="p-2 border border-stone-950 text-center">{reportStats.overview?.totalExams || 0} ครั้ง</td>
                          <td className="p-2 border border-stone-950 text-center font-bold">ผ่านเกณฑ์ {reportStats.overview?.examPassPct || 100}%</td>
                          <td className="p-2 border border-stone-950 text-center font-bold">ผ่านเกณฑ์มาตรฐาน</td>
                        </tr>
                        <tr className="border-b border-stone-950">
                          <td className="p-2 border border-stone-950 text-center font-mono">๓</td>
                          <td className="p-2 border border-stone-950 font-bold">สมุดคะแนนและดาวสะสม</td>
                          <td className="p-2 border border-stone-950">การมีส่วนร่วมในห้องเรียนและยอดดาวสะสมเกียรติยศ</td>
                          <td className="p-2 border border-stone-950 text-center">{reportStats.overview?.totalStudents || 0} คน</td>
                          <td className="p-2 border border-stone-950 text-center font-bold">เฉลี่ย {reportStats.overview?.avgStars || 0} ⭐/คน</td>
                          <td className="p-2 border border-stone-950 text-center font-bold">ระดับดีเยี่ยม</td>
                        </tr>
                        <tr className="border-b border-stone-950">
                          <td className="p-2 border border-stone-950 text-center font-mono">๔</td>
                          <td className="p-2 border border-stone-950 font-bold">มุมสะท้อนคิดและสุขภาวะ</td>
                          <td className="p-2 border border-stone-950">การสะท้อนความคิดเห็นและการดูแลให้คำปรึกษา</td>
                          <td className="p-2 border border-stone-950 text-center">{reportStats.overview?.totalEvals || 0} เรื่อง</td>
                          <td className="p-2 border border-stone-950 text-center font-bold">เฉลี่ย {reportStats.overview?.avgEvalRating || 0} / 5 ⭐</td>
                          <td className="p-2 border border-stone-950 text-center font-bold">พึงพอใจ {reportStats.overview?.evalHappyPct || 100}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 4. Formal Executive Commentary */}
                  <div className="p-3 bg-stone-50 border border-stone-900 rounded-xl space-y-1 text-xs break-inside-avoid">
                    <div className="font-bold text-stone-950">ข้อสรุปผลการวิเคราะห์และข้อเสนอแนะเชิงบริหาร (Executive Commentary):</div>
                    <p className="text-stone-700 indent-4 leading-normal">
                      จากข้อมูลเชิงประจักษ์ในระบบ TaskHub พบว่าผู้เรียนมีผลสัมฤทธิ์ทางการเรียนและการส่งงานอยู่ในเกณฑ์มาตรฐาน คิดเป็นร้อยละ <b>{reportStats.passedPct}%</b> ครูผู้สอนสามารถกำกับติดตามงานและตอบกลับการสะท้อนคิดได้อย่างมีประสิทธิภาพ เห็นควรส่งเสริมกิจกรรมการเรียนรู้แบบมีปฏิสัมพันธ์และมอบรางวัลสติกเกอร์เกียรติยศอย่างต่อเนื่อง
                    </p>
                  </div>
                </div>
              ) : (
                /* Itemized Bordered Data Table for Single Category Reports */
                <div className="space-y-4">
                  {/* 1. Student / Itemized Table (ขึ้นก่อน - FIRST) */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-black text-stone-900">
                      ส่วนที่ ๑: รายชื่อนักเรียนและตารางบันทึกข้อมูลผลการดำเนินงาน
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse border-2 border-stone-950">
                        <thead>
                          <tr className="bg-stone-100 border-b-2 border-stone-950 font-black text-stone-950">
                            <th className="p-2 border border-stone-950 text-center w-12">ลำดับ</th>
                            <th className="p-2 border border-stone-950">ชื่อ - สกุล นักเรียน</th>
                            <th className="p-2 border border-stone-950 text-center w-24">ห้อง/เลขที่</th>
                            <th className="p-2 border border-stone-950">หัวข้อ / กิจกรรม / รายวิชา</th>
                            <th className="p-2 border border-stone-950 text-center w-28">ผลคะแนน</th>
                            <th className="p-2 border border-stone-950 text-center w-24">ผลการประเมิน</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-950 font-medium">
                          {reportType === 'homework' &&
                            homeworkList
                              .filter((h) => isClassMatched(h.studentClass))
                              .map((h, i) => (
                                <tr key={h.id} className="border-b border-stone-950">
                                  <td className="p-2 border border-stone-950 text-center font-mono">{i + 1}</td>
                                  <td className="p-2 border border-stone-950 font-bold">{h.studentName}</td>
                                  <td className="p-2 border border-stone-950 text-center">{h.studentClass} ({h.studentNo || '-'})</td>
                                  <td className="p-2 border border-stone-950">{h.title} {h.subject ? `[${h.subject}]` : ''}</td>
                                  <td className="p-2 border border-stone-950 text-center font-bold">{h.score ?? '-'} / {h.maxScore ?? 10}</td>
                                  <td className="p-2 border border-stone-950 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.status === 'graded' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                                      {h.status === 'graded' ? 'ตรวจแล้ว' : 'รอตรวจ'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          {reportType === 'quiz' &&
                            examScores
                              .filter((s) => isClassMatched(s.studentClass))
                              .map((s, i) => {
                                const pct = Math.round((s.score / (s.maxScore || 1)) * 100);
                                const isPass = pct >= 60;
                                return (
                                  <tr key={s.id} className="border-b border-stone-950">
                                    <td className="p-2 border border-stone-950 text-center font-mono">{i + 1}</td>
                                    <td className="p-2 border border-stone-950 font-bold">{s.studentName}</td>
                                    <td className="p-2 border border-stone-950 text-center">{s.studentClass || '-'} ({s.studentNo || '-'})</td>
                                    <td className="p-2 border border-stone-950">{s.lessonTitle}</td>
                                    <td className="p-2 border border-stone-950 text-center font-bold">{s.score} / {s.maxScore} ({pct}%)</td>
                                    <td className="p-2 border border-stone-950 text-center">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isPass ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                                        {isPass ? 'ผ่านเกณฑ์' : 'ควรปรับปรุง'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                          {reportType === 'scorebook' &&
                            studentRecords
                              .filter((s) => isClassMatched(s.classRoom))
                              .map((s, i) => (
                                <tr key={s.id} className="border-b border-stone-950">
                                  <td className="p-2 border border-stone-950 text-center font-mono">{i + 1}</td>
                                  <td className="p-2 border border-stone-950 font-bold">{s.name}</td>
                                  <td className="p-2 border border-stone-950 text-center">{s.classRoom} ({s.studentNo})</td>
                                  <td className="p-2 border border-stone-950 font-mono">รหัส {s.studentIdCode}</td>
                                  <td className="p-2 border border-stone-950 text-center font-bold text-amber-900">{s.totalStars} ⭐</td>
                                  <td className="p-2 border border-stone-950 text-center">ส่งแล้ว {s.homeworkCount || 0} ชิ้น</td>
                                </tr>
                              ))}
                          {reportType === 'reflection' &&
                            evaluations
                              .filter((e) => isClassMatched(e.studentClass))
                              .map((e, i) => (
                                <tr key={e.id} className="border-b border-stone-950">
                                  <td className="p-2 border border-stone-950 text-center font-mono">{i + 1}</td>
                                  <td className="p-2 border border-stone-950 font-bold">{e.studentName}</td>
                                  <td className="p-2 border border-stone-950 text-center">{e.studentClass}</td>
                                  <td className="p-2 border border-stone-950">{e.topicTitle}</td>
                                  <td className="p-2 border border-stone-950 text-center font-bold text-pink-900">{e.ratingStars} / 5 ⭐</td>
                                  <td className="p-2 border border-stone-950 text-center">{e.teacherReply ? 'ตอบกลับแล้ว' : 'รอตอบกลับ'}</td>
                                </tr>
                              ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. Official Visual Column Bar Chart (ไว้ล่าง - แผนภูมิแท่ง) */}
                  <div className="p-3 bg-stone-50 rounded-xl border-2 border-stone-900 space-y-2 break-inside-avoid">
                    <div className="text-xs font-black text-stone-900 flex items-center justify-between border-b border-stone-300 pb-1.5">
                      <span>ส่วนที่ ๒: แผนภูมิแท่งสรุปผลการประเมิน (Column Bar Chart Summary)</span>
                      <span className="text-[10px] font-mono text-stone-600">สเกล ๐ - ๑๐๐%</span>
                    </div>

                    <div className="relative pt-6 pb-2 px-2 bg-white rounded-lg border border-stone-300">
                      {/* Y-axis guidelines */}
                      <div className="absolute inset-x-8 top-6 bottom-14 flex flex-col justify-between pointer-events-none opacity-40">
                        <div className="border-b border-dashed border-stone-400 w-full flex justify-end">
                          <span className="text-[9px] font-mono text-stone-500 -mt-2 pr-1">100%</span>
                        </div>
                        <div className="border-b border-dashed border-stone-400 w-full flex justify-end">
                          <span className="text-[9px] font-mono text-stone-500 -mt-2 pr-1">75%</span>
                        </div>
                        <div className="border-b border-dashed border-stone-400 w-full flex justify-end">
                          <span className="text-[9px] font-mono text-stone-500 -mt-2 pr-1">50%</span>
                        </div>
                        <div className="border-b border-dashed border-stone-400 w-full flex justify-end">
                          <span className="text-[9px] font-mono text-stone-500 -mt-2 pr-1">25%</span>
                        </div>
                        <div className="border-b-2 border-stone-900 w-full flex justify-end">
                          <span className="text-[9px] font-mono text-stone-700 -mt-2 pr-1">0%</span>
                        </div>
                      </div>

                      {/* Column Bars */}
                      <div className="relative z-10 flex items-end justify-around gap-2 h-40 sm:h-44 px-3 pb-12">
                        {currentChartBars.map((bar) => {
                          const heightPct = Math.max(8, Math.min(100, bar.value));
                          return (
                            <div key={bar.id} className="flex-1 flex flex-col items-center h-full justify-end max-w-[85px]">
                              {/* Top Value Badge */}
                              <div className="mb-1 text-[10px] font-black font-mono text-stone-950 px-1 py-0.5 bg-stone-100 rounded border border-stone-300 shadow-xs">
                                {bar.displayValue}
                              </div>

                              {/* Vertical Column Bar */}
                              <div className="w-full flex justify-center h-full items-end">
                                <div
                                  className={`w-6 sm:w-8 rounded-t-md border-2 border-stone-900 shadow-xs ${bar.barColor}`}
                                  style={{ height: `${heightPct}%` }}
                                />
                              </div>

                              {/* Bottom Label and Note */}
                              <div className="absolute -bottom-1 text-center w-full max-w-[95px] leading-tight">
                                <div className="text-[10px] font-bold text-stone-900 truncate">
                                  {bar.shortLabel}
                                </div>
                                <div className="text-[9px] text-stone-500 font-mono truncate">
                                  {bar.note || `${bar.value}%`}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formal Closing */}
              <p className="text-xs sm:text-sm indent-8 text-stone-900 pt-2">
                จึงเรียนมาเพื่อโปรดทราบและพิจารณาให้ความเห็นชอบ
              </p>

              {/* Official Tri-Party Signatures Block */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs break-inside-avoid">
                <div className="space-y-1.5">
                  <div className="text-stone-700">(ลงชื่อ)....................................................</div>
                  <div className="font-bold text-stone-950">({currentUser.name})</div>
                  <div className="text-stone-600 font-medium text-[11px]">
                    {currentUser.role === 'admin' ? 'ผู้ดูแลระบบและจัดทำรายงาน (Admin)' : 'ครูผู้สอนกลุ่มสาระฯ'}
                  </div>
                  <div className="text-[11px] text-stone-700 font-medium">
                    ชื่อผู้ใช้: <span className="font-mono font-bold">{adminUsername}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">วันที่ ...... / ...... / ............</div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-stone-700">(ลงชื่อ)....................................................</div>
                  <div className="font-bold text-stone-950">(นางสาวพิมพ์ใจ วิจิตรศิลป์)</div>
                  <div className="text-stone-600 font-medium text-[11px]">หัวหน้ากลุ่มงานวัดและประเมินผล</div>
                  <div className="text-[11px] text-stone-500">วันที่ ...... / ...... / ............</div>
                </div>

                <div className="space-y-1.5 relative">
                  <div className="text-stone-700">(ลงชื่อ)....................................................</div>
                  <div className="font-bold text-stone-950">(นายดนัย สิทธิเดช)</div>
                  <div className="text-stone-600 font-medium text-[11px]">ผู้อำนวยการโรงเรียนมัธยมศึกษา TaskHub</div>
                  <div className="text-[11px] text-stone-500">วันที่ ...... / ...... / ............</div>
                  <div className="text-[10px] text-stone-400 font-serif italic mt-1">( ประทับตราสถานศึกษา )</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODALS: HOMEWORK / USER / TASK / QUIZ / SCORE / STUDENT / EVAL / TOPIC
          ========================================================= */}

      {/* 1. HOMEWORK MODAL */}
      {isHwModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 flex items-center justify-center p-4">
          <form onSubmit={handleSaveHomework} className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-stone-900 shadow-[6px_6px_0px_#000] space-y-4">
            <h3 className="text-lg font-black text-stone-900">
              {editingHw ? 'แก้ไขข้อมูลการส่งการบ้าน' : 'เพิ่มรายการส่งการบ้านใหม่'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">ชื่อนักเรียน *</label>
                <input
                  type="text"
                  value={hwStudentName}
                  onChange={(e) => setHwStudentName(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">ชั้นเรียน</label>
                  <input
                    type="text"
                    value={hwClass}
                    onChange={(e) => setHwClass(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">เลขที่</label>
                  <input
                    type="text"
                    value={hwStudentNo}
                    onChange={(e) => setHwStudentNo(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">ชิ้นงาน/หัวข้องาน *</label>
                <input
                  type="text"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">คะแนน</label>
                  <input
                    type="number"
                    value={hwScore}
                    onChange={(e) => setHwScore(Number(e.target.value))}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">เต็ม</label>
                  <input
                    type="number"
                    value={hwMaxScore}
                    onChange={(e) => setHwMaxScore(Number(e.target.value))}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">สถานะ</label>
                  <select
                    value={hwStatus}
                    onChange={(e) => setHwStatus(e.target.value as HomeworkStatus)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  >
                    <option value="graded">ตรวจแล้ว</option>
                    <option value="pending">รอตรวจ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">ความเห็น/ข้อเสนอแนะครู</label>
                <textarea
                  value={hwFeedback}
                  onChange={(e) => setHwFeedback(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsHwModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-400 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                บันทึกการบ้าน
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 flex items-center justify-center p-4">
          <form onSubmit={handleSaveUser} className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-stone-900 shadow-[6px_6px_0px_#000] space-y-4">
            <h3 className="text-lg font-black text-stone-900">
              {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">ชื่อ-สกุล *</label>
                <input
                  type="text"
                  value={formUserName}
                  onChange={(e) => setFormUserName(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">อีเมล / Username</label>
                  <input
                    type="text"
                    value={formUserEmail}
                    onChange={(e) => setFormUserEmail(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">รหัสผ่าน</label>
                  <input
                    type="text"
                    value={formUserPassword}
                    onChange={(e) => setFormUserPassword(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">สิทธิ์ (Role)</label>
                  <select
                    value={formUserRole}
                    onChange={(e) => setFormUserRole(e.target.value as UserRole)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  >
                    <option value="student">นักเรียน</option>
                    <option value="teacher">คุณครู</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">ห้องเรียน</label>
                  <input
                    type="text"
                    value={formUserClass}
                    onChange={(e) => setFormUserClass(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">เลขที่</label>
                  <input
                    type="text"
                    value={formUserNo}
                    onChange={(e) => setFormUserNo(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                บันทึกผู้ใช้
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 flex items-center justify-center p-4">
          <form onSubmit={handleSaveTask} className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-stone-900 shadow-[6px_6px_0px_#000] space-y-4">
            <h3 className="text-lg font-black text-stone-900">
              {editingTask ? 'แก้ไขชิ้นงาน/ภาระงาน' : 'เพิ่มชิ้นงาน/ภาระงานใหม่'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">ชื่อชิ้นงาน *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">วิชา</label>
                  <input
                    type="text"
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">กลุ่มเป้าหมาย (ห้อง)</label>
                  <input
                    type="text"
                    value={taskTargetClass}
                    onChange={(e) => setTaskTargetClass(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">คำอธิบายงาน</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">กำหนดส่ง</label>
                  <input
                    type="text"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">ดาวรางวัล (+⭐)</label>
                  <input
                    type="number"
                    value={taskStars}
                    onChange={(e) => setTaskStars(Number(e.target.value))}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                บันทึกชิ้นงาน
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. QUIZ MODAL */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 flex items-center justify-center p-4">
          <form onSubmit={handleSaveQuiz} className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-stone-900 shadow-[6px_6px_0px_#000] space-y-4">
            <h3 className="text-lg font-black text-stone-900">
              {editingQuiz ? 'แก้ไขแบบทดสอบ' : 'สร้างแบบทดสอบใหม่'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">ชื่อแบบทดสอบ *</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">คำอธิบายแบบทดสอบ</label>
                <textarea
                  value={quizDesc}
                  onChange={(e) => setQuizDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">ระดับชั้น</label>
                  <input
                    type="text"
                    value={quizClass}
                    onChange={(e) => setQuizClass(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">จำนวนข้อคำถาม</label>
                  <input
                    type="number"
                    value={quizQuestionsCount}
                    onChange={(e) => setQuizQuestionsCount(Number(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsQuizModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-400 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                บันทึกแบบทดสอบ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. SCORE MODAL */}
      {isScoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 flex items-center justify-center p-4">
          <form onSubmit={handleSaveScore} className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-stone-900 shadow-[6px_6px_0px_#000] space-y-4">
            <h3 className="text-lg font-black text-stone-900">
              {editingScore ? 'แก้ไขคะแนนสอบรายบุคคล' : 'เพิ่มคะแนนสอบรายบุคคล'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">ชื่อนักเรียน *</label>
                <input
                  type="text"
                  value={scoreStudentName}
                  onChange={(e) => setScoreStudentName(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">ห้องเรียน</label>
                  <input
                    type="text"
                    value={scoreClass}
                    onChange={(e) => setScoreClass(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">ชื่อแบบทดสอบ</label>
                  <input
                    type="text"
                    value={scoreLessonTitle}
                    onChange={(e) => setScoreLessonTitle(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">คะแนนที่ได้</label>
                  <input
                    type="number"
                    value={scoreValue}
                    onChange={(e) => setScoreValue(Number(e.target.value))}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">คะแนนเต็ม</label>
                  <input
                    type="number"
                    value={scoreMax}
                    onChange={(e) => setScoreMax(Number(e.target.value))}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-400 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                บันทึกคะแนน
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. STUDENT RECORD MODAL */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 flex items-center justify-center p-4">
          <form onSubmit={handleSaveStudent} className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-stone-900 shadow-[6px_6px_0px_#000] space-y-4">
            <h3 className="text-lg font-black text-stone-900">
              {editingStudent ? 'แก้ไขข้อมูลนักเรียนในสมุดคะแนน' : 'เพิ่มนักเรียนใหม่'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">ชื่อ - สกุล นักเรียน *</label>
                <input
                  type="text"
                  value={stdName}
                  onChange={(e) => setStdName(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">รหัสประจำตัว (ID Code)</label>
                  <input
                    type="text"
                    value={stdCode}
                    onChange={(e) => setStdCode(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">ชั้นเรียน</label>
                  <input
                    type="text"
                    value={stdClass}
                    onChange={(e) => setStdClass(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">เลขที่</label>
                  <input
                    type="text"
                    value={stdNo}
                    onChange={(e) => setStdNo(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">ดาวสะสมเริ่มต้น (ดวง)</label>
                  <input
                    type="number"
                    value={stdStars}
                    onChange={(e) => setStdStars(Number(e.target.value))}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. EVALUATION MODAL */}
      {isEvalModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 flex items-center justify-center p-4">
          <form onSubmit={handleSaveEval} className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-stone-900 shadow-[6px_6px_0px_#000] space-y-4">
            <h3 className="text-lg font-black text-stone-900">
              {editingEval ? 'แก้ไขข้อมูลการประเมินผล' : 'เพิ่มรายการประเมินผลใหม่'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">ชื่อนักเรียน *</label>
                <input
                  type="text"
                  value={evalStudentName}
                  onChange={(e) => setEvalStudentName(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">ห้องเรียน</label>
                  <input
                    type="text"
                    value={evalClass}
                    onChange={(e) => setEvalClass(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">ระดับดาวประเมิน (1 - 5 ดาว)</label>
                  <select
                    value={evalRating}
                    onChange={(e) => setEvalRating(Number(e.target.value))}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 ดาว - ดีเยี่ยม)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 ดาว - ดีมาก)</option>
                    <option value={3}>⭐⭐⭐ (3 ดาว - ปานกลาง)</option>
                    <option value={2}>⭐⭐ (2 ดาว - พอใช้)</option>
                    <option value={1}>⭐ (1 ดาว - ต้องปรับปรุง)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">หัวข้อกิจกรรม/การสะท้อนคิด *</label>
                <input
                  type="text"
                  value={evalTopic}
                  onChange={(e) => setEvalTopic(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">ข้อคิดเห็นของนักเรียน</label>
                <textarea
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">คำตอบกลับของคุณครู</label>
                <textarea
                  value={evalReply}
                  onChange={(e) => setEvalReply(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsEvalModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-400 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                บันทึกการประเมิน
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. TOPIC MODAL */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 flex items-center justify-center p-4">
          <form onSubmit={handleSaveTopic} className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-stone-900 shadow-[6px_6px_0px_#000] space-y-4">
            <h3 className="text-lg font-black text-stone-900">
              {editingTopic ? 'แก้ไขหัวข้อสะท้อนคิด' : 'เพิ่มหัวข้อสะท้อนคิดใหม่'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">ชื่อหัวข้อสะท้อนคิด *</label>
                <input
                  type="text"
                  value={tTitle}
                  onChange={(e) => setTTitle(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">คำถามชวนคิดกระตุ้นการเรียนรู้ *</label>
                <textarea
                  value={tPrompt}
                  onChange={(e) => setTPrompt(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">หมวดหมู่</label>
                  <input
                    type="text"
                    value={tCategory}
                    onChange={(e) => setTCategory(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">กลุ่มเป้าหมาย (ห้อง)</label>
                  <input
                    type="text"
                    value={tClass}
                    onChange={(e) => setTClass(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-400 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                บันทึกหัวข้อ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 9. ADD PRESET MODAL */}
      {isAddingPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 flex items-center justify-center p-4">
          <form onSubmit={handleSaveNewPreset} className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-stone-900 shadow-[6px_6px_0px_#000] space-y-4">
            <h3 className="text-lg font-black text-stone-900">เพิ่มรูปแบบการสนทนาใหม่ (New Topic Preset)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">หมวดหมู่ (Category) *</label>
                <input
                  type="text"
                  value={newPresetCategory}
                  onChange={(e) => setNewPresetCategory(e.target.value)}
                  placeholder="เช่น วิทยาการคำนวณ, คณิตศาสตร์, แนะแนว..."
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">หัวข้อสนทนา (Title) *</label>
                <input
                  type="text"
                  value={newPresetTitle}
                  onChange={(e) => setNewPresetTitle(e.target.value)}
                  placeholder="เช่น อัลกอริทึมในชีวิตประจำวัน..."
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">คำถามกระตุ้นการสนทนา (Prompt Question) *</label>
                <textarea
                  value={newPresetPrompt}
                  onChange={(e) => setNewPresetPrompt(e.target.value)}
                  rows={2}
                  placeholder="เช่น นักเรียนคิดว่าเราสามารถนำอัลกอริทึมมาช่วยประหยัดเวลาได้อย่างไรบ้าง..."
                  className="w-full bg-stone-50 p-2.5 rounded-xl border-2 border-stone-300 text-xs font-bold"
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsAddingPresetModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                บันทึกรูปแบบ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
