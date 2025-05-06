import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MenuPermission {
  menuId: string;
  menuName: string;
  allowedRoles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuPermissionService {
  private defaultPermissions: MenuPermission[] = [
    { 
      menuId: 'home', 
      menuName: 'Dashboard', 
      allowedRoles: ['ACADEMY_OWNER', 'ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] 
    },
    { 
      menuId: 'workshop', 
      menuName: 'Workshop', 
      allowedRoles: ['ACADEMY_OWNER', 'ADMIN', 'TEACHER'] 
    },
    { 
      menuId: 'student', 
      menuName: 'Students', 
      allowedRoles: ['ACADEMY_OWNER', 'ADMIN', 'TEACHER'] 
    },
    { 
      menuId: 'teacher', 
      menuName: 'Teachers', 
      allowedRoles: ['ACADEMY_OWNER', 'ADMIN'] 
    },
    { 
      menuId: 'options', 
      menuName: 'Options', 
      allowedRoles: ['ACADEMY_OWNER', 'ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] 
    }
  ];

  private menuPermissionsSubject = new BehaviorSubject<MenuPermission[]>(this.getStoredPermissions());
  private logsEnabled = false; // ปิดการแสดง logs โดยค่าเริ่มต้น
  
  constructor() {
    // Initialize permissions if they don't exist
    if (!localStorage.getItem('menuPermissions')) {
      this.savePermissions(this.defaultPermissions);
    }
  }

  get menuPermissions$(): Observable<MenuPermission[]> {
    return this.menuPermissionsSubject.asObservable();
  }

  getMenuPermissions(): MenuPermission[] {
    return this.menuPermissionsSubject.getValue();
  }

  updateMenuPermissions(permissions: MenuPermission[]): void {
    this.savePermissions(permissions);
    this.menuPermissionsSubject.next(permissions);
  }

  resetToDefault(): void {
    this.savePermissions(this.defaultPermissions);
    this.menuPermissionsSubject.next(this.defaultPermissions);
  }

  canAccessMenu(menuId: string, userRoles: string[]): boolean {
    const permissions = this.getMenuPermissions();
    const menuPermission = permissions.find(p => p.menuId === menuId);
    
    if (!menuPermission) {
      return false;
    }

    return userRoles.some(role => menuPermission.allowedRoles.includes(role));
  }

  private getStoredPermissions(): MenuPermission[] {
    const storedPermissions = localStorage.getItem('menuPermissions');
    return storedPermissions ? JSON.parse(storedPermissions) : this.defaultPermissions;
  }

  private savePermissions(permissions: MenuPermission[]): void {
    localStorage.setItem('menuPermissions', JSON.stringify(permissions));
  }
  
  // สำหรับใช้ในการ debug เท่านั้น
  enableLogs(enable: boolean): void {
    this.logsEnabled = enable;
  }
} 