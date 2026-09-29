import { Portfolio } from '../../portfolios/models/portfolio';

export interface SimulationResult {
  id: string;
  portfolio: Portfolio;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  globalScore: number;
  greenInvestmentPercentage: number;
}