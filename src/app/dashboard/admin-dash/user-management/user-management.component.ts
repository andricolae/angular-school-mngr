import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';

import { Store } from '@ngrx/store';

import { AdminDashService } from '../admin-dash.service';
import * as UserActions from '../../../state/users/user.actions';

import {
  selectMaxPageIndex,
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
import { UserManagementService } from './user-management.service';

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
  UserService = inject(UserManagementService);

  // users$ = this.store.select(selectAllUsers);
  users$ = this.store.select(selectUsersPage);
  index$ = this.store.select(selectMaxPageIndex);

  newUser: UserModel = { fullName: '', role: '', email: '' };
  userFilter = UserFilterInput;
  editingUserId: string | null = null;
  showUserDialog = false;
  // used for the display of the next and prev button (if we're on the first page, don't need to show prev button, and if last page no need for next button)
  pageIndex = 1;
  maxPageIndex = 0;
  disableNextBtn = false;
  disablePrevBtn = true;
  isShowFilter = false;

  filters = this.UserService.newFilter();
  search = this.UserService.newSearch();
  // --------------------------------------------

  constructor(private store: Store, private spinner: SpinnerService) {}

  ngOnInit(): void {
    this.spinner.show();

    this.store.dispatch(UserActions.loadUsersPage({ direction: 'next' }));
    this.store.dispatch(
      UserActions.loadUsersMaxPageIndex({
        filters: this.filters,
        search: this.search,
      })
    );

    this.index$.subscribe((index) => {
      this.UserService.maxPageIndex.set(index);
      this.UserService.disableButtons();
    });
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

  // NEXT AND PREV PAGE BUTTONS
  nextPage() {
    if (this.UserService.appliedFilterCount() > 0) {
      const filters = this.UserService.newFilter();
      const search = this.UserService.newSearch();

      this.store.dispatch(
        UserActions.nextFilteredUsersPage({
          filters: filters,
          search: search,
          newFilter: false,
        })
      );
    } else this.store.dispatch(UserActions.nextUsersPage());
    this.UserService.currentPageIndex.update((value) => value + 1);
    this.UserService.disableButtons();
  }

  prevPage() {
    if (this.UserService.appliedFilterCount() > 0) {
      const filters = this.UserService.newFilter();
      const search = this.UserService.newSearch();

      this.store.dispatch(
        UserActions.previousFilteredUsersPage({
          filters: filters,
          search: search,
          newFilter: false,
        })
      );
    } else this.store.dispatch(UserActions.previousUsersPage());
    this.UserService.currentPageIndex.update((value) => value - 1);

    this.UserService.disableButtons();
  }

  showFilters() {
    this.isShowFilter = !this.isShowFilter;
  }

  clearAllFilters() {
    //clear search
    this.UserService.newSearchInput().categoryOfSearchers.forEach((search) => {
      this.UserService.newSearch.update((current) => ({
        ...current,
        [search]: '',
      }));
    });
    let clearSearch = { ...this.UserService.newSearch() };
    clearSearch = UserSearch;
    this.UserService.newSearch.set(clearSearch);
    this.UserService.appliedSearchCount.set(0);
    // clear filter input (checked boxes become unchecked)
    let clearFilterInput = { ...this.UserService.newFilterInput() };
    clearFilterInput.categoryOfFilters.forEach((filter) => {
      clearFilterInput.filters[filter].forEach((category) => {
        if (category.selected) {
          category.selected = false;
        }
      });
    });

    this.UserService.newFilterInput.set(clearFilterInput);

    // clear filter
    let clearFilter = { ...this.UserService.newFilter() };
    clearFilter = UserFilter;
    this.UserService.newFilter.set(clearFilter);
    this.UserService.appliedFilterCount.set(0);

    this.UserService.disableButtons();

    //dispatch original pagination
    this.UserService.currentPageIndex.set(1);
    this.store.dispatch(
      UserActions.loadUsersMaxPageIndex({
        filters: this.filters,
        search: this.search,
      })
    );
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
