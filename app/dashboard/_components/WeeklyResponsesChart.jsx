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
import { startOfWeek, endOfWeek, format } from "date-fns";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export default function WeeklyResponsesChart({ data }) {
  // 🔍 Sécurité : Vérifie que les données existent et ne sont pas vides
  if (!data || data.length === 0) {
    return <p className="text-center text-sm text-gray-500">Aucune donnée à afficher.</p>;
  }

  // Parse the weeks and years to create a continuous timeline
  const weeks = data.map((d) => {
    const [week, year] = d.week.split(" - ");
    const weekNum = parseInt(week.replace("S", ""), 10);
    const yearNum = parseInt(year, 10);
    // Create a date for the start of the week (approximate)
    const date = new Date(yearNum, 0, 1 + (weekNum - 1) * 7);
    return { ...d, date, weekNum, yearNum };
  });

  // Find the earliest and latest weeks
  const minWeek = Math.min(...weeks.map((w) => w.weekNum));
  const maxWeek = Math.max(...weeks.map((w) => w.weekNum));
  const year = weeks[0].yearNum; // Assume all data is from the same year

  // Create a continuous array of weeks
  const continuousData = [];
  for (let weekNum = minWeek; weekNum <= maxWeek; weekNum++) {
    const weekDate = new Date(year, 0, 1 + (weekNum - 1) * 7);
    const weekLabel = `S${String(weekNum).padStart(2, "0")} - ${year}`;
    const existingData = weeks.find((w) => w.week === weekLabel);
    continuousData.push({
      week: weekLabel,
      count: existingData ? existingData.count : 0,
      date: weekDate,
    });
  }

  // Sort the data by date
  continuousData.sort((a, b) => a.date - b.date);

  // Debug the continuous data
  console.log("Continuous data:", continuousData);

  // Prepare the chart data
  const chartData = {
    labels: continuousData.map((d) => d.week),
    datasets: [
      {
        label: "Réponses par semaine",
        data: continuousData.map((d) => d.count),
        borderColor: "#3b82f6", // Darker blue for the line
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0)"); // Transparent at the bottom
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.3)"); // Light blue at the top
          return gradient;
        },
        fill: true,
        tension: 0.1, // Less smooth to match sharp peaks
        pointRadius: 0, // No points
        pointHoverRadius: 0,
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
            const weekData = continuousData[index];
            const startDate = startOfWeek(weekData.date, { weekStartsOn: 1 });
            const endDate = endOfWeek(weekData.date, { weekStartsOn: 1 });
            return `${format(startDate, "d MMM yyyy")} - ${format(endDate, "d MMM yyyy")}`;
          },
          label: (context) => {
            return `Réponses: ${context.raw}`;
          },
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
          callback: function (_, index) {
            const weekData = continuousData[index];
            const startDate = startOfWeek(weekData.date, { weekStartsOn: 1 });
            const endDate = endOfWeek(weekData.date, { weekStartsOn: 1 });
            return `${format(startDate, "d MMM")} - ${format(endDate, "d MMM")}`;
          },
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