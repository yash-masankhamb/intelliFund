import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Clock, Wallet, TrendingUp } from "lucide-react";

export default function RiskAssessmentPage() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(5);
  const [riskAppetite, setRiskAppetite] = useState<"Conservative" | "Moderate" | "Aggressive">("Moderate");
  const [sip, setSip] = useState(10000);
  const [goal, setGoal] = useState("Wealth Creation");

  const handleSubmit = () => {
    let score = 50;
    if (riskAppetite === "Aggressive") score += 25;
    if (riskAppetite === "Conservative") score -= 25;
    if (duration >= 7) score += 10;
    if (duration <= 3) score -= 10;
    score = Math.max(0, Math.min(100, score));
    navigate(`/recommendations?risk=${score}&sip=${sip}&duration=${duration}`);
  };

  return (
    <div className="pt-24 pb-16 container mx-auto px-4 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display font-bold text-3xl text-foreground mb-2">Risk Assessment</h1>
        <p className="text-muted-foreground mb-10">Tell us about your investment preferences</p>

        <div className="space-y-8">
          {/* Duration */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <label className="font-display font-semibold text-foreground">Investment Duration</label>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="text-primary font-bold text-lg mt-2">{duration} years</p>
          </div>

          {/* Risk Appetite */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <label className="font-display font-semibold text-foreground">Risk Appetite</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["Conservative", "Moderate", "Aggressive"] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setRiskAppetite(level)}
                  className={`py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    riskAppetite === level
                      ? "bg-primary/20 text-primary border border-primary/40 glow-primary"
                      : "glass-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* SIP */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-primary" />
              <label className="font-display font-semibold text-foreground">Monthly SIP Amount</label>
            </div>
            <input
              type="number"
              value={sip}
              onChange={e => setSip(Number(e.target.value))}
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
              min={500}
              step={500}
            />
            <p className="text-muted-foreground text-sm mt-2">₹{sip.toLocaleString()} / month</p>
          </div>

          {/* Goal */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <label className="font-display font-semibold text-foreground">Investment Goal</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Wealth Creation", "Retirement", "Education", "Emergency Fund"].map(g => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    goal === g
                      ? "bg-primary/20 text-primary border border-primary/40 glow-primary"
                      : "glass-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} className="btn-glow w-full py-4 text-base font-bold">
            Get Recommendations →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
