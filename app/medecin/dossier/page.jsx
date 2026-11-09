"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function PatientListPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/patients");
        
        if (!res.ok) {
          throw new Error(`Erreur lors de la récupération des patients: ${res.status}`);
        }
        
        const data = await res.json();
        setPatients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="animate-spin mr-2" /> Chargement des patients...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Une erreur est survenue: {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Liste des patients</h1>
      
      {patients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {patients.map(patient => (
            <Link 
              key={patient.id} 
              href={`/medecin/dossier/${patient.userId}`}
              className="block border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-lg">
                {patient.firstName} {patient.lastName}
              </div>
              <div className="text-gray-500 text-sm mt-1">{patient.email}</div>
              {patient.phone && (
                <div className="text-gray-500 text-sm">{patient.phone}</div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Aucun patient trouvé.</p>
      )}
    </div>
  );
}