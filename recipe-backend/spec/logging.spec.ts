import { APIGatewayProxyEvent, APIGatewayProxyEventHeaders } from 'aws-lambda';
import { RequestLogger } from '../src/logging';
import { Logger } from 'winston';

function loggingTest(logger: Logger, action: () => void): Promise<any[]> {
  return new Promise<any[]>((resolve) => {
    const events: any[] = [];

    logger.on('data', (msg) => events.push(msg));
    logger.on('finish', () => resolve(events));
    action();
    logger.end();
  });
}

describe('logging', () => {
  it('should create a request logger', () => {
    const event = {
      httpMethod: 'GET',
      path: '/recipe',
      requestContext: {
        requestId: 'request-id',
        identity: { cognitoAuthenticationProvider: 'poolId:CognitoSignIn:cognito-user-id' },
      },
      headers: {},
    } as APIGatewayProxyEvent;
    const logger = new RequestLogger(event);
    expect(logger).toBeInstanceOf(RequestLogger);
    expect(logger.logger).toBeInstanceOf(Logger);
    expect(logger.logger.level).toStrictEqual('info');
    expect(logger.logger.defaultMeta).toStrictEqual({
      cognitoUserId: 'cognito-user-id',
      requestId: 'request-id',
      routeKey: 'GET /recipe',
    });
  });

  it('should override log-level based on request header', () => {
    const event = {
      httpMethod: 'GET',
      path: '/recipe',
      requestContext: {
        requestId: 'request-id',
        identity: { cognitoAuthenticationProvider: 'poolId:CognitoSignIn:cognito-user-id' },
      },
      headers: { 'log-level': 'debug' } as APIGatewayProxyEventHeaders,
    } as APIGatewayProxyEvent;
    const logger = new RequestLogger(event);
    expect(logger.logger.level).toStrictEqual('debug');
  });

  it('should discard an invalid log level', () => {
    const event = {
      httpMethod: 'GET',
      path: '/recipe',
      requestContext: {
        requestId: 'request-id',
        identity: { cognitoAuthenticationProvider: 'poolId:CognitoSignIn:cognito-user-id' },
      },
      headers: { 'log-level': 'nope' } as APIGatewayProxyEventHeaders,
    } as APIGatewayProxyEvent;
    const logger = new RequestLogger(event);
    expect(logger.logger.level).toStrictEqual('info');
  });

  it('should log the event details', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/recipe',
      requestContext: {
        requestId: 'request-id',
        identity: { cognitoAuthenticationProvider: 'poolId:CognitoSignIn:cognito-user-id' },
      },
      headers: {},
    } as APIGatewayProxyEvent;
    const logger = new RequestLogger(event);
    const events = await loggingTest(logger.logger, () => logger.logEventDetails());
    expect(events).toHaveLength(1);

    const detailsEvent = events[0];
    expect(detailsEvent.cognitoUserId).toStrictEqual('cognito-user-id');
    expect(detailsEvent.requestId).toStrictEqual('request-id');
    expect(detailsEvent.routeKey).toStrictEqual('GET /recipe');
  });
});
