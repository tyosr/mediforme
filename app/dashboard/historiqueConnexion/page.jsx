"use client";
import { useEffect, useState, useCallback } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { Loader2 } from "lucide-react";

export default function HistoriqueConnexionPage() {
  const [logins, setLogins] = useState([]);
  const [filteredLogins, setFilteredLogins] = useState([]);
  const [error, setError] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [dateFilterType, setDateFilterType] = useState("loginTime");
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchLoginLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/get-login-logs?t=${new Date().getTime()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
      
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Données reçues à 11:34 PM CET, May 24, 2025:", data);
      
      const logData = Array.isArray(data) ? data : [];
      const sortedData = logData.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
      setLogins([...sortedData]);
      setFilteredLogins([...sortedData]);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setLogins([]);
      setFilteredLogins([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoginLogs();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("refresh") === "true") {
      fetchLoginLogs();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const eventSource = new EventSource("/api/stream-login-logs");
    eventSource.onmessage = (event) => {
      try {
        const newLogs = JSON.parse(event.data);
        console.log("Données SSE reçues à 11:34 PM CET, May 24, 2025:", newLogs);
        setLogins([...newLogs.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime))]);
        setFilteredLogins([...newLogs.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime))]);
      } catch (error) {
        console.error("Erreur parsing SSE:", error);
      }
    };
    eventSource.onerror = () => {
      console.error("Erreur SSE, retour à l'intervalle");
      eventSource.close();
      const interval = setInterval(fetchLoginLogs, 5000);
      return () => clearInterval(interval);
    };
    return () => eventSource.close();
  }, [fetchLoginLogs]);

  const filterResults = useCallback(() => {
    let results = [...logins];
    
    if (searchEmail) {
      results = results.filter(log => 
        log.email && log.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }
    
    if (searchDate) {
      results = results.filter(log => {
        const dateField = dateFilterType === "accountCreatedAt" ? log.accountCreatedAt : log.loginTime;
        
        if (!dateField) return false;
        
        const date = new Date(dateField);
        if (isNaN(date.getTime())) return false;
        
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        
        return formattedDate === searchDate;
      });
    }
    
    console.log("Logs filtrés à 11:34 PM CET, May 24, 2025:", results);
    setFilteredLogins([...results]);
    setCurrentPage(1);
  }, [logins, searchEmail, searchDate, dateFilterType]);

  useEffect(() => {
    filterResults();
  }, [searchEmail, searchDate, dateFilterType, logins, filterResults]);

  const formatIpAddress = (ip) => {
    if (!ip) return "N/A";
    if (ip === "::1") return "127.0.0.1";
    if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
    return ip;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Heure invalide";
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
  };

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, "");
    
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    
    if (value.length > 4) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}/${value.substring(4)}`;
    } else if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    
    setSearchDate(value);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogins.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRefresh = () => {
    fetchLoginLogs();
  };

  return (
    <div className="bg-white p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold mt-16 text-[#0E8B8B] flex items-center gap-2">
          📜 Historique de Connexion des Médecins
        </h1>
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#E6F3D2] hover:bg-[#D2E8E8] text-[#0E8B8B] px-4 py-2 rounded-lg transition transform hover:-translate-y-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FiRefreshCw className="h-4 w-4" />
          )}
          Rafraîchir
        </button>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="searchEmail" className="block text-sm font-medium text-[#647788] mb-1">
            Recherche par email
          </label>
          <input
            type="text"
            id="searchEmail"
            className="w-full p-3 border border-[#D2E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-[#647788]"
            placeholder="Entrez un email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="searchDate" className="block text-sm font-medium text-[#647788] mb-1">
            Recherche par date
          </label>
          <div className="flex space-x-2">
            <select 
              className="border border-[#D2E8E8] rounded p-3 text-[#647788] focus:outline-none focus:ring-2 focus:ring-[#A0D755]"
              value={dateFilterType}
              onChange={(e) => setDateFilterType(e.target.value)}
            >
              <option value="loginTime">Date de connexion</option>
              <option value="accountCreatedAt">Date de création</option>
            </select>
            <input
              type="text"
              id="searchDate"
              className="flex-1 p-3 border border-[#D2E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0D755] text-[#647788]"
              placeholder="JJ/MM/AAAA"
              value={searchDate}
              onChange={handleDateChange}
              maxLength="10"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isLoading && logins.length === 0 ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-[#0E8B8B]" />
          <span className="ml-3 text-lg text-[#647788]">Chargement des données...</span>
        </div>
      ) : (
        <>
          <div className="text-sm text-[#647788] mb-2">
            {filteredLogins.length} résultat(s) trouvé(s)
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-[0_4px_10px_rgba(160,215,85,0.5)]">
              <thead className="bg-[#E6F3D2] text-[#647788]">
                <tr>
                  <th className="p-4 text-center">Email</th>
                  <th className="p-4 text-center">Date de création du compte</th>
                  <th className="p-4 text-center">Date de connexion</th>
                  <th className="p-4 text-center">Heure de connexion</th>
                  <th className="p-4 text-center">IP</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-[#647788]">
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
                        <p className="text-xl font-medium mb-1">Aucune donnée disponible</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((log, index) => (
                    <tr key={log.id || index} className="border-b border-[#D2E8E8] hover:bg-gray-50 transition">
                      <td className="p-4 text-center">{log.email || "N/A"}</td>
                      <td className="p-4 text-center">{formatDate(log.accountCreatedAt)}</td>
                      <td className="p-4 text-center">{formatDate(log.loginTime)}</td>
                      <td className="p-4 text-center">{formatTime(log.loginTime)}</td>
                      <td className="p-4 text-center">{formatIpAddress(log.ipAddress)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredLogins.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[#647788]">Afficher</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
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
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border border-[#D2E8E8] ${currentPage === 1 ? 'bg-[#E6F3D2] text-[#647788] cursor-not-allowed' : 'bg-white text-[#0E8B8B] hover:bg-[#E6F3D2]'}`}
                >
                  ‹
                </button>
                <span className="mx-2 text-[#647788]">
                  Page {currentPage} sur {totalPages}
                </span>
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border border-[#D2E8E8] ${currentPage === totalPages ? 'bg-[#E6F3D2] text-[#647788] cursor-not-allowed' : 'bg-white text-[#0E8B8B] hover:bg-[#E6F3D2]'}`}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}