// src/components/CharacterContext.tsx
import React, { createContext, useContext } from "react";

type CharacterContextValue = { id: string };

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return <CharacterContext.Provider value={{ id }}>{children}</CharacterContext.Provider>;
}

export function useCharacterId() {
  const ctx = useContext(CharacterContext);
  return ctx?.id ?? null;
}