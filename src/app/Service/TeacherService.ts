import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Frontend TeacherDTO interface
export interface TeacherDTO {
  id?: number;
  name: string;
  email: string;
  dept: string;
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private apiUrl = 'http://localhost:8080/teachers';

  constructor(private http: HttpClient) {}

  // ✅ Get all teachers
  getAllTeachers(): Observable<TeacherDTO[]> {
    return this.http.get<TeacherDTO[]>(this.apiUrl);
  }

  // ✅ Add a teacher
  addTeacher(teacher: TeacherDTO): Observable<TeacherDTO> {
    return this.http.post<TeacherDTO>(this.apiUrl, teacher);
  }

  // ✅ Update a teacher
  updateTeacher(id: number, teacher: TeacherDTO): Observable<TeacherDTO> {
    return this.http.put<TeacherDTO>(`${this.apiUrl}/${id}`, teacher);
  }

  // ✅ Delete a teacher
  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ✅ Search teachers (backend returns Page<TeacherDTO>)
  searchTeachers(query: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search?query=${query}&page=${page}&size=${size}`);
  }
}
