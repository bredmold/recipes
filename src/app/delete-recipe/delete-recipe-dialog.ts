import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Recipe } from '../types/recipe';
import { RecipeService } from '../services/recipe.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DeleteDialogData {
  readonly recipe: Recipe;
  readonly duration: number;
}

@Component({
  selector: 'delete-recipe-dialog',
  templateUrl: './delete-recipe-dialog.html',
})
export class DeleteRecipeDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: DeleteDialogData,
    private readonly recipeService: RecipeService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
  ) {}

  async confirmDelete() {
    console.log(`Delete by id: ${this.data.recipe.id}`);
    try {
      await this.recipeService.deleteRecipeById(this.data.recipe.id);
      await this.router.navigate(['']);
      this.snackBar.open(`Deleted recipe ${this.data.recipe.title}`, 'Deleted', {
        duration: this.data.duration,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
