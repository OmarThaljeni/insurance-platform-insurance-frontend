import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username = '';
  password = '';

  rememberMe = false;
  showPassword = false;

  isLoading = false;
  loginSuccess = false;

  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // =========================
  // TOGGLE PASSWORD
  // =========================
  togglePassword(): void {

    this.showPassword = !this.showPassword;
  }

  // =========================
  // LOGIN
  // =========================
  login(): void {

    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter your username and password.';
      return;
    }

    this.isLoading = true;

    this.authService.login(
      this.username.trim(),
      this.password.trim()
    ).subscribe({

      next: (response) => {

        this.isLoading = false;
        this.loginSuccess = true;

        // Save JWT + user info
        localStorage.setItem(
          'accessToken',
          response.accessToken
        );

        localStorage.setItem(
          'tokenType',
          response.tokenType
        );

        localStorage.setItem(
          'idUser',
          response.idUser
        );

        localStorage.setItem(
          'username',
          response.username
        );

        localStorage.setItem(
          'email',
          response.email
        );

        localStorage.setItem(
          'username',
          response.username
        );

        localStorage.setItem(
          'role',
          response.role
        );


        setTimeout(() => {

          this.router.navigate(['/dashboard']);

        }, 800);
      },


      error: (err) => {

        this.isLoading = false;
        this.loginSuccess = false;

        this.errorMessage =
          err?.error?.message ||
          'Invalid credentials. Please try again.';
      }
    });
  }

  // =========================
// SSO LOGIN
// =========================
  loginWithSSO(): void {

    this.errorMessage =
      'SSO authentication is currently unavailable.';
  }

}
