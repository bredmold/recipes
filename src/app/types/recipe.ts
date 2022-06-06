/** US system of volume units */
import { v4 as uuidv4 } from 'uuid';

export enum UnitsKind {
  UsVolume = 'UsVolume',
  UsWeight = 'UsWeight',
  Arbitrary = 'Arbitrary',
}

export class QuantityUnitInformation {
  constructor(
    public readonly kind: UnitsKind,
    public readonly name: string,
    public readonly abbreviation: string,
    public readonly conversionFactor: number
  ) {}

  /**
   * Parse a units value based on what kind of unit it is - throws if the abbreviation is invalid
   *
   * @param kind What kind of unit is this
   * @param abbreviation Stored abbreviation
   */
  static parse(kind: UnitsKind, abbreviation: string): QuantityUnitInformation {
    switch (kind) {
      case UnitsKind.UsVolume:
      case UnitsKind.UsWeight:
        const unitsInfo = unitsAndAbbreviations.find((i) => i.kind === kind && i.abbreviation === abbreviation);
        if (unitsInfo) return unitsInfo;
        else throw `Invalid units: kind=${kind} abbreviation=${abbreviation}`;

      case UnitsKind.Arbitrary:
        return {
          kind: UnitsKind.Arbitrary,
          name: abbreviation,
          abbreviation: abbreviation,
          conversionFactor: 1,
        };
    }
  }

  static byKind(kind: UnitsKind): Array<QuantityUnitInformation> {
    return unitsAndAbbreviations.filter((u) => u.kind === kind);
  }
}

const unitsAndAbbreviations: Array<QuantityUnitInformation> = [
  // US Volume units
  { kind: UnitsKind.UsVolume, name: 'Teaspoon', abbreviation: 'tsp', conversionFactor: 1 },
  { kind: UnitsKind.UsVolume, name: 'TableSpoon', abbreviation: 'tbsp', conversionFactor: 3 },
  { kind: UnitsKind.UsVolume, name: 'Ounce', abbreviation: 'oz', conversionFactor: 6 },
  { kind: UnitsKind.UsVolume, name: 'Cup', abbreviation: 'cup', conversionFactor: 48 },
  { kind: UnitsKind.UsVolume, name: 'Pint', abbreviation: 'pint', conversionFactor: 96 },
  { kind: UnitsKind.UsVolume, name: 'Quart', abbreviation: 'qt', conversionFactor: 192 },

  // US Weight units
  { kind: UnitsKind.UsWeight, name: 'Ounce', abbreviation: 'oz', conversionFactor: 1 },
  { kind: UnitsKind.UsWeight, name: 'Pound', abbreviation: 'lbs', conversionFactor: 16 },

  // Arbitrary units information
  { kind: UnitsKind.Arbitrary, name: 'Arbitrary', abbreviation: 'arbitrary', conversionFactor: 1 },
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
   * @param unitsMeta Type information about the unit of measurement
   */
  constructor(public quantity: number, public unitsMeta: QuantityUnitInformation) {}

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
    if (this.unitsMeta.kind !== targetMeta.kind)
      throw `Can't convert from ${this.unitsMeta.kind} to ${targetMeta.kind}`;

    if (this.unitsMeta.kind === UnitsKind.Arbitrary)
      throw `Can't convert arbitrary units`;

    const updatedQuantity = (this.quantity * this.unitsMeta.conversionFactor) / targetMeta.conversionFactor;
    return new RecipeAmount(updatedQuantity, targetMeta);
  }

  toObject(): object {
    return {
      quantity: this.quantity,
      kind: this.unitsMeta.kind,
      units: this.unitsMeta.abbreviation,
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

  render(): string {
    return `${this.renderQuantity()} ${this.unitsMeta.abbreviation}`;
  }

  static fromObject(recipeAmountObject: Record<string, any>, version: string): RecipeAmount {
    if (version === '1') {
      const unitInfo = QuantityUnitInformation.parse(UnitsKind.UsVolume, recipeAmountObject['units']);
      return new RecipeAmount(recipeAmountObject['quantity'], unitInfo);
    } else {
      const rawKind: string = recipeAmountObject['kind'];
      const kind: UnitsKind = (<any>UnitsKind)[rawKind];
      if (!kind) throw `Invalid units kind: ${rawKind}`;

      return new RecipeAmount(
        recipeAmountObject['quantity'],
        QuantityUnitInformation.parse(kind, recipeAmountObject['units'])
      );
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

  render(): string {
    return `${this.recipeAmount.render()} ${this.name}`;
  }

  static fromObject(ingredientObject: Record<string, any>, version: string): RecipeIngredient {
    if (version === '1') {
      // Amounts are always volume amount
      return new RecipeIngredient(
        ingredientObject['name'],
        ingredientObject['description'],
        RecipeAmount.fromObject(ingredientObject['volumeAmount'], '1'),
        ingredientObject['id']
      );
    } else {
      // Amounts contain full information to resolve units
      return new RecipeIngredient(
        ingredientObject['name'],
        ingredientObject['description'],
        RecipeAmount.fromObject(ingredientObject['amount'], '2'),
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
   * @param ingredients A list of recipe ingredients
   * @param version Recipe format version
   */
  constructor(
    public title: string,
    public description: string,
    public steps: RecipeStep[],
    public ingredients: RecipeIngredient[],
    public readonly id: string = uuidv4(),
    public readonly version: string = '2'
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
      version: this.version,
    };
  }

  static fromObject(recipeObject: Record<string, any>): Recipe {
    const recipeVersion = recipeObject.hasOwnProperty('version') ? recipeObject['version'] : '1';
    if (!recipeVersions.find((v) => v === recipeVersion)) {
      throw `Invalid version string: ${recipeVersion}`;
    }

    return new Recipe(
      recipeObject['title'],
      recipeObject['description'],
      recipeObject['steps'].map((s: object) => RecipeStep.fromObject(s)),
      recipeObject['ingredients'].map((i: object) => RecipeIngredient.fromObject(i, recipeVersion)),
      recipeObject['id'],
      recipeVersion
    );
  }
}
