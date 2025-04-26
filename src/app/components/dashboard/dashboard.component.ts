import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ParticlesComponent } from '../particles/particles.component';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    SidebarComponent,
    ParticlesComponent
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  isSidebarOpen: boolean = false;
  isMobile: boolean = false;
  isDarkMode: boolean = false;
  private themeSubscription: Subscription;

  constructor(
    private router: Router,
    public themeService: ThemeService
  ) {
    this.checkScreenSize();
  }

  ngOnInit() {
    // Check screen size on init
    this.checkScreenSize();
    
    // Subscribe to route changes to close sidebar when navigating on mobile
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile && this.isSidebarOpen) {
        this.closeSidebar();
      }
    });

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

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    // Close sidebar when resizing to desktop
    if (!this.isMobile && this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    // Add or remove scrolling capability when sidebar is open
    if (this.isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeSidebar() {
    if (this.isSidebarOpen) {
      this.isSidebarOpen = false;
      document.body.style.overflow = '';
    }
  }
} 