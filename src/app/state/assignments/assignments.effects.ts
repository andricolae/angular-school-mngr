import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AssignmentService } from '../../core/services/assignment.service';
import * as AssignmentActions from './assignments.actions'; 
import { Assignment } from '../../core/assignment.model';

@Injectable()
export class AssignmentEffects {

  constructor(
    private actions$: Actions, 
    private assignmentService: AssignmentService 
  ) {}

  addAssignment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssignmentActions.addAssignment), 
      mergeMap(action =>
        this.assignmentService.addAssignment(action.assignment).then(
          (docId) => {
            const addedAssignment = { ...action.assignment, id: docId };
            return AssignmentActions.addAssignmentSuccess({ assignment: addedAssignment as Assignment });
          },
          (error) => {
            return AssignmentActions.addAssignmentFailure({ error: error });
          }
        )
      )
    )
  );
}