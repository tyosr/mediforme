import { db } from "@/configs";
import { MedicalNotes } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET /api/medical-notes?patientResponseId={id}
export async function GET(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientResponseId = searchParams.get("patientResponseId");

  if (!patientResponseId || isNaN(parseInt(patientResponseId))) {
    return NextResponse.json({ error: "ID de réponse patient invalide" }, { status: 400 });
  }

  try {
    const notes = await db
      .select()
      .from(MedicalNotes)
      .where(eq(MedicalNotes.patientResponseId, parseInt(patientResponseId)));

    return NextResponse.json(notes || []);
  } catch (error) {
    console.error("Erreur lors de la récupération des notes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/medical-notes
export async function POST(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { patientResponseId, diagnosis, medications } = body;

    if (!patientResponseId || isNaN(parseInt(patientResponseId))) {
      return NextResponse.json({ error: "ID de réponse patient invalide" }, { status: 400 });
    }

    const newNote = await db
      .insert(MedicalNotes)
      .values({
        patientResponseId: parseInt(patientResponseId),
        doctorId: userId,
        symptoms: null,
        diagnosis,
        tests: null,
        medications,
      })
      .returning();

    return NextResponse.json(newNote[0]);
  } catch (error) {
    console.error("Erreur lors de la création de la note:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT /api/medical-notes?id={id}
export async function PUT(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ error: "ID de note invalide" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { diagnosis, medications } = body;

    const updatedNote = await db
      .update(MedicalNotes)
      .set({
        symptoms: null,
        diagnosis,
        tests: null,
        medications,
        updatedAt: new Date(),
      })
      .where(eq(MedicalNotes.id, parseInt(id)))
      .returning();

    if (!updatedNote.length) {
      return NextResponse.json({ error: "Note introuvable" }, { status: 404 });
    }

    return NextResponse.json(updatedNote[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la note:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/medical-notes?id={id}
export async function DELETE(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ error: "ID de note invalide" }, { status: 400 });
  }

  try {
    const deletedNote = await db
      .delete(MedicalNotes)
      .where(eq(MedicalNotes.id, parseInt(id)))
      .returning();

    if (!deletedNote.length) {
      return NextResponse.json({ error: "Note introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la note:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}