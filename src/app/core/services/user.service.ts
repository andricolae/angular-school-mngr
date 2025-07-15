import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
  where,
  endBefore,
  limitToLast,
  QueryDocumentSnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { User, UserModel } from '../user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersCollection;
  private pageCursors = {
    startCursor: null as QueryDocumentSnapshot<DocumentData> | null,
    endCursor: null as QueryDocumentSnapshot<DocumentData> | null,
    pageIndex: 0,
  };

  constructor(private firestore: Firestore) {
    this.usersCollection = collection(this.firestore, 'users');
  }

  getUsers(): Observable<UserModel[]> {
    return collectionData(this.usersCollection, {
      idField: 'id',
    }) as Observable<UserModel[]>;
  }

  getUsersPage(direction: 'next' | 'prev') {
    let baseQuery = query(this.usersCollection, orderBy('fullName'), limit(5));

    if (this.pageCursors.endCursor && this.pageCursors.startCursor) {
      baseQuery = query(
        this.usersCollection,
        orderBy('fullName'),
        direction === 'next'
          ? startAfter(this.pageCursors.endCursor)
          : endBefore(this.pageCursors.startCursor),
        direction === 'next' ? limit(5) : limitToLast(5)
      );
    }
    return from(getDocs(baseQuery)).pipe(
      map((snapshot) => {
        this.pageCursors = {
          startCursor: snapshot.docs[this.pageCursors.pageIndex * 5] ?? null,
          endCursor: snapshot.docs[snapshot.docs.length - 1] ?? null,
          pageIndex:
            direction === 'next'
              ? this.pageCursors.pageIndex++
              : this.pageCursors.pageIndex--,
        };

        const users = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as UserModel)
        );
        console.log(this.pageCursors.startCursor);
        return { users };
      })
    );
  }

  getStartCursor() {
    return this.pageCursors.startCursor;
  }

  getEndCursor() {
    return this.pageCursors.endCursor;
  }

  // getUsersPage(cursor: any | null, direction: 'next' | 'prev') {
  //   let baseQuery = query(this.usersCollection, orderBy('fullName'), limit(10));

  //   if (cursor) {
  //     baseQuery = query(
  //       this.usersCollection,
  //       orderBy('fullName'),
  //       direction === 'next' ? startAfter(cursor) : endBefore(cursor),
  //       limit(10)
  //     );
  //   }

  //   return from(getDocs(baseQuery)).pipe(
  //     map((snapshot) => {
  //       const users = snapshot.docs.map(
  //         (doc) =>
  //           ({
  //             id: doc.id,
  //             ...doc.data(),
  //           } as UserModel)
  //       );

  //       return {
  //         users,
  //         startCursor: snapshot.docs[0],
  //         endCursor: snapshot.docs[snapshot.docs.length - 1],
  //       };
  //     })
  //   );
  // }

  getUser(user: UserModel): Observable<UserModel | null> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', user.email));
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data() as UserModel;
          return userData;
        }
        return null;
      })
    );
  }

  // help me
  // getUsersPage(
  //   startAfterDoc?: QueryDocumentSnapshot<any>
  // ): Observable<UserModel[]> {
  //   let q;

  //   if (startAfterDoc) {
  //     q = query(
  //       this.usersCollection,
  //       orderBy('fullName'),
  //       startAfter(startAfterDoc),
  //       limit(10)
  //     );
  //   } else {
  //     q = query(this.usersCollection, orderBy('fullName'), limit(10));
  //   }

  //   return from(getDocs(q)).pipe(
  //     map((snapshot) => {
  //       this.lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null; // store last doc for cursor
  //       return snapshot.docs.map(
  //         (doc) => ({ id: doc.id, ...doc.data() } as UserModel)
  //       );
  //     })
  //   );
  // }

  deleteUser(userId: string): Observable<void> {
    const userDoc = doc(this.firestore, `users/${userId}`);
    return from(deleteDoc(userDoc));
  }

  updateUser(user: UserModel): Observable<void> {
    const userDoc = doc(this.firestore, `users/${user.id}`);
    const { id, ...userWithoutId } = user;
    return from(updateDoc(userDoc, userWithoutId));
  }
}
