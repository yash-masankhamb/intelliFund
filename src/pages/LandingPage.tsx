import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Brain, ShieldCheck, BarChart3 } from "lucide-react";
import HeroOrb from "@/components/HeroOrb";
import InsightCard from "@/components/InsightCard";
import { marketMood } from "@/data/mockData";

const moodColor = {
  Bullish: "text-success",
  Neutral: "text-warning",
  Bearish: "text-destructive",
};

const moodGlow = {
  Bullish: "0 0 15px hsl(160 84% 39% / 0.4)",
  Neutral: "0 0 15px hsl(38 92% 50% / 0.4)",
  Bearish: "0 0 15px hsl(347 77% 61% / 0.4)",
};

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Our intelligent engine analyzes thousands of data points to find the optimal funds for your goals.",
    accent: "primary" as const,
  },
  {
    icon: ShieldCheck,
    title: "Risk-Optimized Strategies",
    description: "Every recommendation is risk-adjusted using Sharpe ratios, drawdown analysis, and volatility metrics.",
    accent: "success" as const,
  },
  {
    icon: BarChart3,
    title: "Dynamic Insights",
    description: "Understand WHY each fund is recommended with clear, data-driven explanations and projections.",
    accent: "secondary" as const,
  },
];

export default function LandingPage() {
  return (
    <div className="pt-20 pb-16">
      {/* Hero */}
      <section className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
            style={{ boxShadow: moodGlow[marketMood] }}
          >
            <Activity className={`w-4 h-4 ${moodColor[marketMood]}`} />
            <span className="text-sm text-muted-foreground">Market Mood:</span>
            <span className={`text-sm font-bold ${moodColor[marketMood]}`}>{marketMood}</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
            Your Intelligent<br />
            <span className="gradient-text">Mutual Fund</span><br />
            Advisor
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mb-8">
            Get data-driven fund recommendations and optimized investment strategies tailored to your goals. Let our AI guide your wealth creation journey.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/auth" className="btn-glow px-8 py-3 text-base flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/market-insights" className="btn-outline-glow px-8 py-3 text-base">
              View Market Insights
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-shrink-0"
        >
          <HeroOrb />
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2 text-center">
            How <span className="gradient-text">IntelliFund</span> Works
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Three simple steps to your optimized investment strategy
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { step: "01", title: "Tell Us About You", desc: "Share your goals, risk preference, and investment horizon through our smart questionnaire." },
              { step: "02", title: "AI Analyzes & Recommends", desc: "Our engine evaluates thousands of funds and builds a strategy tailored to your profile." },
              { step: "03", title: "Get Insights & Invest", desc: "Review AI-powered explanations, understand the 'why', and start your investment journey." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="glass-card p-6 text-center relative"
              >
                <span className="text-5xl font-extrabold font-display gradient-text opacity-30 absolute top-4 right-4">{item.step}</span>
                <h3 className="font-display font-bold text-foreground mb-2 mt-4">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <h2 className="font-display font-bold text-2xl text-foreground mb-6 text-center">
            Why Choose Our <span className="gradient-text">AI Advisor</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {features.map((f, i) => (
              <InsightCard key={f.title} icon={f.icon} title={f.title} description={f.description} accentColor={f.accent} index={i} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
          <div className="relative z-10">
            <h2 className="font-display font-bold text-3xl text-foreground mb-4">
              Ready to Invest Smarter?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Let our AI analyze your profile and recommend the perfect mutual fund strategy.
            </p>
            <Link to="/auth" className="btn-glow px-10 py-4 text-base inline-flex items-center gap-2">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
