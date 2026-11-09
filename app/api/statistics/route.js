import { db } from "@/configs";
import { JsonForms, UserResponses } from "@/configs/schema";
import { eq, count, sql, desc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ error: "Email requis" }, { status: 400 });
        }

        // Récupère le nombre total de formulaires
        const formsResult = await db
            .select({ count: count() })
            .from(JsonForms)
            .where(eq(JsonForms.createdBy, email));
        const totalForms = formsResult[0].count;

        // Récupère tous les IDs de formulaires du médecin
        const doctorForms = await db
            .select({ id: JsonForms.id })
            .from(JsonForms)
            .where(eq(JsonForms.createdBy, email));

        const formIds = doctorForms.map(form => form.id);
        console.log("formIds:", formIds); // <- debug ici

        let totalResponses = 0;
        let responses = [];
        let recentResponses = [];

        if (formIds.length > 0) {
            const countResult = await db
                .select({ count: count() })
                .from(UserResponses)
                .where(inArray(UserResponses.formRef, formIds));

            totalResponses = countResult[0].count;

            responses = await db
                .select({ jsonResponse: UserResponses.jsonResponse, createdAt: UserResponses.createdAt })
                .from(UserResponses)
                .where(inArray(UserResponses.formRef, formIds));

            recentResponses = await db
                .select({
                    id: UserResponses.id,
                    jsonResponse: UserResponses.jsonResponse,
                    createdAt: UserResponses.createdAt
                })
                .from(UserResponses)
                .where(inArray(UserResponses.formRef, formIds))
                .orderBy(desc(UserResponses.createdAt))
                .limit(5);
        }

        return NextResponse.json({
            totalForms,
            formIds,
            totalResponses,
            responses,
            recentResponses
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 });
    }
}
