import { Component } from '@angular/core';
import { RecipeService } from './recipe.service';
import { MatDialog } from '@angular/material/dialog';
import { RecipePickerComponent } from './recipe-picker/recipe-picker.component';
import { Recipe } from './types/recipe';
import packageJson from '../../package.json';
import { SessionService } from './session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  viewRecipe?: Recipe = undefined;
  editRecipe?: Recipe = undefined;

  version: string = packageJson.version;
  year: number = new Date().getFullYear();

  constructor(
    private readonly recipeService: RecipeService,
    private readonly sessionService: SessionService,
    private readonly recipePicker: MatDialog,
    private readonly router: Router
  ) {
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

  logout(): void {
    this.sessionService.deactivateSession().then(
      async () => {
        console.log('Logged out');
        await this.router.navigate(['login']);
        console.log('Login page');
      },
      (err) => {
        console.error(err);
      }
    );
  }

  loggedIn(): boolean {
    return this.sessionService.isLoggedIn();
  }
}
