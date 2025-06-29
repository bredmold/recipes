import { RecipeAction } from '../src/recipe-action';
import { APIGatewayEvent } from 'aws-lambda';
import { RecipeInput } from '../src/recipe';
import { BadRequestError } from '../src/errors';
import { RequestLogger } from '../src/logging';
import { randomUUID } from 'node:crypto';

const TEMPLATE_EVENT = {
  requestContext: { identity: { cognitoAuthenticationProvider: 'p1:p2:user-id' } },
} as APIGatewayEvent;

function testEvent(partialEvent: Partial<APIGatewayEvent>): APIGatewayEvent {
  return {
    ...TEMPLATE_EVENT,
    ...partialEvent,
  };
}

describe('RecipeAction', () => {
  const logger = { logWarning: jest.fn() };

  beforeEach(() => {
    logger.logWarning.mockReset();
  });

  it('should interpret a search request', () => {
    const action = new RecipeAction(
      testEvent({
        httpMethod: 'GET',
        path: '/recipe',
        resource: '/recipe',
      }),
      logger as unknown as RequestLogger,
    );

    expect(action.operation).toStrictEqual('Search');
    expect(action.recipeId).toBeUndefined();
    expect(action.recipeBody).toBeUndefined();
    expect(action.cognitoUserId).toStrictEqual('user-id');
  });

  it('should interpret a get-by-id request', () => {
    const action = new RecipeAction(
      testEvent({
        httpMethod: 'GET',
        path: '/recipe/recipe-id',
        resource: '/recipe/{recipeId}',
        pathParameters: {
          recipeId: 'recipe-id',
        },
      }),
      logger as unknown as RequestLogger,
    );

    expect(action.operation).toStrictEqual('GetById');
    expect(action.recipeId).toStrictEqual('recipe-id');
    expect(action.recipeBody).toBeUndefined();
    expect(action.cognitoUserId).toStrictEqual('user-id');
  });

  it('should interpret a create-recipe request', () => {
    const action = new RecipeAction(
      testEvent({
        httpMethod: 'POST',
        path: '/recipe',
        resource: '/recipe',
        body: JSON.stringify({ title: 'recipe name' } as RecipeInput),
      }),
      logger as unknown as RequestLogger,
    );

    expect(action.operation).toStrictEqual('Add');
    expect(action.recipeId).toBeUndefined();
    expect(action.recipeBody).toStrictEqual({ title: 'recipe name' });
    expect(action.cognitoUserId).toStrictEqual('user-id');
  });

  it('should reject a malformed client recipe ID in a create-recipe request', () => {
    const action = new RecipeAction(
      testEvent({
        httpMethod: 'POST',
        path: '/recipe',
        resource: '/recipe',
        headers: { 'x-recipe-id': 'nope' },
        body: JSON.stringify({ title: 'recipe name' } as RecipeInput),
      }),
      logger as unknown as RequestLogger,
    );

    expect(action.recipeId).toBeUndefined();
    expect(logger.logWarning).toHaveBeenCalledTimes(1);
  });

  it("should accept a type 4 uuid in the x-recipe-id header for create-recipe request", () => {
    const recipeId = randomUUID();
    const action = new RecipeAction(
      testEvent({
        httpMethod: 'POST',
        path: '/recipe',
        resource: '/recipe',
        headers: { 'x-recipe-id': recipeId },
        body: JSON.stringify({ title: 'recipe name' } as RecipeInput),
      }),
      logger as unknown as RequestLogger,
    );

    expect(action.recipeId).toStrictEqual(recipeId);
  });

  it('should interpret an update-recipe request', () => {
    const action = new RecipeAction(
      testEvent({
        httpMethod: 'PUT',
        path: '/recipe/recipe-id',
        resource: '/recipe/{recipeId}',
        pathParameters: { recipeId: 'recipe-id' },
        body: JSON.stringify({ title: 'recipe name' } as RecipeInput),
      }),
      logger as unknown as RequestLogger,
    );

    expect(action.operation).toStrictEqual('Update');
    expect(action.recipeId).toStrictEqual('recipe-id');
    expect(action.recipeBody).toStrictEqual({ title: 'recipe name' });
    expect(action.cognitoUserId).toStrictEqual('user-id');
  });

  it('should interpret a delete-recipe request', () => {
    const action = new RecipeAction(
      testEvent({
        httpMethod: 'DELETE',
        path: '/recipe/recipe-id',
        resource: '/recipe/{recipeId}',
        pathParameters: { recipeId: 'recipe-id' },
      }),
      logger as unknown as RequestLogger,
    );

    expect(action.operation).toStrictEqual('Delete');
    expect(action.recipeId).toStrictEqual('recipe-id');
    expect(action.recipeBody).toBeUndefined();
    expect(action.cognitoUserId).toStrictEqual('user-id');
  });

  it('should reject a create request with no body', () => {
    expect(
      () =>
        new RecipeAction(
          testEvent({
            httpMethod: 'POST',
            path: '/recipe',
            body: undefined,
          }),
          logger as unknown as RequestLogger,
        ),
    ).toThrow(BadRequestError);
  });

  it('should reject an update request with no body', () => {
    expect(
      () =>
        new RecipeAction(
          testEvent({
            httpMethod: 'PUT',
            path: '/recipe/recipe-id',
            resource: '/recipe/{recipeId}',
            pathParameters: { recipeId: 'recipe-id' },
            body: undefined,
          }),
          logger as unknown as RequestLogger,
        ),
    ).toThrow(BadRequestError);
  });

  it('should reject an unclassifiable request', () => {
    expect(
      () =>
        new RecipeAction(
          testEvent({
            httpMethod: 'PATCH',
            path: '/recipe/recipe-id',
            resource: '/recipe/{recipeId}',
            pathParameters: { recipeId: 'recipe-id' },
            body: undefined,
          }),
          logger as unknown as RequestLogger,
        ),
    ).toThrow(BadRequestError);
  });
});
