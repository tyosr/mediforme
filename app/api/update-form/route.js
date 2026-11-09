import { db } from "@/configs";
import { JsonForms } from "@/configs/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { formId, email, jsonform, theme, background, style, requireSignIn } = await request.json();
    if (!formId || !email) {
      return NextResponse.json({ error: "Form ID and email required" }, { status: 400 });
    }

    const updateData = {};
    if (jsonform) updateData.jsonform = JSON.stringify(jsonform);
    if (theme) updateData.theme = theme;
    if (background) updateData.background = background;
    if (style) updateData.style = JSON.stringify(style);
    if (requireSignIn !== undefined) updateData.requireSignIn = requireSignIn;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No data to update" }, { status: 400 });
    }

    const result = await db
      .update(JsonForms)
      .set(updateData)
      .where(
        and(
          eq(JsonForms.id, formId),
          eq(JsonForms.createdBy, email)
        )
      );

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to update form" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}