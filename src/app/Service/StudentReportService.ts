// src/app/services/student-report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './AuthService';

export interface MarksDTO {
  subjectName: string;
  marksObtained: number;
}

export interface StudentMarksheetDTO {
  id: number;
  name: string;
  dept: string;
  email: string;
  dob: string;
  courseNames: string[];
  totalMarks: number;
  percentage: number;
  subjects: MarksDTO[];
}

export interface ReportJobStatusDTO {
  jobId: string;
  progress: number;
  state: 'PENDING' | 'RUNNING' | 'READY' | 'FAILED' | 'NOT_FOUND';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class StudentReportService {
  private baseUrl = 'http://localhost:8080/admin/reports';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getIdToken()}`
    });
  }

  // ===== Bulk report (AdminDashboard) =====
  startReport(): Observable<string> {
    return this.http.post(`${this.baseUrl}/students/start`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  getStatus(jobId: string): Observable<ReportJobStatusDTO> {
    return this.http.get<ReportJobStatusDTO>(`${this.baseUrl}/students/status/${jobId}`, {
      headers: this.getAuthHeaders()
    });
  }

  downloadReport(jobId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/students/download/${jobId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  // ===== Individual report (Marksheet) =====
  getIndividualReport(studentId: number, semester: number): Observable<StudentMarksheetDTO> {
    return this.http.get<StudentMarksheetDTO>(
      `${this.baseUrl}/${studentId}?semester=${semester}`,
      { headers: this.getAuthHeaders() }
    );
  }

  downloadIndividualReport(studentId: number, semester: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${studentId}?semester=${semester}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
}
