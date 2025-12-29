// core/services/data.service.ts (ajouter les méthodes)
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SpeciesSummary,
  Species,
  CharacterClassSummary,
  CharacterClass,
  CivilizationSummary,
  Civilization,
  LanguageSummary,
  Language,
  EquipmentSummary,
  Equipment,
} from '../models/game-data.models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5068/api';

  // Species
  getSpecies(): Observable<SpeciesSummary[]> {
    return this.http.get<SpeciesSummary[]>(`${this.apiUrl}/species`);
  }

  getSpeciesById(id: string): Observable<Species> {
    return this.http.get<Species>(`${this.apiUrl}/species/${id}`);
  }

  // Classes
  getClasses(): Observable<CharacterClassSummary[]> {
    return this.http.get<CharacterClassSummary[]>(`${this.apiUrl}/classes`);
  }

  getClassById(id: string): Observable<CharacterClass> {
    return this.http.get<CharacterClass>(`${this.apiUrl}/classes/${id}`);
  }

  // Civilizations
  getCivilizations(): Observable<CivilizationSummary[]> {
    return this.http.get<CivilizationSummary[]>(`${this.apiUrl}/civilizations`);
  }

  getCivilizationById(id: string): Observable<Civilization> {
    return this.http.get<Civilization>(`${this.apiUrl}/civilizations/${id}`);
  }

  // Languages
  getLanguages(): Observable<LanguageSummary[]> {
    return this.http.get<LanguageSummary[]>(`${this.apiUrl}/languages`);
  }

  getLanguageById(id: string): Observable<Language> {
    return this.http.get<Language>(`${this.apiUrl}/languages/${id}`);
  }

  // Equipment
  getEquipment(): Observable<EquipmentSummary[]> {
    return this.http.get<EquipmentSummary[]>(`${this.apiUrl}/equipment`);
  }

  getEquipmentById(id: string): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/equipment/${id}`);
  }
}
