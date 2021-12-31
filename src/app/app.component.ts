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
  viewRecipe?: Recipe = undefined;
  editRecipe?: Recipe = undefined;

  constructor(private readonly recipeService: RecipeService, private readonly recipePicker: MatDialog) {
    this.recipeService.viewRecipe.subscribe((viewRecipe) => {
      this.viewRecipe = viewRecipe;
    });
    this.recipeService.editRecipe.subscribe((editRecipe) => {
      this.editRecipe = editRecipe;
    });
  }

  openRecipePicker() {
    this.recipePicker.open(RecipePickerComponent);
  }

  recipeSave() {
    if (this.editRecipe) {
      this.recipeService.saveRecipe(this.editRecipe).then(
        (recipe) => {
          console.log(`Recipe saved: ${recipe.id}`);
        },
        (err) => {
          console.error(err);
        }
      );
    } else {
      console.warn('No edit recipe to save');
    }
  }

  isSaveDisabled(): boolean {
    return !this.editRecipe;
  }

  isEditDisabled(): boolean {
    return !this.viewRecipe;
  }

  recipeTitle(): string {
    if (this.viewRecipe) return this.viewRecipe.title;
    else if (this.editRecipe) return this.editRecipe.title;
    else return 'Recipe Picker';
  }

  editLink(): string {
    return this.viewRecipe ? `recipe/${this.viewRecipe.id}/edit` : '';
  }

  ngOnInit(): void {
    this.recipeService.storageSetup().then(
      () => {
        console.log('storage initialized');
      },
      (err) => {
        console.error(err);
      }
    );
  }
}
