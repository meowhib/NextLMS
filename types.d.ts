export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  progress: UserLessonProgress[];
  comments: Comment[];
  enrollments: Enrollment[];
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  chapters: Chapter[];
  latestLessonId?: string | null;
  enrollments: Enrollment[];
};

export type Chapter = {
  id: string;
  courseId: string;
  course: Course;
  index: number;
  title: string;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  chapterId: string;
  chapter: Chapter;
  index: number;
  title: string;
  videoPath: string;
  subtitles: Subtitle[];
  materials: Material[];
  attachments: Attachment[];
  comments: Comment[];
  progress: UserLessonProgress[];
};

export type UserLessonProgress = {
  id: string;
  userId: string;
  user: User;
  lessonId: string;
  lesson: Lesson;
  progressSeconds: number;
  completed: boolean;
};

export type Subtitle = {
  id: string;
  lessonId: string;
  lesson: Lesson;
  path: string;
};

export type Material = {
  id: string;
  lessonId: string;
  lesson: Lesson;
  path: string;
};

export type Attachment = {
  id: string;
  lessonId: string;
  lesson: Lesson;
  path: string;
  type: string;
};

export type Comment = {
  id: string;
  lessonId: string;
  lesson: Lesson;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
};

export type Enrollment = {
  id: string;
  userId: string;
  user: User;
  courseId: string;
  course: Course;
  enrolledAt: Date;
};
