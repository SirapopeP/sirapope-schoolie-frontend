import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '@env';
import { UserProfile } from '../models/user.model';
import { UserProfileService } from './user-profile.service';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(
    private http: HttpClient,
    private userProfileService: UserProfileService
  ) {}

  /**
   * Get the user profile for a specific user ID
   */
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/user-profiles/user/${userId}`);
  }
  
  /**
   * Create a new user profile
   */
  createProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${environment.apiUrl}/user-profiles`, profileData);
  }
  
  /**
   * Update an existing user profile
   */
  updateProfile(userId: string, profileData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${environment.apiUrl}/user-profiles/user/${userId}`, profileData);
  }
  
  /**
   * Upload a user avatar
   */
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post<{ avatarUrl: string }>(`${environment.apiUrl}/user-profiles/avatar`, formData);
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
      const result = await this.createProfile(payload).toPromise();
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
      const result = await this.updateProfile(user.id, profileData).toPromise();
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
      const result = await this.uploadAvatar(file).toPromise();
      // Update just the avatar URL in the global state
      this.userProfileService.updateProfile({ avatarUrl: result.avatarUrl });
      return result.avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }
} 