import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataFetchService {
  private staticData: { [key: string]: any[] } = {
    controllers: [
      { id: 1, name: 'Clavier/Souris' },
      { id: 2, name: 'Manette' },
      { id: 3, name: 'Tactile' }
    ],
    platforms: [
      { id: 1, name: 'Web' },
      { id: 2, name: 'Windows' },
      { id: 3, name: 'macOS' },
      { id: 4, name: 'Linux' },
      { id: 5, name: 'Mobile' }
    ],
    genres: [
      { id: 1, name: 'Application Web' },
      { id: 2, name: 'Portfolio' },
      { id: 3, name: 'E-commerce' },
      { id: 4, name: 'Blog' },
      { id: 5, name: 'Dashboard' },
      { id: 6, name: 'API' },
      { id: 7, name: 'Outils' }
    ],
    tags: [
      { id: 1, name: 'React' },
      { id: 2, name: 'Angular' },
      { id: 3, name: 'Vue.js' },
      { id: 4, name: 'Node.js' },
      { id: 5, name: 'TypeScript' },
      { id: 6, name: 'JavaScript' },
      { id: 7, name: 'Python' },
      { id: 8, name: 'CSS' },
      { id: 9, name: 'HTML' },
      { id: 10, name: 'MongoDB' },
      { id: 11, name: 'MySQL' },
      { id: 12, name: 'PostgreSQL' }
    ],
    statuses: [
      { id: 1, name: 'En ligne' },
      { id: 2, name: 'Maintenance' },
      { id: 3, name: 'Archivé' }
    ],
    languages: [
      { id: 1, name: 'Français' },
      { id: 2, name: 'Anglais' },
      { id: 3, name: 'Espagnol' }
    ]
  };

  constructor() { }

  async getDataFromTable(tableName: string): Promise<any[]> {
    try {
      const normalizedName = tableName.toLowerCase();
      
      if (this.staticData[normalizedName]) {
        return this.staticData[normalizedName];
      }
      
      return [];
    } catch (error: any) {
      console.error(`Erreur lors de la récupération de ${tableName}:`, error);
      return [];
    }
  }

  async getGenres(): Promise<any> {
    return this.staticData['genres'] || [];
  }

  async getTags(): Promise<any> {
    return this.staticData['tags'] || [];
  }
}
