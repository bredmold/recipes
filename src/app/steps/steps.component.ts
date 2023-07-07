import { Component, Input } from '@angular/core';
import { Recipe, RecipeIngredient, RecipeStep } from '../types/recipe';
import { MatSelectChange } from '@angular/material/select';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.sass'],
})
export class StepsComponent {
  @Input() recipe?: Recipe;

  constructor() {}

  steps(): RecipeStep[] {
    return this.recipe ? this.recipe.steps : [];
  }

  ingredients(): RecipeIngredient[] {
    return this.recipe ? this.recipe.ingredients : [];
  }

  stepDescription(stepId: string, event: Event) {
    if (this.recipe) {
      const step = this.recipe.steps.find((s) => s.id === stepId);
      if (step) {
        const input = event.target as HTMLInputElement;
        step.description = input.value;
      } else {
        console.warn(`Unable to locate step ${stepId}`);
      }
    } else {
      console.warn('No active recipe');
    }
  }

  initialStepIngredients(stepId: string): string[] {
    if (this.recipe) {
      const step = this.recipe.steps.find((s) => s.id === stepId);
      if (step) {
        return step.ingredients;
      } else {
        console.warn(`Unable to find step: ${stepId}`);
      }
    } else {
      console.warn('No active recipe');
    }

    return [];
  }

  stepIngredients(stepId: string, event: MatSelectChange) {
    if (this.recipe) {
      const step = this.recipe.steps.find((s) => s.id === stepId);
      if (step) {
        step.ingredients = event.value;
      } else {
        console.warn(`Unable to locate step ${stepId}`);
      }
    } else {
      console.warn('No active recipe');
    }
  }

  private static newStep() {
    return new RecipeStep('', []);
  }

  addStep(idx: number) {
    if (this.recipe) {
      this.recipe.steps.splice(idx, 0, StepsComponent.newStep());
    } else {
      console.warn('No active recipe');
    }
  }

  removeStep(stepId: string) {
    if (this.recipe) {
      this.recipe.steps = this.recipe.steps.filter((s) => s.id != stepId);
    } else {
      console.warn('No active recipe');
    }
  }

  dropStep(event: CdkDragDrop<string>) {
    if (this.recipe) {
      moveItemInArray(this.recipe.steps, event.previousIndex, event.currentIndex);
    } else {
      console.warn('No active recipe');
    }
  }
}
