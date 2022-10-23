import { v4 as uuidv4 } from 'uuid';

export enum UnitsKind {
  UsVolume = 'UsVolume',
  UsWeight = 'UsWeight',
  Arbitrary = 'Arbitrary',
}

export class QuantityUnitInformation {
  constructor(
    public readonly id: string,
    public readonly kind: UnitsKind,
    public readonly name: string,
    public readonly abbreviation: string,
    public readonly conversionFactor: number
  ) {}

  static byKind(kind: UnitsKind): Array<QuantityUnitInformation> {
    return unitsAndAbbreviations.filter((u) => u.kind === kind);
  }

  static byId(unitsId: string): QuantityUnitInformation | undefined {
    return unitsAndAbbreviations.find((u) => u.id === unitsId);
  }

  static fromObject(customUnitsObject: Record<string, any>): QuantityUnitInformation {
    const unitsId = customUnitsObject['id'];
    const standardUnits = QuantityUnitInformation.byId(unitsId);
    if (standardUnits) throw `Found standard unit in custom units list: ${unitsId}`;

    return new QuantityUnitInformation(
      unitsId,
      UnitsKind.Arbitrary,
      customUnitsObject['name'],
      customUnitsObject['abbreviation'],
      1
    );
  }

  static save(units: QuantityUnitInformation): object {
    if (units.kind != UnitsKind.Arbitrary) throw `Only custom units can be saved in a recipe (${units.kind})`;

    return {
      id: units.id,
      name: units.name,
      abbreviation: units.abbreviation,
    };
  }
}

const unitsAndAbbreviations: Array<QuantityUnitInformation> = [
  // US Volume units
  { id: 'us-volume-tsp', kind: UnitsKind.UsVolume, name: 'Teaspoon', abbreviation: 'tsp', conversionFactor: 1 },
  { id: 'us-volume-tbsp', kind: UnitsKind.UsVolume, name: 'Tablespoon', abbreviation: 'tbsp', conversionFactor: 3 },
  { id: 'us-volume-oz', kind: UnitsKind.UsVolume, name: 'Ounce', abbreviation: 'oz', conversionFactor: 6 },
  { id: 'us-volume-cup', kind: UnitsKind.UsVolume, name: 'Cup', abbreviation: 'cup', conversionFactor: 48 },
  { id: 'us-volume-pint', kind: UnitsKind.UsVolume, name: 'Pint', abbreviation: 'pint', conversionFactor: 96 },
  { id: 'us-volume-qt', kind: UnitsKind.UsVolume, name: 'Quart', abbreviation: 'qt', conversionFactor: 192 },

  // US Weight units
  { id: 'us-weight-oz', kind: UnitsKind.UsWeight, name: 'Ounce', abbreviation: 'oz', conversionFactor: 1 },
  { id: 'us-weight-lbs', kind: UnitsKind.UsWeight, name: 'Pound', abbreviation: 'lbs', conversionFactor: 16 },
];

/**
 * Valid recipe versions
 *
 * <ol>
 *   <li>1: Initial recipe specification
 *   <li>2: Recipe amounts allow for US weight measures, arbitrary units
 * </ol>
 */
const recipeVersions = ['1', '2'];

export class RecipeAmount {
  /**
   * Construct a volume amount
   * @param quantity Scalar quantity
   * @param units Units ID (either well-known or custom in the recipe)
   */
  constructor(public quantity: number, public units: string) {}

  private static readonly FRACTION_DELTA = 0.01;
  private static readonly ONE_QUARTER = '¼';
  private static readonly ONE_THIRD = '⅓';
  private static readonly ONE_HALF = '½';
  private static readonly TWO_THIRD = '⅔';
  private static readonly THREE_QUARTER = '¾';

  /**
   * Units conversion for volumes - implicitly assumes US Volume
   *
   * @param targetMeta The target unit type for conversion
   */
  convertTo(targetMeta: QuantityUnitInformation): RecipeAmount {
    const unitsMeta = QuantityUnitInformation.byId(this.units);
    if (!unitsMeta) throw `Can't convert from custom units: ${this.units}`;

    if (unitsMeta.kind !== targetMeta.kind) throw `Can't convert from ${unitsMeta.kind} to ${targetMeta.kind}`;

    const updatedQuantity = (this.quantity * unitsMeta.conversionFactor) / targetMeta.conversionFactor;
    return new RecipeAmount(updatedQuantity, targetMeta.id);
  }

  toObject(): object {
    return {
      quantity: this.quantity,
      units: this.units,
    };
  }

  private renderQuantity(): string {
    const intPart = Math.floor(this.quantity);
    const fractionPart = this.quantity - intPart;

    if (fractionPart >= RecipeAmount.FRACTION_DELTA) {
      const renderedInt = intPart > 0 ? `${intPart} ` : '';

      const percent = Math.floor(fractionPart * 100);
      switch (percent) {
        case 25:
          return `${renderedInt}${RecipeAmount.ONE_QUARTER}`;
        case 33:
          return `${renderedInt}${RecipeAmount.ONE_THIRD}`;
        case 50:
          return `${renderedInt}${RecipeAmount.ONE_HALF}`;
        case 67:
          return `${renderedInt}${RecipeAmount.TWO_THIRD}`;
        case 75:
          return `${renderedInt}${RecipeAmount.THREE_QUARTER}`;
      }
    }
    return this.quantity.toString();
  }

