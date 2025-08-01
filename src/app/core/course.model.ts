export interface CourseSchedule {
  id: string;
  courseId: string;
  courseName: string;
  teacher: string;
  status: 'pending' | 'scheduled';
  sessions: CourseSession[];
  lastUpdated: Date;
}

export interface CourseSession {
  id?: string;
  courseId: string;
  date: Date;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  recurring?: boolean;
  recurrencePattern?: 'weekly' | 'biweekly' | 'monthly';
}

export interface FilterInputModel {
  filters: {
    [key: string]: { id: number; selected: boolean; name: string }[];
  };
  categoryOfFilters: string[];
}

export const CourseFilterInput: FilterInputModel = {
  categoryOfFilters: [],
  filters: {},
};

export interface FilterModel {
  [key: string]: string[];
}

export const CourseFilter: FilterModel = {
  pendingSchedule: [],
};

export interface SearchInputModel {
  search: {
    [key: string]: string;
  };
  categoryOfSearchers: string[];
}

export const CourseSearchInput: SearchInputModel = {
  categoryOfSearchers: ['name', 'teacher'],
  search: {
    name: '',
    teacher: '',
  },
};

export interface SearchModel {
  [key: string]: string;
}

export const CourseSearch: SearchModel = {
  name: '',
  teacher: '',
};
