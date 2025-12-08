import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../Service/AuthService';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  constructor(private router: Router, private auth: AuthService) {}

  goToStudentInfo() { this.router.navigate(['/students']); }
  goToCourses() { this.router.navigate(['/course']); }

  get isAdmin(): boolean { return this.auth.getRole() === 'ADMIN'; }
  get isTeacher(): boolean { return this.auth.getRole() === 'TEACHER'; }
  get isStudent(): boolean { return this.auth.getRole() === 'STUDENT'; }

  canManageTeachers(): boolean {
    const role = this.auth.getRole();
    return role === 'ADMIN' || role === 'TEACHER';
  }
}
