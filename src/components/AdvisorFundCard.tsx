import { Fund } from "@/types/fund";
import { Plus, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface AdvisorFundCardProps {
  fund: Fund;
  reason: string;
  onAdd?: (fund: Fund) => void;
  index?: number;
}

const riskBadgeClass = {
  High: "risk-badge-high",
  Moderate: "risk-badge-moderate",
  Low: "risk-badge-low",
};

export default function AdvisorFundCard({ fund, reason, onAdd, index = 0 }: AdvisorFundCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="glass-card-hover p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-foreground text-sm leading-tight">{fund.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{fund.category}</p>
        </div>
        <span className={riskBadgeClass[fund.risk]}>{fund.risk}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">CAGR</p>
          <p className="text-lg font-bold text-primary font-body">{fund.cagr}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sharpe</p>
          <p className="text-lg font-bold text-foreground font-body">{fund.sharpeRatio}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Max DD</p>
          <p className="text-lg font-bold text-destructive font-body">{fund.maxDrawdown}%</p>
        </div>
      </div>

      {/* Why this fund */}
      <div className="flex items-start gap-2 bg-primary/5 rounded-lg p-3 border border-primary/10">
        <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">{reason}</p>
      </div>

      {onAdd && (
        <button
          onClick={() => onAdd(fund)}
          className="btn-glow mt-1 px-4 py-2 text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add to Portfolio
        </button>
      )}
    </motion.div>
  );
}
