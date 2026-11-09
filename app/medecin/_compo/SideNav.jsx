"use client";

import { FiClipboard, FiMessageSquare, FiMenu, FiTrendingUp, FiUser, FiUsers } from "react-icons/fi";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import * as Progress from "@radix-ui/react-progress";
import Link from "next/link";

function SideNav() {
    const { user } = useUser();
    const [formCount, setFormCount] = useState(0);
    const [formCountPerc, setFormCountPerc] = useState(0);
    const [isOpen, setIsOpen] = useState(false); // Closed by default on mobile
    const [loading, setLoading] = useState(false);

    const menuList = [
        { id: 1, name: "Mes formulaires", icon: FiClipboard, path: "/dashboard" },
        { id: 2, name: "Historique des réponses", icon: FiMessageSquare, path: "/medecin/responses" },
        { id: 3, name: "Liste de patients", icon: FiUsers, path: "/medecin/patients" },
        { id: 4, name: "Statistiques", icon: FiTrendingUp, path: "/medecin/statistique" },
        { id: 5, name: "Mon Profil", icon: FiUser, path: "/medecin/profile" },
    ];

    const path = usePathname();

    useEffect(() => {
        if (user) GetFormList();
    }, [user]);

    const GetFormList = async () => {
        if (!user?.primaryEmailAddress?.emailAddress) return;

        setLoading(true);
        try {
            const response = await fetch("/api/form-list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: user.primaryEmailAddress.emailAddress }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des formulaires");
            }

            const { forms } = await response.json();
            setFormCount(forms.length);
            setFormCountPerc((forms.length / 3) * 100);
        } catch (error) {
            console.error("Error fetching form list:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Bouton Menu pour mobile */}
            <button
                className="md:hidden p-3 text-[#0E8B8B] fixed top-4 left-4 z-50 bg-white shadow-md rounded-full hover:bg-[#D2E8E8] transition-all duration-300"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FiMenu className="h-6 w-6" />
            </button>

            {/* Overlay pour mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar principale */}
            <div
                className={`
                    fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg border-r border-[#D2E8E8] p-5 flex flex-col justify-between
                    transition-all duration-300 ease-in-out z-40 md:z-10 rounded-r-lg
                    ${isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-56 lg:w-64 md:translate-x-0"}
                `}
            >
                <div>
                    <h2 className="text-xl font-bold text-[#0E8B8B] mb-6">Dashboard</h2>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-4">
                        {menuList.map((menu) => (
                            <Link
  href={menu.path}
  key={menu.id}
  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
    ${
      (menu.path === "/dashboard" && path === "/medecin") || path === menu.path
        ? "bg-[#A0D755] text-white"
        : "text-[#647788] hover:bg-[#D2E8E8] hover:text-[#0E8B8B]"
    }
    transform hover:-translate-y-1`}
  onClick={() => setIsOpen(false)}
>
  <menu.icon className="text-lg" />
  {menu.name}
</Link>

                        ))}
                    </nav>
                </div>

                {/* Progression */}
                <div className="mb-8 px-2">
                    <h2 className="text-sm mb-2 text-[#647788]">
                        <strong>{loading ? "..." : formCount}</strong> Formulaires créés
                    </h2>
                    <Progress.Root className="overflow-hidden bg-[#D2E8E8] rounded-full h-4">
                        <Progress.Indicator
                            className="bg-gradient-to-r from-[#A0D755] to-[#6DCCE7] h-full transition-all duration-500"
                            style={{ width: `${formCountPerc}%`, minWidth: "10px" }}
                        />
                    </Progress.Root>
                </div>
            </div>
        </>
    );
}

export default SideNav;