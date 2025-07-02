import { Component, Input, output, Output } from '@angular/core';

@Component({
  selector: 'app-admin-dialog',
  imports: [],
  templateUrl: './admin-dialog.component.html',
  styleUrl: './admin-dialog.component.css',
})
export class AdminDialogComponent {
  @Input({ required: true }) title!: string;
  @Input({}) category?: 'user' | 'course' | '';

  closingClickFunction = output<void>();

  onCloseClick() {
    this.closingClickFunction.emit();
  }
}
