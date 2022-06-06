import { Component, ElementRef, ViewChild } from '@angular/core';
import { Recipe } from '../types/recipe';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe-editor.component.html',
  styleUrls: ['./recipe-editor.component.sass'],
})
export class RecipeEditorComponent {
  @ViewChild('titleInput') titleInput!: ElementRef;
  recipe?: Recipe;

  constructor(private readonly activeRoute: ActivatedRoute, private readonly recipeService: RecipeService) {
    this.activeRoute.params.subscribe((params) => {
      const recipeId = params['id'];
      this.recipeService.getRecipeById(recipeId).then(
        (recipe) => {
          this.recipe = recipe;
          this.recipeService.setEditRecipe(recipe);
        },
        (err) => {
          console.warn(err);

          // Implicitly create a new recipe to edit
          const newRecipe = new Recipe('New Recipe', '', [], [], recipeId);
          this.recipe = newRecipe;
          this.recipeService.setEditRecipe(newRecipe);
        }
      );
    });
  }

  recipeTitle() {
    if (this.recipe) {
      this.recipe.title = this.titleInput.nativeElement.value;
    } else {
      console.warn('No active recipe');
    }
  }
}
