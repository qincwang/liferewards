import React, { createContext, useContext } from "react";
import { useLifeData } from "../hooks/useLifeData";
import type { Achievement, LogEntry, MealType } from "../types";
import type { BookLog } from "../store/books";
import type { PieceLog } from "../store/pieces";

type LifeDataContextType = ReturnType<typeof useLifeData>;

const LifeDataContext = createContext<LifeDataContextType | null>(null);

export function LifeDataProvider({ children }: { children: React.ReactNode }) {
  const data = useLifeData();
  return (
    <LifeDataContext.Provider value={data}>
      {children}
    </LifeDataContext.Provider>
  );
}

export function useLifeDataContext(): LifeDataContextType {
  const ctx = useContext(LifeDataContext);
  if (!ctx) throw new Error("useLifeDataContext must be used within LifeDataProvider");
  return ctx;
}
