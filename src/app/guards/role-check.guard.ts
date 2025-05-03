import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolesService } from '../services/roles.service';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleCheckGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return from(Promise.resolve(false));
    }

    return from(this.rolesService.getUserRoles(user.id)).pipe(
      map(roles => {
        if (roles && roles.length > 0) {
          return true;
        } else {
          // If we want to preserve where the user was trying to go, save it
          localStorage.setItem('redirectUrl', state.url);
          
          // Open role picker modal in dashboard
          this.router.navigate(['/dashboard'], { 
            queryParams: { needsRole: 'true' }
          });
          return false;
        }
      }),
      catchError(error => {
        console.error('Error checking user roles:', error);
        this.router.navigate(['/login']);
        return from(Promise.resolve(false));
      })
    );
  }
} 