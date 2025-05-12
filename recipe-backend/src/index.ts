import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import _ from 'lodash';
import { RequestLogger } from './logging';
import { extractCognitoUserId } from './utils';

class RecipeError extends Error {
  override readonly name = 'RecipeError';

  constructor(message: string) {
    super(message);
  }
}

interface Recipe {}

type RecipeOperation = 'Search' | 'Add' | 'GetById' | 'Update' | 'Delete';

class RecipeAction {
  private static parseBody(event: APIGatewayProxyEvent): Recipe {
    if (typeof event.body === 'string') {
      return JSON.parse(event.body) as Recipe;
    } else {
      throw new RecipeError('Expected a request body');
    }
  }

  private static readonly RECIPE_ID_KEY = 'pathParameters.recipeId';

  public readonly operation: RecipeOperation;
  public readonly recipeId: string | undefined;
  public readonly recipeBody: Recipe | undefined;
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
      throw new RecipeError('Unable to determine recipe action');
    }
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const logger = new RequestLogger(event);
  logger.logEventDetails();

  try {
    const action = new RecipeAction(event);

    return {
      isBase64Encoded: false,
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: action.operation, recipeId: action.recipeId }),
    } as APIGatewayProxyResult;
  } catch (e) {
    if (e instanceof Error) {
      logger.logStructuredError(e);
      if (e.stack) console.error(e.stack);
      return {
        isBase64Encoded: false,
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: e.name, message: e.message }),
      } as APIGatewayProxyResult;
    } else {
      logger.logOtherError(e);
      return {
        isBase64Encoded: false,
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'UNKNOWN', message: 'Unexpected error' }),
      } as APIGatewayProxyResult;
    }
  }
};
