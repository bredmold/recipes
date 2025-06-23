import { lastValueFrom } from 'rxjs';
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

  async search(): Promise<Recipe[]> {
    const url = `${this.baseUrl}/recipe`;
    const body = await lastValueFrom(this.http.get<any[]>(url, { observe: 'body' }));
    return body.map((r) => Recipe.fromObject(r));
  }

  async getById(recipeId: string): Promise<Recipe> {
    const url = `${this.baseUrl}/recipe/${recipeId}`;
    try {
      const body = await lastValueFrom(this.http.get<any>(url, { observe: 'body' }));
      return Recipe.fromObject(body);
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) {
        throw `Unable to locate recipe ${recipeId}`;
      } else throw e;
    }
  }
}
