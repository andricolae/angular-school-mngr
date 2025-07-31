import { Component, Input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { Course } from '../../../../core/user.model';
import { SpinnerService } from '../../../../core/services/spinner.service';
import * as CourseSelectors from '../../../../state/courses/course.selector';
import { SpinnerComponent } from '../../../../core/spinner/spinner.component';

@Component({
  selector: 'app-session-data',
  imports: [AsyncPipe, SpinnerComponent],
  templateUrl: './session-data.component.html',
  styleUrl: './session-data.component.css',
})
export class SessionDataComponent {
  @Input() courseId!: string;

  course$: Observable<Course | undefined>;

  constructor(private store: Store, private spinner: SpinnerService) {
    this.course$ = this.store.select(CourseSelectors.selectCourseById(''));
  }

  ngOnInit(): void {
    this.spinner.show();
    this.course$ = this.store.select(
      CourseSelectors.selectCourseById(this.courseId)
    );
    setTimeout(() => {
      this.spinner.hide();
    }, 500);
  }

  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
