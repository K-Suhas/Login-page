import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: any = null;

  constructor() {
    const stored = localStorage.getItem('user');
    this.user = stored ? JSON.parse(stored) : null;
  }

  setUser(user: any) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    return this.user;
  }

  getRole(): 'ADMIN' | 'TEACHER' | 'STUDENT' | null {
    return this.user?.role || null;
  }

  getIdToken(): string | null {
    return this.user?.token || null;
  }

  isLoggedIn(): boolean {
    return !!this.user;
  }

  logout() {
    this.user = null;
    localStorage.removeItem('user');
  }
}
