import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Course } from '../../../core/user.model';
import * as CourseSelectors from '../../../state/courses/course.selector';
import * as CourseActions from '../../../state/courses/course.actions';
import { SpinnerComponent } from '../../../core/spinner/spinner.component';
import { SpinnerService } from '../../../core/services/spinner.service';
import { CourseService } from '../../../core/services/course.service';
import { ConfirmationDialogComponent } from '../../../core/confirmation-dialog/confirmation-dialog.component';

interface AppState {
  courses: {
    courses: Course[];
    loading: boolean;
    error: string | null;
  };
}

@Component({
  selector: 'app-course-enrollment',
  imports: [CommonModule, SpinnerComponent, FormsModule, ConfirmationDialogComponent],
  templateUrl: './course-enrollment.component.html',
  styleUrl: './course-enrollment.component.css'
})
export class CourseEnrollmentComponent implements OnInit, OnDestroy {
  @Input() studentId!: string;
  @Input() enrolledCourseIds: string[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() enrollmentChanged = new EventEmitter<string[]>();
  @ViewChild('dialog') dialog!: ConfirmationDialogComponent;

  availableCourses$: Observable<Course[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  isLoading = false;

  searchTerm: string = '';
  selectedTeacher: string = '';
  teachersList: string[] = [];
  filteredCourses: Course[] = [];
  allCourses: Course[] = [];

  private coursesSubscription?: Subscription;

  enrolledCourses: string[] = []
  pendingEnrollments: string[] = [];
  selectedStatus: 'All' | 'Enrolled' | 'Pending' | 'Not Enrolled' = 'All';

  constructor(
    private store: Store<AppState>,
    private spinner: SpinnerService,
    private courseService: CourseService
  ) {
    this.availableCourses$ = this.store.select(CourseSelectors.selectAvailableCourses);
    this.loading$ = this.store.select(CourseSelectors.selectCoursesLoading);
    this.error$ = this.store.select(CourseSelectors.selectCoursesError);
  }

  ngOnInit() {
    this.store.dispatch(CourseActions.loadCourses());

    this.coursesSubscription = this.availableCourses$.subscribe(courses => {
      this.allCourses = courses;

      this.teachersList = Array.from(new Set(courses.map(course => course.teacher)))
        .filter(teacher => teacher)
        .sort();

      this.pendingEnrollments = courses
        .filter(course => course.pendingStudents && course.pendingStudents.includes(this.studentId))
        .map(course => course.id!);
      this.filterCourses();
    });
  }

  ngOnDestroy() {
    if (this.coursesSubscription) {
      this.coursesSubscription.unsubscribe();
    }
  }

  isEnrolled(courseId: string): boolean {
    return this.enrolledCourseIds.includes(courseId);
  }

  toggleEnrollment(course: Course): void {
    if (!this.studentId || !course.id) return;
    if (this.isPending(course.id)) return;

    this.dialog.open(
    this.isEnrolled(course.id) 
        ? 'Do you really want to unenroll from this course?' 
        : 'Do you really want to enroll in this course?'
    ).then(confirmed => {
      if (!confirmed) {
        return;
      }

      this.spinner.show();
      this.isLoading = true;
      let updatedEnrollments: string[] = [...this.enrolledCourseIds];

      if (this.isEnrolled(course.id!)) {
        this.store.dispatch(CourseActions.unenrollStudent({
          courseId: course.id!,
          studentId: this.studentId
        }));
        updatedEnrollments = updatedEnrollments.filter(id => id !== course.id);

        this.spinner.hide();
        this.isLoading = false;
        this.enrollmentChanged.emit(updatedEnrollments);

      } else {
        console.log(this.courseService);
        this.courseService.requestEnrollment(course.id!, this.studentId).subscribe(() => {
          this.pendingEnrollments.push(course.id!);

          this.spinner.hide();
          this.isLoading = false;
        });
      }
    });
  }

  isPending(courseId: string): boolean {
    return this.pendingEnrollments.includes(courseId);
  }

  close() {
    this.closeModal.emit();
  }

  formatSessionDates(course: Course): string {
    if (!course.sessions || course.sessions.length === 0) {
      return 'No sessions scheduled';
    }

    const sortedSessions = [...course.sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const displaySessions = sortedSessions.slice(0, 3);

    return displaySessions.map(session => {
      const date = new Date(session.date);
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${session.startTime}-${session.endTime}`;
    }).join(', ') + (sortedSessions.length > 3 ? ' + more' : '');
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterCourses();
  }

  filterCourses(): void {
    this.filteredCourses = this.allCourses.filter(course => {
      const teacherMatch = !this.selectedTeacher || course.teacher === this.selectedTeacher;

      const searchMatch = !this.searchTerm ||
        course.name.toLowerCase().includes(this.searchTerm.toLowerCase());

      let statusMatch = true;
      if (this.selectedStatus === 'Enrolled') {
        statusMatch = this.isEnrolled(course.id!);
      } else if (this.selectedStatus === 'Pending') {
        statusMatch = this.isPending(course.id!);
      } else if (this.selectedStatus === 'Not Enrolled') {
        statusMatch = !this.isEnrolled(course.id!) && !this.isPending(course.id!);
      }
      return teacherMatch && searchMatch && statusMatch;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedTeacher = '';
    this.selectedStatus = 'All';
    this.filterCourses();
  }

  getEnrollmentStatus(course: Course): { text: string; color: string } {
    return { text: 'Open', color: 'green' };
  }

  async confirmRequest(courseId: string): Promise<void> {
      const confirmed = await this.dialog.open(
        'Do you really want to enroll in this course?'
      );
      if (confirmed) {
        this.store.dispatch(CourseActions.deleteCourse({ courseId }));
      }
    }
}
