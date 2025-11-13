import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../Service/AuthService';
import { Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getRole();

  if (role === 'ADMIN') {
    return true;
  }

  // Redirect non-admins to their default flow
  if (role === 'STUDENT') {
    router.navigate(['/student-dashboard']);
  } else if (role === 'TEACHER') {
    router.navigate(['/teacher-dashboard']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
