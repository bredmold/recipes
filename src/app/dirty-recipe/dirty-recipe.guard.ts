import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { RecipeService } from '../services/recipe.service';
import { DirtyRecipeDialog } from './dirty-recipe-dialog';
import { MatDialog } from '@angular/material/dialog';

export const dirtyRecipeGuard: CanActivateFn = async () => {
  const recipeService = inject(RecipeService);
  const editRecipe = recipeService.editRecipe.getValue();
  if (editRecipe) {
    console.info(
      `Edit recipe: id=${
        editRecipe.id
      } hasBeenSaved=${editRecipe.hasBeenSaved()} isModified=${editRecipe.isModified()}`,
    );

    if (editRecipe.isModified()) {
      const dialog = inject(MatDialog);
      const dialogRef = dialog.open(DirtyRecipeDialog, {
        data: editRecipe,
        enterAnimationDuration: 0.25,
        exitAnimationDuration: 0,
      });

      const closedPromise = new Promise<boolean>((resolve) => {
        dialogRef.afterClosed().subscribe(() => {
          resolve(dialogRef.componentInstance.allowNavigation);
        });
      });
      const allowNavigation = await closedPromise;
      console.log(`Dirty recipe: allowNavigation=${allowNavigation}`);

      if (allowNavigation) recipeService.invalidateEditRecipe();

      return allowNavigation;
    }
  }
  return true;
};
