"use client";
import React, { useState } from "react";
import { FilePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const guidingPrompt = `
Tu es un assistant IA pour les médecins spécialisé dans la création de formulaires médicaux détaillés.

INSTRUCTION CRITIQUE : Tu dois TOUJOURS répondre UNIQUEMENT par un JSON valide, sans aucun texte avant ou après.

OBJECTIF :
- Générer un formulaire médical détaillé adapté à la demande
- Répondre EXCLUSIVEMENT en JSON valide
- INTERDICTION ABSOLUE d'ajouter du texte explicatif

FORMAT OBLIGATOIRE (copier exactement cette structure) :
{
    "form_title": "Formulaire médical pour [spécialité]",
    "form_subheading": "Merci de remplir ce formulaire pour votre consultation.",
    "fields": [
        {
            "name": "nom_patient",
            "label": "Nom du patient",
            "field_type": "text",
            "placeholder": "Entrez le nom du patient",
            "required": true
        },
        {
            "name": "sexe",
            "label": "Sexe",
            "field_type": "select",
            "options": ["Homme", "Femme"],
            "required": false
        },
        {
            "name": "date_naissance",
            "label": "Date de naissance",
            "field_type": "date",
            "placeholder": "JJ/MM/AAAA",
            "required": true
        },
        {
            "name": "telephone",
            "label": "Numéro de téléphone",
            "field_type": "text",
            "placeholder": "Entrez le numéro de téléphone",
            "required": true,
            "pattern": "^\\+?[1-9]\\d{1,14}$"
        },
        {
            "name": "email",
            "label": "Adresse e-mail",
            "field_type": "email",
            "placeholder": "Entrez votre e-mail",
            "required": false
        },
        {
            "name": "carte_cin",
            "label": "Numéro de carte CIN",
            "field_type": "text",
            "placeholder": "Entrez votre numéro de CIN",
            "required": false
        },
        {
            "name": "motif_consultation",
            "label": "Motif de consultation",
            "field_type": "textarea",
            "placeholder": "Décrivez les symptômes ou la raison de la consultation",
            "required": true
        },
        {
            "name": "antecedents_medicaux",
            "label": "Antécédents médicaux",
            "field_type": "checkbox",
            "options": ["Diabète", "Hypertension", "Allergies", "Chirurgies antérieures", "Autres"],
            "required": false
        },
        {
            "name": "diagnostic_file",
            "label": "Joindre un fichier (diagnostic, photo, etc.)",
            "field_type": "file",
            "required": false,
            "accept": ".pdf,.jpg,.png,.xlsx,.doc,.docx"
        }
    ]
}

RÈGLES ABSOLUES :
1. Réponse = JSON uniquement, rien d'autre
2. Le champ "telephone" avec "required": true est OBLIGATOIRE
3. Adapter les champs selon la spécialité (ajouter des champs spécifiques)
4. Garder tous les champs de base + ajouter les champs spécialisés
5. Utiliser des guillemets doubles partout
6. Pas de virgule après le dernier élément

SPECIALITÉS RECONNUES : cardiologie, pédiatrie, dermatologie, neurologie, gastro-entérologie, pneumologie, gynécologie, urologie, orthopédie, psychiatrie, ophtalmologie, ORL, endocrinologie, rhumatologie, oncologie, chirurgie, médecine d'urgence, radiologie, anesthésiologie, médecine du travail, médecine esthétique, nutrition, médecine dentaire, pharmacologie, infectiologie, hématologie, néphrologie, gériatrie, médecine interne, médecine du sport, allergologie
`;

function CreateForm() {
  const [openDialog, setOpenDialog] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useUser();
  const router = useRouter();

  // Liste complète et normalisée des mots-clés médicaux
  const medicalKeywords = [
    "cardio", "cardiolog", "coeur", "cardiaque",
    "neuro", "neurolog", "cerveau", "neurologique",
    "pediatr", "pediat", "enfant", "nourrisson", "bebe", "pédiatrie", "pédiatrique",
    "dermato", "dermatolog", "peau", "cutane", "dermatologie",
    "onco", "oncolog", "cancer", "tumeur", "oncologie",
    "ortho", "orthoped", "os", "fracture", "articulation", "orthopédie",
    "psychiatr", "psycholog", "mental", "depression", "psychiatrie",
    "ophtalmo", "oeil", "yeux", "vision", "vue", "ophtalmologie",
    "gyneco", "gynecolog", "femme", "grossesse", "obstet", "gynécologie",
    "uro", "urolog", "rein", "vessie", "urinaire", "urologie",
    "endocrino", "hormone", "diabete", "thyroide", "endocrinologie",
    "rhumato", "rhumatolog", "arthrite", "arthrose", "rhumatologie",
    "pneumo", "pneumolog", "poumon", "respiratoire", "pneumologie",
    "gastro", "gastroenterolog", "estomac", "digestif", "intestin", "gastro-entérologie",
    "orl", "oreille", "nez", "gorge", "audition", "oto-rhino-laryngologie",
    "anesth", "anesthesi", "anesthesie", "anesthesique", "anesthésiologie",
    "nephro", "nephrolog", "rein", "dialyse", "néphrologie",
    "hemato", "hematolog", "sang", "anemie", "hématologie",
    "chirurg", "operation", "intervention", "operatoire", "chirurgie",
    "urgence", "emergency", "secours", "médecine d'urgence",
    "intern", "interne", "generale", "médecine interne",
    "radio", "radiolog", "imagerie", "scanner", "irm", "radiologie",
    "patho", "patholog", "anatomie", "pathologie",
    "infectio", "infectiolog", "microbe", "virus", "bacterie", "infectiologie",
    "allerg", "allergie", "allergique", "allergologie",
    "geriatr", "geriatrie", "age", "senior", "gériatrie",
    "sport", "sportif", "athlete", "médecine du sport",
    "travail", "professionnel", "occupationnel", "médecine du travail",
    "esthetique", "esthetiq", "beaute", "cosmetique", "médecine esthétique",
    "nutrition", "nutritionnel", "alimentation", "dietetique", "diététique",
    "dentaire", "dent", "bucco", "oral", "orthodontie", "médecine dentaire",
    "pharmacie", "pharmaco", "medicament", "pharmacologie",
    "medical", "medicale", "medecin", "docteur", "santé",
    "sante", "soins", "clinique", "hopital", "patient", "consultation",
    "diagnostic", "diagnost", "maladie", "pathologie", "traitement",
    "therapie", "symptome", "symptom", "antecedent", "historique",
    "vaccin", "vaccination", "immunisation", "laboratoire", "analyse",
    "test", "bilan", "ordonnance", "prescription", "posologie",
    "hospitalisation", "ambulatoire", "externe", "prevention",
    "depistage", "screening", "rehabilitation", "reeducation",
    "kinesitherapie", "therapeutique", "clinique", "epidemiologie",
    "recherche", "etude"
  ];

  // Fonction pour normaliser le texte
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Validation renforcée pour les termes médicaux
  const isMedicalInput = (input) => {
    const normalizedInput = normalizeText(input);
    return medicalKeywords.some((keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return (
        normalizedInput.includes(normalizedKeyword) ||
        normalizedInput.split(" ").some((word) => word.includes(normalizedKeyword))
      );
    });
  };

  // Fonction pour nettoyer et valider la réponse JSON
  const cleanAndValidateJson = (responseString) => {
    console.log("=== DIAGNOSTIC cleanAndValidateJson ===");
    console.log("Réponse brute reçue:", responseString);

    if (!responseString || typeof responseString !== 'string') {
      throw new Error(`Réponse invalide: type ${typeof responseString}`);
    }

    try {
      let cleanedJson = responseString
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/^\s*[\r\n]+/gm, "")
        .trim();

      const jsonStart = cleanedJson.indexOf("{");
      const jsonEnd = cleanedJson.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Aucun JSON trouvé dans la réponse");
      }

      const jsonString = cleanedJson.substring(jsonStart, jsonEnd + 1);
      const parsedJson = JSON.parse(jsonString);

      // Validation des champs obligatoires
      const requiredFields = ['form_title', 'form_subheading', 'fields'];
      const missingFields = requiredFields.filter(field => !parsedJson[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
      }

      if (!Array.isArray(parsedJson.fields)) {
        throw new Error("Le champ 'fields' doit être un tableau");
      }

      // Vérifier et corriger le champ téléphone
      let phoneFieldIndex = parsedJson.fields.findIndex(field => 
        field.name === "telephone" || 
        field.name === "phone" || 
        field.name === "tel" ||
        (field.label && normalizeText(field.label).includes("telephone"))
      );

      const correctPhoneField = {
        name: "telephone",
        label: "Numéro de téléphone",
        field_type: "text",
        placeholder: "Entrez le numéro de téléphone",
        required: true,
        pattern: "^\\+?[1-9]\\d{1,14}$",
      };

      if (phoneFieldIndex !== -1) {
        parsedJson.fields[phoneFieldIndex] = correctPhoneField;
      } else {
        const insertIndex = Math.min(3, parsedJson.fields.length);
        parsedJson.fields.splice(insertIndex, 0, correctPhoneField);
      }

      return parsedJson;

    } catch (error) {
      console.error("❌ Erreur dans cleanAndValidateJson:", error);
      throw new Error(`Parsing JSON échoué: ${error.message}`);
    }
  };

  // Fonction de fallback si l'API échoue
  const getFallbackForm = (userInput) => {
    const specialty = normalizeText(userInput).split(" ")[0] || "médecine générale";
    
    return {
      form_title: `Formulaire médical pour ${specialty}`,
      form_subheading: "Merci de remplir ce formulaire pour votre consultation.",
      fields: [
        {
          name: "nom_patient",
          label: "Nom du patient",
          field_type: "text",
          placeholder: "Entrez le nom du patient",
          required: true
        },
        {
          name: "date_naissance",
          label: "Date de naissance",
          field_type: "date",
          placeholder: "JJ/MM/AAAA",
          required: true
        },
        {
          name: "telephone",
          label: "Numéro de téléphone",
          field_type: "text",
          placeholder: "Entrez le numéro de téléphone",
          required: true,
          pattern: "^\\+?[1-9]\\d{1,14}$"
        },
        {
          name: "email",
          label: "Adresse e-mail",
          field_type: "email",
          placeholder: "Entrez votre e-mail",
          required: false
        },
        {
          name: "motif_consultation",
          label: "Motif de consultation",
          field_type: "textarea",
          placeholder: "Décrivez les symptômes ou la raison de la consultation",
          required: true
        }
      ]
    };
  };

  const onCreateForm = async () => {
    if (!userInput.trim()) {
      setErrorMessage("Erreur : La description du formulaire est vide.");
      return;
    }

    if (!isMedicalInput(userInput)) {
      setErrorMessage(
        "Cette application est spécialisée uniquement dans la création de formulaires médicaux et de santé. Veuillez décrire un formulaire lié au domaine médical (ex: pédiatrie, cardiologie, médecine dentaire, nutrition, etc.)."
      );
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      console.log("=== DÉBUT DE LA GÉNÉRATION ===");
      console.log("Input utilisateur:", userInput);
      
      const prompt = `Générer un formulaire médical pour : ${userInput}\n\n${guidingPrompt}`;
      
      // Première tentative avec l'API generate-form
      console.log("Envoi de la requête à /api/generate-form...");
      let formData = null;
      
      try {
        const geminiResponse = await fetch("/api/generate-form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        console.log("Statut de la réponse:", geminiResponse.status);

        if (geminiResponse.ok) {
          const responseData = await geminiResponse.json();
          console.log("✅ Réponse reçue:", responseData.success ? "Succès" : "Erreur");

          if (responseData.success && responseData.response) {
            // Nettoyer et valider le JSON
            formData = cleanAndValidateJson(responseData.response);
            console.log("✅ JSON validé:", formData.form_title);
          }
        } else {
          console.error("❌ Erreur HTTP:", geminiResponse.status);
          const errorData = await geminiResponse.json();
          console.error("Détails de l'erreur:", errorData);
        }
      } catch (apiError) {
        console.error("❌ Erreur API Gemini:", apiError);
      }

      // Si Gemini a échoué, utiliser le formulaire de fallback
      if (!formData) {
        console.log("🔄 Utilisation du formulaire de fallback");
        formData = getFallbackForm(userInput);
      }

      // Créer le formulaire dans la base de données
      console.log("💾 Création du formulaire en base...");
      const response = await fetch("/api/create-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonform: formData,
          email: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Erreur création formulaire:", errorData);
        throw new Error(`Erreur lors de la création du formulaire: ${response.status}`);
      }

      const { id } = await response.json();
      
      if (id) {
        console.log("✅ Formulaire créé avec l'ID:", id);
        setOpenDialog(false);
        setUserInput("");
        router.push("/edit-form/" + id);
      } else {
        throw new Error("ID du formulaire non retourné");
      }
      
    } catch (error) {
      console.error("❌ ERREUR FINALE:", error);
      setErrorMessage(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={() => setOpenDialog(true)}
        className="bg-[#0E8B8B] hover:bg-[#A0D755] text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all mb-6"
      >
        <FilePlus /> Créer un formulaire
      </Button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-white border border-[#D2E8E8] rounded-lg p-6 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-[#0E8B8B]">
              📝 Créer un nouveau formulaire médical
            </DialogTitle>
            <DialogDescription className="text-sm text-[#647788]">
              Décrivez le type de formulaire médical que vous souhaitez générer.
              <br />
              <span className="text-xs text-gray-500 mt-1 block">
                Exemples : "formulaire pédiatrie", "cardiologie", "médecine dentaire", "nutrition"
              </span>
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
            placeholder="Exemple : Formulaire de consultation pédiatrique détaillé..."
            className="mt-2 border border-[#D2E8E8] focus:ring-2 focus:ring-[#A0D755] rounded-md min-h-[80px]"
          />

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mt-2 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDialog(false);
                setUserInput("");
                setErrorMessage("");
              }}
              className="bg-[#E6F3D2] text-[#0E8B8B] hover:bg-[#D2E8E8] border-[#D2E8E8]"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              disabled={loading || !userInput.trim()}
              onClick={onCreateForm}
              className="bg-[#0E8B8B] hover:bg-[#A0D755] text-white px-5 py-2 rounded-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Génération...
                </>
              ) : (
                "Créer"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateForm;