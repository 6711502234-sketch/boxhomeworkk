export type UserRole = 'student' | 'teacher' | 'admin';

export interface CustomTopicPreset {
  id: string;
  category: string;
  label: string;
  defaultTitle: string;
  defaultPrompt: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  studentIdCode?: string; // e.g. "STD-670301" or "รหัสนักเรียน 5 หลัก"
  teacherIdCode?: string; // e.g. "TCH-301"
  classRoom: string; // e.g. "ม.2/3", "ห้อง 1"
  studentNo: string; // e.g. "12"
  gradeLevel?: string; // e.g. "ม.2"
  room?: string; // e.g. "3"
  subjectDepartment?: string; // e.g. "วิทยาศาสตร์และเทคโนโลยี"
  teachingSubject?: string; // e.g. "วิทยาการคำนวณ"
  teachingClasses?: string[]; // e.g. ["ม.2/1", "ม.2/3"]
  avatar: string; // emoji or avatar identifier
  totalStars: number;
  unlockedStickers: string[]; // sticker IDs
  googleEmail?: string; // e.g. "user@gmail.com" or school email
  usernameOrEmail?: string; // e.g. "6711502234@chandra.ac.th" or username
  password?: string; // password for admin / user accounts
  phone?: string; // contact phone number
  department?: string; // department / division
}

export type HomeworkStatus = 'pending' | 'reviewed' | 'needs_fix' | 'graded';

export type AssessmentType =
  | 'คำถามชวนคิดทั่วไป'
  | 'Assessment as Learning'
  | 'Assessment for Learning'
  | 'Assessment of Learning';

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
  teacherId?: string;
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
  teacherId?: string;
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
  teacherFeedback?: string;
  linkUrl?: string;
  earnedStars: number;
}

export interface WhiteboardSession {
  id: string;
  title: string;
  topicCategory?: string;
  promptQuestion: string;
  targetClass: string; // e.g. "ทุกห้อง", "ห้อง 1", "ห้อง 2", "ม.2/1"
  teacherId: string;
  authorTeacher?: string;
  teacherName?: string;
  teacherAvatar?: string;
  status: 'active' | 'ended'; // 'active' (กำลังสนทนาสด) | 'ended' (หยุดสนทนาแล้ว)
  imageUrl?: string; // Optional attached picture
  createdAt: string;
  endedAt?: string;
}

export interface WhiteboardMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  senderClass?: string;
  senderNo?: string;
  text: string;
  imageUrl?: string; // Photo sent by teacher or student
  ratingStars?: number; // 1-5 stars
  starsAwarded?: number;
  isAnonymous?: boolean;
  createdAt: string;
  timestamp?: number;
  isEdited?: boolean;
  editedAt?: string;
}

export interface TeacherReflectionTopic {
  id: string;
  assessmentType?: AssessmentType;
  title: string;
  promptQuestion: string;
  category?: string;
  targetClass: string; // e.g. "ทุกห้อง", "ห้อง 1", "ห้อง 2"
  authorTeacher: string;
  teacherId?: string;
  teacherAvatar?: string;
  createdAt: string;
  pinned?: boolean;
}

export interface TeacherEvaluation {
  id: string;
  topicId?: string; // which reflection topic this feedback responds to
  topicTitle?: string;
  assessmentType?: AssessmentType;
  teacherId?: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentAvatar?: string;
  studentNo?: string;
  ratingStars: number; // 1 - 5
  overallRating?: number;
  improvementText: string;
  recommendationText: string;
  teacherFeedback?: string;
  submittedAt: string;
  isAnonymous: boolean;
  teacherReply?: string;
  teacherRepliedAt?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  optionImages?: (string | undefined)[]; // Optional image per choice (JPG, PNG, Data URL)
  correctIndex: number;
  explanation: string;
  tip?: string;
  imageUrl?: string; // Teacher can add an image (JPG, PNG) to the question
}

export interface QuizLesson {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  icon: string;
  badgeColor?: string;
  subject?: string;
  targetClass?: string;
  authorTeacher?: string;
  teacherId?: string;
  createdAt?: string;
  dueDate?: string;
  timeLimitMinutes?: number;
  questions: QuizQuestion[];
  totalQuestions?: number;
  bestScore?: number;
  lastAttemptAt?: string;
}

export interface StudentExamScore {
  id: string;
  teacherId?: string;
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
  teacherId?: string;
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

export type ActiveTab =
  | 'homework'
  | 'quiz'
  | 'scorebook'
  | 'reflection'
  | 'dashboard'
  | 'admin'
  | 'admin_dashboard'
  | 'admin_users'
  | 'admin_homework'
  | 'admin_tasks'
  | 'admin_quizzes'
  | 'admin_exam_scores'
  | 'admin_scorebook'
  | 'admin_gradebook'
  | 'admin_reflections'
  | 'admin_presets'
  | 'admin_reports'
  | 'admin_profile';
