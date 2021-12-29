/** US system of volume units */
import { v4 as uuidv4 } from 'uuid';

export enum UsVolumeUnit {
  // American Units
  Teaspoon = 1,
  TableSpoon = 3,
  Ounce = 6,
  Cup = 48,
  Pint = 96,
  Quart = 192,
}

const unitAbbreviationPairs = [
  { unit: UsVolumeUnit.Teaspoon, abbreviation: 'tsp' },
  { unit: UsVolumeUnit.TableSpoon, abbreviation: 'tbsp' },
  { unit: UsVolumeUnit.Ounce, abbreviation: 'oz' },
  { unit: UsVolumeUnit.Cup, abbreviation: 'cup' },
  { unit: UsVolumeUnit.Pint, abbreviation: 'pint' },
  { unit: UsVolumeUnit.Quart, abbreviation: 'qt' },
];

const unitsToAbbreviations: Record<UsVolumeUnit, string> = unitAbbreviationPairs.reduce((map, pair) => {
  map[pair.unit] = pair.abbreviation;
  return map;
}, {} as Record<UsVolumeUnit, string>);

const abbreviationsToUnits: Record<string, UsVolumeUnit> = unitAbbreviationPairs.reduce((map, pair) => {
  map[pair.abbreviation] = pair.unit;
  return map;
}, {} as Record<string, UsVolumeUnit>);

export class VolumeAmount {
  /**
   * Construct a volume amount
   * @param quantity Scalar quantity
   * @param units Unit type
   */
  constructor(public quantity: number, public units: UsVolumeUnit) {}

  /**
   * Units conversion for volumes
   *
   * @param units The target units for this volume
   */
  convertTo(units: UsVolumeUnit): VolumeAmount {
    const conversionFactor = this.units / units;
    return new VolumeAmount(this.quantity * conversionFactor, units);
  }

  toObject(): object {
    return {
      quantity: this.quantity,
      units: unitsToAbbreviations[this.units],
    };
  }

  static fromObject(volumeAmountObject: Record<string, any>): VolumeAmount {
    return new VolumeAmount(volumeAmountObject['quantity'], abbreviationsToUnits[volumeAmountObject['units']]);
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
  constructor(
    public name: string,
    public description: string,
    public volumeAmount: VolumeAmount,
    public readonly id: string = uuidv4()
  ) {}

  toObject(): object {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      volumeAmount: this.volumeAmount.toObject(),
    };
  }

  static fromObject(ingredientObject: Record<string, any>): RecipeIngredient {
    return new RecipeIngredient(
      ingredientObject['name'],
      ingredientObject['description'],
      VolumeAmount.fromObject(ingredientObject['volumeAmount']),
      ingredientObject['id']
    );
  }
}

export class RecipeStep {
  /**
   * Construct a recipe step
   * @param id Step ID (defaults to a random UUID)
   * @param description Human-readable description
   * @param ingredients List of ingredient IDs
   */
  constructor(public readonly id: string = uuidv4(), public description: string, public ingredients: string[]) {}

  toObject(): object {
    return {
      id: this.id,
      description: this.description,
      ingredients: this.ingredients,
    };
  }

  static fromObject(recipeStepObject: Record<string, any>): RecipeStep {
    return new RecipeStep(recipeStepObject['id'], recipeStepObject['description'], recipeStepObject['ingredients']);
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
  constructor(
    public title: string,
    public description: string,
    public steps: RecipeStep[],
    public ingredients: RecipeIngredient[],
    public readonly id: string = uuidv4()
  ) {}

  /**
   * Construct an object representation of this recipe, suitable for turning into JSON
   */
  toObject(): object {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      steps: this.steps.map((s) => s.toObject()),
      ingredients: this.ingredients.map((i) => i.toObject()),
    };
  }

  static fromObject(recipeObject: Record<string, any>): Recipe {
    return new Recipe(
      recipeObject['title'],
      recipeObject['description'],
      recipeObject['steps'].map((s: object) => RecipeStep.fromObject(s)),
      recipeObject['ingredients'].map((i: object) => RecipeIngredient.fromObject(i)),
      recipeObject['id']
    );
  }
}