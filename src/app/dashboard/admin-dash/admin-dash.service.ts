import { Injectable, signal } from '@angular/core';
import {
  Course,
  UserFilter,
  FilterInputModel,
  UserModel,
  UserFilterInput,
  FilterModel,
  UserSearch,
  SearchModel,
  SearchInputModel,
  UserSearchInput,
} from '../../core/user.model';

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

  //filter and input filters
  newUserFilter = signal<FilterModel>(UserFilter);

  newUserFilterInput = signal<FilterInputModel>(UserFilterInput);

  //search and input search
  newUserSearch = signal<SearchModel>(UserSearch);

  newUserSearchInput = signal<SearchInputModel>(UserSearchInput);

  userAppliedFilterCount = signal<number>(0);

  userAppliedSearchCount = signal<number>(0);

  //canceling
  cancelUpdateCourseModel = false;
  cancelUpdateUserModel = false;
  inputFieldsEmpty = false;

  onCancelUpdateCourseModel() {
    this.cancelUpdateCourseModel = !this.cancelUpdateCourseModel;
  }

  onCancelUpdateUserModel() {
    this.cancelUpdateUserModel = !this.cancelUpdateUserModel;
  }

  //used for add course, if one of the input fields not empty, dialog can't be closed without conf message
  onCheckIfEmpty() {
    if (
      this.newCourse().name !== '' ||
      this.newCourse().teacherId !== '' ||
      this.newCourse().schedule !== '' ||
      this.newCourse().sessions?.length !== 0
    ) {
      this.inputFieldsEmpty = false;
    } else {
      this.inputFieldsEmpty = true;
    }
  }
}
