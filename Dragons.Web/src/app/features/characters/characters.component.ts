// features/characters/characters.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
})
export class CharactersComponent implements OnInit {
  private pdfService = inject(PdfGeneratorService);

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
        this.characters.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    } catch (error) {
      console.error('Erreur lors du chargement des personnages:', error);
      this.characters = [];
    }
  }

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
    return icons[className] || '⚔️';
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
      'Melessë (Demi-elfe)': '🧝‍♂️',
      Félys: '🐱',
      'Merosi (Demi-orc)': '👹',
    };
    return icons[speciesName] || '👤';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getHitDie(character: SavedCharacter): number {
    return character.hitPointsMax - character.abilityModifiers.constitution;
  }

  // === ACTIONS ===

  viewCharacter(character: SavedCharacter): void {
    localStorage.setItem('dragons-current-character', JSON.stringify(character));
    window.location.href = '/character-sheet';
  }

  editCharacter(character: SavedCharacter, event: Event): void {
    event.stopPropagation();
    localStorage.setItem('dragons-edit-character', JSON.stringify(character));
    window.location.href = '/create';
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

  duplicateCharacter(character: SavedCharacter, event: Event): void {
    event.stopPropagation();

    const duplicate: SavedCharacter = {
      ...character,
      id: crypto.randomUUID(),
      name: `${character.name} (copie)`,
      createdAt: new Date().toISOString(),
    };

    this.characters.unshift(duplicate);
    localStorage.setItem('dragons-characters', JSON.stringify(this.characters));
  }
}
