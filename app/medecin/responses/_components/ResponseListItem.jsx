import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

function ResponseListItem({ jsonForm, formId, responseCount }) {
  const [loading, setLoading] = useState(false);

  const handleExportData = async () => {
    try {
      let parsedResponseData = [];
      setLoading(true);
      const response = await fetch("/api/export-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'exportation des données");
      }

      const { responses } = await response.json();
      if (responses) {
        responses.forEach((item) => {
          const jsonItem = JSON.parse(item.jsonResponse || "{}");
          parsedResponseData.push(jsonItem);
        });
        handleExportToExcel(parsedResponseData);
      }
    } catch (error) {
      console.error("Erreur lors de l'exportation des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = (jsonData) => {
    const safeJsonForm = jsonForm || {};
    const title = safeJsonForm.form_title || "Formulaire_Sans_Titre";
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feuille1");
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center">
        <h2>
          <strong>{responseCount}</strong> Réponses
        </h2>
        <Button
  className="text-sm bg-[#0E8B8B] hover:bg-[#0A6B6B] text-white border-0"
  size="sm"
  onClick={handleExportData}
  disabled={loading || !responseCount}
>
  {loading ? <Loader2 className="animate-spin" /> : "Exporter"}
</Button>
      </div>
    </div>
  );
}

export default ResponseListItem;