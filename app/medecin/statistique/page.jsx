"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Chart from 'chart.js/auto';

// Helper to calculate age from birth date
const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

// Helper to categorize age into groups
const getAgeGroup = (age) => {
    if (age <= 18) return '0-18';
    if (age <= 35) return '19-35';
    if (age <= 50) return '36-50';
    return '51+';
};

// Helper to parse and format date
const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        console.warn(`Invalid date format: ${dateStr}`);
        return null;
    }
    return date.toISOString().split('T')[0];
};

// Helper to generate a date range
const getDateRange = (endDate, days) => {
    const dates = [];
    const end = new Date(endDate);
    for (let i = 0; i < days; i++) {
        const date = new Date(end);
        date.setDate(end.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates.reverse();
};

// Helper to calculate percentage
const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
};

// Helper to format date for display
const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Date inconnue';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Date inconnue';
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

function Statistics() {
    const { user } = useUser();
    const [stats, setStats] = useState({
        totalForms: 0,
        totalResponses: 0,
        totalPatients: 0,
        ageDistribution: {},
        genderDistribution: {},
        responsesByDay: {},
        recentResponses: []
    });
    const ageChartRef = useRef(null);
    const genderChartRef = useRef(null);
    const responseChartRef = useRef(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            if (!user) return;

            try {
                const response = await fetch("/api/statistics", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: user.primaryEmailAddress.emailAddress }),
                });

                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des statistiques");
                }

                const { totalForms, formIds, totalResponses, responses, recentResponses } = await response.json();

                let ageDist = { '0-18': 0, '19-35': 0, '36-50': 0, '51+': 0 };
                let genderDist = { 'Homme': 0, 'Femme': 0 };
                let responsesByDay = {};

                responses.forEach(response => {
                    const jsonData = JSON.parse(response.jsonResponse || '{}');
                    const birthDate = jsonData.date_naissance;
                    const gender = jsonData.sexe || 'Unknown';
                    const age = calculateAge(birthDate);
                    const ageGroup = getAgeGroup(age);

                    ageDist[ageGroup]++;
                    genderDist[gender]++;

                    const createdDate = parseDate(response.createdAt);
                    if (createdDate) {
                        responsesByDay[createdDate] = (responsesByDay[createdDate] || 0) + 1;
                    }
                });

                const today = new Date();
