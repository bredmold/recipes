import { Injectable } from '@angular/core';
import {
  DeleteItemCommand,
  DeleteItemCommandOutput,
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandOutput,
  QueryCommand,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { environment } from '../../environments/environment';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class DdbService {
  constructor(private readonly sessionService: SessionService) {}

  private getDdbClient(): DynamoDBClient {
    const credentials = this.sessionService.sessionCredentials();
    if (credentials) {
      return new DynamoDBClient({
        region: environment.region,
        credentials: credentials,
      });
    } else {
      return new DynamoDBClient(environment.ddbConfig);
    }
  }

  putItem(command: PutItemCommand): Promise<PutItemCommandOutput> {
    return this.getDdbClient().send(command);
  }

  deleteItem(command: DeleteItemCommand): Promise<DeleteItemCommandOutput> {
    return this.getDdbClient().send(command);
  }

  query(command: QueryCommand): Promise<QueryCommandOutput> {
    return this.getDdbClient().send(command);
  }
}
