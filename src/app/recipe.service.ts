import {v4 as uuidv4} from "uuid";
import {Injectable} from "@angular/core";

/** US system of volume units */
export enum UsVolumeUnit {
  // American Units
  Teaspoon = 1,
  TableSpoon = 3,
  Ounce = 6,
  Cup = 48,
  Pint = 96,
  Quart = 192,
}

export class VolumeAmount {
  /**
   * Construct a volume amount
   * @param quantity Scalar quantity
   * @param units Unit type
   */
  constructor(public quantity: number,
              public units: UsVolumeUnit) {
  }

  /**
   * Units conversion for volumes
   *
   * @param units The target units for this volume
   */
  convertTo(units: UsVolumeUnit): VolumeAmount {
    const conversionFactor = this.units / units;
    return new VolumeAmount(this.quantity * conversionFactor, units);
  }
}

export class RecipeIngredient {
  /**
   * Construct an ingredient object
   * @param name Ingredient name (e.g. salt, pepper, apple)
   * @param description Further information about the ingredient
   * @param volumeAmount Ingredient quantity (in US volume units)
   * @param id Ingredient ID - defaults to a random UUID
   */
  constructor(public name: string,
              public description: string,
              public volumeAmount: VolumeAmount,
              public readonly id: string = uuidv4()) {
  }
}

export class RecipeStep {
  /**
   * Construct a recipe step
   * @param id Step ID (defaults to a random UUID)
   * @param description Human-readable description
   * @param ingredients List of ingredient IDs
   */
  constructor(public readonly id: string = uuidv4(),
              public description: string,
              public ingredients: string[]) {
  }
}

export class Recipe {
  /**
   * Construct an entire recipe
   * @param id Recipe ID (defaults to a random UUID)
   * @param title Recipe title
   * @param description Recipe description text
   * @param steps A list of recipe steps
   * @param ingredients A list of recipe ingredients
   */
  constructor(public title: string,
              public description: string,
              public steps: RecipeStep[],
              public ingredients: RecipeIngredient[],
              public readonly id: string = uuidv4()) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private activeRecipe = new Recipe(
    "Example Recipe",
    "Example recipe description",
    [],
    []
  );

  constructor() {
  }

  setActiveRecipe(recipe: Recipe) {
    this.activeRecipe = recipe;
  }

  getActiveRecipe(): Recipe {
    return this.activeRecipe;
  }
}
