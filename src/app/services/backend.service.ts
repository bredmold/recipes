import { lastValueFrom, Observable, retry } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Recipe } from '../types/recipe';

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

  async search(): Promise<Recipe[]> {
    const url = `${this.baseUrl}/recipe`;
    const rq = this.http.get<any[]>(url, { observe: 'body' });
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
}
