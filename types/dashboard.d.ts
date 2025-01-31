import { Course, CourseChapter, CourseLesson, CourseProgress } from './course';

export interface EnrolledCourse extends Course {
  lastStudiedLessonId?: string | null;
  chapters: (CourseChapter & {
    lessons: (CourseLesson & {
      progress: CourseProgress[];
    })[];
  })[];
}

export interface DashboardCourse extends Course {
  chapters: CourseChapter[];
  lastStudiedLessonId?: string | null;
} 