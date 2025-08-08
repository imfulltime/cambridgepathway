export interface User {
  id: string;
  email: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
}

export interface Student extends User {
  role: 'student';
  parentId?: string;
  gradeLevel: string;
  subjects: string[];
}

export interface Parent extends User {
  role: 'parent';
  students: string[]; // Array of student IDs
}

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: 'math' | 'english';
  level: string; // e.g., 'IGCSE'
  imageUrl: string;
  totalLessons: number;
  duration: string; // e.g., '10 weeks'
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  worksheetUrl?: string;
  order: number;
  duration: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  score?: number;
  timeSpent: number; // in minutes
  lastAccessed: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  passingScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Answer[];
  score: number;
  totalPoints: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  timeSpent: number;
}

export interface Answer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
}

export interface ForumPost {
  id: string;
  userId: string;
  courseId: string;
  lessonId?: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  replies: ForumReply[];
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface ForumReply {
  id: string;
  postId: string;
  userId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface DashboardStats {
  totalCourses: number;
  completedLessons: number;
  totalLessons: number;
  averageScore: number;
  timeSpent: number;
  streak: number;
  upcomingAssessments: Quiz[];
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}
