import { Component, inject, Input } from '@angular/core';

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

  AdminService = inject(AdminDashService);

  // filterInput = this.filterFor === 'user' ? UserFilterInput : UserFilterInput;

  // onChangeFilter($event: Event & { target: HTMLInputElement })

  testClick() {
    console.log(this.AdminService.newUserFilterInput().categoryOfFilters);
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
    console.log(this.AdminService.newUserFilter()[filterCategory]);
  }

  removeFilter(filterCategory: string, name: string) {
    let updateFilter = {
      ...this.AdminService.newUserFilter(),
    };
    updateFilter[filterCategory] = updateFilter[filterCategory]!.filter(
      (n) => n !== name
    );

    this.AdminService.newUserFilter.set(updateFilter);

    console.log('remove');
    console.log(this.AdminService.newUserFilter()[filterCategory]);
  }
  // ---------------USER LOGIC--------------------
}
