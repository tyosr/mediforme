"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch, FiEdit, FiToggleLeft, FiToggleRight, FiTrash2, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

export default function AdminDoctorTable() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Utilisation de useCallback pour éviter des re-renders inutiles
  const fetchDoctors = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Ajout de paramètres anti-cache pour forcer une requête fraîche
      const res = await fetch(`/api/medecin/all?timestamp=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!res.ok) throw new Error('Erreur réseau');

      const data = await res.json();
      setDoctors(data);
      
      // Apply search filter immediately
      applySearch(data, searchTerm);
    } catch (error) {
      console.error("Erreur lors du chargement des médecins :", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm]);

  // Chargement initial des données
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Vérifier les paramètres d'URL pour d'éventuelles mises à jour
  useEffect(() => {
    if (searchParams?.get('updated') === 'true') {
      fetchDoctors();
      // Utiliser replace pour éviter d'ajouter à l'historique de navigation
      router.replace('/dashboard/admin', { scroll: false });
    }
  }, [searchParams, router, fetchDoctors]);

  // Optimisation de la fonction de recherche avec useCallback
  const applySearch = useCallback((doctorsData, search) => {
    if (!doctorsData || !Array.isArray(doctorsData)) {
      console.error("Les données des médecins ne sont pas un tableau valide:", doctorsData);
      setFilteredDoctors([]);
      return;
    }
    
    if (!search || search.trim() === '') {
      setFilteredDoctors(doctorsData);
      return;
    }
    
    const lower = search.toLowerCase().trim();
    
    const filtered = doctorsData.filter(
      (doc) => {
        if (!doc) return false;
        
        // Search in name fields
        const nameMatch = `${doc.firstName || ''} ${doc.lastName || ''}`.toLowerCase().includes(lower);
        
        // Search in email
        const emailMatch = (doc.email || '').toLowerCase().includes(lower);
        
        // Search in specialty
        const specialtyMatch = (doc.specialty || '').toLowerCase().includes(lower);
        
        // Include if any field matches
        return nameMatch || emailMatch || specialtyMatch;
      }
    );
    
    setFilteredDoctors(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  // Appliquer la recherche quand le terme de recherche ou les données changent
  useEffect(() => {
    applySearch(doctors, searchTerm);
  }, [searchTerm, doctors, applySearch]);

  // Calculer le nombre total de pages avec useMemo
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredDoctors.length / itemsPerPage));
  }, [filteredDoctors.length, itemsPerPage]);

  // Optimiser pour éviter les calculs répétés lors du rendu
  const currentDoctors = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, filteredDoctors, itemsPerPage]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleEdit = useCallback((id) => {
    router.push(`/dashboard/admin/edit-doctor/${id}`);
  }, [router]);

  const toggleStatus = useCallback(async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/medecin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchDoctors();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Erreur lors de la mise à jour du statut.");
      }
    } catch (error) {
      alert("Erreur réseau.");
    }
  }, [fetchDoctors]);

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce médecin ? Cette action est irréversible.')) {
      return;
    }

    try {
      const res = await fetch(`/api/medecin/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        fetchDoctors(); // Refresh the table after deletion
        alert('Médecin supprimé avec succès.');
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Erreur lors de la suppression.');
      }
    } catch (error) {
      alert('Erreur réseau lors de la suppression.');
    }
  }, [fetchDoctors]);
  
  // Fonctions de pagination optimisées
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);
  
  const changeItemsPerPage = useCallback((e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Revenir à la première page lors du changement d'items par page
  }, []);

  // Fonction de rafraîchissement manuel
  const handleRefresh = useCallback(() => {
    fetchDoctors(true);
  }, [fetchDoctors]);

  return (
    <div className="bg-white p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl mt-16 font-bold text-[#0E8B8B]">Liste des Médecins</h2>
        
        {/* Bouton de rafraîchissement */}
        <button 
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="flex items-center gap-2 mt-12 bg-[#E6F3D2] hover:bg-[#D2E8E8] text-[#0E8B8B] px-4 py-2 rounded-lg transition transform hover:-translate-y-1"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          )}
          Rafraîchir
        </button>
      </div>

      {/* Search Section - Single unified search field */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#647788]" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou spécialité..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border border-[#D2E8E8] p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-[#0E8B8B]" />
          <span className="ml-3 text-lg text-[#647788]">Chargement des données...</span>
        </div>
      ) : (
        <>
          {/* Indication du nombre de résultats */}
          <div className="text-sm text-[#647788] mb-2">
            {filteredDoctors.length} médecin(s) trouvé(s)
          </div>
        
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-[#E6F3D2] text-[#647788]">
              <tr>
                <th className="p-4 text-center">Photo</th>
                <th className="p-4 text-center">Nom</th>
                <th className="p-4 text-center">Spécialité</th>
                <th className="p-4 text-center">Email</th>
                <th className="p-4 text-center">Téléphone</th>
                <th className="p-4 text-center">Statut</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDoctors.length > 0 ? (
                currentDoctors.map((doc) => (
                  <tr key={doc.id} className="border-b border-[#D2E8E8] hover:bg-gray-50 transition">
                    <td className="p-4 text-center">
                      {doc.photoUrl ? (
                        <div className="flex justify-center">
                          <img
                            src={doc.photoUrl}
                            alt={`Dr. ${doc.firstName || ''} ${doc.lastName || ''}`}
                            className="w-12 h-12 rounded-full object-cover border border-[#D2E8E8]"
                            loading="lazy" // Lazy loading pour améliorer les performances
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#E6F3D2] flex items-center justify-center text-[#647788]">
                            {doc.firstName && doc.firstName[0] || doc.lastName && doc.lastName[0] || '?'}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {doc.firstName || doc.lastName
                        ? `${doc.firstName || ''} ${doc.lastName || ''}`
                        : 'Profil incomplet'}
                    </td>
                    <td className="p-4 text-center">{doc.specialty || '--'}</td>
                    <td className="p-4 text-center">{doc.email}</td>
                    <td className="p-4 text-center">{doc.phone || '--'}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-semibold ${
                            doc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {doc.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(doc.id)}
                          className="bg-[#0E8B8B] text-white px-3 py-1.5 rounded-lg hover:bg-[#A0D755] transition transform hover:-translate-y-1 flex items-center gap-1"
                        >
                          <FiEdit className="h-4 w-4" />
                          Modifier
                        </button>
                        <button
                          onClick={() => toggleStatus(doc.id, doc.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-white flex items-center gap-1 transition ${
                            doc.isActive
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-green-500 hover:bg-green-600'
                          } transform hover:-translate-y-1`}
                        >
                          {doc.isActive ? (
                            <>
                              <FiToggleLeft className="h-4 w-4" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <FiToggleRight className="h-4 w-4" />
                              Activer
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition transform hover:-translate-y-1 flex items-center gap-1"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-[#647788]">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-16 h-16 mb-3 text-[#D2E8E8]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 17v-6h6v6m-3-6v6m-9 4h18M3 3h18v18H3V3z"
                        />
                      </svg>
                      <p className="text-xl font-medium mb-1">Aucun médecin trouvé</p>
                      <p className="text-[#647788]">
                        {searchTerm ? "Essayez de modifier vos critères de recherche" : "Aucun médecin n'est enregistré dans le système"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {filteredDoctors.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[#647788]">Afficher</span>
                <select 
                  value={itemsPerPage} 
                  onChange={changeItemsPerPage}
                  className="border border-[#D2E8E8] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#A0D755]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-[#647788]">par page</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={goToPreviousPage} 
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border border-[#D2E8E8] ${currentPage === 1 ? 'bg-[#E6F3D2] text-[#647788] cursor-not-allowed' : 'bg-white text-[#0E8B8B] hover:bg-[#E6F3D2]'}`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <span className="mx-2 text-[#647788]">
                  Page {currentPage} sur {totalPages}
                </span>
                <button 
                  onClick={goToNextPage} 
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border border-[#D2E8E8] ${currentPage === totalPages ? 'bg-[#E6F3D2] text-[#647788] cursor-not-allowed' : 'bg-white text-[#0E8B8B] hover:bg-[#E6F3D2]'}`}
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}