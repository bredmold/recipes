import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Recipe } from '../types/recipe';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.sass'],
})
export class RecipeComponent implements OnInit {
  @Input() recipe!: Recipe;
  @ViewChild('titleInput') titleInput!: ElementRef;

  constructor() {}

  recipeTitle() {
    this.recipe.title = this.titleInput.nativeElement.value;
  }

  ngOnInit(): void {}
}
