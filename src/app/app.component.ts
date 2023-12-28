import { Component } from '@angular/core';
import { RecipeService } from './services/recipe.service';
import { Recipe } from './types/recipe';
import packageJson from '../../package.json';
import { SessionService } from './services/session.service';
import { Router } from '@angular/router';
import { LayoutMode, ResponsiveLayoutService } from './services/responsive-layout.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteRecipeDialog } from './delete-recipe/delete-recipe-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private readonly router: Router,
    private readonly responsiveLayoutService: ResponsiveLayoutService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {
    this.recipeService.viewRecipe.subscribe((viewRecipe) => {
      this.viewRecipe = viewRecipe;
    });
    this.recipeService.editRecipe.subscribe((editRecipe) => {
      this.editRecipe = editRecipe;
    });
  }

  async recipeSave() {
    if (this.editRecipe) {
      try {
        const recipe = await this.recipeService.saveRecipe(this.editRecipe);
        this.snackBar.open(`Saved recipe ${recipe.title}`, 'Saved', {
          duration: 3500,
        });
        console.log(`Recipe saved: ${recipe.id}`);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.warn('No edit recipe to save');
    }
  }

  recipeDelete() {
    if (this.editRecipe) {
      this.dialog.open(DeleteRecipeDialog, {
        data: { recipe: this.editRecipe, duration: 3500 },
        enterAnimationDuration: 0.25,
        exitAnimationDuration: 0,
      });
    } else {
      console.warn('No recipe to delete');
    }
  }

  async openRecipeViewer() {
    if (this.editRecipe) {
      const id = this.editRecipe.id;
      const navResult = await this.router.navigate(['recipe', id]);
      if (navResult) {
        console.info(`Recipe viewer for ${id}`);
      } else {
        console.error(`Failed to navigate to recipe ${id}`);
      }
    } else {
      console.warn('No edit recipe to transition away from');
    }
  }

  isViewerLinkEnabled(): boolean {
    return this.showFullHeader() && !!this.editRecipe && this.editRecipe.hasBeenSaved();
  }

  isRecipeNameEnabled(): boolean {
    const unsavedEdit = !!this.editRecipe && !this.editRecipe.hasBeenSaved();
    return !!this.viewRecipe || unsavedEdit;
  }

  isSaveVisible(): boolean {
    return this.showFullHeader() && !!this.editRecipe;
  }

  isSaveDisabled(): boolean {
    const hasErrors = !!this.editRecipe && this.editRecipe.hasErrors();
    const isModified = !!this.editRecipe && this.editRecipe.isModified();
    return hasErrors || !isModified;
  }

  isDeleteEnabled(): boolean {
    return this.showFullHeader() && !!this.editRecipe && this.editRecipe.hasBeenSaved();
  }

  isEditEnabled(): boolean {
    return this.showFullHeader() && !!this.viewRecipe;
  }

  showFullHeader(): boolean {
    switch (this.responsiveLayoutService.layoutMode.getValue()) {
      case LayoutMode.HandsetPortrait:
      case LayoutMode.HandsetLandscape:
        return false;
      default:
        return true;
    }
  }

  recipeTitle(): string {
    if (this.viewRecipe) return this.viewRecipe.title;
    else if (this.editRecipe) return this.editRecipe.title;
    else if (this.showFullHeader()) return 'No Recipe';
    else return '';
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
      },
    );
  }

  loggedIn(): boolean {
    return this.sessionService.isLoggedIn();
  }
}
