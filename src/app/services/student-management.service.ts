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
  user?: {
    id: string;
    username: string;
    email: string;
    profile?: {
      fullName?: string;
      nickName?: string;
      avatarUrl?: string;
      bio?: string;
    };
  };
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
   * Get student by ID without requiring academyId
   * This is a fallback method for when we only have studentId
   */
  getStudentById(studentId: string, requesterId: string): Observable<Student> {
    const headers = this.getAuthHeaders();
    
    const url = `${environment.apiUrl}/students/${studentId}`;
    
    let params = new HttpParams();
    if (requesterId) {
      params = params.set('requesterId', requesterId);
    }
    
    console.log(`Fetching student by ID only: ${url} with requesterId=${requesterId}`);
    
    return this.http.get<Student>(url, { headers, params })
      .pipe(
        tap(student => {
          console.log('Student data fetched by ID:', student);
        }),
        catchError((error) => {
          console.error('API Error when fetching student by ID:', error);
          return this.handleError('getStudentById')(error);
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

  /**
   * Get workshops for a specific student
   * @param studentId ID of the student
   * @param requesterId ID of the user making the request
   * @returns Observable of workshop array
   */
  getStudentWorkshops(studentId: string, requesterId: string): Observable<any[]> {
    // This is a mockup implementation that will be replaced with a real API call later
    console.log(`Mock getStudentWorkshops for student ${studentId} by requester ${requesterId}`);
    
    // For now, we'll simulate an API response
    return new Observable(observer => {
      // Simulate network delay
      setTimeout(() => {
        // Mock workshop data
        const mockWorkshops = [
          {
            id: 'w1',
            title: 'Introduction to Art Fundamentals',
            date: new Date(2023, 8, 15).toISOString(),
            description: 'Learn the basic principles of art and design',
            progress: 6, // out of 8 steps
            completed: false
          },
          {
            id: 'w2',
            title: 'Advanced Color Theory',
            date: new Date(2023, 9, 20).toISOString(),
            description: 'Explore color harmonies and their psychological effects',
            progress: 8, // out of 8 steps
            completed: true
          },
          {
            id: 'w3',
            title: 'Digital Art Basics',
            date: new Date(2023, 10, 10).toISOString(),
            description: 'Learn to create digital artwork using industry-standard tools',
            progress: 3, // out of 8 steps
            completed: false
          }
        ];
        
        observer.next(mockWorkshops);
        observer.complete();
      }, 300);
    });
    
    // When implementing the real API, it would look like this:
    /*
    const headers = this.getAuthHeaders();
    const url = `${environment.apiUrl}/students/${studentId}/workshops`;
    
    let params = new HttpParams();
    if (requesterId) {
      params = params.set('requesterId', requesterId);
    }
    
    return this.http.get<any[]>(url, { headers, params })
      .pipe(
        tap(workshops => console.log('Student workshops data:', workshops)),
        catchError(this.handleError('getStudentWorkshops'))
      );
    */
  }

  /**
   * Get notes for a specific student
   * @param studentId ID of the student
   * @param requesterId ID of the user making the request
   * @returns Observable of notes array
   */
  getStudentNotes(studentId: string, requesterId: string): Observable<any[]> {
    // This is a mockup implementation that will be replaced with a real API call later
    console.log(`Mock getStudentNotes for student ${studentId} by requester ${requesterId}`);
    
    // For now, we'll simulate an API response
    return new Observable(observer => {
      // Simulate network delay
      setTimeout(() => {
        // Mock notes data
        const mockNotes = [
          { 
            id: 'n1',
            date: new Date(2023, 8, 15).toISOString(), 
            note: 'Student shows great potential in color theory. Recommended additional resources.',
            createdBy: 'Teacher A'
          },
          { 
            id: 'n2',
            date: new Date(2023, 9, 20).toISOString(), 
            note: 'Completed assignment with excellent attention to detail. Consider advanced courses.',
            createdBy: 'Teacher B'
          },
          { 
            id: 'n3',
            date: new Date(2023, 10, 10).toISOString(), 
            note: 'Struggling with perspective concepts. Scheduled additional tutoring session.',
            createdBy: 'Teacher A'
          }
        ];
        
        observer.next(mockNotes);
        observer.complete();
      }, 300);
    });
    
    // When implementing the real API, it would look like this:
    /*
    const headers = this.getAuthHeaders();
    const url = `${environment.apiUrl}/students/${studentId}/notes`;
    
    let params = new HttpParams();
    if (requesterId) {
      params = params.set('requesterId', requesterId);
    }
    
    return this.http.get<any[]>(url, { headers, params })
      .pipe(
        tap(notes => console.log('Student notes data:', notes)),
        catchError(this.handleError('getStudentNotes'))
      );
    */
  }

  /**
   * Get income history for a specific student
   * @param studentId ID of the student
   * @param requesterId ID of the user making the request
   * @returns Observable of income data
   */
  getStudentIncome(studentId: string, requesterId: string): Observable<any> {
    // This is a mockup implementation that will be replaced with a real API call later
    console.log(`Mock getStudentIncome for student ${studentId} by requester ${requesterId}`);
    
    // For now, we'll simulate an API response
    return new Observable(observer => {
      // Simulate network delay
      setTimeout(() => {
        const currentYear = new Date().getFullYear();
        
        // Mock income data
        const mockIncomeData = {
          studentId,
          totalIncome: 45500,
          items: [
            // Current year
            { 
              id: 'i1',
              date: new Date(currentYear, 1, 15).toISOString(), 
              workshop: 'Watercolor Basics', 
              amount: 6500,
              status: 'PAID'
            },
            { 
              id: 'i2',
              date: new Date(currentYear, 4, 22).toISOString(), 
              workshop: 'Digital Art Workshop', 
              amount: 7500,
              status: 'PAID'
            },
            
            // Last year
            { 
              id: 'i3',
              date: new Date(currentYear - 1, 7, 8).toISOString(), 
              workshop: 'Summer Art Camp', 
              amount: 12000,
              status: 'PAID'
            },
            { 
              id: 'i4',
              date: new Date(currentYear - 1, 9, 12).toISOString(), 
              workshop: 'Drawing Fundamentals', 
              amount: 5500,
              status: 'PAID'
            },
            { 
              id: 'i5',
              date: new Date(currentYear - 1, 11, 5).toISOString(), 
              workshop: 'Holiday Crafts', 
              amount: 4000,
              status: 'PAID'
            },
            
            // 2 years ago
            { 
              id: 'i6',
              date: new Date(currentYear - 2, 3, 18).toISOString(), 
              workshop: 'Portrait Drawing', 
              amount: 6000,
              status: 'PAID'
            },
            
            // 3 years ago
            { 
              id: 'i7',
              date: new Date(currentYear - 3, 2, 10).toISOString(), 
              workshop: 'Introduction to Sculpture', 
              amount: 4000,
              status: 'PAID'
            }
          ]
        };
        
        observer.next(mockIncomeData);
        observer.complete();
      }, 300);
    });
    
    // When implementing the real API, it would look like this:
    /*
    const headers = this.getAuthHeaders();
    const url = `${environment.apiUrl}/students/${studentId}/income`;
    
    let params = new HttpParams();
    if (requesterId) {
      params = params.set('requesterId', requesterId);
    }
    
    return this.http.get<any>(url, { headers, params })
      .pipe(
        tap(income => console.log('Student income data:', income)),
        catchError(this.handleError('getStudentIncome'))
      );
    */
  }
}
