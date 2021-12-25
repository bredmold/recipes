import {Component, OnInit} from '@angular/core';
import {Recipe, RecipeService} from "./recipe.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  recipe: Recipe;

  constructor(private recipeService: RecipeService) {
    this.recipe = this.recipeService.getActiveRecipe();
  }

  recipePicker() {
    console.log("recipe picker");
  }

  recipeSave() {
    console.log("save recipe");
    console.log(this.recipe);
  }

  ngOnInit(): void {
    this.recipe = this.recipeService.getActiveRecipe();
  }
}
