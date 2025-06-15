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
});
