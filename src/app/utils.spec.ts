import { RouterStateSnapshot } from '@angular/router';

export function fakeRouterState(url: string): RouterStateSnapshot {
  return {
    url,
  } as RouterStateSnapshot;
}
