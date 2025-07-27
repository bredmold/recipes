import { APIGatewayProxyEvent } from 'aws-lambda';

/**
 * Retrieve a header value from the API GW event. If there are multiple header values, retrieve the first.
 */
export function getEventHeader(event: APIGatewayProxyEvent, header: string): string | undefined {
  const lcHeader = header.toLowerCase();

  const headers = event.headers || {};
  const actualHeaderName = Object.keys(headers).find((k) => k.toLowerCase() === lcHeader);
  if (actualHeaderName && headers[actualHeaderName]) return headers[actualHeaderName];

  const multiValueHeaders = event.multiValueHeaders || {};
  const actualMultiValueHeaderName = Object.keys(multiValueHeaders).find((k) => k.toLowerCase() === lcHeader);
  if (
    actualMultiValueHeaderName &&
    multiValueHeaders[actualMultiValueHeaderName] &&
    multiValueHeaders[actualMultiValueHeaderName].length > 0
  ) {
    return multiValueHeaders[actualMultiValueHeaderName][0];
  }

  return undefined;
}

export function getQueryParam(event: APIGatewayProxyEvent, name: string): string | undefined {
  if (
    event.queryStringParameters &&
    event.queryStringParameters.hasOwnProperty(name) &&
    typeof event.queryStringParameters[name] === 'string'
  ) {
    return event.queryStringParameters[name];
  } else if (
    event.multiValueQueryStringParameters &&
    event.multiValueQueryStringParameters.hasOwnProperty(name) &&
    event.multiValueQueryStringParameters.hasOwnProperty(name) &&
    Array.isArray(event.multiValueQueryStringParameters[name]) &&
    event.multiValueQueryStringParameters[name].length > 0
  ) {
    return event.multiValueQueryStringParameters[name][0];
  } else {
    return undefined;
  }
}

export function extractCognitoUserId(event: APIGatewayProxyEvent): string {
  const authProvider = event.requestContext.identity.cognitoAuthenticationProvider!;
  const authProviderParts = authProvider.split(':');
  return authProviderParts[2];
}
