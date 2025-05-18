import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { Observable, tap, of } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';
import { UserProfileService } from './user-profile.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'schoolie_token';
  private legacyTokenKey = 'token'; // For backward compatibility
  private userKey = 'user'; // Key used in login component
  private schoolieUserKey = 'schoolie_user';
  private tokenValidity = 24 * 60 * 60 * 1000; // token validity in milliseconds (24 hours)
  private tokenRefreshTime = 23 * 60 * 60 * 1000; // when to refresh token (23 hours)
  private tokenTimeKey = 'token_timestamp';

  constructor(
    private http: HttpClient,
    private userProfileService: UserProfileService
  ) {
    // Try to load user data on service initialization
    this.loadUserData();
    // Check token validity
    this.checkAndRefreshToken();
    // Synchronize tokens if they exist in different places
    this.syncTokens();
  }

  // Synchronize tokens between different storage keys
  private syncTokens(): void {
    const schoolieToken = localStorage.getItem(this.tokenKey);
    const legacyToken = localStorage.getItem(this.legacyTokenKey);

    if (schoolieToken && !legacyToken) {
      console.log('Syncing token from schoolie_token to token');
      localStorage.setItem(this.legacyTokenKey, schoolieToken);
    } else if (!schoolieToken && legacyToken) {
      console.log('Syncing token from token to schoolie_token');
      localStorage.setItem(this.tokenKey, legacyToken);
    }
  }

  // Load user data from storage (either localStorage or sessionStorage)
  private loadUserData(): void {
    // Check if we have user data in localStorage or sessionStorage
    const localUser = localStorage.getItem(this.userKey);
    const sessionUser = sessionStorage.getItem(this.userKey);
    const schoolieUser = localStorage.getItem(this.schoolieUserKey);
    
    if (schoolieUser) {
      console.log('Found user data in schoolie_user');
      try {
        const userData = JSON.parse(schoolieUser);
        if (userData && userData.id) {
          console.log('Setting user data from schoolie_user');
          this.userProfileService.setUser(userData);
        }
      } catch (e) {
        console.error('Error parsing user data from schoolie_user', e);
      }
    } else if (localUser) {
      console.log('Found user data in localStorage');
      try {
        const userData = JSON.parse(localUser);
        if (userData && userData.id) {
          console.log('Setting user data from localStorage');
          this.userProfileService.setUser(userData);
          // Also save to schoolie_user for consistency
          localStorage.setItem(this.schoolieUserKey, localUser);
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
          // Also save to localStorage for persistence
          localStorage.setItem(this.userKey, sessionUser);
          localStorage.setItem(this.schoolieUserKey, sessionUser);
        }
      } catch (e) {
        console.error('Error parsing user data from sessionStorage', e);
      }
    } else {
      console.log('No user data found in storage');
    }
  }

  // Check token validity and refresh if needed
  private checkAndRefreshToken(): void {
    const token = this.getToken();
    if (!token) return;

    const timestamp = localStorage.getItem(this.tokenTimeKey);
    if (!timestamp) {
      // No timestamp found, set current time
      localStorage.setItem(this.tokenTimeKey, Date.now().toString());
      return;
    }

    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    const elapsed = now - tokenTime;

    if (elapsed > this.tokenValidity) {
      // Token expired, clear it
      console.log('Token expired, clearing session');
      this.logout();
    } else if (elapsed > this.tokenRefreshTime) {
      // Token needs refreshing
      console.log('Token needs refreshing');
      this.refreshToken(token);
    }
  }

  // Refresh the token
  private refreshToken(currentToken: string): void {
    // Here you would typically call your API to refresh the token
    // For now, we'll just update the timestamp since our API might not support token refresh
    console.log('Would refresh token with API if available');
    localStorage.setItem(this.tokenTimeKey, Date.now().toString());
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Store the token in both places for compatibility
          localStorage.setItem(this.tokenKey, response.access_token);
          localStorage.setItem(this.legacyTokenKey, response.access_token);
          
          // Store token timestamp
          localStorage.setItem(this.tokenTimeKey, Date.now().toString());
          
          // Store the user in the user profile service
          this.userProfileService.setUser(response.user);

          // Store user in both localStorage and sessionStorage for better persistence
          const userJson = JSON.stringify(response.user);
          localStorage.setItem(this.userKey, userJson);
          localStorage.setItem(this.schoolieUserKey, userJson);
          sessionStorage.setItem(this.userKey, userJson);
        })
      );
  }

  logout(): void {
    // Clear all authentication data
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.legacyTokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.schoolieUserKey);
    localStorage.removeItem(this.tokenTimeKey);
    sessionStorage.removeItem(this.userKey);
    this.userProfileService.clearUser();
  }

  getToken(): string | null {
    // Try both token locations
    let token = localStorage.getItem(this.tokenKey);
    
    // If not found in primary location, try legacy location
    if (!token) {
      token = localStorage.getItem(this.legacyTokenKey);
      
      // If found in legacy location, store it in primary location for future use
      if (token) {
        localStorage.setItem(this.tokenKey, token);
        console.log(`Token found in legacy storage (${this.legacyTokenKey}), copied to primary storage (${this.tokenKey})`);
      }
    }
    
    // ตรวจสอบว่ามี token หรือไม่
    if (!token) {
      console.warn('No authentication token found in localStorage');
      return null;
    }
    
    // ตรวจสอบว่าเป็น mock token หรือไม่
    if (token.startsWith('mock_token_')) {
      console.warn('Found a mock token in localStorage - this will not work with the real API');
      // ลบ mock token ออกจาก localStorage
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.legacyTokenKey);
      return null;
    }
    
    return token;
  }

  // Public method สำหรับตรวจสอบและรีเฟรช token
  refreshTokenIfNeeded(): void {
    this.checkAndRefreshToken();
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token has timestamp and is still valid
    const timestamp = localStorage.getItem(this.tokenTimeKey);
    if (!timestamp) {
      // No timestamp, set it now
      localStorage.setItem(this.tokenTimeKey, Date.now().toString());
      return true;
    }
    
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    return (now - tokenTime) < this.tokenValidity;
  }

  getCurrentUser(): User | null {
    return this.userProfileService.getUser();
  }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, data);
  }
} 