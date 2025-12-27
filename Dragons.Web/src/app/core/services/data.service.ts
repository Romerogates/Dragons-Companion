// services/data.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Language,
  LanguageSummary,
  Civilization,
  CivilizationSummary,
  Species,
  SpeciesSummary,
  CharacterClass,
  CharacterClassSummary,
} from '../models/data.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5068/api';

  // Languages
  getLanguages(): Observable<LanguageSummary[]> {
    return this.http.get<LanguageSummary[]>(`${this.apiUrl}/languages`);
  }

  getLanguageById(id: string): Observable<Language> {
    return this.http.get<Language>(`${this.apiUrl}/languages/${id}`);
  }

  // Civilizations
  getCivilizations(): Observable<CivilizationSummary[]> {
    return this.http.get<CivilizationSummary[]>(`${this.apiUrl}/civilizations`);
  }

  getCivilizationById(id: string): Observable<Civilization> {
    return this.http.get<Civilization>(`${this.apiUrl}/civilizations/${id}`);
  }

  // Species
  getSpecies(): Observable<SpeciesSummary[]> {
    return this.http.get<SpeciesSummary[]>(`${this.apiUrl}/species`);
  }

  getSpeciesById(id: string): Observable<Species> {
    return this.http.get<Species>(`${this.apiUrl}/species/${id}`);
  }

  // Character Classes
  getClasses(): Observable<CharacterClassSummary[]> {
    return this.http.get<CharacterClassSummary[]>(`${this.apiUrl}/classes`);
  }

  getClassById(id: string): Observable<CharacterClass> {
    return this.http.get<CharacterClass>(`${this.apiUrl}/classes/${id}`);
  }
}
