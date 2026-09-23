export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  studentIdCode?: string; // e.g. "STD-670301" or "รหัสนักเรียน 5 หลัก"
  teacherIdCode?: string; // e.g. "TCH-301"
  classRoom: string; // e.g. "ห้อง 1", "ห้อง 2"
  studentNo: string; // e.g. "12"
  avatar: string; // emoji or avatar identifier
  totalStars: number;
  unlockedStickers: string[]; // sticker IDs
  googleEmail?: string; // e.g. "user@gmail.com" or school email
  usernameOrEmail?: string; // e.g. "6711502234@chandra.ac.th" or username
}

export type HomeworkStatus = 'pending' | 'reviewed' | 'needs_fix' | 'graded';

export interface AssignmentTask {
  id: string;
  title: string;
  subject: string;
  description: string;
  targetClass: string; // e.g. "ทุกห้อง", "ห้อง 1", "ห้อง 2"
  maxScore: number; // e.g. 10, 20, 100
  dueDate: string; // e.g. "15 ก.ย. 2569"
  createdAt: string;
  updatedAt?: string;
  authorTeacher: string;
  attachmentName?: string;
  attachmentLink?: string;
  attachmentData?: string; // base64 / data URL for PDF, JPG, PNG, DOCX
  attachmentType?: string; // 'pdf' | 'image' | 'docx' | 'url'
  attachmentSize?: string;
  rewardStars: number;
}

export interface Homework {
  id: string;
  taskId?: string; // ID of the AssignmentTask if linked
  title: string;
  subject: string;
  description: string;
  link: string;
  attachedFileName?: string;
  attachedFileData?: string; // base64 / data URL for PDF, JPG, PNG, DOCX
  attachedFileType?: string; // 'pdf' | 'image' | 'docx' | 'url'
  attachedFileSize?: string;
  submittedAt: string;
  updatedAt: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentNo?: string;
  studentAvatar: string;
  status: HomeworkStatus;
  teacherScore?: number;
  score?: number;
  maxScore?: number;
  teacherComment?: string;
  feedback?: string;
  earnedStars: number;
}

export interface TeacherReflectionTopic {
  id: string;
  title: string;
  promptQuestion: string;
  targetClass: string; // e.g. "ทุกห้อง", "ห้อง 1", "ห้อง 2"
  authorTeacher: string;
  teacherAvatar?: string;
  createdAt: string;
  pinned?: boolean;
}

export interface TeacherEvaluation {
  id: string;
  topicId?: string; // which reflection topic this feedback responds to
  topicTitle?: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentAvatar?: string;
  studentNo?: string;
  ratingStars: number; // 1 - 5
  overallRating?: number;
  improvementText: string;
  recommendationText: string;
  submittedAt: string;
  isAnonymous: boolean;
  teacherReply?: string;
  teacherRepliedAt?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tip?: string;
  imageUrl?: string; // Teacher can add an image (JPG, PNG) to the question
}

export interface QuizLesson {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badgeColor?: string;
  subject?: string;
  targetClass?: string;
  authorTeacher?: string;
  createdAt?: string;
  dueDate?: string;
  timeLimitMinutes?: number;
  questions: QuizQuestion[];
  bestScore?: number;
  lastAttemptAt?: string;
}

export interface StudentExamScore {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentNo: string;
  studentAvatar: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  earnedStars?: number;
  answers?: Record<number, number>;
}

export type ExamScore = StudentExamScore;

export interface StickerAchievement {
  id: string;
  name: string;
  thaiTitle: string;
  description: string;
  icon: string;
  color: string;
  condition: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface AwardedBadgeItem {
  id: string;
  stickerId: string;
  stickerName: string;
  thaiTitle: string;
  icon: string;
  awardedBy: string;
  awardedAt: string;
  starsAdded: number;
  note: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  studentIdCode: string;
  classRoom: string;
  studentNo: string;
  avatar: string;
  totalStars: number;
  unlockedStickers: string[];
  awardedBadges: AwardedBadgeItem[];
  homeworkCount: number;
  homeworkCompletedCount?: number;
  totalHomeworkScore?: number;
  quizScores: Record<string, number>;
  quizCompletedCount?: number;
  totalQuizScore?: number;
  registeredAt?: string;
}

export interface StudentRegistrationRecord {
  id: string;
  registeredAt: string;
  firstName: string;
  lastName: string;
  fullName: string;
  studentNo: string;
  studentIdCode: string;
  classRoom: string;
}

export interface TeacherRegistrationRecord {
  id: string;
  registeredAt: string;
  firstName: string;
  lastName: string;
  fullName: string;
  subject: string;
  email: string;
}

export type ActiveTab = 'homework' | 'quiz' | 'scorebook' | 'reflection' | 'dashboard';

