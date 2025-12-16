// src/app/Service/AuthService.ts
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

  getDepartmentId(): number | null {
    return this.user?.departmentId || null;
  }

  getDepartmentName(): string | null {
    return this.user?.departmentName || null;
  }

  setDepartment(id: number | null, name: string | null) {
    if (!this.user) return;
    this.user.departmentId = id;
    this.user.departmentName = name;
    localStorage.setItem('user', JSON.stringify(this.user));
  }

  getEmail(): string | null {
    return this.user?.email || null;
  }

  isLoggedIn(): boolean {
    return !!this.user;
  }

  logout() {
    this.user = null;
    localStorage.removeItem('user');
  }
}
