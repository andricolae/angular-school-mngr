import { Component, inject, Input } from '@angular/core';

import { Store } from '@ngrx/store';

import * as UserActions from '../../../state/users/user.actions';

import { FormsModule } from '@angular/forms';
import { AdminDashService } from '../admin-dash.service';

@Component({
  selector: 'app-filters',
  imports: [FormsModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css',
})
export class FiltersComponent {
  @Input({ required: true }) filterFor!: 'user' | 'course';
  // @Input({ required: true }) filterInput!: {};
  testing = '';

  AdminService = inject(AdminDashService);

  // filterInput = this.filterFor === 'user' ? UserFilterInput : UserFilterInput;

  // onChangeFilter($event: Event & { target: HTMLInputElement })

  constructor(private store: Store) {}

  testClick() {
    console.log(this.AdminService.newUserFilterInput().categoryOfFilters);
  }

  onChangeSearch() {
    console.log(this.AdminService.newUserSearch()['fullName']);
  }

  onChangeFilter($event: Event, filterCategory: string) {
    const target = $event.target as HTMLInputElement;
    const id = Number(target.value);
    const isChecked = target.checked;
    console.log(this.AdminService.newUserFilterInput().filters);
    console.log(filterCategory);

    if (this.filterFor === 'user') {
      this.AdminService.newUserFilterInput().filters[filterCategory] =
        this.AdminService.newUserFilterInput().filters[filterCategory].map(
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
  }

  applyFilter(filterCategory: string, name: string) {
    let updateFilter = {
      ...this.AdminService.newUserFilter(),
    };
    updateFilter[filterCategory] = [...updateFilter[filterCategory], name];
    this.AdminService.newUserFilter.set(updateFilter);
    this.AdminService.userAppliedFilterCount.update((value) => value + 1);
    this.setFilters();
  }

  removeFilter(filterCategory: string, name: string) {
    let updateFilter = {
      ...this.AdminService.newUserFilter(),
    };
    updateFilter[filterCategory] = updateFilter[filterCategory]!.filter(
      (n) => n !== name
    );

    this.AdminService.newUserFilter.set(updateFilter);

    this.AdminService.userAppliedFilterCount.update((value) => value - 1);
    this.AdminService.userAppliedFilterCount() === 0
      ? this.setBackToNoFilters()
      : this.setFilters();
  }

  setFilters() {
    console.log('Here we send to the endpoint');
    let filters = this.AdminService.newUserFilter();
    let search = this.AdminService.newUserSearch();
    this.store.dispatch(
      UserActions.loadFilteredUsersPage({
        filters,
        search,
        newFilter: true,
        direction: 'next',
      })
    );
  }

  setBackToNoFilters() {
    this.store.dispatch(UserActions.loadUsersPage({ direction: 'next' }));
  }
  // ---------------USER LOGIC--------------------
}
