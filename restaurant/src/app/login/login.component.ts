import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../shared/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login({
      email: this.f['email'].value,
      password: this.f['password'].value
    })
    .pipe(first())
    .subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: error => {
        if (error.error && typeof error.error === 'object') {
          if (error.error.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Login failed. Please check the information you entered..';
          }
        } else if (typeof error.error === 'string') {
          this.error = error.error;
        } else {
          this.error = 'An error occurred while logging in. Please try again..';
        }
        
        this.loading = false;
      }
    });
  }
}