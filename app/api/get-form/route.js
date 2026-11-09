import { db } from "@/configs";
import { JsonForms } from "@/configs/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { formId, email } = await request.json();
    if (!formId || !email) {
      return NextResponse.json({ error: "Form ID and email required" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(JsonForms)
      .where(
        and(
          eq(JsonForms.id, formId),
          eq(JsonForms.createdBy, email)
        )
      );

    if (result.length > 0) {
      return NextResponse.json({ form: result[0] });
    } else {
      return NextResponse.json({ form: null });
    }
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}