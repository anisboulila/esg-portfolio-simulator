export interface SimulationRequest {
  portfolioId: string;
  carbonEmission: number;
  greenInvestmentPercentage: number;
  socialScore: number;
  governanceScore: number;
}