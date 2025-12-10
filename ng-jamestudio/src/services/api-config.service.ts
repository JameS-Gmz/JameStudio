import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  // URL de base de l'API backend
  // Pour le développement local, utilisez: 'http://localhost:9091'
  // Pour la production, remplacez par l'URL de votre backend déployé
  // Utiliser 'https://api.jamestudio.fr' en production, sinon 'http://localhost:9091' en développement
  private readonly API_BASE_URL = (window.location.hostname === 'localhost')
    ? 'http://localhost:9091'
    : 'https://api.jamestudio.fr';

  getApiUrl(): string {
    return this.API_BASE_URL;
  }

  // Méthode pour obtenir l'URL complète d'un endpoint
  getEndpointUrl(endpoint: string): string {
    const baseUrl = this.API_BASE_URL.endsWith('/') 
      ? this.API_BASE_URL.slice(0, -1) 
      : this.API_BASE_URL;
    const endpointPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${endpointPath}`;
  }
}

