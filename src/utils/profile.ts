export interface UserProfile {
  id: string;
  monthly_income?: string;
  income_stability?: string;
  sip_amount?: string;
  investment_experience?: string;
  risk_profile?: string;
  investment_goal?: string;
  time_horizon?: string;
  investment_preference?: string;
}

export function isProfileComplete(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;

  const requiredFields: (keyof UserProfile)[] = [
    "monthly_income",
    "income_stability",
    "sip_amount",
    "investment_experience",
    "risk_profile",
    "investment_goal",
    "time_horizon",
    "investment_preference",
  ];

  return requiredFields.every((field) => {
    const value = profile[field];
    return value !== null && value !== undefined && value !== "";
  });
}
