import { Component, inject, Input, output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Course, UserModel } from '../../../core/user.model';
import * as CourseActions from '../../../state/courses/course.actions';
import * as UserActions from '../../../state/users/user.actions';

import { ConfirmationDialogComponent } from '../../../core/confirmation-dialog/confirmation-dialog.component';
import { SpinnerComponent } from '../../../core/spinner/spinner.component';
import { SessionActionsComponent } from '../session-actions/session-actions.component';
import { AdminDashService } from '../admin-dash.service';

@Component({
  selector: 'app-course-user-add-update-data',
  imports: [FormsModule, SpinnerComponent, SessionActionsComponent],
  templateUrl: './course-user-add-update-data.component.html',
  styleUrl: './course-user-add-update-data.component.css',
})
export class CourseUserAddUpdateDataComponent {
  @ViewChild('dialog') dialog!: ConfirmationDialogComponent;
  AdminDashService = inject(AdminDashService);

  @Input({ required: true }) category!: 'course' | 'user' | '';
  @Input({ required: true }) action!: 'add' | 'update' | '';
  @Input() editingCourseId?: string | null;
  @Input() editingUserId?: string | null;
  @Input() teachers?: UserModel[];
  @Input() newUser?: UserModel;

  // used for closing the entire dialog (in add course) if all the input fiels and session are empty
  cancelingClickFunction = output<void>();
  async onCancelClick(): Promise<void> {
    this.AdminDashService.cancelUpdateCourseModel = false;
    this.AdminDashService.cancelUpdateUserModel = false;
    this.cancelingClickFunction.emit();
  }

  constructor(private store: Store) {}

  //-------------------------- SESSION RELATED METHODS/FUNCTIONS  ----------------

  addCourse() {
    this.AdminDashService.onCheckIfEmpty();
    if (this.AdminDashService.inputFieldsEmpty) {
      return;
    }

    if (this.editingCourseId) {
      if (this.AdminDashService.newCourse().teacherId) {
        const selectedTeacher = this.teachers?.find(
          (t) => t.id === this.AdminDashService.newCourse().teacherId
        );
        if (selectedTeacher) {
          this.AdminDashService.newCourse().teacher = selectedTeacher.fullName;
        }
      }

      this.store.dispatch(
        CourseActions.updateCourse({
          course: {
            ...this.AdminDashService.newCourse(),
            id: this.editingCourseId,
          },
        })
      );
    } else {
      if (this.AdminDashService.newCourse().teacherId) {
        const selectedTeacher = this.teachers?.find(
          (t) => t.id === this.AdminDashService.newCourse().teacherId
        );
        if (selectedTeacher) {
          this.AdminDashService.newCourse().teacher = selectedTeacher.fullName;
        }
      }

      const courseToAdd: Course = {
        ...this.AdminDashService.newCourse(),
        sessions: this.AdminDashService.newCourse().sessions || [],
        enrolledStudents: [],
      };
      this.store.dispatch(
        CourseActions.addCourse({
          course: courseToAdd,
        })
      );
    }

    this.action === 'update' ? this.onCancelClick() : this.resetCourseForm();
  }

  editCourse(course: Course) {
    this.AdminDashService.newCourse.set({ ...course });
    this.editingCourseId = course.id!;

    if (
      !this.AdminDashService.newCourse().teacherId &&
      this.AdminDashService.newCourse().teacher
    ) {
      const foundTeacher = this.teachers?.find(
        (t) => t.fullName === this.AdminDashService.newCourse().teacher
      );
      if (foundTeacher) {
        this.AdminDashService.newCourse().teacherId = foundTeacher.id;
      }
    }
  }

  //-------------------------- USER RELATED METHODS/FUNCTIONS----------------

  updateUser() {
    this.store.dispatch(
      UserActions.updateUser({
        user: { ...this.newUser!, id: this.editingUserId! },
      })
    );
    this.onCancelClick();
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

  onCancelUpdateCourseModel() {
    if (this.action === 'add') {
      this.AdminDashService.onCheckIfEmpty();
      if (this.AdminDashService.inputFieldsEmpty) {
        this.AdminDashService.inputFieldsEmpty = false;
        this.AdminDashService.cancelUpdateCourseModel = false;
        this.onCancelClick();
        return;
      } else {
        this.AdminDashService.cancelUpdateCourseModel =
          !this.AdminDashService.cancelUpdateCourseModel;
      }
    }
    this.AdminDashService.cancelUpdateCourseModel =
      !this.AdminDashService.cancelUpdateCourseModel;
  }

  onCancelUpdateUserModel() {
    this.AdminDashService.cancelUpdateUserModel =
      !this.AdminDashService.cancelUpdateUserModel;
  }
}
