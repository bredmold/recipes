import { AttributeValue, DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { RecipeAction } from './recipe-action';
import { RecipeOutput } from './recipe';
import { RecipeError } from './errors';

export class RecipeClient {
  private static readonly TABLE_NAME = 'recipes';
  private static readonly TITLE_INDEX_NAME = 'owner-title';

  constructor(private readonly ddb: DynamoDBClient) {}

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
    return items.map((item) => this.parseItem(item));
  }

  private parseItem(item: Record<string, AttributeValue>): RecipeOutput {
    if (item['json'] && item['json'].S) {
      return JSON.parse(item['json'].S);
    } else {
      throw new RecipeError('Malformed recipe item, missing json field');
    }
  }
}
