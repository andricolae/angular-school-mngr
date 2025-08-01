import { createAction, props } from '@ngrx/store';
import { Assignment } from '../../core/assignment.model';

export const addAssignment = createAction(
  '[Assignment] Add Assignment',
  props<{ assignment: Omit<Assignment, 'id'> }>()
);

export const addAssignmentSuccess = createAction(
  '[Assignment] Add Assignment Success',
  props<{ assignment: Assignment }>()
);

export const addAssignmentFailure = createAction(
  '[Assignment] Add Assignment Failure',
  props<{ error: any }>()
);