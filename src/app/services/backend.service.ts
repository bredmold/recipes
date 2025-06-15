import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
