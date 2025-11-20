import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './Service/AuthService';
import { CommonModule } from '@angular/common'; 

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet,CommonModule]
})
export class AppComponent implements OnInit, AfterViewInit {
  message = '';
  showLogin = true;

  constructor(public router: Router, private auth: AuthService) {}

  ngOnInit() {
    // Sync login state with route
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const isLoginRoute = this.router.url === '/login';
        const isLoggedIn = this.auth.isLoggedIn();
        this.showLogin = isLoginRoute && !isLoggedIn;

        if (isLoginRoute && isLoggedIn) {
          this.redirectByRole(this.auth.getRole());
        }

        if (this.showLogin) {
          setTimeout(() => this.renderGoogleButton(), 0);
        }
      });
  }

  ngAfterViewInit() {
    if (this.showLogin) {
      setTimeout(() => this.renderGoogleButton(), 0);
    }
  }

  renderGoogleButton() {
    const container = document.getElementById('google-signin-button');
    if (container && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '285503942744-fbj2r4pof7nhcq1259g1gk6c6abt0tu4.apps.googleusercontent.com',
        callback: (response: any) => {
          console.log('Google ID token:', response.credential);
          this.verifyTokenWithBackend(response.credential);
        }
      });

      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      });
    }
  }

  verifyTokenWithBackend(token: string) {
    fetch('http://localhost:8080/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token })
    })
      .then(res => {
        if (!res.ok) throw new Error('Backend rejected token');
        return res.json();
      })
      .then(user => {
        this.auth.setUser(user);
        this.showLogin = false;
        this.redirectByRole(user.role);
      })
      .catch(err => {
        this.message = 'Google login failed. Please try again.';
        console.error(err);
      });
  }

  redirectByRole(role: string | null) {
  switch (role) {
    case 'ADMIN':
      this.router.navigate(['/admin-dashboard']);
      break;
    case 'TEACHER':
      this.router.navigate(['/teacher-dashboard']);
      break;
    case 'STUDENT':
      this.router.navigate(['/student-dashboard']);
      break;
    default:
      // If role is null or unknown, go to login
      this.router.navigate(['/login']);
  }
}


  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.showLogin = true;
    setTimeout(() => this.renderGoogleButton(), 0);
  }
}
