// src/components/Statblock.tsx
import React from "react";
import StatblockCard from "./StatblockCard";
import { getStatblock } from "@site/src/data/statblocks";

export default function Statblock({ id }: { id: string }) {
  const sb = getStatblock(id);
  if (!sb) {
    return (
      <p style={{ opacity: 0.8 }}>
        Statblock <code>{id}</code> no encontrado 😭
      </p>
    );
  }
  return <StatblockCard data={sb} />;
}