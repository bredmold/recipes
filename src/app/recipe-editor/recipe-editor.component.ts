import { Component } from '@angular/core';
import { Recipe } from '../types/recipe';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../services/recipe.service';
import { AsyncValidatorFn, FormControl, Validators } from '@angular/forms';
import { MarkdownService } from '../services/markdown.service';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe-editor.component.html',
  styleUrls: ['./recipe-editor.component.sass'],
  standalone: false,
})
export class RecipeEditorComponent {
  private static readonly TITLE_KEY = 'title';

  recipe?: Recipe;

  titleControl = new FormControl('', [Validators.required], [this.validateTitle()]);

  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly recipeService: RecipeService,
    readonly markdownService: MarkdownService,
  ) {
    this.activeRoute.params.subscribe((params) => {
      const recipeId = params['id'];
      this.recipeService.getRecipeById(recipeId).then(
        (recipe) => {
          this.recipe = recipe;
          this.recipe.checkpoint();
          console.log(`id=${this.recipe.id} signature=${this.recipe.getSignature()}`);
          this.titleControl.setErrors(null);
          this.titleControl.setValue(recipe.title);
          this.recipeService.setEditRecipe(recipe);
        },
        (err) => {
          console.warn(err);

          // Implicitly create a new recipe to edit
          const newRecipe = new Recipe('New Recipe', '', [], [], [], recipeId);
          this.recipe = newRecipe;
          this.recipeService.setEditRecipe(newRecipe);
        },
      );
    });
  }

  recipeDescription(event: Event) {
    if (this.recipe) {
      const target = event.target as HTMLTextAreaElement;
      this.recipe.description = target.value;
    }
  }

  description(): string {
    return this.recipe?.description || '';
  }

  hasDescription(): boolean {
    return !!this.recipe && this.recipe.description.trim().length > 0;
  }

  recipeTitle(event: Event) {
    if (this.recipe) {
      const target = event.target as HTMLInputElement;
      this.recipe.title = target.value;
      this.titleControl.setValue(target.value);
    }
  }

  validateTitle(): AsyncValidatorFn {
    return async (control) => {
      const title = control.value as string;
      if (title.trim().length <= 0) return null;
      if (!this.recipe) return null;

      this.recipe.clearError(RecipeEditorComponent.TITLE_KEY);
      const hasTitle = await this.recipeService.isDuplicateTitle(this.recipe.id, title);
      if (hasTitle) {
        console.warn(`Found ${title}`);
        this.recipe.registerError(RecipeEditorComponent.TITLE_KEY);
        return { titleExists: true };
      } else return null;
    };
  }
}
