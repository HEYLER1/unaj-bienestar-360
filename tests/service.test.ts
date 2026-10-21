import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { db, getBooking } from "@/server/db";
import { operate } from "@/server/service";
import type { Actor } from "@/domain/rules";
const student: Actor = { id: "student", name: "Lucía", roles: ["student"] },
  student2: Actor = { id: "student2", name: "Diego", roles: ["student"] },
  admin: Actor = {
    id: "admin",
    name: "Gestión",
    roles: ["doctor", "quality", "dining", "gym"],
  },
  tech: Actor = { id: "tech", name: "Técnico", roles: ["technical"] };
function reserve(actor: Actor, resourceId: string, requestId = randomUUID()) {
  return operate(actor, { action: "reserve", resourceId, requestId }) as {
    id: string;
    token: string;
    status: string;
  };
}
beforeEach(() => {
  db.exec(
    "DELETE FROM bookings;DELETE FROM audit_logs;DELETE FROM quality_action_history;DELETE FROM quality_actions;DELETE FROM waste_records;",
  );
  db.prepare("UPDATE resources SET date='2099-01-01'").run();
});
describe("reservas transaccionales y permisos", () => {
  it("persiste, mantiene idempotencia y no expone la clave de otro actor", () => {
    const key = randomUUID();
    const b = reserve(student, "med-1", key);
    expect(reserve(student, "med-1", key).id).toBe(b.id);
    expect(getBooking(b.id)?.user_id).toBe(student.id);
    expect(() => reserve(student2, "med-1", key)).toThrow("no autorizada");
  });
  it("protege último cupo y lo libera por cancelación", () => {
    const b = reserve(student, "med-1");
    expect(() => reserve(student2, "med-1")).toThrow("cupos");
    operate(student, { action: "cancel", bookingId: b.id });
    expect(reserve(student2, "med-1").status).toBe("CONFIRMADA");
  });
  it("impide conflicto entre servicios y reserva duplicada", () => {
    reserve(student, "med-1");
    db.prepare("UPDATE resources SET time='09:30' WHERE id='gym-1'").run();
    expect(() => reserve(student, "gym-1")).toThrow("coincide");
    expect(() => reserve(student, "med-1")).toThrow();
  });
  it("impide reservas vencidas y cancelación ajena", () => {
    db.prepare("UPDATE resources SET date='2020-01-01' WHERE id='med-1'").run();
    expect(() => reserve(student, "med-1")).toThrow("pasado");
    const b = reserve(student, "gym-1");
    expect(() =>
      operate(student2, { action: "cancel", bookingId: b.id }),
    ).toThrow("autorizada");
    expect(() => operate(tech, { action: "cancel", bookingId: b.id })).toThrow(
      "autorizada",
    );
  });
  it("restringe operador por servicio y protege psicología", () => {
    const b = reserve(student, "psy-1");
    expect(() =>
      operate(admin, { action: "checkin", bookingId: b.id, token: b.token }),
    ).toThrow("permiso");
    expect(() => reserve(tech, "food-1")).toThrow("estudiantes");
  });
  it("verifica fecha, token y entrega única de comedor", () => {
    const b = reserve(student, "food-1");
    expect(() =>
      operate(admin, { action: "consume", bookingId: b.id, token: b.token }),
    ).toThrow("fecha");
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Lima",
    });
    db.prepare("UPDATE resources SET date=? WHERE id='food-1'").run(today);
    expect(() =>
      operate(admin, { action: "consume", bookingId: b.id, token: "falso" }),
    ).toThrow("inválido");
    operate(admin, { action: "consume", bookingId: b.id, token: b.token });
    expect(getBooking(b.id)?.status).toBe("CONSUMIDA");
    expect(() =>
      operate(admin, { action: "consume", bookingId: b.id, token: b.token }),
    ).toThrow("Transición");
  });
  it("recorre la cola administrativa de campaña sin saltos", () => {
    const b = reserve(student, "camp-1");
    db.prepare("UPDATE resources SET date=? WHERE id='camp-1'").run(
      new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" }),
    );
    operate(admin, { action: "checkin", bookingId: b.id, token: b.token });
    operate(admin, { action: "call", bookingId: b.id });
    operate(admin, { action: "finish", bookingId: b.id });
    expect(getBooking(b.id)?.status).toBe("FINALIZADA");
    const logs = db
      .prepare("SELECT count(*) n FROM audit_logs WHERE resource_id=?")
      .get(b.id) as { n: number };
    expect(logs.n).toBe(4);
  });
  it("rechaza producción inconsistente y conserva unidades separadas", () => {
    expect(() =>
      operate(admin, {
        action: "waste",
        prepared: 10,
        delivered: 12,
        recoverable: 1,
        waste: 2,
      }),
    ).toThrow();
    operate(admin, {
      action: "waste",
      prepared: 20,
      delivered: 12,
      recoverable: 1.5,
      waste: 2,
    });
    expect(
      db.prepare("SELECT recoverable FROM waste_records").get()?.recoverable,
    ).toBe(1.5);
    expect(() =>
      operate(student, {
        action: "waste",
        prepared: 20,
        delivered: 12,
        recoverable: 1,
        waste: 2,
      }),
    ).toThrow("permiso");
  });
  it("exige evidencia y verificación antes del cierre de calidad", () => {
    const q = operate(admin, {
      action: "quality",
      title: "Mejorar confirmaciones",
      description: "Analizar causas de inasistencia",
      owner: "Responsable demo",
      due: "2099-01-01",
    }) as { id: string };
    expect(() =>
      operate(admin, {
        action: "quality-status",
        id: q.id,
        status: "CERRADA",
        evidence: "Evidencia de prueba",
      }),
    ).toThrow("Primero");
    expect(() =>
      operate(student, {
        action: "quality-status",
        id: q.id,
        status: "EN_VERIFICACION",
        evidence: "Evidencia de prueba",
      }),
    ).toThrow("permiso");
    operate(admin, {
      action: "quality-status",
      id: q.id,
      status: "EN_VERIFICACION",
      evidence: "Se documenta la ejecución demo",
    });
    operate(admin, {
      action: "quality-status",
      id: q.id,
      status: "CERRADA",
      evidence: "Se verifica eficacia con medición demo",
    });
    expect(
      db.prepare("SELECT status FROM quality_actions WHERE id=?").get(q.id)
        ?.status,
    ).toBe("CERRADA");
  });
});
