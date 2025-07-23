export class User {
  constructor(
    public email: string,
    public id: string,
    private _token: string,
    private _tokenExpirationDate: Date,
    public role: string
  ) {}

  get token() {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }
}

export interface Course {
  id?: string;
  name: string;
  teacher: string;
  teacherId?: string;
  schedule?: string;
  sessions?: CourseSession[];
  enrolledStudents?: string[];
  studentGrades?: {
    [studentId: string]: {
      id: string;
      title: string;
      value: number;
      date: string;
    }[];
  };
  studentAttendance?: {
    [studentId: string]: {
      [sessionId: string]: boolean;
    };
  };
  pendingSchedule?: boolean;
  pendingStudents?: string[];
}

export interface CourseSession {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
}

export interface UserModel {
  id?: string;
  email: string;
  fullName: string;
  role: string;
}

// export interface FilterInputModel {
//   categoryOfFilters: string[];
//   input: { id: number; category: string; selected: boolean; name: string }[];
// }

// export const UserFilterInput: FilterInputModel = {
//   categoryOfFilters: ['role', 'testing'],
//   input: [
//     { id: 1, category: 'role', selected: false, name: 'Admin' },
//     { id: 2, category: 'role', selected: false, name: 'Teacher' },
//     { id: 3, category: 'role', selected: false, name: 'Student' },
//     { id: 4, category: 'testing', selected: false, name: 'test1' },
//     { id: 5, category: 'testing', selected: false, name: 'test2' },
//     { id: 6, category: 'testing', selected: false, name: 'test3' },
//   ],
// };

export interface FilterInputModel {
  filters: {
    [key: string]: { id: number; selected: boolean; name: string }[];
  };
  categoryOfFilters: string[];
}

export const UserFilterInput: FilterInputModel = {
  categoryOfFilters: ['role', 'testing'],
  filters: {
    role: [
      { id: 1, selected: false, name: 'Admin' },
      { id: 2, selected: false, name: 'Teacher' },
      { id: 3, selected: false, name: 'Student' },
    ],
    testing: [
      { id: 4, selected: false, name: 'test1' },
      { id: 5, selected: false, name: 'test2' },
      { id: 6, selected: false, name: 'test3' },
    ],
  },
};

export interface FilterModel {
  [key: string]: string[];
}

export const UserFilter: FilterModel = {
  role: [],
};

export interface LogEntry {
  id?: string;
  timestamp: number;
  userId?: string;
  userName?: string;
  userRole?: string;
  category: LogCategory;
  action: string;
  message?: string;
  details?: any;
}

export enum LogCategory {
  AUTH = 'AUTH',
  NAVIGATION = 'NAVIGATION',
  SCHEDULER = 'SCHEDULER',
  SYSTEM = 'SYSTEM',
  COURSE = 'COURSE',
  STUDENT = 'STUDENT',
  GRADE = 'GRADE',
  ATTENDANCE = 'ATTENDANCE',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
}
