"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export default function DailyResponsesChart({ data }) {
  // Safety check: Verify data exists and is not empty
  if (!data || data.length === 0) {
    return <p className="text-center text-sm text-gray-500">Aucune donnée à afficher.</p>;
  }

  // Use the provided data directly without creating a continuous range
  const chartData = {
    labels: data.map((d) => format(parse(d.day, "yyyy-MM-dd", new Date()), "d MMM yyyy", { locale: fr })),
    datasets: [
      {
        label: "Réponses par jour",
        data: data.map((d) => d.count),
        borderColor: "#3b82f6",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.3)");
          return gradient;
        },
        fill: true,
        tension: 0.1,
        pointRadius: 4, // Add visible points
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return chartData.labels[index];
          },
          label: (context) => `Réponses: ${context.raw}`,
        },
        backgroundColor: "#fff",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12, family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: { size: 12, family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" },
        },
        grid: { color: "#e5e7eb", borderDash: [3, 3] },
      },
    },
  };

  return (
    <div className="w-full h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}