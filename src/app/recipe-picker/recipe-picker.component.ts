import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { RecipeService } from '../recipe.service';
import { Recipe } from '../types/recipe';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-recipe-picker',
  templateUrl: './recipe-picker.component.html',
  styleUrls: ['./recipe-picker.component.sass'],
})
export class RecipePickerComponent implements OnInit {
  public recipes: Recipe[] = [];

  @Input('mat-dialog-close') dialogClose!: ElementRef;

  constructor(
    private readonly recipeService: RecipeService,
    private readonly recipePickerDialog: MatDialogRef<RecipePickerComponent>
  ) {}

  selectRecipe(recipeId: string) {
    console.log(`Selected: ${recipeId}`);
    const selectedRecipe = this.recipes.find((r) => r.id == recipeId);
    if (selectedRecipe) {
      this.recipeService.setActiveRecipe(selectedRecipe);
      this.recipePickerDialog.close();
    } else {
      console.log(`Unable to locate recipe by id: ${recipeId}`);
    }
  }

  newRecipe() {
    const newRecipe = new Recipe('New Recipe', '', [], []);
    this.recipeService.setActiveRecipe(newRecipe);
    this.recipePickerDialog.close();
  }

  ngOnInit(): void {
    this.recipeService.listRecipes().then((recipes) => {
      this.recipes = recipes;
    });
  }
}
