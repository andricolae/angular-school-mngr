import { Injectable } from '@angular/core';
import {Firestore, collection, addDoc, Timestamp} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Assignment } from '../assignment.model'; 

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {

  private assignmentsCollection = collection(this.firestore, 'assignments');

  constructor(private firestore: Firestore) {}


  async addAssignment(assignmentData: Omit<Assignment, 'id'>): Promise<string> {
    try {
      const deadlineAsDate = new Date(assignmentData.deadline);

      const assignmentToSave: any = { 
        title: assignmentData.title,
        description: assignmentData.description,
        deadline: Timestamp.fromDate(deadlineAsDate), // Stochează data ca Timestamp
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
}