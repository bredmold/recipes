import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../src';
import { RecipeClient } from '../src/recipe-client';
import { RecipeInput } from '../src/recipe';
import { RecipeAction } from '../src/recipe-action';
import { BadRequestError } from '../src/errors';

const event = {
  httpMethod: 'GET',
  path: '/test/path',
  headers: {},
  body: null,
  requestContext: {
    identity: {
      cognitoAuthenticationProvider: 'part1:part2:part3',
    },
  },
} as APIGatewayEvent;

jest.mock('../src/recipe-client', () => {
  class MockRecipeClient {
    static mockSearch = jest.fn();
    search = MockRecipeClient.mockSearch;
  }

  const actual = jest.requireActual('../src/recipe-client');
  return {
    ...actual,
    RecipeClient: MockRecipeClient,
  };
});

const mockSearchAction = {
  operation: 'Search',
  recipeId: undefined,
  recipeBody: undefined,
  cognitoUserId: 'test-user-id',
};

jest.mock('../src/recipe-action', () => {
  const actual = jest.requireActual('../src/recipe-action');

  return {
    ...actual,
    RecipeAction: jest.fn(),
  };
});

const fakeRecipe: RecipeInput = {
  title: 'recipe name',
  description: 'test recipe',
};

describe('Recipe backend handler', () => {
  const MockRecipeClient = jest.mocked(RecipeClient);
  const mockSearch = (MockRecipeClient as any).mockSearch as jest.Mock;

  const MockRecipeAction = jest.mocked(RecipeAction);

  beforeEach(() => {
    mockSearch.mockReset();
    MockRecipeAction.mockReset();
  });

  it('should return OK on a search request', async () => {
    mockSearch.mockResolvedValue([fakeRecipe]);
    MockRecipeAction.mockReturnValue(mockSearchAction as RecipeAction);

    const response = await handler(event, {} as Context, () => {});

    expect(response).toEqual({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      body: JSON.stringify([fakeRecipe]),
    });
  });

  it('should return 400 for an invalid request', async () => {
    MockRecipeAction.mockImplementation(() => {
      throw new BadRequestError('test case');
    });
    const response = await handler(event, {} as Context, () => {});

    expect(response).toEqual({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      body: JSON.stringify({ name: 'BadRequestError', message: 'test case' }),
    });
  });

  it('should return 500 unknown error type', async () => {
    MockRecipeAction.mockImplementation(() => {
      throw new Error("other error");
    });
    const response = await handler(event, {} as Context, () => {});

    expect(response).toEqual({
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      body: JSON.stringify({ name: 'Error', message: 'other error' }),
    });
  });

  it('should return 500 for unexpected error', async () => {
    MockRecipeAction.mockImplementation(() => {
      throw 'some random error';
    });
    const response = await handler(event, {} as Context, () => {});

    expect(response).toEqual({
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      body: JSON.stringify({ name: 'UNKNOWN', message: 'Unexpected error' }),
    });
  });
});
