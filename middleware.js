import { clerkMiddleware } from "@clerk/nextjs/server";
import { db } from "@/configs";
import { Users, Doctors } from "@/configs/schema";
import { eq } from "drizzle-orm";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = auth();
  if (!userId) return;

  const url = req.nextUrl;

  // Routes publiques
  if (
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up") ||
    url.pathname === "/after-signin" ||
    url.pathname === "/after-signup" ||
    url.pathname === "/inactif"||
    url.pathname === "/api/after-signin"
  ) return;

  const user = await db.select().from(Users).where(eq(Users.clerkId, userId));
  if (user.length === 0) return Response.redirect(new URL("/sign-in", req.url));

  const role = user[0].role;

  if (role === "medecin") {
    const doctor = await db.query.Doctors.findFirst({
      where: (doc, { eq }) => eq(doc.userId, userId),
    });
    if (doctor && !doctor.isActive) return Response.redirect(new URL("/inactif", req.url));
  }

  if (url.pathname.startsWith("/dashboard") && role !== "admin") {
    return Response.redirect(new URL(`/${role}`, req.url));
  }

  if (url.pathname.startsWith("/medecin") && role !== "medecin") {
    return Response.redirect(new URL(`/${role}`, req.url));
  }

  if (role !== "admin" && role !== "medecin") {
    return Response.redirect(new URL("/sign-in", req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
