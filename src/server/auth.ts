import { cookies } from "next/headers";
import { db } from "./db";
import type { Actor } from "@/domain/rules";
export async function currentActor(): Promise<Actor | null> {
  const token = (await cookies()).get("bienestar-session")?.value;
  if (!token) return null;
  const user = db
    .prepare(
      "SELECT u.id,u.name,u.roles FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=? AND s.expires>?",
    )
    .get(token, Date.now()) as
    { id: string; name: string; roles: string } | undefined;
  return user
    ? { id: user.id, name: user.name, roles: JSON.parse(user.roles) }
    : null;
}
export function verifyOrigin(request: Request) {
  const origin = request.headers.get("origin");

  const host = request.headers.get("host");
  const expected =
    process.env.APP_ORIGIN ?? `${new URL(request.url).protocol}//${host}`;
  if (!host || !origin || origin !== expected)
    throw new Error("Origen de solicitud no autorizado");
}
