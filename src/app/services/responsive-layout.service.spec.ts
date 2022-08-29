import { TestBed } from '@angular/core/testing';

import { LayoutMode, ResponsiveLayoutService } from './responsive-layout.service';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

describe('ResponsiveLayoutService', () => {
  let service: ResponsiveLayoutService;
  let breakpointObserverSpy: any;

  let tabletLandscapeSubject: BehaviorSubject<BreakpointState>;
  let tabletPortraitSubject: BehaviorSubject<BreakpointState>;
  let handsetLandscapeSubject: BehaviorSubject<BreakpointState>;
  let handsetPortraitSubject: BehaviorSubject<BreakpointState>;

  beforeEach(() => {
    tabletPortraitSubject = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });
    tabletLandscapeSubject = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });
    handsetLandscapeSubject = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });
    handsetPortraitSubject = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });

    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserverSpy.observe.withArgs(Breakpoints.TabletLandscape).and.returnValue(tabletLandscapeSubject);
    breakpointObserverSpy.observe.withArgs(Breakpoints.TabletPortrait).and.returnValue(tabletPortraitSubject);
    breakpointObserverSpy.observe.withArgs(Breakpoints.HandsetLandscape).and.returnValue(handsetLandscapeSubject);
    breakpointObserverSpy.observe.withArgs(Breakpoints.HandsetPortrait).and.returnValue(handsetPortraitSubject);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: BreakpointObserver,
          useValue: breakpointObserverSpy,
        },
      ],
    });
    service = TestBed.inject(ResponsiveLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to tablet landscape', () => {
    expect(service.layoutMode.getValue()).toEqual(LayoutMode.TableLandscape);
  });

  it('should return table landscape', () => {
    tabletLandscapeSubject.next({ matches: true, breakpoints: {} });
    expect(service.layoutMode.getValue()).toEqual(LayoutMode.TableLandscape);
  });

  it('should return tablet portrait', () => {
    tabletPortraitSubject.next({ matches: true, breakpoints: {} });
    expect(service.layoutMode.getValue()).toEqual(LayoutMode.TablePortrait);
  });

  it('should return handset portrait', () => {
    handsetPortraitSubject.next({ matches: true, breakpoints: {} });
    expect(service.layoutMode.getValue()).toEqual(LayoutMode.HandsetPortrait);
  });

  it('should return handset landscape', () => {
    handsetLandscapeSubject.next({ matches: true, breakpoints: {} });
    expect(service.layoutMode.getValue()).toEqual(LayoutMode.HandsetLandscape);
  });
});
