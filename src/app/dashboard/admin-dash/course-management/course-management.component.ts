import { Component, inject, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Store } from '@ngrx/store';

import { AdminDashService } from '../admin-dash.service';
import * as CourseActions from '../../../state/courses/course.actions';
import * as UserActions from '../../../state/users/user.actions';
import {
  selectAllCourses,
  selectCoursesPage,
  selectMaxPageIndex,
} from '../../../state/courses/course.selector';
import {
  selectAllTeachers,
  selectAllUsers,
} from '../../../state/users/user.selector';

import { Course, CourseSession, UserModel } from '../../../core/user.model';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ConfirmationDialogComponent } from '../../../core/confirmation-dialog/confirmation-dialog.component';
import { AdminDialogComponent } from '../admin-dialog/admin-dialog.component';
import { StudentDataComponent } from './student-data/student-data.component';
import { SpinnerComponent } from '../../../core/spinner/spinner.component';
import { SessionDataComponent } from './session-data/session-data.component';
import { CourseActionsComponent } from './course-actions/course-actions.component';
import { CourseManagementService } from './course-management.service';
import { FiltersComponent } from '../filters/filters.component';
import { CourseFilter, CourseSearch } from '../../../core/course.model';

@Component({
  selector: 'app-course-management',
  imports: [
    AsyncPipe,
    FormsModule,
    AdminDialogComponent,
    StudentDataComponent,
    SpinnerComponent,
    ConfirmationDialogComponent,
    SessionDataComponent,
    CourseActionsComponent,
    FiltersComponent,
  ],
  templateUrl: './course-management.component.html',
  styleUrl: './course-management.component.css',
})
export class CourseManagementComponent {
  @ViewChild('dialog') dialog!: ConfirmationDialogComponent;
  AdminDashService = inject(AdminDashService);
  CourseService = inject(CourseManagementService);

  newUser: UserModel = { fullName: '', role: '', email: '' };
  users$ = this.store.select(selectAllTeachers);

  teachers: UserModel[] = [];

  // courses$ = this.store.select(selectAllCourses);
  courses$ = this.store.select(selectCoursesPage);
  index$ = this.store.select(selectMaxPageIndex);

  editingCourseId: string | null = null;
  selectedCourseId: string | undefined = '';
  showCourseData: {
    show: boolean;
    id: string;
    action: 'add' | 'update' | '';
  } = {
    show: false,
    id: '',
    action: '',
  };
  showStudentData = false;
  showSessionData = false;

  activeTab: 'grades' | 'attendance' = 'grades';

  showSessionModal = false;
  editingSession: CourseSession = {
    id: '',
    date: new Date(),
    startTime: '',
    endTime: '',
  };
  editingSessionIndex: number = -1;

  filters = this.CourseService.newFilter();
  search = this.CourseService.newSearch();
  isShowFilter = false;

  constructor(private store: Store, private spinner: SpinnerService) {}

  ngOnInit(): void {
    this.spinner.show();
    // this.store.dispatch(CourseActions.loadCourses());
    this.store.dispatch(CourseActions.loadCoursesPage({ direction: 'next' }));
    this.store.dispatch(UserActions.loadTeachers());
    this.users$.subscribe((users) => {
      this.teachers = users;
    });

    this.store.dispatch(
      CourseActions.loadCoursesMaxPageIndex({
        filters: this.filters,
        search: this.search,
      })
    );

    this.index$.subscribe((index) => {
      this.CourseService.maxPageIndex.set(index);
      this.CourseService.disableButtons();
    });
    setTimeout(() => {
      this.spinner.hide();
    }, 300);
  }

  // -----------------------------FILTERS AND PAGINATION--------------------------
  showFilters() {
    this.isShowFilter = !this.isShowFilter;
  }

