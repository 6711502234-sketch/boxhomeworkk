import { StickerAchievement, AssignmentTask, Homework } from '../types';

export const initialStickers: StickerAchievement[] = [
  {
    id: 'first-step',
    name: 'First Step',
    thaiTitle: 'ผู้เริ่มต้นไฟแรง',
    description: 'ส่งการบ้านชิ้นแรกเข้าสู่กล่องการบ้านเรียบร้อย',
    icon: '🌟',
    color: 'from-amber-200 to-yellow-400 border-amber-500',
    condition: 'ส่งการบ้านสำเร็จอย่างน้อย 1 ชิ้น',
    isUnlocked: true, // initial state for demo or unlocked upon first homework
    unlockedAt: '2026-09-02'
  },
  {
    id: 'super-critic',
    name: 'Super Critic',
    thaiTitle: 'นักประเมินยอดเยี่ยม',
    description: 'ส่งแบบประเมินและข้อเสนอแนะให้คุณครูด้วยความตั้งใจ',
    icon: '💖',
    color: 'from-pink-200 to-rose-400 border-rose-500',
    condition: 'ส่งแบบประเมินกิจกรรมคุณครูอย่างน้อย 1 ครั้ง',
    isUnlocked: false
  },
  {
    id: 'ev-master',
    name: 'EV Master',
    thaiTitle: 'เซียนรถยนต์ไฟฟ้า EV',
    description: 'ทำแบบทดสอบเทคโนโลยียานยนต์ไฟฟ้าได้คะแนน 8/10 ขึ้นไป',
    icon: '⚡',
    color: 'from-emerald-200 to-teal-400 border-emerald-500',
    condition: 'ได้คะแนนควิซ EV ≥ 8 ข้อ (80%)',
    isUnlocked: false
  },
  {
    id: 'quiz-champion',
    name: 'Quiz Champion',
    thaiTitle: 'ยอดนักคิดคะแนนเต็ม',
    description: 'ทำแบบทดสอบได้คะแนนเต็ม 10/10 ยอดเยี่ยมไร้ที่ติ',
    icon: '🎯',
    color: 'from-sky-200 to-blue-400 border-blue-500',
    condition: 'ทำแบบทดสอบได้ 10/10 คะแนนเต็ม',
    isUnlocked: false
  },
  {
    id: 'century-star',
    name: 'Century Star',
    thaiTitle: 'ดาวรุ่งพุ่งแรง 100+',
    description: 'สะสมดาวจากกิจกรรมทั้งหมดครบ 100 ดวงขึ้นไป',
    icon: '🏆',
    color: 'from-purple-200 to-indigo-400 border-purple-500',
    condition: 'มีดาวสะสมรวมครบ 100 ⭐',
    isUnlocked: false
  },
  {
    id: 'homework-legend',
    name: 'Homework Legend',
    thaiTitle: 'แชมป์กล่องการบ้าน',
    description: 'สุดยอดนักเรียนตัวอย่าง ส่งการบ้าน ทำควิซ และประเมินครบทุกเมนู',
    icon: '👑',
    color: 'from-amber-300 to-orange-400 border-orange-500',
    condition: 'ส่งการบ้าน + ทำแบบทดสอบ EV + ส่งแบบประเมินครู',
    isUnlocked: false
  }
];

export const sampleInitialAssignmentTasks: AssignmentTask[] = [
  {
    id: 'task-1',
    title: 'ใบงานที่ 1: วิเคราะห์และเปรียบเทียบระบบขับเคลื่อนรถยนต์ไฟฟ้า (EV vs ICE)',
    subject: 'วิทยาศาสตร์และเทคโนโลยี',
    description: 'ให้นักเรียนศึกษาโครงสร้างของรถยนต์ไฟฟ้า BEV, PHEV, HEV พร้อมสรุปข้อดี-ข้อจำกัด และส่วนประกอบหลัก 4 ส่วน (แบตเตอรี่, มอเตอร์, Inverter, BMS) จัดทำเป็นรายงานหรืออินโฟกราฟิก',
    targetClass: 'ทุกห้อง',
    maxScore: 10,
    dueDate: '10 ก.ย. 2569',
    createdAt: '2026-09-01 08:30',
    authorTeacher: 'คุณครูวิทยาศาสตร์',
    attachmentName: 'ใบความรู้_ยานยนต์ไฟฟ้า_GoogleDrive.pdf',
    attachmentLink: 'https://drive.google.com/file/d/1sampleEVLessonDriveLink/view?usp=sharing',
    rewardStars: 50,
  },
  {
    id: 'task-2',
    title: 'ใบงานที่ 2: ออกแบบสไลด์นำเสนอพลังงานสะอาดและสิ่งแวดล้อม',
    subject: 'พลังงานและสิ่งแวดล้อม',
    description: 'ให้นักเรียนศึกษาเทมเพลตและเอกสารประกอบการเรียนจากลิงก์ Canva / สื่อออนไลน์ แล้วออกแบบสไลด์นำเสนอพลังงานแสงอาทิตย์หรือพลังงานลม',
    targetClass: 'ม.1/1',
    maxScore: 10,
    dueDate: '15 ก.ย. 2569',
    createdAt: '2026-09-02 09:00',
    authorTeacher: 'คุณครูสมศรี วิชาการ',
    attachmentName: 'เทมเพลตสไลด์_Canva_พลังงานสะอาด',
    attachmentLink: 'https://www.canva.com/design/sample-clean-energy-slides',
    rewardStars: 60,
  }
];

