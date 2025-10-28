// src/app/Service/CourseService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  getAllCourses(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?page=${page}&size=${size}`);
  }

  getCourseById(id: number): Observable<CourseDTO> {
    return this.http.get<CourseDTO>(`${this.baseUrl}/${id}`);
  }

  searchCourses(query: string, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/search?query=${query}&page=${page}&size=${size}`);
  }

  addCourse(course: CourseDTO): Observable<string> {
    return this.http.post(this.baseUrl, course, { responseType: 'text' });
  }

  updateCourse(id: number, course: CourseDTO): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, course, { responseType: 'text' });
  }

  deleteCourse(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}
