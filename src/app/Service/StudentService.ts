// src/app/Service/StudentService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentDTO {
  id?: number;
  name: string;
  dob?: string;
  dept?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:8080/student';

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<StudentDTO[]> {
    return this.http.get<StudentDTO[]>(this.baseUrl);
  }

  getStudentById(id: number): Observable<StudentDTO> {
    return this.http.get<StudentDTO>(`${this.baseUrl}/${id}`);
  }

  searchStudents(query: string): Observable<StudentDTO[]> {
    return this.http.get<StudentDTO[]>(`${this.baseUrl}/search?query=${query}`);
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
