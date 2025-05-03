import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';
import { LoadingService } from '../../services/loading.service';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../alert/alert.component';
import { ParticlesComponent } from '../particles/particles.component';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent, ParticlesComponent]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  private apiUrl = 'http://localhost:3000';
  animationType = 'slide-up'; // Default animation
  isDarkMode = false;
  private themeSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private alertService: AlertService,
    private loadingService: LoadingService,
    public themeService: ThemeService,
    private userProfileService: UserProfileService
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check query params first
    this.route.queryParams.subscribe(params => {
      if (params['animation'] === 'down') {
        this.animationType = 'slide-down';
      }
    });

    // Check previous route to determine animation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const fromRegister = this.router.getCurrentNavigation()?.previousNavigation?.finalUrl?.toString().includes('register');
      const fromChangePassword = this.router.getCurrentNavigation()?.previousNavigation?.finalUrl?.toString().includes('change-password');
      
      if (fromRegister || fromChangePassword) {
        this.animationType = 'slide-down';
      }
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

  onLogin(): void {
    if (this.loginForm.valid) {
      const { usernameOrEmail, password, rememberMe } = this.loginForm.value;
      const headers = new HttpHeaders().set('Content-Type', 'application/json');

      // Show loading spinner
      this.loadingService.show();

      this.http.post<any>(
        `${this.apiUrl}/auth/login`, 
        { usernameOrEmail, password },
        { headers }
      ).subscribe({
        next: (response) => {
          console.log('Login successful, response:', response);
          
          // Store data in localStorage or sessionStorage based on remember me
          if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.access_token);
          } else {
            sessionStorage.setItem('user', JSON.stringify(response.user));
            sessionStorage.setItem('token', response.access_token);
          }
          
          // ALSO store in UserProfileService to make it available immediately
          this.userProfileService.setUser(response.user);
          console.log('User data stored in UserProfileService');
          
          // Hide loading spinner
          this.loadingService.hide();
          
          // Show success alert
          console.log('Showing success alert');
          this.alertService.showAlert({
            type: 'success',
            message: 'Login successful!'
          });
          
          // Delay navigation to allow alert to be visible
          console.log('Delaying navigation for 1.5 seconds to show alert');
          setTimeout(() => {
            console.log('Navigating to dashboard');
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          console.error('Login error:', error);
          
          // Hide loading spinner on error
          this.loadingService.hide();
          
          let message = 'Login failed';
          if (error.status === 401) {
            message = 'Invalid username or password';
          } else if (error.status === 404) {
            message = 'User not found';
          }
          
          // Show error alert
          console.log('Showing error alert');
          this.alertService.showAlert({
            type: 'error',
            message
          });
        }
      });
    }
  }
}