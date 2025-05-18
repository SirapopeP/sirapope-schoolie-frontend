import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '@env';
import { AuthService } from './auth.service';
import { catchError, tap } from 'rxjs/operators';

export interface Academy {
  id: string;
  name: string;
  bio?: string;
  logoUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademyRequest {
  ownerId: string;
  name: string;
  bio?: string;
  logoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AcademiesService {
  private apiUrl = `${environment.apiUrl}/academies`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Create a new academy
   */
  createAcademy(data: CreateAcademyRequest): Observable<Academy> {
    console.log('AcademiesService: Creating academy with data:', JSON.stringify(data));
    
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('AcademiesService: Authentication token not available');
      return throwError(() => new Error('Authentication required'));
    }

    // Ensure token is in the correct format (Bearer token)
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    console.log(`AcademiesService: Using token: ${authToken.substring(0, 20)}...`);
    
    // Set authorization header
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': authToken
    });
    
    console.log('AcademiesService: Creating academy with request:', {
      apiUrl: this.apiUrl,
      requestData: data,
      headerKeys: headers.keys()
    });
    
    return this.http.post<Academy>(this.apiUrl, data, { headers })
      .pipe(
        tap(response => {
          console.log('AcademiesService: Academy created successfully:', response);
        }),
        catchError(error => {
          console.error('AcademiesService: Error in academy creation API call:', error);
          console.error('AcademiesService: Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          
          if (error.status === 403) {
            console.error('AcademiesService: User does not have permission to create academy. Must be ACADEMY_OWNER role.');
          }
          
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Get all academies for a user
   */
  getUserAcademies(userId: string): Observable<Academy[]> {
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('Authentication token not available');
      return throwError(() => new Error('Authentication required'));
    }
    
    // Ensure token is in the correct format (Bearer token)
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    // Set authorization header
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': authToken
    });
    
    return this.http.get<Academy[]>(`${this.apiUrl}/user/${userId}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error in get user academies API call:', error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Get academy details by ID
   */
  getAcademyById(academyId: string): Observable<Academy> {
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('Authentication token not available');
      return throwError(() => new Error('Authentication required'));
    }
    
    // Ensure token is in the correct format (Bearer token)
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    // Set authorization header
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': authToken
    });
    
    return this.http.get<Academy>(`${this.apiUrl}/${academyId}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error in get academy API call:', error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Update academy details
   */
  updateAcademy(academyId: string, data: Partial<CreateAcademyRequest>): Observable<Academy> {
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('Authentication token not available');
      return throwError(() => new Error('Authentication required'));
    }
    
    // Ensure token is in the correct format (Bearer token)
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    // Set authorization header
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': authToken
    });
    
    return this.http.put<Academy>(`${this.apiUrl}/${academyId}`, data, { headers })
      .pipe(
        catchError(error => {
          console.error('Error in update academy API call:', error);
          return throwError(() => error);
        })
      );
  }
} 