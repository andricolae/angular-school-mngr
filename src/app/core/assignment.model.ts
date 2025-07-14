export interface Assignment {
  id?: string;
  title: string;
  description: string;
  deadline: Date;
  course_id: string;
  file?: string;
}