import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class AcademiesService {
  private apiUrl = `${environment.apiUrl}/academies`;

  constructor(private http: HttpClient) {}

  async createAcademy(ownerId: number, data: { name: string; bio?: string; logoUrl?: string }) {
    return this.http.post(this.apiUrl, { ownerId, ...data }).toPromise();
  }

  async getAcademies(userId: number) {
    return this.http.get(`${this.apiUrl}/user/${userId}`).toPromise();
  }
} 