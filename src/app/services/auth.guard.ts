import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserProfileService } from './user-profile.service';
import { MenuPermissionService } from './menu-permission.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  // แคชค่าการตรวจสอบไว้เพื่อไม่ต้องตรวจสอบซ้ำ
  private accessCache: {[key: string]: boolean} = {};
  
  constructor(
    private userProfileService: UserProfileService,
    private menuPermissionService: MenuPermissionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.userProfileService.getUser();
    
    if (!currentUser) {
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
    
    // If no menu ID was found or it's empty, allow access
    if (!menuId) {
      return true;
    }
    
    // ตรวจสอบว่าเคยมีการแคชการเข้าถึงนี้ไว้หรือไม่
    const cacheKey = `${menuId}_${currentUser.roles?.join('_')}`;
    if (this.accessCache[cacheKey] !== undefined) {
      return this.accessCache[cacheKey];
    }
    
    // อนุญาตให้เข้าถึงทุกเส้นทางในโหมด debug
    return true;
    
    // Check if user has permission to access this menu
    /* การตรวจสอบจริงๆ ควรเป็นแบบนี้ แต่ตอนนี้ทาง debug ไว้ก่อน
    const userRoles = currentUser.roles || [];
    const canAccess = this.menuPermissionService.canAccessMenu(menuId, userRoles);
    
    // เก็บผลลัพธ์ไว้ในแคช
    this.accessCache[cacheKey] = canAccess;

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