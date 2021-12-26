import { Component, Input } from '@angular/core';
import { Recipe, RecipeIngredient, UsVolumeUnit, VolumeAmount } from '../recipe.service';

@Component({
  selector: 'app-ingredients',
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.sass'],
})
export class IngredientsComponent {
  @Input() recipe!: Recipe;

  usVolumeMapping = [
    { unit: UsVolumeUnit.Teaspoon, label: 'Teaspoon (tsp)' },
    { unit: UsVolumeUnit.TableSpoon, label: 'Tablespoon (tbsp)' },
    { unit: UsVolumeUnit.Ounce, label: 'Fluid Ounce (oz)' },
    { unit: UsVolumeUnit.Cup, label: 'Cup' },
    { unit: UsVolumeUnit.Pint, label: 'Pint (pt)' },
    { unit: UsVolumeUnit.Quart, label: 'Quart (qt)' },
  ];

  constructor() {}

  ingredients(): RecipeIngredient[] {
    return this.recipe ? this.recipe.ingredients : [];
  }

  /**
   * Add a new ingredient to the recipe
   * @param idx Where to insert this ingredient in the list
   */
  addIngredient(idx: number) {
    this.recipe.ingredients.splice(
      idx,
      0,
      new RecipeIngredient('', 'Description', new VolumeAmount(0, UsVolumeUnit.Teaspoon))
    );
  }

  volumeAmount(event: Event) {
    const inputElement: HTMLInputElement = event.target as HTMLInputElement;
    const value: number = parseFloat(inputElement.value);
    const elementId: string = inputElement.id;
    const ingredientId: string = elementId.replace('volume-amount-', '');

    const ingredient = this.recipe.ingredients.find((i) => i.id == ingredientId);
    if (ingredient) {
      ingredient.volumeAmount.quantity = value;
    } else {
      console.error(`Unable to find ingredient by ID: ${ingredientId}`);
    }
  }

  ingredientName(event: Event) {
    const inputElement: HTMLInputElement = event.target as HTMLInputElement;
    const elementId: string = inputElement.id;
    const ingredientId: string = elementId.replace('ingredient-name-', '');

    const ingredient = this.recipe.ingredients.find((i) => i.id == ingredientId);
    if (ingredient) {
      ingredient.name = inputElement.value;
    } else {
      console.error(`Unable to find ingredient by ID: ${ingredientId}`);
    }
  }
}
