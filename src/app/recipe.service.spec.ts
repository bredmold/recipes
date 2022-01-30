import { TestBed } from '@angular/core/testing';
import {
  CreateTableCommand,
  CreateTableCommandOutput,
  ListTablesCommand,
  ListTablesCommandOutput,
  PutItemCommand,
  PutItemCommandOutput,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { DdbService } from './ddb.service';
import { RecipeService } from './recipe.service';
import { Recipe } from './types/recipe';

describe('RecipeService', () => {
  let ddbClient: any;
  let service: RecipeService;

  beforeEach(() => {
    ddbClient = jasmine.createSpyObj('DynamoDBClient', ['send']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: DdbService,
          useValue: {
            createDdbClient: () => ddbClient,
          },
        },
      ],
    });
    service = TestBed.inject(RecipeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('empty recipe list', async () => {
    const queryResponse: QueryCommandOutput = {
      Items: [],
      $metadata: {},
    };
    ddbClient.send.and.returnValue(queryResponse);

    const recipes = await service.listRecipes();
    expect(recipes).toHaveSize(0);
  });

  it('should return a single recipe', async () => {
    const recipe = {
      title: 'title',
      description: 'desc',
      steps: [],
      ingredients: [],
      id: 'id',
    };
    const queryResponse: QueryCommandOutput = {
      Items: [
        {
          json: { S: JSON.stringify(recipe) },
        },
      ],
      $metadata: {},
    };

    ddbClient.send.and.returnValue(queryResponse);

    const recipes = await service.listRecipes();
    expect(recipes).toEqual([new Recipe('title', 'desc', [], [], 'id')]);
  });

  it('should resolve the promise when calling getRecipeById', async () => {
    const recipe = {
      title: 'title',
      description: 'desc',
      steps: [],
      ingredients: [],
      id: 'id',
    };
    const queryResponse: QueryCommandOutput = {
      Items: [
        {
          json: { S: JSON.stringify(recipe) },
        },
      ],
      $metadata: {},
    };

    ddbClient.send.and.returnValue(queryResponse);

    const recipeResponse = await service.getRecipeById('id');

    expect(recipeResponse).toEqual(new Recipe('title', 'desc', [], [], 'id'));
  });

  it('should throw when getRecipeById fails', async () => {
    const queryResponse: QueryCommandOutput = {
      Items: [],
      $metadata: {},
    };

    ddbClient.send.and.returnValue(queryResponse);

    try {
      await service.getRecipeById('id');
      fail('expected exception');
    } catch (e) {
      expect(e).toEqual('Unable to locate recipe: id');
    }
  });

  it('saveRecipe should call putItem', async () => {
    const putItemResponse: PutItemCommandOutput = {
      $metadata: {},
    };

    let putItemCommand: PutItemCommand | undefined;
    ddbClient.send.and.callFake((args: PutItemCommand) => {
      putItemCommand = args;
      return Promise.resolve(putItemResponse);
    });

    const recipeToSave = new Recipe('title', 'desc', [], [], 'id');
    const recipeResponse: Recipe = await service.saveRecipe(recipeToSave);

    expect(recipeResponse).toEqual(recipeToSave);

    expect(putItemCommand?.input).toEqual(
      new PutItemCommand({
        TableName: 'recipes',
        Item: {
          ownerEmail: { S: 'bredmold@gmail.com' },
          recipeId: { S: 'id' },
          recipeTitle: { S: 'title' },
          json: { S: JSON.stringify(recipeToSave.toObject()) },
        },
      }).input
    );
  });

  it('storageSetup should do nothing if table already exists', async () => {
    const listTablesResponse: ListTablesCommandOutput = {
      TableNames: ['recipes'],
      $metadata: {},
    };

    let otherCalls = 0;
    ddbClient.send.and.callFake((args: any) => {
      if (args instanceof ListTablesCommand) {
        return listTablesResponse;
      } else {
        otherCalls += 1;
        return Promise.resolve({});
      }
    });

    await service.storageSetup();

    expect(otherCalls).toBe(0);
  });

  it('storageSetup should create the table if it is not present', async () => {
    const listTablesResponse: ListTablesCommandOutput = {
      TableNames: [],
      $metadata: {},
    };

    const createTableResponse: CreateTableCommandOutput = {
      $metadata: {},
    };

    let createTableArgs: CreateTableCommand | undefined;
    ddbClient.send.and.callFake((args: any) => {
      if (args instanceof ListTablesCommand) {
        return listTablesResponse;
      } else if (args instanceof CreateTableCommand) {
        createTableArgs = args;
        return createTableResponse;
      } else {
        return Promise.reject('Unexpected call');
      }
    });

    await service.storageSetup();

    expect(createTableArgs).toBeTruthy();
  });
});
