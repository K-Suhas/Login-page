// src/app/Service/SubjectService.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './AuthService';
import { Observable } from 'rxjs';

export interface SubjectDTO {
  id?: number;
  name: string;
  semester: number;
  departmentId: number;
  departmentName?: string;
}

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private baseUrl = 'http://localhost:8080/subject';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getIdToken() || ''}` });
  }

  // Admin: create subject
  createSubject(dto: SubjectDTO): Observable<string> {
    return this.http.post(`${this.baseUrl}`, dto, {
      headers: this.headers(),
      responseType: 'text'
    });
  }

  // Admin: view subjects by department + semester
  getByDepartmentAndSemester(deptId: number, semester: number): Observable<SubjectDTO[]> {
    return this.http.get<SubjectDTO[]>(`${this.baseUrl}/by-department/${deptId}?semester=${semester}`, {
      headers: this.headers()
    });
  }

  // Teacher/Admin: get subjects for a student (with email for department restriction)
  getForStudent(studentId: number, semester: number): Observable<SubjectDTO[]> {
    const email = this.auth.getEmail() || '';
    return this.http.get<SubjectDTO[]>(
      `${this.baseUrl}/for-student/${studentId}?semester=${semester}&email=${encodeURIComponent(email)}`,
      { headers: this.headers() }
    );
  }

  // Admin: update subject
  updateSubject(id: number, dto: SubjectDTO): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, dto, {
      headers: this.headers(),
      responseType: 'text'
    });
  }

  // Admin: delete subject
  deleteSubject(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.headers(),
      responseType: 'text'
    });
  }
}
