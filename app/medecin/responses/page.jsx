"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import ResponseListItem from "./_components/ResponseListItem";
import ReactPaginate from "react-paginate";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";

function Responses() {
  const { user } = useUser();
  const [formList, setFormList] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const formsPerPage = 6;

  useEffect(() => {
    user && GetFormList();
  }, [user]);

  const GetFormList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/form-list-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user?.primaryEmailAddress?.emailAddress }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des formulaires");
      }

      const { forms } = await response.json();

      const parsedResult = forms.map((item) => {
        try {
          const jsonform = JSON.parse(item.jsonform || "{}");
          return {
            ...item,
            jsonform,
            form_title: jsonform?.form_title || "Formulaire sans titre",
            form_subheading: jsonform?.form_subheading || "",
          };
        } catch (parseError) {
          console.error(`Erreur lors de l'analyse du jsonform pour le formulaire ID ${item.id}:`, parseError);
          return {
            ...item,
            jsonform: {},
            form_title: "Formulaire sans titre",
            form_subheading: "",
          };
        }
      });

      setFormList(parsedResult);
      setFilteredForms(parsedResult);
    } catch (error) {
      console.error("Erreur lors de la récupération de la liste des formulaires:", error);
      setError("Échec du chargement des formulaires. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...formList];

    if (searchQuery) {
      filtered = filtered.filter((form) => {
        const title = form.form_title || "";
        const subheading = form.form_subheading || "";
        return (
          title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subheading.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    if (filter !== "all") {
      filtered = filtered.filter((form) => {
        if (filter === "hasResponses") return form.userResponseCount > 0;
        if (filter === "noResponses") return form.userResponseCount === 0;
        return true;
      });
    }

    // CORRECTION: Logique de tri simplifiée mais robuste
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "responses") {
        const aCount = a.userResponseCount || 0;
        const bCount = b.userResponseCount || 0;
        return sortOrder === "asc" ? aCount - bCount : bCount - aCount;
      } else {
        // Tri par date - plus simple et plus robuste
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        
        if (sortOrder === "asc") {
          return aDate - bDate;
        } else {
          return bDate - aDate;
        }
      }
    });

    setFilteredForms(filtered);
    
    // IMPORTANT: Remettre à la première page quand on change le tri/filtre
    setCurrentPage(0);
  }, [searchQuery, filter, sortBy, sortOrder, formList]);

  const pageCount = Math.ceil(filteredForms.length / formsPerPage);
  const offset = currentPage * formsPerPage;
  const currentForms = filteredForms.slice(offset, offset + formsPerPage);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const totalForms = formList.length;
  const totalResponses = formList.reduce(
    (acc, form) => acc + (form.userResponseCount || 0),
    0
  );

  return (
    <div className="min-h-screen p-6 bg-white max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold mt-16 text-3xl text-[#0E8B8B]">Réponses</h2>
        <div className="text-sm mt-16 text-[#647788]">
          <span>Total des formulaires : {totalForms}</span> |{" "}
          <span>Total des réponses : {totalResponses}</span>
        </div>
      </div>

      {isLoading && <p className="text-center text-[#647788]">Chargement...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#647788]" />
              <input
                type="text"
                placeholder="Rechercher des formulaires..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0D755] border-[#D2E8E8]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-[#647788]" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#A0D755] border-[#D2E8E8] text-[#647788]"
              >
                <option value="all">Tous les formulaires</option>
                <option value="hasResponses">Avec réponses</option>
                <option value="noResponses">Sans réponses</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              {sortOrder === "asc" ? <SortAsc className="text-[#647788]" /> : <SortDesc className="text-[#647788]" />}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#A0D755] border-[#D2E8E8] text-[#647788]"
              >
                <option value="createdAt">Trier par date</option>
                <option value="responses">Trier par réponses</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 bg-[#E6F3D2] rounded-lg text-[#0E8B8B] hover:bg-[#A0D755] hover:text-white transition-all duration-300 transform hover:-translate-y-1"
              >
                Inverser l'ordre
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentForms.length > 0 ? (
              currentForms.map((form, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-[#A0D755] border-b-4 border-b-[#A0D755] hover:bg-[#D2E8E8] transition"
                >
                  <h2 className="text-xl font-semibold text-[#0E8B8B]">
                    {form.form_title}
                  </h2>
                  <h3 className="text-sm text-[#647788] mb-2">
                    {form.form_subheading}
                  </h3>
                  <ResponseListItem
                    jsonForm={form.jsonform}
                    responseCount={form.userResponseCount}
                    formId={form.id}
                  />
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-[#647788]">
                Aucun formulaire trouvé.
              </p>
            )}
          </div>

          {pageCount > 1 && (
            <div className="mt-8">
              <ReactPaginate
                previousLabel={"← Précédent"}
                nextLabel={"Suivant →"}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                containerClassName={"flex gap-3 justify-center items-center"}
                pageClassName={"px-4 py-2 border-2 border-[#D2E8E8] rounded-lg text-[#0E8B8B] font-medium hover:border-[#A0D755] transition-all duration-200"}
                activeClassName={"bg-[#A0D755] border-[#A0D755] text-white shadow-md"}
                previousClassName={"px-4 py-2 border-2 border-[#D2E8E8] rounded-lg text-[#0E8B8B] font-medium hover:bg-[#E6F3D2] hover:border-[#A0D755] transition-all duration-200"}
                nextClassName={"px-4 py-2 border-2 border-[#D2E8E8] rounded-lg text-[#0E8B8B] font-medium hover:bg-[#E6F3D2] hover:border-[#A0D755] transition-all duration-200"}
                disabledClassName={"opacity-40 cursor-not-allowed hover:bg-transparent hover:border-[#D2E8E8]"}
                pageLinkClassName={"block w-full h-full hover:text-[#0E8B8B] transition-colors"}
                previousLinkClassName={"block w-full h-full"}
                nextLinkClassName={"block w-full h-full"}
                activeLinkClassName={"text-white"}
                breakClassName={"px-4 py-2 text-[#647788] font-medium"}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Responses;