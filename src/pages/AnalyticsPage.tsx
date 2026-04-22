import { useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { usePortfolio } from "@/context/PortfolioContext";
import { generateGrowthData, calculatePortfolioMetrics } from "@/data/mockData";
import MetricCard from "@/components/MetricCard";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLORS = ["#2DD4BF", "#3B82F6", "#F59E0B", "#F43F5E", "#10B981", "#8B5CF6", "#EC4899", "#06B6D4"];

const customTooltipStyle = {
  backgroundColor: "hsl(217 33% 11% / 0.95)",
  border: "1px solid hsl(0 0% 100% / 0.1)",
  borderRadius: "8px",
  color: "#F8FAFC",
};

export default function AnalyticsPage() {
  const { funds, weights } = usePortfolio();
  const navigate = useNavigate();

  const w = funds.map(f => weights[f.id] || 100 / funds.length);
  const metrics = useMemo(() => calculatePortfolioMetrics(funds, w), [funds, weights]);
  const growthData = useMemo(() => generateGrowthData(metrics.portfolioReturn, 10, 10000), [metrics.portfolioReturn]);

  const allocationData = funds.map((f, i) => ({
    name: f.name.split(" ").slice(0, 2).join(" "),
    value: Math.round(w[i] || 0),
  }));

  const scatterData = funds.map(f => ({
    name: f.name.split(" ").slice(0, 2).join(" "),
    volatility: f.volatility,
    cagr: f.cagr,
  }));

  if (funds.length === 0) {
    return (
      <div className="pt-24 pb-16 container mx-auto px-4 text-center">
        <div className="glass-card p-16">
          <p className="text-muted-foreground text-lg mb-4">Add funds to your portfolio to see analytics</p>
          <button onClick={() => navigate("/risk-assessment")} className="btn-glow px-6 py-3">Start Building</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 container mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-3xl text-foreground mb-8">Portfolio Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <MetricCard label="Projected Return" value={`${metrics.portfolioReturn}%`} icon={TrendingUp} color="primary" />
          <MetricCard label="Max Drawdown" value={`${metrics.maxDrawdown}%`} icon={AlertTriangle} color="destructive" index={1} />
        </div>

        {/* Growth Chart */}
        <div className="glass-card p-6 mb-6">
          <h2 className="font-display font-semibold text-foreground mb-4">Portfolio Growth Simulation</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="invested" stroke="#3B82F6" strokeWidth={2} dot={false} name="Invested" />
              <Line type="monotone" dataKey="value" stroke="#2DD4BF" strokeWidth={2} dot={false} name="Portfolio Value" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allocation Pie */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Allocation</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={allocationData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" paddingAngle={3} label={({ name, value }) => `${name} ${value}%`}>
                  {allocationData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Risk vs Return Scatter */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Risk vs Return</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="volatility" name="Volatility" stroke="#94A3B8" fontSize={12} unit="%" />
                <YAxis dataKey="cagr" name="CAGR" stroke="#94A3B8" fontSize={12} unit="%" />
                <Tooltip contentStyle={customTooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={scatterData} fill="#2DD4BF">
                  {scatterData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
