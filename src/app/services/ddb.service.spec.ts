import { TestBed } from '@angular/core/testing';

import { DdbService } from './ddb.service';
import { SessionService } from './session.service';
import { mockClient } from 'aws-sdk-client-mock';
import { DeleteItemCommand, DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { CognitoIdentityCredentials } from '@aws-sdk/credential-provider-cognito-identity';

describe('DdbService', () => {
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let service: DdbService;
  const mockDdb = mockClient(DynamoDBClient);

  beforeEach(() => {
    mockSessionService = jasmine.createSpyObj('SessionService', ['sessionCredentials']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
      ],
    });
    mockDdb.reset();
    service = TestBed.inject(DdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call putItem', async () => {
    mockSessionService.sessionCredentials.and.resolveTo({} as CognitoIdentityCredentials);
    mockDdb.on(PutItemCommand).resolves({});
    const response = service.putItem(new PutItemCommand({ Item: {}, TableName: 'test' }));
    expect(response).toBeDefined();
  });

  it('should call deleteItem', async () => {
    mockSessionService.sessionCredentials.and.resolveTo(undefined);
    mockDdb.on(DeleteItemCommand).resolves({});
    const response = service.deleteItem(new DeleteItemCommand({ Key: {}, TableName: 'test' }));
    expect(response).toBeDefined();
  });

  it('should call query', async () => {
    mockSessionService.sessionCredentials.and.resolveTo({} as CognitoIdentityCredentials);
    mockDdb.on(QueryCommand).resolves({});
    const response = service.query(new QueryCommand({ TableName: 'test' }));
    expect(response).toBeDefined();
  });
});
