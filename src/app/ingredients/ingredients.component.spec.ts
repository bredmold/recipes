import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientsComponent } from './ingredients.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { Recipe } from '../types/recipe';

describe('IngredientsComponent', () => {
  let component: IngredientsComponent;
  let fixture: ComponentFixture<IngredientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IngredientsComponent],
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
    fixture = TestBed.createComponent(IngredientsComponent);
    component = fixture.componentInstance;
    component.recipe = new Recipe('title', 'desc', [], []);
    fixture.detectChanges();
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

  it('should move an ingredient down in the list', () => {
    component.addIngredient(0);
    component.addIngredient(0);
    component.addIngredient(0);

    const ids = component.ingredients().map((i) => i.id);

    component.moveIngredient(ids[0], 'down');

    const idsAfter = component.ingredients().map((i) => i.id);
    const expected = [ids[1], ids[0], ids[2]];
    expect(idsAfter).toEqual(expected);
  });

  it('should move an ingredient up in the list', () => {
    component.addIngredient(0);
    component.addIngredient(0);
    component.addIngredient(0);

    const ids = component.ingredients().map((i) => i.id);

    component.moveIngredient(ids[2], 'up');

    const idsAfter = component.ingredients().map((i) => i.id);
    const expected = [ids[0], ids[2], ids[1]];
    expect(idsAfter).toEqual(expected);
  });

  it('should not move the first ingredient up', () => {
    component.addIngredient(0);
    component.addIngredient(0);
    component.addIngredient(0);

    const ids = component.ingredients().map((i) => i.id);

    component.moveIngredient(ids[0], 'up');

    const idsAfter = component.ingredients().map((i) => i.id);
    expect(idsAfter).toEqual(ids);
  });

  it('should not move the last ingredient down', () => {
    component.addIngredient(0);
    component.addIngredient(0);
    component.addIngredient(0);

    const ids = component.ingredients().map((i) => i.id);

    component.moveIngredient(ids[2], 'down');

    const idsAfter = component.ingredients().map((i) => i.id);
    expect(idsAfter).toEqual(ids);
  });

  it('should not move a non-existent ingredient', () => {
    component.addIngredient(0);
    component.addIngredient(0);
    component.addIngredient(0);

    const ids = component.ingredients().map((i) => i.id);

    component.moveIngredient('no such id', 'down');

    const idsAfter = component.ingredients().map((i) => i.id);
    expect(idsAfter).toEqual(ids);
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
});
