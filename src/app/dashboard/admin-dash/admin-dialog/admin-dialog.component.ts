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

  adminDashService = inject(AdminDashService);

  closingClickFunction = output<void>();

  onCloseClick() {
    if (this.category === 'course') {
      this.adminDashService.cancelUpdateCourseModel =
        this.adminDashService.cancelUpdateCourseModel === false ? true : false;
      if (this.adminDashService.inputFieldsEmpty) return;
    }
    if (this.category === 'user') {
      this.adminDashService.cancelUpdateUserModel =
        this.adminDashService.cancelUpdateUserModel === false ? true : false;
      return;
    }
    if (this.category === '') return;
    this.closingClickFunction.emit();
  }
}
