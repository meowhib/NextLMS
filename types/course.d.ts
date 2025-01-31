export interface CourseProgress {
  userId: string;
  lessonId: string;
  updatedAt: Date;
  completed: boolean;
  progressSeconds: number;
  createdAt: Date;
}

export interface CourseAttachment {
  id: string;
  lessonId: string;
  path: string;
  type: string;
}

export interface CourseLesson {
  id: string;
  chapterId: string;
  title: string;
  videoPath: string;
  index: number;
  isAttachment: boolean;
  completed: boolean;
  progress: CourseProgress[];
  attachments: CourseAttachment[];
}

export interface CourseChapter {
  id: string;
  courseId: string;
  title: string;
  index: number;
  lessons: CourseLesson[];
}

export interface CourseEnrollment {
  userId: string;
  courseId: string;
  enrolledAt: Date;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  chapters: CourseChapter[];
  enrollments: CourseEnrollment[];
}

export interface CourseWithChapters {
  id: string;
  slug: string;
  title: string;
  chapters: {
    lessons: {
      id: string;
      title: string;
      progress: {
        completed: boolean;
        updatedAt: Date;
      }[];
    }[];
  }[];
}

export interface EnrolledCourseWithChapters {
  id: string;
  slug: string;
  title: string;
  chapters: {
    lessons: {
      id: string;
      progress: CourseProgress[];
      attachments: CourseAttachment[];
    }[];
  }[];
  enrollments: CourseEnrollment[];
}

export interface CourseWithProgress extends Omit<Course, 'description'> {
  description?: string | null;
  isEnrolled: boolean;
  lastStudiedLessonId: string | null;
} 