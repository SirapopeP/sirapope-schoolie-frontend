import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();
  private DEBUG = false; // เปิดปิดการแสดง debug log

  private USER_STORAGE_KEY = 'schoolie_user';

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem(this.USER_STORAGE_KEY);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        this.userSubject.next(parsedUser);
      } else {
        // Also check in other storage locations (keys used by login component)
        const localUser = localStorage.getItem('user');
        const sessionUser = sessionStorage.getItem('user');
        
        if (localUser) {
          const userData = JSON.parse(localUser);
          this.userSubject.next(userData);
          localStorage.setItem(this.USER_STORAGE_KEY, localUser); // Also save in our key
        } else if (sessionUser) {
          const userData = JSON.parse(sessionUser);
          this.userSubject.next(userData);
          localStorage.setItem(this.USER_STORAGE_KEY, sessionUser); // Also save in our key
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem(this.USER_STORAGE_KEY);
    }
  }

  setUser(user: User): void {
    if (!user) {
      if (this.DEBUG) console.warn('Attempted to set null/undefined user');
      return;
    }
    
    // Deep clone to avoid reference issues
    const userToStore = JSON.parse(JSON.stringify(user));
    
    this.userSubject.next(userToStore);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(userToStore));
  }

  updateUser(userData: Partial<User>): void {
    const currentUser = this.userSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      this.userSubject.next(updatedUser);
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  }

  updateProfile(profileData: Partial<UserProfile>): void {
    const currentUser = this.userSubject.value;
    if (currentUser && currentUser.profile) {
      const updatedProfile = { ...currentUser.profile, ...profileData };
      const updatedUser = { ...currentUser, profile: updatedProfile };
      this.userSubject.next(updatedUser);
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  getUserProfile(): UserProfile | null {
    return this.userSubject.value?.profile || null;
  }

  getRoles(): string[] {
    return this.userSubject.value?.roles || [];
  }

  hasRole(role: string): boolean {
    return this.userSubject.value?.roles.includes(role) || false;
  }

  clearUser(): void {
    this.userSubject.next(null);
    localStorage.removeItem(this.USER_STORAGE_KEY);
  }
  
  // เปิดหรือปิดการแสดงผล debug log
  setDebugMode(enable: boolean): void {
    this.DEBUG = enable;
  }
} 