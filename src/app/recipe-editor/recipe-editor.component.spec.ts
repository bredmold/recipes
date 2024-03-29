import { ComponentFixture, TestBed } from '@angular/core/testing';

import { v4 as uuidv4 } from 'uuid';
import { RecipeEditorComponent } from './recipe-editor.component';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { StepsComponent } from '../steps/steps.component';
import { AppComponent } from '../app.component';
import { IngredientsComponent } from '../ingredients/ingredients.component';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../services/recipe.service';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { Recipe } from '../types/recipe';
import { MatDialogModule } from '@angular/material/dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatErrorHarness } from '@angular/material/form-field/testing';
import { MatTabGroupHarness } from '@angular/material/tabs/testing';
import { MatTabsModule } from '@angular/material/tabs';

describe('RecipeEditorComponent', () => {
  let component: RecipeEditorComponent;
  let fixture: ComponentFixture<RecipeEditorComponent>;
  let activeRoute: ActivatedRouteStub;
  let recipeServiceSpy: any;
  let loader: HarnessLoader;

  beforeEach(async () => {
    activeRoute = new ActivatedRouteStub();

    recipeServiceSpy = {
      setEditRecipe: jasmine.createSpy('setEditRecipe'),
      getRecipeById: jasmine.createSpy('getRecipeById'),
      isDuplicateTitle: jasmine.createSpy('isDuplicateTitle'),
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
          useValue: recipeServiceSpy,
        },
      ],
      declarations: [AppComponent, IngredientsComponent, StepsComponent, RecipeEditorComponent],
      imports: [
        BrowserModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatSelectModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTabsModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should activate recipe when found', async () => {
    const recipe = new Recipe('title', 'desc', [], [], []);
    recipeServiceSpy.getRecipeById.withArgs(recipe.id).and.returnValue(Promise.resolve(recipe));

    activeRoute.setParamMap({ id: recipe.id });

    await fixture.whenStable();

    expect(component.recipe).toEqual(recipe);
  });

  it('Should generate a new recipe when none is given', async () => {
    const id = uuidv4();
    recipeServiceSpy.getRecipeById.withArgs(id).and.rejectWith('unit test');

    activeRoute.setParamMap({ id: id });

    await fixture.whenStable();

    expect(component.recipe?.id).toBe(id);
  });

  it('should update the recipe title', async () => {
    recipeServiceSpy.isDuplicateTitle.and.returnValue(Promise.resolve(false));

    await fixture.whenStable();

    const titleInput = await loader.getHarness(MatInputHarness);
    await titleInput.setValue('new title');
    await fixture.whenStable();

    expect(component.recipe?.title).toBe('new title');
  });

  it('should show an error if the title is empty', async () => {
    recipeServiceSpy.isDuplicateTitle.and.returnValue(Promise.resolve(false));

    await fixture.whenStable();

    const titleInput = await loader.getHarness(MatInputHarness);
    const hasTitleError = await loader.hasHarness(MatErrorHarness);
    expect(hasTitleError).toBeFalse();

    component.titleControl.setValue('');
    await titleInput.setValue('');
    await titleInput.blur();
    await fixture.whenStable();

    const titleError = await loader.getHarness(MatErrorHarness);
    const errorText = await titleError.getText();
    expect(errorText).toContain('required');
  });

  it('should show an error if the title is a duplicate', async () => {
    recipeServiceSpy.isDuplicateTitle.and.returnValue(Promise.resolve(true));

    await fixture.whenStable();

    const titleInput = await loader.getHarness(MatInputHarness);
    const hasTitleError = await loader.hasHarness(MatErrorHarness);
    expect(hasTitleError).toBeFalse();

    await titleInput.setValue('duplicate');
    await titleInput.blur();
    await fixture.whenStable();

    const titleError = await loader.getHarness(MatErrorHarness);
    const errorText = await titleError.getText();
    expect(errorText).toContain('exists');
  });

  it('should return the description', () => {
    component.recipe = new Recipe('test', 'test', [], [], []);
    expect(component.description()).toEqual('test');
  });

  it('should return an empty string for description if no recipe is defined', () => {
    component.recipe = undefined;
    expect(component.description()).toEqual('');
  });

  it('should indicate no description on missing recipe', () => {
    component.recipe = undefined;
    expect(component.hasDescription()).toBeFalse();
  });

  it('should indicate no description on empty recipe description', () => {
    component.recipe = new Recipe('test', '', [], [], []);
    expect(component.hasDescription()).toBeFalse();
  });

  it('should indicate presence of a description if one is present and non-empty', () => {
    component.recipe = new Recipe('test', 'test', [], [], []);
    expect(component.hasDescription()).toBeTrue();
  });

  it('should update the recipe description', async () => {
    await fixture.whenStable();

    const tabGroupHarness = await loader.getHarness(MatTabGroupHarness);
    await tabGroupHarness.selectTab({ label: 'Description' });

    const textAreaHarness = await loader.getHarness(MatInputHarness.with({ selector: 'textarea' }));
    await textAreaHarness.setValue('description');

    expect(component.recipe?.description).toEqual('description');
  });
});
