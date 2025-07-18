import { createAction, props } from '@ngrx/store';
import { Course } from '../../core/user.model';

export const loadCourses = createAction('[Courses] Load Courses');

export const loadCoursesSuccess = createAction(
    '[Courses] Load Courses Success',
    props<{ courses: Course[] }>()
);

export const loadCoursesFail = createAction(
    '[Courses] Load Courses Fail',
    props<{ error: string }>()
);

export const addCourse = createAction(
    '[Courses] Add Course',
    props<{ course: Omit<Course, 'id'> }>()
);

export const addCourseSuccess = createAction(
    '[Courses] Add Course Success',
    props<{ course: Course }>()
);

export const addCourseFail = createAction(
    '[Courses] Add Course Fail',
    props<{ error: string }>()
);

export const deleteCourse = createAction(
    '[Courses] Delete Course',
    props<{ courseId: string }>()
);

export const deleteCourseSuccess = createAction(
    '[Courses] Delete Course Success',
    props<{ courseId: string }>()
);

export const deleteCourseFail = createAction(
    '[Courses] Delete Course Fail',
    props<{ error: string }>()
);

export const updateCourse = createAction(
  '[Courses] Update Course',
  props<{ course: Course }>()
);

export const updateCourseSuccess = createAction(
  '[Courses] Update Course Success',
  props<{ course: Course }>()
);

export const updateCourseFail = createAction(
  '[Courses] Update Course Fail',
  props<{ error: string }>()
);

export const enrollStudent = createAction(
  '[Courses] Enroll Student',
  props<{ courseId: string, studentId: string }>()
);

export const enrollStudentSuccess = createAction(
  '[Courses] Enroll Student Success',
  props<{ courseId: string, studentId: string }>()
);

export const enrollStudentFail = createAction(
  '[Courses] Enroll Student Fail',
  props<{ error: string }>()
);

export const unenrollStudent = createAction(
  '[Courses] Unenroll Student',
  props<{ courseId: string, studentId: string }>()
);

export const unenrollStudentSuccess = createAction(
  '[Courses] Unenroll Student Success',
  props<{ courseId: string, studentId: string }>()
);

export const unenrollStudentFail = createAction(
  '[Courses] Unenroll Student Fail',
  props<{ error: string }>()
);

export const addStudentGrade = createAction(
  '[Courses] Add Student Grade',
  props<{
    courseId: string;
    studentId: string;
    grade: {
      title: string;
      value: number;
      date: string;
    }
  }>()
);

export const addStudentGradeSuccess = createAction(
  '[Courses] Add Student Grade Success',
  props<{
    courseId: string;
    studentId: string;
    grade: {
      id: string;
      title: string;
      value: number;
      date: string;
    }
  }>()
);

export const addStudentGradeFail = createAction(
  '[Courses] Add Student Grade Fail',
  props<{ error: string }>()
);

export const updateStudentAttendance = createAction(
  '[Courses] Update Student Attendance',
  props<{
    courseId: string;
    studentId: string;
    sessionId: string;
    present: boolean;
  }>()
);

export const updateStudentAttendanceSuccess = createAction(
  '[Courses] Update Student Attendance Success',
  props<{
    courseId: string;
    studentId: string;
    sessionId: string;
    present: boolean;
  }>()
);

export const updateStudentAttendanceFail = createAction(
  '[Courses] Update Student Attendance Fail',
  props<{ error: string }>()
);

export const markCourseForScheduling = createAction(
  '[Course] Mark Course For Scheduling',
  props<{ courseId: string }>()
);

export const markCourseForSchedulingSuccess = createAction(
  '[Course] Mark Course For Scheduling Success',
  props<{ courseId: string }>()
);

export const markCourseForSchedulingFailure = createAction(
  '[Course] Mark Course For Scheduling Failure',
  props<{ error: any }>()
);

export const checkScheduleStatus = createAction(
  '[Courses] Check Schedule Status',
  props<{ courseId: string }>()
);

export const checkScheduleStatusSuccess = createAction(
  '[Courses] Check Schedule Status Success',
  props<{ courseId: string, isScheduled: boolean }>()
);

export const checkScheduleStatusFail = createAction(
  '[Courses] Check Schedule Status Fail',
  props<{ error: string }>()
);

export const removePendingStudent = createAction(
  '[Course] Remove Pending Student',
  props<{ courseId: string, studentId: string }>()
);

export const removePendingStudentSuccess = createAction(
  '[Course] Remove Pending Student Success',
  props<{ courseId: string, studentId: string }>()
);

export const removePendingStudentFailure = createAction(
  '[Course] Remove Pending Student Failure',
  props<{ error: any }>()
);

export const acceptPendingStudent = createAction(
  '[Course] Accept Pending Student',
  props<{ courseId: string, studentId: string }>()
);

export const acceptPendingStudentSuccess = createAction(
  '[Course] Accept Pending Student Success',
  props<{ courseId: string, studentId: string }>()
);

export const acceptPendingStudentFailure = createAction(
  '[Course] Accept Pending Student Failure',
  props<{ error: any }>()
);