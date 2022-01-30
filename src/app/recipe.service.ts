import { Injectable } from '@angular/core';
import {
  CreateTableCommand,
  DynamoDBClient,
  ListTablesCommand,
  PutItemCommand,
  QueryCommand,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { BehaviorSubject } from 'rxjs';
import { CacheService, TypedCache } from './cache.service';
import { DdbService } from './ddb.service';
import { SessionService } from './session.service';
import { Recipe } from './types/recipe';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  public readonly viewRecipe: BehaviorSubject<Recipe | undefined>;
  public readonly editRecipe: BehaviorSubject<Recipe | undefined>;

  private readonly ddbClient: DynamoDBClient;
  private readonly tableName = 'recipes';
  private readonly titleIndexName = 'owner-title';

  private readonly recipeCache: TypedCache<Recipe>;

  constructor(private readonly sessionService: SessionService, cacheService: CacheService, ddbService: DdbService) {
    this.viewRecipe = new BehaviorSubject<Recipe | undefined>(undefined);
    this.editRecipe = new BehaviorSubject<Recipe | undefined>(undefined);

    this.ddbClient = ddbService.createDdbClient();
    this.recipeCache = cacheService.createTypedCache();
  }

  async saveRecipe(recipe: Recipe): Promise<Recipe> {
    const ownerEmail = this.sessionService.loggedInEmail();
    if (!ownerEmail) throw 'No active session';

    this.recipeCache.invalidate(recipe.id);
    const putItemCommand = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        ownerEmail: { S: ownerEmail },
        recipeId: { S: recipe.id },
        recipeTitle: { S: recipe.title },
        json: { S: JSON.stringify(recipe.toObject()) },
      },
    });
    const putItemResult = this.ddbClient.send(putItemCommand);
    console.log(putItemResult);
    return recipe;
  }

  async listRecipes(): Promise<Recipe[]> {
    const ownerEmail = this.sessionService.loggedInEmail();
    if (!ownerEmail) throw 'No logged in email';

    const listRecipesCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: this.titleIndexName,
      KeyConditionExpression: 'ownerEmail = :ownerEmail',
      ExpressionAttributeValues: {
        ':ownerEmail': { S: ownerEmail },
      },
    });
    const listRecipesResult = await this.ddbClient.send(listRecipesCommand);
    return this.parseQueryResponse(listRecipesResult);
  }

  getRecipeById(recipeId: string): Promise<Recipe> {
    return this.recipeCache.makeCachedCall(
      async () => {
        const ownerEmail = this.sessionService.loggedInEmail();
        if (!ownerEmail) throw 'No logged in email';

        const recipeByIdCommand = new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'ownerEmail = :ownerEmail AND recipeId = :recipeId',
          ExpressionAttributeValues: {
            ':ownerEmail': { S: ownerEmail },
            ':recipeId': { S: recipeId },
          },
        });
        const recipeByIdResult = await this.ddbClient.send(recipeByIdCommand);
        const recipes = this.parseQueryResponse(recipeByIdResult);
        if (recipes.length > 0) {
          return recipes[0];
        } else {
          throw `Unable to locate recipe: ${recipeId}`;
        }
      },
      { key: recipeId, ttl: 300000 }
    );
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

  private parseQueryResponse(queryResponse: QueryCommandOutput): Recipe[] {
    if (queryResponse.Items) {
      return queryResponse.Items?.map((item) => {
        const json = item['json'].S;
        const parsed = JSON.parse(json as string);
        return Recipe.fromObject(parsed);
      });
    } else {
      return [];
    }
  }

  private async createTable() {
    const createTableCommand = new CreateTableCommand({
      TableName: this.tableName,
      AttributeDefinitions: [
        { AttributeName: 'ownerEmail', AttributeType: 'S' },
        { AttributeName: 'recipeId', AttributeType: 'S' },
        { AttributeName: 'recipeTitle', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'ownerEmail', KeyType: 'HASH' },
        { AttributeName: 'recipeId', KeyType: 'RANGE' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: this.titleIndexName,
          KeySchema: [
            { AttributeName: 'ownerEmail', KeyType: 'HASH' },
            { AttributeName: 'recipeTitle', KeyType: 'RANGE' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });
    const createTableResult = await this.ddbClient.send(createTableCommand);
    console.log(createTableResult);
  }

  setViewRecipe(recipe?: Recipe) {
    this.viewRecipe.next(recipe);
    this.editRecipe.next(undefined);
  }

  setEditRecipe(recipe?: Recipe) {
    this.editRecipe.next(recipe);
    this.viewRecipe.next(undefined);
  }

  clearActiveRecipes() {
    this.viewRecipe.next(undefined);
    this.editRecipe.next(undefined);
  }
}
