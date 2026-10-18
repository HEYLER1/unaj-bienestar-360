import { randomUUID, randomBytes } from "node:crypto";
import {
  operationSchema,
  canOperate,
  canOperateResource,
  nextStatus,
  wasteSchemaCheck,
  type Actor,
  type Booking,
} from "@/domain/rules";
import { db, transaction, getResource, getBooking, audit } from "./db";
export function operate(actor: Actor, input: unknown) {
  const op = operationSchema.parse(input);
  return transaction(() => {
    if (op.action === "reserve") {
      if (!actor.roles.includes("student"))
        throw new Error("Solo estudiantes pueden reservar");
      const old = db
        .prepare("SELECT * FROM bookings WHERE request_id=?")
        .get(op.requestId) as Booking | undefined;
      if (old) {
        if (old.user_id !== actor.id || old.resource_id !== op.resourceId)
          throw new Error("Solicitud no autorizada");
        return old;
      }
      const r = getResource(op.resourceId);
      if (!r) throw new Error("Servicio no encontrado");
      const now = new Date().toLocaleString("sv-SE", {
        timeZone: "America/Lima",
      });
      if (r.date + " " + r.time <= now.slice(0, 16))
        throw new Error("Este horario ya ha pasado");
      const used = db
        .prepare(
          "SELECT count(*) n FROM bookings WHERE resource_id=? AND status NOT IN ('CANCELADA','NO_ASISTIO')",
        )
        .get(r.id) as { n: number };
      if (used.n >= r.capacity) throw new Error("No quedan cupos disponibles");
      const duplicate = db
        .prepare(
          "SELECT id FROM bookings WHERE resource_id=? AND user_id=? AND status NOT IN ('CANCELADA','NO_ASISTIO')",
        )
        .get(r.id, actor.id);
      if (duplicate) throw new Error("Ya tienes una reserva en este horario");
      const conflict = db
        .prepare(
          "SELECT b.id FROM bookings b JOIN resources r ON b.resource_id=r.id WHERE b.user_id=? AND r.date=? AND abs((cast(substr(r.time,1,2) AS integer)*60+cast(substr(r.time,4,2) AS integer))-?)<60 AND b.status NOT IN ('CANCELADA','NO_ASISTIO')",
        )
        .get(
          actor.id,
          r.date,
          Number(r.time.slice(0, 2)) * 60 + Number(r.time.slice(3)),
        );
      if (conflict)
        throw new Error("Tienes otra reserva que coincide con este horario");
      const id = randomUUID(),
        ts = new Date().toISOString();
      db.prepare("INSERT INTO bookings VALUES(?,?,?,?,?,?,?,?)").run(
        id,
        r.id,
        actor.id,
        "CONFIRMADA",
        randomBytes(20).toString("hex"),
        ts,
        ts,
        op.requestId,
      );
      audit(actor, "reserve", id);
      return getBooking(id);
    }
    if (op.action === "quality") {
      if (!canOperate(actor, "quality"))
        throw new Error("No tienes permiso para gestionar calidad");
      const id = randomUUID();
      db.prepare("INSERT INTO quality_actions VALUES(?,?,?,?,?,?,?,?)").run(
        id,
        op.title,
        op.description,
        op.owner,
        op.due,
        "EN_CURSO",
        "",
        new Date().toISOString(),
      );
      audit(actor, "quality-create", id);
      return { id };
    }
    if (op.action === "quality-status") {
      if (!canOperate(actor, "quality"))
        throw new Error("No tienes permiso para gestionar calidad");
      const item = db
        .prepare("SELECT status FROM quality_actions WHERE id=?")
        .get(op.id) as { status: string } | undefined;
      if (!item) throw new Error("Acción no encontrada");
      const transitions: Record<string, string[]> = {
        EN_CURSO: ["EN_VERIFICACION"],
        EN_VERIFICACION: ["EN_CURSO", "CERRADA"],
        CERRADA: [],
      };
      if (!transitions[item.status].includes(op.status))
        throw new Error(
          "Primero registra la ejecución y después verifica la eficacia",
        );
      db.prepare(
        "UPDATE quality_actions SET status=?,evidence=? WHERE id=?",
      ).run(op.status, op.evidence, op.id);
      db.prepare("INSERT INTO quality_action_history VALUES(?,?,?,?,?,?)").run(
        randomUUID(),
        op.id,
        actor.id,
        op.status,
        op.evidence,
        new Date().toISOString(),
      );
      audit(actor, op.action, op.id);
      return { id: op.id };
    }
    if (op.action === "waste") {
      if (!canOperate(actor, "dining"))
        throw new Error("No tienes permiso de comedor");
      wasteSchemaCheck(op.prepared, op.delivered);
      const id = randomUUID();
      db.prepare("INSERT INTO waste_records VALUES(?,?,?,?,?,?)").run(
        id,
        op.prepared,
        op.delivered,
        op.recoverable,
        op.waste,
        new Date().toISOString(),
      );
      audit(actor, "waste", id);
      return { id };
    }
    const b = getBooking(op.bookingId);
    if (!b) throw new Error("Reserva no encontrada");
    const r = getResource(b.resource_id)!;
    if (op.action === "cancel") {
      if (b.user_id !== actor.id && !canOperateResource(actor, r))
        throw new Error("Reserva no autorizada");
      if (
        r.date + " " + r.time <=
        new Date()
          .toLocaleString("sv-SE", { timeZone: "America/Lima" })
          .slice(0, 16)
      )
        throw new Error("No se puede cancelar un horario iniciado");
    } else {
      if (!canOperateResource(actor, r))
        throw new Error("No tienes permiso para operar este servicio");
      if (["checkin", "consume"].includes(op.action) && op.token !== b.token)
        throw new Error("Código de reserva inválido");
    }
    if (
      ["checkin", "consume"].includes(op.action) &&
      r.date !==
        new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" })
    )
      throw new Error("La asistencia se registra en la fecha de la reserva");
    const status = nextStatus(b.status, op.action, r.kind);
    db.prepare("UPDATE bookings SET status=?,updated_at=? WHERE id=?").run(
      status,
      new Date().toISOString(),
      b.id,
    );
    audit(actor, op.action, b.id);
    return getBooking(b.id);
  });
}
