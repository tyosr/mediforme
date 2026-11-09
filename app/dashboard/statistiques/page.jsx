import nextDynamic from "next/dynamic"; // Renommé pour éviter les conflits avec 'dynamic'
import { db } from "@/configs";
import { Doctors, JsonForms, UserResponses, Users } from "@/configs/schema";
import { eq, inArray } from "drizzle-orm";
import { format, subDays } from "date-fns";

import StatCard from "@/app/dashboard/_components/StatCard";

// Importation dynamique sans SSR pour les composants graphiques
const AgeGroupBarChart = nextDynamic(() => import("@/app/dashboard/_components/AgeGroupBarChart"), { ssr: false });
const GenderBarChart = nextDynamic(() => import("@/app/dashboard/_components/GenderBarChart"), { ssr: false });
const TopFormsBarChart = nextDynamic(() => import("@/app/dashboard/_components/TopFormsBarChart"), { ssr: false });
const DailyResponsesChart = nextDynamic(() => import("@/app/dashboard/_components/DailyResponsesChart"), { ssr: false });

function normalizeGender(value) {
  if (!value) return null;
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export const dynamic = "force-dynamic"; // Pour forcer le rechargement à chaque accès

export default async function AdminStatsPage() {
  try {
    // Récupérer les utilisateurs avec le rôle 'medecin'
    const medecins = await db
      .select({ clerkId: Users.clerkId, email: Users.email })
      .from(Users)
      .where(eq(Users.role, 'medecin'));

    const doctorEmails = medecins
      .map((m) => m.email?.trim().toLowerCase())
      .filter(Boolean);

    // Récupérer les formulaires créés par les médecins
    const allForms = await db.select().from(JsonForms);
    const forms = allForms.filter(
      (f) =>
        typeof f.createdBy === "string" &&
        doctorEmails.includes(f.createdBy.trim().toLowerCase())
    );
    const formIds = forms.map((f) => f.id);
    const totalForms = forms.length;

    // Récupérer les réponses liées aux formulaires
    const responses = formIds.length
      ? await db
          .select()
          .from(UserResponses)
          .where(inArray(UserResponses.formRef, formIds))
      : [];
    const totalResponses = responses.length;

    // Définir le nombre de patients comme égal au nombre de réponses
    const totalPatients = totalResponses;

    // Traitement des réponses : parsing, calcul âge, genre, patientId
    const parsed = responses.map((r) => {
      try {
        const data = JSON.parse(r.jsonResponse);
        const dob = data.date_naissance ? new Date(data.date_naissance) : null;
        const age =
          dob && !isNaN(dob)
            ? Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
            : null;
        const createdAt = r.createdAt ? new Date(r.createdAt) : null;

        return {
          age,
          gender: data.gender ?? data.sexe ?? null,
          patientId: r.createdBy?.trim().toLowerCase() || "anonyme",
          createdAt,
          formRef: r.formRef,
        };
      } catch (error) {
        return {
          age: null,
          gender: null,
          patientId: r.createdBy?.trim().toLowerCase() || "anonyme",
          createdAt: null,
          formRef: r.formRef,
        };
      }
    });

    // Filtrage des réponses liées aux formulaires valides
    const validFormIds = new Set(formIds);
    const filteredParsed = parsed.filter((r) => validFormIds.has(r.formRef));

    // Statistiques sur les médecins (basées sur la table Users)
    const allDoctors = await db
      .select()
      .from(Users)
      .where(eq(Users.role, 'medecin'));
    const specialities = new Set(
      (await db
        .select({ specialty: Doctors.specialty })
        .from(Doctors)
        .innerJoin(Users, eq(Doctors.userId, Users.clerkId))
        .where(eq(Users.role, 'medecin')))
        .map((d) => d.specialty)
        .filter(Boolean)
    );
    const nbSpecialities = specialities.size;
    const activeDoctors = allDoctors.filter((d) => {
      const doctorDetails = db
        .select({ isActive: Doctors.isActive })
        .from(Doctors)
        .where(eq(Doctors.userId, d.clerkId));
      return doctorDetails.length ? doctorDetails[0].isActive : true;
    }).length;
    const inactiveDoctors = allDoctors.length - activeDoctors;

    // Statistiques par tranches d'âge
   
const ageStats = {
  "0-18": filteredParsed.filter((r) => r.age !== null && r.age <= 18).length,
  "19-35": filteredParsed.filter((r) => r.age > 18 && r.age <= 35).length,
  "36-50": filteredParsed.filter((r) => r.age > 35 && r.age <= 50).length,
  "51+": filteredParsed.filter((r) => r.age > 50).length,
};

    // Statistiques par genre
    const genderStats = {
      homme: filteredParsed.filter((r) => normalizeGender(r.gender) === "homme").length,
      femme: filteredParsed.filter((r) => normalizeGender(r.gender) === "femme").length,
      autre: filteredParsed.filter((r) => {
        const g = normalizeGender(r.gender);
        return g && !["homme", "femme"].includes(g);
      }).length,
      nonRenseigne: filteredParsed.filter((r) => !r.gender).length,
    };

    // Top 5 formulaires utilisés
    const formUsage = filteredParsed.reduce((acc, r) => {
      if (r.formRef) acc[r.formRef] = (acc[r.formRef] || 0) + 1;
      return acc;
    }, {});

    const topForms = Object.entries(formUsage)
      .sort((a, b) => b[1] - a[1])
      .map(([formId, count]) => {
        const form = forms.find((f) => f.id === Number(formId));
        if (!form) return null;

        try {
          const parsedJson = JSON.parse(form.jsonform);
          const title = parsedJson.form_title?.trim() || "Inconnu";
          return { id: form.id, title, count };
        } catch {
          return { id: form.id, title: "Inconnu", count };
        }
      })
      .filter(Boolean)
      .slice(0, 5);

    // Statistiques journalières (15 derniers jours)
    const fifteenDaysAgo = subDays(new Date(), 15);
    const responsesByDay = filteredParsed.reduce((acc, response) => {
      if (
        !response.createdAt ||
        isNaN(response.createdAt.getTime()) ||
        response.createdAt < fifteenDaysAgo
      ) {
        return acc;
      }
      const dayKey = format(response.createdAt, "yyyy-MM-dd");
      acc[dayKey] = (acc[dayKey] || 0) + 1;
      return acc;
    }, {});

    // Générer les données pour chaque jour des 15 derniers jours (inclure les jours sans réponses)
    const dailyData = [];
    for (let i = 0; i <= 15; i++) {
      const day = subDays(new Date(), i);
      const dayKey = format(day, "yyyy-MM-dd");
      dailyData.push({ day: dayKey, count: responsesByDay[dayKey] || 0 });
    }
    dailyData.sort((a, b) => new Date(a.day) - new Date(b.day));

    // Rendu du composant
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-4 mt-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="⚕️ Médecins" value={medecins.length} color="bg-blue-200" />
            <StatCard title="📜 Formulaires" value={totalForms} color="bg-green-200" />
            <StatCard title="📥 Réponses" value={totalResponses} color="bg-yellow-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="👥 Patients" value={totalPatients} color="bg-purple-200" />
            <StatCard title="🧠 Spécialités" value={nbSpecialities} color="bg-orange-200" />
            <StatCard title="✅ Actifs / ❌ Inactifs" value={`${activeDoctors} / ${inactiveDoctors}`} color="bg-teal-200" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 px-1">
          <h2 className="flex-1 text-lg font-semibold text-blue-900">Répartition par tranches d’âge</h2>
          <h2 className="flex-1 text-lg font-semibold text-blue-900">Répartition par sexe</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <AgeGroupBarChart ageGroups={ageStats} />
          </div>
          <div className="flex-1 bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <GenderBarChart genderStats={genderStats} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">Top 5 formulaires utilisés</h2>
            <TopFormsBarChart data={topForms} />
          </div>
          <div className="flex-1 bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">Réponses par jour (15 derniers jours)</h2>
            <DailyResponsesChart data={dailyData} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erreur admin statistiques :", error);
    return (
      <div className="p-6 text-red-600">
        ❌ Une erreur est survenue lors du chargement des statistiques.
      </div>
    );
  }
}