import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../alert/alert.component';
import { ParticlesComponent } from '../particles/particles.component';
import { AlertModalComponent } from '../shared/alert-modal/alert-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

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
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  animationType = 'slide-up'; // Default animation

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(MatDialog) private dialog: MatDialog
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

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const formData = this.registerForm.value;
      
      // Remove confirmPassword from the payload
      const { confirmPassword, ...payload } = formData;

      this.http.post('http://localhost:3000/auth/register', payload)
        .pipe(
          catchError(error => {
            console.error('Registration error:', error);
            // Show error alert
            this.dialog.open(AlertModalComponent, {
              width: '400px',
              data: {
                title: 'Error',
                message: error.error.message || 'Registration failed. Please try again.',
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