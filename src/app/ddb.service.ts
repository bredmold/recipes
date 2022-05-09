import {Injectable} from '@angular/core';
import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandOutput,
  QueryCommand,
  QueryCommandOutput
} from '@aws-sdk/client-dynamodb';
import {environment} from '../environments/environment';
import {Auth} from "aws-amplify";

@Injectable({
  providedIn: 'root',
})
export class DdbService {
  constructor() {
  }

  private static getDdbClient(): DynamoDBClient {
    const credentials = Auth.Credentials.get();
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
    return DdbService.getDdbClient().send(command)
  }

  query(command: QueryCommand): Promise<QueryCommandOutput> {
    return DdbService.getDdbClient().send(command);
  }
}