export const sampleInitialHomeworks: Homework[] = [
  {
    id: 'hw-1',
    taskId: 'task-1',
    title: 'รายงานการวิเคราะห์เซลล์แบตเตอรี่ LFP และมอเตอร์ขับเคลื่อนในรถ EV',
    subject: 'วิทยาศาสตร์และเทคโนโลยี',
    description: 'สรุปโครงสร้างของแบตเตอรี่ Blade Battery ชนิด LFP เปรียบเทียบกับ NMC พร้อมหลักการทำงานของมอเตอร์ PMSM',
    link: 'https://drive.google.com/drive/folders/sample-ev-report',
    attachedFileName: 'EV_Battery_Report.pdf',
    submittedAt: '2026-09-01 14:30',
    updatedAt: '2026-09-01 14:30',
    studentId: 'std-01',
    studentName: 'เด็กชายสมชาย สายวิทย์',
    studentClass: 'ห้อง 1',
    studentAvatar: 'student-boy-glasses',
    status: 'reviewed',
    teacherScore: 10,
    maxScore: 10,
    teacherComment: 'ยอดเยี่ยมมาก มีการเปรียบเทียบตารางความปลอดภัยและค่า C-rate ได้ชัดเจน!',
    earnedStars: 50
  }
];

export const sampleReflectionTopics = [
  {
    id: 'topic-1',
    title: 'ชวนคุยและสะท้อนคิด: คาบเรียนการทดลองและเทคโนโลยีสัปดาห์นี้',
    promptQuestion: 'นักเรียนคิดเห็นอย่างไรกับกิจกรรมการทดลองในคาบเรียนสัปดาห์นี้? ชอบช่วงไหนมากที่สุด และมีเรื่องไหนที่อยากให้คุณครูอธิบายเพิ่มเติมหรือปรับปรุงในคาบต่อไปไหมจ๊ะ?',
    targetClass: 'ทุกห้อง',
    authorTeacher: 'คุณครูนิภาภรณ์ ใจดี',
    teacherAvatar: 'teacher-female-glasses',
    createdAt: '2026-09-01 08:30',
    pinned: true,
  },
  {
    id: 'topic-2',
    title: 'สำรวจความเข้าใจ: เทคโนโลยียานยนต์ไฟฟ้า (EV) และระบบขับเคลื่อน',
    promptQuestion: 'หลังจากได้ลองทำแบบทดสอบเรื่อง EV ไปแล้ว นักเรียนรู้สึกว่าเรื่องใดท้าทายที่สุด? อยากให้จัดกิจกรรมจำลองหรือมีสื่ออะไรเพิ่มเติมในห้องเรียนบ้าง?',
    targetClass: 'ห้อง 1',
    authorTeacher: 'คุณครูนิภาภรณ์ ใจดี',
    teacherAvatar: 'teacher-female-glasses',
    createdAt: '2026-09-03 14:00',
    pinned: false,
  },
];

