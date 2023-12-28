import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const loggedIn = sessionService.isLoggedIn();
  if (!loggedIn) {
    console.warn('No logged in user, routing to login screen');
    const router = inject(Router);
    return router.parseUrl('/login');
  } else {
    return true;
  }
};
