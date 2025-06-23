import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { RecipeAction } from '../src/recipe-action';
import { RecipeClient } from '../src/recipe-client';
import { RecipeOutput } from '../src/recipe';
import { RecipeError } from '../src/errors';

const sampleRecipe: RecipeOutput = {
  id: 'recipe-id',
  title: 'recipe name',
  description: 'test recipe',
};

describe('RecipeClient', () => {
  const mockDdb = mockClient(DynamoDBClient);
  let client: RecipeClient;

  beforeEach(() => {
    mockDdb.reset();

    client = new RecipeClient(new DynamoDBClient({}));
  });

  describe('search', () => {
    it('should query DDB on a search', async () => {
      const action = {
        operation: 'Search',
        recipeBody: undefined,
        recipeId: undefined,
        cognitoUserId: 'user-id',
      } as RecipeAction;

      mockDdb.on(QueryCommand).resolves({
        Items: [
          {
            json: { S: JSON.stringify(sampleRecipe) },
          },
        ],
      });

      const recipeResponse = await client.search(action);
      expect(recipeResponse).toStrictEqual([sampleRecipe]);

      expect(mockDdb.calls()).toHaveLength(1);
      const searchCommand = mockDdb.call(0).firstArg as QueryCommand;
      expect(searchCommand.input).toStrictEqual({
        TableName: 'recipes',
        IndexName: 'owner-title',
        KeyConditionExpression: 'ownerEmail = :ownerEmail',
        ExpressionAttributeValues: {
          ':ownerEmail': { S: 'user-id' },
        },
      });
    });

    it('should throw if the response is malformed', async () => {
      const action = {
        operation: 'Search',
        recipeBody: undefined,
        recipeId: undefined,
        cognitoUserId: 'user-id',
      } as RecipeAction;

      mockDdb.on(QueryCommand).resolves({
        Items: [
          {
            nope: { S: JSON.stringify(sampleRecipe) },
          },
        ],
      });

      await expect(() => client.search(action)).rejects.toThrow(RecipeError);
    });

    it('should throw on invalid action', async () => {
      const action = {
        operation: 'Update',
        recipeBody: undefined,
        recipeId: undefined,
        cognitoUserId: 'user-id',
      } as RecipeAction;

      await expect(() => client.search(action)).rejects.toThrow(RecipeError);
    });
  });

  describe('getById', () => {
    it('should query DDB for the recipe ID', async () => {
      const action = {
        operation: 'GetById',
        recipeBody: undefined,
        recipeId: 'recipe-id',
        cognitoUserId: 'user-id',
      } as RecipeAction;

      mockDdb.on(QueryCommand).resolves({
        Items: [
          {
            json: { S: JSON.stringify(sampleRecipe) },
          },
        ],
      });

      const recipeResponse = await client.getById(action);
      expect(recipeResponse).toStrictEqual(sampleRecipe);

      expect(mockDdb.calls()).toHaveLength(1);
      const getByIdCommand = mockDdb.call(0).firstArg as QueryCommand;
      expect(getByIdCommand.input).toStrictEqual({
        TableName: 'recipes',
        KeyConditionExpression: 'ownerEmail = :ownerEmail AND recipeId = :recipeId',
        ExpressionAttributeValues: {
          ':ownerEmail': { S: 'user-id' },
          ':recipeId': { S: 'recipe-id' },
        },
      });
    });

    it('should return undefined for recipe not found', async () => {
      const action = {
        operation: 'GetById',
        recipeBody: undefined,
        recipeId: 'recipe-id',
        cognitoUserId: 'user-id',
      } as RecipeAction;

      mockDdb.on(QueryCommand).resolves({
        Items: [],
      });

      const recipeResponse = await client.getById(action);
      expect(recipeResponse).toBeUndefined();
    });
  });
});
