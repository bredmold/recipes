import { Component } from '@angular/core';
import { Recipe, RecipeIngredient, RecipeStep } from '../types/recipe';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../services/recipe.service';
import { LayoutMode, ResponsiveLayoutService } from '../services/responsive-layout.service';
import { MarkdownService } from '../services/markdown.service';

@Component({
  selector: 'app-recipe-viewer',
  templateUrl: './recipe-viewer.component.html',
  styleUrls: ['./recipe-viewer.component.sass'],
})
export class RecipeViewerComponent {
  recipe?: Recipe;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly recipeService: RecipeService,
    private readonly responsiveLayoutService: ResponsiveLayoutService,
    readonly markdownService: MarkdownService,
  ) {
    this.route.params.subscribe((params) => {
      const recipeId = params['id'];
      this.recipeService.getRecipeById(recipeId).then(
        (recipe) => {
          this.recipe = recipe;
          this.recipeService.setViewRecipe(recipe);
        },
        (err) => {
          console.error(err);
        },
      );
    });
  }

  recipeViewerClass(): string {
    switch (this.responsiveLayoutService.layoutMode.getValue()) {
      case LayoutMode.HandsetLandscape:
      case LayoutMode.HandsetPortrait:
        return 'recipe-viewer-phone';
      default:
        return 'recipe-viewer';
    }
  }

  ingredients(): RecipeIngredient[] {
    return this.recipe?.ingredients || [];
  }

  steps(): RecipeStep[] {
    return this.recipe?.steps || [];
  }
}
