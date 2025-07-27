import { lastValueFrom, Observable, retry } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Recipe } from '../types/recipe';

export class RecipeConflictError extends Error {
  override name = 'RecipeConflictError';

  constructor(msg: string) {
    super(msg);
  }
}

export interface RecipeSearchCriteria {
  title?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private readonly baseUrl: string;

  constructor(private readonly http: HttpClient) {
    this.baseUrl = environment.backendUrl;
  }

  /**
   * Retry 5XX errors up to three times
   */
  private async retryRequest<T>(rq: Observable<T>): Promise<T> {
    const withRetries = rq.pipe(
      retry({
        count: 3,
        delay: (error) => {
          if (error instanceof HttpErrorResponse) {
            const status = error.status;
            if (status >= 500 && status <= 599) return Promise.resolve();
          }
          return Promise.reject(error);
        },
      }),
    );
    return lastValueFrom(withRetries);
  }

  private buildQueryParams(criteria: RecipeSearchCriteria): Record<string, string> {
    let query: Record<string, string> = {};

    if (criteria.title) query['title'] = criteria.title;

    return query;
  }

  async search(criteria: RecipeSearchCriteria): Promise<Recipe[]> {
    const queryParams = this.buildQueryParams(criteria);
    const url = `${this.baseUrl}/recipe`;
    const rq = this.http.get<any[]>(url, { observe: 'body', params: queryParams });
    const body = await this.retryRequest(rq);
    return body.map((r) => Recipe.fromObject(r));
  }

  async getById(recipeId: string): Promise<Recipe> {
    const url = `${this.baseUrl}/recipe/${recipeId}`;
    try {
      const rq = this.http.get<any>(url, { observe: 'body' });
      const body = await this.retryRequest(rq);
      return Recipe.fromObject(body);
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) {
        throw `Unable to locate recipe ${recipeId}`;
      } else throw e;
    }
  }

  async addRecipe(recipe: Recipe): Promise<Recipe> {
    const url = `${this.baseUrl}/recipe`;
    const rqBody = recipe.toObject();
    const rq = this.http.post<any>(url, rqBody, {
      observe: 'body',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'x-recipe-id': recipe.id },
    });
    try {
      const rsBody = await this.retryRequest(rq);
      return Recipe.fromObject(rsBody);
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 409) {
        const message = e.error.message;
        throw new RecipeConflictError(message);
      } else throw e;
    }
  }
}
