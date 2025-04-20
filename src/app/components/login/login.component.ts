import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent]
})
export class LoginComponent {
  loginForm: FormGroup;
  private apiUrl = 'http://localhost:3000';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { usernameOrEmail, password, rememberMe } = this.loginForm.value;

      // ส่งแค่ Content-Type header เท่านั้น
      const headers = new HttpHeaders().set('Content-Type', 'application/json');

      this.http.post<any>(
        `${this.apiUrl}/auth/login`, 
        { usernameOrEmail, password },
        { headers }
      ).subscribe({
        next: (response) => {
          this.alertService.showAlert({
            type: 'success',
            message: 'Login successful!'
          });
          
          if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.access_token);
          } else {
            sessionStorage.setItem('user', JSON.stringify(response.user));
            sessionStorage.setItem('token', response.access_token);
          }

           // ถ้าเป็นการ login ครั้งแรก ให้ไปหน้าเปลี่ยนรหัสผ่าน
           if (response.user.isFirstLogin) {
            this.router.navigate(['/change-password']);
          } else {
            this.router.navigate(['/dashboard']);
          }
          
        },
        error: (error) => {
          let message = 'Login failed';
          if (error.status === 401) {
            message = 'Invalid username or password';
          } else if (error.status === 404) {
            message = 'User not found';
          }
          this.alertService.showAlert({
            type: 'error',
            message
          });
        }
      });
    }
  }
}