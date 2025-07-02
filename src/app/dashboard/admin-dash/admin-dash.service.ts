import { Injectable, signal } from '@angular/core';
import { Course } from '../../core/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminDashService {
  cancelUpdateCourseModel = false;
  cancelUpdateUserModel = false;

  onCancelUpdateCourseModel() {
    this.cancelUpdateCourseModel = !this.cancelUpdateCourseModel;
  }

  onCancelUpdateUserModel() {
    this.cancelUpdateUserModel = !this.cancelUpdateUserModel;
  }

  newCourse = signal<Course>({
    name: '',
    teacher: '',
    schedule: '',
    sessions: [],
    enrolledStudents: [],
  });
}
