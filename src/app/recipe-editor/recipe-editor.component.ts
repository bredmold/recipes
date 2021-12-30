import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Recipe } from '../types/recipe';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe-editor.component.html',
  styleUrls: ['./recipe-editor.component.sass'],
})
export class RecipeEditorComponent implements OnInit {
  @Input() recipe!: Recipe;
  @ViewChild('titleInput') titleInput!: ElementRef;

  constructor() {}

  recipeTitle() {
    this.recipe.title = this.titleInput.nativeElement.value;
  }

  ngOnInit(): void {}
}
