import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function authGuard(): boolean | UrlTree {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  if (authService.authenticated === true) {
    return true;
  }

  return router.parseUrl('/sign-in');
}
