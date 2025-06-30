import { Component, Input, ViewChild } from '@angular/core';
import { Course, CourseSession } from '../../../core/user.model';

import { v4 as uuidv4 } from 'uuid';
import { ConfirmationDialogComponent } from '../../../core/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-session-actions',
  imports: [],
  templateUrl: './session-actions.component.html',
  styleUrl: './session-actions.component.css',
})
export class SessionActionsComponent {
  @ViewChild('dialog') dialog!: ConfirmationDialogComponent;

  @Input({ required: true }) editingCourseId!: string | null | undefined;
  @Input({ required: true }) newCourse!: Course;
  showSessionModal = false;
  editingSession: CourseSession = {
    id: '',
    date: new Date(),
    startTime: '',
    endTime: '',
  };
  editingSessionIndex: number = -1;
  //-------------------------- SESSION RELATED METHODS/FUNCTIONS + OPEN/CLOSE MODAL----------------
  openAddSessionModal(course: Course): void {
    this.editingSession = {
      id: uuidv4(),
      date: new Date(),
      startTime: '10:00',
      endTime: '12:00',
    };
    this.editingSessionIndex = -1;
    this.showSessionModal = true;
  }

  editSession(course: Course, sessionIndex: number): void {
    this.editingSession = { ...course.sessions![sessionIndex] };
    this.editingSessionIndex = sessionIndex;
    this.showSessionModal = true;
  }

  saveSession(): void {
    if (!this.editingCourseId) return;

    const updatedCourse = { ...this.newCourse };

    if (this.editingSessionIndex === -1) {
      updatedCourse.sessions = [
        ...updatedCourse.sessions!,
        this.editingSession,
      ];
    } else {
      updatedCourse.sessions = updatedCourse.sessions!.map((session, index) =>
        index === this.editingSessionIndex ? this.editingSession : session
      );
    }

    this.newCourse = updatedCourse;
    this.closeSessionModal();
  }

  async deleteSession(sessionIndex: number): Promise<void> {
    const confirmed = await this.dialog.open(
      'Do you really want to delete this session?'
    );
    if (confirmed) {
      const updatedCourse = { ...this.newCourse };
      updatedCourse.sessions = updatedCourse.sessions!.filter(
        (_, index) => index !== sessionIndex
      );
      this.newCourse = updatedCourse;
    }
  }

  closeSessionModal(): void {
    this.showSessionModal = false;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
