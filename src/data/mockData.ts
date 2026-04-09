export interface Fund {
  id: string;
  name: string;
  category: string;
  cagr: number;
  risk: "High" | "Moderate" | "Low";
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  nav: number;
  expenseRatio: number;
}

export const highRiskFunds: Fund[] = [
  { id: "h1", name: "Axis Small Cap Fund", category: "Small Cap", cagr: 22.4, risk: "High", volatility: 24.1, sharpeRatio: 1.42, maxDrawdown: -32.5, nav: 78.32, expenseRatio: 0.52 },
  { id: "h2", name: "SBI Contra Fund", category: "Contra", cagr: 19.8, risk: "High", volatility: 21.3, sharpeRatio: 1.28, maxDrawdown: -28.7, nav: 245.67, expenseRatio: 0.68 },
  { id: "h3", name: "Nippon India Small Cap", category: "Small Cap", cagr: 25.1, risk: "High", volatility: 26.8, sharpeRatio: 1.51, maxDrawdown: -35.2, nav: 132.45, expenseRatio: 0.78 },
  { id: "h4", name: "HDFC Mid-Cap Opportunities", category: "Mid Cap", cagr: 18.6, risk: "High", volatility: 20.5, sharpeRatio: 1.18, maxDrawdown: -26.3, nav: 312.89, expenseRatio: 0.81 },
  { id: "h5", name: "Kotak Emerging Equity", category: "Mid Cap", cagr: 20.3, risk: "High", volatility: 22.7, sharpeRatio: 1.35, maxDrawdown: -29.1, nav: 89.56, expenseRatio: 0.49 },
];

export const lowRiskFunds: Fund[] = [
  { id: "l1", name: "HDFC Balanced Advantage", category: "Balanced", cagr: 12.8, risk: "Low", volatility: 10.2, sharpeRatio: 1.52, maxDrawdown: -12.4, nav: 345.12, expenseRatio: 0.82 },
  { id: "l2", name: "ICICI Pru Equity & Debt", category: "Hybrid", cagr: 14.2, risk: "Low", volatility: 11.5, sharpeRatio: 1.61, maxDrawdown: -14.8, nav: 267.34, expenseRatio: 0.98 },
  { id: "l3", name: "SBI Conservative Hybrid", category: "Hybrid", cagr: 9.6, risk: "Low", volatility: 6.8, sharpeRatio: 1.72, maxDrawdown: -8.2, nav: 56.78, expenseRatio: 0.72 },
  { id: "l4", name: "Axis Banking & PSU Debt", category: "Debt", cagr: 7.8, risk: "Low", volatility: 3.2, sharpeRatio: 2.15, maxDrawdown: -3.5, nav: 2234.56, expenseRatio: 0.32 },
  { id: "l5", name: "Parag Parikh Flexi Cap", category: "Flexi Cap", cagr: 16.4, risk: "Low", volatility: 13.1, sharpeRatio: 1.48, maxDrawdown: -16.7, nav: 62.89, expenseRatio: 0.63 },
];

export const allFunds: Fund[] = [...highRiskFunds, ...lowRiskFunds];

export const marketMood: "Bullish" | "Neutral" | "Bearish" = "Bullish";

export function getRecommendations(riskScore: number): Fund[] {
  // REPLACE THIS WITH ACTUAL PIPELINE LOGIC
  if (riskScore >= 70) return highRiskFunds;
  if (riskScore >= 40) return [...highRiskFunds.slice(0, 2), ...lowRiskFunds.slice(0, 3)];
  return lowRiskFunds;
}

export function calculatePortfolioMetrics(funds: Fund[], weights: number[]) {
  // REPLACE THIS WITH ACTUAL PIPELINE LOGIC
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

export function generateGrowthData(portfolioReturn: number, years: number = 10, sipAmount: number = 10000) {
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
