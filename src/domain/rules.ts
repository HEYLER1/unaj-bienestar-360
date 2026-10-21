import { z } from "zod";
export const kinds = [
  "appointment",
  "campaign",
  "dining",
  "gym",
  "activity",
  "social",
  "quality",
] as const;
export type Kind = (typeof kinds)[number];
export type Role =
  | "student"
  | "coordinator"
  | "quality"
  | "dining"
  | "gym"
  | "doctor"
  | "psychologist"
  | "technical";
export type Actor = { id: string; name: string; roles: Role[] };
export type Resource = {
  id: string;
  kind: Kind;
  title: string;
  description: string;
  date: string;
  time: string;
  capacity: number;
  location: string;
  staff: string;
};
export type Booking = {
  id: string;
  resource_id: string;
  user_id: string;
  status: string;
  token: string;
  created_at: string;
  updated_at: string;
  title?: string;
  kind?: Kind;
  date?: string;
  time?: string;
  name?: string;
};
export const bookingSchema = z.object({
  action: z.literal("reserve"),
  resourceId: z.string().min(1),
  requestId: z.uuid(),
});
export const operationSchema = z.discriminatedUnion("action", [
  bookingSchema,
  z.object({
    action: z.literal("reschedule"),
    bookingId: z.uuid(),
    resourceId: z.string().min(1),
    requestId: z.uuid(),
  }),
  z.object({
    action: z.enum([
      "cancel",
      "checkin",
      "call",
      "finish",
      "absent",
      "consume",
      "exit",
    ]),
    bookingId: z.uuid(),
    token: z.string().optional(),
  }),
  z.object({
    action: z.literal("quality"),
    title: z.string().trim().min(8).max(160),
    description: z.string().trim().min(10).max(1500),
    owner: z.string().trim().min(3).max(100),
    due: z.iso.date(),
  }),
  z.object({
    action: z.literal("quality-status"),
    id: z.uuid(),
    status: z.enum(["EN_CURSO", "EN_VERIFICACION", "CERRADA"]),
    evidence: z.string().trim().min(10).max(1500),
  }),
  z.object({
    action: z.literal("waste"),
    prepared: z.number().int().min(0).max(10000),
    delivered: z.number().int().min(0),
    recoverable: z.number().min(0),
    waste: z.number().min(0),
  }),
]);
export function canOperate(actor: Actor, kind: Kind) {
  const roles: Partial<Record<Kind, Role[]>> = {
    appointment: ["doctor", "psychologist"],
    campaign: ["doctor"],
    dining: ["dining"],
    gym: ["gym"],
    activity: ["coordinator"],
    social: ["coordinator"],
    quality: ["quality"],
  };
  return (roles[kind] ?? []).some((r) => actor.roles.includes(r));
}
export function maySeeAll(actor: Actor) {
  return actor.roles.includes("coordinator");
}
export function nextStatus(status: string, action: string, kind: Kind) {
  const rules: Record<string, Record<string, string>> = {
    CONFIRMADA: {
      cancel: "CANCELADA",
      checkin: "EN_ESPERA",
      consume: "CONSUMIDA",
      absent: "NO_ASISTIO",
    },
    EN_ESPERA: { call: "EN_ATENCION", cancel: "CANCELADA" },
    EN_ATENCION: { finish: "FINALIZADA", exit: "FINALIZADA" },
  };
  if (action === "consume" && kind !== "dining")
    throw new Error("Solo se pueden entregar raciones de comedor");
  if (action === "exit" && kind !== "gym")
    throw new Error("La salida corresponde al gimnasio");
  if (kind === "dining" && action === "checkin")
    throw new Error("Utilice la entrega de ración");
  const next = rules[status]?.[action];
  if (!next) throw new Error("Transición de estado no permitida");
  return next;
}
export function occupancy(bookings: Pick<Booking, "status">[]) {
  return bookings.filter((b) => !["CANCELADA", "NO_ASISTIO"].includes(b.status))
    .length;
}
export function demand(confirmed: number, attendanceRate: number) {
  return Math.ceil(confirmed * Math.max(0, Math.min(1, attendanceRate)));
}
export function wasteSchemaCheck(prepared: number, delivered: number) {
  if (delivered > prepared)
    throw new Error("Las raciones entregadas no pueden superar las preparadas");
  return prepared - delivered;
}

export function canOperateResource(
  actor: Actor,
  resource: Pick<Resource, "kind" | "id">,
) {
  if (resource.kind === "appointment") {
    const psychology = resource.id.startsWith("psy-");
    return actor.roles.includes(psychology ? "psychologist" : "doctor");
  }
  return canOperate(actor, resource.kind);
}

export function sameReservationService(
  a: Pick<Resource, "id" | "kind">,
  b: Pick<Resource, "id" | "kind">,
) {
  return (
    a.kind === b.kind &&
    (a.kind !== "appointment" ||
      a.id.startsWith("psy-") === b.id.startsWith("psy-"))
  );
}
