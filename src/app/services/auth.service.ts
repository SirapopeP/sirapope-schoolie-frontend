import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';
import { UserProfileService } from './user-profile.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'schoolie_token';
  private userKey = 'user'; // Key used in login component

  constructor(
    private http: HttpClient,
    private userProfileService: UserProfileService
  ) {
    // Try to load user data on service initialization
    this.loadUserData();
  }

  // Load user data from storage (either localStorage or sessionStorage)
  private loadUserData(): void {
    // Check if we have user data in localStorage or sessionStorage
    const localUser = localStorage.getItem(this.userKey);
    const sessionUser = sessionStorage.getItem(this.userKey);
    
    if (localUser) {
      console.log('Found user data in localStorage');
      try {
        const userData = JSON.parse(localUser);
        if (userData && userData.id) {
          console.log('Setting user data from localStorage');
          this.userProfileService.setUser(userData);
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage', e);
      }
    } else if (sessionUser) {
      console.log('Found user data in sessionStorage');
      try {
        const userData = JSON.parse(sessionUser);
        if (userData && userData.id) {
          console.log('Setting user data from sessionStorage');
          this.userProfileService.setUser(userData);
        }
      } catch (e) {
        console.error('Error parsing user data from sessionStorage', e);
      }
    } else {
      console.log('No user data found in storage');
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Store the token
          localStorage.setItem(this.tokenKey, response.access_token);
          
          // Store the user in the user profile service
          this.userProfileService.setUser(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.userKey);
    this.userProfileService.clearUser();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.userProfileService.getUser();
  }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, data);
  }
} 