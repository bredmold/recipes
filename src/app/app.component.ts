import { Component } from '@angular/core';
import { RecipeService } from './services/recipe.service';
import { Recipe } from './types/recipe';
import packageJson from '../../package.json';
import { SessionService } from './services/session.service';
import { Router } from '@angular/router';
import { LayoutMode, ResponsiveLayoutService } from './services/responsive-layout.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteRecipeDialog } from './recipe-delete/delete-recipe-dialog';

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
    private readonly deleteRecipeDialog: MatDialog,
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
      this.deleteRecipeDialog.open(DeleteRecipeDialog, {
        data: this.editRecipe,
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
    return this.showFullHeader() && (!!this.viewRecipe || unsavedEdit);
  }

  isSaveEnabled(): boolean {
    return this.showFullHeader() && !!this.editRecipe;
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
