import { createReducer, on } from '@ngrx/store';
import { Assignment } from '../../core/assignment.model';
import * as AssignmentActions from './assignments.actions';

export interface AssignmentState {
  assignments: Assignment[]; 
  loading: boolean;          
  error: any;                
}

export const initialAssignmentState: AssignmentState = {
  assignments: [],
  loading: false,
  error: null,
};

export const assignmentReducer = createReducer(
  initialAssignmentState, 

  on(AssignmentActions.addAssignment, state => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AssignmentActions.addAssignmentSuccess, (state, { assignment }) => ({
    ...state,
    assignments: [...state.assignments, assignment], // Adaugă noul assignment la lista existentă
    loading: false,
    error: null,
  })),

  on(AssignmentActions.addAssignmentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  }))
);