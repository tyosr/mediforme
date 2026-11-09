"use client";

import { useEffect, useState } from "react";
import { Users } from "@/configs/schema";
import { db } from "@/configs";
import { eq } from "drizzle-orm";

export default function MedecinCountCard() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        const medecins = await db
          .select()
          .from(Users)
          .where(eq(Users.role, "medecin"));

        setCount(medecins.length);
      } catch (error) {
        console.error("Erreur lors de la récupération des médecins :", error);
      }
    };

    fetchMedecins();
  }, []);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md text-center">
      <h2 className="text-xl font-semibold mb-2">Nombre de médecins</h2>
      <p className="text-3xl font-bold text-blue-600">
        {count !== null ? count : "Chargement..."}
      </p>
    </div>
  );
}
