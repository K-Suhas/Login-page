import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './Service/AuthService'; // adjust path if needed
import { PercentageGraphComponent } from './percentage-graph/percentage-graph';

declare global {
  interface Window {
    google: any;
    handleCredentialResponse: (response: any) => void;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule// ✅ Required for <router-outlet>
  
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})



export class App implements OnInit, AfterViewInit {
  message = '';
  showLogin = true;

  constructor(public router: Router, private auth: AuthService) {}

  ngOnInit() {
    // Define global callback early
    window.handleCredentialResponse = (response: any) => {
      console.log('Google token received:', response.credential);
      this.verifyTokenWithBackend(response.credential);
    };

    // Sync login state with route and localStorage
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const isLoginRoute = this.router.url === '/login';
      const isLoggedIn = this.auth.isLoggedIn();
      this.showLogin = isLoginRoute && !isLoggedIn;

    if (isLoginRoute && isLoggedIn) {
  const role = this.auth.getRole();
  if (role === 'ADMIN') {
    this.router.navigate(['/admin-dashboard']);
  } else if (role === 'TEACHER') {
    this.router.navigate(['/teacher-dashboard']);
  } else {
    this.router.navigate(['/student-dashboard']);
  }
}


      // Re-render button if needed
      if (this.showLogin) {
        setTimeout(() => this.renderGoogleButton(), 0);
      }
    });
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit triggered');

    // Initial render if login is visible
    if (this.showLogin) {
      setTimeout(() => this.renderGoogleButton(), 0);
    }
  }
  

  renderGoogleButton() {
    const container = document.getElementById('google-signin-button');
    if (container && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '285503942744-fbj2r4pof7nhcq1259g1gk6c6abt0tu4.apps.googleusercontent.com',
        callback: window.handleCredentialResponse
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
    body: JSON.stringify({ idToken: token }) // ✅ match backend key
  })
    .then(res => {
      if (!res.ok) throw new Error('Backend rejected token');
      return res.json();
    })
    .then(user => {
      console.log('Verified user:', user);
      this.auth.setUser(user); // ✅ store user and role
      this.showLogin = false;

      const role = user.role;
      if (role === 'ADMIN') {
        this.router.navigate(['/admin-dashboard']).then(() => {
          // Lock dashboard in history
          window.history.pushState(null, '', '/admin-dashboard');
        });
      } else if (role === 'TEACHER') {
        this.router.navigate(['/teacher-dashboard']);
      } else {
        this.router.navigate(['/student-dashboard']);
      }
    })
    .catch(err => {
      this.message = 'Google login failed. Please try again.';
      console.error('Login error:', err);
    });
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