export const sampleInitialEvaluations = [
  {
    id: 'eval-demo-1',
    topicId: 'topic-2',
    topicTitle: 'สำรวจความเข้าใจ: เทคโนโลยียานยนต์ไฟฟ้า (EV) และระบบขับเคลื่อน',
    studentId: 'std-02',
    studentName: 'เด็กหญิงฟ้าใส ใฝ่เรียนรู้',
    studentClass: 'ห้อง 1',
    studentNo: '05',
    studentAvatar: 'student-girl-ponytail',
    ratingStars: 5,
    improvementText: 'อยากให้มีคลิปจำลอง 3D ของการทำงานมอเตอร์ไฟฟ้าเพิ่มเติมในสไลด์ค่ะ',
    recommendationText: 'คุณครูสอนสนุกมาก มีการยกตัวอย่างรถยนต์ไฟฟ้าจริงในชีวิตประจำวันทำให้เข้าใจง่ายสุดๆ ขอบคุณค่ะครู!',
    submittedAt: '2026-09-01 16:20',
    isAnonymous: false,
    teacherReply: 'ขอบคุณสำหรับข้อเสนอแนะนะจ๊ะฟ้าใส คาบหน้าครูเตรียมวิดีโอ 3D Explosion ของมอเตอร์ PMSM มาให้ดูแน่นอนจ้ะ!',
    teacherRepliedAt: '2026-09-01 17:00'
  },
  {
    id: 'eval-demo-2',
    topicId: 'topic-1',
    topicTitle: 'ชวนคุยและสะท้อนคิด: คาบเรียนการทดลองและเทคโนโลยีสัปดาห์นี้',
    studentId: 'std-03',
    studentName: 'เด็กชายธนภัทร กล้าหาญ',
    studentClass: 'ห้อง 1',
    studentNo: '08',
    studentAvatar: 'student-boy-cap',
    ratingStars: 4,
    improvementText: 'อยากให้เพิ่มเวลาช่วงทดลองรอกและคานในห้องปฏิบัติการอีกนิดครับ สนุกมากแต่ทำไม่ทัน',
    recommendationText: 'เกมตอบคำถามท้ายคาบสนุกมาก ได้แข่งเก็บดาวกับเพื่อนๆ ในห้อง ชอบกิจกรรมแบบนี้ครับครู',
    submittedAt: '2026-09-02 08:45',
    isAnonymous: false
  },
  {
    id: 'eval-demo-3',
    topicId: 'topic-1',
    topicTitle: 'ชวนคุยและสะท้อนคิด: คาบเรียนการทดลองและเทคโนโลยีสัปดาห์นี้',
    studentId: 'std-01',
    studentName: 'เด็กชายสมชาย สายวิทย์',
    studentClass: 'ห้อง 1',
    studentNo: '12',
    studentAvatar: 'student-boy-glasses',
    ratingStars: 5,
    improvementText: 'ไม่มีครับ ทุกอย่างลงตัวดีมาก ขอให้คงเกมและควิซเก็บดาวแบบนี้ไว้ตลอดเทอมครับ',
    recommendationText: 'ครูอธิบายสูตรโมเมนต์และการคิดแรงเสียดทานเข้าใจง่ายมากครับ จากเดิมที่งงตอนนี้ทำข้อสอบได้คล่องแล้ว!',
    submittedAt: '2026-09-02 10:30',
    isAnonymous: false
  },
  {
    id: 'eval-demo-4',
    topicId: 'topic-1',
    topicTitle: 'ชวนคุยและสะท้อนคิด: คาบเรียนการทดลองและเทคโนโลยีสัปดาห์นี้',
    studentId: 'std-04',
    studentName: 'เด็กหญิงพิมพ์ชนก ดวงแก้ว',
    studentClass: 'ห้อง 2',
    studentNo: '15',
    studentAvatar: 'student-kid-artist',
    ratingStars: 5,
    improvementText: 'อยากให้แจกสรุปสูตรฟิสิกส์แผ่นพับหรือไฟล์ PDF สรุปตอนท้ายบทเรียนค่ะ',
    recommendationText: 'ชอบสไตล์การสอนของคุณครูมากๆ ค่ะ เป็นกันเองและใจดี อธิบายจนทุกคนในกลุ่มเข้าใจ',
    submittedAt: '2026-09-02 11:15',
    isAnonymous: false
  }
];

export const sampleStudentExamScores = [
  {
    id: 'exam-01',
    studentId: 'std-01',
    studentName: 'เด็กชายสมชาย สายวิทย์',
    studentClass: 'ห้อง 1',
    studentNo: '12',
    studentAvatar: 'student-boy-glasses',
    lessonId: 'ev-technology',
    lessonTitle: 'วิทยาศาสตร์และเทคโนโลยีรถยนต์ไฟฟ้า (EV)',
    score: 10,
    maxScore: 10,
    submittedAt: '2026-09-01 15:45'
  },
  {
    id: 'exam-03',
    studentId: 'std-02',
    studentName: 'เด็กหญิงฟ้าใส ใฝ่เรียนรู้',
    studentClass: 'ห้อง 1',
    studentNo: '05',
    studentAvatar: 'student-girl-ponytail',
    lessonId: 'ev-technology',
    lessonTitle: 'วิทยาศาสตร์และเทคโนโลยีรถยนต์ไฟฟ้า (EV)',
    score: 10,
    maxScore: 10,
    submittedAt: '2026-09-01 16:10'
  },
  {
    id: 'exam-05',
    studentId: 'std-03',
    studentName: 'เด็กชายธนภัทร กล้าหาญ',
    studentClass: 'ห้อง 1',
    studentNo: '08',
    studentAvatar: 'student-boy-cap',
    lessonId: 'ev-technology',
    lessonTitle: 'วิทยาศาสตร์และเทคโนโลยีรถยนต์ไฟฟ้า (EV)',
    score: 8,
    maxScore: 10,
    submittedAt: '2026-09-01 17:20'
  },
  {
    id: 'exam-06',
    studentId: 'std-04',
    studentName: 'เด็กหญิงพิมพ์ชนก ดวงแก้ว',
    studentClass: 'ห้อง 2',
    studentNo: '15',
    studentAvatar: 'student-kid-artist',
    lessonId: 'ev-technology',
    lessonTitle: 'วิทยาศาสตร์และเทคโนโลยีรถยนต์ไฟฟ้า (EV)',
    score: 9,
    maxScore: 10,
    submittedAt: '2026-09-02 11:00'
  },
  {
    id: 'exam-07',
    studentId: 'std-05',
    studentName: 'เด็กชายภูริช พัฒนศิลป์',
    studentClass: 'ห้อง 1',
    studentNo: '18',
    studentAvatar: 'student-dino-doodle',
    lessonId: 'ev-technology',
    lessonTitle: 'วิทยาศาสตร์และเทคโนโลยีรถยนต์ไฟฟ้า (EV)',
    score: 7,
    maxScore: 10,
    submittedAt: '2026-09-02 11:45'
  }
];

