import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

export interface UserRole {
  id: number;
  role: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT';
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  async assignUserRole(userId: string, role: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT') {
    return this.http.post(`${this.apiUrl}/assign`, { userId, role }).toPromise();
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.apiUrl}/user/${userId}`).toPromise() as Promise<UserRole[]>;
  }
} 