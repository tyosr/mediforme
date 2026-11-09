const PatientCard = ({ patient }) => {
    console.log("🧑‍⚕️ Données du patient reçues dans PatientCard:", patient);
  
    return (
      <div className="border p-4 rounded-xl shadow-md bg-white">
        <h2 className="text-xl font-semibold">
          {patient.nom_patient || "Patient sans nom"}
        </h2>
        <p><strong>Sexe:</strong> {patient.sexe || "Non spécifié"}</p>
        <p><strong>Date de naissance:</strong> {patient.date_naissance || "Non spécifiée"}</p>
        <p><strong>Téléphone:</strong> {patient.telephone || "Non spécifié"}</p>
        <p><strong>Motif:</strong> {patient.motif_consultation || "Non spécifié"}</p>
      </div>
    );
  };
  
  export default PatientCard;