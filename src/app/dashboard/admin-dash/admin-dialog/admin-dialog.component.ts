import { Component, Input, output, Output } from '@angular/core';

@Component({
  selector: 'app-admin-dialog',
  imports: [],
  templateUrl: './admin-dialog.component.html',
  styleUrl: './admin-dialog.component.css',
})
export class AdminDialogComponent {
  @Input({ required: true }) title!: string;

  closingClickFunction = output<void>();

  onCloseClick() {
    this.closingClickFunction.emit();
  }
}
