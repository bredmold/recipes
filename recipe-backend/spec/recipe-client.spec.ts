import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { RecipeAction } from '../src/recipe-action';
import { RecipeClient } from '../src/recipe-client';
import { RecipeInput, RecipeOutput } from '../src/recipe';
import { RecipeConflictError, RecipeError } from '../src/errors';
import { RequestLogger } from '../src/logging';

const sampleRecipe: RecipeOutput = {
  id: 'recipe-id',
  title: 'recipe name',
  description: 'test recipe',
};

describe('RecipeClient', () => {
  const mockDdb = mockClient(DynamoDBClient);
  let client: RecipeClient;

  const mockRequestLogger = { logEventSuccess: jest.fn() };

  beforeEach(() => {
    mockDdb.reset();

    mockRequestLogger.logEventSuccess.mockReset();

    client = new RecipeClient(new DynamoDBClient({}));
  });

  describe('search', () => {
    it('should query DDB on a search', async () => {
      const action = {
        operation: 'Search',
        recipeBody: undefined,
        recipeId: undefined,
        cognitoUserId: 'user-id',
        logger: mockRequestLogger as unknown as RequestLogger,
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
      expect(mockRequestLogger.logEventSuccess).toHaveBeenCalledWith({ action: 'Search', count: 1 });
    });

    it('should throw if the response is malformed', async () => {
      const action = {
        operation: 'Search',
        recipeBody: undefined,
        recipeId: undefined,
        cognitoUserId: 'user-id',
        logger: mockRequestLogger as unknown as RequestLogger,
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
        logger: mockRequestLogger as unknown as RequestLogger,
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
      expect(mockRequestLogger.logEventSuccess).toHaveBeenCalledWith({ action: 'GetById', result: 'found' });
    });

    it('should return undefined for recipe not found', async () => {
      const action = {
        operation: 'GetById',
        recipeBody: undefined,
        recipeId: 'recipe-id',
        cognitoUserId: 'user-id',
        logger: mockRequestLogger as unknown as RequestLogger,
      } as RecipeAction;

      mockDdb.on(QueryCommand).resolves({
        Items: [],
      });

      const recipeResponse = await client.getById(action);
      expect(recipeResponse).toBeUndefined();
      expect(mockRequestLogger.logEventSuccess).toHaveBeenCalledWith({ action: 'GetById', result: 'not found' });
    });
  });

  describe('add', () => {
    it('should add a recipe', async () => {
      const recipe: RecipeInput = { title: 'test recipe' };
      const action = {
        operation: 'Add',
        recipeBody: recipe,
        recipeId: undefined,
        cognitoUserId: 'user-id',
        logger: mockRequestLogger as unknown as RequestLogger,
      } as RecipeAction;

      mockDdb.on(QueryCommand).resolves({ Items: [] });
      mockDdb.on(PutItemCommand).resolves({});

      const recipeResponse = await client.add(action);
      expect(recipeResponse).toMatchObject(recipe);
      expect(typeof recipeResponse.id).toStrictEqual('string');
    });

    it('should throw RecipeConflictError if title validation fails', async () => {
      const recipe: RecipeInput = { title: 'test recipe' };
      const action = {
        operation: 'Add',
        recipeBody: recipe,
        recipeId: undefined,
        cognitoUserId: 'user-id',
        logger: mockRequestLogger as unknown as RequestLogger,
      } as RecipeAction;

      mockDdb.on(QueryCommand).resolves({ Items: [{ recipeId: { S: 'recipe-id' } }] });

      await expect(() => client.add(action)).rejects.toThrow(RecipeConflictError);
    });

    it('should discard the suggested recipe ID if it exists', async () => {
      const recipe: RecipeInput = { title: 'test recipe' };
      const storedRecipe: RecipeOutput = { ...recipe, id: 'recipe-id' };
      const action = {
        operation: 'Add',
        recipeBody: recipe,
        recipeId: 'recipe-id',
        cognitoUserId: 'user-id',
        logger: mockRequestLogger as unknown as RequestLogger,
      } as RecipeAction;

      mockDdb
        .on(QueryCommand)
        .resolvesOnce({ Items: [] })
        .resolvesOnce({ Items: [{ json: { S: JSON.stringify(storedRecipe) } }] });
      mockDdb.on(PutItemCommand).resolves({});

      const recipeResponse = await client.add(action);
      expect(recipeResponse.id).not.toStrictEqual('recipe-id');
    });

    it('should accept the suggested recipe ID if not exists', async () => {
      const recipe: RecipeInput = { title: 'test recipe' };
      const action = {
        operation: 'Add',
        recipeBody: recipe,
        recipeId: 'recipe-id',
        cognitoUserId: 'user-id',
        logger: mockRequestLogger as unknown as RequestLogger,
      } as RecipeAction;

      mockDdb.on(QueryCommand).resolves({ Items: [] });
      mockDdb.on(PutItemCommand).resolves({});

      const recipeResponse = await client.add(action);
      expect(recipeResponse.id).toStrictEqual('recipe-id');
    });
  });
});
