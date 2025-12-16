// src/app/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Service/AuthService';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.getRole();

  if (role === 'ADMIN') return true;

  if (role === 'STUDENT') router.navigate(['/student']);
  else if (role === 'TEACHER') router.navigate(['/teacher']);
  else router.navigate(['/login']);

  return false;
};
