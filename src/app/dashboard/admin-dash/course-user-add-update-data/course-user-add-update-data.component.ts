import { Component, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Course, UserModel } from '../../../core/user.model';
import * as CourseActions from '../../../state/courses/course.actions';
import * as UserActions from '../../../state/users/user.actions';

import { ConfirmationDialogComponent } from '../../../core/confirmation-dialog/confirmation-dialog.component';
import { SpinnerComponent } from '../../../core/spinner/spinner.component';

@Component({
  selector: 'app-course-user-add-update-data',
  imports: [FormsModule, SpinnerComponent],
  templateUrl: './course-user-add-update-data.component.html',
  styleUrl: './course-user-add-update-data.component.css',
})
export class CourseUserAddUpdateDataComponent {
  @ViewChild('dialog') dialog!: ConfirmationDialogComponent;

  @Input({ required: true }) category!: 'course' | 'user' | '';
  @Input({ required: true }) action!: 'add' | 'update' | '';
  @Input() editingCourseId?: string | null;
  @Input() editingUserId?: string | null;
  @Input() teachers?: UserModel[];
  @Input() newUser?: UserModel = { fullName: '', role: '', email: '' };

  // newUser: UserModel = { fullName: '', role: '', email: '' };
  newCourse: Course = {
    name: '',
    teacher: '',
    schedule: '',
    sessions: [],
    enrolledStudents: [],
  };

  constructor(private store: Store) {}

  //-------------------------- SESSION RELATED METHODS/FUNCTIONS  ----------------

  addCourse() {
    if (this.editingCourseId) {
      if (this.newCourse.teacherId) {
        const selectedTeacher = this.teachers?.find(
          (t) => t.id === this.newCourse.teacherId
        );
        if (selectedTeacher) {
          this.newCourse.teacher = selectedTeacher.fullName;
        }
      }

      this.store.dispatch(
        CourseActions.updateCourse({
          course: { ...this.newCourse, id: this.editingCourseId },
        })
      );
    } else {
      if (this.newCourse.teacherId) {
        const selectedTeacher = this.teachers?.find(
          (t) => t.id === this.newCourse.teacherId
        );
        if (selectedTeacher) {
          this.newCourse.teacher = selectedTeacher.fullName;
        }
      }

      const courseToAdd: Course = {
        ...this.newCourse,
        sessions: this.newCourse.sessions || [],
        enrolledStudents: [],
      };
      this.store.dispatch(
        CourseActions.addCourse({
          course: courseToAdd,
        })
      );
    }
    this.resetCourseForm();
  }

  editCourse(course: Course) {
    this.newCourse = { ...course };
    this.editingCourseId = course.id!;

    if (!this.newCourse.teacherId && this.newCourse.teacher) {
      const foundTeacher = this.teachers?.find(
        (t) => t.fullName === this.newCourse.teacher
      );
      if (foundTeacher) {
        this.newCourse.teacherId = foundTeacher.id;
      }
    }
  }

  //-------------------------- USER RELATED METHODS/FUNCTIONS----------------

  // editUser(user: UserModel) {
  //   if (user.role === 'Admin') {
  //     return;
  //   }
  //   this.newUser = {
  //     email: user.email,
  //     fullName: user.fullName,
  //     role: user.role,
  //   };
  //   this.editingUserId = user.id!;
  // }

  updateUser() {
    this.store.dispatch(
      UserActions.updateUser({
        user: { ...this.newUser!, id: this.editingUserId! },
      })
    );
    this.resetUserForm();
  }

  //-------------------------- RESET FORM + CANCEL FORM UPDATE + FORM DATE, TIME----------------
  resetCourseForm(): void {
    this.newCourse = {
      name: '',
      teacher: '',
      schedule: '',
      teacherId: '',
      sessions: [],
      enrolledStudents: [],
    };
    this.editingCourseId = null;
  }

  resetUserForm(): void {
    this.newUser = { email: '', fullName: '', role: '' };
    this.editingUserId = null;
  }

  async onCancelUpdatingClick(formName: 'course' | 'user'): Promise<void> {
    switch (formName) {
      case 'course': {
        const confirmed = await this.dialog.open(
          'Do you really want to cancel updating this course?'
        );
        if (confirmed) {
          this.resetCourseForm();
        }
        break;
      }
      case 'user': {
        const confirmed = await this.dialog.open(
          'Do you really want to cancel updating this user?'
        );
        if (confirmed) {
          this.resetUserForm();
        }
        break;
      }
    }
  }
}
