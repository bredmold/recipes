import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { RequestLogger } from './logging';
import { RecipeAction } from './recipe-action';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { RecipeClient } from './recipe-client';
import { statusCodeFor } from './errors';

const ddbClient = new DynamoDBClient({});
const recipeClient = new RecipeClient(ddbClient);

function proxyResponse(status: number, body: any) {
  return {
    isBase64Encoded: false,
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function okResponse(body: any): APIGatewayProxyResult {
  return proxyResponse(200, body);
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const logger = new RequestLogger(event);
  logger.logEventDetails();

  try {
    const action = new RecipeAction(event);

    switch (action.operation) {
      case 'Search':
        const recipeList = await recipeClient.search(action);
        return okResponse(recipeList);

      case 'GetById':
        const recipe = await recipeClient.getById(action);
        return recipe
          ? okResponse(recipe)
          : proxyResponse(404, { name: 'NOT_FOUND', message: `Recipe ${action.recipeId} not found` });

      default:
        return okResponse({ operation: action.operation, recipeId: action.recipeId });
    }
  } catch (e) {
    if (e instanceof Error) {
      logger.logStructuredError(e);
      if (e.stack) console.error(e.stack);
      const statusCode = statusCodeFor(e);
      return proxyResponse(statusCode, { name: e.name, message: e.message });
    } else {
      logger.logOtherError(e);
      return proxyResponse(500, { name: 'UNKNOWN', message: 'Unexpected error' });
    }
  }
};
