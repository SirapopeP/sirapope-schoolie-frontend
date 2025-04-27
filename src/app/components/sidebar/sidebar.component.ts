import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';

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
    public themeService: ThemeService
  ) {}

  ngOnInit() {
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
} 