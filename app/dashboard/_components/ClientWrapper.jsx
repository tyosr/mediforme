// app/dashboard/_components/ClientStats.jsx
"use client";

import ResponsesLineChart from "./ResponsesLineChart";
import GenderPieChart from "./GenderPieChartAdmin";
import AgeBarChart from "./AgeBarChart";
import StatCard from "./StatCard";

export default function ClientStats({ totalForms, totalResponses, uniquePatients, lineData, genderStats, ageGroups }) {
  return (
    <div className="p-6 grid gap-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Formulaires créés" value={totalForms} color="bg-blue-200" />
        <StatCard title="Réponses reçues" value={totalResponses} color="bg-green-200" />
        <StatCard title="Patients uniques" value={uniquePatients} color="bg-purple-200" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl mb-2 font-semibold">Réponses par mois</h2>
          <ResponsesLineChart data={lineData} />
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl mb-2 font-semibold">Répartition par genre</h2>
          <GenderPieChart male={genderStats.male} female={genderStats.female} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl mb-2 font-semibold">Répartition par tranche d’âge</h2>
        <AgeBarChart ageGroups={ageGroups} />
      </div>
    </div>
  );
}
