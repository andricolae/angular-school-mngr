import { Component, inject, Input } from '@angular/core';

import { Store } from '@ngrx/store';

import * as UserActions from '../../../state/users/user.actions';

import { FormsModule } from '@angular/forms';
import { AdminDashService } from '../admin-dash.service';
import {
  FilterInputModel,
  SearchInputModel,
  SearchModel,
} from '../../../core/user.model';
import { FilterModel } from 'ag-grid-community';
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
  private userService = inject(UserManagementService);
  private courseService = inject(CourseManagementService);

  public selectedService:
    | UserManagementService
    | CourseManagementService
    | null = null;

  private searchChange$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit() {
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
    this.searchChange$
      .pipe(debounceTime(500)) // 0.5 seconds
      .subscribe(() => this.setFilters());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  applyFilter(filterCategory: string, name: string) {
    let updateFilter = {
      ...this.selectedService!.newFilter(),
    };
    updateFilter[filterCategory] = [...updateFilter[filterCategory], name];
    this.selectedService!.newFilter.set(updateFilter);
    this.selectedService!.appliedFilterCount.update((value) => value + 1);
    this.setFilters();
  }

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

  setFilters() {
    console.log('Here ');
    let filters = this.selectedService!.newFilter();
    let search = this.selectedService!.newSearch();
    this.store.dispatch(
      UserActions.loadFilteredUsersPage({
        filters,
        search,
        newFilter: true,
        direction: 'next',
      })
    );
    this.store.dispatch(
      UserActions.loadUsersMaxPageIndex({ filters: filters, search: search })
    );
    this.selectedService?.currentPageIndex.set(1);
  }

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

  setBackToNoFilters() {
    let filters = this.selectedService!.newFilter();
    let search = this.selectedService!.newSearch();
    this.store.dispatch(UserActions.loadUsersPage({ direction: 'next' }));
    this.store.dispatch(
      UserActions.loadUsersMaxPageIndex({ filters: filters, search: search })
    );
    this.selectedService?.currentPageIndex.set(1);
  }
  // ---------------USER LOGIC--------------------
}
