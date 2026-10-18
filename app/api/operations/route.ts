import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { currentActor, verifyOrigin } from "@/server/auth";
import { operate } from "@/server/service";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const actor = await currentActor();
  if (!actor)
    return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  try {
    verifyOrigin(req);
    return NextResponse.json({ result: operate(actor, await req.json()) });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof ZodError
            ? "Revisa los campos del formulario"
            : e instanceof Error
              ? e.message
              : "No se pudo completar la operación",
      },
      { status: 400 },
    );
  }
}
