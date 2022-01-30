import { Injectable } from '@angular/core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DdbService {
  createDdbClient(): DynamoDBClient {
    return new DynamoDBClient(environment.ddbConfig);
  }
}
