import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MarksDTO {
  subjectName: string;
  marksObtained: number;
}

export interface MarksEntryRequest {
  studentId: number;
  semester: number;
  subjects: MarksDTO[];
}

export interface MarksResponseDTO {
  subjects: MarksDTO[];
  total: number;
  percentage: number;
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}
export interface StudentMarksSummaryDTO {
  studentId: number;
  name: string;
  total: number;
  percentage: number;
}
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page index
}



@Injectable({
  providedIn: 'root'
})
export class MarksheetService {
  private baseUrl = 'http://localhost:8080/marks';

  constructor(private http: HttpClient) {}

  submitMarks(payload: MarksEntryRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/bulk`, payload, { responseType: 'text' });
  }

  getMarksheetSummary(studentId: number, semester: number, page: number, size: number): Observable<MarksResponseDTO> {
    return this.http.get<MarksResponseDTO>(
      `${this.baseUrl}/marksheet/${studentId}?semester=${semester}&page=${page}&size=${size}`
    );
  }
  updateMarks(studentId: number, semester: number, subjectName: string, newMarks: number): Observable<string> {
  return this.http.put(`${this.baseUrl}/update`, null, {
    params: { studentId, semester, subjectName, newMarks },
    responseType: 'text'
  });
}


deleteAllMarks(studentId: number, semester: number): Observable<string> {
  return this.http.delete(`${this.baseUrl}/deleteAll`, {
    params: { studentId, semester },
    responseType: 'text'
  });
}
getPaginatedStudentSummary(page: number, size: number): Observable<Page<StudentMarksSummaryDTO>> {
  return this.http.get<Page<StudentMarksSummaryDTO>>(`${this.baseUrl}/summary?page=${page}&size=${size}`);
}



}
