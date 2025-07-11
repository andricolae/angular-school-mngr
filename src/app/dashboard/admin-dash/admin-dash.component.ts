import { Course, CourseSession, UserModel } from './../../core/user.model';
import * as CourseActions from '../../state/courses/course.actions';
import * as UserActions from '../../state/users/user.actions';
import { Store } from '@ngrx/store';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { selectAllCourses } from '../../state/courses/course.selector';
import { AsyncPipe } from '@angular/common';
import { SpinnerComponent } from '../../core/spinner/spinner.component';
import { SpinnerService } from '../../core/services/spinner.service';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { selectAllUsers } from '../../state/users/user.selector';
import { v4 as uuidv4 } from 'uuid';
import { StudentDataComponent } from './student-data/student-data.component';
import { SessionDataComponent } from './session-data/session-data.component';
import { AdminDialogComponent } from './admin-dialog/admin-dialog.component';
import { CourseUserAddUpdateDataComponent } from './course-user-add-update-data/course-user-add-update-data.component';
import { AdminDashService } from './admin-dash.service';

@Component({
  selector: 'app-admin-dash',
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    SpinnerComponent,
    ConfirmationDialogComponent,
    StudentDataComponent,
    SessionDataComponent,
    AdminDialogComponent,
    CourseUserAddUpdateDataComponent,
  ],
  templateUrl: './admin-dash.component.html',
})
export class AdminDashComponent {
  @ViewChild('dialog') dialog!: ConfirmationDialogComponent;
  AdminDashService = inject(AdminDashService);

  courseCount = 0;
  studentCount = 0;
  teacherCount = 0;

  newUser: UserModel = { fullName: '', role: '', email: '' };
  editingUserId: string | null = null;
  users$ = this.store.select(selectAllUsers);

  teachers: UserModel[] = [];

  courses$ = this.store.select(selectAllCourses);
  editingCourseId: string | null = null;
  selectedCourseId: string | undefined = '';
  showUpdateAddCourseData: {
    show: boolean;
    id: string;
    category: 'course' | 'user' | '';
    action: 'add' | 'update' | '';
  } = {
    show: false,
    id: '',
    category: '',
    action: '',
  };
  showStudentData = false;
  showSessionData = false;

  activeTab: 'grades' | 'attendance' = 'grades';

  showSessionModal = false;
  editingSession: CourseSession = {
    id: '',
    date: new Date(),
    startTime: '',
    endTime: '',
  };
  editingSessionIndex: number = -1;

  constructor(private store: Store, private spinner: SpinnerService) {}

  ngOnInit(): void {
    this.spinner.show();
    this.store.dispatch(CourseActions.loadCourses());
    this.store.dispatch(UserActions.loadUsers());
    this.courses$.subscribe((courses) => {
      this.courseCount = courses.length;
    });
    this.users$.subscribe((users) => {
      this.teachers = users.filter((user) => user.role === 'Teacher');
      this.teacherCount = this.teachers.length;
      this.studentCount = users.filter(
        (user) => user.role === 'Student'
      ).length;
    });
    setTimeout(() => {
      this.spinner.hide();
    }, 300);
  }

  //-------------------------- SESSION RELATED METHODS/FUNCTIONS  ----------------

  editCourse(course: Course) {
    this.AdminDashService.newCourse.set({ ...course });
    this.editingCourseId = course.id!;

    if (
      !this.AdminDashService.newCourse().teacherId &&
      this.AdminDashService.newCourse().teacher
    ) {
      const foundTeacher = this.teachers.find(
        (t) => t.fullName === this.AdminDashService.newCourse().teacher
      );
      if (foundTeacher) {
        this.AdminDashService.newCourse().teacherId = foundTeacher.id;
      }
    }
  }

  // THIS STAYS HERE
  async deleteCourse(courseId: string): Promise<void> {
    const confirmed = await this.dialog.open(
      'Do you really want to delete this course?'
    );
    if (confirmed) {
      this.store.dispatch(CourseActions.deleteCourse({ courseId }));
    }
  }

  //-------------------------- VIEW/CLOSE STUDENT & SESSION  DATA----------------

  // make a reusible one at some point
  viewStudentData(course: Course): void {
    this.selectedCourseId = course.id || undefined;
    this.showStudentData = true;
  }

  closeStudentData(): void {
    this.selectedCourseId = undefined;
    this.showStudentData = false;
  }

  viewSessionData(course: Course): void {
    this.selectedCourseId = course.id || undefined;
    this.showSessionData = true;
  }

  closeSessionData(): void {
    this.selectedCourseId = undefined;
    this.showSessionData = false;
  }

  // showUpdateAddCourseData

  viewCourseAddUpdateDialog(
    category: 'course' | 'user',
    action: 'add' | 'update',
    courseDetails?: Course
  ): void {
    if (courseDetails) {
      this.editCourse(courseDetails);
    }

    this.showUpdateAddCourseData.show = true;
    this.showUpdateAddCourseData.category = category;
    this.showUpdateAddCourseData.action = action;
  }

  closeCourseAddUpdateDialog(): void {
    this.resetCourseForm();
    this.selectedCourseId = undefined;
    this.showUpdateAddCourseData.show = false;
    this.showUpdateAddCourseData.category = '';
    this.showUpdateAddCourseData.action = '';
  }

  viewUserAddUpdateDialog(
    category: 'course' | 'user',
    action: 'add' | 'update',
    userDetails?: UserModel
  ): void {
    if (userDetails) {
      this.editUser(userDetails);
    }

    this.showUpdateAddCourseData.show = true;
    this.showUpdateAddCourseData.category = category;
    this.showUpdateAddCourseData.action = action;
  }

  closeUserAddUpdateDialog(): void {
    this.resetUserForm();
    this.editingUserId = null;
    this.showUpdateAddCourseData.show = false;
    this.showUpdateAddCourseData.category = '';
    this.showUpdateAddCourseData.action = '';
  }

  //-------------------------- USER RELATED METHODS/FUNCTIONS----------------
  // DELETE STAYS HERE
  async deleteUser(userId: string): Promise<void> {
    const confirmed = await this.dialog.open(
      'Do you really want to delete this user?'
    );
    if (confirmed) {
      this.store.dispatch(UserActions.deleteUser({ userId }));
    }
  }

  editUser(user: UserModel) {
    this.newUser = {
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
    this.editingUserId = user.id!;
  }

  updateUser() {
    this.store.dispatch(
      UserActions.updateUser({
        user: { ...this.newUser, id: this.editingUserId! },
      })
    );
    this.resetUserForm();
  }

  //-------------------------- RESET FORM + CANCEL FORM UPDATE + FORM DATE, TIME----------------
  resetCourseForm(): void {
    this.AdminDashService.newCourse.set({
      name: '',
      teacher: '',
      schedule: '',
      teacherId: '',
      sessions: [],
      enrolledStudents: [],
    });
    this.editingCourseId = null;
  }

  resetUserForm(): void {
    this.newUser = { email: '', fullName: '', role: '' };
    this.editingUserId = null;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(time: string): string {
    return time;
  }

  //-------------------------- COURSE SCHEDULE----------------
  async scheduleCourse(courseId: string): Promise<void> {
    const confirmed = await this.dialog.open(
      'Do you want to send this course for scheduling?'
    );
    if (confirmed) {
      this.spinner.show();
      this.store.dispatch(CourseActions.markCourseForScheduling({ courseId }));
    }
  }

  isCourseSchedulePending(course: Course): boolean {
    return !!course.pendingSchedule;
  }
}
