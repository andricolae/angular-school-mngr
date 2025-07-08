import {
  Component,
  ElementRef,
  inject,
  Input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
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
  imports: [FormsModule, SpinnerComponent, SessionActionsComponent, NgClass],
  templateUrl: './course-user-add-update-data.component.html',
  styleUrl: './course-user-add-update-data.component.css',
})
export class CourseUserAddUpdateDataComponent {
  @ViewChild('dialog') dialog!: ConfirmationDialogComponent;
  @ViewChild('form') formRef!: ElementRef<HTMLFormElement>;
  @ViewChild('session') sessionRef!: ElementRef<HTMLFormElement>;

  AdminDashService = inject(AdminDashService);

  @Input({ required: true }) category!: 'course' | 'user' | '';
  @Input({ required: true }) action!: 'add' | 'update' | '';
  @Input() editingCourseId?: string | null;
  @Input() editingUserId?: string | null;
  @Input() teachers?: UserModel[];
  @Input() newUser?: UserModel;

  constructor(private store: Store) {}

  formRowsClass = signal('sm:grid-rows-8');
  sessionRowsClass = signal('sm:row-span-6');

  ngAfterViewInit(): void {
    const formEl = this.formRef.nativeElement;
    const sessionEl = this.sessionRef.nativeElement;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        if (height < 453) {
          this.formRowsClass.set('sm:grid-rows-4');
          this.sessionRowsClass.set('sm:row-span-2');
        } else {
          this.formRowsClass.set('sm:grid-rows-8');
          this.sessionRowsClass.set('sm:row-span-6');
        }
      }
    });

    observer.observe(formEl);
  }

  // -------------------------------------------------------
  confirmationAddUpdateMessage = false;
  allCourseInputNotEmpty = true;

  // used for closing the entire dialog (in add course) if all the input fiels and session are empty
  cancelingClickFunction = output<void>();
  async onCancelClick(): Promise<void> {
    this.AdminDashService.cancelUpdateCourseModel = false;
    this.AdminDashService.cancelUpdateUserModel = false;
    this.cancelingClickFunction.emit();
  }

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

    //if update close the dialog, if add just reset form and keep dialog open
    this.action === 'update' ? this.onCancelClick() : this.resetCourseForm();
    this.confirmationAddUpdateMessage = false;
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

  onAddUpdateShowConfirmationMessage() {
    if (this.category === 'course') {
      this.onCheckAllInputsNotEmpty();
      if (!this.allCourseInputNotEmpty) {
        return;
      }
      this.confirmationAddUpdateMessage = !this.confirmationAddUpdateMessage;
    } else {
      this.confirmationAddUpdateMessage = !this.confirmationAddUpdateMessage;
    }
  }

  onCheckAllInputsNotEmpty() {
    this.allCourseInputNotEmpty =
      this.AdminDashService.newCourse().name !== '' &&
      this.AdminDashService.newCourse().teacherId !== '' &&
      this.AdminDashService.newCourse().schedule !== '';
  }

  onCancelUpdateCourseModel() {
    if (this.action === 'add') {
      this.AdminDashService.onCheckIfEmpty();
      //all fields empty close dialog
      if (this.AdminDashService.inputFieldsEmpty) {
        console.log(
          'here teacher id' + this.AdminDashService.newCourse().teacherId
        );
        this.AdminDashService.inputFieldsEmpty = false;
        this.AdminDashService.cancelUpdateCourseModel = false;

        this.onCancelClick();
        return;
      } else {
        //else show confirmation message
        this.AdminDashService.cancelUpdateCourseModel =
          !this.AdminDashService.cancelUpdateCourseModel;
        return;
      }
    }
    // show confirmation message
    this.AdminDashService.cancelUpdateCourseModel =
      !this.AdminDashService.cancelUpdateCourseModel;
  }

  onCancelUpdateUserModel() {
    this.AdminDashService.cancelUpdateUserModel =
      !this.AdminDashService.cancelUpdateUserModel;
  }
}
