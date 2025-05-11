import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentManagementService } from '../../../services/student-management.service';
import { UserProfileService } from '../../../services/user-profile.service';
import { ThemeService } from '../../../services/theme.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
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
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
    ]),
    trigger('staggerItems', [
      transition(':enter', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger('100ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
  ]
})
export class StudentDetailComponent implements OnInit, OnDestroy {
  student: any = null;
  isLoading = true;
  isDarkMode = false;
  studentId: string = '';
  academyId: string = '';
  workshops: any[] = [];
  private subscriptions: Subscription[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentManagementService,
    private userProfileService: UserProfileService,
    public themeService: ThemeService
  ) {
    // รับค่า state จากการนำทาง
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as any;
      if (state?.academyId) {
        this.academyId = state.academyId;
        // console.log('Got academyId from navigation state:', this.academyId);
      }
    }
  }
  
  ngOnInit() {
    // Subscribe to theme changes
    this.subscriptions.push(
      this.themeService.isDarkMode$.subscribe(isDark => {
        this.isDarkMode = isDark;
      })
    );
    
    // Get student ID from route
    this.route.params.subscribe(params => {
      this.studentId = params['id'];
      
      // Try to get academyId from route params if not already set
      if (!this.academyId && params['academyId']) {
        this.academyId = params['academyId'];
      }
      
      console.log(`รับค่า ID นักเรียน: ${this.studentId}`);
      
      if (this.studentId) {
        this.loadStudentDetails();
      } else {
        this.isLoading = false;
        console.error('ไม่พบรหัสนักเรียนในพารามิเตอร์ของเส้นทาง');
      }
    });
  }
  
  loadStudentDetails() {
    this.isLoading = true;
    
    // ถ้าไม่มี academyId ให้หาจากระบบก่อน แต่ในกรณีนี้ใช้ dummy data ไปก่อน
    if (!this.academyId) {
      console.log('ไม่พบรหัสหลักสูตร ใช้ข้อมูลตัวอย่างแทน');
      this.loadDummyData();
      return;
    }
    
    // Get current user
    this.userProfileService.user$.pipe(
      take(1)
    ).subscribe(user => {
      if (user && user.id) {
        this.studentService.getStudentDetails(this.academyId, this.studentId, user.id).subscribe({
          next: (student) => {
            this.student = student;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลนักเรียน:', error);
            this.isLoading = false;
            this.loadDummyData();
          }
        });
      } else {
        this.isLoading = false;
        console.error('ไม่พบข้อมูลผู้ใช้');
        this.loadDummyData();
      }
    });
  }
  
  loadDummyData() {
    // Load dummy data for development/testing
    this.student = {
      id: this.studentId,
      username: 'Student ' + this.studentId,
      email: 'student@example.com',
      profile: {
        fullName: 'Student Name',
        nickName: 'Nickname',
        birthDate: '2010-01-01'
      },
      memberLevel: 3,
      memberStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.isLoading = false;
  }
  
  // For future implementation
  loadStudentWorkshops() {
    // Will fetch workshops for this student
  }
  
  calculateAge(birthDate: string): number | null {
    if (!birthDate) return null;
    
    const dob = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }
  
  goBack() {
    console.log('กำลังกลับไปยังหน้ารายชื่อนักเรียน');
    // นำทางกลับไปยังหน้ารายชื่อนักเรียน
    this.router.navigate(['/dashboard/student']);
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
} 