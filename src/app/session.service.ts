import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor() {}

  loggedInEmail(): string | undefined {
    return 'bredmold@gmail.com';
  }
}
