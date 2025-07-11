import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Assignment } from '../assignment.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {

  constructor(private firestore: Firestore) {}

  getAssignmentsForCourse(courseId: string): Observable<Assignment[]> {
    const assignmentsCollection = collection(this.firestore, 'assignments');
    const assignmentsQuery = query(
      assignmentsCollection,
      where('course_id', '==', courseId),
      orderBy('deadline', 'asc')
    );

    return collectionData(assignmentsQuery, { idField: 'id' }) as Observable<Assignment[]>;
  }
}