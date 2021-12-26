import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@angular/core';
import {
  CreateTableCommand,
  DynamoDBClient,
  ListTablesCommand,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { environment } from '../environments/environment';
import { SessionService } from './session.service';

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

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private activeRecipe = new Recipe('Example Recipe', 'Example recipe description', [], []);

  private readonly ddbClient: DynamoDBClient;
  private readonly tableName = 'recipes';

  constructor(private sessionService: SessionService) {
    this.ddbClient = new DynamoDBClient(environment.ddbConfig);
  }

  async saveRecipe(recipe: Recipe) {
    const ownerEmail = this.sessionService.loggedInEmail();
    if (!ownerEmail) throw 'No active session';

    const putItemCommand = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        ownerEmail: { S: ownerEmail },
        recipeTitle: { S: recipe.title },
        json: { S: JSON.stringify(recipe.toObject()) },
      },
    });
    try {
      const putItemResult = this.ddbClient.send(putItemCommand);
      console.log(putItemResult);
    } catch (err) {
      console.error(err);
    }
  }

  async listRecipes(): Promise<Recipe[]> {
    const ownerEmail = this.sessionService.loggedInEmail();
    if (!ownerEmail) throw 'No logged in email';

    const listRecipesCommand = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'ownerEmail = :ownerEmail',
      ExpressionAttributeValues: {
        ':ownerEmail': { S: ownerEmail },
      },
    });
    const listRecipesResult = await this.ddbClient.send(listRecipesCommand);
    if (listRecipesResult.Items) {
      return listRecipesResult.Items?.map((item) => {
        const json = item['json'].S;
        const parsed = JSON.parse(json as string);
        return Recipe.fromObject(parsed);
      });
    } else {
      return [];
    }
  }

  async loadActiveRecipe() {
    const allRecipes = await this.listRecipes();
    if (allRecipes && allRecipes.length > 0) {
      this.activeRecipe = allRecipes[0];
    } else {
      console.log('No active recipe, setting default');
    }
  }

  async storageSetup() {
    const command = new ListTablesCommand({});
    try {
      const listTablesResult = await this.ddbClient.send(command);
      const tables = listTablesResult.TableNames || [];
      if (tables.find((t) => t == this.tableName)) {
        console.log('Found matching table');
      } else {
        console.log('Setting up table');
        await this.createTable();
      }
    } catch (err) {
      console.error(err);
    }
  }

  private async createTable() {
    const createTableCommand = new CreateTableCommand({
      TableName: this.tableName,
      AttributeDefinitions: [
        { AttributeName: 'ownerEmail', AttributeType: 'S' },
        { AttributeName: 'recipeTitle', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'ownerEmail', KeyType: 'HASH' },
        { AttributeName: 'recipeTitle', KeyType: 'RANGE' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });
    const createTableResult = await this.ddbClient.send(createTableCommand);
    console.log(createTableResult);
  }

  setActiveRecipe(recipe: Recipe) {
    this.activeRecipe = recipe;
  }

  getActiveRecipe(): Recipe {
    return this.activeRecipe;
  }
}
