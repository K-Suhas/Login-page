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
   get isAdmin(): boolean {
    return this.auth.getRole() === 'ADMIN';
  }

  goToCourses() {
  this.router.navigate(['/course']);
}
goToAdminDashboard(): void {
  const role = this.auth.getRole();
  if (role === 'ADMIN') {
    this.router.navigate(['/admin-dashboard']).then(() => {
      window.history.pushState(null, '', '/admin-dashboard');
    });
  } else {
    this.router.navigate(['/admin-dashboard']);
  }
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
