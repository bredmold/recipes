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
  constructor(public readonly quantity: number,
              public readonly units: UsVolumeUnit) {
  }

  /**
   * Units conversion for volumes
   *
   * @param units The target units for this volume
   */
  convertTo(units: UsVolumeUnit): VolumeAmount {
    const conversionFactor = units / this.units;
    return new VolumeAmount(this.quantity * conversionFactor, units);
  }
}

export class RecipeIngredient {
  readonly id: string;

  /** Ingredient name (e.g. salt, sugar, apples) */
  name: string;

  /** Quantity by volume (optional) */
  volumeAmount?: VolumeAmount;

  /** Ingredient count (optional) */
  quantity?: number;

  /** Additional descriptive information */
  description: string;

  constructor() {
    this.id = uuidv4();
  }
}

export class RecipeStep {
  readonly id: string;

  /** Human-readable description of the step */
  description: string;

  /** A list of ingredient IDs */
  ingredients: string[];

  constructor() {
    this.id = uuidv4();
  }
}

export class Recipe {
  readonly id: string;
  title: string;
  description: string;
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];

  constructor() {
    this.id = uuidv4();
  }
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  constructor() {
  }
}
