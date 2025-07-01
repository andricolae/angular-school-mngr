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
}
