import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';

export enum LayoutMode {
  TabletPortrait,
  TabletLandscape,
  HandsetLandscape,
  HandsetPortrait,
}

@Injectable({
  providedIn: 'root',
})
export class ResponsiveLayoutService {
  public readonly layoutMode: BehaviorSubject<LayoutMode> = new BehaviorSubject<LayoutMode>(LayoutMode.TabletPortrait);

  constructor(breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe(Breakpoints.TabletLandscape).subscribe((result) => {
      if (result.matches) {
        console.log('TableLandscape');
        this.layoutMode.next(LayoutMode.TabletPortrait);
      }
    });
    breakpointObserver.observe(Breakpoints.TabletPortrait).subscribe((result) => {
      if (result.matches) {
        console.log('TablePortrait');
        this.layoutMode.next(LayoutMode.TabletLandscape);
      }
    });
    breakpointObserver.observe(Breakpoints.HandsetLandscape).subscribe((result) => {
      if (result.matches) {
        console.log('HandsetLandscape');
        this.layoutMode.next(LayoutMode.HandsetLandscape);
      }
    });
    breakpointObserver.observe(Breakpoints.HandsetPortrait).subscribe((result) => {
      if (result.matches) {
        console.log('HandsetPortrait');
        this.layoutMode.next(LayoutMode.HandsetPortrait);
      }
    });
  }
}
