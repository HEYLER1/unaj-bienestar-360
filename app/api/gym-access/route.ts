import { NextResponse } from "next/server";
import { currentActor, verifyOrigin } from "@/server/auth";
import { gymAccess, gymOverview } from "@/server/gym-access";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
export async function GET() {
  const actor = await currentActor();
  if (!actor)
    return NextResponse.json(
      { error: "Inicia sesión" },
      { status: 401, headers },
    );
  try {
    return NextResponse.json(gymOverview(actor), { headers });
  } catch {
    return NextResponse.json(
      { error: "No tienes permiso de control de acceso" },
      { status: 403, headers },
    );
  }
}
export async function POST(req: Request) {
  const actor = await currentActor();
  if (!actor)
    return NextResponse.json(
      { error: "Inicia sesión" },
      { status: 401, headers },
    );
  try {
    verifyOrigin(req);
    return NextResponse.json(gymAccess(actor, await req.json()), { headers });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "No se pudo validar el acceso",
      },
      { status: 400, headers },
    );
  }
}
