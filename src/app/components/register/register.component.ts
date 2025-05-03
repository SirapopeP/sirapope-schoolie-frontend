import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../alert/alert.component';
import { ParticlesComponent } from '../particles/particles.component';
import { AlertModalComponent } from '../shared/alert-modal/alert-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { ThemeService } from '../../services/theme.service';
import { environment } from '@env';

interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  [key: string]: any;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    AlertComponent,
    ParticlesComponent,
    AlertModalComponent,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule
  ]
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  isLoading = false;
  animationType = 'slide-up'; // Default animation
  isDarkMode = false;
  private themeSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(MatDialog) private dialog: MatDialog,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    // Check queryParams for animation type
    this.route.queryParams.subscribe(params => {
      if (params['animation'] === 'up') {
        this.animationType = 'slide-up';
      } else if (params['animation'] === 'down') {
        this.animationType = 'slide-down';
      }
    });

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required]],
      nickName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const formData = this.registerForm.value;
      
      // ปรับโครงสร้าง payload ตามที่ API ต้องการ
      const { confirmPassword, ...formValues } = formData;
      
      // แปลงจาก name เป็น fullName ตามที่ API ต้องการ
      const payload = {
        email: formValues.email,
        username: formValues.username,
        password: formValues.password,
        fullName: formValues.name, // ใช้ name เป็น fullName
        nickName: formValues.nickName
      };

      // ส่ง request ลงทะเบียน
      this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, payload)
        .pipe(
          catchError(error => {
            console.error('Registration error:', error);
            // แสดงข้อความ error ที่เจาะจงมากขึ้น
            let errorMessage = 'Registration failed. Please try again.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.status === 404) {
              errorMessage = 'API endpoint not found. Please check server configuration.';
            }
            
            this.dialog.open(AlertModalComponent, {
              width: '400px',
              data: {
                title: 'Error',
                message: errorMessage,
                type: 'error'
              },
              disableClose: false
            });
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe(response => {
          if (response) {
            const dialogRef = this.dialog.open(AlertModalComponent, {
              width: '400px',
              data: {
                title: 'Success',
                message: 'Registration successful! Please login to continue.',
                type: 'success'
              },
              disableClose: false
            });

            dialogRef.afterClosed().subscribe(() => {
              // Always navigate to login page when the dialog closes
              this.router.navigate(['/login'], { queryParams: { animation: 'down' } });
            });
          }
        });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control.markAsTouched();
      });
    }
  }

  onAlertConfirmed(): void {
    // Handle alert confirmation
    console.log('Alert confirmed');
  }
}