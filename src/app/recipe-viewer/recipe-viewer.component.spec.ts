import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeViewerComponent } from './recipe-viewer.component';

describe('RecipeViewerComponent', () => {
  let component: RecipeViewerComponent;
  let fixture: ComponentFixture<RecipeViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecipeViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
