import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseSession } from '../../../core/user.model';

interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  sessions: WeekSession[];
}

interface WeekSession {
  id: string;
  courseId: string;
  courseName: string;
  startTime: string;
  endTime: string;
  teacherName?: string;
  studentCount?: number;
}

@Component({
  selector: 'app-weekly-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekly-schedule.component.html',
  styleUrl: './weekly-schedule.component.css'
})
export class WeeklyScheduleComponent {
  @Input() courses: any[] = [];
  @Input() viewType: 'student' | 'teacher' = 'student';

  weekDays: WeekDay[] = [];
  today = new Date();
  startOfWeek!: Date;
  endOfWeek!: Date;

  constructor() {
    this.initializeWeek();
  }

  ngOnInit(): void {
    this.generateWeekSchedule();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['courses'] || changes['viewType']) {
      this.generateWeekSchedule();
    }
  }

  initializeWeek(): void {
    const now = new Date();
    const startDay = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
    this.startOfWeek = new Date(now.setDate(startDay));
    this.startOfWeek.setHours(0, 0, 0, 0);

    this.today = new Date();
    this.endOfWeek = new Date(this.startOfWeek);
    this.endOfWeek.setDate(this.startOfWeek.getDate() + 6);
    this.endOfWeek.setHours(23, 59, 59, 999);

    this.generateWeekDays();
  }

  generateWeekDays(): void {
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(this.startOfWeek);
      currentDate.setDate(this.startOfWeek.getDate() + i);

      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = currentDate.getDate().toString();
      const isToday = this.isDateToday(currentDate);

      this.weekDays.push({
        date: currentDate,
        dayName,
        dayNumber,
        isToday,
        sessions: []
      });
    }
  }

  generateWeekSchedule(): void {
    this.weekDays.forEach(day => (day.sessions = []));

    this.courses.forEach(course => {
      if (!course.sessions?.length) return;

      course.sessions.forEach((session: CourseSession) => {
        const sessionDate = new Date(session.date);

        if (sessionDate >= this.startOfWeek && sessionDate <= this.endOfWeek) {
          const dayIndex = this.getAdjustedDayIndex(sessionDate);
          if (dayIndex < 0 || dayIndex >= 7) return;

          const sessionInfo: WeekSession = {
            id: session.id,
            courseId: course.id,
            courseName: course.name,
            startTime: session.startTime,
            endTime: session.endTime,
          };

          if (this.viewType === 'teacher') {
            sessionInfo.studentCount =
              course.students?.length ||
              course.enrolledStudents?.length ||
              0;
          }

          this.weekDays[dayIndex].sessions.push(sessionInfo);

          this.weekDays[dayIndex].sessions.sort((a, b) => {
            return this.convertTimeToMinutes(a.startTime) - this.convertTimeToMinutes(b.startTime);
          });
        }
      });
    });
  }

  getAdjustedDayIndex(date: Date): number {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
  }

  isDateToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  convertTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatTimeRange(startTime: string, endTime: string): string {
    return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':');
    let hours = parseInt(h, 10);
    const minutes = m;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  // Metode modificate
  navigateWeek(steps: number): void {
    this.shiftWeekBy(steps * 7);
  }

  navigateMonth(steps: number): void {
    this.changeMonthBy(this.startOfWeek, steps);
    this.changeMonthBy(this.endOfWeek, steps);
    this.refreshCalendar();
  }

  private shiftWeekBy(days: number): void {
    this.startOfWeek.setDate(this.startOfWeek.getDate() + days);
    this.endOfWeek.setDate(this.endOfWeek.getDate() + days);
    this.refreshCalendar();
  }

  private changeMonthBy(date: Date, offset: number): void {
    const currentMonth = date.getMonth();
    date.setMonth(currentMonth + offset);
  }

  private refreshCalendar(): void {
    this.generateWeekDays();
    this.generateWeekSchedule();
  }
}
