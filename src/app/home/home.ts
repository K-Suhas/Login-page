import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  goToStudentInfo() {
    this.router.navigate(['/students']);
  }
  goToCourses() {
  this.router.navigate(['/course']);
}

}
