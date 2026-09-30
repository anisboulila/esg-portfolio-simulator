import { Component, input, output } from '@angular/core';
import { Portfolio } from '../../models/portfolio';

@Component({
  selector: 'app-portfolio-card',
  templateUrl: './portfolio-card.html',
  styleUrl: './portfolio-card.css',
})
export class PortfolioCard {
  // La liste fournit le Portfolio par input requis : la carte reçoit ainsi sa donnée
  // déclarativement, sans que le parent ait besoin d'interroger son instance avec viewChild().
  readonly portfolio = input.required<Portfolio>();

  // L'enfant expose seulement l'intention et l'ID; le parent garde la décision de navigation.
  // Cet output évite un accès impératif du parent à l'instance de la carte.
   readonly viewDetails = output<string>();

  onViewDetails(): void {
    this.viewDetails.emit(this.portfolio().id);
  }
}