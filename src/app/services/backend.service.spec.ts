import { TestBed } from '@angular/core/testing';

import { BackendService } from './backend.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Recipe } from '../types/recipe';

describe('BackendService', () => {
  let service: BackendService;
  let httpTesting: HttpTestingController;

  const backendUrl = environment.backendUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BackendService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('search', () => {
    it('should return an empty recipe list', async () => {
      const searchPromise = service.search();

      const rq = httpTesting.expectOne(`${backendUrl}/recipe`, 'List recipes request');
      expect(rq.request.method).toBe('GET');
      rq.flush([]);

      const response = await searchPromise;
      expect(response).toEqual([]);
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

      const searchPromise = service.search();

      const rq = httpTesting.expectOne(`${backendUrl}/recipe`, 'List recipes request');
      expect(rq.request.method).toBe('GET');
      rq.flush([recipe]);

      const response = await searchPromise;
      expect(response).toHaveSize(1);
      expect(response[0]).toBeInstanceOf(Recipe);
    });
  });

  describe('getById', () => {
    it('should return a recipe by id', async () => {
      const recipe = {
        title: 'title',
        description: 'desc',
        steps: [],
        ingredients: [],
        customUnits: [],
        id: 'id',
        version: '2',
      };

      const getByIdPromise = service.getById('recipe-id');

      const rq = httpTesting.expectOne(`${backendUrl}/recipe/recipe-id`, 'List recipes request');
      expect(rq.request.method).toBe('GET');
      rq.flush(recipe);

      const response = await getByIdPromise;
      expect(response).toBeInstanceOf(Recipe);
    });

    it('should throw in response to a 404', async () => {
      const recipe = {
        title: 'title',
        description: 'desc',
        steps: [],
        ingredients: [],
        customUnits: [],
        id: 'id',
        version: '2',
      };

      const getByIdPromise = service.getById('recipe-id');

      const rq = httpTesting.expectOne(`${backendUrl}/recipe/recipe-id`, 'List recipes request');
      expect(rq.request.method).toBe('GET');
      rq.flush({ name: 'NOT_FOUND', message: 'Recipe recipe-id not found' }, { status: 404, statusText: 'Not Found' });

      await expectAsync(getByIdPromise).toBeRejectedWith('Unable to locate recipe recipe-id');
    });
  });
});
