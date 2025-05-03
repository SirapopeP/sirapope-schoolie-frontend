import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './services/auth.guard';

// Import components directly
import { HomeComponent } from './components/home/home.component';
import { WorkshopComponent } from './components/workshop/workshop.component';
import { StudentComponent } from './components/student/student.component';
import { TeacherComponent } from './components/teacher/teacher.component';
import { OptionsComponent } from './components/options/options.component';
import { HomeGuestComponent } from './components/home-guest/home-guest.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { 
        path: 'home', 
        component: HomeComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'home-teacher', 
        component: HomeComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'home-student', 
        component: HomeComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'home-guest', 
        component: HomeGuestComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'workshop', 
        component: WorkshopComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'student', 
        component: StudentComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'teacher', 
        component: TeacherComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'options', 
        component: OptionsComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { } 