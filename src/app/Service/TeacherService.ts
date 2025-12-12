// src/app/Service/TeacherService.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeacherDTO {
  id?: number;
  name: string;
  email: string;
  departmentId?: number;
  departmentName?: string;
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private baseUrl = 'http://localhost:8080/teacher';
  private deptUrl = 'http://localhost:8080/departments';

  constructor(private http: HttpClient) {}

  // Paginated getAll
  getAllTeachers(page: number, size: number): Observable<{ content: TeacherDTO[]; totalPages: number }> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<{ content: TeacherDTO[]; totalPages: number }>(this.baseUrl, { params });
  }

  // Paginated search
  searchTeachers(query: string, page: number, size: number): Observable<{ content: TeacherDTO[]; totalPages: number }> {
    const params = new HttpParams().set('query', query).set('page', page).set('size', size);
    return this.http.get<{ content: TeacherDTO[]; totalPages: number }>(`${this.baseUrl}/search`, { params });
  }

  // Single teacher
  getTeacherById(id: number): Observable<TeacherDTO> {
    return this.http.get<TeacherDTO>(`${this.baseUrl}/${id}`);
  }

  // Non-paginated by department
  getTeachersByDepartment(deptId: number): Observable<TeacherDTO[]> {
    return this.http.get<TeacherDTO[]>(`${this.baseUrl}/by-department/${deptId}`);
  }

  // ✅ Add returns plain string from backend, so expect text
  addTeacher(dto: TeacherDTO): Observable<string> {
    return this.http.post(`${this.baseUrl}`, dto, { responseType: 'text' });
  }

  // ✅ Update returns plain string
  updateTeacher(id: number, dto: TeacherDTO): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, dto, { responseType: 'text' });
  }

  // ✅ Delete returns plain string
  deleteTeacher(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  // Departments
  getAllDepartments(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(this.deptUrl);
  }
  // src/app/Service/TeacherService.ts
getTeacherByEmail(email: string): Observable<TeacherDTO> {
  const params = new HttpParams().set('email', email);
  return this.http.get<TeacherDTO>(`${this.baseUrl}/by-email`, { params });
}

}
