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
  AdminDashService = inject(AdminDashService); // injected for the newCourse signal

  @Input({ required: true }) editingCourseId!: string | null | undefined;
  @Input({ required: true }) courseAction!: 'add' | 'update' | '';
  showSessionModal = false;

  // show: for showing the confirmation delele message, session Index: so we know which session shall be deleted
  deleteSessionMessage = signal<{ show: boolean; sessionIndex: number }>({
    show: false,
    sessionIndex: -1,
  });

  dateValidation = {
    showMessage: false,
    message: '',
  };

  //session structure
  editingSession: CourseSession = {
    id: '',
    date: new Date(),
    startTime: '',
    endTime: '',
  };

  editingSessionIndex: number = -1;

  //-------------------------- SESSION RELATED METHODS/FUNCTIONS + OPEN/CLOSE MODAL----------------

  // doesn't work, was created with the intent of showing the sessions ordered by date, but it breaks the edit and delete actions
  sortSessionsByDate(): void {
    const currentCourse = this.AdminDashService.newCourse();
    const sortedSessions = [...(currentCourse.sessions ?? [])].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    this.AdminDashService.newCourse.update((course) => ({
      ...course,
      sessions: sortedSessions,
    }));
  }

  // -----------------------SAVING SESSIONS--------------------------------

  //saving the sessions
  saveSession(): void {
    if (
      (this.courseAction === 'update' || this.courseAction === '') &&
      !this.editingCourseId
    )
      return;
    this.isValidDate();
    if (this.dateValidation.showMessage) {
      return;
    }
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
      startTime: '00:00',
      endTime: '00:00',
    };
    this.sortSessionsByDate();
    this.closeSessionModal();
  }

  // getting the session data by index and the actual index, showing the modal and closing any existing delete confirmation message
  editSession(course: Course, sessionIndex: number): void {
    this.editingSession = { ...course.sessions![sessionIndex] };
    this.editingSessionIndex = sessionIndex;
    this.showSessionModal = true;
    this.resetDeleteSessionMessage();
  }

  // ----------------MODAL FOR EDITING AND ADDING DATA--------------
  openAddSessionModal(course: Course): void {
    this.editingSession = {
      id: uuidv4(),
      date: new Date(),
      startTime: '00:00',
      endTime: '00:00',
    };
    this.editingSessionIndex = -1;
    this.showSessionModal = true;
  }

  closeSessionModal(): void {
    this.showSessionModal = false;
    this.dateValidation = {
      showMessage: false,
      message: '',
    };
  }

  // ------------------DELETE RELATED---------------------

  //deleting a session
  async deleteSession(sessionIndex: number): Promise<void> {
    const updatedCourse = { ...this.AdminDashService.newCourse() };
    updatedCourse.sessions = updatedCourse.sessions!.filter(
      (_, index) => index !== sessionIndex
    );
    this.AdminDashService.newCourse.set(updatedCourse);
    this.resetDeleteSessionMessage();
  }

  //when clicking on the delete session button
  onDeleteSessionClick(sessionIndex: number) {
    const current = this.deleteSessionMessage();
    this.deleteSessionMessage.set({
      show: !current.show,
      sessionIndex: sessionIndex,
    });
    this.closeSessionModal();
  }

  resetDeleteSessionMessage() {
    this.deleteSessionMessage.set({
      show: false,
      sessionIndex: -1,
    });
  }

  // ----------------DATE FORMAT------------------------
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  isValidDate() {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    const dateValid = regex.test(this.editingSession.date.toString());
    const timeValid =
      this.editingSession.startTime < this.editingSession.endTime;
    const timeEqual =
      this.editingSession.startTime === this.editingSession.endTime;

    if (!dateValid) {
      this.dateValidation = {
        showMessage: true,
        message: 'Please select a date for this session.',
      };
      return;
    }
    if (timeEqual) {
      this.dateValidation = {
        showMessage: true,
        message: 'The start time and end time cannot be the same.',
      };
      return;
    }
    if (!timeValid) {
      this.dateValidation = {
        showMessage: true,
        message: 'The start time cannot be greater than the end time.',
      };
      return;
    }

    this.dateValidation = {
      showMessage: false,
      message: '',
    };
    return;
  }
}
