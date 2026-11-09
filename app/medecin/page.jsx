"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CreateForm from "./_compo/CreateForm";
import FormList from "./_compo/FormList";

export default function MedecinPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [role, setRole] = useState(null);
    const [userName, setUserName] = useState("Utilisateur");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!isLoaded || !isSignedIn || !user) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("/api/user-data", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId: user.id }),
                });

                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des données utilisateur");
                }

                const { user: userData } = await response.json();

                if (userData) {
                    setRole(userData.role);
                }

                // ✅ Utiliser le nom à jour depuis Clerk
                setUserName(user.fullName || userData?.name || "Utilisateur");

            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [isLoaded, isSignedIn, user]);

    if (!isLoaded || loading) {
        return <div className="text-center text-[#647788]">Chargement...</div>;
    }

    if (!isSignedIn) {
        return <div className="text-center text-[#647788]">Vous devez vous connecter pour voir cette page.</div>;
    }

    return (
        <div className="p-6 min-h-screen bg-white max-w-6xl mx-auto">
            {role === "medecin" && (
                <h1 className="text-3xl font-bold mt-16 text-[#0E8B8B]">
                    Bienvenue Dr {userName} 👋
                </h1>
            )}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold mt-12 text-[#0E8B8B]">📋 Mes Formulaires </h2>
                <CreateForm />
            </div>
            <FormList />
        </div>
    );
}
