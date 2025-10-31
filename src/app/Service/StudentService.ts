import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      message = `Client error: ${error.error.message}`;
    } else {
      message = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
    }

    return throwError(() => new Error(message));
  }

  getAllStudents(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?page=${page}&size=${size}`).pipe(
      catchError(this.handleError)
    );
  }

  getStudentById(id: number): Observable<StudentDTO> {
    return this.http.get<StudentDTO>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  searchStudents(query: string, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/search?query=${query}&page=${page}&size=${size}`).pipe(
      catchError(this.handleError)
    );
  }

  addStudent(student: StudentDTO): Observable<string> {
    return this.http.post(this.baseUrl, student, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  updateStudent(id: number, student: StudentDTO): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, student, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteStudent(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }
}
