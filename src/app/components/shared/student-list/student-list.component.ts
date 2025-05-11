import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class StudentListComponent implements OnInit {
  @Input() students: any[] = [];
  @Input() isDarkMode: boolean = false;

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Student list received data:', this.students);
  }

  getStudentStatusColor(student: any): string {
    // If memberStatus is available, use it to determine color
    if (student?.memberStatus) {
      switch (student.memberStatus.toLowerCase()) {
        case 'active':
          return '#1dd8b2'; // Green
        case 'inactive':
          return '#ff9f43'; // Orange
        case 'suspended':
          return '#ee5253'; // Red
        default:
          return '#1dd8b2'; // Default green
      }
    }
    return '#1dd8b2'; // Default color if status not available
  }

  getStudentNickname(student: any): string {
    if (!student) return 'Unnamed';
    
    // Priority 1: Try to get nickname from user profile
    if (student.user && student.user.profile && student.user.profile.nickName) {
      return student.user.profile.nickName;
    }
    
    // Priority 2: Try to get nickname from student profile
    if (student.profile && student.profile.nickName) {
      return student.profile.nickName;
    }
    
    // Priority 3: Try to use username from user object
    if (student.user && student.user.username) {
      return student.user.username;
    }
    
    // Priority 4: Try to use direct username
    if (student.username) {
      return student.username;
    }
    
    return 'Unnamed';
  }

  navigateToStudentDetail(student: any) {
    if (student && student.id) {
      const academyId = student.academyId;
      
      if (!academyId) {
        console.error('ไม่สามารถนำทางได้: ไม่มีรหัสอคาเดมี', student);
        return;
      }
      
      console.log(`กำลังนำทางไปหน้ารายละเอียดนักเรียน: studentId=${student.id}, academyId=${academyId}`);
      
      // Update to match the same route format as in StudentCardComponent
      this.router.navigate(['/dashboard/student', academyId, student.id]);
    }
  }
} 