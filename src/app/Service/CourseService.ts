import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './AuthService';

export interface CourseDTO {
  id?: number;
  name: string;
  departmentId?: number;
  departmentName?: string;
  studentNames?: string[];
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private baseUrl = 'http://localhost:8080/course';

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
      message = typeof error.error === 'string'
        ? error.error
        : (error.error?.message || JSON.stringify(error.error));
    }
    return throwError(() => new Error(message));
  }

  // Admin: paginated
  getAllCourses(page: number, size: number): Observable<{ content: CourseDTO[]; totalPages: number; totalElements: number; number: number }> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<{ content: CourseDTO[]; totalPages: number; totalElements: number; number: number }>(
      `${this.baseUrl}`,
      { headers: this.getAuthHeaders(), params }
    ).pipe(catchError(this.handleError));
  }

  // Teacher: plain list
 // src/app/Service/CourseService.ts
getCoursesByDepartment(deptId: number): Observable<CourseDTO[]> {
  return this.http.get<CourseDTO[]>(`${this.baseUrl}/by-department/${deptId}`, {
    headers: this.getAuthHeaders()
  }).pipe(catchError(this.handleError));
}


  getCourseById(id: number): Observable<CourseDTO> {
    return this.http.get<CourseDTO>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Admin global search
  searchCourses(query: string, page: number, size: number): Observable<{ content: CourseDTO[]; totalPages: number; totalElements: number; number: number }> {
    return this.http.get<{ content: CourseDTO[]; totalPages: number; totalElements: number; number: number }>(
      `${this.baseUrl}/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  // Department‑restricted search
  searchCoursesByDepartment(query: string, deptId: number, page: number, size: number): Observable<{ content: CourseDTO[]; totalPages: number; totalElements: number; number: number }> {
    return this.http.get<{ content: CourseDTO[]; totalPages: number; totalElements: number; number: number }>(
      `${this.baseUrl}/search?query=${encodeURIComponent(query)}&deptId=${deptId}&page=${page}&size=${size}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  addCourse(course: CourseDTO): Observable<string> {
    return this.http.post(this.baseUrl, course, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  updateCourse(id: number, course: CourseDTO): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, course, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  deleteCourse(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  // Departments for dropdown
  getAllDepartments(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(`${this.baseUrl}/departments`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }
}
