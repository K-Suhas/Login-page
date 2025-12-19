// src/app/Service/SubjectChoiceService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubjectChoiceService {
  private baseUrl = 'http://localhost:8080/subject-choice';

  constructor(private http: HttpClient) {}

  // Student saves subject choices
  createStudentChoice(payload: {
    studentId: number;
    departmentId: number;
    semester: number;
    subjectIds: number[];
  }): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

  // Get chosen subjects (used by Teacher/Admin when loading marks)
  getStudentChoice(studentId: number, semester: number): Observable<any> {
    return this.http.get(`${this.baseUrl}?studentId=${studentId}&semester=${semester}`);
  }
  getSubjectsByIds(ids: number[]): Observable<any[]> {
  return this.http.post<any[]>(`${this.baseUrl}/by-ids`, ids);
}

}
