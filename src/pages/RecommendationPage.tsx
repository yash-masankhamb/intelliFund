import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Target, Clock, Wallet, TrendingUp, Brain, Sliders, BarChart3 } from "lucide-react";
import AdvisorFundCard from "@/components/AdvisorFundCard";
import InsightCard from "@/components/InsightCard";
import MetricCard from "@/components/MetricCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Fund } from "@/types/fund";
import { fetchRecommendations } from "@/services/apiService";
import { getStrategyForRisk, getInsights } from "@/data/fundReasons";
import { usePortfolio } from "@/context/PortfolioContext";
import { toast } from "sonner";
import { generateGrowthData, calculatePortfolioMetrics } from "@/utils/portfolio";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const COLORS = ["#2DD4BF", "#3B82F6", "#F59E0B", "#F43F5E", "#10B981"];

const customTooltipStyle = {
  backgroundColor: "hsl(217 33% 11% / 0.95)",
  border: "1px solid hsl(0 0% 100% / 0.1)",
  borderRadius: "8px",
  color: "#F8FAFC",
};

const riskBadgeMap = {
  High: "risk-badge-high",
  Moderate: "risk-badge-moderate",
  Low: "risk-badge-low",
};

export default function RecommendationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const riskScore = Number(searchParams.get("risk") || 50);
  const sipAmount = Number(searchParams.get("sip") || 10000);
  const durationYears = Number(searchParams.get("duration") || 5);
  const goalParam = searchParams.get("goal") || "Wealth Creation";

  const [funds, setFunds] = useState<Fund[]>([]);
  const [reasoning, setReasoning] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustedRisk, setAdjustedRisk] = useState(riskScore);
  const [adjustedSip, setAdjustedSip] = useState(sipAmount);
  const { addFund } = usePortfolio();

  const strategy = useMemo(() => getStrategyForRisk(adjustedRisk), [adjustedRisk]);
  const insights = useMemo(() => getInsights(adjustedRisk), [adjustedRisk]);

  useEffect(() => {
    setLoading(true);
    fetchRecommendations({
      risk_level: adjustedRisk >= 70 ? "high" : adjustedRisk >= 40 ? "medium" : "low",
      investment_goal: goalParam,
      time_horizon: durationYears,
      monthly_investment: adjustedSip,
    })
      .then((res) => {
        setFunds(res.recommended_funds);
        setReasoning(res.reasoning);
      })
      .catch(() => toast.error("Failed to load recommendations"))
      .finally(() => setLoading(false));
  }, [adjustedRisk, adjustedSip, durationYears, goalParam]);

  const metrics = useMemo(() => {
    if (funds.length === 0) return null;
    const equalWeights = funds.map(() => 100 / funds.length);
    return calculatePortfolioMetrics(funds, equalWeights);
  }, [funds]);

  const growthData = useMemo(() => {
    if (!metrics) return [];
    return generateGrowthData(metrics.portfolioReturn, durationYears, adjustedSip);
  }, [metrics, durationYears, adjustedSip]);

  const allocationData = funds.map(f => ({
    name: f.name.split(" ").slice(0, 2).join(" "),
    value: Math.round(100 / funds.length),
  }));

  const handleAdd = (fund: Fund) => {
    addFund(fund);
    toast.success(`${fund.name} added to portfolio`);
  };

  const handleAddAll = () => {
    funds.forEach(f => addFund(f));
    toast.success("All recommended funds added to portfolio");
    navigate("/portfolio");
  };

  const insightIcons = [Brain, Target, BarChart3, TrendingUp];

  return (
    <div className="pt-24 pb-16 container mx-auto px-4 max-w-6xl">
      {/* Section 1: User Profile Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-foreground">Your Investment Profile</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Risk Type</p>
              <span className={riskBadgeMap[strategy.riskLevel as keyof typeof riskBadgeMap] || "risk-badge-moderate"}>
                {strategy.label}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Horizon</p>
              <p className="text-foreground font-semibold font-display">{durationYears} years</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Monthly SIP</p>
              <p className="text-foreground font-semibold font-display">₹{adjustedSip.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Goal</p>
              <p className="text-foreground font-semibold font-display">{goalParam}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 2: AI Strategy Recommendation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <div className="glass-card p-6 border-l-4 border-primary/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-foreground">AI Recommendation</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{strategy.description}</p>
            <div className="flex flex-wrap gap-4">
              <div className="glass-card px-4 py-2 rounded-lg">
                <span className="text-xs text-muted-foreground">Strategy</span>
                <p className="text-primary font-bold text-sm">{strategy.type}</p>
              </div>
              <div className="glass-card px-4 py-2 rounded-lg">
                <span className="text-xs text-muted-foreground">Expected Return</span>
                <p className="text-success font-bold text-sm">{strategy.expectedReturn}</p>
              </div>
              <div className="glass-card px-4 py-2 rounded-lg">
                <span className="text-xs text-muted-foreground">Risk Level</span>
                <p className="text-foreground font-bold text-sm">{strategy.riskLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Adjustments */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-foreground">Adjust Parameters</h2>
            <span className="text-xs text-muted-foreground ml-2">Recommendations update in real-time</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Risk Tolerance: <span className="text-primary font-bold">{adjustedRisk}</span></label>
              <input
                type="range"
                min={0}
                max={100}
                value={adjustedRisk}
                onChange={e => setAdjustedRisk(Number(e.target.value))}
                className="w-full accent-primary h-2 rounded-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Safe</span><span>Balanced</span><span>Aggressive</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Monthly SIP: <span className="text-primary font-bold">₹{adjustedSip.toLocaleString()}</span></label>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={adjustedSip}
                onChange={e => setAdjustedSip(Number(e.target.value))}
                className="w-full accent-primary h-2 rounded-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₹1K</span><span>₹50K</span><span>₹1L</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 3: Top Fund Picks */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-display font-bold text-xl text-foreground">Top Fund Picks</h2>
          <button onClick={handleAddAll} className="btn-glow px-5 py-2 text-sm" disabled={loading}>
            Add All to Portfolio →
          </button>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {funds.map((fund, i) => (
              <AdvisorFundCard
                key={fund.id}
                fund={fund}
                reason={reasoning[i] || "Selected for optimal risk-adjusted returns in your profile."}
                onAdd={handleAdd}
                index={i}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Analytics Visualization */}
      {metrics && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
          <h2 className="font-display font-bold text-xl text-foreground mb-4">Performance Projection</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Expected Return" value={`${metrics.portfolioReturn}%`} icon={TrendingUp} color="primary" index={0} />
            <MetricCard label="Volatility" value={`${metrics.volatility}%`} icon={BarChart3} color="warning" index={1} />
            <MetricCard label="Sharpe Ratio" value={metrics.sharpeRatio} icon={Target} color="secondary" index={2} />
            <MetricCard label="Max Drawdown" value={`${metrics.maxDrawdown}%`} icon={Wallet} color="destructive" index={3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth Chart */}
            <div className="glass-card p-5 lg:col-span-2">
              <h3 className="font-display font-semibold text-foreground mb-3 text-sm">Growth Projection ({durationYears}yr)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="invested" stroke="#3B82F6" strokeWidth={2} dot={false} name="Invested" />
                  <Line type="monotone" dataKey="value" stroke="#2DD4BF" strokeWidth={2} dot={false} name="Value" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Allocation Pie */}
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-foreground mb-3 text-sm">Allocation</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={allocationData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={3}>
                    {allocationData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {allocationData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 4: AI Insights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="font-display font-bold text-xl text-foreground mb-4">AI Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, i) => (
            <InsightCard
              key={insight.title}
              icon={insightIcons[i]}
              title={insight.title}
              description={insight.description}
              accentColor={insight.accent}
              index={i}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
