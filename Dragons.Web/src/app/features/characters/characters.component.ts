import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Import Router
import { PdfGeneratorService } from '../character-sheet/services/pdf-generator.service';
import { Character } from '../../core/models/character.models';

interface SavedCharacter extends Character {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush, // Performance
})
export class CharactersComponent implements OnInit {
  private pdfService = inject(PdfGeneratorService);
  private router = inject(Router); // Injection du Router

  characters: SavedCharacter[] = [];
  showDeleteModal = false;
  characterToDelete: SavedCharacter | null = null;

  ngOnInit(): void {
    this.loadCharacters();
  }

  private loadCharacters(): void {
    try {
      const saved = localStorage.getItem('dragons-characters');
      if (saved) {
        this.characters = JSON.parse(saved);
        // Tri par date de mise à jour (ou création si pas d'update)
        this.characters.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt).getTime();
          return dateB - dateA; // Le plus récent en premier
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des personnages:', error);
      this.characters = [];
    }
  }

  // === UI HELPERS ===

  getClassIcon(className: string): string {
    const icons: Record<string, string> = {
      Barbare: '🪓',
      Barde: '🎵',
      Druide: '🌿',
      Ensorceleur: '✨',
      Guerrier: '⚔️',
      Lettré: '📚',
      Magicien: '🔮',
      Moine: '👊',
      Paladin: '🛡️',
      Prêtre: '✝️',
      Rôdeur: '🏹',
      Roublard: '🗡️',
      Sorcier: '👁️',
    };
    // Recherche partielle pour gérer les sous-classes éventuelles
    const key = Object.keys(icons).find((k) => className.includes(k));
    return key ? icons[key] : '⚔️';
  }

  getSpeciesIcon(speciesName: string): string {
    const icons: Record<string, string> = {
      Humain: '👤',
      Elfe: '🧝',
      Nain: '⛏️',
      Halfelin: '🍀',
      Gnome: '🔧',
      Drakéide: '🐲',
      Tieffelin: '😈',
      'Demi-elfe': '🧝‍♂️',
      'Demi-orc': '👹',
    };
    const key = Object.keys(icons).find((k) => speciesName.includes(k));
    return key ? icons[key] : '👤';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  getHitDie(character: SavedCharacter): number {
    return character.hitPointsMax - character.abilityModifiers.constitution;
  }

  // === ACTIONS ===

  viewCharacter(character: SavedCharacter): void {
    localStorage.setItem('dragons-current-character', JSON.stringify(character));
    // CORRECTION : Utiliser le Router Angular pour ne pas recharger la page
    this.router.navigate(['/character-sheet']);
  }

  editCharacter(character: SavedCharacter, event: Event): void {
    event.stopPropagation();
    localStorage.setItem('dragons-edit-character', JSON.stringify(character));
    // CORRECTION : Utiliser le Router Angular
    this.router.navigate(['/create']);
  }

  duplicateCharacter(character: SavedCharacter, event: Event): void {
    event.stopPropagation();

    const duplicate: SavedCharacter = {
      ...character,
      id: crypto.randomUUID(),
      name: `${character.name} (copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Ajout au début de la liste
    this.characters.unshift(duplicate);
    // Sauvegarde
    localStorage.setItem('dragons-characters', JSON.stringify(this.characters));
    // Recharger pour être sûr du tri (optionnel si on unshift juste)
    this.loadCharacters();
  }

  downloadPdf(character: SavedCharacter, event: Event): void {
    event.stopPropagation();
    const hitDie = this.getHitDie(character);
    this.pdfService.generatePdf(character, hitDie);
  }

  confirmDelete(character: SavedCharacter, event: Event): void {
    event.stopPropagation();
    this.characterToDelete = character;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.characterToDelete = null;
  }

  deleteCharacter(): void {
    if (!this.characterToDelete) return;

    this.characters = this.characters.filter((c) => c.id !== this.characterToDelete!.id);
    localStorage.setItem('dragons-characters', JSON.stringify(this.characters));

    this.showDeleteModal = false;
    this.characterToDelete = null;
  }
}
