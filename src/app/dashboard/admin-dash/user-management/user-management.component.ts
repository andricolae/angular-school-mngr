import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, JsonPipe } from '@angular/common';

import { Store } from '@ngrx/store';

import { AdminDashService } from '../admin-dash.service';
import * as UserActions from '../../../state/users/user.actions';

import {
  selectAllTeachers,
  selectAllUsers,
  selectUsersPage,
} from '../../../state/users/user.selector';
import { SpinnerComponent } from '../../../core/spinner/spinner.component';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ConfirmationDialogComponent } from '../../../core/confirmation-dialog/confirmation-dialog.component';
import {
  UserFilter,
  UserFilterInput,
  UserModel,
  UserSearch,
} from '../../../core/user.model';
import { AdminDialogComponent } from '../admin-dialog/admin-dialog.component';
import { UserActionsComponent } from './user-actions/user-actions.component';
import { FiltersComponent } from '../filters/filters.component';

@Component({
  selector: 'app-user-management',
  imports: [
    FormsModule,
    AsyncPipe,
    AdminDialogComponent,
    UserActionsComponent,
    SpinnerComponent,
    ConfirmationDialogComponent,
    FiltersComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent {
  @ViewChild('dialog') dialog!: ConfirmationDialogComponent;
  AdminDashService = inject(AdminDashService);

  // users$ = this.store.select(selectAllUsers);
  users$ = this.store.select(selectUsersPage);

  newUser: UserModel = { fullName: '', role: '', email: '' };
  userFilter = UserFilterInput;
  editingUserId: string | null = null;
  showUserDialog = false;
  // used for the display of the next and prev button (if we're on the first page, don't need to show prev button, and if last page no need for next button)
  pageIndex = 1;
  disableNextBtn = false;
  disablePrevBtn = true;
  isShowFilter = false;
  appliedFiltersCount = 1;

  // --------------------------------------------

  constructor(private store: Store, private spinner: SpinnerService) {}

  ngOnInit(): void {
    this.spinner.show();
    // this.store.dispatch(UserActions.loadUsers());
    this.store.dispatch(UserActions.loadUsersPage({ direction: 'next' }));

    setTimeout(() => {
      this.spinner.hide();
    }, 300);
  }

  viewUserDialog(userDetails?: UserModel): void {
    if (userDetails) {
      this.editUser(userDetails);
    }
    this.showUserDialog = true;
  }

  closeUserDialog(): void {
    this.resetUserForm();
    this.editingUserId = null;
    this.showUserDialog = false;
  }

  disableButtons() {
    this.disableNextBtn = this.pageIndex !== 5 ? false : true;
    this.disablePrevBtn = this.pageIndex !== 1 ? false : true;
  }

  // NEXT AND PREV PAGE BUTTONS
  nextPage() {
    if (this.AdminDashService.userAppliedFilterCount() > 0) {
      const filters = this.AdminDashService.newUserFilter();
      const search = this.AdminDashService.newUserSearch();

      this.store.dispatch(
        UserActions.nextFilteredUsersPage({
          filters: filters,
          search: search,
          newFilter: false,
        })
      );
    } else this.store.dispatch(UserActions.nextUsersPage());
    this.pageIndex++;
    this.disableButtons();
  }

  prevPage() {
    if (this.AdminDashService.userAppliedFilterCount() > 0) {
      const filters = this.AdminDashService.newUserFilter();
      const search = this.AdminDashService.newUserSearch();

      this.store.dispatch(
        UserActions.previousFilteredUsersPage({
          filters: filters,
          search: search,
          newFilter: false,
        })
      );
    } else this.store.dispatch(UserActions.previousUsersPage());
    this.pageIndex--;
    this.disableButtons();
  }

  filterUsers() {}

  showFilters() {
    this.isShowFilter = !this.isShowFilter;
    console.log(this.AdminDashService.newUserFilterInput());
  }

  clearAllFilters() {
    //clear search
    let clearSearch = { ...this.AdminDashService.newUserSearch() };
    clearSearch = UserSearch;
    this.AdminDashService.newUserSearch.set(clearSearch);
    this.AdminDashService.userAppliedSearchCount.set(0);
    // clear filter input (checked boxes become unchecked)
    let clearFilterInput = { ...this.AdminDashService.newUserFilterInput() };
    clearFilterInput.categoryOfFilters.forEach((filter) => {
      clearFilterInput.filters[filter].forEach((category) => {
        if (category.selected) {
          category.selected = false;
        }
      });
    });

    this.AdminDashService.newUserFilterInput.set(clearFilterInput);

    // clear filter
    let clearFilter = { ...this.AdminDashService.newUserFilter() };
    clearFilter = UserFilter;
    this.AdminDashService.newUserFilter.set(clearFilter);
    this.AdminDashService.userAppliedFilterCount.set(0);

    //dispatch original pagination

    this.store.dispatch(UserActions.loadUsersPage({ direction: 'next' }));
  }

  //-------------------------- USER RELATED METHODS/FUNCTIONS----------------
  // DELETE STAYS HERE
  async deleteUser(userId: string): Promise<void> {
    const confirmed = await this.dialog.open(
      'Do you really want to delete this user?'
    );
    if (confirmed) {
      this.store.dispatch(UserActions.deleteUser({ userId }));
    }
  }

  editUser(user: UserModel) {
    this.newUser = {
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
    this.editingUserId = user.id!;
  }

  updateUser() {
    this.store.dispatch(
      UserActions.updateUser({
        user: { ...this.newUser, id: this.editingUserId! },
      })
    );
    this.resetUserForm();
  }

  //-------------------------- RESET FORM ----------------

  resetUserForm(): void {
    this.newUser = { email: '', fullName: '', role: '' };
    this.editingUserId = null;
  }
}
