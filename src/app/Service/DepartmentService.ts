import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './AuthService';

export interface DepartmentDTO {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private baseUrl = 'http://localhost:8080/departments';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getIdToken()}`
    });
  }

  getAllDepartments(): Observable<DepartmentDTO[]> {
    return this.http.get<DepartmentDTO[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }
  addDepartment(dept: { name: string }): Observable<string> {
  return this.http.post('http://localhost:8080/departments', dept, {
    headers: this.getAuthHeaders(),
    responseType: 'text'
  });
}
updateDepartment(dept: DepartmentDTO): Observable<string> {
  return this.http.put(`${this.baseUrl}/${dept.id}`, dept, {
    headers: this.getAuthHeaders(),
    responseType: 'text'
  });
}

deleteDepartment(id: number): Observable<string> {
  return this.http.delete(`${this.baseUrl}/${id}`, {
    headers: this.getAuthHeaders(),
    responseType: 'text'
  });
}


}
