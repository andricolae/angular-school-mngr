import { Component, inject, Input, output, Output } from '@angular/core';
import { AdminDashService } from '../admin-dash.service';

@Component({
  selector: 'app-admin-dialog',
  imports: [],
  templateUrl: './admin-dialog.component.html',
  styleUrl: './admin-dialog.component.css',
})
export class AdminDialogComponent {
  @Input({ required: true }) title!: string;
  @Input({}) category?: 'user' | 'course' | '';
  @Input({}) action?: 'add' | 'update' | '';

  adminDashService = inject(AdminDashService);

  closingClickFunction = output<void>();

  onCloseClick() {
    if (this.category === 'course') {
      if (this.action === 'add') {
        this.adminDashService.onCheckIfEmpty();
        if (this.adminDashService.inputFieldsEmpty) {
          this.adminDashService.inputFieldsEmpty = false;
          this.adminDashService.cancelUpdateCourseModel = false;
          this.closingClickFunction.emit();
        } else {
          this.adminDashService.cancelUpdateCourseModel =
            this.adminDashService.cancelUpdateCourseModel === false
              ? true
              : true;
          return;
        }
      }

      if (this.action === 'update') {
        this.adminDashService.cancelUpdateCourseModel =
          this.adminDashService.cancelUpdateCourseModel === false ? true : true;
        return;
      }
    }
    if (this.category === 'user') {
      this.adminDashService.cancelUpdateUserModel =
        this.adminDashService.cancelUpdateUserModel === false ? true : true;
      return;
    }
    if (this.category === '') return;
    this.closingClickFunction.emit();
  }
}
