// src/app/Service/StudentService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentDTO {
  id?: number;
  name: string;
  dob?: string;
  dept?: string;
  courseNames?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:8080/student';

  constructor(private http: HttpClient) {}

 getAllStudents(page: number, size: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}?page=${page}&size=${size}`);
}
  getStudentById(id: number): Observable<StudentDTO> {
    return this.http.get<StudentDTO>(`${this.baseUrl}/${id}`);
  }

  searchStudents(query: string, page: number, size: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/search?query=${query}&page=${page}&size=${size}`);
}

  addStudent(student: StudentDTO): Observable<string> {
    return this.http.post(this.baseUrl, student, { responseType: 'text' });
  }

  updateStudent(id: number, student: StudentDTO): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, student, { responseType: 'text' });
  }

  deleteStudent(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}
