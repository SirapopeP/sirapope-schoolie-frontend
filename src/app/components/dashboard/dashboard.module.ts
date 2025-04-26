import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { CommonModule } from '@angular/common';

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
        loadComponent: () => import('../home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'teacher',
        loadComponent: () => import('../teacher/teacher.component').then(m => m.TeacherComponent)
      },
      {
        path: 'student',
        loadComponent: () => import('../student/student.component').then(m => m.StudentComponent)
      },
      {
        path: 'workshop',
        loadComponent: () => import('../workshop/workshop.component').then(m => m.WorkshopComponent)
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