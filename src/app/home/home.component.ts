import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../recipe.service';
import { Recipe } from '../types/recipe';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit {
  constructor(private readonly recipeService: RecipeService) {}

  public allRecipes: Recipe[] = [];

  recipeLink(recipeId: string): string {
    return `recipe/${recipeId}`;
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
