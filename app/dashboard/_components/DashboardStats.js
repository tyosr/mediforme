"use client";

import React, { useEffect, useState } from 'react';
import { db } from '@/configs';
import { UserResponses } from '@/configs/schema';
import { eq } from 'drizzle-orm';

const DashboardStats = () => {
    const [stats, setStats] = useState({
        male: 0,
        female: 0,
        total: 0,
    });

    const fetchStats = async () => {
        try {
            // Récupération des réponses depuis la base de données
            const responses = await db.select().from(UserResponses);
            console.log("Données récupérées :", responses); // Vérification des données récupérées

            let maleCount = 0;
            let femaleCount = 0;

            // Vérification et comptage des genres
            responses.forEach(response => {
                try {
                    const data = JSON.parse(response.jsonResponse); // Assure-toi que jsonResponse est bien un JSON
                    if (data.gender?.toLowerCase() === 'male') maleCount++;
                    if (data.gender?.toLowerCase() === 'female') femaleCount++;
                } catch (error) {
                    console.error("Erreur lors de l'analyse du JSON :", error);
                }
            });

            const total = maleCount + femaleCount;

            // Mise à jour des statistiques avec des valeurs dynamiques
            setStats({
                male: total > 0 ? ((maleCount / total) * 100).toFixed(2) : 0,
                female: total > 0 ? ((femaleCount / total) * 100).toFixed(2) : 0,
                total
            });
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques :", error);
        }
    };

    // Rafraîchissement des stats toutes les 5 secondes
    useEffect(() => {
        fetchStats(); // Appel initial
        const interval = setInterval(fetchStats, 5000); // Rafraîchissement toutes les 5 secondes
        return () => clearInterval(interval); // Nettoyage
    }, []);

    return (
        <div className="dashboard-stats bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">📊 Statistiques des Réponses</h2>
            <p className="text-blue-600">👨 Hommes : {stats.male}%</p>
            <p className="text-pink-600">👩 Femmes : {stats.female}%</p>
            <p className="text-gray-700">📌 Total Réponses : {stats.total}</p>
        </div>
    );
};

export default DashboardStats;
