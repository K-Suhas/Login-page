import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class App {
  username = '';
  password = '';
  isSignedUp = false;
  message = '';

  constructor(public router: Router) {} // Changed from private to public

  handleLogin() {
    if (this.username === 'Suhas' && this.password === 'Suhas@02') {
      this.router.navigate(['/students']);
    } else {
      this.message = 'Invalid credentials. Please try again.';
    }
  }

  handleSignup() {
    if (this.username.trim() && this.password.trim()) {
      this.message = `Account created for ${this.username}. You can now log in.`;
      this.isSignedUp = false;
      this.username = '';
      this.password = '';
    } else {
      this.message = 'Please enter both username and password to sign up.';
    }
  }

  switchToSignup() {
    this.isSignedUp = true;
    this.username = '';
    this.password = '';
    this.message = '';
  }
}