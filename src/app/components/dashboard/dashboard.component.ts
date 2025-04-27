import { Component, OnInit, HostListener, OnDestroy, Renderer2 } from '@angular/core';
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
    public themeService: ThemeService,
    private renderer: Renderer2
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
    // Ensure we restore scroll when component is destroyed
    this.renderer.setStyle(document.body, 'overflow', '');
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    // Close sidebar when resizing to desktop
    if (!this.isMobile && this.isSidebarOpen) {
      this.isSidebarOpen = false;
      this.renderer.setStyle(document.body, 'overflow', '');
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    // Add or remove scrolling capability when sidebar is open
    if (this.isSidebarOpen) {
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
      // Force redraw/repaint of sidebar when opened
      setTimeout(() => {
        // Get the sidebar component and force a redraw
        const sidebarElement = document.querySelector('.sidebar-component') as HTMLElement;
        if (sidebarElement) {
          // Force layout recalculation
          void sidebarElement.getBoundingClientRect();
          
          // Apply a small animation to force repaint
          this.renderer.setStyle(sidebarElement, 'animation', 'none');
          void sidebarElement.offsetWidth; // Trigger reflow
          this.renderer.removeStyle(sidebarElement, 'animation');
          
          // Ensure pointer events are enabled
          this.renderer.setStyle(sidebarElement, 'pointer-events', 'auto');
          this.renderer.setStyle(sidebarElement, 'touch-action', 'auto');
        }
      }, 50);
    } else {
      this.renderer.setStyle(document.body, 'overflow', '');
    }
  }

  closeSidebar() {
    if (this.isSidebarOpen) {
      this.isSidebarOpen = false;
      this.renderer.setStyle(document.body, 'overflow', '');
    }
  }
} 