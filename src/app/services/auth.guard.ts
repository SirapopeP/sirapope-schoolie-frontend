import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserProfileService } from './user-profile.service';
import { MenuPermissionService } from './menu-permission.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private userProfileService: UserProfileService,
    private menuPermissionService: MenuPermissionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Checking route access for:', state.url);
    
    const currentUser = this.userProfileService.getUser();
    
    if (!currentUser) {
      console.log('No authenticated user found, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    // If this is just the dashboard base route, allow access
    if (state.url === '/dashboard' || state.url === '/dashboard/') {
      return true;
    }

    // Extract the menu ID from the URL
    const url = state.url;
    const parts = url.split('/');
    let menuId = '';
    
    // URL format should be /dashboard/menuId or /dashboard/menuId/...
    if (parts.length >= 3) {
      // Get the base menu ID (e.g., 'home-teacher' -> 'home')
      const routePart = parts[2];
      menuId = routePart.split('-')[0];
    }
    
    console.log('Checking access for menu ID:', menuId);
    
    // If no menu ID was found or it's empty, allow access
    if (!menuId) {
      return true;
    }
    
    // Check if user has permission to access this menu
    const userRoles = currentUser.roles || [];
    console.log('User roles:', userRoles);
    
    // For debugging only - temporarily allow all access
    // Remove for production
    console.log('⚠️ DEBUG MODE: Allowing all route access');
    return true;
    
    /*
    const canAccess = this.menuPermissionService.canAccessMenu(menuId, userRoles);
    console.log(`Can access menu ${menuId}?`, canAccess);

    if (!canAccess) {
      // User doesn't have required permission, redirect to appropriate home
      this.redirectBasedOnRole(userRoles);
      return false;
    }
    
    return true;
    */
  }
  
  // Redirect user based on their role
  private redirectBasedOnRole(roles: string[]): void {
    if (roles.includes('ACADEMY_OWNER') || roles.includes('ADMIN')) {
      this.router.navigate(['/dashboard/home']);
    } else if (roles.includes('TEACHER')) {
      this.router.navigate(['/dashboard/home-teacher']);
    } else if (roles.includes('STUDENT')) {
      this.router.navigate(['/dashboard/home-student']);
    } else {
      this.router.navigate(['/dashboard/home-guest']);
    }
  }
} 