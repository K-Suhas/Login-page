// src/app/Service/CourseService.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CourseDTO {
  id?: number;
  name: string;
  studentNames?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private baseUrl = 'http://localhost:8080/course';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
  let message = 'An unknown error occurred';

  if (error.error instanceof ErrorEvent) {
    message = `Client error: ${error.error.message}`;
  } else {
    // Use backend message directly if available
    message = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
  }

  return throwError(() => new Error(message));
}

  getAllCourses(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?page=${page}&size=${size}`).pipe(
      catchError(this.handleError)
    );
  }

  getCourseById(id: number): Observable<CourseDTO> {
    return this.http.get<CourseDTO>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  searchCourses(query: string, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/search?query=${query}&page=${page}&size=${size}`).pipe(
      catchError(this.handleError)
    );
  }

  addCourse(course: CourseDTO): Observable<string> {
    return this.http.post(this.baseUrl, course, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  updateCourse(id: number, course: CourseDTO): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, course, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteCourse(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }
}
