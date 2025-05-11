import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private readonly baseUrl: string;

  constructor(private readonly http: HttpClient) {
    this.baseUrl = environment.backendUrl;
  }

  async ping(): Promise<boolean> {
    const url = `${this.baseUrl}/recipe`;
    const response = await lastValueFrom(this.http.get(url, { observe: 'response' }));
    return response.status === 200;
  }
}
