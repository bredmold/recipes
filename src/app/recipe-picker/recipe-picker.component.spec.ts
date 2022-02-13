import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RecipePickerComponent} from './recipe-picker.component';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {ReactiveFormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {RecipeService} from "../recipe.service";
import {BehaviorSubject} from "rxjs";
import {Recipe} from "../types/recipe";
import createSpy = jasmine.createSpy;

describe('RecipePickerComponent', () => {
  let component: RecipePickerComponent;
  let fixture: ComponentFixture<RecipePickerComponent>;
  let routerSpy: any;
  let recipeServiceSpy: any;

  beforeEach(async () => {
    recipeServiceSpy = {
      viewRecipe: new BehaviorSubject<Recipe | undefined>(undefined),
      editRecipe: new BehaviorSubject<Recipe | undefined>(undefined),
      listRecipes: createSpy('listRecipes'),
    };
    recipeServiceSpy.listRecipes.and.returnValue(Promise.resolve([]));

    routerSpy = {navigate: jasmine.createSpy('navigate')};

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {
            }
          },
        },
        {
          provide: RecipeService,
          useValue: recipeServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
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
      ],
      declarations: [RecipePickerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select the item class for an un-selected recipe', () => {
    const itemClass = component.itemClass('recipe id');
    expect(itemClass.split(/ /)).toEqual(['recipe-picker-item']);
  });

  it('should select the item class for the active recipe', () => {
    const activeRecipe = new Recipe('title', 'desc', [], []);
    recipeServiceSpy.viewRecipe.next(activeRecipe);
    recipeServiceSpy.listRecipes.and.returnValue(Promise.resolve([activeRecipe]));

    const itemClass = component.itemClass(activeRecipe.id);

    expect(itemClass.split(/ /)).toEqual(['recipe-picker-item', 'recipe-picker-active'])
  });

  it('should select the desired recipe', () => {
    const activeRecipe = new Recipe('title', 'desc', [], []);
    component.recipes = [activeRecipe];

    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    component.selectRecipe(activeRecipe.id);

    const navArgs = routerSpy.navigate.calls.first().args[0];
    expect(navArgs).toEqual([`/recipe/${activeRecipe.id}`]);
  });

  it('should navigate to a new recipe edit screen', () => {
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    component.newRecipe();

    const navArgs = routerSpy.navigate.calls.first().args[0];
    expect(navArgs).toHaveSize(1);

    const navUri = navArgs[0] as string;
    expect(navUri).toMatch(/^\/recipe\/[a-z0-9-]{36}\/edit$/);
  });
});
