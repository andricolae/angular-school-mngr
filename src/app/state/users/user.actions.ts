import { createAction, props } from '@ngrx/store';
import { FilterModel, SearchModel, UserModel } from '../../core/user.model';

export const loadUsers = createAction('[Users] Load Users');

export const loadUsersPage = createAction(
  '[Users] Load Users Page',
  props<{ direction: 'next' | 'prev' }>()
);

export const loadUsersPageSuccess = createAction(
  '[Users] Load Users Page Success',
  props<{ users: UserModel[] }>()
);

export const loadUsersPageFail = createAction(
  '[Users] Load Users Page Failure',
  props<{ error: any }>()
);

export const loadFilteredUsersPage = createAction(
  '[Users] Load Users Filter Page',
  props<{
    filters: FilterModel;
    search: SearchModel;
    direction: 'next' | 'prev';
    newFilter: boolean;
  }>()
);

export const loadFilteredUsersPageSuccess = createAction(
  '[Users] Load Users Filters Page Success',
  props<{ users: UserModel[] }>()
);

export const loadFilteredUsersPageFail = createAction(
  '[Users] Load Users Filters Page Failure',
  props<{ error: any }>()
);

export const nextUsersPage = createAction(
  '[Users] Next Users Page',
  props<{
    direction: 'next' | 'prev';
  }>
);
export const previousUsersPage = createAction(
  '[Users] Previous Users Page',
  props<{
    direction: 'next' | 'prev';
  }>
);

export const nextFilteredUsersPage = createAction(
  '[Users] Next Filtered Users Page',
  props<{
    filters: FilterModel;
    search: SearchModel;
    newFilter: boolean;
  }>()
);
export const previousFilteredUsersPage = createAction(
  '[Users] Previous Filtered Users Page',
  props<{
    filters: FilterModel;
    search: SearchModel;
    newFilter: boolean;
  }>()
);

export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{ users: UserModel[] }>()
);

export const loadUsersFail = createAction(
  '[Users] Load Users Fail',
  props<{ error: string }>()
);

export const loadTeachers = createAction('[Users] Load Users Teachers');

export const loadTeachersSuccess = createAction(
  '[Users] Load Users Teachers Success',
  props<{ teachers: UserModel[] }>()
);

export const loadTeachersFail = createAction(
  '[Users] Load Users Teachers Fail',
  props<{ error: string }>()
);

export const deleteUser = createAction(
  '[Users] Delete User',
  props<{ userId: string }>()
);

export const deleteUserSuccess = createAction(
  '[Users] Delete User Success',
  props<{ userId: string }>()
);

export const deleteUserFail = createAction(
  '[Users] Delete User Fail',
  props<{ error: string }>()
);

export const updateUser = createAction(
  '[Users] Update User',
  props<{ user: UserModel }>()
);

export const updateUserSuccess = createAction(
  '[Users] Update User Success',
  props<{ user: UserModel }>()
);

export const updateUserFail = createAction(
  '[Users] Update User Fail',
  props<{ error: string }>()
);

export const getUser = createAction(
  '[User] Load User',
  props<{ user: UserModel }>()
);

export const getUserSuccess = createAction(
  '[Users] Load User Success',
  props<{ user: UserModel }>()
);

export const getUserFail = createAction(
  '[Users] Load Users Fail',
  props<{ error: string }>()
);
