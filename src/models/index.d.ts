import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum UsVolumeUnits {
  TEASPOON = "TEASPOON",
  TABLESPOON = "TABLESPOON",
  OUNCE = "OUNCE",
  CUP = "CUP",
  PINT = "PINT",
  QUART = "QUART"
}

export declare class VolumeAmount {
  readonly quantity: number;
  readonly units: UsVolumeUnits | keyof typeof UsVolumeUnits;
  constructor(init: ModelInit<VolumeAmount>);
}

export declare class RecipeIngredient {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly volumeAmount: VolumeAmount;
  constructor(init: ModelInit<RecipeIngredient>);
}

export declare class RecipeStep {
  readonly id: string;
  readonly description: string;
  readonly ingredients: string[];
  constructor(init: ModelInit<RecipeStep>);
}

type RecipeMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Recipe {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly steps: RecipeStep[];
  readonly ingredients: RecipeIngredient[];
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Recipe, RecipeMetaData>);
  static copyOf(source: Recipe, mutator: (draft: MutableModel<Recipe, RecipeMetaData>) => MutableModel<Recipe, RecipeMetaData> | void): Recipe;
}