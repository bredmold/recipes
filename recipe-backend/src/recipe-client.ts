import { AttributeValue, DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { RecipeAction } from './recipe-action';
import { RecipeInput, RecipeOutput } from './recipe';
import { RecipeConflictError, RecipeError } from './errors';
import { v4 as uuidv4 } from 'uuid';

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

  async add(action: RecipeAction): Promise<RecipeOutput> {
    const recipeId = await this.validateSaveAction(action);
    const recipe: RecipeOutput = {
      ...action.recipeBody!,
      id: recipeId,
    };

    const ownerEmail = action.cognitoUserId;
    const putItemCommand = new PutItemCommand({
      TableName: RecipeClient.TABLE_NAME,
      Item: {
        ownerEmail: { S: ownerEmail },
        recipeId: { S: recipeId },
        recipeTitle: { S: recipe.title },
        json: { S: JSON.stringify(recipe) },
      },
    });
    await this.ddb.send(putItemCommand);
    action.logger.logEventSuccess({ action: action.operation, result: 'added' });
    return recipe;
  }

  private parseItem(item: Record<string, AttributeValue>): RecipeOutput {
    if (item['json'] && item['json'].S) {
      return JSON.parse(item['json'].S);
    } else {
      throw new RecipeError('Malformed recipe item, missing json field');
    }
  }

  /**
   * Validate business logic before saving the recipe:
   * - owner + title is unique
   * - client requested recipe ID is unique

   * @throws RecipeConflictError if business logic fails
   */
  private async validateSaveAction(action: RecipeAction): Promise<string> {
    // TODO this really feels like it should be part of a conditional write operation
    const body: RecipeInput = action.recipeBody!;
    // Can I do a conditional update for this?
    const ownerTitleResponse = await this.ddb.send(
      new QueryCommand({
        TableName: RecipeClient.TABLE_NAME,
        IndexName: RecipeClient.TITLE_INDEX_NAME,
        ProjectionExpression: 'recipeId',
        KeyConditionExpression: 'ownerEmail = :ownerEmail AND title = :title',
        ExpressionAttributeValues: {
          ':ownerEmail': { S: action.cognitoUserId },
          ':title': { S: body.title },
        },
      }),
    );
    if (ownerTitleResponse.Items && ownerTitleResponse.Items.length > 0) {
      throw new RecipeConflictError(`Recipe exists: owner=${action.cognitoUserId} title=${body.title}`);
    }

    if (action.recipeId) {
      // Check for existence of requested recipe ID
      const recipeById = await this.getById(action);
      if (!recipeById) return action.recipeId;
    }

    return uuidv4();
  }
}
