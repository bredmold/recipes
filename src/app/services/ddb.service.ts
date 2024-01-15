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

  private async getDdbClient(): Promise<DynamoDBClient> {
    const credentials = await this.sessionService.sessionCredentials();
    if (credentials) {
      return new DynamoDBClient({
        region: environment.region,
        credentials: credentials,
      });
    } else {
      return new DynamoDBClient(environment.ddbConfig);
    }
  }

  async putItem(command: PutItemCommand): Promise<PutItemCommandOutput> {
    const client = await this.getDdbClient();
    return client.send(command);
  }

  async deleteItem(command: DeleteItemCommand): Promise<DeleteItemCommandOutput> {
    const client = await this.getDdbClient();
    return client.send(command);
  }

  async query(command: QueryCommand): Promise<QueryCommandOutput> {
    const client = await this.getDdbClient();
    return client.send(command);
  }
}
