import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SignInComponent} from './sign-in.component';
import {Router, RouterModule} from "@angular/router";
import {MatDialogModule} from "@angular/material/dialog";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatListModule} from "@angular/material/list";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SessionService} from "../../session.service";

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let routerSpy: any;
  let sessionServiceSpy: any;

  beforeEach(async () => {
    routerSpy = {navigate: jasmine.createSpy('navigate')};

    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['activateSession']);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: SessionService,
          useValue: sessionServiceSpy,
        },
      ],
      imports: [
        MatDialogModule,
        BrowserModule,
        RouterModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatSelectModule,
        ReactiveFormsModule,
        FormsModule,
      ],
      declarations: [SignInComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