  clearAllFilters() {
    //clear search
    this.CourseService.newSearchInput().categoryOfSearchers.forEach(
      (search) => {
        this.CourseService.newSearch.update((current) => ({
          ...current,
          [search]: '',
        }));
      }
    );
    let clearSearch = { ...this.CourseService.newSearch() };
    clearSearch = CourseSearch;
    this.CourseService.newSearch.set(clearSearch);
    this.CourseService.appliedSearchCount.set(0);
    // clear filter input (checked boxes become unchecked)
    let clearFilterInput = { ...this.CourseService.newFilterInput() };
    clearFilterInput.categoryOfFilters.forEach((filter) => {
      clearFilterInput.filters[filter].forEach((category) => {
        if (category.selected) {
          category.selected = false;
        }
      });
    });

    this.CourseService.newFilterInput.set(clearFilterInput);

    // clear filter
    let clearFilter = { ...this.CourseService.newFilter() };
    clearFilter = CourseFilter;
    this.CourseService.newFilter.set(clearFilter);
    this.CourseService.appliedFilterCount.set(0);

    this.CourseService.disableButtons();

    //dispatch original pagination
    this.CourseService.currentPageIndex.set(1);
    this.store.dispatch(
      CourseActions.loadCoursesMaxPageIndex({
        filters: this.filters,
        search: this.search,
      })
    );
    this.store.dispatch(CourseActions.loadCoursesPage({ direction: 'next' }));
  }

  // NEXT AND PREV PAGE BUTTONS
  nextPage() {
    if (this.CourseService.appliedFilterCount() > 0) {
      const filters = this.CourseService.newFilter();
      const search = this.CourseService.newSearch();
      this.store.dispatch(
        UserActions.nextFilteredUsersPage({
          filters: filters,
          search: search,
          newFilter: false,
        })
      );
    } else this.store.dispatch(CourseActions.nextCoursesPage());
    this.CourseService.currentPageIndex.update((value) => value + 1);
    this.CourseService.disableButtons();
  }

  prevPage() {
    if (this.CourseService.appliedFilterCount() > 0) {
      const filters = this.CourseService.newFilter();
      const search = this.CourseService.newSearch();
      this.store.dispatch(
        CourseActions.previousFilteredCoursesPage({
          filters: filters,
          search: search,
          newFilter: false,
        })
      );
    } else this.store.dispatch(CourseActions.previousCoursesPage());
    this.CourseService.currentPageIndex.update((value) => value - 1);
    this.CourseService.disableButtons();
  }

  //-------------------------- SESSION RELATED METHODS/FUNCTIONS  ----------------

  editCourse(course: Course) {
    this.AdminDashService.newCourse.set({ ...course });
    this.editingCourseId = course.id!;

    if (
      !this.AdminDashService.newCourse().teacherId &&
      this.AdminDashService.newCourse().teacher
    ) {
      const foundTeacher = this.teachers.find(
        (t) => t.fullName === this.AdminDashService.newCourse().teacher
      );
      if (foundTeacher) {
        this.AdminDashService.newCourse().teacherId = foundTeacher.id;
      }
    }
  }

  // THIS STAYS HERE
  async deleteCourse(courseId: string): Promise<void> {
    const confirmed = await this.dialog.open(
      'Do you really want to delete this course?'
    );
    if (confirmed) {
      this.store.dispatch(CourseActions.deleteCourse({ courseId }));
    }
  }

  //-------------------------- VIEW/CLOSE STUDENT & SESSION  DATA----------------

  // make a reusible one at some point
  viewStudentData(course: Course): void {
    this.selectedCourseId = course.id || undefined;
    this.showStudentData = true;
  }

  closeStudentData(): void {
    this.selectedCourseId = undefined;
    this.showStudentData = false;
  }

  viewSessionData(course: Course): void {
    this.selectedCourseId = course.id || undefined;
    this.showSessionData = true;
  }

  closeSessionData(): void {
    this.selectedCourseId = undefined;
    this.showSessionData = false;
  }

  // showUpdateAddCourseData

  viewCourseAddUpdateDialog(
    action: 'add' | 'update',
    courseDetails?: Course
  ): void {
    if (courseDetails) {
      this.editCourse(courseDetails);
    }

    this.showCourseData.show = true;
    this.showCourseData.action = action;
  }

  closeCourseAddUpdateDialog(): void {
    this.resetCourseForm();
    this.selectedCourseId = undefined;
    this.showCourseData.show = false;
    this.showCourseData.action = '';
  }

  //-------------------------- USER RELATED METHODS/FUNCTIONS----------------

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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(time: string): string {
    return time;
  }

  //-------------------------- COURSE SCHEDULE----------------
  async scheduleCourse(courseId: string): Promise<void> {
    const confirmed = await this.dialog.open(
      'Do you want to send this course for scheduling?'
    );
    if (confirmed) {
      this.spinner.show();
      this.store.dispatch(CourseActions.markCourseForScheduling({ courseId }));
    }
  }

  isCourseSchedulePending(course: Course): boolean {
    return !!course.pendingSchedule;
  }
}
