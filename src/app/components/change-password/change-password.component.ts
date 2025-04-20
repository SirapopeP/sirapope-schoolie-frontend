// src/app/components/change-password/change-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../alert/alert.component';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent]
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  private apiUrl = 'http://localhost:3000';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private alertService: AlertService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Check if this is first login
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.isFirstLogin) {
      this.alertService.showAlert({
        type: 'info',
        message: 'Please change your password for security reasons'
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      
      this.http.post(`${this.apiUrl}/auth/change-password`, {
        currentPassword,
        newPassword
      }).subscribe({
        next: () => {
          this.alertService.showAlert({
            type: 'success',
            message: 'Password changed successfully'
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          let message = 'Failed to change password';
          if (error.status === 401) {
            message = 'Current password is incorrect';
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