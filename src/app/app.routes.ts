import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    component: LoginComponent,
    data: { animation: 'login' }
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    data: { animation: 'register' } 
  },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  { 
    path: 'change-password', 
    component: ChangePasswordComponent,
    data: { animation: 'change-password' }
  }
]; 