// src/app/Service/AdminReportService.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './AuthService';

export interface ReportJobStatusDTO {
  jobId: string;
  progress: number;
  state: 'PENDING' | 'RUNNING' | 'READY' | 'FAILED' | 'NOT_FOUND';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AdminReportService {
  private baseUrl = 'http://localhost:8080/admin/reports/students';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getIdToken()}`
    });
  }

  startReport(): Observable<string> {
    return this.http.post(`${this.baseUrl}/start`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  getStatus(jobId: string): Observable<ReportJobStatusDTO> {
    return this.http.get<ReportJobStatusDTO>(`${this.baseUrl}/status/${jobId}`, {
      headers: this.getAuthHeaders()
    });
  }

  downloadReport(jobId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${jobId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
}
