import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './AuthService';

export interface StudentDTO {
  id?: number;
  name: string;
  dob?: string;
  email?: string;
  departmentId?: number;
  departmentName?: string;
  courseNames?: string[];
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private baseUrl = 'http://localhost:8080/student';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getIdToken()}`
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      message = `Client error: ${error.error.message}`;
    } else {
      message = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
    }
    return throwError(() => new Error(message));
  }

  getAllStudents(page: number, size: number): Observable<{ content: StudentDTO[]; totalPages: number; number: number }> {
  const params = new HttpParams().set('page', page).set('size', size);
  return this.http.get<{ content: StudentDTO[]; totalPages: number; number: number }>(
    `${this.baseUrl}`,
    { headers: this.getAuthHeaders(), params }
  );
}


  getStudentById(id: number): Observable<StudentDTO> {
    return this.http.get<StudentDTO>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  searchStudents(query: string, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/search?query=${query}&page=${page}&size=${size}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  addStudent(student: StudentDTO): Observable<string> {
    return this.http.post(this.baseUrl, student, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  updateStudent(id: number, student: StudentDTO): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, student, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  deleteStudent(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  uploadBulkStudents(students: StudentDTO[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk`, { students }, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  getStudentsByDepartment(deptId: number, page: number, size: number): Observable<{ content: StudentDTO[]; totalPages: number; number: number }> {
  const params = new HttpParams().set('page', page).set('size', size);
  return this.http.get<{ content: StudentDTO[]; totalPages: number; number: number }>(
    `${this.baseUrl}/by-department/${deptId}`,
    { headers: this.getAuthHeaders(), params }
  );
}




  addStudentToDepartment(deptId: number, student: StudentDTO): Observable<string> {
    return this.http.post(`${this.baseUrl}/department/${deptId}`, student, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }
}
