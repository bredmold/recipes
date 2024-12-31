import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import _ from 'lodash';

class RecipeError extends Error {
  override readonly name = 'RecipeError';

  constructor(message: string) {
    super(message);
  }
}

function scrubHeader(key: string, value: string | undefined): string | undefined {
  return key.toLowerCase() === 'authorization' ? 'OMITTED' : value;
}

interface Recipe {}

type RecipeOperation = 'Search' | 'Add' | 'GetById' | 'Update' | 'Delete';

class RecipeAction {
  private static parseBody(event: APIGatewayEvent): Recipe {
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

  constructor(event: APIGatewayEvent) {
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

function logEventDetails(event: APIGatewayEvent) {
  const routeKey = `${event.httpMethod} ${event.path}`;
  console.log(`routeKey=${routeKey}`);
  if (event.pathParameters) {
    for (const [key, value] of Object.entries(event.pathParameters)) {
      console.log(`path param ${key}=${value}`);
    }
  }
  if (event.headers) {
    for (const [key, value] of Object.entries(event.headers)) {
      const scrubbedValue = scrubHeader(key, value);
      console.log(`header ${key}=${scrubbedValue}`);
    }
  }
  if (event.body) {
    console.log(`body with length ${event.body.length}`);
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const action = new RecipeAction(event);

    return {
      isBase64Encoded: false,
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: action.operation, recipeId: action.recipeId }),
    } as APIGatewayProxyResult;
  } catch (e) {
    logEventDetails(event);
    if (e instanceof Error) {
      console.error(`ERROR name=${e.name}`);
      console.error(`ERROR message=${e.message}`);
      if (e.stack) console.error(e.stack);
      return {
        isBase64Encoded: false,
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: e.name, message: e.message }),
      } as APIGatewayProxyResult;
    } else {
      console.error(e);
      return {
        isBase64Encoded: false,
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'UNKNOWN', message: 'Unexpected error' }),
      } as APIGatewayProxyResult;
    }
  }
};
