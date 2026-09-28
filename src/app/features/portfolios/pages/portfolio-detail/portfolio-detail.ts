import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PORTFOLIOS } from '../../data/portfolios';

@Component({
  selector: 'app-portfolio-detail',
  imports: [RouterLink],
  templateUrl: './portfolio-detail.html',
  styleUrl: './portfolio-detail.css',
})
export class PortfolioDetail {
  private readonly route = inject(ActivatedRoute);

  private readonly portfolioId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  protected readonly portfolio = computed(() =>
    PORTFOLIOS.find(({ id }) => id === this.portfolioId()),
  );
}