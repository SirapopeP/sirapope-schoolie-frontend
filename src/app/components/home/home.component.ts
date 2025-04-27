import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
import { StatCardComponent } from '../shared/stat-card/stat-card.component';
import { CalendarObjectComponent } from '../shared/calendar-object/calendar-object.component';

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
  imports: [CommonModule, StatCardComponent, CalendarObjectComponent]
})
export class HomeComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private themeSubscription: Subscription;
  
  // Theme variables
  primaryColorRgb = '29, 216, 178'; // RGB for #1DD8B2
  
  // User profile data
  userProfile: UserProfile = {
    fullName: 'goodadmin',
    role: 'Admin',
    academy: 'Good Academy',
    avatarUrl: 'https://i.pravatar.cc/300'
  };
  
  // Dashboard statistics
  workshopCount = 7;
  studentCount = 3;
  teacherCount = 2;
  
  // Workshops list
  workshops: Workshop[] = [
    { id: 1, title: 'Art Mixing 101', status: 'active' },
    { id: 2, title: 'Art Mixing 107', status: 'active' },
    { id: 3, title: 'Art DIY 109', status: 'cancelled' }
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
    }
  ];
  
  // Current month and date
  currentMonth = 'APRIL';
  currentDate = new Date();
  
  // Stat card icons (ใช้ class จาก fontawesome/material-icons)
  statIcons = {
    student: 'fas fa-user-graduate',
    workshop: 'fas fa-paint-brush',
    teacher: 'fas fa-chalkboard-teacher',
    achievement: 'fas fa-star',
  };
  statGradients = [
    'assets/styles/gd-1-green.svg',
    'assets/styles/gd-2-blue.svg',
    'assets/styles/gd-3-vio.svg',
    'assets/styles/gd-4-orange.svg',
  ];

  // Calendar days and legend (placeholder)
  calendarDays = [
    { value: 30, inactive: true }, { value: 31, inactive: true },
    { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 },
    { value: 6 }, { value: 7 }, { value: 8 }, { value: 9 }, { value: 10 }, { value: 11 }, { value: 12 },
    { value: 13 }, { value: 14 }, { value: 15, active: true }, { value: 16 }, { value: 17 }, { value: 18 }, { value: 19 },
    { value: 20 }, { value: 21 }, { value: 22 }, { value: 23 }, { value: 24 }, { value: 25 }, { value: 26 },
    { value: 27 }, { value: 28 }, { value: 29 }, { value: 30 }, { value: 1, inactive: true }, { value: 2, inactive: true }, { value: 3, inactive: true }
  ];
  calendarLegend = [
    { color: '#1DD8B2', label: 'Classes' },
    { color: '#3AA5FF', label: 'Meetings' },
    { color: '#FFC107', label: 'Events' },
  ];
  
  constructor(public themeService: ThemeService) {}
  
  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      this.updateThemeVariables();
    });
    this.updateThemeVariables();
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
} 