import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { IngredientsComponent } from './ingredients/ingredients.component';
import { StepsComponent } from './steps/steps.component';
import { RecipeEditorComponent } from './recipe-editor/recipe-editor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { RecipeService } from './recipe.service';
import { BehaviorSubject } from 'rxjs';
import { Recipe } from './types/recipe';
import { Router } from '@angular/router';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let recipeServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    recipeServiceSpy = {
      viewRecipe: new BehaviorSubject<Recipe | undefined>(undefined),
      editRecipe: new BehaviorSubject<Recipe | undefined>(undefined),
      saveRecipe: jasmine.createSpy('saveRecipe'),
      storageSetup: jasmine.createSpy('storageSetup'),
    };

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: RecipeService,
          useValue: recipeServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
      ],
      declarations: [AppComponent, IngredientsComponent, StepsComponent, RecipeEditorComponent],
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatDialogModule,
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
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should return the default recipe title', async () => {
    await fixture.whenStable();
    expect(app.recipeTitle()).toEqual('Recipe Picker');
    expect(app.editLink()).toEqual('');
  });

  it('should set the view recipe in response to an event', async () => {
    expect(app.viewRecipe).toBeUndefined();

    const recipe = new Recipe('view', 'desc', [], [], []);
    recipeServiceSpy.viewRecipe.next(recipe);
    await fixture.whenStable();

    expect(app.viewRecipe).toBeTruthy();
    expect(app.isSaveDisabled()).toBeTrue();
    expect(app.isEditDisabled()).toBeFalse();
    expect(app.recipeTitle()).toEqual('view');
    expect(app.editLink()).toEqual(`recipe/${recipe.id}/edit`);
  });

  it('should set the edit recipe in response to an event', async () => {
    expect(app.editRecipe).toBeUndefined();

    const recipe = new Recipe('edit', 'desc', [], [], []);
    recipeServiceSpy.editRecipe.next(recipe);
    await fixture.whenStable();

    expect(app.editRecipe).toBeTruthy();
    expect(app.isSaveDisabled()).toBeFalse();
    expect(app.isEditDisabled()).toBeTrue();
    expect(app.recipeTitle()).toEqual('edit');
    expect(app.editLink()).toEqual('');
  });

  it('should save the edit recipe', async () => {
    const recipe = new Recipe('title', 'desc', [], [], []);
    recipeServiceSpy.editRecipe.next(recipe);
    await fixture.whenStable();

    recipeServiceSpy.saveRecipe.and.returnValue(Promise.resolve(recipe));
    app.recipeSave();

    await fixture.whenStable();
    expect(recipeServiceSpy.saveRecipe.calls.count()).toEqual(1);
  });
});
