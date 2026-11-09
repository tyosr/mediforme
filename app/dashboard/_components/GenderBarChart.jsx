"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#ec4899", "#84cc16", "#9ca3af"];

export default function GenderBarChart({ genderStats }) {
  if (!genderStats) {
    return <p className="text-center text-sm text-gray-500">Aucune donnée à afficher.</p>;
  }

  // Prepare data and filter out zero values
  const data = [
    { name: "Hommes", value: genderStats.homme },
    { name: "Femmes", value: genderStats.femme },
    { name: "Autres", value: genderStats.autre },
    { name: "Non renseigné", value: genderStats.nonRenseigné },
  ].filter(item => item.value > 0);

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Add percentage to each item
  data.forEach(item => {
    item.percentage = total ? ((item.value / total) * 100).toFixed(1) : 0;
  });

  // If no data after filtering
  if (data.length === 0) {
    return <p className="text-center text-sm text-gray-500">Aucune donnée de genre disponible.</p>;
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, name]} />
          <Legend formatter={(value, entry) => {
            const item = data.find(d => d.name === value);
            return `${value}: ${item.value} (${item.percentage}%)`;
          }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}