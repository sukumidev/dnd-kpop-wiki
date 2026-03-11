import React from "react";
import Layout from "@theme/Layout";
import QuestDashboard from "@site/src/components/QuestDashboard";

export default function QuestsPage(): React.ReactElement {
  return (
    <Layout title="Quests" description="Seguimiento de quests de la campaña">
      <main className="container margin-vert--lg">
        <QuestDashboard />
      </main>
    </Layout>
  );
}