import { AttributeValue, DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { RecipeAction } from './recipe-action';
import { RecipeOutput } from './recipe';
import { RecipeError } from './errors';

export class RecipeClient {
  private static readonly TABLE_NAME = 'recipes';
  private static readonly TITLE_INDEX_NAME = 'owner-title';

  constructor(private readonly ddb: DynamoDBClient) {}

  // TODO need to think about pagination here
  async search(action: RecipeAction): Promise<RecipeOutput[]> {
    if (action.operation !== 'Search') {
      throw new RecipeError(`Routing error: attempting to search when operation=${action.operation}`);
    }

    const ownerEmail = action.cognitoUserId;
    const listRecipesCommand = new QueryCommand({
      TableName: RecipeClient.TABLE_NAME,
      IndexName: RecipeClient.TITLE_INDEX_NAME,
      KeyConditionExpression: 'ownerEmail = :ownerEmail',
      ExpressionAttributeValues: {
        ':ownerEmail': { S: ownerEmail },
      },
    });

    const queryResponse = await this.ddb.send(listRecipesCommand);
    const items = queryResponse.Items || [];
    action.logger.logEventSuccess({ action: action.operation, count: items.length });
    return items.map((item) => this.parseItem(item));
  }

  async getById(action: RecipeAction): Promise<RecipeOutput | undefined> {
    const ownerEmail = action.cognitoUserId;
    const recipeByIdCommand = new QueryCommand({
      TableName: RecipeClient.TABLE_NAME,
      KeyConditionExpression: 'ownerEmail = :ownerEmail AND recipeId = :recipeId',
      ExpressionAttributeValues: {
        ':ownerEmail': { S: ownerEmail },
        ':recipeId': { S: action.recipeId! },
      },
    });

    const queryResponse = await this.ddb.send(recipeByIdCommand);
    if (queryResponse.Items && queryResponse.Items.length > 0) {
      action.logger.logEventSuccess({ action: action.operation, result: 'found' });
      return this.parseItem(queryResponse.Items[0]);
    } else {
      action.logger.logEventSuccess({ action: action.operation, result: 'not found' });
      return undefined;
    }
  }

  private parseItem(item: Record<string, AttributeValue>): RecipeOutput {
    if (item['json'] && item['json'].S) {
      return JSON.parse(item['json'].S);
    } else {
      throw new RecipeError('Malformed recipe item, missing json field');
    }
  }
}
