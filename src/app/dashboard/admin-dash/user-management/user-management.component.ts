import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, JsonPipe } from '@angular/common';

import { Store } from '@ngrx/store';

import { AdminDashService } from '../admin-dash.service';
import * as UserActions from '../../../state/users/user.actions';

import {
  selectAllUsers,
  selectUsersPage,
} from '../../../state/users/user.selector';
import { SpinnerComponent } from '../../../core/spinner/spinner.component';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ConfirmationDialogComponent } from '../../../core/confirmation-dialog/confirmation-dialog.component';
import { UserModel } from '../../../core/user.model';
import { AdminDialogComponent } from '../admin-dialog/admin-dialog.component';
import { UserActionsComponent } from './user-actions/user-actions.component';

@Component({
  selector: 'app-user-management',
  imports: [
    FormsModule,
    AsyncPipe,
    AdminDialogComponent,
    UserActionsComponent,
    SpinnerComponent,
    ConfirmationDialogComponent,
    JsonPipe,
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
  editingUserId: string | null = null;
  showUserDialog = false;

  // --------------------------------------------

  constructor(private store: Store, private spinner: SpinnerService) {}

  ngOnInit(): void {
    this.spinner.show();
    // this.store.dispatch(UserActions.loadUsers());
    this.store.dispatch(
      UserActions.loadUsersPage({ cursor: null, direction: 'next' })
    );
    console.log(this.users$);
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
    this.store.dispatch(UserActions.nextUsersPage());
  }

  prevPage() {
    this.store.dispatch(UserActions.previousUsersPage());
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
