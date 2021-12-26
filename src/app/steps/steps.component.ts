import { Component, Input, OnInit } from '@angular/core';
import { Recipe } from '../recipe.service';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.sass'],
})
export class StepsComponent implements OnInit {
  @Input() recipe?: Recipe;

  constructor() {}

  ngOnInit(): void {}
}
