// src/app/components/change-password/change-password.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../alert/alert.component';
import { AlertService } from '../../services/alert.service';
import { ParticlesComponent } from '../particles/particles.component';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent, ParticlesComponent]
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  passwordForm: FormGroup;
  private apiUrl = 'http://localhost:3000';
  mode: 'forgot' | 'first-login' | 'normal' = 'normal';
  step: 'initiate' | 'confirm' = 'initiate';
  userId: number | null = null;
  token: string | null = null;
  emailOrUsername: string | null = null;
  isDarkMode = false;
  private themeSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    public themeService: ThemeService
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    if (this.step === 'initiate' && this.mode === 'forgot') {
      this.passwordForm = this.fb.group({
        emailOrUsername: ['', [Validators.required]]
      });
    } else {
      this.passwordForm = this.fb.group({
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      }, { validator: this.passwordMatchValidator });

      if (this.mode === 'normal') {
        this.passwordForm.addControl('currentPassword', this.fb.control('', [Validators.required]));
      }
    }
  }

  ngOnInit() {
    // Check the mode based on route or user state
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'forgot') {
        this.mode = 'forgot';
      } else {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.isFirstLogin) {
          this.mode = 'first-login';
          this.alertService.showAlert({
            type: 'info',
            message: 'Please change your password for security reasons'
          });
        }
      }
      this.initializeForm();
    });

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      if (this.mode === 'forgot' && this.step === 'initiate') {
        this.initiatePasswordReset();
      } else if (this.mode === 'forgot' && this.step === 'confirm') {
        this.confirmPasswordReset();
      } else if (this.mode === 'first-login' || this.mode === 'normal') {
        this.changePassword();
      }
    }
  }

  private initiatePasswordReset() {
    const { emailOrUsername } = this.passwordForm.value;
    this.http.post<any>(`${this.apiUrl}/users/password/initiate-change`, {
      emailOrUsername
    }).subscribe({
      next: (response) => {
        this.userId = response.userId;
        this.token = response.token;
        this.emailOrUsername = emailOrUsername;
        this.step = 'confirm';
        this.initializeForm();
        this.alertService.showAlert({
          type: 'success',
          message: 'Please enter your new password'
        });
      },
      error: (error) => {
        this.alertService.showAlert({
          type: 'error',
          message: error.error.message || 'User not found'
        });
      }
    });
  }

  private confirmPasswordReset() {
    const { newPassword } = this.passwordForm.value;
    this.http.post<any>(`${this.apiUrl}/users/password/confirm-change`, {
      userId: this.userId,
      token: this.token,
      newPassword
    }).subscribe({
      next: () => {
        this.alertService.showAlert({
          type: 'success',
          message: 'Password changed successfully'
        });
        this.router.navigate(['/login'], { 
          queryParams: { username: this.emailOrUsername }
        });
      },
      error: (error) => {
        this.alertService.showAlert({
          type: 'error',
          message: error.error.message || 'Failed to change password'
        });
      }
    });
  }

  private changePassword() {
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