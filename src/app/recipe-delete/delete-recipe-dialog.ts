import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Recipe } from '../types/recipe';
import { RecipeService } from '../services/recipe.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'delete-recipe-dialog',
  templateUrl: './delete-recipe-dialog.html',
})
export class DeleteRecipeDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly recipe: Recipe,
    private readonly recipeService: RecipeService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
  ) {}

  async confirmDelete() {
    console.log(`Delete by id: ${this.recipe.id}`);
    try {
      await this.recipeService.deleteRecipeById(this.recipe.id);
      await this.router.navigate(['']);
      this.snackBar.open(`Deleted recipe ${this.recipe.title}`, 'Deleted', {
        duration: 3500,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
