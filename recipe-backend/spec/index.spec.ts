import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../src';
import { RecipeClient } from '../src/recipe-client';
import { RecipeInput, RecipeOutput } from '../src/recipe';
import { RecipeAction } from '../src/recipe-action';
import { BadRequestError, RecipeConflictError } from '../src/errors';

const fakeRecipe: RecipeInput = {
  title: 'recipe name',
  description: 'test recipe',
};

const fakeRecipeResponse: RecipeOutput = {
  ...fakeRecipe,
  id: 'recipe-id',
};

const searchEvent = {
  httpMethod: 'GET',
  path: '/recipe',
  resource: '/recipe',
  headers: {},
  body: null,
  requestContext: {
    identity: {
      cognitoAuthenticationProvider: 'part1:part2:part3',
    },
  },
} as APIGatewayEvent;

const getByIdEvent = {
  ...searchEvent,
  path: '/recipe/recipe-id',
  resource: '/recipe/{recipeId}',
  pathParameters: { recipeId: 'recipe-id' },
} as APIGatewayEvent;

const addRecipeEvent = {
  ...searchEvent,
  method: 'POST',
  body: JSON.stringify(fakeRecipe),
} as APIGatewayEvent;

const mockSearchAction = {
  operation: 'Search',
  recipeId: undefined,
  recipeBody: undefined,
  cognitoUserId: 'test-user-id',
};

const mockGetByIdAction = {
  operation: 'GetById',
  recipeId: 'recipe-id',
  recipeBody: undefined,
  cognitoUserId: 'test-user-id',
};

const mockAddAction = {
  operation: 'Add',
  recipeId: undefined,
  recipeBody: fakeRecipe,
  cognitoUserId: 'test-user-id',
};

jest.mock('../src/recipe-client', () => {
  class MockRecipeClient {
    static mockSearch = jest.fn();
    static mockGetById = jest.fn();
    static mockAdd = jest.fn();
    search = MockRecipeClient.mockSearch;
    getById = MockRecipeClient.mockGetById;
    add = MockRecipeClient.mockAdd;
  }

  const actual = jest.requireActual('../src/recipe-client');
  return {
    ...actual,
    RecipeClient: MockRecipeClient,
  };
});

jest.mock('../src/recipe-action', () => {
  const actual = jest.requireActual('../src/recipe-action');

  return {
    ...actual,
    RecipeAction: jest.fn(),
  };
});

describe('Recipe backend handler', () => {
  const MockRecipeClient = jest.mocked(RecipeClient);
  const mockSearch = (MockRecipeClient as any).mockSearch as jest.Mock;
  const mockGetById = (MockRecipeClient as any).mockGetById as jest.Mock;
  const mockAdd = (MockRecipeClient as any).mockAdd as jest.Mock;

  const MockRecipeAction = jest.mocked(RecipeAction);

  beforeEach(() => {
    mockSearch.mockReset();
    mockGetById.mockReset();
    mockAdd.mockReset();
    MockRecipeAction.mockReset();
  });

  it('should return OK on a search request', async () => {
    mockSearch.mockResolvedValue([fakeRecipe]);
    MockRecipeAction.mockReturnValue(mockSearchAction as RecipeAction);

    const response = await handler(searchEvent, {} as Context, () => {});

    expect(response).toEqual({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      body: JSON.stringify([fakeRecipe]),
    });
  });

  it('should return OK on a get-by-id request', async () => {
    mockGetById.mockResolvedValue(fakeRecipe);
    MockRecipeAction.mockReturnValue(mockGetByIdAction as RecipeAction);

    const response = await handler(getByIdEvent, {} as Context, () => {});

    expect(response).toEqual({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      body: JSON.stringify(fakeRecipe),
    });
  });

  it('should return OK on an add-recipe request', async () => {
    mockAdd.mockResolvedValue(fakeRecipeResponse);
    MockRecipeAction.mockReturnValue(mockAddAction as RecipeAction);

    const response = await handler(addRecipeEvent, {} as Context, () => {});

    expect(response).toEqual({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      body: JSON.stringify(fakeRecipeResponse),
    });
  });

  it('should return 409 for RecipeConflictError', async () => {
    mockAdd.mockRejectedValue(new RecipeConflictError('test conflict'));
    MockRecipeAction.mockReturnValue(mockAddAction as RecipeAction);

    const response = await handler(addRecipeEvent, {} as Context, () => {});

    expect(response).toEqual({
      statusCode: 409,
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      body: JSON.stringify({ name: 'RecipeConflictError', message: 'test conflict' }),
    });
  });

  it('should return 400 for an invalid request', async () => {
    MockRecipeAction.mockImplementation(() => {
      throw new BadRequestError('test case');
    });
    const response = await handler(searchEvent, {} as Context, () => {});

    expect(response).toEqual({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      body: JSON.stringify({ name: 'BadRequestError', message: 'test case' }),
    });
  });

  it('should return 500 unknown error type', async () => {
    MockRecipeAction.mockImplementation(() => {
      throw new Error('other error');
    });
    const response = await handler(searchEvent, {} as Context, () => {});

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
    const response = await handler(searchEvent, {} as Context, () => {});

    expect(response).toEqual({
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      body: JSON.stringify({ name: 'UNKNOWN', message: 'Unexpected error' }),
    });
  });
});
