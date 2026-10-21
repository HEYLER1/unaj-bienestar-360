import { NextResponse } from "next/server";
import { currentActor, verifyOrigin } from "@/server/auth";
import { publishAppointment } from "@/server/schedules";
import { ZodError } from "zod";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const actor = await currentActor();
  if (!actor)
    return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  try {
    verifyOrigin(req);
    return NextResponse.json(publishAppointment(actor, await req.json()), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof ZodError
            ? "Revisa fecha, hora y cupos"
            : e instanceof Error
              ? e.message
              : "No se pudo publicar el horario",
      },
      { status: 400 },
    );
  }
}
