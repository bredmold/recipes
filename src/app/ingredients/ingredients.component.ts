import { v4 as uuidv4 } from 'uuid';
import { Component, ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { QuantityUnitInformation, Recipe, RecipeAmount, RecipeIngredient, UnitsKind } from '../types/recipe';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacyOptionSelectionChange as MatOptionSelectionChange } from '@angular/material/legacy-core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

interface CustomUnitsContext {
  readonly component: IngredientsComponent;
  readonly ingredientId: string;
  readonly currentUnitId: string;
}

@Component({
  selector: 'app-ingredients',
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.sass'],
})
export class IngredientsComponent {
  @Input() recipe?: Recipe;

  private static readonly TSP_UNIT = QuantityUnitInformation.byId('us-volume-tsp') as QuantityUnitInformation;
  readonly usVolumeMapping = QuantityUnitInformation.byKind(UnitsKind.UsVolume).map((unitsMeta) => ({
    unit: unitsMeta,
    label: `${unitsMeta.name} (${unitsMeta.abbreviation})`,
  }));
  readonly usWeightMapping = QuantityUnitInformation.byKind(UnitsKind.UsWeight).map((unitsMeta) => ({
    unit: unitsMeta,
    label: `${unitsMeta.name} (${unitsMeta.abbreviation})`,
  }));
  customMapping = this.buildCustomMapping();

  constructor(public dialog: MatDialog) {}

  private buildCustomMapping() {
    if (this.recipe) {
      return this.recipe.customUnits.map((custom) => ({
        unit: custom,
        label: custom.name,
      }));
    } else {
      return [];
    }
  }

  openCustomUnits(event: MatOptionSelectionChange, ingredientId: string) {
    if (event.isUserInput && this.recipe) {
      const ingredient = this.recipe.ingredients.find((i) => i.id == ingredientId);
      if (ingredient) {
        console.log(`new custom unit for ${ingredientId}`);
        this.dialog.open(CustomUnitsDialog, {
          data: {
            component: this,
            ingredientId: ingredientId,
            currentUnitId: ingredient.recipeAmount.units,
          },
        });
      }
    }
  }

  selectUnits(ingredientId: string, unitsId: string) {
    if (this.recipe) {
      const ingredient = this.recipe.ingredients.find((i) => i.id == ingredientId);
      if (ingredient) {
        ingredient.recipeAmount.units = unitsId;
      }
    }
  }

  saveCustomUnit(name: string, abbreviation: string): string {
    if (this.recipe && name.length > 0) {
      const existing = this.recipe.customUnits.find((u) => u.name === name);
      if (existing) {
        return existing.id;
      } else {
        const id = uuidv4();
        console.log(`Save custom unit: id=${id} name=${name} abbr=${abbreviation}`);
        this.recipe.customUnits.push({
          id: id,
          name: name,
          abbreviation: abbreviation.length > 0 ? abbreviation : name,
          kind: UnitsKind.Arbitrary,
          conversionFactor: 1,
        });
        this.customMapping = this.buildCustomMapping();
        return id;
      }
    }

    return '';
  }

  ingredients(): RecipeIngredient[] {
    return this.recipe ? this.recipe.ingredients : [];
  }

  removeIngredient(ingredientId: string) {
    if (this.recipe) {
      this.recipe.ingredients = this.recipe.ingredients.filter((i) => i.id != ingredientId);
    } else {
      console.warn('No active recipe');
    }
  }

  dropIngredient(event: CdkDragDrop<string>) {
    if (this.recipe) {
      moveItemInArray(this.recipe.ingredients, event.previousIndex, event.currentIndex);
    } else {
      console.warn('No active recipe');
    }
  }

  private static newIngredient(): RecipeIngredient {
    return new RecipeIngredient('', 'Description', new RecipeAmount(1, this.TSP_UNIT.id));
  }

  /**
   * Add a new ingredient to the recipe
   * @param idx Where to insert this ingredient in the list
   */
  addIngredient(idx: number) {
    if (this.recipe) {
      this.recipe.ingredients.splice(idx, 0, IngredientsComponent.newIngredient());
    } else {
      console.warn('No active recipe');
    }
  }

  volumeAmount(ingredientId: string, event: Event) {
    if (this.recipe) {
      const inputElement: HTMLInputElement = event.target as HTMLInputElement;
      const value: number = parseFloat(inputElement.value);

      const ingredient = this.recipe.ingredients.find((i) => i.id === ingredientId);
      if (ingredient) {
        ingredient.recipeAmount.quantity = value;
      } else {
        console.error(`Unable to find ingredient by ID: ${ingredientId}`);
      }
    }
  }

  ingredientName(ingredientId: string, event: Event) {
    if (this.recipe) {
      const inputElement: HTMLInputElement = event.target as HTMLInputElement;

      const ingredient = this.recipe.ingredients.find((i) => i.id === ingredientId);
      if (ingredient) {
        ingredient.name = inputElement.value;
      } else {
        console.error(`Unable to find ingredient by ID: ${ingredientId}`);
      }
    }
  }
}

@Component({
  selector: 'custom-units-dialog',
  templateUrl: 'custom-units-dialog.html',
})
export class CustomUnitsDialog {
  @ViewChild('customUnitsName') customUnitsName!: ElementRef<HTMLInputElement>;
  @ViewChild('customUnitsAbbreviation') customUnitsAbbreviation!: ElementRef<HTMLInputElement>;

  constructor(
    public selfRef: MatDialogRef<CustomUnitsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CustomUnitsContext,
  ) {
    this.selfRef.afterClosed().subscribe((result) => {
      if (result === 'ok') {
        const name = this.customUnitsName.nativeElement.value;
        const abbr = this.customUnitsAbbreviation.nativeElement.value;
        const unitId = this.data.component.saveCustomUnit(name, abbr);
        if (unitId) {
          this.data.component.selectUnits(this.data.ingredientId, unitId);
        } else {
          this.data.component.selectUnits(this.data.ingredientId, this.data.currentUnitId);
        }
      } else {
        this.data.component.selectUnits(this.data.ingredientId, this.data.currentUnitId);
      }
    });
  }
}
