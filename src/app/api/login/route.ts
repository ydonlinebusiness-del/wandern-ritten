import { NextResponse } from "next/server";
import { SESSION_COOKIE, checkPassword, sessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const from = String(form.get("from") ?? "/");

  if (!checkPassword(password)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "1");
    if (from) url.searchParams.set("from", from);
    return NextResponse.redirect(url, { status: 303 });
  }

  const res = NextResponse.redirect(new URL(from || "/", req.url), { status: 303 });
  res.cookies.set(SESSION_COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 Tage
  });
  return res;
}
