import { Component, input, output } from '@angular/core';
import { Portfolio } from '../../models/portfolio';

@Component({
  selector: 'app-portfolio-card',
  templateUrl: './portfolio-card.html',
  styleUrl: './portfolio-card.css',
})
export class PortfolioCard {
  readonly portfolio = input.required<Portfolio>();

   readonly viewDetails = output<string>();

  onViewDetails(): void {
    this.viewDetails.emit(this.portfolio().id);
  }
}