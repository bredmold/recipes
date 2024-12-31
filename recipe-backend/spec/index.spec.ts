import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../src';

const event = {
  httpMethod: 'GET',
  path: '/test/path',
  headers: {},
  body: null,
} as APIGatewayEvent;

describe('Recipe backend handler', () => {
  it('should return an OK response', async () => {
    const response = await handler(event, {} as Context, () => {});
    expect(response).toEqual({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'OK', message: 'Success' }),
    });
  });
});
