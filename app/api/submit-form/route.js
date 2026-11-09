import { db } from "@/configs";
import { UserResponses } from "@/configs/schema";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { jsonResponse, fileUrl, formId, userId } = await request.json();
    if (!jsonResponse || !formId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await db.insert(UserResponses).values({
      jsonResponse: JSON.stringify(jsonResponse),
      fileUrl: fileUrl || null,
      createdAt: new Date(),
      formRef: formId,
      createdBy: userId || "",
    });

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error saving form response:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}