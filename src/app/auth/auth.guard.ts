import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService } from '../services/session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
  constructor(
    private router: Router,
    private sessionService: SessionService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const loggedIn = this.sessionService.isLoggedIn();
    if (!loggedIn) {
      this.router.navigate(['login']).then(
        () => {
          console.log('Navigated to login screen because not authorized');
        },
        (err) => {
          console.error(err);
        },
      );
    }
    return loggedIn;
  }
}
