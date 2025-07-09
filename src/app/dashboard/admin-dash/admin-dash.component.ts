import { UserModel } from './../../core/user.model';
import * as CourseActions from '../../state/courses/course.actions';
import * as UserActions from '../../state/users/user.actions';
import { Store } from '@ngrx/store';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { selectAllCourses } from '../../state/courses/course.selector';
import { SpinnerComponent } from '../../core/spinner/spinner.component';
import { SpinnerService } from '../../core/services/spinner.service';
import { selectAllUsers } from '../../state/users/user.selector';

import { AdminDashService } from './admin-dash.service';
import { UserManagementComponent } from './user-management/user-management.component';
import { CourseManagementComponent } from './course-management/course-management.component';

@Component({
  selector: 'app-admin-dash',
  standalone: true,
  imports: [
    FormsModule,
    SpinnerComponent,
    UserManagementComponent,
    CourseManagementComponent,
  ],
  templateUrl: './admin-dash.component.html',
})
export class AdminDashComponent {
  AdminDashService = inject(AdminDashService);

  courseCount = 0;
  studentCount = 0;
  teacherCount = 0;

  newUser: UserModel = { fullName: '', role: '', email: '' };
  users$ = this.store.select(selectAllUsers);

  teachers: UserModel[] = [];

  courses$ = this.store.select(selectAllCourses);

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
}
