import { Component, Input } from '@angular/core';
import { Recipe, RecipeIngredient, RecipeStep } from '../types/recipe';
import { MatSelectChange } from '@angular/material/select';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MarkdownService } from '../services/markdown.service';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.sass'],
  standalone: false,
})
export class StepsComponent {
  @Input() recipe?: Recipe;
  private stepToPreview?: string;

  constructor(readonly markdownService: MarkdownService) {}

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
      }
    }
  }

  initialStepIngredients(stepId: string): string[] {
    if (this.recipe) {
      const step = this.recipe.steps.find((s) => s.id === stepId);
      if (step) {
        return step.ingredients;
      }
    }

    return [];
  }

  stepIngredients(stepId: string, event: MatSelectChange) {
    if (this.recipe) {
      const step = this.recipe.steps.find((s) => s.id === stepId);
      if (step) {
        step.ingredients = event.value;
      }
    }
  }

  private static newStep() {
    return new RecipeStep('', []);
  }

  addStep(idx: number) {
    if (this.recipe) {
      this.recipe.steps.splice(idx, 0, StepsComponent.newStep());
    }
  }

  removeStep(stepId: string) {
    if (this.recipe) {
      this.recipe.steps = this.recipe.steps.filter((s) => s.id != stepId);
    }
  }

  dropStep(event: CdkDragDrop<string>) {
    if (this.recipe) {
      moveItemInArray(this.recipe.steps, event.previousIndex, event.currentIndex);
    }
  }

  shouldPreview(stepId: string): boolean {
    return stepId === this.stepToPreview;
  }

  togglePreview(stepId: string): void {
    if (this.stepToPreview === stepId) {
      this.stepToPreview = undefined;
    } else {
      this.stepToPreview = stepId;
    }
  }

  previewButtonColor(stepId: string): string {
    return stepId === this.stepToPreview ? 'accent' : 'primary';
  }
}
