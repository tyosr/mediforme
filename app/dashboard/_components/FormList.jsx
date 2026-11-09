"use client";
import { useUser } from '@clerk/nextjs';
import FormListItem from './FormListItem';
import React, { useEffect, useState, useCallback } from 'react';

function FormList() {
  const { user } = useUser();
  const [formList, setFormList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalForms, setTotalForms] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [formsPerPage, setFormsPerPage] = useState(8);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useCallback(
    (() => {
      let timeout = null;
      return (searchValue) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setSearchTerm(searchValue);
          setCurrentPage(1);
        }, 500);
      };
    })(),
    []
  );

  const GetFormList = useCallback(async () => {
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
      const parsedForms = forms.map(item => ({
        ...item,
        jsonform: JSON.parse(item.jsonform),
      }));

      let filteredResults = parsedForms;
      if (searchTerm.trim()) {
        filteredResults = parsedForms.filter(form =>
          form.jsonform?.form_title?.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );
      }

      setTotalForms(filteredResults.length);
      const start = (currentPage - 1) * formsPerPage;
      const paginatedResults = filteredResults.slice(start, start + formsPerPage);
      setFormList(paginatedResults);
    } catch (error) {
      console.error('Error fetching form list:', error);
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, searchTerm, formsPerPage]);

  useEffect(() => {
    if (user) {
      GetFormList();
    }
  }, [user, currentPage, searchTerm, formsPerPage, GetFormList]);

  const totalPages = Math.max(1, Math.ceil(totalForms / formsPerPage));

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    items.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`px-4 py-2 rounded-md ${
          currentPage === 1 ? 'bg-[#0E8B8B] text-white' : 'bg-[#E6F3D2] hover:bg-[#D2E8E8] text-[#0E8B8B]'
        }`}
      >
        1
      </button>
    );

    let startPage, endPage;
    if (totalPages <= maxVisiblePages) {
      startPage = 2;
      endPage = totalPages;
    } else {
      const sidePagesToShow = Math.floor((maxVisiblePages - 3) / 2);
      if (currentPage <= sidePagesToShow + 2) {
        startPage = 2;
        endPage = maxVisiblePages - 1;
      } else if (currentPage >= totalPages - sidePagesToShow - 1) {
        startPage = totalPages - maxVisiblePages + 2;
        endPage = totalPages - 1;
      } else {
        startPage = currentPage - sidePagesToShow;
        endPage = currentPage + sidePagesToShow;
      }
    }

    if (startPage > 2) {
      items.push(
        <span key="ellipsis-start" className="px-4 py-2 text-[#647788]">
          ...
        </span>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        items.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-4 py-2 rounded-md ${
              currentPage === i ? 'bg-[#0E8B8B] text-white' : 'bg-[#E6F3D2] hover:bg-[#D2E8E8] text-[#0E8B8B]'
            }`}
          >
            {i}
          </button>
        );
      }
    }

    if (endPage < totalPages - 1) {
      items.push(
        <span key="ellipsis-end" className="px-4 py-2 text-[#647788]">
          ...
        </span>
      );
    }

    if (totalPages > 1) {
      items.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 rounded-md ${
            currentPage === totalPages ? 'bg-[#0E8B8B] text-white' : 'bg-[#E6F3D2] hover:bg-[#D2E8E8] text-[#0E8B8B]'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return items;
  };

  return (
    <div className="mt-5 bg-white p-6 rounded-lg border-t-4 ">
      <div className="mb-4 flex flex-col md:flex-row justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par titre de formulaire"
            className="border border-[#D2E8E8] p-2 rounded-md w-full focus:ring-2 focus:ring-[#A0D755]"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-[#0E8B8B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
        <div className="flex items-center">
          <label htmlFor="formsPerPage" className="mr-2 text-[#647788] whitespace-nowrap">Par page:</label>
          <select
            id="formsPerPage"
            className="border border-[#D2E8E8] p-2 rounded-md focus:ring-2 focus:ring-[#A0D755] text-[#647788]"
            value={formsPerPage}
            onChange={(e) => {
              setFormsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0E8B8B]"></div>
        </div>
      ) : formList.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-[#647788]">Aucun formulaire trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {formList.map((form, index) => (
            <div key={index}>
              <FormListItem
                jsonForm={form.jsonform}
                recordId={form.id}
                refreshData={GetFormList}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-[#647788] text-center">
        {totalForms > 0 && (
          <p>
            Affichage de {(currentPage - 1) * formsPerPage + 1} à {Math.min(currentPage * formsPerPage, totalForms)} sur {totalForms} formulaires
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-md ${
                currentPage === 1 ? 'bg-[#E6F3D2] text-[#647788] cursor-not-allowed' : 'bg-[#E6F3D2] hover:bg-[#D2E8E8] text-[#0E8B8B]'
              }`}
              aria-label="Page précédente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            {generatePaginationItems()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-md ${
                currentPage === totalPages ? 'bg-[#E6F3D2] text-[#647788] cursor-not-allowed' : 'bg-[#E6F3D2] hover:bg-[#D2E8E8] text-[#0E8B8B]'
              }`}
              aria-label="Page suivante"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormList;