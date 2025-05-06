import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { Subscription, filter } from 'rxjs';
import { UserProfileService } from '../../services/user-profile.service';
import { MenuPermissionService } from '../../services/menu-permission.service';

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  route: string;
  canAccess?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class SidebarComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private themeSubscription: Subscription;
  private routerSubscription: Subscription;
  currentUrl: string = '';
  userRoles: string[] = [];
  menuItems: MenuItem[] = [
    { id: 'home', name: 'Dashboard', icon: 'home', route: '/dashboard/home' },
    { id: 'workshop', name: 'Workshop', icon: 'workshop', route: '/dashboard/workshop' },
    { id: 'student', name: 'Students', icon: 'student', route: '/dashboard/student' },
    { id: 'teacher', name: 'Teachers', icon: 'teacher', route: '/dashboard/teacher' },
    { id: 'options', name: 'Options', icon: 'options', route: '/dashboard/options' }
  ];

  // Enhanced host bindings with !important flags
  @HostBinding('style.position') position = 'relative';
  @HostBinding('style.z-index') zIndex = '1050';
  @HostBinding('style.pointer-events') pointerEvents = 'auto !important';
  @HostBinding('style.touch-action') touchAction = 'auto !important';
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.height') height = '100%';

  constructor(
    private router: Router,
    private alertService: AlertService,
    public themeService: ThemeService,
    private userProfileService: UserProfileService,
    private menuPermissionService: MenuPermissionService
  ) {
    // Subscribe to router events to track current URL
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.url;
      });
  }

  ngOnInit() {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    // Get user roles
    const user = this.userProfileService.getUser();
    if (user && user.roles) {
      this.userRoles = user.roles;
      // Update dashboard route based on user role
      this.updateDashboardRoute();
      
      // แคชค่าการเข้าถึงเมนูไว้เลย เพื่อไม่ต้องเรียก canAccessMenu ซ้ำๆ
      this.menuItems.forEach(item => {
        item.canAccess = this.menuPermissionService.canAccessMenu(item.id, this.userRoles);
      });
    }

    // Set initial current URL
    this.currentUrl = this.router.url;
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Update dashboard route based on user role
  updateDashboardRoute() {
    const dashboardItem = this.menuItems.find(item => item.id === 'home');
    if (dashboardItem) {
      dashboardItem.route = this.getRouteByRole();
    }
  }

  // Get appropriate home route based on user role
  getRouteByRole(): string {
    if (this.userRoles.includes('ACADEMY_OWNER') || this.userRoles.includes('ADMIN')) {
      return '/dashboard/home';
    } else if (this.userRoles.includes('TEACHER')) {
      return '/dashboard/home-teacher';
    } else if (this.userRoles.includes('STUDENT')) {
      return '/dashboard/home-student';
    } else {
      return '/dashboard/home-guest';
    }
  }

  // Navigate to a route programmatically
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Check if a route is currently active
  isActive(route: string): boolean {
    // For exact route matches
    if (this.currentUrl === route) {
      return true;
    }
    
    // For partial matches (e.g., sub-routes)
    if (route !== '/dashboard/home' && this.currentUrl.startsWith(route)) {
      return true;
    }
    
    // Special case for home route
    const isHomeRoute = route.includes('/dashboard/home');
    const isOnHomeRoute = this.currentUrl === '/dashboard' || 
                          this.currentUrl === '/dashboard/home' ||
                          this.currentUrl.startsWith('/dashboard/home');
                          
    return isHomeRoute && isOnHomeRoute;
  }

  onLogout() {
    // Clear user data from storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');

    // Show success message
    this.alertService.showAlert({
      type: 'success',
      message: 'Logged out successfully'
    });

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  canAccessMenu(menuId: string): boolean {
    // ใช้ค่าที่แคชไว้แล้วถ้ามี
    const menuItem = this.menuItems.find(item => item.id === menuId);
    if (menuItem && menuItem.canAccess !== undefined) {
      return menuItem.canAccess;
    }
    
    // ถ้ายังไม่เคยแคช ให้เรียกและแคชไว้
    const canAccess = this.menuPermissionService.canAccessMenu(menuId, this.userRoles);
    
    // แคชค่าไว้สำหรับการเรียกใช้ต่อไป
    if (menuItem) {
      menuItem.canAccess = canAccess;
    }
    
    return canAccess;
  }
} 