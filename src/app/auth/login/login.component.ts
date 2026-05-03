import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username     = '';
  password     = '';
  rememberMe   = false;
  showPassword = false;
  isLoading    = false;
  loginSuccess = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter your username and password.';
      return;
    }

    this.isLoading = true;

    this.router.navigate(['/dashboard'])

    // this.authService.login(this.username.trim(), this.password).subscribe({
    //   next: (res) => {
    //     this.isLoading    = false;
    //     this.loginSuccess = true;
    //
    //     const storage = this.rememberMe ? localStorage : sessionStorage;
    //     storage.setItem('token', res.data.token);
    //
    //     setTimeout(() => this.router.navigate(['/dashboard']), 900);
    //   },
    //   error: (err) => {
    //     this.isLoading    = false;
    //     this.loginSuccess = false;
    //     this.errorMessage =
    //       err?.error?.message ?? 'Invalid credentials. Please try again.';
    //   }
    // });
  }

  loginWithSSO(): void {
    this.authService.loginWithSSO();
  }
}
