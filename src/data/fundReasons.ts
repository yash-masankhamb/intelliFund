// AI-generated explanations for fund recommendations
// REPLACE THIS WITH ACTUAL AI PIPELINE LOGIC

export const fundReasons: Record<string, string> = {
  h1: "Strong small-cap alpha generation with consistent outperformance over benchmark. Ideal for aggressive growth seekers with long horizons.",
  h2: "Contra strategy captures undervalued opportunities. High conviction picks have delivered superior risk-adjusted returns.",
  h3: "Top-performing small-cap fund with exceptional stock selection. Higher volatility compensated by outstanding CAGR.",
  h4: "Mid-cap sweet spot — captures growth phase companies. Diversified sector allocation reduces concentration risk.",
  h5: "Emerging equity focus with proven track record. Lower expense ratio maximizes your net returns.",
  l1: "Balanced advantage strategy auto-adjusts equity/debt allocation based on market valuations. Great for stability seekers.",
  l2: "Hybrid fund with optimal equity-debt mix. Provides equity upside with debt cushion during downturns.",
  l3: "Conservative hybrid minimizes downside risk. Ideal for short-term goals with capital preservation priority.",
  l4: "Banking & PSU debt fund offers near-zero credit risk. Perfect for parking emergency funds with decent returns.",
  l5: "Flexi cap with global diversification. Parag Parikh's contrarian approach delivers consistent long-term wealth creation.",
};

export function getStrategyForRisk(riskScore: number) {
  if (riskScore >= 70) {
    return {
      type: "High-Growth Equity",
      label: "Aggressive",
      description: "Based on your profile, we recommend a high-growth equity-focused strategy. Your long investment horizon and high risk tolerance allow us to maximize returns through small & mid-cap exposure.",
      expectedReturn: "18-25%",
      riskLevel: "High",
    };
  }
  if (riskScore >= 40) {
    return {
      type: "Balanced Growth",
      label: "Moderate",
      description: "We recommend a balanced growth strategy combining equity upside with debt stability. This optimizes your risk-adjusted returns while maintaining a safety cushion.",
      expectedReturn: "12-18%",
      riskLevel: "Moderate",
    };
  }
  return {
    type: "Capital Preservation",
    label: "Conservative",
    description: "Your profile suggests a conservative approach focused on capital preservation with steady growth. We prioritize low-volatility funds with strong downside protection.",
    expectedReturn: "8-12%",
    riskLevel: "Low",
  };
}

export function getInsights(riskScore: number) {
  const insights = [
    {
      title: "Why these funds?",
      description: riskScore >= 70
        ? "Our AI selected funds with the highest risk-adjusted returns in their categories. Each fund has consistently outperformed its benchmark over 3, 5, and 10-year periods."
        : riskScore >= 40
        ? "We balanced high-growth equity funds with stable hybrid options. This mix targets optimal Sharpe ratios while keeping volatility within your comfort zone."
        : "Selected funds prioritize capital safety with low maximum drawdown. Each fund has demonstrated resilience during market corrections.",
      accent: "primary" as const,
    },
    {
      title: "Risk Analysis",
      description: riskScore >= 70
        ? "Higher volatility is expected (20-27%), but historical data shows these funds recover strongly from corrections. Average recovery time: 8-14 months."
        : riskScore >= 40
        ? "Portfolio volatility is managed at 12-18%. The hybrid allocation acts as a natural hedge during market downturns."
        : "Maximum portfolio drawdown is limited to 8-15%. Debt components provide stability even in severe market corrections.",
      accent: "warning" as const,
    },
    {
      title: "Diversification Benefit",
      description: "Your recommended portfolio spans multiple market caps, sectors, and asset classes. Correlation analysis shows optimal diversification reducing unsystematic risk by ~40%.",
      accent: "secondary" as const,
    },
    {
      title: "Expected Performance",
      description: riskScore >= 70
        ? "Based on 10-year backtesting, this strategy would have turned ₹10,000/month SIP into ₹28-35L. Past performance doesn't guarantee future results."
        : riskScore >= 40
        ? "10-year simulation projects ₹10,000/month SIP growing to ₹20-26L. The balanced approach smooths returns across market cycles."
        : "Conservative projection: ₹10,000/month SIP growing to ₹16-20L over 10 years with minimal capital risk.",
      accent: "success" as const,
    },
  ];
  return insights;
}
