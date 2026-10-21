import { createHash, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import type { Actor } from "@/domain/rules";
import { canOperate } from "@/domain/rules";
import { db, transaction, getBooking, getResource, audit } from "./db";
export const gymInput = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("schedule"),
    date: z.iso.date(),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    capacity: z.number().int().min(1).max(100),
  }),
  z.object({ action: z.literal("issue"), bookingId: z.uuid() }),
  z.object({
    action: z.literal("scan"),
    direction: z.enum(["entry", "exit"]),
    qr: z.string().min(1).max(700),
  }),
]);
const credential = z.object({
  version: z.literal(2),
  purpose: z.literal("gym-access"),
  bookingId: z.uuid(),
  token: z.string().regex(/^[a-f0-9]{64}$/),
});
const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function gymOverview(actor: Actor) {
  if (!canOperate(actor, "gym"))
    throw new Error("No tienes permiso de control de acceso");
  const { capacity } = db
    .prepare("SELECT capacity FROM gym_settings WHERE id=1")
    .get() as { capacity: number };
  const { inside } = db
    .prepare("SELECT count(*) inside FROM gym_visits WHERE exited_at IS NULL")
    .get() as { inside: number };
  const events = db
    .prepare(
      "SELECT e.id,e.direction,e.created_at,u.name FROM gym_events e JOIN bookings b ON b.id=e.booking_id JOIN users u ON u.id=b.user_id ORDER BY e.rowid DESC LIMIT 12",
    )
    .all();
  return {
    capacity,
    inside,
    available: Math.max(0, capacity - inside),
    mode: "simulation",
    events,
  };
}
export function gymAccess(actor: Actor, input: unknown, now = Date.now()) {
  const op = gymInput.parse(input);
  if (op.action !== "issue" && !canOperate(actor, "gym"))
    throw new Error("No tienes permiso de control de acceso");
  return transaction(() => {
    if (op.action === "schedule") {
      const start = Date.parse(`${op.date}T${op.time}:00-05:00`);
      if (!Number.isFinite(start) || start <= now)
        throw new Error("Elige una fecha y hora futuras en Perú");
      const overview = gymOverview(actor);
      if (op.capacity > overview.capacity)
        throw new Error(
          "Los cupos de la sesión no pueden superar el aforo del gimnasio",
        );
      const slots = db
        .prepare("SELECT date,time FROM resources WHERE kind='gym'")
        .all() as { date: string; time: string }[];
      if (
        slots.some(
          (slot) =>
            Math.abs(Date.parse(`${slot.date}T${slot.time}:00-05:00`) - start) <
            3600000,
        )
      )
        throw new Error("La sesión coincide con otro horario del gimnasio");
      const id = randomUUID();
      db.prepare("INSERT INTO resources VALUES(?,?,?,?,?,?,?,?,?)").run(
        id,
        "gym",
        "Entrenamiento libre",
        "Sesión de 60 minutos con pase QR temporal y registro de ingreso y salida.",
        op.date,
        op.time,
        op.capacity,
        "Gimnasio · Sede demo",
        "Equipo deportivo · Demo",
      );
      audit(actor, "gym-schedule-create", id);
      return { id };
    }
    if (op.action === "issue") {
      const b = getBooking(op.bookingId);
      if (!b || b.user_id !== actor.id || !actor.roles.includes("student"))
        throw new Error("Reserva no autorizada");
      if (getResource(b.resource_id)?.kind !== "gym")
        throw new Error("Esta reserva no corresponde al gimnasio");
      if (!["CONFIRMADA", "EN_ATENCION"].includes(b.status))
        throw new Error("La reserva no permite generar un acceso");
      const token = randomBytes(32).toString("hex");
      db.prepare(
        "DELETE FROM gym_credentials WHERE booking_id=? OR expires_at<?",
      ).run(b.id, now);
      db.prepare(
        "INSERT INTO gym_credentials(token_hash,booking_id,expires_at) VALUES(?,?,?)",
      ).run(hash(token), b.id, now + 60000);
      return {
        qr: JSON.stringify({
          version: 2,
          purpose: "gym-access",
          bookingId: b.id,
          token,
        }),
        expiresAt: now + 60000,
        mode: "simulation",
      };
    }
    let decoded: unknown;
    try {
      decoded = JSON.parse(op.qr);
    } catch {
      throw new Error("QR no reconocido. Usa el QR temporal del gimnasio");
    }
    const parsed = credential.safeParse(decoded);
    if (!parsed.success)
      throw new Error("QR no reconocido. Usa el QR temporal del gimnasio");
    const c = parsed.data;
    const stored = db
      .prepare(
        "SELECT booking_id,expires_at FROM gym_credentials WHERE token_hash=?",
      )
      .get(hash(c.token)) as
      { booking_id: string; expires_at: number } | undefined;
    if (
      !stored ||
      stored.booking_id !== c.bookingId ||
      stored.expires_at <= now
    )
      throw new Error(
        "QR vencido, utilizado o reemplazado. Solicita uno nuevo",
      );
    const b = getBooking(c.bookingId);
    const r = b && getResource(b.resource_id);
    if (!b || !r || r.kind !== "gym")
      throw new Error("Reserva de gimnasio no encontrada");
    const ts = new Date(now).toISOString();
    if (op.direction === "entry") {
      if (b.status !== "CONFIRMADA")
        throw new Error(
          "Reserva cancelada, finalizada o con ingreso ya registrado",
        );
      // Política de demostración: ingreso desde 10 min antes hasta el final de una sesión de 60 min.
      const start = Date.parse(`${r.date}T${r.time}:00-05:00`);
      if (
        !Number.isFinite(start) ||
        now < start - 600000 ||
        now >= start + 3600000
      )
        throw new Error(
          "Fuera de horario: ingresa desde 10 minutos antes y durante tu sesión de 60 minutos",
        );
      if (
        db
          .prepare(
            "SELECT id FROM gym_visits WHERE user_id=? AND exited_at IS NULL",
          )
          .get(b.user_id)
      )
        throw new Error("El estudiante ya tiene un ingreso activo");
      const overview = gymOverview(actor);
      if (overview.inside >= overview.capacity)
        throw new Error("Aforo completo. Espera a que se registre una salida");
      db.prepare(
        "INSERT INTO gym_visits(id,booking_id,user_id,entered_at) VALUES(?,?,?,?)",
      ).run(randomUUID(), b.id, b.user_id, ts);
      db.prepare(
        "UPDATE bookings SET status='EN_ATENCION',updated_at=? WHERE id=?",
      ).run(ts, b.id);
    } else {
      // La salida no depende del horario: nunca mantener una visita abierta por vencimiento de la sesión.
      const visit = db
        .prepare(
          "SELECT id FROM gym_visits WHERE booking_id=? AND exited_at IS NULL",
        )
        .get(b.id) as { id: string } | undefined;
      if (!visit)
        throw new Error("No existe un ingreso activo para registrar la salida");
      db.prepare("UPDATE gym_visits SET exited_at=? WHERE id=?").run(
        ts,
        visit.id,
      );
      db.prepare(
        "UPDATE bookings SET status='FINALIZADA',updated_at=? WHERE id=?",
      ).run(ts, b.id);
    }
    db.prepare("DELETE FROM gym_credentials WHERE token_hash=?").run(
      hash(c.token),
    );
    const eventId = randomUUID();
    db.prepare(
      "INSERT INTO gym_events(id,booking_id,actor_id,direction,created_at) VALUES(?,?,?,?,?)",
    ).run(eventId, b.id, actor.id, op.direction, ts);
    audit(actor, `gym-${op.direction}-simulated`, b.id);
    return {
      authorized: true,
      simulated: true,
      physicalDoorOpened: false,
      direction: op.direction,
      eventId,
      ...gymOverview(actor),
    };
  });
}