  render(recipe: Recipe): string {
    const abbreviation = recipe.abbreviationFor(this.units);
    return `${this.renderQuantity()} ${abbreviation}`;
  }

  static fromObject(recipeAmountObject: Record<string, any>, version: string, recipe: Recipe): RecipeAmount {
    if (version === '1') {
      const units = recipeAmountObject['units'];
      const unitInfo = QuantityUnitInformation.byId(`us-volume-${units}`);
      if (!unitInfo) throw `Invalid units abbreviation: ${units}`;

      return new RecipeAmount(recipeAmountObject['quantity'], unitInfo.id);
    } else {
      const unitsId = recipeAmountObject['units'];
      const units = recipe.unitsFor(unitsId);
      if (!units) throw `Invalid units id: ${unitsId}`;

      return new RecipeAmount(recipeAmountObject['quantity'], unitsId);
    }
  }
}

export class RecipeIngredient {
  /**
   * Construct an ingredient object
   * @param name Ingredient name (e.g. salt, pepper, apple)
   * @param description Further information about the ingredient
   * @param recipeAmount Ingredient quantity (in US volume units)
   * @param id Ingredient ID - defaults to a random UUID
   */
  constructor(
    public name: string,
    public description: string,
    public recipeAmount: RecipeAmount,
    public readonly id: string = uuidv4()
  ) {}

  toObject(): object {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      amount: this.recipeAmount.toObject(),
    };
  }

  render(recipe: Recipe): string {
    return `${this.recipeAmount.render(recipe)} ${this.name}`;
  }

  static fromObject(ingredientObject: Record<string, any>, version: string, recipe: Recipe): RecipeIngredient {
    if (version === '1') {
      // Amounts are always volume amount
      return new RecipeIngredient(
        ingredientObject['name'],
        ingredientObject['description'],
        RecipeAmount.fromObject(ingredientObject['volumeAmount'], '1', recipe),
        ingredientObject['id']
      );
    } else {
      // Amounts contain full information to resolve units
      return new RecipeIngredient(
        ingredientObject['name'],
        ingredientObject['description'],
        RecipeAmount.fromObject(ingredientObject['amount'], '2', recipe),
        ingredientObject['id']
      );
    }
  }
}

export class RecipeStep {
  /**
   * Construct a recipe step
   * @param id Step ID (defaults to a random UUID)
   * @param description Human-readable description
   * @param ingredients List of ingredient IDs
   */
  constructor(public description: string, public ingredients: string[], public readonly id: string = uuidv4()) {}

  toObject(): object {
    return {
      id: this.id,
      description: this.description,
      ingredients: this.ingredients,
    };
  }

  static fromObject(recipeStepObject: Record<string, any>): RecipeStep {
    return new RecipeStep(recipeStepObject['description'], recipeStepObject['ingredients'], recipeStepObject['id']);
  }
}

export class Recipe {
  /**
   * Construct an entire recipe
   * @param id Recipe ID (defaults to a random UUID)
   * @param title Recipe title
   * @param description Recipe description text
   * @param steps A list of recipe steps
   * @param customUnits Custom units for this recipe (if any)
   * @param ingredients A list of recipe ingredients
   * @param persisted If true, the recipe has been persisted at least once
   */
  constructor(
    public title: string,
    public description: string,
    public steps: RecipeStep[],
    public ingredients: RecipeIngredient[],
    public customUnits: QuantityUnitInformation[],
    public readonly id: string = uuidv4(),
    private persisted: boolean = false
  ) {}

  saved() {
    this.persisted = true;
  }

  hasBeenSaved(): boolean {
    return this.persisted;
  }

  unitsFor(unitsId: string): QuantityUnitInformation | undefined {
    const standardUnits = QuantityUnitInformation.byId(unitsId);
    if (standardUnits) return standardUnits;

    const customUnits = this.customUnits.find((u) => u.id === unitsId);
    if (customUnits) return customUnits;

    return undefined;
  }

  /**
   * Render the units abbreviation, possibly for custom units for this recipe
   * @param unitsId The units ID for the amount to be rendered
   */
  abbreviationFor(unitsId: string): string {
    const units = this.unitsFor(unitsId);
    return units ? units.abbreviation : unitsId;
  }

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
      customUnits: this.customUnits.map((u) => QuantityUnitInformation.save(u)),
      version: '2',
    };
  }

  static fromObject(recipeObject: Record<string, any>): Recipe {
    const recipeVersion = recipeObject.hasOwnProperty('version') ? recipeObject['version'] : '1';
    if (!recipeVersions.find((v) => v === recipeVersion)) {
      throw `Invalid version string: ${recipeVersion}`;
    }

    const customUnits =
      recipeVersion == '1' ? [] : recipeObject['customUnits'].map((u: object) => QuantityUnitInformation.fromObject(u));

    const recipe = new Recipe(
      recipeObject['title'],
      recipeObject['description'],
      recipeObject['steps'].map((s: object) => RecipeStep.fromObject(s)),
      [],
      customUnits,
      recipeObject['id'],
      true
    );

    recipe.ingredients = recipeObject['ingredients'].map((i: object) =>
      RecipeIngredient.fromObject(i, recipeVersion, recipe)
    );

    return recipe;
  }
}
