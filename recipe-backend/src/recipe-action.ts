import { APIGatewayEvent, APIGatewayProxyEvent } from 'aws-lambda';
import { RecipeInput } from './recipe';
import { extractCognitoUserId } from './utils';
import { BadRequestError } from './errors';
import _ from 'lodash';

export type RecipeOperation = 'Search' | 'Add' | 'GetById' | 'Update' | 'Delete';

export class RecipeAction {
  private static parseBody(event: APIGatewayProxyEvent): RecipeInput {
    if (typeof event.body === 'string') {
      return JSON.parse(event.body) as RecipeInput;
    } else {
      throw new BadRequestError('Expected a request body');
    }
  }

  private static readonly RECIPE_ID_KEY = 'pathParameters.recipeId';

  public readonly operation: RecipeOperation;
  public readonly recipeId: string | undefined;
  public readonly recipeBody: RecipeInput | undefined;
  public readonly cognitoUserId: string;

  constructor(event: APIGatewayEvent) {
    this.cognitoUserId = extractCognitoUserId(event);
    const method = event.httpMethod.toUpperCase();
    const path = event.path;

    if (method === 'GET' && path === '/recipe') {
      this.operation = 'Search';
      this.recipeId = undefined;
      this.recipeBody = undefined;
    } else if (method === 'POST' && path === '/recipe') {
      this.operation = 'Add';
      this.recipeId = undefined;
      this.recipeBody = RecipeAction.parseBody(event);
    } else if (method === 'GET' && _.has(event, RecipeAction.RECIPE_ID_KEY)) {
      this.operation = 'GetById';
      this.recipeId = _.get(event, RecipeAction.RECIPE_ID_KEY) as string;
      this.recipeBody = undefined;
    } else if (method === 'PUT' && _.has(event, RecipeAction.RECIPE_ID_KEY)) {
      this.operation = 'Update';
      this.recipeId = _.get(event, RecipeAction.RECIPE_ID_KEY) as string;
      this.recipeBody = RecipeAction.parseBody(event);
    } else if (method === 'DELETE' && _.has(event, RecipeAction.RECIPE_ID_KEY)) {
      this.operation = 'Delete';
      this.recipeId = _.get(event, RecipeAction.RECIPE_ID_KEY) as string;
      this.recipeBody = undefined;
    } else {
      throw new BadRequestError('Unable to determine recipe action');
    }
  }
}
