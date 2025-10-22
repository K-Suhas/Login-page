import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentDTO {
  id?: number;
  name: string;
  dob?: string;
  dept?: string;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = 'http://localhost:8080/student'; // use proxy during dev

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<StudentDTO[]> {
    return this.http.get<StudentDTO[]>(this.apiUrl);
  }

  getStudentById(id: number): Observable<StudentDTO> {
    return this.http.get<StudentDTO>(`${this.apiUrl}/${id}`);
  }

  createStudent(student: Partial<StudentDTO>): Observable<string> {
    return this.http.post(this.apiUrl, student, { responseType: 'text' });
  }

  updateStudent(id: number, student: Partial<StudentDTO>): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}`, student, { responseType: 'text' });
  }

  deleteStudent(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}