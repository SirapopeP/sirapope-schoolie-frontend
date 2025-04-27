import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
import { StatCardComponent } from '../shared/stat-card/stat-card.component';
import { CalendarObjectComponent } from '../shared/calendar-object/calendar-object.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

interface UserProfile {
  fullName: string;
  role: string;
  academy?: string;
  avatarUrl?: string;
}

interface Workshop {
  id: number;
  title: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface Student {
  id: number;
  name: string;
  age: number;
  workshop: string;
  sessionDate: string;
  sessionDetail: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, StatCardComponent, CalendarObjectComponent],
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
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private themeSubscription: Subscription;
  
  // Theme variables
  primaryColorRgb = '29, 216, 178'; // RGB for #1DD8B2
  
  // User profile data
  userProfile: UserProfile = {
    fullName: 'good admin',
    role: 'Admin',
    academy: 'good academy',
    avatarUrl: '' // เว้นว่างไว้เพื่อทดสอบ placeholder
  };
  
  // Dashboard statistics
  workshopCount = 4;
  studentCount = 6;
  teacherCount = 2;
  academyLevel = 3;
  
  // Workshops list
  workshops: Workshop[] = [
    { id: 1, title: 'Art Mixing 101', status: 'active' },
    { id: 2, title: 'Art Mixing 107', status: 'active' },
    { id: 3, title: 'Art DIY 109', status: 'cancelled' },
    { id: 4, title: 'Art DIY 109', status: 'cancelled' },
    { id: 5, title: 'Art DIY 109', status: 'cancelled' },
    { id: 6, title: 'Art DIY 109', status: 'cancelled' },
    { id: 7, title: 'Art DIY 109', status: 'cancelled' },
    { id: 8, title: 'Art DIY 109', status: 'cancelled' },
    { id: 9, title: 'Art DIY 109', status: 'cancelled' },
    { id: 10, title: 'Art DIY 109', status: 'cancelled' },
    
  ];
  
  // Students list
  students: Student[] = [
    { 
      id: 1, 
      name: 'Sirapope Panapong', 
      age: 18, 
      workshop: 'Art Mixing 101', 
      sessionDate: '4/12', 
      sessionDetail: 'สีน้ำ + ภาพวาด' 
    },
    { 
      id: 2, 
      name: 'Sunny Lerumin', 
      age: 4, 
      workshop: 'Art Mixing 101', 
      sessionDate: '7/12', 
      sessionDetail: 'สีน้ำมัน + ภาพหมือน' 
    },
    { 
      id: 3, 
      name: 'Lion Gategara', 
      age: 8, 
      workshop: 'Art Mixing 101', 
      sessionDate: '2/12', 
      sessionDetail: 'สีน้ำ + การ์ตูน' 
    },
    { 
      id: 4, 
      name: 'Lion Gategara', 
      age: 8, 
      workshop: 'Art Mixing 101', 
      sessionDate: '2/12', 
      sessionDetail: 'สีน้ำ + การ์ตูน' 
    }
  ];
  
  // Current month and date
  selectedDate = new Date(); // For the selected date from calendar
  formattedSelectedDate = ''; // Formatted date for display
  
  // Stat card icons (ใช้ class จาก fontawesome/material-icons)
  statIcons = {
    student: 'fas fa-user-graduate',
    workshop: 'fas fa-paint-brush',
    teacher: 'fas fa-chalkboard-teacher',
    achievement: 'fas fa-star',
  };
  statGradients = [
    'assets/styles/gg-1.svg',
    'assets/styles/gg-2.svg',
    'assets/styles/gg-3.svg',
    'assets/styles/gg-4.svg',
  ];

  constructor(public themeService: ThemeService) {}
  
  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      this.updateThemeVariables();
    });
    this.updateThemeVariables();
    
    // Initialize formatted date
    this.updateFormattedDate(this.selectedDate);
  }
  
  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
  
  private updateThemeVariables() {
    document.documentElement.style.setProperty('--primary-color-rgb', this.primaryColorRgb);
  }
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'active': return 'bg-success text-white';
      case 'cancelled': return 'bg-error text-white';
      default: return 'bg-info text-white';
    }
  }
  
  // Handle date selection from calendar
  onDateSelected(date: Date) {
    this.selectedDate = date;
    this.updateFormattedDate(date);
  }
  
  // Format date as "DD MMM YYYY"
  private updateFormattedDate(date: Date) {
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    this.formattedSelectedDate = `${day} ${month} ${year}`;
  }
} 