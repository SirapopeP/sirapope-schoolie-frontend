import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-student-card',
  templateUrl: './student-card.component.html',
  styleUrls: ['./student-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class StudentCardComponent implements OnInit {
  @Input() student: any;
  @Input() isDarkMode: boolean = false;

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Student card received data:', this.student);
    // Check if student has required properties for navigation
    if (this.student) {
      console.log('Student properties available for navigation:',
        'id=', this.student.id,
        'academyId=', this.student.academyId);
    }
  }

  getNickname(student: any): string {
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
    
    // Priority 5: Extract from email if available
    if (student.user && student.user.email) {
      const emailParts = student.user.email.split('@');
      return emailParts[0];
    }
    
    if (student.email) {
      const emailParts = student.email.split('@');
      return emailParts[0];
    }
    
    return 'Unnamed';
  }
  
  getFullname(student: any): string {
    if (!student) return '';
    
    // Priority 1: Try to get full name from user profile
    if (student.user && student.user.profile && student.user.profile.fullName) {
      return student.user.profile.fullName;
    }
    
    // Priority 2: Try to get full name from student profile
    if (student.profile && student.profile.fullName) {
      return student.profile.fullName;
    }
    
    // Priority 3: Try email from user (แสดงอีเมลตามที่ต้องการ)
    if (student.user && student.user.email) {
      return student.user.email;
    }
    
    // Priority 4: Try direct email
    if (student.email) {
      return student.email;
    }
    
    // Priority 5: Use username if available
    if (student.user && student.user.username) {
      return student.user.username;
    }
    
    if (student.username) {
      return student.username;
    }
    
    return '';
  }
  
  getAge(student: any): string | number {
    if (!student) return '-';
    
    // ทำให้เงื่อนไขเรียบง่ายขึ้น ไม่มีการ log และไม่เรียกใช้ calculateAge หลายครั้ง
    try {
      // กำหนดวันเกิดมาตรฐาน
      const defaultBirthDate = new Date('2015-01-01');
      let birthDate = defaultBirthDate;
      
      // ตรวจสอบและใช้วันเกิดที่มีในข้อมูล
      if (student.user && student.user.profile && student.user.profile.birthDate) {
        birthDate = new Date(student.user.profile.birthDate);
      } else if (student.user && student.user.birthDate) {
        birthDate = new Date(student.user.birthDate);
      } else if (student.profile && student.profile.birthDate) {
        birthDate = new Date(student.profile.birthDate);
      } else if (student.birthDate) {
        birthDate = new Date(student.birthDate);
      }
      
      // ตรวจสอบว่าวันเกิดถูกต้อง
      if (isNaN(birthDate.getTime())) {
        return 5; // ส่งค่าอายุเริ่มต้น
      }
      
      // คำนวณอายุแบบง่าย
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      
      // ตรวจสอบความสมเหตุสมผล
      if (age < 0 || age > 120) {
        return 5; // ส่งค่าอายุเริ่มต้น
      }
      
      return age;
    } catch (error) {
      return 5; // ส่งค่าอายุเริ่มต้น
    }
  }
  
  getWorkshopCount(student: any): number | string {
    // ตามที่ต้องการ เรายังไม่ได้ implement การ count workshop จึงแสดงค่า default เป็น 0
    if (!student) return 0;
    
    // ถ้ามีข้อมูล workshopCount ให้ใช้
    if (student.workshopCount !== undefined) {
      return student.workshopCount;
    }
    
    return 0;
  }
  
  getAvatarColor(student: any): string {
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
    return '#1dd8b2'; // Default green if no status
  }

  getStudentRating(student: any): number {
    // Check if memberLevel is available
    if (student?.memberLevel !== undefined) {
      return student.memberLevel;
    }
    
    // Fallback to rating if memberLevel is not available
    if (student?.rating !== undefined) {
      return student.rating;
    }
    
    return 4.0; // Default value
  }

  objectKeys(obj: any): string[] {
    if (!obj) return [];
    return Object.keys(obj);
  }

  getInitials(student: any): string {
    if (!student) return 'ST';
    
    // Priority 1: Try to get initials from nickname in user profile
    if (student.user && student.user.profile && student.user.profile.nickName) {
      const nickName = student.user.profile.nickName;
      return nickName.substring(0, 2).toUpperCase();
    }
    
    // Priority 2: Try to get initials from nickname in student profile
    if (student.profile && student.profile.nickName) {
      const nickName = student.profile.nickName;
      return nickName.substring(0, 2).toUpperCase();
    }
    
    // Priority 3: Try to get initials from full name in user profile
    if (student.user && student.user.profile && student.user.profile.fullName) {
      const fullName = student.user.profile.fullName;
      
      if (fullName.includes(' ')) {
        return fullName.split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
      }
      
      return fullName.substring(0, 2).toUpperCase();
    }
    
    // Priority 4: Try to get initials from full name in student profile
    if (student.profile && student.profile.fullName) {
      const fullName = student.profile.fullName;
      
      if (fullName.includes(' ')) {
        return fullName.split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
      }
      
      return fullName.substring(0, 2).toUpperCase();
    }
    
    // Priority 5: Try username from user object
    if (student.user && student.user.username) {
      return student.user.username.substring(0, 2).toUpperCase();
    }
    
    // Priority 6: Try direct username
    if (student.username) {
      return student.username.substring(0, 2).toUpperCase();
    }
    
    // Priority 7: Fallback to email
    if (student.user && student.user.email) {
      const emailParts = student.user.email.split('@');
      const username = emailParts[0];
      return username.substring(0, 2).toUpperCase();
    }
    
    if (student.email) {
      const emailParts = student.email.split('@');
      const username = emailParts[0];
      return username.substring(0, 2).toUpperCase();
    }
    
    return 'ST';
  }
  
  navigateToStudentDetail() {
    console.log('คลิกที่ student card แล้ว พยายามนำทาง');
    // Check if student object and necessary IDs exist
    if (this.student && (this.student.userId || this.student.id)) {
      // Use userId for navigation if available, otherwise fallback to id
      const idForNavigation = this.student.userId || this.student.id;
      const academyId = this.student.academyId; // Get academyId if available
      console.log('กำลังนำทางไปหน้ารายละเอียดนักเรียน: idForNavigation=', idForNavigation, 'academyId=', academyId);

      const navigationExtras = {
        state: {
          student: this.student // Pass the entire student object in state
        }
      };

      // Use academyId in the route if available, matching the route '/dashboard/student/:academyId/:id' or '/dashboard/student/detail/:id'
      // Note: The route parameter name should match what StudentDetailComponent expects for the User ID
      // Assuming the route expects the User ID as 'id' or 'studentId'
      if (academyId) {
        // Navigate with academyId and the ID (User ID)
        this.router.navigate(['/dashboard/student', academyId, idForNavigation], navigationExtras);
      } else {
        // Fallback to navigating with just the ID (User ID)
        this.router.navigate(['/dashboard/student/detail', idForNavigation], navigationExtras);
      }

    } else {
      console.error('Cannot navigate to student detail: Student data or required ID (userId or id) is missing.', this.student);
    }
  }
} 