import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = 'http://localhost:8080/notifications';  // ✅ must match backend

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/read`, {});
  }
}

