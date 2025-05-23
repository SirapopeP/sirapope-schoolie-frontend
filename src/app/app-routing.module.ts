import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadChildren: () => import('./components/home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'workshop',
        loadChildren: () => import('./components/workshop/workshop.module').then(m => m.WorkshopModule)
      },
      {
        path: 'student',
        loadChildren: () => import('./components/student/student.module').then(m => m.StudentModule)
      },
      {
        path: 'teacher',
        loadChildren: () => import('./components/teacher/teacher.module').then(m => m.TeacherModule)
      },
      {
        path: 'options',
        loadComponent: () => import('./components/options/options.component').then(m => m.OptionsComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 