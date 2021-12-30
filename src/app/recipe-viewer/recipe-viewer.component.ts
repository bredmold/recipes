import { Component, Input, OnInit } from '@angular/core';
import { Recipe } from '../types/recipe';

@Component({
  selector: 'app-recipe-viewer',
  templateUrl: './recipe-viewer.component.html',
  styleUrls: ['./recipe-viewer.component.sass'],
})
export class RecipeViewerComponent implements OnInit {
  @Input() recipe!: Recipe;

  constructor() {}

  ngOnInit(): void {}
}
