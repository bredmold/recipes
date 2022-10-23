import { Component } from '@angular/core';
import { RecipeService } from './services/recipe.service';
import { Recipe } from './types/recipe';
import packageJson from '../../package.json';
import { SessionService } from './services/session.service';
import { Router } from '@angular/router';
import { LayoutMode, ResponsiveLayoutService } from './services/responsive-layout.service';

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
    private readonly responsiveLayoutService: ResponsiveLayoutService
  ) {
    this.recipeService.viewRecipe.subscribe((viewRecipe) => {
      this.viewRecipe = viewRecipe;
    });
    this.recipeService.editRecipe.subscribe((editRecipe) => {
      this.editRecipe = editRecipe;
    });
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

  isViewerLinkDisabled(): boolean {
    return this.editRecipe ? !this.editRecipe.hasBeenSaved() : true;
  }

  isSaveDisabled(): boolean {
    return !this.editRecipe;
  }

  isEditDisabled(): boolean {
    return !this.viewRecipe;
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
      }
    );
  }

  loggedIn(): boolean {
    return this.sessionService.isLoggedIn();
  }
}
