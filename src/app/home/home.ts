import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../Service/AuthService';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  constructor(private router: Router, private auth: AuthService) {}

  goToStudentInfo() {
    this.router.navigate(['/students']);
  }
  goToCourses() {
  this.router.navigate(['/course']);
}
canAccessCourses(): boolean {
  const role = this.auth.getRole();
  return role === 'ADMIN';
}

canManageStudents(): boolean {
  const role = this.auth.getRole();
  return role !== null && ['ADMIN', 'TEACHER'].includes(role);
}

}
