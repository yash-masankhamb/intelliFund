import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface InsightCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor?: "primary" | "secondary" | "success" | "warning" | "destructive";
  index?: number;
}

const accentMap = {
  primary: "border-primary/30 bg-primary/5",
  secondary: "border-secondary/30 bg-secondary/5",
  success: "border-success/30 bg-success/5",
  warning: "border-warning/30 bg-warning/5",
  destructive: "border-destructive/30 bg-destructive/5",
};

const iconColorMap = {
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export default function InsightCard({ icon: Icon, title, description, accentColor = "primary", index = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`glass-card p-5 border-l-4 ${accentMap[accentColor]} transition-all duration-300 hover:scale-[1.01]`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${iconColorMap[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground text-sm mb-1">{title}</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
