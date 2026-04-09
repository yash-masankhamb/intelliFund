import { Fund } from "@/types/fund";
import { TrendingUp, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface FundCardProps {
  fund: Fund;
  onAdd?: (fund: Fund) => void;
  showAddButton?: boolean;
  index?: number;
}

const riskBadgeClass = {
  High: "risk-badge-high",
  Moderate: "risk-badge-moderate",
  Low: "risk-badge-low",
};

export default function FundCard({ fund, onAdd, showAddButton = false, index = 0 }: FundCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass-card-hover p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-foreground text-sm leading-tight">{fund.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{fund.category}</p>
        </div>
        <span className={riskBadgeClass[fund.risk]}>{fund.risk}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        <div>
          <p className="text-xs text-muted-foreground">CAGR</p>
          <p className="text-lg font-bold text-primary font-body">{fund.cagr}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Volatility</p>
          <p className="text-lg font-bold text-foreground font-body">{fund.volatility}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sharpe</p>
          <p className="text-sm font-semibold text-secondary font-body">{fund.sharpeRatio}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Max DD</p>
          <p className="text-sm font-semibold text-destructive font-body">{fund.maxDrawdown}%</p>
        </div>
      </div>

      {showAddButton && onAdd && (
        <button
          onClick={() => onAdd(fund)}
          className="btn-glow mt-2 px-4 py-2 text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add to Portfolio
        </button>
      )}
    </motion.div>
  );
}
