import { Fund } from "@/types/fund";

export function calculatePortfolioMetrics(funds: Fund[], weights: number[]) {
  if (funds.length === 0 || weights.length === 0) {
    return { portfolioReturn: 0, volatility: 0, sharpeRatio: 0, maxDrawdown: 0 };
  }
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const normalizedWeights = weights.map(w => w / (totalWeight || 1));

  const portfolioReturn = funds.reduce((sum, f, i) => sum + f.cagr * normalizedWeights[i], 0);
  const volatility = Math.sqrt(funds.reduce((sum, f, i) => sum + Math.pow(f.volatility * normalizedWeights[i], 2), 0));
  const sharpeRatio = volatility > 0 ? (portfolioReturn - 6) / volatility : 0;
  const maxDrawdown = funds.reduce((sum, f, i) => sum + f.maxDrawdown * normalizedWeights[i], 0);

  return {
    portfolioReturn: Math.round(portfolioReturn * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
  };
}

export function generateGrowthData(portfolioReturn: number, years = 10, sipAmount = 10000) {
  const data = [];
  let invested = 0;
  let value = 0;
  const monthlyRate = portfolioReturn / 100 / 12;
  for (let month = 0; month <= years * 12; month++) {
    invested += sipAmount;
    value = (value + sipAmount) * (1 + monthlyRate);
    if (month % 12 === 0) {
      data.push({
        year: `Y${month / 12}`,
        invested: Math.round(invested),
        value: Math.round(value),
      });
    }
  }
  return data;
}

