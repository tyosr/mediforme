"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";

export default function TopFormsBarChart({ data }) {
  // Define gradient for bars with higher contrast
  const gradientId = "formGradient";

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
    
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 25, right: 80, top: 10, bottom: 10 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#6b46c1" stopOpacity={0.9} /> {/* Darker purple for better contrast */}
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.7} /> {/* Lighter purple, but not too faded */}
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.5} />
          <XAxis
            type="number"
            allowDecimals={false}
            stroke="#4b5563"
            tick={{ fill: "#4b5563", fontSize: 14, fontWeight: 600 }}
          />
          <YAxis
            type="category"
            dataKey="title"
            stroke="#4b5563"
            tick={{ fill: "#4b5563", fontSize: 14, fontWeight: 600 }}
            width={140}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            labelStyle={{ color: "#1f2937", fontWeight: 600 }}
            itemStyle={{ color: "#6b46c1", fontWeight: 600 }}
          />
          <Bar
            dataKey="count"
            radius={[0, 8, 8, 0]}
            barSize={20}
            fill={`url(#${gradientId})`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#${gradientId})`} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              style={{ fill: "#4b5563", fontSize: 14, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}