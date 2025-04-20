import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  private apiUrl = 'http://localhost:3000';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.formBuilder.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { usernameOrEmail, password, rememberMe } = this.loginForm.value;
      
      // Send login request
      this.http.post(`${this.apiUrl}/auth/login`, { usernameOrEmail, password })
        .subscribe({
          next: (response: any) => {
            // Store user data and token
            const userData = {
              user: response.user,
              token: response.access_token
            };
            
            if (rememberMe) {
              localStorage.setItem('user', JSON.stringify(userData));
            } else {
              sessionStorage.setItem('user', JSON.stringify(userData));
            }
            
            // Navigate to dashboard
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error('Login failed:', error);
            // Handle error (show error message to user)
          }
        });
    }
  }
} 