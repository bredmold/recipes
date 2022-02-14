import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RecipeEditorComponent} from './recipe-editor.component';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {ReactiveFormsModule} from '@angular/forms';
import {StepsComponent} from '../steps/steps.component';
import {AppComponent} from '../app.component';
import {IngredientsComponent} from '../ingredients/ingredients.component';
import {ActivatedRoute} from '@angular/router';
import {RecipeService} from "../recipe.service";
import {ActivatedRouteStub} from "../../testing/activated-route-stub";
import {Recipe} from "../types/recipe";

describe('RecipeEditorComponent', () => {
  let component: RecipeEditorComponent;
  let fixture: ComponentFixture<RecipeEditorComponent>;
  let activeRoute: ActivatedRouteStub;
  let recipeServiceSpy: any;

  beforeEach(async () => {
    activeRoute = new ActivatedRouteStub();

    recipeServiceSpy = {
      setEditRecipe: jasmine.createSpy('setEditRecipe'),
      getRecipeById: jasmine.createSpy('getRecipeById'),
    };
    recipeServiceSpy.getRecipeById.and.returnValue(Promise.reject('nope'));

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activeRoute,
        },
        {
          provide: RecipeService,
          useValue: recipeServiceSpy
        },
      ],
      declarations: [AppComponent, IngredientsComponent, StepsComponent, RecipeEditorComponent],
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatSelectModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should activate recipe when found', async () => {
    const recipe = new Recipe('title', 'desc', [], []);
    recipeServiceSpy.getRecipeById.withArgs(recipe.id).and.returnValue(Promise.resolve(recipe));

    activeRoute.setParamMap({id: recipe.id});

    await fixture.whenStable();

    expect(component.recipe).toEqual(recipe);
  });

  it('Should generate a new recipe when none is given', async () => {
    await fixture.whenStable();
    expect(component.recipe).toBeTruthy();
  });

  it('should update the recipe title', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const titleInput: HTMLInputElement = window.document.getElementById('titleInput') as HTMLInputElement;
    titleInput.value = 'new title';
    titleInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.recipe?.title).toBe('new title');
  });
});
