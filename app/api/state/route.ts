import { NextResponse } from "next/server";
import { currentActor } from "@/server/auth";
import { db } from "@/server/db";
import { canOperate, canOperateResource, type Resource } from "@/domain/rules";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const actor = await currentActor();
  if (!actor)
    return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  const resources = db
    .prepare(
      "SELECT r.*, (SELECT count(*) FROM bookings b WHERE b.resource_id=r.id AND b.status NOT IN ('CANCELADA','NO_ASISTIO')) AS booked FROM resources r ORDER BY date,time",
    )
    .all() as unknown as (Resource & { booked: number })[];
  const all = db
    .prepare(
      "SELECT b.*,r.title,r.kind,r.date,r.time,u.name FROM bookings b JOIN resources r ON r.id=b.resource_id JOIN users u ON u.id=b.user_id ORDER BY b.created_at",
    )
    .all();
  const bookings = all.filter(
    (b) =>
      b.user_id === actor.id ||
      canOperateResource(actor, {
        kind: b.kind as Resource["kind"],
        id: String(b.resource_id),
      }),
  );
  const quality = canOperate(actor, "quality")
    ? db.prepare("SELECT * FROM quality_actions ORDER BY created_at DESC").all()
    : [];
  const waste = canOperate(actor, "dining")
    ? db.prepare("SELECT * FROM waste_records ORDER BY created_at DESC").all()
    : [];
  return NextResponse.json(
    { actor, resources, bookings, quality, waste },
    { headers: { "Cache-Control": "no-store" } },
  );
}
