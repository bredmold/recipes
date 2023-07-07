import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomUnitsDialog, IngredientsComponent } from './ingredients.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { ReactiveFormsModule } from '@angular/forms';
import { Recipe, RecipeAmount, RecipeIngredient, UnitsKind } from '../types/recipe';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatLegacySelectHarness as MatSelectHarness } from '@angular/material/legacy-select/testing';
import { MatLegacyDialogHarness as MatDialogHarness } from '@angular/material/legacy-dialog/testing';
import { MatLegacyInputHarness as MatInputHarness } from '@angular/material/legacy-input/testing';
import { MatLegacyButtonHarness as MatButtonHarness } from '@angular/material/legacy-button/testing';

describe('IngredientsComponent', () => {
  let component: IngredientsComponent;
  let fixture: ComponentFixture<IngredientsComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IngredientsComponent, CustomUnitsDialog],
      imports: [
        NoopAnimationsModule,
        MatToolbarModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatDialogModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IngredientsComponent);
    component = fixture.componentInstance;
    component.recipe = new Recipe('title', 'desc', [], [], []);
    fixture.detectChanges();

    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should report empty ingredients list', () => {
    expect(component.ingredients()).toEqual([]);
  });

  it('should add an ingredient', () => {
    component.addIngredient(0);
    expect(component.ingredients()).toHaveSize(1);
  });

  it('should add multiple ingredients', () => {
    component.addIngredient(0);
    const id1 = component.ingredients()[0].id;

    component.addIngredient(0);
    const id2 = component.ingredients()[0].id;

    expect(id2).not.toEqual(id1);

    const ids: string[] = component.ingredients().map((i) => i.id);
    expect(ids).toEqual([id2, id1]);
  });

  it('should remove an ingredient', () => {
    component.addIngredient(0);
    component.removeIngredient(component.ingredients()[0].id);

    expect(component.ingredients()).toHaveSize(0);
  });

  it('should adjust the volume amount', () => {
    component.addIngredient(0);
    fixture.detectChanges();

    const volumeAmountId = `volume-amount-${component.ingredients()[0].id}`;

    const inputElement: HTMLInputElement = window.document.getElementById(volumeAmountId) as HTMLInputElement;
    inputElement.value = '1';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.ingredients()[0].recipeAmount.quantity).toBe(1);
  });

  it('should adjust the ingredient name', () => {
    component.addIngredient(0);
    fixture.detectChanges();

    const ingredientNameId = `ingredient-name-${component.ingredients()[0].id}`;

    const inputElement: HTMLInputElement = window.document.getElementById(ingredientNameId) as HTMLInputElement;
    inputElement.value = 'test ingredient';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.ingredients()[0].name).toBe('test ingredient');
  });

  it('should select pre-defined units', () => {
    component.addIngredient(0);
    fixture.detectChanges();

    const ingredient = component.ingredients()[0];

    component.selectUnits(ingredient.id, 'us-weight-oz');

    expect(ingredient.recipeAmount.units).toBe('us-weight-oz');
  });

  it('should save a new custom unit', () => {
    const unitId = component.saveCustomUnit('name', 'abbr');

    expect(unitId.length).toBe(36);
    expect(component.customMapping).toHaveSize(1);
    expect(component.recipe?.customUnits).toEqual([
      {
        id: unitId,
        kind: UnitsKind.Arbitrary,
        name: 'name',
        abbreviation: 'abbr',
        conversionFactor: 1,
      },
    ]);
  });

  it('should return an existing custom unit', () => {
    const unitId = component.saveCustomUnit('name', 'abbr');
    const secondUnitId = component.saveCustomUnit('name', 'abbr');
    expect(secondUnitId).toBe(unitId);
  });

  it('should open the custom units dialog', async () => {
    component.recipe = new Recipe(
      'test',
      'desc',
      [],
      [new RecipeIngredient('ingredient', 'desc', new RecipeAmount(1, 'us-volume-tsp'))],
      [],
    );

    const select = await loader.getHarness(MatSelectHarness);
    await select.clickOptions({ selector: '.new-custom-unit' });

    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeDefined();
  });

  it('should revert changes if the new unit is invalid', async () => {
    component.recipe = new Recipe(
      'test',
      'desc',
      [],
      [new RecipeIngredient('ingredient', 'desc', new RecipeAmount(1, 'us-volume-tsp'))],
      [],
    );

    const select = await loader.getHarness(MatSelectHarness);
    await select.clickOptions({ selector: '.new-custom-unit' });
    const dialog = await loader.getHarness(MatDialogHarness);
    const okButton = await dialog.getHarness(MatButtonHarness.with({ text: 'Ok' }));
    await okButton.click();
    expect(component.recipe.ingredients[0].recipeAmount.units).toEqual('us-volume-tsp');
  });

  it('should restore previous units after closing the units dialog', async () => {
    component.recipe = new Recipe(
      'test',
      'desc',
      [],
      [new RecipeIngredient('ingredient', 'desc', new RecipeAmount(1, 'us-volume-tsp'))],
      [],
    );

    const select = await loader.getHarness(MatSelectHarness);
    await select.clickOptions({ selector: '.new-custom-unit' });
    const dialog = await loader.getHarness(MatDialogHarness);

    expect(component.recipe.ingredients[0].recipeAmount.units).not.toEqual('us-volume-tsp');
    await dialog.close();

    expect(component.recipe.ingredients[0].recipeAmount.units).toEqual('us-volume-tsp');
  });

  it('should save custom units after filling in the dialog', async () => {
    component.recipe = new Recipe(
      'test',
      'desc',
      [],
      [new RecipeIngredient('ingredient', 'desc', new RecipeAmount(1, 'us-volume-tsp'))],
      [],
    );

    const select = await loader.getHarness(MatSelectHarness);
    await select.clickOptions({ selector: '.new-custom-unit' });

    const dialog = await loader.getHarness(MatDialogHarness);

    const nameInput = await dialog.getHarness(MatInputHarness.with({ selector: '[name=custom-unit-name]' }));
    await nameInput.setValue('test unit');

    const okButton = await dialog.getHarness(MatButtonHarness.with({ text: 'Ok' }));
    await okButton.click();

    expect(component.recipe.customUnits).toHaveSize(1);
    expect(component.recipe.ingredients[0].recipeAmount.units).toEqual(component.recipe.customUnits[0].id);
  });
});
