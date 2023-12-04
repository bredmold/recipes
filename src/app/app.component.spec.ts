import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
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
import { RecipeService } from './services/recipe.service';
import { BehaviorSubject } from 'rxjs';
import { Recipe } from './types/recipe';
import { Router } from '@angular/router';
import { LayoutMode, ResponsiveLayoutService } from './services/responsive-layout.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DeleteRecipeDialog } from './recipe-delete/delete-recipe-dialog';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let recipeServiceSpy: any;
  let routerSpy: any;
  let responsiveLayoutServiceSpy: any;
  let loader: HarnessLoader;

  beforeEach(async () => {
    recipeServiceSpy = {
      viewRecipe: new BehaviorSubject<Recipe | undefined>(undefined),
      editRecipe: new BehaviorSubject<Recipe | undefined>(undefined),
      saveRecipe: jasmine.createSpy('saveRecipe'),
      storageSetup: jasmine.createSpy('storageSetup'),
    };

    responsiveLayoutServiceSpy = {
      layoutMode: new BehaviorSubject<LayoutMode>(LayoutMode.TableLandscape),
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
        {
          provide: ResponsiveLayoutService,
          useValue: responsiveLayoutServiceSpy,
        },
      ],
      declarations: [AppComponent, IngredientsComponent, StepsComponent, RecipeEditorComponent, DeleteRecipeDialog],
      imports: [
        BrowserModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatSelectModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatTooltipModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should return the default recipe title', async () => {
    await fixture.whenStable();
    expect(app.recipeTitle()).toEqual('No Recipe');
    expect(app.editLink()).toEqual('');
  });

  it('should set the view recipe in response to an event', async () => {
    expect(app.viewRecipe).toBeUndefined();

    const recipe = new Recipe('view', 'desc', [], [], []);
    recipeServiceSpy.viewRecipe.next(recipe);
    await fixture.whenStable();

    expect(app.viewRecipe).toBeTruthy();
    expect(app.isViewerLinkEnabled()).toBeFalse();
    expect(app.isRecipeNameEnabled()).toBeTrue();
    expect(app.isEditEnabled()).toBeTrue();
    expect(app.isDeleteEnabled()).toBeFalse();
    expect(app.recipeTitle()).toEqual('view');
    expect(app.editLink()).toEqual(`recipe/${recipe.id}/edit`);
  });

  it('should set the edit recipe in response to an event', async () => {
    expect(app.editRecipe).toBeUndefined();

    const recipe = new Recipe('edit', 'desc', [], [], []);
    recipeServiceSpy.editRecipe.next(recipe);
    await fixture.whenStable();

    expect(app.editRecipe).toBeTruthy();
    expect(app.isViewerLinkEnabled()).toBeFalse();
    expect(app.isRecipeNameEnabled()).toBeTrue();
    expect(app.isSaveEnabled()).toBeTrue();
    expect(app.isEditEnabled()).toBeFalse();
    expect(app.isDeleteEnabled()).toBeFalse();
    expect(app.recipeTitle()).toEqual('edit');
    expect(app.editLink()).toEqual('');
  });

  it('should set the UI state when loading a recipe', async () => {
    expect(app.editRecipe).toBeUndefined();

    const recipe = new Recipe('edit', 'desc', [], [], [], 'already-persisted', true);
    recipeServiceSpy.editRecipe.next(recipe);
    await fixture.whenStable();

    expect(app.editRecipe).toBeTruthy();
    expect(app.isViewerLinkEnabled()).toBeTrue();
    expect(app.isRecipeNameEnabled()).toBeFalse();
    expect(app.isSaveEnabled()).toBeTrue();
    expect(app.isEditEnabled()).toBeFalse();
    expect(app.isDeleteEnabled()).toBeTrue();
    expect(app.recipeTitle()).toEqual('edit');
    expect(app.editLink()).toEqual('');
  });

  it('should set a blank recipe title in phone mode', () => {
    responsiveLayoutServiceSpy.layoutMode.next(LayoutMode.HandsetLandscape);
    expect(app.recipeTitle()).toEqual('');
  });

  it('should save the edit recipe', async () => {
    const recipe = new Recipe('title', 'desc', [], [], []);
    recipeServiceSpy.editRecipe.next(recipe);
    await fixture.whenStable();

    recipeServiceSpy.saveRecipe.and.returnValue(Promise.resolve(recipe));
    await app.recipeSave();

    await fixture.whenStable();
    expect(recipeServiceSpy.saveRecipe.calls.count()).toEqual(1);
  });

  it('should post a confirmation dialog on recipe delete', async () => {
    const recipe = new Recipe('title', 'desc', [], [], []);
    recipeServiceSpy.editRecipe.next(recipe);
    await fixture.whenStable();

    app.recipeDelete();
    await fixture.whenStable();

    const dialogHarness = await loader.getHarness(MatDialogHarness);
    await expectAsync(dialogHarness.getTitleText()).toBeResolvedTo(recipe.title);
    await dialogHarness.close();
  });

  it('should disable edit features on a phone screen', () => {
    responsiveLayoutServiceSpy.layoutMode.next(LayoutMode.HandsetPortrait);
    expect(app.showFullHeader()).toBeFalse();
  });

  it('should show edit features on a tablet screen', () => {
    expect(app.showFullHeader()).toBeTrue();
  });

  it('should navigate from the recipe editor to the recipe viewer', async () => {
    const recipe = new Recipe('edit', 'desc', [], [], []);
    recipeServiceSpy.editRecipe.next(recipe);
    await fixture.whenStable();

    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    await app.openRecipeViewer();

    expect(routerSpy.navigate.calls.count()).toEqual(1);
  });
});
