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
  startAt,
  endAt,
  limitToLast,
  getCountFromServer,
  QueryDocumentSnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { FilterModel, SearchModel, UserModel } from '../user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersCollection;
  private pageCursors = {
    startCursor: null as QueryDocumentSnapshot<DocumentData> | null,
    endCursor: null as QueryDocumentSnapshot<DocumentData> | null,
  };

  private elementsPerPage = 10;
  private isPreviousFilter = false;

  constructor(private firestore: Firestore) {
    this.usersCollection = collection(this.firestore, 'users');
  }

  getUsers(): Observable<UserModel[]> {
    return collectionData(this.usersCollection, {
      idField: 'id',
    }) as Observable<UserModel[]>;
  }

  getTeachers(): Observable<UserModel[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', 'Teacher'));
    return collectionData(q, {
      idField: 'id',
    }) as Observable<UserModel[]>;
  }

  getStudentsCount(): Promise<number> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', 'Student'));
    return getCountFromServer(q).then((snap) => snap.data().count);
  }

  getMaxPageIndex(filter: FilterModel, search: SearchModel): Promise<number> {
    const condition = [];
    //push the firestore condition based if the filters on those have been applied
    if (search['fullName'].length > 0)
      condition.push(
        orderBy('fullName'),
        startAt(search['fullName']),
        endAt(search['fullName'] + '\uf8ff')
      );
    else if (search['email'].length > 0)
      condition.push(
        orderBy('email'),
        startAt(search['email']),
        endAt(search['email'] + '\uf8ff')
      );
    else condition.push(orderBy('fullName'), startAt('A'));

    if (filter['role'].length > 0)
      condition.push(where('role', 'in', filter['role']));

    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, ...condition);
    return getCountFromServer(q).then((snap) => {
      const total = snap.data().count;
      const maxPages = Math.ceil(total / this.elementsPerPage);
      return maxPages;
    });
  }

  getUsersPageByFilter(
    filter: FilterModel,
    search: SearchModel,
    newFilter: boolean,
    direction: 'next' | 'prev'
  ) {
    this.isPreviousFilter = true;
    const condition = [];
    //push the firestore condition based if the filters on those have been applied
    if (search['fullName'].length > 0)
      condition.push(
        orderBy('fullName'),
        startAt(search['fullName']),
        endAt(search['fullName'] + '\uf8ff')
      );
    else if (search['email'].length > 0)
      condition.push(
        orderBy('email'),
        startAt(search['email']),
        endAt(search['email'] + '\uf8ff')
      );
    else condition.push(orderBy('fullName'), startAt('A'));

    if (filter['role'].length > 0)
      condition.push(where('role', 'in', filter['role']));

    //in case a new filter has been added reset the cursors
    if (newFilter) {
      this.resetCursor();
    }

    // base value when cursors have no value

    let baseQuery = query(
      this.usersCollection,
      ...condition,
      limit(this.elementsPerPage)
    );

    //in case cursors have values (meaning that the user selected to go on another next/prev page)
    //limitToLast is extremely important for prev page, NEVER DELETE IT
    if (this.pageCursors.endCursor && this.pageCursors.startCursor) {
      baseQuery = query(
        this.usersCollection,
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

        const users = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as UserModel)
        );

        return { users };
      })
    );
  }

  getUsersPage(direction: 'next' | 'prev') {
    //if filters where applied before reset the cursors
    if (this.isPreviousFilter) {
      this.resetCursor();
      this.isPreviousFilter = false;
    }

    // base value when cursors have no value
    let baseQuery = query(
      this.usersCollection,
      orderBy('fullName'),

      limit(this.elementsPerPage)
    );
    //in case cursors have values (meaning that the user selected to go on another next/prev page)
    //limitToLast is extremely important for prev page, NEVER DELETE IT
    if (this.pageCursors.endCursor && this.pageCursors.startCursor) {
      baseQuery = query(
        this.usersCollection,
        orderBy('fullName'),

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

        const users = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as UserModel)
        );

        return { users };
      })
    );
  }

  resetCursor() {
    this.pageCursors.endCursor = null;
    this.pageCursors.startCursor = null;
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
