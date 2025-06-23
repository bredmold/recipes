import { TestBed } from '@angular/core/testing';
import {
  DeleteItemCommandOutput,
  PutItemCommand,
  PutItemCommandOutput,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { DdbService } from './ddb.service';
import { RecipeService } from './recipe.service';
import { Recipe } from '../types/recipe';
import { SessionService } from './session.service';
import { CacheService, TypedCache } from './cache.service';
import { BackendService } from './backend.service';

describe('RecipeService', () => {
  let backendService: jasmine.SpyObj<BackendService>;
  let ddbService: jasmine.SpyObj<DdbService>;
  let sessionService: jasmine.SpyObj<SessionService>;
  let service: RecipeService;
  let recipeCache: jasmine.SpyObj<TypedCache<Recipe>>;

  beforeEach(() => {
    ddbService = jasmine.createSpyObj<DdbService>('DdbService', ['query', 'putItem', 'deleteItem']);
    sessionService = jasmine.createSpyObj<SessionService>('SessionService', ['loggedInEmail']);
    recipeCache = jasmine.createSpyObj<TypedCache<Recipe>>('TypedCache', ['makeCachedCall', 'invalidate']);
    backendService = jasmine.createSpyObj<BackendService>('BackendService', ['search', 'getById']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: BackendService,
          useValue: backendService,
        },
        {
          provide: DdbService,
          useValue: ddbService,
        },
        {
          provide: SessionService,
          useValue: sessionService,
        },
        {
          provide: CacheService,
          useValue: {
            createTypedCache: () => recipeCache,
          },
        },
      ],
    });
    service = TestBed.inject(RecipeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listRecipes', () => {
    it('empty recipe list', async () => {
      backendService.search.and.returnValue(Promise.resolve([]));

      const recipes = await service.listRecipes();
      expect(recipes).toHaveSize(0);
    });

    it('should return a single recipe', async () => {
      const recipe = {
        title: 'title',
        description: 'desc',
        steps: [],
        ingredients: [],
        customUnits: [],
        id: 'id',
        version: '2',
      };

      backendService.search.and.returnValue(Promise.resolve([Recipe.fromObject(recipe)]));

      const recipes = await service.listRecipes();
      expect(recipes).toEqual([new Recipe('title', 'desc', [], [], [], 'id', true)]);
    });
  });

  describe('isDuplicateTitle', () => {
    it('title matches, id matches', async () => {
      sessionService.loggedInEmail.and.returnValue('user@example.com');
      const queryResponse: QueryCommandOutput = {
        Items: [
          {
            recipeId: { S: 'recipe-id' },
          },
        ],
        Count: 1,
        $metadata: {},
      };

      ddbService.query.and.returnValue(Promise.resolve(queryResponse));

      const isDuplicate = await service.isDuplicateTitle('recipe-id', 'title');
      expect(isDuplicate).toBeFalse();
    });

    it('title matches, id mismatch', async () => {
      sessionService.loggedInEmail.and.returnValue('user@example.com');
      const queryResponse: QueryCommandOutput = {
        Items: [
          {
            recipeId: { S: 'other-recipe-id' },
          },
        ],
        Count: 1,
        $metadata: {},
      };

      ddbService.query.and.returnValue(Promise.resolve(queryResponse));

      const isDuplicate = await service.isDuplicateTitle('recipe-id', 'title');
      expect(isDuplicate).toBeTrue();
    });

    it('title mismatch', async () => {
      sessionService.loggedInEmail.and.returnValue('user@example.com');
      const queryResponse: QueryCommandOutput = {
        Items: [],
        Count: 0,
        $metadata: {},
      };

      ddbService.query.and.returnValue(Promise.resolve(queryResponse));

      const hasRecipe = await service.isDuplicateTitle('recipe-id', 'title');
      expect(hasRecipe).toBeFalse();
    });
  });

  it('should delete a recipe', async () => {
    sessionService.loggedInEmail.and.returnValue('user@example.com');

    ddbService.deleteItem.and.returnValue(Promise.resolve({} as DeleteItemCommandOutput));

    await service.deleteRecipeById('id');

    const deleteParams = ddbService.deleteItem.calls.first();
    expect(deleteParams.args[0].input).toEqual({
      TableName: 'recipes',
      Key: {
        ownerEmail: { S: 'user@example.com' },
        recipeId: { S: 'id' },
      },
    });
  });

  describe('getRecipeById', () => {
    it('should resolve the promise', async () => {
      const recipe = {
        title: 'title',
        description: 'desc',
        steps: [],
        ingredients: [],
        customUnits: [],
        id: 'id',
        version: '2',
      };

      recipeCache.makeCachedCall.and.callFake((fn) => fn());
      backendService.getById.and.returnValue(Promise.resolve(Recipe.fromObject(recipe)));

      const recipeResponse = await service.getRecipeById('id');

      expect(recipeResponse).toEqual(new Recipe('title', 'desc', [], [], [], 'id', true));
    });
  });

  describe('invalidateEditRecipe', () => {
    it('should invalidate the edit recipe', async () => {
      const recipe = new Recipe('test', 'test', [], [], []);
      service.editRecipe.next(recipe);

      service.invalidateEditRecipe();
      expect(recipeCache.invalidate).toHaveBeenCalledOnceWith(recipe.id);
    });

    it('should do nothing if no edit recipe', () => {
      service.invalidateEditRecipe();
      expect(recipeCache.invalidate).toHaveBeenCalledTimes(0);
    });
  });

  it('saveRecipe should call putItem', async () => {
    sessionService.loggedInEmail.and.returnValue('user@example.com');
    const putItemResponse: PutItemCommandOutput = {
      $metadata: {},
    };

    let putItemCommand: PutItemCommand | undefined;
    ddbService.putItem.and.callFake((args: PutItemCommand) => {
      putItemCommand = args;
      return Promise.resolve(putItemResponse);
    });

    const recipeToSave = new Recipe('title', 'desc', [], [], [], 'id');
    const recipeResponse: Recipe = await service.saveRecipe(recipeToSave);

    expect(recipeResponse).toEqual(recipeToSave);

    expect(putItemCommand?.input).toEqual(
      new PutItemCommand({
        TableName: 'recipes',
        Item: {
          ownerEmail: { S: 'user@example.com' },
          recipeId: { S: 'id' },
          recipeTitle: { S: 'title' },
          json: { S: JSON.stringify(recipeToSave.toObject()) },
        },
      }).input,
    );
  });

  it('should set the view recipe', () => {
    sessionService.loggedInEmail.and.returnValue('user@example.com');
    expect(service.viewRecipe.getValue()).toBeUndefined();
    expect(service.editRecipe.getValue()).toBeUndefined();

    const recipe = new Recipe('view', 'desc', [], [], []);
    service.setViewRecipe(recipe);

    expect(service.viewRecipe.getValue()).toEqual(recipe);
    expect(service.editRecipe.getValue()).toBeUndefined();

    service.clearActiveRecipes();
    expect(service.viewRecipe.getValue()).toBeUndefined();
    expect(service.editRecipe.getValue()).toBeUndefined();
  });

  it('should set the edit recipe', () => {
    sessionService.loggedInEmail.and.returnValue('user@example.com');
    expect(service.viewRecipe.getValue()).toBeUndefined();
    expect(service.editRecipe.getValue()).toBeUndefined();

    const recipe = new Recipe('edit', 'desc', [], [], []);
    service.setEditRecipe(recipe);

    expect(service.viewRecipe.getValue()).toBeUndefined();
    expect(service.editRecipe.getValue()).toEqual(recipe);

    service.clearActiveRecipes();
    expect(service.viewRecipe.getValue()).toBeUndefined();
    expect(service.editRecipe.getValue()).toBeUndefined();
  });
});
