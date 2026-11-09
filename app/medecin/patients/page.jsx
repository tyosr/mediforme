"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const PatientListPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSexe, setFilterSexe] = useState("tous");
  const [selectedLetter, setSelectedLetter] = useState("tous");
  const [filterDate, setFilterDate] = useState("");

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(10);

  // Générer la liste des lettres de A à Z
  const alphabet = ["tous", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

  useEffect(() => {
    if (user) {
      const fetchPatients = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/medecin/patients?medecinId=${user.id}`);
          if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setPatients(data);
            setFilteredPatients(data);
          } else {
            console.error("Format de réponse inattendu:", data);
            setError("Le serveur a renvoyé un format de données inattendu");
            setPatients([]);
            setFilteredPatients([]);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des patients:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPatients();
    }
  }, [user]);

  // Effet pour appliquer les filtres
  useEffect(() => {
    let result = [...patients];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (patient) =>
          (patient.nom_patient && patient.nom_patient.toLowerCase().includes(term)) ||
          (patient.email && patient.email.toLowerCase().includes(term))
      );
    }

    if (filterSexe !== "tous") {
      result = result.filter((patient) => patient.sexe === filterSexe);
    }

    if (selectedLetter !== "tous") {
      result = result.filter(
        (patient) =>
          patient.nom_patient &&
          patient.nom_patient.toLowerCase().startsWith(selectedLetter.toLowerCase())
      );
    }

    if (filterDate) {
      const selectedDate = new Date(filterDate);
      selectedDate.setHours(0, 0, 0, 0);
      result = result.filter((patient) => {
        if (!patient.createdAt) return false;
        const patientDate = new Date(patient.createdAt);
        patientDate.setHours(0, 0, 0, 0);
        return patientDate.getTime() === selectedDate.getTime();
      });
    }

    setFilteredPatients(result);
  }, [patients, searchTerm, filterSexe, selectedLetter, filterDate]);

  const handleSendEmail = async (patient) => {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: patient.email,
        subject: "⏰ Rappel de rendez-vous médical",
        htmlContent: `<p>Bonjour <strong>${patient.nom_patient}</strong>,<br> Ceci est un rappel pour votre prochain rendez-vous médical. Merci !</p>`,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`✅ Email envoyé à ${patient.nom_patient}`);
    } else {
      alert(`❌ Échec de l'envoi de l'email: ${data.error}`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleLetterFilterChange = (e) => {
    setSelectedLetter(e.target.value);
    setCurrentPage(1);
  };

  const handleSexeFilterChange = (e) => {
    setFilterSexe(e.target.value);
    setCurrentPage(1);
  };

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
    setCurrentPage(1);
  };

  const handlePatientsPerPageChange = (e) => {
    setPatientsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Non spécifié";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0E8B8B]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-white">
        <h1 className="text-2xl font-bold mt-16 mb-4 text-[#0E8B8B]">Liste de mes patients</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>
            <strong>Erreur:</strong> {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-bold mt-16 mb-6 text-[#0E8B8B]">Liste de mes patients</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-t-[#A0D755] border-b-4 border-b-[#A0D755] mb-6">
        {/* Barre de recherche et filtres */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-[#D2E8E8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-[#647788] bg-white"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedLetter}
              onChange={handleLetterFilterChange}
              className="px-4 py-2 border border-[#D2E8E8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-[#647788] bg-white"
            >
              {alphabet.map((letter) => (
                <option key={letter} value={letter}>
                  {letter === "tous" ? "Toutes les lettres" : letter}
                </option>
              ))}
            </select>

            <select
              value={filterSexe}
              onChange={handleSexeFilterChange}
              className="px-4 py-2 border border-[#D2E8E8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-[#647788] bg-white"
            >
              <option value="tous">Tous les patients</option>
              <option value="Homme">Hommes</option>
              <option value="Femme">Femmes</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={handleDateChange}
              placeholder="Filtrer par date de création"
              className="px-4 py-2 border border-[#D2E8E8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-[#647788] bg-white"
            />
          </div>
        </div>

        {patients.length === 0 ? (
          <div className="bg-[#E6F3D2] border border-[#A0D755] text-[#647788] px-4 py-3 rounded">
            <p>Aucun patient trouvé. Vérifiez que:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Des données sont présentes dans la table UserResponses</li>
              <li>Le champ createdBy correspond à votre ID utilisateur Clerk</li>
              <li>Le format JSON des réponses est valide</li>
            </ul>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="bg-[#E6F3D2] border border-[#A0D755] text-[#647788] px-4 py-3 rounded">
            <p>Aucun résultat ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-[#D2E8E8]">
              <thead>
                <tr className="bg-[#E6F3D2]">
                  <th className="border border-[#D2E8E8] px-4 py-2 text-left text-[#0E8B8B] font-semibold">Nom</th>
                  <th className="border border-[#D2E8E8] px-4 py-2 text-left text-[#0E8B8B] font-semibold">Sexe</th>
                  <th className="border border-[#D2E8E8] px-4 py-2 text-left text-[#0E8B8B] font-semibold">Téléphone</th>
                  <th className="border border-[#D2E8E8] px-4 py-2 text-left text-[#0E8B8B] font-semibold">Email</th>
                  <th className="border border-[#D2E8E8] px-4 py-2 text-left text-[#0E8B8B] font-semibold">Date de création</th>
                  <th className="border border-[#D2E8E8] px-4 py-2 text-left text-[#0E8B8B] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient, index) => (
                  <tr key={index} className="hover:bg-[#D2E8E8] transition-all duration-200">
                    <td className="border border-[#D2E8E8] px-4 py-2 text-[#647788]">
                      {patient.nom_patient || "Patient sans nom"}
                    </td>
                    <td className="border border-[#D2E8E8] px-4 py-2 text-[#647788]">
                      {patient.sexe || "Non spécifié"}
                    </td>
                    <td className="border border-[#D2E8E8] px-4 py-2 text-[#647788]">
                      {patient.telephone || "Non spécifié"}
                    </td>
                    <td className="border border-[#D2E8E8] px-4 py-2 text-[#647788]">
                      {patient.email || "Non spécifié"}
                    </td>
                    <td className="border border-[#D2E8E8] px-4 py-2 text-[#647788]">
                      {formatDate(patient.createdAt)}
                    </td>
                    <td className="border border-[#D2E8E8] px-4 py-2">
  <div className="flex gap-x-2">
    <button
      onClick={() => router.push(`/medecin/dossier/${patient.id}`)}
      className="bg-[#0E8B8B] text-white px-3 py-1 rounded hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1"
    >
      📁 Dossier médical
    </button>
    <button
      onClick={() => handleSendEmail(patient)}
      className="bg-[#0E8B8B] text-white px-3 py-1 rounded hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1"
    >
      📧 Rappel de rendez-vous
    </button>
  </div>
</td>

                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-2 text-sm text-[#647788]">
              {filteredPatients.length} patient(s) au total • Page {currentPage} sur {totalPages}
            </div>

            {/* Contrôles de pagination */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <label htmlFor="patientsPerPage" className="mr-2 text-sm text-[#647788]">
                  Patients par page:
                </label>
                <select
                  id="patientsPerPage"
                  value={patientsPerPage}
                  onChange={handlePatientsPerPageChange}
                  className="px-2 py-1 border border-[#D2E8E8] rounded-md text-sm text-[#647788] bg-white focus:outline-none focus:ring-2 focus:ring-[#A0D755]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l border border-[#D2E8E8] ${
                    currentPage === 1
                      ? "bg-[#E6F3D2] text-[#647788] cursor-not-allowed"
                      : "bg-white hover:bg-[#A0D755] hover:text-white transition-all duration-300"
                  }`}
                >
                  « Précédent
                </button>

                <div className="hidden sm:flex">
                  {pageNumbers.length <= 5 ? (
                    pageNumbers.map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 border-t border-b border-[#D2E8E8] ${
                          currentPage === number
                            ? "bg-[#0E8B8B] text-white"
                            : "bg-white hover:bg-[#A0D755] hover:text-white transition-all duration-300"
                        }`}
                      >
                        {number}
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        onClick={() => paginate(1)}
                        className={`px-3 py-1 border-t border-b border-[#D2E8E8] ${
                          currentPage === 1
                            ? "bg-[#0E8B8B] text-white"
                            : "bg-white hover:bg-[#A0D755] hover:text-white transition-all duration-300"
                        }`}
                      >
                        1
                      </button>

                      {currentPage > 3 && (
                        <span className="px-2 py-1 border-t border-b border-[#D2E8E8] bg-white text-[#647788]">
                          ...
                        </span>
                      )}

                      {pageNumbers
                        .filter((number) => number !== 1 && number !== totalPages)
                        .filter((number) => number >= currentPage - 1 && number <= currentPage + 1)
                        .map((number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 border-t border-b border-[#D2E8E8] ${
                              currentPage === number
                                ? "bg-[#0E8B8B] text-white"
                                : "bg-white hover:bg-[#A0D755] hover:text-white transition-all duration-300"
                            }`}
                          >
                            {number}
                          </button>
                        ))}

                      {currentPage < totalPages - 2 && (
                        <span className="px-2 py-1 border-t border-b border-[#D2E8E8] bg-white text-[#647788]">
                          ...
                        </span>
                      )}

                      {totalPages > 1 && (
                        <button
                          onClick={() => paginate(totalPages)}
                          className={`px-3 py-1 border-t border-b border-[#D2E8E8] ${
                            currentPage === totalPages
                              ? "bg-[#0E8B8B] text-white"
                              : "bg-white hover:bg-[#A0D755] hover:text-white transition-all duration-300"
                          }`}
                        >
                          {totalPages}
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="sm:hidden px-3 py-1 border-t border-b border-[#D2E8E8] bg-white text-[#647788]">
                  Page {currentPage} / {totalPages}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 rounded-r border border-[#D2E8E8] ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-[#E6F3D2] text-[#647788] cursor-not-allowed"
                      : "bg-white hover:bg-[#A0D755] hover:text-white transition-all duration-300"
                  }`}
                >
                  Suivant »
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientListPage;