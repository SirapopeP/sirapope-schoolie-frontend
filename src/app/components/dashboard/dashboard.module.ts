import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../services/auth.guard';

// Define routes for child components
const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('../home/home.component').then(m => m.HomeComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'home-student',
        loadComponent: () => import('../home-student/home-student.component').then(m => m.HomeStudentComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'home-teacher',
        loadComponent: () => import('../home-teacher/home-teacher.component').then(m => m.HomeTeacherComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'home-guest',
        loadComponent: () => import('../home-guest/home-guest.component').then(m => m.HomeGuestComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'teacher',
        loadComponent: () => import('../teacher/teacher.component').then(m => m.TeacherComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'student',
        loadComponent: () => import('../student/student.component').then(m => m.StudentComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'student/:academyId/:id',
        loadComponent: () => import('../student/student-detail/student-detail.component').then(m => m.StudentDetailComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'workshop',
        loadComponent: () => import('../workshop/workshop.component').then(m => m.WorkshopComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'options',
        loadComponent: () => import('../options/options.component').then(m => m.OptionsComponent),
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class DashboardModule { } 