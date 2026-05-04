import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Wallet, ShieldCheck, PiggyBank, GraduationCap, TrendingDown, Target, Clock, BarChart3, User as UserIcon, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { isProfileComplete, UserProfile } from "@/utils/profile";
import LoadingSpinner from "@/components/LoadingSpinner";

const questions = [
  {
    icon: Wallet,
    title: "What is your monthly income?",
    subtitle: "This helps us understand your financial capacity",
    options: ["Less than ₹25,000", "₹25,000 – ₹50,000", "₹50,000 – ₹1,00,000", "More than ₹1,00,000"],
  },
  {
    icon: ShieldCheck,
    title: "How stable is your income?",
    subtitle: "Income stability affects your risk-taking ability",
    options: ["Very stable (fixed salary)", "Mostly stable", "Somewhat unpredictable", "Highly uncertain"],
  },
  {
    icon: PiggyBank,
    title: "How much do you invest monthly (SIP)?",
    subtitle: "Even small amounts compound significantly over time",
    options: ["Less than ₹2,000", "₹2,000 – ₹5,000", "₹5,000 – ₹15,000", "More than ₹15,000"],
  },
  {
    icon: GraduationCap,
    title: "What is your investment experience?",
    subtitle: "Experience helps us calibrate recommendations",
    options: ["No experience (beginner)", "Limited experience", "Moderate experience", "Advanced investor"],
  },
  {
    icon: TrendingDown,
    title: "If your investment drops by 20%, what will you do?",
    subtitle: "This reveals your true risk tolerance",
    options: ["Sell immediately", "Wait for recovery", "Stay invested calmly", "Invest more"],
  },
  {
    icon: Target,
    title: "What is your primary investment goal?",
    subtitle: "Your goal shapes the right strategy for you",
    options: ["Short-term needs (travel, gadgets, etc.)", "Saving for a specific goal (car, house)", "Wealth creation", "Retirement planning"],
  },
  {
    icon: Clock,
    title: "What is your investment time horizon?",
    subtitle: "Longer horizons allow for more aggressive strategies",
    options: ["Less than 3 years", "3 to 5 years", "5 to 10 years", "More than 10 years"],
  },
  {
    icon: BarChart3,
    title: "What is your current investment preference?",
    subtitle: "This tells us about your existing comfort level",
    options: ["Mostly fixed deposits / safe options", "More in debt funds", "Balanced (equity + debt)", "Mostly equity investments"],
  },
] as const;

const scoreWeights = [
  [0, 1, 2, 3],   // income
  [3, 2, 1, 0],   // stability
  [0, 1, 2, 3],   // SIP amount
  [0, 1, 2, 3],   // experience
  [0, 1, 2, 3],   // reaction to drop
  [0, 1, 2, 3],   // goal
  [0, 1, 2, 3],   // horizon
  [0, 1, 2, 3],   // preference
];

function computeRiskScore(answers: number[]): number {
  let total = 0;
  let max = 0;
  answers.forEach((a, i) => {
    total += scoreWeights[i][a];
    max += 3;
  });
  return Math.round((total / max) * 100);
}

function mapAnswersToParams(answers: number[]) {
  const sipMap = [1500, 3500, 10000, 20000];
  const durationMap = [2, 4, 7, 12];
  const goalMap = ["Short-term", "Specific Goal", "Wealth Creation", "Retirement"];
  return {
    sip: sipMap[answers[2]],
    duration: durationMap[answers[6]],
    goal: goalMap[answers[5]],
  };
}

export default function AdvisorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isRetaking, setIsRetaking] = useState(false);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));

  useEffect(() => {
    async function checkUser() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);
      }
      setLoading(false);
    }
    checkUser();
  }, []);

  const handleSelect = (optionIndex: number) => {
    const updated = [...answers];
    updated[step] = optionIndex;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(s => s + 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (answers.some(a => a === -1)) {
      toast({
        title: "Incomplete",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    const profileData = {
      id: user.id,
      monthly_income: questions[0].options[answers[0]],
      income_stability: questions[1].options[answers[1]],
      sip_amount: questions[2].options[answers[2]],
      investment_experience: questions[3].options[answers[3]],
      risk_profile: questions[4].options[answers[4]],
      investment_goal: questions[5].options[answers[5]],
      time_horizon: questions[6].options[answers[6]],
      investment_preference: questions[7].options[answers[7]],
    };

    const { error } = await supabase
      .from("user_profiles")
      .upsert(profileData, { onConflict: "id" });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Your preferences have been updated." });
    
    const score = computeRiskScore(answers);
    const { sip, duration, goal } = mapAnswersToParams(answers);
    navigate(`/recommendations?risk=${score}&sip=${sip}&duration=${duration}&goal=${goal}`);
  };

  if (loading) return <div className="pt-32"><LoadingSpinner /></div>;

  if (!user) {
    return (
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-xl text-center">
        <div className="glass-card p-10 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground mb-2">Login Required</h1>
            <p className="text-muted-foreground">Sign in to unlock personalized AI investment advice and track your progress.</p>
          </div>
          <button onClick={() => navigate("/auth")} className="btn-glow px-8 py-3 w-full max-w-xs">
            Login to get personalized advice
          </button>
        </div>
      </div>
    );
  }

  const profileIsComplete = isProfileComplete(profile);

  if (profileIsComplete && !isRetaking) {
    return (
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">Profile Complete</h1>
          <p className="text-muted-foreground mb-8">Your investment profile is ready. You can update your preferences anytime to refine your recommendations.</p>
          
          <div className="grid gap-3">
            <button 
              onClick={() => {
                // Pre-fill answers if possible (optional enhancement)
                navigate("/recommendations");
              }} 
              className="btn-glow py-3 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> View AI Recommendations
            </button>
            <button 
              onClick={() => setIsRetaking(true)} 
              className="glass-card py-3 text-sm font-semibold hover:bg-white/5 transition-colors border border-white/10"
            >
              Update Preferences
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-6 italic">"Update your preferences anytime"</p>
        </motion.div>
      </div>
    );
  }

  // Questionnaire Flow
  const currentQ = questions[step];
  const Icon = currentQ.icon;
  const canProceed = answers[step] !== -1;

  return (
    <div className="pt-24 pb-16 container mx-auto px-4 max-w-xl">
      <div className="flex gap-1.5 mb-8">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? "bg-primary glow-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Question {step + 1} of {questions.length}</p>
              <h1 className="font-display font-bold text-xl text-foreground">{currentQ.title}</h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground ml-[52px] mb-6">{currentQ.subtitle}</p>

          <div className="grid gap-3">
            {currentQ.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left py-4 px-5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  answers[step] === i
                    ? "bg-primary/20 text-primary border border-primary/40 glow-primary"
                    : "glass-card text-muted-foreground hover:text-foreground hover:border-primary/20"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-10">
            <button
              onClick={() => {
                if (step === 0) {
                  if (profileIsComplete) setIsRetaking(false);
                  else navigate(-1);
                } else {
                  setStep(s => s - 1);
                }
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {step === 0 && profileIsComplete ? "Cancel" : "Back"}
            </button>

            {step < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="btn-glow px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed}
                className="btn-glow px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" /> Save & Get Recommendations
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}