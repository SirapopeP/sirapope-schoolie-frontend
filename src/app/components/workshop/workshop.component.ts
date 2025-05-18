import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

interface WorkshopTemplate {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  maxStudents: number;
  price: number;
  modules: WorkshopModule[];
  createdAt: Date;
  lastUpdated: Date;
}

interface WorkshopModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  order: number;
}

interface WorkshopClass {
  id: string;
  templateId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  students: StudentInfo[];
  instructor: string;
  location: string;
  price: number;
  createdAt: Date;
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  status: 'registered' | 'confirmed' | 'attended' | 'cancelled';
}

@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.component.html',
  styleUrls: ['./workshop.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule
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
  ]
})
export class WorkshopComponent implements OnInit {
  // Workshop data
  workshopTemplates: WorkshopTemplate[] = [];
  workshopClasses: WorkshopClass[] = [];
  
  // Filter and display settings
  selectedTab: number = 0;
  searchTerm: string = '';
  statusFilter: string = 'all';
  showCreateTemplateForm: boolean = false;
  showCreateClassForm: boolean = false;
  selectedTemplate: WorkshopTemplate | null = null;
  
  constructor() {}
  
  ngOnInit() {
    // Load mock data for demonstration
    this.loadMockData();
  }
  
  loadMockData() {
    // Template mock data
    this.workshopTemplates = [
      {
        id: 't1',
        title: 'Watercolor Basics',
        description: 'Introduction to watercolor painting techniques for beginners',
        duration: 120,
        maxStudents: 15,
        price: 1200,
        modules: [
          { id: 'm1', title: 'Color Theory', description: 'Understanding color mixing', duration: 30, order: 1 },
          { id: 'm2', title: 'Basic Techniques', description: 'Washes, glazing, and wet-on-wet', duration: 45, order: 2 },
          { id: 'm3', title: 'Simple Landscapes', description: 'Creating your first painting', duration: 45, order: 3 }
        ],
        createdAt: new Date(2023, 1, 15),
        lastUpdated: new Date(2023, 5, 20)
      },
      {
        id: 't2',
        title: 'Digital Illustration',
        description: 'Learn digital illustration using professional tools',
        duration: 180,
        maxStudents: 12,
        price: 2500,
        modules: [
          { id: 'm1', title: 'Software Introduction', description: 'Understanding the digital canvas', duration: 45, order: 1 },
          { id: 'm2', title: 'Drawing Techniques', description: 'Lines, shapes, and digital brushes', duration: 60, order: 2 },
          { id: 'm3', title: 'Character Design', description: 'Creating memorable characters', duration: 75, order: 3 }
        ],
        createdAt: new Date(2023, 3, 10),
        lastUpdated: new Date(2023, 6, 5)
      },
      {
        id: 't3',
        title: 'Portrait Photography',
        description: 'Master portrait photography from lighting to editing',
        duration: 240,
        maxStudents: 8,
        price: 3000,
        modules: [
          { id: 'm1', title: 'Lighting Setup', description: 'Natural and studio lighting', duration: 60, order: 1 },
          { id: 'm2', title: 'Composition', description: 'Framing and positioning subjects', duration: 60, order: 2 },
          { id: 'm3', title: 'Photo Editing', description: 'Post-processing portraits', duration: 120, order: 3 }
        ],
        createdAt: new Date(2023, 2, 25),
        lastUpdated: new Date(2023, 7, 12)
      }
    ];
    
    // Classes mock data
    this.workshopClasses = [
      {
        id: 'c1',
        templateId: 't1',
        title: 'Watercolor Weekend Workshop',
        description: 'Weekend watercolor workshop for beginners',
        startDate: new Date(2023, 8, 15, 10, 0),
        endDate: new Date(2023, 8, 15, 12, 0),
        status: 'scheduled',
        students: [
          { id: 's1', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'confirmed' },
          { id: 's2', name: 'Mike Chen', email: 'mike@example.com', status: 'registered' }
        ],
        instructor: 'Lisa Wong',
        location: 'Art Studio A',
        price: 1200,
        createdAt: new Date(2023, 7, 20)
      },
      {
        id: 'c2',
        templateId: 't2',
        title: 'Digital Art Masterclass',
        description: 'Advanced digital illustration techniques',
        startDate: new Date(2023, 9, 5, 13, 0),
        endDate: new Date(2023, 9, 5, 16, 0),
        status: 'active',
        students: [
          { id: 's3', name: 'John Smith', email: 'john@example.com', status: 'confirmed' },
          { id: 's4', name: 'Emma Davis', email: 'emma@example.com', status: 'confirmed' },
          { id: 's5', name: 'Alex Johnson', email: 'alex@example.com', status: 'registered' }
        ],
        instructor: 'David Kim',
        location: 'Digital Lab B',
        price: 2500,
        createdAt: new Date(2023, 8, 1)
      },
      {
        id: 'c3',
        templateId: 't3',
        title: 'Portrait Photography Workshop',
        description: 'Learn professional portrait photography',
        startDate: new Date(2023, 10, 12, 9, 0),
        endDate: new Date(2023, 10, 12, 13, 0),
        status: 'scheduled',
        students: [
          { id: 's6', name: 'Maria Rodriguez', email: 'maria@example.com', status: 'confirmed' }
        ],
        instructor: 'James Wilson',
        location: 'Photo Studio C',
        price: 3000,
        createdAt: new Date(2023, 9, 15)
      }
    ];
  }
  
  // Toggle create template form
  toggleCreateTemplateForm() {
    this.showCreateTemplateForm = !this.showCreateTemplateForm;
    this.showCreateClassForm = false; // Close other form if open
  }
  
  // Toggle create class form
  toggleCreateClassForm(template: WorkshopTemplate | null = null) {
    this.selectedTemplate = template;
    this.showCreateClassForm = !this.showCreateClassForm;
    this.showCreateTemplateForm = false; // Close other form if open
  }
  
  // Create new workshop template
  createWorkshopTemplate() {
    // In a real app, this would call a service to create the template
    console.log('Creating new template');
    this.showCreateTemplateForm = false;
  }
  
  // Create new workshop class from template
  createWorkshopClass() {
    // In a real app, this would call a service to create the class
    console.log('Creating new class from template:', this.selectedTemplate);
    this.showCreateClassForm = false;
  }
  
  // Get template by ID
  getTemplateById(id: string): WorkshopTemplate | undefined {
    return this.workshopTemplates.find(template => template.id === id);
  }
  
  // Add student to class
  addStudentToClass(classId: string) {
    console.log('Adding student to class:', classId);
    // Would open a modal to select students
  }
  
  // Format status for display
  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  
  // Format date
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Convert minutes to hours and minutes
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
    } else {
      return `${mins}m`;
    }
  }
  
  // Format price
  formatPrice(price: number): string {
    return `${price.toLocaleString()} ฿`;
  }
} 