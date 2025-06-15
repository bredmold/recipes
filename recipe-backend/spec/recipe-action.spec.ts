import { RecipeAction } from '../src/recipe-action';
import { APIGatewayEvent } from 'aws-lambda';
import { RecipeInput } from '../src/recipe';
import { BadRequestError } from '../src/errors';

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
  it('should interpret a search request', () => {
    const action = new RecipeAction(
      testEvent({
        httpMethod: 'GET',
        path: '/recipe',
      }),
    );

    expect(action.operation).toStrictEqual('Search');
    expect(action.recipeId).toBeUndefined();
    expect(action.recipeBody).toBeUndefined();
    expect(action.cognitoUserId).toStrictEqual('user-id');
  });

  // TODO validate the way API GW fills in path parameters
  it('should interpret a get-by-id request', () => {
    const action = new RecipeAction(
      testEvent({
        httpMethod: 'GET',
        path: '/recipe/:recipeId',
        pathParameters: {
          recipeId: 'recipe-id',
        },
      }),
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
        body: JSON.stringify({ title: 'recipe name' } as RecipeInput),
      }),
    );

    expect(action.operation).toStrictEqual('Add');
    expect(action.recipeId).toBeUndefined();
    expect(action.recipeBody).toStrictEqual({ title: 'recipe name' });
    expect(action.cognitoUserId).toStrictEqual('user-id');
  });

  it('should interpret an update-recipe request', () => {
    const action = new RecipeAction(
      testEvent({
        httpMethod: 'PUT',
        path: '/recipe/:recipeId',
        pathParameters: { recipeId: 'recipe-id' },
        body: JSON.stringify({ title: 'recipe name' } as RecipeInput),
      }),
    );

    expect(action.operation).toStrictEqual('Update');
    expect(action.recipeId).toStrictEqual('recipe-id');
    expect(action.recipeBody).toStrictEqual({ title: 'recipe name' });
    expect(action.cognitoUserId).toStrictEqual('user-id');
  });

  it("should interpret a delete-recipe request", () => {
    const action = new RecipeAction(
      testEvent({
        httpMethod: 'DELETE',
        path: '/recipe/:recipeId',
        pathParameters: { recipeId: 'recipe-id' },
      }),
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
        ),
    ).toThrow(BadRequestError);
  });

  it('should reject an update request with no body', () => {
    expect(
      () =>
        new RecipeAction(
          testEvent({
            httpMethod: 'PUT',
            path: '/recipe/:recipeId',
            pathParameters: { recipeId: 'recipe-id' },
            body: undefined,
          }),
        ),
    ).toThrow(BadRequestError);
  });
});
