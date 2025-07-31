import { Injectable, signal } from '@angular/core';
import {
  FilterInputModel,
  FilterModel,
  SearchInputModel,
  SearchModel,
} from '../../../core/user.model';
import {
  CourseFilter,
  CourseFilterInput,
  CourseSearch,
  CourseSearchInput,
} from '../../../core/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseManagementService {
  constructor() {}

  //filter and input filters
  newFilter = signal<FilterModel>(CourseFilter);

  newFilterInput = signal<FilterInputModel>(CourseFilterInput);

  //search and input search
  newSearch = signal<SearchModel>(CourseSearch);

  newSearchInput = signal<SearchInputModel>(CourseSearchInput);

  //counts
  appliedFilterCount = signal<number>(0);

  appliedSearchCount = signal<number>(0);

  //page indexes
  maxPageIndex = signal<number>(0);

  currentPageIndex = signal<number>(1);

  //buttons
  disablePrevBtn = signal<boolean>(true);

  disableNextBtn = signal<boolean>(false);

  disableButtons() {
    if (this.currentPageIndex() !== this.maxPageIndex())
      this.disableNextBtn.set(false);
    else this.disableNextBtn.set(true);

    if (this.currentPageIndex() !== 1) this.disablePrevBtn.set(false);
    else this.disablePrevBtn.set(true);
  }
}
