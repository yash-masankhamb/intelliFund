import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "primary" | "secondary" | "destructive" | "warning";
  index?: number;
}

const glowMap = {
  primary: "0 0 20px hsl(168 64% 52% / 0.25)",
  secondary: "0 0 20px hsl(217 91% 60% / 0.25)",
  destructive: "0 0 20px hsl(347 77% 61% / 0.25)",
  warning: "0 0 20px hsl(38 92% 50% / 0.25)",
};

const textMap = {
  primary: "text-primary",
  secondary: "text-secondary",
  destructive: "text-destructive",
  warning: "text-warning",
};

export default function MetricCard({ label, value, icon: Icon, color = "primary", index = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="metric-card"
      style={{ boxShadow: glowMap[color] }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${textMap[color]}`} />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold font-body ${textMap[color]}`}>{value}</p>
    </motion.div>
  );
}
