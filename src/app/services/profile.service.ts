import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { environment } from '@env';
import { UserProfile } from '../models/user.model';
import { UserProfileService } from './user-profile.service';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(
    private http: HttpClient,
    private userProfileService: UserProfileService,
    private authService: AuthService
  ) {}

  /**
   * Creates HttpHeaders with authorization token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': authToken
    });
  }

  /**
   * Get the user profile for a specific user ID
   */
  getUserProfile(userId: string): Observable<UserProfile> {
    console.log(`Fetching profile for user ${userId}`);
    const headers = this.getAuthHeaders();
    
    return this.http.get<UserProfile>(
      `${environment.apiUrl}/user-profiles/user/${userId}`, 
      { headers }
    ).pipe(
      tap(response => console.log('Profile fetch response:', response)),
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Create a new user profile
   */
  createProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
    console.log('Creating profile with data:', profileData);
    const headers = this.getAuthHeaders();
    
    return this.http.post<UserProfile>(
      `${environment.apiUrl}/user-profiles`, 
      profileData,
      { headers }
    ).pipe(
      tap(response => console.log('Profile creation response:', response)),
      catchError(error => {
        console.error('Error creating profile:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Update an existing user profile
   */
  updateProfile(userId: string, profileData: Partial<UserProfile>): Observable<UserProfile> {
    console.log(`Updating profile for user ${userId} with data:`, profileData);
    const headers = this.getAuthHeaders();
    
    return this.http.put<UserProfile>(
      `${environment.apiUrl}/user-profiles/user/${userId}`, 
      profileData,
      { headers }
    ).pipe(
      tap(response => console.log('Profile update response:', response)),
      catchError(error => {
        console.error('Error updating profile:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Upload a user avatar
   */
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
    });
    
    return this.http.post<{ avatarUrl: string }>(
      `${environment.apiUrl}/user-profiles/avatar`, 
      formData,
      { headers }
    );
  }
  
  /**
   * Load the current user's profile and update the user state
   */
  loadCurrentUserProfile(): Observable<UserProfile | null> {
    const currentUser = this.userProfileService.getUser();
    if (!currentUser) {
      return from(Promise.resolve(null));
    }
    
    return this.getUserProfile(currentUser.id).pipe(
      tap(profile => {
        // Update the global state with the fetched profile
        if (profile) {
          this.userProfileService.updateUser({ profile });
        }
      }),
      catchError(error => {
        console.error('Error loading user profile:', error);
        return from(Promise.resolve(null));
      })
    );
  }
  
  /**
   * Create a new profile for the current user
   */
  async createUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const user = this.userProfileService.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Ensure the userId is set
    const payload = {
      ...profileData,
      userId: user.id
    };
    
    try {
      console.log('Creating user profile with payload:', payload);
      const result = await firstValueFrom(this.createProfile(payload));
      
      // Update the global user profile state
      this.userProfileService.updateUser({ profile: result });
      return result;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Update the profile for the current user
   */
  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const user = this.userProfileService.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    try {
      console.log('Updating user profile for user ID:', user.id);
      console.log('Update payload:', profileData);
      
      // Convert observables to promises with firstValueFrom
      const result = await firstValueFrom(this.updateProfile(user.id, profileData));
      
      // Update the global user profile state
      this.userProfileService.updateProfile(result);
      return result;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Upload an avatar for the current user
   */
  async uploadUserAvatar(file: File): Promise<string> {
    try {
      const result = await firstValueFrom(this.uploadAvatar(file));
      // Update just the avatar URL in the global state
      this.userProfileService.updateProfile({ avatarUrl: result.avatarUrl });
      return result.avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }
}

// Helper function to replace deprecated toPromise()
function firstValueFrom<T>(source: Observable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const subscription = source.subscribe({
      next: value => {
        resolve(value);
        subscription.unsubscribe();
      },
      error: err => {
        reject(err);
        subscription.unsubscribe();
      },
      complete: () => subscription.unsubscribe()
    });
  });
} 