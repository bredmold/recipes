import { APIGatewayEvent, APIGatewayProxyEvent } from 'aws-lambda';
import { RecipeInput } from './recipe';
import { extractCognitoUserId, getEventHeader } from './utils';
import { BadRequestError } from './errors';
import _ from 'lodash';
import { RequestLogger } from './logging';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

export type RecipeOperation = 'Search' | 'Add' | 'GetById' | 'Update' | 'Delete';

export class RecipeAction {
  private static parseBody(event: APIGatewayProxyEvent): RecipeInput {
    if (typeof event.body === 'string') {
      return JSON.parse(event.body) as RecipeInput;
    } else {
      throw new BadRequestError('Expected a request body');
    }
  }

  private static readonly RECIPE_ID_RESOURCE = '/recipe/{recipeId}';
  private static readonly RECIPE_ID_KEY = 'pathParameters.recipeId';

  public readonly operation: RecipeOperation;
  public readonly recipeId: string | undefined;
  public readonly recipeBody: RecipeInput | undefined;
  public readonly cognitoUserId: string;

  constructor(
    event: APIGatewayEvent,
    public readonly logger: RequestLogger,
  ) {
    this.cognitoUserId = extractCognitoUserId(event);
    const method = event.httpMethod.toUpperCase();
    const resource = event.resource;

    if (method === 'GET' && resource === '/recipe') {
      this.operation = 'Search';
      this.recipeId = undefined;
      this.recipeBody = undefined;
    } else if (method === 'POST' && resource === '/recipe') {
      this.operation = 'Add';
      this.recipeId = this.validateClientRecipeId(event);
      this.recipeBody = RecipeAction.parseBody(event);
    } else if (
      method === 'GET' &&
      resource === RecipeAction.RECIPE_ID_RESOURCE &&
      _.has(event, RecipeAction.RECIPE_ID_KEY)
    ) {
      this.operation = 'GetById';
      this.recipeId = _.get(event, RecipeAction.RECIPE_ID_KEY) as string;
      this.recipeBody = undefined;
    } else if (
      method === 'PUT' &&
      resource === RecipeAction.RECIPE_ID_RESOURCE &&
      _.has(event, RecipeAction.RECIPE_ID_KEY)
    ) {
      this.operation = 'Update';
      this.recipeId = _.get(event, RecipeAction.RECIPE_ID_KEY) as string;
      this.recipeBody = RecipeAction.parseBody(event);
    } else if (
      method === 'DELETE' &&
      resource === RecipeAction.RECIPE_ID_RESOURCE &&
      _.has(event, RecipeAction.RECIPE_ID_KEY)
    ) {
      this.operation = 'Delete';
      this.recipeId = _.get(event, RecipeAction.RECIPE_ID_KEY) as string;
      this.recipeBody = undefined;
    } else {
      throw new BadRequestError('Unable to determine recipe action');
    }
  }

  private validateClientRecipeId(event: APIGatewayProxyEvent): string | undefined {
    const recipeId = getEventHeader(event, 'x-recipe-id');
    if (recipeId) {
      if (uuidValidate(recipeId) && uuidVersion(recipeId) === 4) return recipeId;
      else {
        this.logger.logWarning('Customer submitted an inappropriate UUID, ignoring');
      }
    }
    return undefined;
  }
}
