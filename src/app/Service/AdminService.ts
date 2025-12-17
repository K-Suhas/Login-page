import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<{ students: any[]; courses: any[] }> {
    return this.http.get<{ students: any[]; courses: any[] }>('http://localhost:8080/admin/dashboard');
  }
   addAdmin(admin: { name: string; email: string}): Observable<any> {
    return this.http.post<any>('http://localhost:8080/auth/add-admin', admin);
  }
  
}
