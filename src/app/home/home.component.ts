import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../recipe.service';
import { Recipe } from '../types/recipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit {
  constructor(private readonly recipeService: RecipeService, private readonly router: Router) {}

  public allRecipes: Recipe[] = [];

  recipeLink(recipeId: string): string {
    return `recipe/${recipeId}`;
  }

  newRecipe(): void {
    const newRecipe = new Recipe('New Recipe', '', [], []);
    this.router.navigate([`/recipe/${newRecipe.id}/edit`]).then(
      () => {
        console.log(`Routed to ${newRecipe.id}`);
      },
      (err) => console.error(err)
    );
  }

  ngOnInit(): void {
    this.recipeService.listRecipes().then(
      (recipes) => {
        this.recipeService.clearActiveRecipes();
        this.allRecipes = recipes;
      },
      (err) => {
        this.recipeService.clearActiveRecipes();
        console.error(err);
      }
    );
  }
}
