import { Component, OnInit } from '@angular/core';
import { RecipeService } from './recipe.service';
import { MatDialog } from '@angular/material/dialog';
import { RecipePickerComponent } from './recipe-picker/recipe-picker.component';
import { Recipe } from './types/recipe';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  recipe: Recipe = new Recipe('recipe', 'desc', [], []);

  constructor(private readonly recipeService: RecipeService, private readonly recipePicker: MatDialog) {
    this.recipeService.activeRecipe.subscribe((recipe) => {
      this.recipe = recipe;
    });
  }

  openRecipePicker() {
    this.recipePicker.open(RecipePickerComponent);
  }

  recipeSave() {
    if (this.recipe) {
      this.recipeService.saveRecipe(this.recipe).then(() => {
        console.log('Recipe saved');
      });
    }
  }

  ngOnInit(): void {
    this.recipeService.storageSetup().then(() => this.recipeService.loadActiveRecipe());
  }
}
