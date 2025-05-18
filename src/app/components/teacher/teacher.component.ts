import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { ParticlesComponent } from '../particles/particles.component';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface Teacher {
  id: string;
  fullName: string;
  avatar?: string;
  subjects: string[];
  level: number;
  studentCount: number;
  classCount: number;
  status: 'active' | 'inactive';
}

interface SubjectCount {
  name: string;
  count: number;
}

interface Activity {
  teacherName: string;
  action: string;
  time: string;
}

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ParticlesComponent],
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
  ]
})
export class TeacherComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('teacherPieChart') pieChartRef: ElementRef | undefined;
  
  // Data properties
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  topSubjects: SubjectCount[] = [];
  recentActivities: Activity[] = [];
  
  // Statistics
  totalTeachers: number = 0;
  activeTeachers: number = 0;
  avgLevel: number = 0;
  
  // Filter states
  searchQuery: string = '';
  currentSort: string = 'name-asc';
  statusFilter: string = 'all';
  
  // Chart properties
  pieChart: Chart | undefined;
  chartColors: string[] = [
    '#1DD8B2', // Primary color
    '#4834d4', // Purple
    '#ff9f43', // Orange
    '#ee5253', // Red
    '#2d98da', // Blue
    '#8854d0'  // Dark purple
  ];
  
  isDarkMode: boolean = false;
  private subscriptions: Subscription[] = [];
  
  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to theme changes
    this.subscriptions.push(
      this.themeService.isDarkMode$.subscribe(isDark => {
        this.isDarkMode = isDark;
      })
    );
    
    // Load mock data
    this.loadMockData();
    
    // Apply initial filters
    this.applyFilters();
    
    // Calculate statistics
    this.calculateStatistics();
  }
  
  ngAfterViewInit(): void {
    // Initialize pie chart
    setTimeout(() => {
      this.initPieChart();
    }, 100);
  }
  
  loadMockData(): void {
    // Mock teachers data
    this.teachers = [
      {
        id: '1',
        fullName: 'John Smith',
        subjects: ['Mathematics', 'Physics'],
        level: 5,
        studentCount: 42,
        classCount: 5,
        status: 'active'
      },
      {
        id: '2',
        fullName: 'Emily Johnson',
        subjects: ['English', 'Literature'],
        level: 4,
        studentCount: 35,
        classCount: 4,
        status: 'active'
      },
      {
        id: '3',
        fullName: 'Michael Davis',
        subjects: ['Chemistry', 'Biology'],
        level: 4,
        studentCount: 28,
        classCount: 3,
        status: 'active'
      },
      {
        id: '4',
        fullName: 'Sarah Wilson',
        subjects: ['Art', 'Design'],
        level: 3,
        studentCount: 24,
        classCount: 2,
        status: 'inactive'
      },
      {
        id: '5',
        fullName: 'David Thompson',
        subjects: ['History', 'Geography'],
        level: 5,
        studentCount: 31,
        classCount: 4,
        status: 'active'
      },
      {
        id: '6',
        fullName: 'Jessica Brown',
        subjects: ['Music', 'Drama'],
        level: 4,
        studentCount: 29,
        classCount: 3,
        status: 'inactive'
      }
    ];
    
    // Mock recent activities
    this.recentActivities = [
      { teacherName: 'John Smith', action: 'completed a class with 15 students', time: '2 hours ago' },
      { teacherName: 'Emily Johnson', action: 'added new course materials', time: '5 hours ago' },
      { teacherName: 'Michael Davis', action: 'graded 24 student submissions', time: 'Yesterday' },
      { teacherName: 'Sarah Wilson', action: 'scheduled a new class', time: '2 days ago' },
      { teacherName: 'David Thompson', action: 'updated their profile', time: '3 days ago' }
    ];
  }
  
  calculateStatistics(): void {
    // Total teachers
    this.totalTeachers = this.teachers.length;
    
    // Active teachers
    this.activeTeachers = this.teachers.filter(t => t.status === 'active').length;
    
    // Average level
    const totalLevels = this.teachers.reduce((sum, teacher) => sum + teacher.level, 0);
    this.avgLevel = totalLevels / this.totalTeachers;
    
    // Get subject counts
    const subjectsMap = new Map<string, number>();
    this.teachers.forEach(teacher => {
      teacher.subjects.forEach(subject => {
        const count = subjectsMap.get(subject) || 0;
        subjectsMap.set(subject, count + 1);
      });
    });
    
    // Sort subjects by count and take top 5
    this.topSubjects = Array.from(subjectsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
  
  initPieChart(): void {
    const canvas = document.getElementById('teacherPieChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Prepare chart data
    const labels = this.topSubjects.map(subject => subject.name);
    const data = this.topSubjects.map(subject => subject.count);
    const chartColors = this.chartColors.slice(0, this.topSubjects.length);
    
    // Create chart
    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: chartColors,
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#666',
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            padding: 10,
            boxPadding: 5,
            usePointStyle: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw as number;
                return `${label}: ${value} teachers`;
              }
            }
          }
        },
        cutout: '70%',
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  }
  
  // Filter methods
  applyFilters(): void {
    // First filter by status
    let result = this.teachers;
    
    if (this.statusFilter !== 'all') {
      result = result.filter(teacher => teacher.status === this.statusFilter);
    }
    
    // Then filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(teacher => {
        return (
          teacher.fullName.toLowerCase().includes(query) ||
          teacher.subjects.some(subject => subject.toLowerCase().includes(query))
        );
      });
    }
    
    // Finally, sort the results
    switch (this.currentSort) {
      case 'name-asc':
        result.sort((a, b) => a.fullName.localeCompare(b.fullName));
        break;
      case 'name-desc':
        result.sort((a, b) => b.fullName.localeCompare(a.fullName));
        break;
      case 'level-desc':
        result.sort((a, b) => b.level - a.level);
        break;
      case 'students-desc':
        result.sort((a, b) => b.studentCount - a.studentCount);
        break;
    }
    
    this.filteredTeachers = result;
  }
  
  resetFilters(): void {
    this.searchQuery = '';
    this.currentSort = 'name-asc';
    this.statusFilter = 'all';
    this.applyFilters();
  }
  
  setSort(sort: string): void {
    this.currentSort = sort;
    this.applyFilters();
  }
  
  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }
  
  // Navigation methods
  viewTeacher(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/dashboard/teacher', id]);
  }
  
  editTeacher(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/dashboard/teacher/edit', id]);
  }
  
  // Utility methods
  getInitials(fullName: string): string {
    if (!fullName) return '';
    
    const parts = fullName.split(' ');
    if (parts.length === 1) return parts[0].charAt(0);
    return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
  }
  
  ngOnDestroy(): void {
    // Destroy chart to prevent memory leaks
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    
    // Unsubscribe from subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
} 