//dossier patient
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileIcon, FileImageIcon, FileSpreadsheet, FileText, Trash2, Edit2, Printer } from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

const DossierMedicalPage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [dossiers, setDossiers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [editDocument, setEditDocument] = useState(null);
  const [editDossier, setEditDossier] = useState(null);
  const [editDossierData, setEditDossierData] = useState({});
  const [newNote, setNewNote] = useState({
    diagnosis: "",
    medications: "",
  });
  const [newDocument, setNewDocument] = useState({
    file: null,
    fileUrl: "",
    fileName: "",
  });
  const [error, setError] = useState(null);
  // State for custom confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const dossierRes = await fetch(`/api/dossier-patient?id=${id}`);
        if (!dossierRes.ok) {
          throw new Error("Erreur lors de la récupération du dossier patient");
        }
        const dossierData = await dossierRes.json();
        setDossiers(Array.isArray(dossierData) ? dossierData : []);

        const notesRes = await fetch(`/api/medical-notes?patientResponseId=${id}`);
        if (!notesRes.ok) {
          throw new Error("Erreur lors de la récupération des notes");
        }
        const notesData = await notesRes.json();
        setNotes(Array.isArray(notesData) ? notesData : []);

        const documentsRes = await fetch(`/api/medecin/files?patientResponseId=${id}`);
        if (!documentsRes.ok) {
          if (documentsRes.status === 404) {
            setDocuments([]);
          } else {
            const text = await documentsRes.text();
            throw new Error(`Erreur lors de la récupération des documents: ${text || documentsRes.statusText}`);
          }
        } else {
          const documentsData = await documentsRes.json();
          setDocuments(Array.isArray(documentsData) ? documentsData : []);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(err.message || "Erreur lors du chargement des données");
        setDossiers([]);
        setNotes([]);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, refreshTrigger, user]);

  const getFileIcon = (fileName) => {
    if (!fileName) return <FileIcon className="inline mr-1" size={18} />;
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="inline mr-1" size={18} color="#1D6F42" />;
      case 'pdf':
        return <FileText className="inline mr-1" size={18} color="#FF0000" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImageIcon className="inline mr-1" size={18} color="#2563EB" />;
      default:
        return <FileIcon className="inline mr-1" size={18} />;
    }
  };

  const isImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.match(/\.(jpeg|jpg|gif|png)$/i) !== null;
  };

  const isUrl = (value) => {
    if (!value || typeof value !== 'string') return false;
    return value.startsWith('/uploads/') || value.startsWith('http');
  };

  const formatFileContent = (value) => {
    if (!value || typeof value !== 'string') return value;

    const fileName = value.split('/').pop();
    const extension = fileName.split('.').pop().toLowerCase();

    const openInNewWindow = () => {
      const win = window.open('', '_blank');
      win.document.write(`
        <html>
          <head>
            <title>${fileName}</title>
          </head>
          <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#f0f0f0;">
            ${
              ['jpg', 'jpeg', 'png', 'gif'].includes(extension)
                ? `<img src="${value}" alt="${fileName}" style="max-width:100%; max-height:100%;" />`
                : `<iframe src="${value}" style="width:100%; height:100%; border:none;"></iframe>`
            }
          </body>
        </html>
      `);
      win.document.close();
    };

    if (isUrl(value)) {
      return (
        <div className="mt-2">
          <button
            onClick={openInNewWindow}
            className="inline-flex items-center px-3 py-1.5 bg-[#D2E8E8] text-[#0E8B8B] rounded-md hover:bg-[#A0D755] hover:text-white transition-all duration-300"
          >
            {getFileIcon(fileName)}
            <span className="ml-2">{fileName}</span>
          </button>
        </div>
      );
    }

    if (value.includes('fakepath') || value.includes('\\') || value.includes('/')) {
      return (
        <span className="flex items-center mt-2">
          <span className="inline-flex items-center px-2 py-1 bg-[#D2E8E8] text-[#0E8B8B] rounded">
            {getFileIcon(fileName)}
            {fileName}
          </span>
        </span>
      );
    }

    return value;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handlePrintNote = (note) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Impression Note Médicale</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #0E8B8B; }
            p { margin: 10px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Note Médicale</h2>
          <p><span class="label">Date:</span> ${formatDate(note.createdAt)}</p>
          ${note.diagnosis ? `<p><span class="label">Diagnostic:</span> ${note.diagnosis}</p>` : ''}
          ${note.medications ? `<p><span class="label">Médicaments:</span> ${note.medications}</p>` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

 const handlePrintDocument = (document) => {
  if (!document.fileUrl) {
    console.error("Erreur : Aucun URL de fichier fourni pour l'impression");
    alert("Erreur : Aucun fichier disponible pour l'impression.");
    return;
  }

  try {
    const extension = document.fileName?.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
    const isPdf = extension === 'pdf';

    if (isImage) {
      // Pour les images, créer une page HTML avec l'image et déclencher l'impression
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Impression du document</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { max-width: 100%; max-height: 100%; }
            </style>
          </head>
          <body>
            <img src="${document.fileUrl}" alt="${document.fileName}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    } else if (isPdf) {
      // Pour les PDFs, ouvrir dans un nouvel onglet et laisser l'utilisateur déclencher l'impression
      const printWindow = window.open(document.fileUrl, '_blank');
      if (!printWindow) {
        throw new Error("Impossible d'ouvrir le document PDF.");
      }
      printWindow.focus();
      // Note : print() peut ne pas fonctionner pour les PDFs dans certains navigateurs
      // L'utilisateur devra peut-être déclencher l'impression manuellement
    } else {
      // Pour les autres types de fichiers, ouvrir le fichier et informer l'utilisateur
      window.open(document.fileUrl, '_blank');
      alert("Ce type de fichier ne peut pas être imprimé directement. Veuillez l'ouvrir et utiliser l'option d'impression du visualiseur.");
    }
  } catch (err) {
    console.error("Erreur lors de l'impression du document:", err);
    alert("Une erreur est survenue lors de l'impression : " + err.message);
  }
};

  const handleEditDossier = (dossier) => {
    setEditDossier(dossier);
    setEditDossierData(dossier.json);
  };

  const handleSaveDossier = async () => {
    if (!editDossier) return;

    try {
      const response = await fetch(`/api/dossier-patient?id=${editDossier.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonResponse: editDossierData }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Mise à jour réussie:", data);

      setRefreshTrigger((prev) => prev + 1);
      setEditDossier(null);
      setEditDossierData({});
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError(err.message || "Une erreur est survenue lors de la mise à jour");
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.diagnosis && !newNote.medications) {
      setError("Veuillez remplir au moins un champ");
      return;
    }

    try {
      let response;
      if (editNote) {
        response = await fetch(`/api/medical-notes?id=${editNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNote),
        });
      } else {
        response = await fetch("/api/medical-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientResponseId: id, ...newNote }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'enregistrement de la note");
      }

      setRefreshTrigger((prev) => prev + 1);
      setShowNoteForm(false);
      setEditNote(null);
      setNewNote({ diagnosis: "", medications: "" });
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
    }
  };

  const handleEditNote = (note) => {
    setEditNote(note);
    setNewNote({
      diagnosis: note.diagnosis || "",
      medications: note.medications || "",
    });
    setShowNoteForm(true);
  };

  const handleDeleteNote = async (noteId) => {
    setConfirmMessage("❗️ Voulez-vous vraiment supprimer cette note ?");
    setConfirmAction(() => async () => {
      try {
        const response = await fetch(`/api/medical-notes?id=${noteId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la suppression de la note");
        }

        setRefreshTrigger((prev) => prev + 1);
        setShowConfirmModal(false);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    if (!newDocument.file && !editDocument) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    const formData = new FormData();
    formData.append("patientResponseId", id);
    if (newDocument.file) {
      formData.append("file", newDocument.file);
    }

    try {
      let response;
      if (editDocument) {
        response = await fetch(`/api/medecin/files?id=${editDocument.id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        response = await fetch("/api/medecin/files", {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'enregistrement du document");
      }

      setRefreshTrigger((prev) => prev + 1);
      setShowDocumentForm(false);
      setEditDocument(null);
      setNewDocument({ file: null, fileUrl: "", fileName: "" });
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
    }
  };

  const handleEditDocument = (document) => {
    setEditDocument(document);
    setNewDocument({
      file: null,
      fileUrl: document.fileUrl || "",
      fileName: document.fileName || "",
    });
    setShowDocumentForm(true);
  };

  const handleDeleteDocument = async (documentId) => {
    setConfirmMessage("❗️ Voulez-vous vraiment supprimer ce document ?");
    setConfirmAction(() => async () => {
      try {
        const response = await fetch(`/api/medecin/files?id=${documentId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la suppression du document");
        }

        setRefreshTrigger((prev) => prev + 1);
        setShowConfirmModal(false);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction();
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage("");
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 mt-16 text-[#0E8B8B] flex items-center gap-2">
        📁 Dossier médical du patient
      </h1>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-[#647788] mb-6">{confirmMessage}</p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleConfirm}
                className="bg-[#0E8B8B] text-white px-4 py-2 rounded-lg hover:bg-[#A0D755] transition-all duration-300"
              >
                Confirmer
              </button>
              <button
                onClick={handleCancelConfirm}
                className="bg-[#D2E8E8] text-[#0E8B8B] px-4 py-2 rounded-lg hover:bg-[#6DCCE7] hover:text-white transition-all duration-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {Array.isArray(dossiers) && dossiers.length > 0 ? (
        <div className="mb-8">
          {dossiers.map((entry, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-t-[#A0D755] hover:shadow-xl transition-all duration-300">
              {editDossier && editDossier.id === entry.id ? (
                <div className="mb-6 p-4 bg-[#E6F3D2] rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-[#0E8B8B]">Modifier les coordonnées</h3>
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    {Object.entries(editDossierData).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-[#647788]">
                          {key.replace(/_/g, " ")}
                        </label>
                        <input
                          type="text"
                          value={value || ""}
                          onChange={(e) =>
                            setEditDossierData({ ...editDossierData, [key]: e.target.value })
                          }
                          className="w-full p-3 border border-[#D2E8E8] rounded-lg bg-white text-[#647788] focus:outline-none focus:ring-2 focus:ring-[#A0D755]"
                        />
                      </div>
                    ))}
                    <div className="flex gap-4">
                      <button
                        onClick={handleSaveDossier}
                        className="bg-[#0E8B8B] text-white px-6 py-2 rounded-lg hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={() => {
                          setEditDossier(null);
                          setEditDossierData({});
                          setError(null);
                        }}
                        className="bg-[#D2E8E8] text-[#0E8B8B] px-6 py-2 rounded-lg hover:bg-[#6DCCE7] hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#647788] mb-4">
                    Date : {formatDate(entry.createdAt)}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ul className="space-y-3">
                      {Object.entries(entry.json)
                        .slice(0, Math.ceil(Object.entries(entry.json).length / 2))
                        .map(([key, value]) => (
                          <li key={key} className="flex flex-col">
                            <span className="font-medium text-[#0E8B8B]">{key.replace(/_/g, " ")}:</span>
                            <div className="ml-4 text-[#647788]">
                              {Array.isArray(value)
                                ? value.map((item, i) => (
                                    <div key={i} className="mb-2">{formatFileContent(item)}</div>
                                  ))
                                : formatFileContent(value)}
                            </div>
                          </li>
                        ))}
                    </ul>
                    <ul className="space-y-3">
                      {Object.entries(entry.json)
                        .slice(Math.ceil(Object.entries(entry.json).length / 2))
                        .map(([key, value]) => (
                          <li key={key} className="flex flex-col">
                            <span className="font-medium text-[#0E8B8B]">{key.replace(/_/g, " ")}:</span>
                            <div className="ml-4 text-[#647788]">
                              {Array.isArray(value)
                                ? value.map((item, i) => (
                                    <div key={i} className="mb-2">{formatFileContent(item)}</div>
                                  ))
                                : formatFileContent(value)}
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                  {entry.fileUrl && (
                    <div className="mt-4">
                      <h3 className="font-medium text-[#0E8B8B] mb-2">📄 Fichier joint :</h3>
                      {isImageUrl(entry.fileUrl) ? (
                        <Image
                          src={entry.fileUrl}
                          alt="Fichier joint"
                          width={400}
                          height={300}
                          className="rounded-lg max-w-full object-contain"
                        />
                      ) : (
                        <a
                          href={entry.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-[#D2E8E8] text-[#0E8B8B] rounded-md hover:bg-[#A0D755] hover:text-white transition-all duration-300"
                        >
                          {getFileIcon(entry.fileUrl)}
                          <span>Voir le fichier joint</span>
                        </a>
                      )}
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      onClick={() => handleEditDossier(entry)}
                      className="bg-[#0E8B8B] text-white px-4 py-2 rounded-lg hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Modifier
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#647788] mb-8">Aucun dossier disponible.</p>
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-t-[#A0D755] mb-8">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-[#0E8B8B]">Notes</h2>
    <button
      onClick={() => setShowNoteForm(true)}
      className="bg-[#0E8B8B] text-white px-4 py-2 rounded-lg hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
    >
      <span>Ajouter une note</span>
    </button>
  </div>

  {showNoteForm && (
    <div className="mb-6 p-4 bg-[#E6F3D2] rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-[#0E8B8B]">
        {editNote ? "Modifier la note" : "Nouvelle note"}
      </h3>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#647788]">Diagnostic</label>
          <textarea
            value={newNote.diagnosis}
            onChange={(e) => setNewNote({ ...newNote, diagnosis: e.target.value })}
            className="w-full p-3 border border-[#D2E8E8] rounded-lg bg-white text-[#647788] focus:outline-none focus:ring-2 focus:ring-[#A0D755]"
            rows="4"
            placeholder="Entrez le diagnostic..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#647788]">Médicaments/Dose</label>
          <textarea
            value={newNote.medications}
            onChange={(e) => setNewNote({ ...newNote, medications: e.target.value })}
            className="w-full p-3 border border-[#D2E8E8] rounded-lg bg-white text-[#647788] focus:outline-none focus:ring-2 focus:ring-[#A0D755]"
            rows="4"
            placeholder="Entrez les médicaments et doses..."
          />
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSaveNote}
            className="bg-[#0E8B8B] text-white px-6 py-2 rounded-lg hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1"
          >
            Enregistrer
          </button>
          <button
            onClick={() => {
              setShowNoteForm(false);
              setEditNote(null);
              setNewNote({ diagnosis: "", medications: "" });
              setError(null);
            }}
            className="bg-[#D2E8E8] text-[#0E8B8B] px-6 py-2 rounded-lg hover:bg-[#6DCCE7] hover:text-white transition-all duration-300 transform hover:-translate-y-1"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )}

  {notes.length === 0 ? (
    <p className="text-[#647788]">Aucune note disponible.</p>
  ) : (
<div 
  className="overflow-x-auto flex space-x-4 pb-4 snap-x snap-mandatory"
  style={{
    scrollbarWidth: 'thin',
    scrollbarColor: '#0E8B8B #D2E8E8'
  }}
>        {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white p-4 rounded-lg shadow-md border-t-2 border-t-[#A0D755] hover:shadow-lg transition-all duration-300 min-w-[280px] snap-center"
        >
          <p className="text-sm text-[#647788] mb-2">
            Date: {formatDate(note.createdAt)}
          </p>
          <ul className="space-y-2">
            {note.diagnosis && (
              <li className="text-[#647788]">
                <span className="font-medium text-[#0E8B8B]">Diagnostic:</span>
                <p className="ml-2">{truncateText(note.diagnosis)}</p>
              </li>
            )}
            {note.medications && (
              <li className="text-[#647788]">
                <span className="font-medium text-[#0E8B8B]">Médicaments:</span>
                <p className="ml-2">{truncateText(note.medications)}</p>
              </li>
            )}
          </ul>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleEditNote(note)}
              className="flex-1 bg-[#0E8B8B] text-white px-3 py-1 rounded-lg hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1 text-sm"
            >
              Modifier
            </button>
            <button
              onClick={() => handlePrintNote(note)}
              className="bg-[#D2E8E8] text-[#0E8B8B] p-1 rounded-lg hover:bg-[#6DCCE7] hover:text-white transition-all duration-300 transform hover:-translate-y-1"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={() => handleDeleteNote(note.id)}
              className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-t-[#A0D755]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#0E8B8B]">Documents Annexes</h2>
          <button
            onClick={() => {
              setShowDocumentForm(true);
              setEditDocument(null);
            }}
            className="bg-[#0E8B8B] text-white px-4 py-2 rounded-lg hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
          >
            <span>Ajouter un document</span>
          </button>
        </div>

        {showDocumentForm && (
          <div className="mb-6 p-4 bg-[#E6F3D2] rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-[#0E8B8B]">
              {editDocument ? "Modifier le document" : "Nouveau document"}
            </h3>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSaveDocument}>
              <div>
                <label className="block text-sm font-medium text-[#647788]">Document</label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.csv,.txt"
                  onChange={(e) => setNewDocument({ ...newDocument, file: e.target.files[0] })}
                  className="w-full p-3 border border-[#D2E8E8] rounded-lg bg-white text-[#647788]"
                  required={!editDocument}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-[#0E8B8B] text-white px-6 py-2 rounded-lg hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDocumentForm(false);
                    setEditDocument(null);
                    setNewDocument({ file: null, fileUrl: "", fileName: "" });
                    setError(null);
                  }}
                  className="bg-[#D2E8E8] text-[#0E8B8B] px-6 py-2 rounded-lg hover:bg-[#6DCCE7] hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {documents.length === 0 ? (
          <p className="text-[#647788]">Aucun document disponible.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <div
                key={document.id}
                className="bg-white p-4 rounded-lg shadow-md border-t-2 border-t-[#A0D755] hover:shadow-lg transition-all duration-300"
              >
                <p className="text-sm text-[#647788] mb-2">
                  Date: {formatDate(document.createdAt)}
                </p>
                <div>
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-[#D2E8E8] text-[#0E8B8B] rounded-md hover:bg-[#A0D755] hover:text-white transition-all duration-300 truncate w-full"
                  >
                    {getFileIcon(document.fileName)}
                    <span className="truncate">{truncateText(document.fileName, 20)}</span>
                  </a>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handlePrintDocument(document)}
                    className="flex-1 bg-[#D2E8E8] text-[#0E8B8B] p-1 rounded-lg hover:bg-[#6DCCE7] hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Printer size={16} className="mx-auto" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    className="flex-1 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Trash2 size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DossierMedicalPage;