import { Injectable } from '@angular/core';
import { DeleteItemCommand, PutItemCommand, QueryCommand, QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import { BehaviorSubject } from 'rxjs';
import { CacheService, TypedCache } from './cache.service';
import { DdbService } from './ddb.service';
import { SessionService } from './session.service';
import { Recipe } from '../types/recipe';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  public readonly viewRecipe: BehaviorSubject<Recipe | undefined>;
  public readonly editRecipe: BehaviorSubject<Recipe | undefined>;

  private readonly tableName = 'recipes';
  private readonly titleIndexName = 'owner-title';

  private readonly recipeCache: TypedCache<Recipe>;

  constructor(
    private readonly sessionService: SessionService,
    cacheService: CacheService,
    private readonly ddbService: DdbService,
  ) {
    this.viewRecipe = new BehaviorSubject<Recipe | undefined>(undefined);
    this.editRecipe = new BehaviorSubject<Recipe | undefined>(undefined);

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
    const putItemResult = await this.ddbService.putItem(putItemCommand);
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
    const listRecipesResult = await this.ddbService.query(listRecipesCommand);
    return this.parseQueryResponse(listRecipesResult);
  }

  async hasRecipeTitle(title: string): Promise<boolean> {
    const ownerEmail = this.sessionService.loggedInEmail();
    if (!ownerEmail) throw 'No logged in email';

    const hasRecipeTitleCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: this.titleIndexName,
      KeyConditionExpression: 'ownerEmail = :ownerEmail AND recipeTitle = :title',
      ExpressionAttributeValues: {
        ':ownerEmail': { S: ownerEmail },
        ':title': { S: title },
      },
      ProjectionExpression: 'recipeTitle'
    });
    const hasRecipeTitleResults = await this.ddbService.query(hasRecipeTitleCommand);
    return !!hasRecipeTitleResults.Count && hasRecipeTitleResults.Count > 0;
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
        const recipeByIdResult = await this.ddbService.query(recipeByIdCommand);
        const recipes = this.parseQueryResponse(recipeByIdResult);
        if (recipes.length > 0) {
          return recipes[0];
        } else {
          throw `Unable to locate recipe: ${recipeId}`;
        }
      },
      { key: recipeId, ttl: 300000 },
    );
  }

  async deleteRecipeById(recipeId: string): Promise<any> {
    const ownerEmail = this.sessionService.loggedInEmail();
    if (!ownerEmail) throw 'No logged in email';

    const deleteRecipeCommand = new DeleteItemCommand({
      TableName: this.tableName,
      Key: {
        ownerEmail: { S: ownerEmail },
        recipeId: { S: recipeId },
      },
    });
    const deleteItemResponse = await this.ddbService.deleteItem(deleteRecipeCommand);
    console.log(deleteItemResponse);
    this.recipeCache.invalidate(recipeId);
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
