import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api'; // Change this to your actual API URL

  constructor(private http: HttpClient) { }

  // Auth endpoints
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  // Student endpoints
  getStudents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/students`);
  }

  getStudent(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/${id}`);
  }

  createStudent(student: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/students`, student);
  }

  updateStudent(id: string, student: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/students/${id}`, student);
  }

  deleteStudent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/students/${id}`);
  }

  // Teacher endpoints
  getTeachers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/teachers`);
  }

  getTeacher(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/teachers/${id}`);
  }

  createTeacher(teacher: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/teachers`, teacher);
  }

  updateTeacher(id: string, teacher: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/teachers/${id}`, teacher);
  }

  deleteTeacher(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teachers/${id}`);
  }

  // Workshop endpoints
  getWorkshops(): Observable<any> {
    return this.http.get(`${this.apiUrl}/workshops`);
  }

  getWorkshop(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/workshops/${id}`);
  }

  createWorkshop(workshop: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/workshops`, workshop);
  }

  updateWorkshop(id: string, workshop: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/workshops/${id}`, workshop);
  }

  deleteWorkshop(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/workshops/${id}`);
  }
} 