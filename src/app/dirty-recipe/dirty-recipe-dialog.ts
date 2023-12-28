import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Recipe } from '../types/recipe';

@Component({
  selector: 'dirty-recipe-dialog',
  templateUrl: './dirty-recipe-dialog.html',
})
export class DirtyRecipeDialog {
  public allowNavigation: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public readonly recipe: Recipe) {}

  confirm() {
    this.allowNavigation = true;
  }
}
