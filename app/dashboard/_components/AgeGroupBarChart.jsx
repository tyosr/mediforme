"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";

export default function AgeGroupBarChart({ ageGroups }) {
  
  // Calculate total for percentage computation
const total = ageGroups["0-18"] + ageGroups["19-35"] + ageGroups["36-50"] + ageGroups["51+"];

  // Prepare data with percentages
  // Prepare data with percentages
const data = [
  { name: "0-18", value: ageGroups["0-18"], percentage: total ? ((ageGroups["0-18"] / total) * 100).toFixed(1) : 0 },
  { name: "19-35", value: ageGroups["19-35"], percentage: total ? ((ageGroups["19-35"] / total) * 100).toFixed(1) : 0 },
  { name: "36-50", value: ageGroups["36-50"], percentage: total ? ((ageGroups["36-50"] / total) * 100).toFixed(1) : 0 },
  { name: "51+", value: ageGroups["51+"], percentage: total ? ((ageGroups["51+"] / total) * 100).toFixed(1) : 0 },
];

  // Define colors for each segment
  const COLORS = ["#f59e0b", "#38bdf8", "#22c55e", "#ef4444"];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
      
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="70%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={0} // Set to 0 to remove gaps between segments
              cornerRadius={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList
                dataKey="percentage"
                position="outside"
                formatter={(value) => `${value}%`}
                style={{ fontSize: 12, fontWeight: 500, fill: "#1f2937" }}
              />
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [`${props.payload.percentage}%`, name]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: "#1f2937" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="ml-4">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center mb-2">
              <span
                className="w-4 h-4 mr-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span className="text-sm text-gray-700">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}