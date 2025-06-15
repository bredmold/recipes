import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { Recipe } from '../types/recipe';
import { Router } from '@angular/router';
import { LayoutMode, ResponsiveLayoutService } from '../services/responsive-layout.service';
import { MarkdownService } from '../services/markdown.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  standalone: false,
})
export class HomeComponent implements OnInit {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly router: Router,
    private readonly responsiveLayoutService: ResponsiveLayoutService,
    readonly markdownService: MarkdownService,
  ) {}

  public allRecipes: Recipe[] = [];

  recipeLink(recipeId: string): string {
    return `recipe/${recipeId}`;
  }

  showEditLinks(): boolean {
    switch (this.responsiveLayoutService.layoutMode.getValue()) {
      case LayoutMode.HandsetPortrait:
      case LayoutMode.HandsetLandscape:
        return false;

      default:
        return true;
    }
  }

  reload(): void {
    this.allRecipes = [];
    this.recipeService.listRecipes().then(
      (recipes) => {
        this.recipeService.clearActiveRecipes();
        this.allRecipes = recipes;
      },
      (err) => {
        this.recipeService.clearActiveRecipes();
        console.error(err);
      },
    );
  }

  newRecipe(): void {
    const newRecipe = new Recipe('New Recipe', '', [], [], []);
    this.router.navigate([`/recipe/${newRecipe.id}/edit`]).then(
      () => {
        console.log(`Routed to ${newRecipe.id}`);
      },
      (err) => console.error(err),
    );
  }

  ngOnInit(): void {
    this.reload();
  }
}
