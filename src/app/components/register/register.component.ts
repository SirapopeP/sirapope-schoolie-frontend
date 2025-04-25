import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../alert/alert.component';
import { ParticlesComponent } from '../particles/particles.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent, ParticlesComponent]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
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
            alert(error.error.message || 'Registration failed. Please try again.');
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe(response => {
          if (response) {
            // Show success alert
            alert('Registration successful! Please login to continue.');
            this.router.navigate(['/login']);
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
}