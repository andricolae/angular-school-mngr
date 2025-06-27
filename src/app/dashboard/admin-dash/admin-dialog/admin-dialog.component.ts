import { Component, Input, output, Output } from '@angular/core';

@Component({
  selector: 'app-admin-dialog',
  imports: [],
  templateUrl: './admin-dialog.component.html',
  styleUrl: './admin-dialog.component.css',
})
export class AdminDialogComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) category!: 'course' | 'user';
  @Input({ required: true }) action!: 'add' | 'update';

  closingClickFunction = output<void>();

  onCloseClick() {
    this.closingClickFunction.emit();
  }
}
