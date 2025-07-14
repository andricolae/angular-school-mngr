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

  constructor(private firestore: Firestore) {
    this.usersCollection = collection(this.firestore, 'users');
  }

  getUsers(): Observable<UserModel[]> {
    return collectionData(this.usersCollection, {
      idField: 'id',
    }) as Observable<UserModel[]>;
  }

  // getItemsPage(cursor: any | null, direction: 'next' | 'prev') {
  //   const usersRef = collection(this.firestore, 'users');
  //   let query = this.afs.collection<UserModel>('items', (ref) => {
  //     let base = ref.orderBy('fullName').limit(10);
  //     if (cursor) {
  //       base =
  //         direction === 'next'
  //           ? base.startAfter(cursor)
  //           : base.endBefore(cursor);
  //     }
  //     return base;
  //   });

  //   return query.snapshotChanges().pipe(
  //     map((snaps) => {
  //       const items = snaps.map((snap) => ({
  //         id: snap.payload.doc.id,
  //         ...snap.payload.doc.data(),
  //       }));
  //       const startCursor = snaps[0]?.payload.doc;
  //       const endCursor = snaps[snaps.length - 1]?.payload.doc;
  //       return { items, startCursor, endCursor };
  //     })
  //   );
  // }

  getUsersPage(cursor: any | null, direction: 'next' | 'prev') {
    let baseQuery = query(this.usersCollection, orderBy('fullName'), limit(10));

    if (cursor) {
      baseQuery = query(
        this.usersCollection,
        orderBy('fullName'),
        direction === 'next' ? startAfter(cursor) : endBefore(cursor),
        limit(10)
      );
    }

    return from(getDocs(baseQuery)).pipe(
      map((snapshot) => {
        const users = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as UserModel)
        );

        return {
          users,
          startCursor: snapshot.docs[0],
          endCursor: snapshot.docs[snapshot.docs.length - 1],
        };
      })
    );
  }

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
