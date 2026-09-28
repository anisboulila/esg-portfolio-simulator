import { Portfolio } from '../models/portfolio';

export const PORTFOLIOS: readonly Portfolio[] = [
  {
    id: 'p1',
    name: 'Portfolio Europe',
    description: 'Diversified investments across European markets.',
    assetCount: 24,
    currentValue: 1250000,
  },
  {
    id: 'p2',
    name: 'Portfolio Green',
    description: 'Investments focused on renewable energy and sustainability.',
    assetCount: 18,
    currentValue: 875000,
  },
  {
    id: 'p3',
    name: 'Portfolio Sustainable',
    description: 'Long-term investments screened for ESG performance.',
    assetCount: 31,
    currentValue: 1630000,
  },
];