import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsComponent } from './steps.component';
import { AppComponent } from '../app.component';
import { IngredientsComponent } from '../ingredients/ingredients.component';
import { RecipeEditorComponent } from '../recipe-editor/recipe-editor.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { Recipe, RecipeAmount, RecipeIngredient } from '../types/recipe';
import { MatSelectHarness } from '@angular/material/select/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

describe('StepsComponent', () => {
  let recipe: Recipe;
  let component: StepsComponent;
  let fixture: ComponentFixture<StepsComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
    fixture = TestBed.createComponent(StepsComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    component.recipe = new Recipe('title', 'desc', [], [], []);
    recipe = component.recipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should report empty ingredients list', () => {
    expect(component.ingredients()).toHaveSize(0);
  });

  it('should report empty steps list', () => {
    expect(component.steps()).toHaveSize(0);
  });

  it('should add a step', () => {
    component.addStep(0);

    expect(component.steps()).toHaveSize(1);
  });

  it('should add multiple steps', () => {
    component.addStep(0);
    const id1 = component.steps()[0].id;

    component.addStep(0);
    const id2 = component.steps()[0].id;

    expect(id2).not.toEqual(id1);

    const stepIds = component.steps().map((s) => s.id);
    expect(stepIds).toEqual([id2, id1]);
  });

  it('should remove the desired step', () => {
    component.addStep(0);
    component.addStep(0);

    const stepIds = component.steps().map((s) => s.id);

    component.removeStep(stepIds[1]);

    const afterStepIds = component.steps().map((s) => s.id);
    expect(afterStepIds).toEqual([stepIds[0]]);
  });

  it('should move a step down the list', () => {
    component.addStep(0);
    component.addStep(0);
    component.addStep(0);

    const stepIds = component.steps().map((s) => s.id);

    component.moveStep(stepIds[0], 'down');

    const afterStepIds = component.steps().map((s) => s.id);
    expect(afterStepIds).toEqual([stepIds[1], stepIds[0], stepIds[2]]);
  });

  it('should move a step up the list', () => {
    component.addStep(0);
    component.addStep(0);
    component.addStep(0);

    const stepIds = component.steps().map((s) => s.id);

    component.moveStep(stepIds[2], 'up');

    const afterStepIds = component.steps().map((s) => s.id);
    expect(afterStepIds).toEqual([stepIds[0], stepIds[2], stepIds[1]]);
  });

  it('should refuse to move the first step up', () => {
    component.addStep(0);
    component.addStep(0);
    component.addStep(0);

    const stepIds = component.steps().map((s) => s.id);

    component.moveStep(stepIds[0], 'up');

    const afterStepIds = component.steps().map((s) => s.id);
    expect(afterStepIds).toEqual(stepIds);
  });

  it('should refuse to move the last step down', () => {
    component.addStep(0);
    component.addStep(0);
    component.addStep(0);

    const stepIds = component.steps().map((s) => s.id);

    component.moveStep(stepIds[2], 'down');

    const afterStepIds = component.steps().map((s) => s.id);
    expect(afterStepIds).toEqual(stepIds);
  });

  it('should refuse to move a non-existent step', () => {
    component.addStep(0);
    component.addStep(0);
    component.addStep(0);

    const stepIds = component.steps().map((s) => s.id);

    component.moveStep('nope', 'down');

    const afterStepIds = component.steps().map((s) => s.id);
    expect(afterStepIds).toEqual(stepIds);
  });

  it('should return nothing for a step with no ingredients', () => {
    component.addStep(0);
    const ingredientIds = component.initialStepIngredients(component.steps()[0].id);
    expect(ingredientIds).toEqual([]);
  });

  it('should return nothing for a non-existent step', () => {
    const ingredientIds = component.initialStepIngredients('nope');
    expect(ingredientIds).toEqual([]);
  });

  it('should adjust step description', () => {
    component.addStep(0);
    fixture.detectChanges();

    const stepDescriptionId = `step-description-${component.steps()[0].id}`;
    const inputElement: HTMLInputElement = window.document.getElementById(stepDescriptionId) as HTMLInputElement;
    inputElement.value = 'desc';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.steps()[0].description).toEqual('desc');
  });

  it('should adjust the step ingredients', async () => {
    component.addStep(0);
    recipe.ingredients = [new RecipeIngredient('ingredient', '', new RecipeAmount(1, 'us-volume-cup'))];
    fixture.detectChanges();

    const stepId = component.steps()[0].id;
    const ingredientId = component.ingredients()[0].id;

    const selectHarness: MatSelectHarness = await loader.getHarness(MatSelectHarness);
    await selectHarness.clickOptions();

    const stepIngredientIds = component.initialStepIngredients(stepId);
    expect(stepIngredientIds).toEqual([ingredientId]);
  });
});
