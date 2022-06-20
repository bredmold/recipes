import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { RecipeService } from '../recipe.service';
import { Recipe } from '../types/recipe';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

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
    private readonly recipePickerDialog: MatDialogRef<RecipePickerComponent>,
    private readonly router: Router
  ) {}

  itemClass(recipeId: string): string {
    const classes = ['recipe-picker-item'];

    const viewRecipe = this.recipeService.viewRecipe.getValue();
    const editRecipe = this.recipeService.editRecipe.getValue();
    const activeRecipe = viewRecipe || editRecipe;
    if (activeRecipe && recipeId === activeRecipe.id) {
      classes.push('recipe-picker-active');
    }

    return classes.join(' ');
  }

  selectRecipe(recipeId: string) {
    console.log(`Selected: ${recipeId}`);
    const selectedRecipe = this.recipes.find((r) => r.id === recipeId);
    if (selectedRecipe) {
      this.router.navigate([`/recipe/${recipeId}`]).then(
        () => {
          this.recipePickerDialog.close();
        },
        (err) => console.error(err)
      );
    } else {
      console.log(`Unable to locate recipe by id: ${recipeId}`);
    }
  }

  newRecipe() {
    const newRecipe = new Recipe('New Recipe', '', [], [], []);
    this.router.navigate([`/recipe/${newRecipe.id}/edit`]).then(
      () => {
        this.recipePickerDialog.close();
        console.log(`Routed to ${newRecipe.id}`);
      },
      (err) => console.error(err)
    );
  }

  ngOnInit(): void {
    this.recipeService.listRecipes().then((recipes) => {
      this.recipes = recipes;
    });
  }
}
