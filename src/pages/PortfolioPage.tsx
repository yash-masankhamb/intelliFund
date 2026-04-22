import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, TrendingUp, Activity, BarChart3, AlertTriangle, Zap } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { usePortfolio } from "@/context/PortfolioContext";
import { fetchPortfolioMetrics } from "@/services/apiService";
import { useNavigate } from "react-router-dom";

export default function PortfolioPage() {
  const { funds, removeFund, weights, setWeight } = usePortfolio();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ portfolioReturn: 0, volatility: 0, sharpeRatio: 0, maxDrawdown: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (funds.length === 0) {
      setMetrics({ portfolioReturn: 0, volatility: 0, sharpeRatio: 0, maxDrawdown: 0 });
      return;
    }
    setLoading(true);
    const w = funds.map(f => weights[f.id] || 100 / funds.length);
    fetchPortfolioMetrics(funds, w)
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, [funds, weights]);

  const handleOptimize = () => {
    // REPLACE THIS WITH ACTUAL OPTIMIZATION LOGIC
    const equalWeight = 100 / funds.length;
    funds.forEach(f => setWeight(f.id, Math.round(equalWeight * 10) / 10));
  };

  return (
    <div className="pt-24 pb-16 container mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-foreground">Portfolio Builder</h1>
            <p className="text-muted-foreground mt-1">{funds.length} fund{funds.length !== 1 ? "s" : ""} selected</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleOptimize} className="btn-glow px-6 py-2 text-sm flex items-center gap-2" disabled={funds.length === 0}>
              <Zap className="w-4 h-4" /> Optimize
            </button>
            <button onClick={() => navigate("/analytics")} className="btn-outline-glow px-6 py-2 text-sm" disabled={funds.length === 0}>
              Analytics →
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Portfolio Return" value={`${metrics.portfolioReturn}%`} icon={TrendingUp} color="primary" index={0} />
          <MetricCard label="Volatility" value={`${metrics.volatility}%`} icon={Activity} color="warning" index={1} />
          <MetricCard label="Sharpe Ratio" value={metrics.sharpeRatio} icon={BarChart3} color="secondary" index={2} />
          <MetricCard label="Max Drawdown" value={`${metrics.maxDrawdown}%`} icon={AlertTriangle} color="destructive" index={3} />
        </div>

        {funds.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p className="text-muted-foreground text-lg mb-4">No funds in your portfolio yet</p>
            <button onClick={() => navigate("/risk-assessment")} className="btn-glow px-6 py-3">
              Start Risk Assessment
            </button>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase tracking-wider font-body">Fund</th>
                  <th className="text-right p-4 text-xs text-muted-foreground uppercase tracking-wider font-body">CAGR</th>
                  <th className="text-right p-4 text-xs text-muted-foreground uppercase tracking-wider font-body">Risk</th>
                  <th className="text-center p-4 text-xs text-muted-foreground uppercase tracking-wider font-body">Allocation %</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {funds.map(fund => (
                  <tr key={fund.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-foreground text-sm">{fund.name}</p>
                      <p className="text-xs text-muted-foreground">{fund.category}</p>
                    </td>
                    <td className="text-right p-4 text-primary font-bold font-body">{fund.cagr}%</td>
                    <td className="text-right p-4">
                      <span className={fund.risk === "High" ? "risk-badge-high" : fund.risk === "Moderate" ? "risk-badge-moderate" : "risk-badge-low"}>
                        {fund.risk}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={weights[fund.id] || 0}
                          onChange={e => setWeight(fund.id, Number(e.target.value))}
                          className="w-24 accent-primary"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={weights[fund.id] || 0}
                          onChange={e => setWeight(fund.id, Number(e.target.value))}
                          className="w-16 bg-muted/50 border border-border rounded px-2 py-1 text-center text-sm text-foreground font-body focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <button onClick={() => removeFund(fund.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
