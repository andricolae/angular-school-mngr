import { Injectable, signal } from '@angular/core';
import {
  FilterModel,
  UserFilter,
  FilterInputModel,
  UserFilterInput,
  UserSearch,
  SearchModel,
  SearchInputModel,
  UserSearchInput,
} from '../../../core/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  constructor() {}

  //filter and input filters
  newFilter = signal<FilterModel>(UserFilter);

  newFilterInput = signal<FilterInputModel>(UserFilterInput);

  //search and input search
  newSearch = signal<SearchModel>(UserSearch);

  newSearchInput = signal<SearchInputModel>(UserSearchInput);

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
    console.log('in disable buttons');

    this.disableNextBtn.set(this.currentPageIndex() === this.maxPageIndex());
    this.disablePrevBtn.set(this.currentPageIndex() === 1);
  }
}
