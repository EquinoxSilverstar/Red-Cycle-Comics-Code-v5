import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  createAdminSessionToken,
  sameOrigin,
  verifyAdminPassword,
} from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }
  const body: unknown = await request.json().catch(() => null);
  const password = body && typeof body === "object" && "password" in body &&
    typeof body.password === "string" ? body.password : "";
  if (!await verifyAdminPassword(password)) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return NextResponse.json({ error: "That password is not correct." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  return response;
}
