import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  type Actor,
  canOperateResource,
  sameReservationService,
  type Resource,
} from "@/domain/rules";
import { db, transaction, getResource, audit } from "./db";
export function publishAppointment(actor: Actor, input: unknown) {
  const op = z
    .object({
      templateId: z.string().min(1),
      date: z.iso.date(),
      time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      capacity: z.number().int().min(1).max(50),
    })
    .parse(input);
  return transaction(() => {
    const source = getResource(op.templateId);
    if (!source || source.kind !== "appointment")
      throw new Error("Selecciona un servicio de salud o psicología");
    if (
      !actor.roles.includes("coordinator") &&
      !canOperateResource(actor, source)
    )
      throw new Error("No tienes permiso para publicar esta agenda");
    const start = Date.parse(`${op.date}T${op.time}:00-05:00`);
    if (!Number.isFinite(start) || start <= Date.now())
      throw new Error("Publica una fecha y hora futuras en Perú");
    const slots = db
      .prepare("SELECT * FROM resources WHERE kind='appointment' AND date=?")
      .all(op.date) as unknown as Resource[];
    if (
      slots.some(
        (s) =>
          sameReservationService(s, source) &&
          s.staff === source.staff &&
          Math.abs(Date.parse(`${s.date}T${s.time}:00-05:00`) - start) <
            3600000,
      )
    )
      throw new Error("El profesional ya tiene un horario que coincide");
    const id = (source.id.startsWith("psy-") ? "psy-" : "med-") + randomUUID();
    db.prepare("INSERT INTO resources VALUES(?,?,?,?,?,?,?,?,?)").run(
      id,
      source.kind,
      source.title,
      source.description,
      op.date,
      op.time,
      op.capacity,
      source.location,
      source.staff,
    );
    audit(actor, "appointment-schedule-create", id);
    return { id };
  });
}
