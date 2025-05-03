import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfileService } from './user-profile.service';

@Injectable({
  providedIn: 'root'
})
export class RoleRedirectService {
  constructor(
    private router: Router,
    private userProfileService: UserProfileService
  ) {}

  /**
   * Redirects user to appropriate home page based on their role
   * @returns Promise that resolves when redirect is complete
   */
  redirectBasedOnRole(): Promise<boolean> {
    const user = this.userProfileService.getUser();
    
    if (!user || !user.roles || user.roles.length === 0) {
      return this.router.navigate(['/dashboard/home-guest']);
    }

    const roles = user.roles;
    
    if (roles.includes('ACADEMY_OWNER')) {
      return this.router.navigate(['/dashboard/home']);
    } else if (roles.includes('TEACHER')) {
      return this.router.navigate(['/dashboard/home-teacher']);
    } else if (roles.includes('STUDENT')) {
      return this.router.navigate(['/dashboard/home-student']);
    } else {
      return this.router.navigate(['/dashboard/home-guest']);
    }
  }
} 