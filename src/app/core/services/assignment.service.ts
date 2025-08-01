import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, orderBy,  addDoc, Timestamp} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Assignment } from '../assignment.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {

  private assignmentsCollection = collection(this.firestore, 'assignments');

  constructor(private firestore: Firestore) {}


  async addAssignment(assignmentData: Omit<Assignment, 'id'>): Promise<string> {
    try {

      const assignmentToSave: any = { 
        title: assignmentData.title,
        description: assignmentData.description,
       deadline: Timestamp.fromDate(assignmentData.deadline), // Salvează deadline-ul ca Timestamp
        course_id: assignmentData.course_id,
      };

      // Adaugă proprietatea 'file' doar dacă este definită (nu este undefined)
      if (assignmentData.file !== undefined) {
        assignmentToSave.file = assignmentData.file;
      }

      const docRef = await addDoc(this.assignmentsCollection, assignmentToSave);

      console.log('Assignment adăugat cu succes! ID:', docRef.id);
      return docRef.id; 
    } catch (error) {
      console.error('Eroare la adăugarea assignment-ului:', error);
      throw error;
    }
  }

  // getAssignmentsForCourse(courseId: string): Observable<Assignment[]> {
  //   const assignmentsCollection = collection(this.firestore, 'assignments');
  //   const assignmentsQuery = query(
  //     assignmentsCollection,
  //     where('course_id', '==', courseId),
  //     orderBy('deadline', 'asc')
  //   );

  //   return collectionData(assignmentsQuery, { idField: 'id' }) as Observable<Assignment[]>;
  // }

    getAssignmentsForCourse(courseId: string): Observable<Assignment[]> {
    const assignmentsCollection = collection(this.firestore, 'assignments');
    const assignmentsQuery = query(
      assignmentsCollection,
      where('course_id', '==', courseId),
      orderBy('deadline', 'asc')
    );

    return collectionData(assignmentsQuery, { idField: 'id' }).pipe(
      map((assignments: any[]) => { 
        return assignments.map(assignment => {
          // Convertim Timestamp-ul Firestore în obiect Date de JavaScript
          if (assignment.deadline instanceof Timestamp) {
            return {
              ...assignment,
              deadline: assignment.deadline.toDate() 
            };
          }
          return assignment; // Returnează assignment-ul așa cum este dacă deadline-ul nu e Timestamp
        });
      })
    ) as Observable<Assignment[]>;
  }
}