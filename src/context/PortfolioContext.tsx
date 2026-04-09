import { createContext, useContext, useState, ReactNode } from "react";
import { Fund } from "@/types/fund";

interface PortfolioContextType {
  funds: Fund[];
  weights: Record<string, number>;
  addFund: (fund: Fund) => void;
  removeFund: (id: string) => void;
  setWeight: (id: string, weight: number) => void;
}

const PortfolioContext = createContext<PortfolioContextType>({
  funds: [],
  weights: {},
  addFund: () => {},
  removeFund: () => {},
  setWeight: () => {},
});

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});

  const addFund = (fund: Fund) => {
    setFunds(prev => {
      if (prev.find(f => f.id === fund.id)) return prev;
      const newFunds = [...prev, fund];
      const equalWeight = Math.round((100 / newFunds.length) * 10) / 10;
      const newWeights: Record<string, number> = {};
      newFunds.forEach(f => { newWeights[f.id] = equalWeight; });
      setWeights(newWeights);
      return newFunds;
    });
  };

  const removeFund = (id: string) => {
    setFunds(prev => {
      const newFunds = prev.filter(f => f.id !== id);
      if (newFunds.length > 0) {
        const equalWeight = Math.round((100 / newFunds.length) * 10) / 10;
        const newWeights: Record<string, number> = {};
        newFunds.forEach(f => { newWeights[f.id] = equalWeight; });
        setWeights(newWeights);
      } else {
        setWeights({});
      }
      return newFunds;
    });
  };

  const setWeight = (id: string, weight: number) => {
    setWeights(prev => ({ ...prev, [id]: weight }));
  };

  return (
    <PortfolioContext.Provider value={{ funds, weights, addFund, removeFund, setWeight }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
