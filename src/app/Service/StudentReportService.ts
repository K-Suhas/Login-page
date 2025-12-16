// src/app/Service/StudentReportService.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './AuthService';

export interface MarksDTO {
  subjectId?: number;
  subjectName: string;
  marksObtained: number;
}

export interface StudentMarksheetDTO {
  id: number;
  name: string;
  departmentName: string;   // must match backend
  email: string;
  dob: string;
  courseNames?: string[];
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

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getIdToken() || ''}` });
  }

  // Bulk report (admin)
  startReport(semester?: number): Observable<string> {
    const url = semester != null ? `${this.baseUrl}/students/start?semester=${semester}` : `${this.baseUrl}/students/start`;
    return this.http.post(url, {}, { headers: this.headers(), responseType: 'text' });
  }

  getStatus(jobId: string): Observable<ReportJobStatusDTO> {
    return this.http.get<ReportJobStatusDTO>(`${this.baseUrl}/students/status/${jobId}`, { headers: this.headers() });
  }

  downloadReport(jobId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/students/download/${jobId}`, { headers: this.headers(), responseType: 'blob' });
  }

  // Individual report (admin + teacher)
  getIndividualReport(studentId: number, semester: number): Observable<StudentMarksheetDTO> {
    return this.http.get<StudentMarksheetDTO>(`${this.baseUrl}/${studentId}?semester=${semester}`, { headers: this.headers() });
  }

  downloadIndividualReport(studentId: number, semester: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${studentId}?semester=${semester}`, { headers: this.headers(), responseType: 'blob' });
  }
}
