import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-portfolio-detail',
  imports: [RouterLink],
  templateUrl: './portfolio-detail.html',
  styleUrl: './portfolio-detail.css',
})
export class PortfolioDetail {
  // Angular injects the current route so this page can react to its :id parameter.
  private readonly route = inject(ActivatedRoute);
  // The same DI-managed service used by the list resolves the requested portfolio.
  private readonly portfolioService = inject(PortfolioService);

  private readonly portfolioId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  protected readonly portfolio = computed(() =>
    this.portfolioService.getPortfolioById(this.portfolioId() ?? ''),
  );
}