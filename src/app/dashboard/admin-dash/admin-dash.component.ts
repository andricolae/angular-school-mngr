import { UserModel } from './../../core/user.model';
import * as CourseActions from '../../state/courses/course.actions';
import * as UserActions from '../../state/users/user.actions';
import { Store } from '@ngrx/store';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  selectAllCourses,
  selectCoursesCount,
} from '../../state/courses/course.selector';
import { SpinnerComponent } from '../../core/spinner/spinner.component';
import { SpinnerService } from '../../core/services/spinner.service';
import {
  selectAllTeachers,
  selectAllUsers,
  selectStudentsCount,
} from '../../state/users/user.selector';

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

  teachers$ = this.store.select(selectAllTeachers);
  courses$ = this.store.select(selectCoursesCount);
  students$ = this.store.select(selectStudentsCount);

  constructor(private store: Store, private spinner: SpinnerService) {}

  ngOnInit(): void {
    this.spinner.show();
    this.store.dispatch(CourseActions.loadCoursesCount());
    this.store.dispatch(UserActions.loadTeachers());
    this.store.dispatch(UserActions.loadStudentsCount());

    this.courses$.subscribe((courses) => {
      this.courseCount = courses;
    });
    this.students$.subscribe((students) => {
      this.studentCount = students;
    });
    this.teachers$.subscribe((teachers) => {
      this.teacherCount = teachers.length;
    });

    setTimeout(() => {
      this.spinner.hide();
    }, 300);
  }
}
