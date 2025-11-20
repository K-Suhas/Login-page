import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MailService {
  private baseUrl = 'http://localhost:8080/email';

  constructor(private http: HttpClient) {}

  sendToAll(subject: string, body: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/sendAll?subject=${subject}&body=${body}`, {});
  }

  sendToOne(toEmail: string, subject: string, body: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/send?toEmail=${toEmail}&subject=${subject}&body=${body}`, {});
  }
}
