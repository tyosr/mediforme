'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function FormBarChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch('/api/stats/form-response-count');
      const json = await res.json();
      setData(json);
    };

    loadData();
    const interval = setInterval(loadData, 5000); // actualiser toutes les 5 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-4 mt-6 rounded-lg shadow-md w-full max-w-4xl mx-auto">
      <h2 className="text-lg font-bold mb-4">📋 Réponses par Formulaire</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#4F46E5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
