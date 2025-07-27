import { APIGatewayEvent } from 'aws-lambda';
import { getEventHeader, getQueryParam } from '../src/utils';

describe('utils', () => {
  describe('getEventHeader', () => {
    function makeEvent(headers: Record<string, string>, multiHeaders?: Record<string, string[]>): APIGatewayEvent {
      return { headers: headers, multiValueHeaders: multiHeaders } as APIGatewayEvent;
    }

    it('should return a single-valued header', () => {
      const event = makeEvent({ p: 'v' });
      expect(getEventHeader(event, 'p')).toStrictEqual('v');
    });

    it('should return a single-valued header with case folding in the name', () => {
      const event = makeEvent({ p: 'v' });
      expect(getEventHeader(event, 'P')).toStrictEqual('v');
    });

    it('should return a multi-valued header', () => {
      const event = makeEvent({}, { p: ['v1', 'v2'] });
      expect(getEventHeader(event, 'p')).toStrictEqual('v1');
    });

    it('should return a multi-valued with case-insensitive name matching', () => {
      const event = makeEvent({}, { P: ['v1', 'v2'] });
      expect(getEventHeader(event, 'p')).toStrictEqual('v1');
    });

    it('should return undefined for an unknown header', () => {
      const event = makeEvent({ p: 'v' });
      expect(getEventHeader(event, 'c')).toBeUndefined();
    });
  });

  describe('getQueryParam', () => {
    function makeEvent(params: Record<string, string>, multiParams?: Record<string, string[]>): APIGatewayEvent {
      return { queryStringParameters: params, multiValueQueryStringParameters: multiParams } as APIGatewayEvent;
    }

    it('should return a single-valued param', () => {
      const event = makeEvent({ p: 'v' });
      expect(getQueryParam(event, 'p')).toStrictEqual('v');
    });

    it('should return the first multi-valued param', () => {
      const event = makeEvent({}, { p: ['v1', 'v2'] });
      expect(getQueryParam(event, 'p')).toStrictEqual('v1');
    });

    it('should return undefined for a missing param', () => {
      const event = makeEvent({ p: 'v' });
      expect(getQueryParam(event, 'c')).toBeUndefined();
    });
  });
});
