import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly API_BASE_URL = (window.location.hostname === 'localhost')
    ? 'http://localhost:9091'
    : 'https://api.jamestudio.fr';

  getApiUrl(): string {
    return this.API_BASE_URL;
  }

  getEndpointUrl(endpoint: string): string {
    const baseUrl = this.API_BASE_URL.endsWith('/') 
      ? this.API_BASE_URL.slice(0, -1) 
      : this.API_BASE_URL;
    const endpointPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${endpointPath}`;
  }
}