const days = 15;  // ← Changement ici
const dateRange = getDateRange(today, days);
                const responsesByDayFilled = dateRange.map(date => ({
                    date,
                    count: responsesByDay[date] || 0
                }));

                setStats({
                    totalForms,
                    totalResponses,
                    totalPatients: totalResponses,
                    ageDistribution: ageDist,
                    genderDistribution: genderDist,
                    responsesByDay: responsesByDayFilled.reduce((acc, { date, count }) => {
                        acc[date] = count;
                        return acc;
                    }, {}),
                    recentResponses: recentResponses.map(response => ({
                        id: response.id,
                        date: response.createdAt,
                        patientName: JSON.parse(response.jsonResponse || '{}').nom_patient || 'Inconnu'
                    }))
                });

                // Destroy existing charts if they exist
                if (ageChartRef.current) {
                    ageChartRef.current.destroy();
                    ageChartRef.current = null;
                }
                if (genderChartRef.current) {
                    genderChartRef.current.destroy();
                    genderChartRef.current = null;
                }
                if (responseChartRef.current) {
                    responseChartRef.current.destroy();
                    responseChartRef.current = null;
                }

                // Create new charts
                const ageCtx = document.getElementById('ageChart')?.getContext('2d');
                const genderCtx = document.getElementById('genderChart')?.getContext('2d');
                const responseCtx = document.getElementById('responseChart')?.getContext('2d');

                if (ageCtx) {
                    ageChartRef.current = new Chart(ageCtx, {
                        type: 'pie',
                        data: {
                            labels: Object.keys(ageDist),
                            datasets: [{
                                data: Object.values(ageDist),
                                backgroundColor: ['#A0D755', '#6DCCE7', '#E6F3D2', '#F5F5DC']
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false
                        }
                    });
                }

                const totalGender = genderDist['Homme'] + genderDist['Femme'];
                if (genderCtx) {
                    genderChartRef.current = new Chart(genderCtx, {
                        type: 'bar',
                        data: {
                            labels: ['Hommes', 'Femmes'],
                            datasets: [{
                                label: 'Répartition par sexe',
                                data: [
                                    genderDist['Homme'],
                                    genderDist['Femme']
                                ],
                                backgroundColor: ['#6DCCE7', '#A0D755']
                            }]
                        },
                        options: {
                            indexAxis: 'x',
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: { title: { display: true, text: 'Sexe' } },
                                y: { title: { display: true, text: 'Nombre' }, beginAtZero: true,
                                    ticks: { stepSize: 1 }
                                }
                            },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const value = context.raw;
                                            const percentage = calculatePercentage(value, totalGender);
                                            return `${context.label}: ${value} (${percentage}%)`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }

                if (responseCtx) {
                    responseChartRef.current = new Chart(responseCtx, {
                        type: 'line',
                        data: {
                            labels: responsesByDayFilled.map(item => item.date),
                            datasets: [{
                                label: 'Réponses par jour',
                                data: responsesByDayFilled.map(item => item.count),
                                borderColor: '#0E8B8B',
                                backgroundColor: 'rgba(14, 139, 139, 0.2)',
                                fill: true,
                                tension: 0.1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: { title: { display: true, text: 'Date' } },
                                y: {
                                    title: { display: true, text: 'Nombre de Réponses' },
                                    beginAtZero: true,
                                    ticks: { stepSize: 1, precision: 0 }
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching statistics:", error);
            }
        };

        fetchStatistics();

        // Cleanup on component unmount
        return () => {
            if (ageChartRef.current) {
                ageChartRef.current.destroy();
                ageChartRef.current = null;
            }
            if (genderChartRef.current) {
                genderChartRef.current.destroy();
                genderChartRef.current = null;
            }
            if (responseChartRef.current) {
                responseChartRef.current.destroy();
                responseChartRef.current = null;
            }
        };
    }, [user]);

    return (
        <div className="p-6 bg-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6 mt-16 text-[#0E8B8B]">Statistiques</h1>

            {/* Basic Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-t-[#A0D755] border-b-4 border-b-[#A0D755]">
                    <h2 className="text-xl font-semibold text-[#0E8B8B]">Nombre de formulaires créés</h2>
                    <p className="text-2xl font-bold text-[#647788]">{stats.totalForms}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-t-[#A0D755] border-b-4 border-b-[#A0D755]">
                    <h2 className="text-xl font-semibold text-[#0E8B8B]">Nombre total de réponses</h2>
                    <p className="text-2xl font-bold text-[#647788]">{stats.totalResponses}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-t-[#A0D755] border-b-4 border-b-[#A0D755]">
                    <h2 className="text-xl font-semibold text-[#0E8B8B]">Nombre de patients</h2>
                    <p className="text-2xl font-bold text-[#647788]">{stats.totalPatients}</p>
                </div>
            </div>

            {/* Age and Gender Distribution */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-[#0E8B8B]">Distributions démographiques</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Age Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-[#A0D755] border-b-4 border-b-[#A0D755]">
                        <h3 className="text-xl font-semibold mb-4 text-[#0E8B8B]">Répartition par âge</h3>
                        <div style={{ position: 'relative', height: '250px', width: '100%' }}>
                            <canvas id="ageChart"></canvas>
                        </div>
                    </div>

                    {/* Gender Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-[#A0D755] border-b-4 border-b-[#A0D755]">
                        <h3 className="text-xl font-semibold mb-4 text-[#0E8B8B]">Répartition par sexe</h3>
                        <div style={{ position: 'relative', height: '250px', width: '100%' }}>
                            <canvas id="genderChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            {/* Responses by Day and Recent Responses */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-[#0E8B8B]">Activité des réponses</h2>
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-[#A0D755] border-b-4 border-b-[#A0D755]">
                    {/* Responses by Day */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-4 text-[#0E8B8B]">Réponses par jour (15 derniers jours)</h3>
                        <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                            <canvas id="responseChart"></canvas>
                        </div>
                    </div>

                    {/* Recent Responses */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-[#0E8B8B]">Réponses récentes</h3>
                        {stats.recentResponses.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#E6F3D2]">
                                            <th className="border-b-2 border-[#D2E8E8] px-6 py-3 text-left text-sm font-semibold text-[#0E8B8B]">Patient</th>
                                            <th className="border-b-2 border-[#D2E8E8] px-6 py-3 text-left text-sm font-semibold text-[#0E8B8B]">Date</th>
                                            <th className="border-b-2 border-[#D2E8E8] px-6 py-3 text-left text-sm font-semibold text-[#0E8B8B]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentResponses.map((response, index) => (
                                            <tr key={index} className="hover:bg-[#D2E8E8] transition-colors duration-200">
                                                <td className="border-b border-[#D2E8E8] px-6 py-3 text-[#647788]">{response.patientName}</td>
                                                <td className="border-b border-[#D2E8E8] px-6 py-3 text-[#647788]">{formatDisplayDate(response.date)}</td>
                                                <td className="border-b border-[#D2E8E8] px-6 py-3">
                                                    <Link href={`/medecin/dossier/${response.id}`}>
                                                        <button className="bg-[#0E8B8B] text-white px-4 py-2 rounded-lg hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2">
                                                            🔍 Voir le dossier
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-[#647788]">Aucune réponse récente trouvée.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Statistics;