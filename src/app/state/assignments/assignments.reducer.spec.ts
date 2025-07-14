import * as AssignmentActions from './assignments.actions';
import { Assignment } from '../../core/assignment.model';
import { assignmentReducer, AssignmentState, initialAssignmentState } from './assignments.reducer';

describe('Assignment Reducer', () => {

  // Test 1: Verifică dacă starea inițială este returnată corect
  it('should return the initial state', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const state = assignmentReducer(undefined, action); 
    expect(state).toEqual(initialAssignmentState);
  });

  // Test 2: Verifică gestionarea acțiunii addAssignment (când se începe adăugarea)
  it('should handle addAssignment action correctly', () => {
    const assignmentToAdd: Omit<Assignment, 'id'> = {
      title: 'New Assignment',
      description: 'Descriere test',
      deadline: '2025-07-30T12:00:00Z', 
      course_id: 'course-101',
      file: undefined
    };
    const action = AssignmentActions.addAssignment({ assignment: assignmentToAdd });
    const state = assignmentReducer(initialAssignmentState, action);

    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();

    expect(state.assignments).toEqual([]);
  });

  // Test 3: Verifică gestionarea acțiunii addAssignmentSuccess
  it('should handle addAssignmentSuccess action correctly', () => {
    const previousState: AssignmentState = {
      assignments: [],
      loading: true, // Presupunem că era în stare de loading
      error: null
    };

    const addedAssignment: Assignment = {
      id: 'mock-id-123',
      title: 'New Assignment',
      description: 'Descriere test',
      deadline: '2025-07-30T12:00:00Z',
      course_id: 'course-101',
      file: undefined
    };

    const action = AssignmentActions.addAssignmentSuccess({ assignment: addedAssignment });
    const state = assignmentReducer(previousState, action);

    expect(state.assignments.length).toBe(1);
    expect(state.assignments[0]).toEqual(addedAssignment);

    expect(state.loading).toBeFalse();
    expect(state.error).toBeNull();
  });

  // Test 4: Verifică gestionarea acțiunii addAssignmentFailure
  it('should handle addAssignmentFailure action correctly', () => {
    const previousState: AssignmentState = {
      assignments: [],
      loading: true, 
      error: null
    };

    const mockError = { message: 'Failed to add assignment' };
    const action = AssignmentActions.addAssignmentFailure({ error: mockError });
    const state = assignmentReducer(previousState, action);

    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(mockError);

    expect(state.assignments).toEqual([]);
  });

  // Test 5: Verifică imutabilitatea stării
  it('should not mutate the original state object', () => {
    const initialCopy = { ...initialAssignmentState };
    const action = AssignmentActions.addAssignment({
      assignment: {
        title: 'Another Assignment',
        description: 'Test',
        deadline: '2025-08-01T00:00:00Z',
        course_id: 'course-102'
      }
    });
    assignmentReducer(initialAssignmentState, action);

    expect(initialAssignmentState).toEqual(initialCopy);
  });
});