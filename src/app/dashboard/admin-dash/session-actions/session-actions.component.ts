import { Component, inject, Input, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { v4 as uuidv4 } from 'uuid';
import { Course, CourseSession } from '../../../core/user.model';
import { ConfirmationDialogComponent } from '../../../core/confirmation-dialog/confirmation-dialog.component';
import { AdminDashService } from '../admin-dash.service';

@Component({
  selector: 'app-session-actions',
  imports: [FormsModule],
  templateUrl: './session-actions.component.html',
  styleUrl: './session-actions.component.css',
})
export class SessionActionsComponent {
  @ViewChild('dialog') dialog!: ConfirmationDialogComponent;
  AdminDashService = inject(AdminDashService);

  @Input({ required: true }) editingCourseId!: string | null | undefined;
  @Input({ required: true }) courseAction!: 'add' | 'update' | '';
  showSessionModal = false;
  deleteSessionMessage = signal<{ show: boolean; sessionIndex: number }>({
    show: false,
    sessionIndex: -1,
  });
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

  get sortedSessions() {
    return [...(this.AdminDashService.newCourse().sessions ?? [])].sort(
      (a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    );
  }

  editSession(course: Course, sessionIndex: number): void {
    this.editingSession = { ...course.sessions![sessionIndex] };
    this.editingSessionIndex = sessionIndex;
    this.showSessionModal = true;
  }

  saveSession(): void {
    if (
      (this.courseAction === 'update' || this.courseAction === '') &&
      !this.editingCourseId
    )
      return;

    const updatedCourse = { ...this.AdminDashService.newCourse() };

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

    this.AdminDashService.newCourse.set(updatedCourse);
    this.editingSession = {
      id: uuidv4(),
      date: new Date(),
      startTime: '10:00',
      endTime: '12:00',
    };
    this.closeSessionModal();
  }

  async deleteSession(sessionIndex: number): Promise<void> {
    const updatedCourse = { ...this.AdminDashService.newCourse() };
    updatedCourse.sessions = updatedCourse.sessions!.filter(
      (_, index) => index !== sessionIndex
    );
    this.AdminDashService.newCourse.set(updatedCourse);
    this.resetDeleteSessionMessage();
  }

  closeSessionModal(): void {
    this.showSessionModal = false;
  }

  onDeleteSessionClick(sessionIndex: number) {
    const current = this.deleteSessionMessage();
    this.deleteSessionMessage.set({
      show: !current.show,
      sessionIndex: sessionIndex,
    });
  }

  resetDeleteSessionMessage() {
    this.deleteSessionMessage.set({
      show: false,
      sessionIndex: -1,
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
