import { Injectable, signal } from '@angular/core';
import { Course } from '../../core/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminDashService {
  newCourse = signal<Course>({
    name: '',
    teacher: '',
    schedule: '',
    sessions: [],
    enrolledStudents: [],
  });
  cancelUpdateCourseModel = false;
  cancelUpdateUserModel = false;
  inputFieldsEmpty = false;

  onCancelUpdateCourseModel() {
    this.cancelUpdateCourseModel = !this.cancelUpdateCourseModel;
  }

  onCancelUpdateUserModel() {
    this.cancelUpdateUserModel = !this.cancelUpdateUserModel;
  }

  onCheckIfEmpty() {
    if (
      this.newCourse().name !== '' ||
      this.newCourse().teacher !== '' ||
      this.newCourse().schedule !== '' ||
      this.newCourse().sessions?.length !== 0
    ) {
      this.inputFieldsEmpty = false;
    } else {
      this.inputFieldsEmpty = true;
    }
  }
}
