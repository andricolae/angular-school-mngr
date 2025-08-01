import { Component, inject, Input } from '@angular/core';

import { Store } from '@ngrx/store';

import * as UserActions from '../../../state/users/user.actions';
import * as CourseActions from '../../../state/courses/course.actions';

import { FormsModule } from '@angular/forms';
import { AdminDashService } from '../admin-dash.service';
import { debounceTime, Subject } from 'rxjs';
import { UserManagementService } from '../user-management/user-management.service';
import { CourseManagementService } from '../course-management/course-management.service';

@Component({
  selector: 'app-filters',
  imports: [FormsModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css',
})
export class FiltersComponent {
  @Input({ required: true }) filterFor!: 'user' | 'course';

  AdminService = inject(AdminDashService);
  //inject the services that could be used
  private userService = inject(UserManagementService);
  private courseService = inject(CourseManagementService);

  //the types of services that could be injected
  public selectedService:
    | UserManagementService
    | CourseManagementService
    | null = null;

  //used for the search input binding
  private searchChange$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit() {
    //injected the corresponding service
    switch (this.filterFor) {
      case 'user':
        this.selectedService = this.userService;
        break;
      case 'course':
        this.selectedService = this.courseService;
        break;
      default:
        break;
    }
    //when typing in the search input, wait 0.5 seconds after it stops typing to bring the new data
    this.searchChange$
      .pipe(debounceTime(500))
      .subscribe(() => this.setFilters());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //when a checkbox select status changes
  onChangeFilter($event: Event, filterCategory: string) {
    const target = $event.target as HTMLInputElement;
    const id = Number(target.value);
    const isChecked = target.checked;
    console.log(this.selectedService!.newFilterInput().filters);
    console.log(filterCategory);

    this.selectedService!.newFilterInput().filters[filterCategory] =
      this.selectedService!.newFilterInput().filters[filterCategory].map(
        (c) => {
          if (c.id === id) {
            c.selected = isChecked;
            isChecked
              ? this.applyFilter(filterCategory, c.name)
              : this.removeFilter(filterCategory, c.name);
            return c;
          }
          return c;
        }
      );
  }

  //adding the selected filter to the filter array, incrementing the counter and retrieving the data
  applyFilter(filterCategory: string, name: string) {
    let updateFilter = {
      ...this.selectedService!.newFilter(),
    };
    updateFilter[filterCategory] = [...updateFilter[filterCategory], name];
    this.selectedService!.newFilter.set(updateFilter);
    this.selectedService!.appliedFilterCount.update((value) => value + 1);
    this.setFilters();
  }

  //removing the selected filter from the filter array, decrementing the counter and retrieving the data
  //if no more applied filters or searched bring the original page data
  removeFilter(filterCategory: string, name: string) {
    let updateFilter = {
      ...this.selectedService!.newFilter(),
    };
    updateFilter[filterCategory] = updateFilter[filterCategory]!.filter(
      (n) => n !== name
    );

    this.selectedService!.newFilter.set(updateFilter);

    this.selectedService!.appliedFilterCount.update((value) => value - 1);
    this.selectedService!.appliedFilterCount() === 0 &&
    this.selectedService!.appliedSearchCount() === 0
      ? this.setBackToNoFilters()
      : this.setFilters();
  }

  //sending to the cliend-side firebase, based on the filterFor input and reseting the index
  setFilters() {
    console.log('Here ');
    let filters = this.selectedService!.newFilter();
    let search = this.selectedService!.newSearch();
    if (this.filterFor === 'user') {
      this.store.dispatch(
        UserActions.loadFilteredUsersPage({
          filters,
          search,
          newFilter: true,
          direction: 'next',
        })
      );
      //also getting the new maxPageIndex based on the new data
      this.store.dispatch(
        UserActions.loadUsersMaxPageIndex({ filters: filters, search: search })
      );
    } else {
      this.store.dispatch(
        CourseActions.loadFilteredCoursesPage({
          filters,
          search,
          newFilter: true,
          direction: 'next',
        })
      );
      this.store.dispatch(
        CourseActions.loadCoursesMaxPageIndex({
          filters: filters,
          search: search,
        })
      );
    }
    this.selectedService?.currentPageIndex.set(1);
  }

  //updating the search input and setting to empty the other fields, that are not the current one
  updateSearch(field: string, $event: Event) {
    const target = $event.target as HTMLInputElement;
    const newValue = target.value;

    this.selectedService!.newSearch.update((current) => {
      const resetSearch = Object.keys(current).reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {} as Record<string, string>);

      return {
        ...resetSearch,
        [field]: newValue,
      };
    });
    this.updateSearchCount();
    this.searchChange$.next();
  }

  //updating the count based on the search input
  updateSearchCount() {
    let count = 0;
    this.selectedService!.newSearchInput().categoryOfSearchers.forEach(
      (category) => {
        if (this.selectedService!.newSearch()[category].length > 0) {
          count++;
        }
      }
    );
    this.selectedService!.appliedSearchCount.set(count);
  }

  //setting to no filter data and reseting the current index to one
  setBackToNoFilters() {
    let filters = this.selectedService!.newFilter();
    let search = this.selectedService!.newSearch();
    if (this.filterFor === 'user') {
      this.store.dispatch(CourseActions.loadCoursesPage({ direction: 'next' }));
      this.store.dispatch(
        CourseActions.loadCoursesMaxPageIndex({
          filters: filters,
          search: search,
        })
      );
    }
    this.selectedService?.currentPageIndex.set(1);
  }
  // ---------------USER LOGIC--------------------
}
