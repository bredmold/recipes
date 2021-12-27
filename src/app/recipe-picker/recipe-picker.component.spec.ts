import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipePickerComponent } from './recipe-picker.component';

describe('RecipePickerComponent', () => {
  let component: RecipePickerComponent;
  let fixture: ComponentFixture<RecipePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecipePickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
