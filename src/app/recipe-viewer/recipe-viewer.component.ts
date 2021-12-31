import { Component, OnInit } from '@angular/core';
import { Recipe, RecipeIngredient, RecipeStep } from '../types/recipe';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-viewer',
  templateUrl: './recipe-viewer.component.html',
  styleUrls: ['./recipe-viewer.component.sass'],
})
export class RecipeViewerComponent implements OnInit {
  recipe?: Recipe;

  constructor(private readonly route: ActivatedRoute, private readonly recipeService: RecipeService) {
    this.route.params.subscribe((params) => {
      const recipeId = params['id'];
      this.recipeService.getRecipeById(recipeId).then(
        (recipe) => {
          this.recipe = recipe;
        },
        (err) => {
          console.error(err);
        }
      );
    });
  }

  ingredients(): RecipeIngredient[] {
    if (this.recipe) {
      return this.recipe.ingredients;
    } else {
      return [];
    }
  }

  steps(): RecipeStep[] {
    if (this.recipe) {
      return this.recipe.steps;
    } else {
      return [];
    }
  }

  ngOnInit(): void {}
}