export const sampleStudentRecords = [
  {
    id: 'std-01',
    name: 'เด็กชายสมชาย สายวิทย์',
    studentIdCode: 'STD-30112',
    classRoom: 'ห้อง 1',
    studentNo: '12',
    avatar: 'student-boy-glasses',
    totalStars: 190,
    unlockedStickers: ['first-step', 'ev-master', 'quiz-champion'],
    awardedBadges: [
      {
        id: 'ab-1',
        stickerId: 'first-step',
        stickerName: 'First Step',
        thaiTitle: 'ผู้เริ่มต้นไฟแรง',
        icon: '🌟',
        awardedBy: 'คุณครูนิภาภรณ์',
        awardedAt: '2026-09-01',
        starsAdded: 50,
        note: 'ส่งการบ้านคนแรกของห้องและทำสรุปได้ละเอียดมาก!'
      }
    ],
    homeworkCount: 1,
    quizScores: {
      'ev-technology': 10
    }
  },
  {
    id: 'std-02',
    name: 'เด็กหญิงฟ้าใส ใฝ่เรียนรู้',
    studentIdCode: 'STD-30105',
    classRoom: 'ห้อง 1',
    studentNo: '05',
    avatar: 'student-girl-ponytail',
    totalStars: 170,
    unlockedStickers: ['first-step', 'ev-master', 'super-critic'],
    awardedBadges: [
      {
        id: 'ab-2',
        stickerId: 'super-critic',
        stickerName: 'Super Critic',
        thaiTitle: 'นักประเมินยอดเยี่ยม',
        icon: '💖',
        awardedBy: 'คุณครูนิภาภรณ์',
        awardedAt: '2026-09-01',
        starsAdded: 30,
        note: 'ให้ข้อเสนอแนะการสอนที่เป็นประโยชน์และสร้างสรรค์มาก'
      }
    ],
    homeworkCount: 1,
    quizScores: {
      'ev-technology': 10
    }
  },
  {
    id: 'std-03',
    name: 'เด็กชายธนภัทร กล้าหาญ',
    studentIdCode: 'STD-30108',
    classRoom: 'ห้อง 1',
    studentNo: '08',
    avatar: 'student-boy-cap',
    totalStars: 120,
    unlockedStickers: ['first-step', 'ev-master'],
    awardedBadges: [],
    homeworkCount: 1,
    quizScores: {
      'ev-technology': 8
    }
  },
  {
    id: 'std-04',
    name: 'เด็กหญิงพิมพ์ชนก ดวงแก้ว',
    studentIdCode: 'STD-30215',
    classRoom: 'ห้อง 2',
    studentNo: '15',
    avatar: 'student-kid-artist',
    totalStars: 140,
    unlockedStickers: ['first-step', 'ev-master'],
    awardedBadges: [],
    homeworkCount: 1,
    quizScores: {
      'ev-technology': 9
    }
  },
  {
    id: 'std-05',
    name: 'เด็กชายภูริช พัฒนศิลป์',
    studentIdCode: 'STD-30118',
    classRoom: 'ห้อง 1',
    studentNo: '18',
    avatar: 'student-dino-doodle',
    totalStars: 90,
    unlockedStickers: ['first-step'],
    awardedBadges: [],
    homeworkCount: 0,
    quizScores: {
      'ev-technology': 7
    }
  },
  {
    id: 'std-6711502234',
    name: 'นักเรียน 6711502234',
    studentIdCode: '6711502234',
    classRoom: 'ห้อง 1',
    studentNo: '01',
    avatar: 'student-boy-glasses',
    totalStars: 150,
    unlockedStickers: ['first-step', 'ev-master', 'quiz-champion'],
    awardedBadges: [],
    homeworkCount: 1,
    quizScores: {
      'ev-technology': 10
    }
  }
];

