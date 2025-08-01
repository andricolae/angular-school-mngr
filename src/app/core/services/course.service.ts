import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
  where,
  endBefore,
  startAt,
  endAt,
  limitToLast,
  getCountFromServer,
  QueryDocumentSnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { Course } from '../user.model';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient } from '@angular/common/http';
import { FilterModel, SearchModel } from '../course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private coursesCollection;
  private pageCursors = {
    startCursor: null as QueryDocumentSnapshot<DocumentData> | null,
    endCursor: null as QueryDocumentSnapshot<DocumentData> | null,
  };

  private elementsPerPage = 10;
  private isPreviousFilter = false;

  constructor(private firestore: Firestore, private http: HttpClient) {
    this.coursesCollection = collection(this.firestore, 'courses');
  }

  getCoursesCount(): Promise<number> {
    const usersRef = collection(this.firestore, 'courses');
    const q = query(usersRef);
    return getCountFromServer(q).then((snap) => snap.data().count);
  }

  // WORKS
  getMaxPageIndex(filter: FilterModel, search: SearchModel): Promise<number> {
    const condition = [];
    //push the firestore condition based if the filters on those have been applied
    if (search['name'].length > 0)
      condition.push(
        orderBy('name'),
        startAt(search['name']),
        endAt(search['name'] + '\uf8ff')
      );
    else if (search['teacher'].length > 0)
      condition.push(
        orderBy('teacher'),
        startAt(search['teacher']),
        endAt(search['teacher'] + '\uf8ff')
      );
    else condition.push(orderBy('name'), startAt('A'));

    if (filter['pendingSchedule'].length > 0)
      condition.push(where('pendingSchedule', 'in', filter['pendingSchedule']));

    const coursesRef = collection(this.firestore, 'courses');
    const q = query(coursesRef, ...condition);
    return getCountFromServer(q).then((snap) => {
      const total = snap.data().count;
      const maxPages = Math.ceil(total / this.elementsPerPage);
      return maxPages;
    });
  }

  getCoursesPageByFilter(
    filter: FilterModel,
    search: SearchModel,
    newFilter: boolean,
    direction: 'next' | 'prev'
  ) {
    this.isPreviousFilter = true;
    const condition = [];

    //push the firestore condition based if the filters on those have been applied
    if (search['name'].length > 0)
      condition.push(
        orderBy('name'),
        startAt(search['name']),
        endAt(search['name'] + '\uf8ff')
      );
    else if (search['teacher'].length > 0)
      condition.push(
        orderBy('teacher'),
        startAt(search['teacher']),
        endAt(search['teacher'] + '\uf8ff')
      );
    else condition.push(orderBy('name'), startAt('A'));

    // if (filter['pendingSchedule'].length > 0)
    //   condition.push(where('pendingSchedule', 'in', filter['pendingSchedule']));

    //in case a new filter has been added reset the cursors
    if (newFilter) {
      this.resetCursor();
    }

    // base value when cursors have no value
    let baseQuery = query(
      this.coursesCollection,
      ...condition,
      limit(this.elementsPerPage)
    );

    //in case cursors have values (meaning that the user selected to go on another next/prev page)
    //limitToLast is extremely important for prev page, NEVER DELETE IT
    if (this.pageCursors.endCursor && this.pageCursors.startCursor) {
      baseQuery = query(
        this.coursesCollection,
        ...condition,
        direction === 'next'
          ? startAfter(this.pageCursors.endCursor)
          : endBefore(this.pageCursors.startCursor),
        direction === 'next'
          ? limit(this.elementsPerPage)
          : limitToLast(this.elementsPerPage)
      );
    }

    //update the cursor based on the new query
    return from(getDocs(baseQuery)).pipe(
      map((snapshot) => {
        this.pageCursors = {
          startCursor: snapshot.docs[0] ?? null,
          endCursor: snapshot.docs[snapshot.docs.length - 1] ?? null,
        };

        const courses = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Course)
        );

        return { courses };
      })
    );
  }

  getCoursesPage(direction: 'next' | 'prev') {
    //if filters where applied before reset the cursors
    if (this.isPreviousFilter) {
      this.resetCursor();
      this.isPreviousFilter = false;
    }

    // base value when cursors have no value
    let baseQuery = query(
      this.coursesCollection,
      orderBy('name'),

      limit(this.elementsPerPage)
    );

    //in case cursors have values (meaning that the user selected to go on another next/prev page)
    //limitToLast is extremely important for prev page, NEVER DELETE IT
    if (this.pageCursors.endCursor && this.pageCursors.startCursor) {
      baseQuery = query(
        this.coursesCollection,
        orderBy('name'),

        direction === 'next'
          ? startAfter(this.pageCursors.endCursor)
          : endBefore(this.pageCursors.startCursor),
        direction === 'next'
          ? limit(this.elementsPerPage)
          : limitToLast(this.elementsPerPage)
      );
    }

    //update the cursor based on the new query
    return from(getDocs(baseQuery)).pipe(
      map((snapshot) => {
        this.pageCursors = {
          startCursor: snapshot.docs[0] ?? null,
          endCursor: snapshot.docs[snapshot.docs.length - 1] ?? null,
        };

        const courses = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Course)
        );

        return { courses };
      })
    );
  }

  resetCursor() {
    this.pageCursors.endCursor = null;
    this.pageCursors.startCursor = null;
  }

  getCourses(): Observable<Course[]> {
    return collectionData(this.coursesCollection, { idField: 'id' }).pipe(
      map((courses) => {
        return courses.map((course) => {
          if (course['sessions']) {
            course['sessions'] = course['sessions'].map((session: any) => {
              if (session.date && typeof session.date.toDate === 'function') {
                return {
                  ...session,
                  date: session.date.toDate(),
                };
              }
              return session;
            });
          } else {
            course['sessions'] = [];
          }

          if (!course['studentGrades']) {
            course['studentGrades'] = {};
          }

          if (!course['studentAttendance']) {
            course['studentAttendance'] = {};
          }

          return course as Course;
        });
      })
    ) as Observable<Course[]>;
  }

  getCourse(id: string): Observable<Course | undefined> {
    const courseDoc = doc(this.firestore, `courses/${id}`);
    return from(getDoc(courseDoc)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data['sessions']) {
            data['sessions'] = data['sessions'].map((session: any) => {
              if (session.date && typeof session.date.toDate === 'function') {
                return {
                  ...session,
                  date: session.date.toDate(),
                };
              }
              return session;
            });
          }
          return { ...data, id: docSnap.id } as Course;
        }
        return undefined;
      })
    );
  }

  addCourse(course: Omit<Course, 'id'>): Observable<string> {
    const courseToAdd = {
      ...course,
      sessions: course.sessions || [],
      enrolledStudents: course.enrolledStudents || [],
    };
    return from(
      addDoc(this.coursesCollection, courseToAdd).then((ref) => ref.id)
    );
  }

  deleteCourse(courseId: string): Observable<void> {
    const courseDoc = doc(this.firestore, `courses/${courseId}`);
    return from(deleteDoc(courseDoc));
  }

  updateCourse(course: Course): Observable<void> {
    const courseDoc = doc(this.firestore, `courses/${course.id}`);
    const { id, ...courseWithoutId } = course;
    return from(updateDoc(courseDoc, courseWithoutId));
  }

  enrollStudent(courseId: string, studentId: string): Observable<void> {
    const courseDoc = doc(this.firestore, `courses/${courseId}`);
    return from(
      updateDoc(courseDoc, {
        enrolledStudents: arrayUnion(studentId),
      })
    );
  }

  unenrollStudent(courseId: string, studentId: string): Observable<void> {
    const courseDoc = doc(this.firestore, `courses/${courseId}`);

    return from(getDoc(courseDoc)).pipe(
      switchMap((docSnap) => {
        if (docSnap.exists()) {
          const courseData = docSnap.data();

          const updatedData: any = {
            enrolledStudents: arrayRemove(studentId),
          };

          if (
            courseData['studentGrades'] &&
            courseData['studentGrades'][studentId]
          ) {
            const updatedGrades = { ...courseData['studentGrades'] };
            delete updatedGrades[studentId];
            updatedData.studentGrades = updatedGrades;
          }

          if (
            courseData['studentAttendance'] &&
            courseData['studentAttendance'][studentId]
          ) {
            const updatedAttendance = { ...courseData['studentAttendance'] };
            delete updatedAttendance[studentId];
            updatedData.studentAttendance = updatedAttendance;
          }

          return from(updateDoc(courseDoc, updatedData));
        }
        throw new Error('Course not found');
      })
    );
  }

  addStudentGrade(
    courseId: string,
    studentId: string,
    grade: any
  ): Observable<string> {
    const courseDoc = doc(this.firestore, `courses/${courseId}`);
    const gradeId = uuidv4();

    return from(getDoc(courseDoc)).pipe(
      switchMap((docSnap) => {
        if (docSnap.exists()) {
          const courseData = docSnap.data();

          let studentGrades = courseData['studentGrades'] || {};

          if (!studentGrades[studentId]) {
            studentGrades[studentId] = [];
          }

          const newGrade = {
            id: gradeId,
            title: grade.title,
            value: grade.value,
            date: grade.date,
          };

          studentGrades[studentId].push(newGrade);

          return from(updateDoc(courseDoc, { studentGrades })).pipe(
            map(() => gradeId)
          );
        }
        throw new Error('Course not found');
      })
    );
  }

  updateStudentAttendance(
    courseId: string,
    studentId: string,
    sessionId: string,
    present: boolean
  ): Observable<void> {
    const courseDoc = doc(this.firestore, `courses/${courseId}`);

    return from(getDoc(courseDoc)).pipe(
      switchMap((docSnap) => {
        if (docSnap.exists()) {
          const courseData = docSnap.data();

          let studentAttendance = courseData['studentAttendance'] || {};

          if (!studentAttendance[studentId]) {
            studentAttendance[studentId] = {};
          }

          studentAttendance[studentId][sessionId] = present;

          return from(updateDoc(courseDoc, { studentAttendance }));
        }
        throw new Error('Course not found');
      })
    );
  }

  markCourseForScheduling(courseId: string): Observable<any> {
    return this.http
      .post('https://school-api-server.vercel.app/api/pending-schedule', {
        courseId,
      })
      .pipe(
        catchError((error) => {
          console.error('Error marking course for scheduling:', error);
          return throwError(
            () => new Error('Failed to mark course for scheduling')
          );
        })
      );
  }

  checkScheduleStatus(courseId: string): Observable<boolean> {
    return this.getCourse(courseId).pipe(
      map((course) => {
        return (
          !course!.pendingSchedule &&
          course!.sessions! &&
          course!.sessions!.length > 0
        );
      }),
      catchError((error) => {
        console.error('Error checking schedule status:', error);
        return throwError(() => new Error('Failed to check schedule status'));
      })
    );
  }

  removePendingStudent(courseId: string, studentId: string): Observable<void> {
    const courseDoc = doc(this.firestore, `courses/${courseId}`);
    return from(
      updateDoc(courseDoc, {
        pendingStudents: arrayRemove(studentId),
      })
    );
  }

  acceptPendingStudent(courseId: string, studentId: string): Observable<void> {
    const courseDoc = doc(this.firestore, `courses/${courseId}`);
    return from(
      updateDoc(courseDoc, {
        enrolledStudents: arrayUnion(studentId),
        pendingStudents: arrayRemove(studentId),
      })
    );
  }
  requestEnrollment(courseId: string, studentId: string): Observable<void> {
    const courseRef = doc(this.firestore, `courses/${courseId}`);

    return from(getDoc(courseRef)).pipe(
      switchMap((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const pending = data['pendingStudents'] || [];

          if (!pending.includes(studentId)) {
            return from(
              updateDoc(courseRef, {
                pendingStudents: arrayUnion(studentId),
              })
            );
          } else {
            return from(Promise.resolve());
          }
        } else {
          return throwError(() => new Error('Course not found'));
        }
      })
    );
  }

  cancelEnrollment(courseId: string, studentId: string): Observable<void> {
    const courseRef = doc(this.firestore, `courses/${courseId}`);
    return from(
      updateDoc(courseRef, {
        pendingStudents: arrayRemove(studentId),
      })
    );
  }
}
