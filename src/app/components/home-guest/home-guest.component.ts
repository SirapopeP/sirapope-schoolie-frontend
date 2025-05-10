import { Component, OnInit, OnDestroy, Inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
import { StatCardComponent } from '../shared/stat-card/stat-card.component';
import { CalendarObjectComponent } from '../shared/calendar-object/calendar-object.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertModalComponent } from '../shared/alert-modal/alert-modal.component';
import { Router } from '@angular/router';
import { RolePickerModalComponent } from '../shared/role-picker-modal/role-picker-modal.component';
import { UserProfileService } from '@app/services';
import { UserProfile } from '@app/models/user.model';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '@app/services';

@Component({
  selector: 'app-home-guest',
  standalone: true,
  imports: [
    CommonModule, 
    StatCardComponent, 
    CalendarObjectComponent,
    MatDialogModule,
    AlertModalComponent,
    HttpClientModule
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
    ]),
    trigger('staggerList', [
      transition(':enter', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger('100ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
  ],
  templateUrl: './home-guest.component.html',
  styleUrls: ['./home-guest.component.scss']
})
export class HomeGuestComponent implements OnInit, OnDestroy, AfterViewInit {
  isDarkMode = false;
  private themeSubscription: Subscription;
  private userSubscription: Subscription;
  currentUserProfile: UserProfile | null = null;
  dotLottieInstance: any;
  
  // Theme variables
  primaryColorRgb = '29, 216, 178'; // RGB for #1DD8B2

  // User profile data
  userProfile = {
    fullName: '',
    role: '',
    academy: '',
    avatarUrl: ''
  };

  // Statistics for guest dashboard
  stats = {
    workshops: 4,
    students: 6,
    teacher: 2,
    academyLevel: 3
  };

  constructor(
    public themeService: ThemeService,
    @Inject(MatDialog) private dialog: MatDialog,
    private router: Router,
    private userProfileService: UserProfileService,
    private http: HttpClient,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      this.updateThemeVariables();
      this.updateSvgThemeColors();
    });

    // Subscribe to user profile changes
    this.userSubscription = this.userProfileService.user$.subscribe(user => {
        console.log('User data in home component:', user);
        
        if (user && user.id) { // Check that user object is complete
          // Format role for display (convert from SCREAMING_SNAKE_CASE to Title Case)
          let formattedRole = 'User';
          
          if (user.roles && user.roles.length > 0) {
            formattedRole = user.roles[0].replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
              return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
            });
          }
          
          this.userProfile = {
            fullName: user.profile?.fullName || user.username || '',
            role: formattedRole,
            academy: user.profile?.bio || 'No bio available', // Display user bio instead of academy name
            avatarUrl: user.profile?.avatarUrl || ''
          };
          
          console.log('Updated userProfile in home component:', this.userProfile);
          this.currentUserProfile = user.profile;
        } else {
          console.warn('Invalid or incomplete user data received in home component');
          // Default values if no user is available
          this.userProfile = {
            fullName: 'Anonymous User',
            role: 'Guest',
            academy: 'No bio available',
            avatarUrl: ''
          };
          
          this.currentUserProfile = null;
        }
    })
  }
  
  ngAfterViewInit() {
    // Initialize the DotLottie animation after the view is initialized
    setTimeout(() => {
      // Check if DotLottie is defined and available
      if (typeof DotLottie !== 'undefined') {
        this.initLottieAnimation();
      } else {
        console.warn('DotLottie library not available, using SVG fallback');
        this.loadSvgFallback();
      }
    }, 500);
  }
  
  initLottieAnimation() {
    try {
      const canvasElement = document.querySelector('#dotlottie-canvas') as HTMLCanvasElement;
      const animationElement = document.querySelector('#animation') as HTMLElement;
      
      if (canvasElement && animationElement) {
        // Hide SVG element initially
        animationElement.style.display = 'none';
        canvasElement.style.display = 'block';
        
        this.dotLottieInstance = new DotLottie({
          autoplay: true,
          loop: true,
          canvas: canvasElement,
          src: "https://lottie.host/embed/4e9db37c-8e20-4fc0-afd7-b206c38bd07f/8zAvnFByC8.lottie",
        });
        
        console.log('DotLottie animation initialized');
        
        // Handle animation load error with SVG fallback
        this.dotLottieInstance.addEventListener('error', () => {
          console.warn('DotLottie animation failed to load, using SVG fallback');
          this.loadSvgFallback();
        });
        
        // Set a timeout to check if animation is working
        setTimeout(() => {
          // If canvas is empty after timeout, use SVG fallback
          const context = canvasElement.getContext('2d');
          const pixelData = context?.getImageData(0, 0, canvasElement.width, canvasElement.height).data;
          const hasContent = pixelData && Array.from(pixelData).some(val => val !== 0);
          
          if (!hasContent) {
            console.warn('DotLottie animation not rendering, using SVG fallback');
            this.loadSvgFallback();
          }
        }, 2000);
      } else {
        console.error('Canvas or animation element not found');
        this.loadSvgFallback();
      }
    } catch (error) {
      console.error('Error initializing DotLottie animation:', error);
      this.loadSvgFallback();
    }
  }
  
  loadSvgFallback() {
    // Hide the canvas element
    const canvasElement = document.querySelector('#dotlottie-canvas') as HTMLCanvasElement;
    if (canvasElement) {
      canvasElement.style.display = 'none';
    }
    
    // Show SVG element
    const animationElement = document.querySelector('#animation') as HTMLElement;
    if (animationElement) {
      animationElement.style.display = 'block';
    }
  }
  
  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    
    // Clean up Lottie instance
    if (this.dotLottieInstance) {
      this.dotLottieInstance = null;
    }
  }
  
  private updateThemeVariables() {
    document.documentElement.style.setProperty('--primary-color-rgb', this.primaryColorRgb);
  }
  
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  
  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  openRolePickerModal(): void {
    // Get user ID and current role from user profile service
    const user = this.userProfileService.getUser();
    console.log('Current user from userProfileService:', user);
    
    // ถ้าผู้ใช้เข้าถึงหน้านี้ได้ แสดงว่าควรจะล็อกอินอยู่แล้ว
    // แต่เราจะตรวจสอบข้อมูลผู้ใช้อีกครั้งเพื่อความแน่ใจ
    const userId = user?.id || '';
    const currentRole = user?.roles && user.roles.length > 0 ? user.roles[0] : 'GUEST';
    
    // ถ้าไม่พบ ID ผู้ใช้ แสดงว่าอาจมีปัญหากับข้อมูลผู้ใช้ แต่เราจะให้ดำเนินการต่อ
    // โดยใช้ค่าเริ่มต้นแทนที่จะบล็อกผู้ใช้
    console.log(`Opening role picker with userId: ${userId || 'Using guest ID'}, currentRole: ${currentRole}`);
    
    // Open the role picker modal without additional authentication checks
    const dialogRef = RolePickerModalComponent.open(this.dialog, {
      userId: userId || 'guest-user', // ใช้ค่าเริ่มต้นถ้าไม่มี ID
      currentRole: currentRole
    });
    
    // Handle dialog close
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog result:', result);
        
        // Handle authentication error from role picker
        if (result.authError) {
          // ถ้าเกิด error authentication จาก role picker
          // แนะนำให้ผู้ใช้ refresh หน้าแทนที่จะให้ login ใหม่ทันที
          this.dialog.open(AlertModalComponent, {
            width: '400px',
            data: {
              title: 'Session Issue',
              message: 'There might be an issue with your session. Would you like to refresh the page?',
              type: 'warning'
            },
            disableClose: false
          }).afterClosed().subscribe(refresh => {
            if (refresh) {
              // Refresh the page to restore session
              window.location.reload();
            }
          });
        } else if (typeof result === 'string' && 
                  (result === 'ACADEMY_OWNER' || 
                   result === 'TEACHER' || 
                   result === 'STUDENT')) {
          // Handle successful role selection with type checking
          console.log('Selected role:', result);
          this.handleRoleSelection(result as 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT');
        }
      }
    });
  }

  handleRoleSelection(role: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT'): void {
    // Format the role for display
    let formattedRole = role.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
    
    // Show success message
    this.dialog.open(AlertModalComponent, {
      width: '400px',
      data: {
        title: 'Role Updated',
        message: `You have selected the ${formattedRole} role. The page will refresh to apply your changes.`,
        type: 'success'
      },
      disableClose: false
    });

    // ให้รีเฟรชหน้าแทนที่จะนำทางไปยังหน้าอื่น เนื่องจาก API ไม่ทำงาน
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }

  private updateSvgThemeColors() {
    const svgElement = document.querySelector('#animation svg');
    if (svgElement) {
      const lightElements = svgElement.querySelectorAll('.light');
      const circleElements = svgElement.querySelectorAll('circle[stroke="#eee"]');
      
      if (this.isDarkMode) {
        // Apply dark mode styles
        lightElements.forEach(el => {
          (el as SVGElement).style.fill = '#2d3238';
        });
        
        circleElements.forEach(el => {
          (el as SVGElement).style.stroke = '#555';
        });
      } else {
        // Reset to light mode styles
        lightElements.forEach(el => {
          (el as SVGElement).style.fill = '#f8f9fa';
        });
        
        circleElements.forEach(el => {
          (el as SVGElement).style.stroke = '#eee';
        });
      }
    }
  }
} 