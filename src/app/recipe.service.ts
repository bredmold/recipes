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
import { Recipe } from './types/recipe';
import { Observable, Subscriber } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  public readonly activeRecipe: Observable<Recipe>;
  private recipeSubscriber!: Subscriber<Recipe>;

  private readonly ddbClient: DynamoDBClient;
  private readonly tableName = 'recipes';
  private readonly titleIndexName = 'owner-title';

  constructor(private sessionService: SessionService) {
    this.activeRecipe = new Observable<Recipe>((subscriber) => {
      this.recipeSubscriber = subscriber;
    });

    this.ddbClient = new DynamoDBClient(environment.ddbConfig);
  }

  async saveRecipe(recipe: Recipe) {
    const ownerEmail = this.sessionService.loggedInEmail();
    if (!ownerEmail) throw 'No active session';

    const putItemCommand = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        ownerEmail: { S: ownerEmail },
        recipeId: { S: recipe.id },
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
      IndexName: this.titleIndexName,
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
      this.setActiveRecipe(allRecipes[0]);
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

  setActiveRecipe(recipe: Recipe) {
    this.recipeSubscriber.next(recipe);
  }
}
