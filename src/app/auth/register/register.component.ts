import { Component, viewChild } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationComponent } from '../../core/notification/notification.component';
import { SpinnerService } from '../../core/services/spinner.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  refName = viewChild<NgModel>('userName');
  refEmail = viewChild<NgModel>('userEmail');
  refRole = viewChild<NgModel>('userRole');
  refPassword = viewChild<NgModel>('userPassword');

  email = '';
  password = '';
  confirmPassword = '';
  name = '';
  role = '';
  isAuthenticated = false;
  isFormValid = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: SpinnerService
  ) {}

  ngOnInit() {
    this.authService.user.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }

  onSubmit(form: NgForm) {
    this.spinner.show();

    console.log(this.isFormValid);
    if (!this.isFormValid) {
      NotificationComponent.show(
        'alert',
        'Fields must be valid before submitting!'
      );
      return;
    } else if (this.password !== this.confirmPassword) {
      NotificationComponent.show('alert', 'Passwords do not match!');
      return;
    }

    this.authService
      .signup(this.email, this.password, this.name, this.role)
      .subscribe({
        next: () => {
          this.spinner.hide();
          form.reset();
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
          this.name = '';
          this.role = '';
          this.navigateTo('/login');
          NotificationComponent.show(
            'success',
            'Account created! Please log in.'
          );
        },
        error: (err) => {
          NotificationComponent.show(
            'alert',
            'Failed to register: + ${err.message}'
          );
        },
      });
  }

  validateForm(typeToValidate: string): boolean {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    const passwordValid = this.password.length >= 6;
    const nameValid = /^[A-Za-z\s]+$/.test(this.name);
    const roleValid = this.role !== '';
    const confirmMatch = this.password === this.confirmPassword;

    this.isFormValid =
      emailValid && passwordValid && nameValid && roleValid && confirmMatch;

    switch (typeToValidate) {
      case 'name':
        return nameValid;
      case 'email':
        return emailValid;
      case 'role':
        return roleValid;
      case 'password':
        return passwordValid;
      case 'confirmPassword': {
        if (this.password === '') return false;
        return confirmMatch;
      }
      default:
        return true;
    }
  }

  setPrevElAsTouched(currentEl: string) {
    switch (currentEl) {
      case 'email': {
        this.refName()?.control.markAsTouched();
        break;
      }
      case 'role': {
        this.refName()?.control.markAsTouched();
        this.refEmail()?.control.markAsTouched();
        break;
      }
      case 'password': {
        this.refName()?.control.markAsTouched();
        this.refEmail()?.control.markAsTouched();
        this.refRole()?.control.markAsTouched();
        break;
      }
      case 'confirmPassword': {
        this.refName()?.control.markAsTouched();
        this.refEmail()?.control.markAsTouched();
        this.refRole()?.control.markAsTouched();
        this.refPassword()?.control.markAsTouched();
        break;
      }
      default:
        break;
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
