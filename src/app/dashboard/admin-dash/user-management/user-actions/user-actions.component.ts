import { Component, inject, Input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Store } from '@ngrx/store';

import { UserModel } from '../../../../core/user.model';
import { AdminDashService } from '../../admin-dash.service';
import * as UserActions from '../../../../state/users/user.actions';

@Component({
  selector: 'app-user-actions',
  imports: [FormsModule],
  templateUrl: './user-actions.component.html',
  styleUrl: './user-actions.component.css',
})
export class UserActionsComponent {
  @Input({ required: true }) editingUserId!: string | null;
  @Input({ required: true }) newUser!: UserModel;
  AdminDashService = inject(AdminDashService);

  // used for closing the entire dialog (in add course) if all the input fiels and session are empty
  cancelingClickFunction = output<void>();

  constructor(private store: Store) {}

  showConfirmationMessage = false;

  //  --------------------EMITER FOR CANCEL CLICK------------------------------

  async onCancelClick(): Promise<void> {
    this.AdminDashService.cancelUpdateCourseModel = false;
    this.AdminDashService.cancelUpdateUserModel = false;
    this.cancelingClickFunction.emit();
  }

  //  --------------------UPDATE USER------------------------------

  updateUser() {
    this.store.dispatch(
      UserActions.updateUser({
        user: { ...this.newUser!, id: this.editingUserId! },
      })
    );
    this.onCancelClick();
  }

  //  --------------------RESET FORM------------------------------

  resetUserForm(): void {
    this.newUser = { email: '', fullName: '', role: '' };
    this.editingUserId = null;
  }

  //  --------------------CANCEL UPDATE USER------------------------------

  onShowConfirmationMessage() {
    this.showConfirmationMessage = !this.showConfirmationMessage;
  }

  onCancelUpdateUserModel() {
    this.AdminDashService.cancelUpdateUserModel =
      !this.AdminDashService.cancelUpdateUserModel;
  }
}
