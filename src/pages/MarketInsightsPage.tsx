import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import FundCard from "@/components/FundCard";
import InsightCard from "@/components/InsightCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchMarketInsights } from "@/services/apiService";
import { MarketInsightsResponse } from "@/types/fund";
import { toast } from "sonner";

const moodColor = {
  bullish: "text-success",
  sideways: "text-warning",
  bearish: "text-destructive",
};

export default function MarketInsightsPage() {
  const [data, setData] = useState<MarketInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchMarketInsights()
      .then(setData)
      .catch(() => toast.error("Failed to load market insights"))
      .finally(() => setLoading(false));
  }, []);

  const sentimentLabel = useMemo(() => {
    if (!data) return "Sideways";
    return data.sentiment.charAt(0).toUpperCase() + data.sentiment.slice(1);
  }, [data]);

  const insights = useMemo(() => {
    if (!data) return [];
    return [
      {
        icon: TrendingUp,
        title: "Trend Score",
        description: `Current trend score is ${data.trend_score}. Positive score indicates bullish momentum.`,
        accentColor: "success" as const,
      },
      {
        icon: TrendingDown,
        title: "Sentiment Signal",
        description:
          data.sentiment === "bullish"
            ? "Momentum is positive. Equity-leaning allocations are favored."
            : data.sentiment === "bearish"
            ? "Risk-off environment detected. Stable funds are preferred."
            : "Mixed momentum. Balanced allocation is currently safer.",
        accentColor: "warning" as const,
      },
      {
        icon: BarChart3,
        title: "Market Source",
        description: `Signal generated from ${data.index_symbol} daily close trend over the last month.`,
        accentColor: "secondary" as const,
      },
      {
        icon: Activity,
        title: "Recommendation Logic",
        description: "Funds are selected from your valid_funds universe using sentiment-aware filtering and risk-adjusted ranking.",
        accentColor: "primary" as const,
      },
    ];
  }, [data]);

  return (
    <div className="pt-24 pb-16 container mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="font-display font-bold text-3xl text-foreground">Market Insights</h1>
        </div>
        <p className="text-muted-foreground mb-8">AI-powered market analysis and fund performance overview</p>

        {/* Market Mood */}
        <div className="glass-card p-6 mb-8 border-l-4 border-primary/40">
          <div className="flex items-center gap-3 mb-2">
            <Activity className={`w-5 h-5 ${moodColor[data?.sentiment || "sideways"]}`} />
            <h2 className="font-display font-semibold text-foreground">
              Current Market Mood: <span className={moodColor[data?.sentiment || "sideways"]}>{sentimentLabel}</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-sm">
            {data
              ? `Trend computed from ${data.index_symbol}. Latest signal score: ${data.trend_score}.`
              : "Loading market trend details..."}
          </p>
        </div>

        {/* Market Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {insights.map((item, i) => (
            <InsightCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              accentColor={item.accentColor}
              index={i}
            />
          ))}
        </div>

        {/* Fund Sections */}
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">Recommended Funds For Current Market</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Dynamic picks from your pipeline dataset based on current market sentiment.
        </p>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {(data?.recommended_funds || []).map((fund, i) => (
              <FundCard key={fund.id} fund={fund} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
