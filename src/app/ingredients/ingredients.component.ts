import { Component, Input } from '@angular/core';
import { Recipe, RecipeIngredient, UsVolumeUnit, VolumeAmount } from '../types/recipe';

@Component({
  selector: 'app-ingredients',
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.sass'],
})
export class IngredientsComponent {
  @Input() recipe?: Recipe;

  readonly usVolumeMapping = [
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

  removeIngredient(ingredientId: string) {
    if (this.recipe) {
      this.recipe.ingredients = this.recipe.ingredients.filter((i) => i.id != ingredientId);
    } else {
      console.warn('No active recipe');
    }
  }

  moveIngredient(ingredientId: string, direction: string) {
    if (this.recipe) {
      const startIdx = this.recipe.ingredients.findIndex((i) => i.id === ingredientId);
      if (startIdx === 0 && direction === 'up') {
        console.info('Cannot move first item "up"');
      } else if (startIdx >= this.recipe.ingredients.length - 1 && direction === 'down') {
        console.info('Cannot move last item "down"');
      } else if (startIdx < 0) {
        console.warn(`Unable to locate ingredient: ${ingredientId}`);
      } else {
        const ingredient = this.recipe.ingredients[startIdx];
        const minusOne = this.recipe.ingredients.filter((i) => i.id != ingredientId);

        const targetIdx = direction === 'up' ? startIdx - 1 : startIdx + 1;
        const left = minusOne.slice(0, targetIdx);
        const middle = [ingredient];
        const right = minusOne.slice(targetIdx);

        this.recipe.ingredients = left.concat(middle, right);
      }
    } else {
      console.warn('No active recipe');
    }
  }

  private static newIngredient(): RecipeIngredient {
    return new RecipeIngredient('', 'Description', new VolumeAmount(1, UsVolumeUnit.Teaspoon));
  }

  /**
   * Add a new ingredient to the recipe
   * @param idx Where to insert this ingredient in the list
   */
  addIngredient(idx: number) {
    if (this.recipe) {
      this.recipe.ingredients.splice(idx, 0, IngredientsComponent.newIngredient());
    } else {
      console.warn('No active recipe');
    }
  }

  volumeAmount(ingredientId: string, event: Event) {
    if (this.recipe) {
      const inputElement: HTMLInputElement = event.target as HTMLInputElement;
      const value: number = parseFloat(inputElement.value);

      const ingredient = this.recipe.ingredients.find((i) => i.id === ingredientId);
      if (ingredient) {
        ingredient.volumeAmount.quantity = value;
      } else {
        console.error(`Unable to find ingredient by ID: ${ingredientId}`);
      }
    }
  }

  ingredientName(ingredientId: string, event: Event) {
    if (this.recipe) {
      const inputElement: HTMLInputElement = event.target as HTMLInputElement;

      const ingredient = this.recipe.ingredients.find((i) => i.id === ingredientId);
      if (ingredient) {
        ingredient.name = inputElement.value;
      } else {
        console.error(`Unable to find ingredient by ID: ${ingredientId}`);
      }
    }
  }
}
