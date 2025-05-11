import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@env';
import { AuthService } from './auth.service';

export interface Student {
  id: string;
  username: string;
  email: string;
  profile?: {
    fullName?: string;
    nickName?: string;
    avatarUrl?: string;
    bio?: string;
  };
}

export interface CreateStudentRequest {
  requesterId: string;
  email: string;
  username: string;
  password: string;
  fullName?: string;
  nickName?: string;
}

export interface AcademyInvitation {
  id: string;
  academyId: string;
  userId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  academy?: {
    id: string;
    name: string;
    bio?: string;
    logoUrl?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StudentManagementService {
  private apiUrl = `${environment.apiUrl}/academies`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get available students (students without an academy)
   */
  getAvailableStudents(): Observable<Student[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Student[]>(`${this.apiUrl}/students/available`, { headers })
      .pipe(
        tap(students => console.log('Available students:', students)),
        catchError(this.handleError('getAvailableStudents'))
      );
  }

  /**
   * Create a new student and add to academy
   */
  createStudent(academyId: string, studentData: CreateStudentRequest): Observable<Student> {
    const headers = this.getAuthHeaders();
    return this.http.post<Student>(`${this.apiUrl}/students/${academyId}/create`, studentData, { headers })
      .pipe(
        tap(student => console.log('Student created:', student)),
        catchError(this.handleError('createStudent'))
      );
  }

  /**
   * Invite an existing student to an academy
   */
  inviteStudent(academyId: string, userId: string, requesterId: string): Observable<AcademyInvitation> {
    const headers = this.getAuthHeaders();
    return this.http.post<AcademyInvitation>(
      `${this.apiUrl}/students/${academyId}/invite/${userId}`, 
      { requesterId }, 
      { headers }
    ).pipe(
      tap(invitation => console.log('Invitation sent:', invitation)),
      catchError(this.handleError('inviteStudent'))
    );
  }

  /**
   * Respond to an academy invitation
   */
  respondToInvitation(
    invitationId: string, 
    userId: string, 
    status: 'ACCEPTED' | 'REJECTED'
  ): Observable<AcademyInvitation> {
    const headers = this.getAuthHeaders();
    return this.http.patch<AcademyInvitation>(
      `${this.apiUrl}/students/invitations/${invitationId}/respond`,
      { userId, status },
      { headers }
    ).pipe(
      tap(invitation => console.log(`Invitation ${status.toLowerCase()}:`, invitation)),
      catchError(this.handleError('respondToInvitation'))
    );
  }

  /**
   * Get pending invitations for a user
   */
  getPendingInvitations(userId: string): Observable<AcademyInvitation[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<AcademyInvitation[]>(
      `${this.apiUrl}/students/invitations/user/${userId}`,
      { headers }
    ).pipe(
      tap(invitations => console.log('Pending invitations:', invitations)),
      catchError(this.handleError('getPendingInvitations'))
    );
  }

  /**
   * Get all students for an academy
   */
  getAcademyStudents(academyId: string, requesterId?: string): Observable<Student[]> {
    const headers = this.getAuthHeaders();
    
    // สร้าง URL ทั้งสองแบบเพื่อใช้แบบที่ถูกต้อง
    const url = `${environment.apiUrl}/academies/students/${academyId}/students`;
    
    // สร้าง query parameter
    let params = new HttpParams();
    if (requesterId) {
      params = params.set('requesterId', requesterId);
    }
    
    console.log(`[NEW] Calling API: ${url} with requesterId=${requesterId}`);
    
    // ใช้ GET method และส่ง requesterId เป็น query parameter
    return this.http.get<Student[]>(url, { headers, params })
      .pipe(
        tap(students => {
          console.log('Academy students data:', students);
          if (students && students.length > 0) {
            console.log('Sample student data:', JSON.stringify(students[0], null, 2));
          }
        }),
        catchError((error) => {
          console.error('API Error:', error);
          return this.handleError('getAcademyStudents')(error);
        })
      );
  }

  /**
   * Get details for a specific student
   */
  getStudentDetails(academyId: string, studentId: string, requesterId: string): Observable<Student> {
    const headers = this.getAuthHeaders();
    
    const url = `${environment.apiUrl}/academies/students/${academyId}/students/${studentId}`;
    
    let params = new HttpParams();
    if (requesterId) {
      params = params.set('requesterId', requesterId);
    }
    
    console.log(`Fetching student details: ${url} with requesterId=${requesterId}`);
    
    return this.http.get<Student>(url, { headers, params })
      .pipe(
        tap(student => {
          console.log('Student details data:', student);
        }),
        catchError((error) => {
          console.error('API Error when fetching student details:', error);
          return this.handleError('getStudentDetails')(error);
        })
      );
  }

  /**
   * Helper to get auth headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('Authentication token not available');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    
    // Ensure token is in the correct format (Bearer token)
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': authToken
    });
  }

  /**
   * Error handler
   */
  private handleError(operation = 'operation') {
    return (error: any): Observable<never> => {
      console.error(`${operation} error:`, error);
      
      if (error.status === 403) {
        console.error('User does not have permission for this operation');
      }
      
      return throwError(() => error);
    };
  }
}
