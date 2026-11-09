'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { FiArrowLeft } from 'react-icons/fi';

export default function EditDoctorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/medecin/${id}`);
        if (!res.ok) throw new Error('Erreur lors du chargement des données');
        const data = await res.json();
        setDoctor(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDoctor();
  }, [id]);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!doctor.firstName || !doctor.lastName) {
      setError('Les champs Prénom et Nom sont obligatoires.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/medecin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctor),
      });

      if (res.ok) {
        router.push('/dashboard/admin?updated=true');
      } else {
        const err = await res.json();
        setError(`Erreur : ${err.message}`);
      }
    } catch (err) {
      setError('Erreur réseau lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0E8B8B]" />
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="max-w-xl mx-auto mt-6 p-6 bg-red-100 border border-red-400 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-[#0E8B8B] flex items-center justify-center gap-2">
          ✏️ Modifier un Médecin
        </h2>
      </div>
      <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full border-t-4 border-b-4 border-[#A0D755]">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-[#647788] mb-1">
              Prénom
            </label>
            <input
              id="firstName"
              name="firstName"
              value={doctor.firstName || ''}
              onChange={handleChange}
              placeholder="Prénom"
              className="w-full p-3 border border-[#D2E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-[#647788]"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-[#647788] mb-1">
              Nom
            </label>
            <input
              id="lastName"
              name="lastName"
              value={doctor.lastName || ''}
              onChange={handleChange}
              placeholder="Nom"
              className="w-full p-3 border border-[#D2E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-[#647788]"
              required
            />
          </div>
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-[#647788] mb-1">
              Spécialité
            </label>
            <input
              id="specialty"
              name="specialty"
              value={doctor.specialty || ''}
              onChange={handleChange}
              placeholder="Spécialité"
              className="w-full p-3 border border-[#D2E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-[#647788]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#647788] mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={doctor.email || ''}
              readOnly
              className="w-full p-3 border border-[#D2E8E8] rounded-lg bg-[#E6F3D2] cursor-not-allowed text-[#647788]"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#647788] mb-1">
              Téléphone
            </label>
            <input
              id="phone"
              name="phone"
              value={doctor.phone || ''}
              onChange={handleChange}
              placeholder="Téléphone"
              className="w-full p-3 border border-[#D2E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-[#647788]"
            />
          </div>
          <div>
            <label htmlFor="isActive" className="block text-sm font-medium text-[#647788] mb-1">
              Statut
            </label>
            <select
              id="isActive"
              name="isActive"
              value={doctor.isActive ? 'true' : 'false'}
              onChange={(e) => setDoctor({ ...doctor, isActive: e.target.value === 'true' })}
              className="w-full p-3 border border-[#D2E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-[#647788]"
            >
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0E8B8B] text-white px-4 py-2 rounded-lg hover:bg-[#A0D755] transition transform hover:-translate-y-1 flex items-center gap-2 disabled:bg-[#0E8B8B]/50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Mettre à jour'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin')}
              className="bg-[#E6F3D2] text-[#0E8B8B] px-4 py-2 rounded-lg hover:bg-[#D2E8E8] transition transform hover:-translate-y-1 flex items-center gap-2"
            >
              <FiArrowLeft className="h-5 w-5" />
              Retour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}