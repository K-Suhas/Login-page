// src/app/Service/MarksheetService.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './AuthService';

export interface MarksDTO {
  subjectId: number | null;
  subjectName: string;
  marksObtained: number;
}

export interface MarksEntryRequest {
  studentId: number;
  semester: number;
  subjects: MarksDTO[];
}

export interface MarksResponseDTO {
  subjects: MarksDTO[];
  total: number;
  percentage: number;
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface StudentMarksSummaryDTO {
  studentId: number;
  name: string;
  total: number;
  percentage: number;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface StudentInfo {
  studentId: number;
  name: string;
}

export interface PercentageGroup {
  count: number;
  students: StudentInfo[];
}

@Injectable({ providedIn: 'root' })
export class MarksheetService {
  private baseUrl = 'http://localhost:8080/marks';
  private subjectBaseUrl = 'http://localhost:8080/subject';
  private studentBaseUrl = 'http://localhost:8080/student';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getIdToken() || ''}` });
  }

  getSubjectsForStudent(studentId: number, semester: number): Observable<{ id: number; name: string; semester: number }[]> {
    return this.http.get<{ id: number; name: string; semester: number }[]>(
      `${this.subjectBaseUrl}/for-student/${studentId}?semester=${semester}`,
      { headers: this.headers() }
    );
  }

  submitMarks(payload: MarksEntryRequest): Observable<string> {
    const email = this.auth.getEmail() || '';
    const params = new HttpParams().set('email', email);
    return this.http.post(`${this.baseUrl}/bulk`, payload, {
      headers: this.headers(),
      params,
      responseType: 'text'
    });
  }

  getMarksheetSummary(studentId: number, semester: number, page: number, size: number): Observable<MarksResponseDTO> {
    const email = this.auth.getEmail() || '';
    return this.http.get<MarksResponseDTO>(
      `${this.baseUrl}/marksheet/${studentId}?semester=${semester}&page=${page}&size=${size}&email=${encodeURIComponent(email)}`,
      { headers: this.headers() }
    );
  }


  updateMarks(studentId: number, semester: number, subjectId: number, newMarks: number): Observable<string> {
    const email = this.auth.getEmail() || '';
    const params = new HttpParams()
      .set('studentId', studentId)
      .set('semester', semester)
      .set('subjectId', subjectId)
      .set('newMarks', newMarks)
      .set('email', email);

    return this.http.put(`${this.baseUrl}/update`, null, {
      headers: this.headers(),
      params,
      responseType: 'text'
    });
  }
  

  deleteAllMarks(studentId: number, semester: number): Observable<string> {
    const email = this.auth.getEmail() || '';
    const params = new HttpParams()
      .set('studentId', studentId)
      .set('semester', semester)
      .set('email', email);

    return this.http.delete(`${this.baseUrl}/deleteAll`, {
      headers: this.headers(),
      params,
      responseType: 'text'
    });
  }

  getPaginatedStudentSummary(page: number, size: number): Observable<Page<StudentMarksSummaryDTO>> {
  const email = this.auth.getEmail() || '';
  return this.http.get<Page<StudentMarksSummaryDTO>>(
    `${this.baseUrl}/summary?page=${page}&size=${size}&email=${encodeURIComponent(email)}`,
    { headers: this.headers() }
  );
}

 getStudentDepartment(studentId: number): Observable<{ id: number; name: string }> {
    return this.http.get<{ id: number; name: string }>(
      `${this.studentBaseUrl}/${studentId}/department`,
      { headers: this.headers() }
    );
 }


  getPercentageDistribution(): Observable<{ [range: string]: PercentageGroup }> {
    return this.http.get<{ [range: string]: PercentageGroup }>(
      `${this.baseUrl}/distribution`,
      { headers: this.headers() }
    );
  }
}
