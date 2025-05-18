import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-redirect',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="redirect-container">
      <h2>Loading student data...</h2>
      <div class="loading-message">Please wait</div>
      <div class="spinner"></div>
    </div>
    <style>
      .redirect-container {
        padding: 50px; 
        text-align: center;
      }
      .loading-message {
        margin: 20px 0;
      }
      .spinner {
        width: 50px; 
        height: 50px; 
        border: 5px solid #f3f3f3; 
        border-top: 5px solid #3498db; 
        border-radius: 50%; 
        margin: 0 auto; 
        animation: spin 1s linear infinite;
      }
      @keyframes spin { 
        0% { transform: rotate(0deg); } 
        100% { transform: rotate(360deg); } 
      }
    </style>
  `
})
export class StudentRedirectComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const studentId = params['studentId'];
      
      if (studentId) {
        // Redirect to student detail page using hash navigation
        // This approach allows bypassing the chunk loading error
        setTimeout(() => {
          window.location.href = `/#/dashboard/student/detail/${studentId}`;
        }, 300);
      } else {
        // If no studentId is provided, redirect to student listing page
        this.router.navigate(['/dashboard/student']);
      }
    });
  }
} 