import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { RequestLogger } from './logging';
import { RecipeAction } from './recipe-action';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { RecipeClient } from './recipe-client';
import { statusCodeFor } from './errors';

const ddbClient = new DynamoDBClient({});
const recipeClient = new RecipeClient(ddbClient);

function proxyResponse(status: number, body: any) {
  let headers: Record<string, string>;
  let renderedBody: string;

  if (body) {
    headers = { 'Content-Type': 'application/json' };
    renderedBody = JSON.stringify(body);
  } else {
    headers = {};
    renderedBody = '';
  }

  return {
    isBase64Encoded: false,
    statusCode: status,
    headers: headers,
    body: renderedBody,
  };
}

function okResponse(body: any): APIGatewayProxyResult {
  return proxyResponse(200, body);
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const logger = new RequestLogger(event);
  logger.logEventDetails();

  try {
    const action = new RecipeAction(event, logger);

    switch (action.operation) {
      case 'Search':
        const recipeList = await recipeClient.search(action);
        return okResponse(recipeList);

      case 'HeadSearch':
        const recipeIdList = await recipeClient.idSearch(action);
        if (recipeIdList.length > 0) {
          return okResponse(undefined);
        } else {
          return proxyResponse(404, undefined);
        }

      case 'GetById':
        const recipeById = await recipeClient.getById(action);
        return recipeById
          ? okResponse(recipeById)
          : proxyResponse(404, { name: 'NOT_FOUND', message: `Recipe ${action.criteria.recipeId} not found` });

      case 'Add':
        const newRecipe = await recipeClient.add(action);
        return okResponse(newRecipe);

      default:
        return okResponse({ operation: action.operation, recipeId: action.criteria.recipeId });
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
