import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db, checkPassword } from "@/server/db";
import { verifyOrigin } from "@/server/auth";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    verifyOrigin(req);
    const { email, password } = z
      .object({
        email: z.email().max(150),
        password: z.string().min(1).max(128),
      })
      .parse(await req.json());
    const key = email.toLowerCase();
    const attempt = db
      .prepare("SELECT count,until_at FROM login_attempts WHERE key=?")
      .get(key) as { count: number; until_at: number } | undefined;
    if (attempt && attempt.until_at > Date.now() && attempt.count >= 8)
      return NextResponse.json(
        { error: "Demasiados intentos. Espera 15 minutos." },
        { status: 429 },
      );
    const user = db
      .prepare("SELECT id,password FROM users WHERE email=?")
      .get(key) as { id: string; password: string } | undefined;
    if (!user || !checkPassword(password, user.password)) {
      db.prepare(
        "INSERT INTO login_attempts VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN until_at<? THEN 1 ELSE count+1 END,until_at=excluded.until_at",
      ).run(key, Date.now() + 900000, Date.now());
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos" },
        { status: 401 },
      );
    }
    db.prepare("DELETE FROM login_attempts WHERE key=?").run(key);
    const token = randomBytes(32).toString("hex");
    db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
      token,
      user.id,
      Date.now() + 8 * 3600000,
    );
    (await cookies()).set("bienestar-session", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 28800,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Solicitud de acceso inválida" },
      { status: 400 },
    );
  }
}
export async function DELETE(req: Request) {
  try {
    verifyOrigin(req);
    const c = await cookies();
    db.prepare("DELETE FROM sessions WHERE token=?").run(
      c.get("bienestar-session")?.value ?? "",
    );
    c.delete("bienestar-session");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Origen inválido" }, { status: 403 });
  }
}
