import winston, { Logger } from 'winston';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { extractCognitoUserId, getEventHeader } from './utils';

const VALID_LOG_LEVELS = ['debug', 'info', 'warn', 'error'];
const SENSITIVE_HEADERS = ['authorization', 'x-amz-security-token'];

/**
 * Validate the log level... if it's invalid, discard it
 */
function validateLogLevel(logLevel: string | undefined): string | undefined {
  if (logLevel) {
    const lcLogLevel = logLevel.toLowerCase();
    if (!VALID_LOG_LEVELS.includes(lcLogLevel)) return undefined;
  }
  return logLevel;
}

function sanitize(key: string, value: string): string {
  const lcKey = key.toLowerCase();
  return SENSITIVE_HEADERS.includes(lcKey) ? 'OMITTED' : value;
}

export class RequestLogger {
  public readonly logger: Logger;

  constructor(private readonly event: APIGatewayProxyEvent) {
    const routeKey = `${this.event.httpMethod} ${this.event.path}`;

    const logLevel = validateLogLevel(getEventHeader(event, 'log-level')) || process.env['LOG_LEVEL'] || 'info';
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.json(),
      defaultMeta: {
        cognitoUserId: extractCognitoUserId(event),
        requestId: event.requestContext.requestId,
        routeKey: routeKey,
      },
      transports: [new winston.transports.Console()],
      exitOnError: false,
    });
  }

  logEventDetails() {
    const eventPathParams = this.event.pathParameters || {};
    const pathParams = Object.entries(eventPathParams).reduce(
      (params, [key, value]) => {
        if (value) params[key] = value;
        return params;
      },
      {} as Record<string, string>,
    );

    const headers = Object.entries(this.event.headers).reduce(
      (headers, [key, value]) => {
        if (value) headers[key] = sanitize(key, value);
        return headers;
      },
      {} as Record<string, string>,
    );

    this.logger.info({ pathParams, headers, body: this.event.body });
  }

  logStructuredError(e: Error) {
    this.logger.error(e);
  }

  logOtherError(e: any) {
    this.logger.error({
      name: 'Unknown error',
      error: e,
    });
  }
}
