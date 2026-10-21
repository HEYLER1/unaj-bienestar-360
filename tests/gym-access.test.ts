import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { db, getBooking } from "@/server/db";
import { operate } from "@/server/service";
import { gymAccess, gymOverview } from "@/server/gym-access";
import type { Actor } from "@/domain/rules";
const student: Actor = { id: "student", name: "Lucía", roles: ["student"] };
const student2: Actor = { id: "student2", name: "Diego", roles: ["student"] };
const admin: Actor = { id: "admin", name: "Gestión", roles: ["gym"] };
const technical: Actor = { id: "tech", name: "Técnico", roles: ["technical"] };
const now = Date.parse("2099-01-01T10:00:00-05:00");
function book(actor = student, resourceId = "gym-1") {
  return operate(actor, {
    action: "reserve",
    resourceId,
    requestId: randomUUID(),
  }) as { id: string; token: string };
}
function issue(id: string, actor = student, at = now) {
  return gymAccess(actor, { action: "issue", bookingId: id }, at) as {
    qr: string;
    expiresAt: number;
  };
}
function scan(qr: string, direction = "entry", at = now, actor = admin) {
  return gymAccess(actor, { action: "scan", direction, qr }, at);
}
beforeEach(() => {
  db.exec(
    "DELETE FROM bookings;DELETE FROM audit_logs;UPDATE gym_settings SET capacity=20;",
  );
  db.prepare(
    "UPDATE resources SET date='2099-01-01',time='10:00' WHERE kind='gym'",
  ).run();
});
describe("control transaccional QR de gimnasio", () => {
  it("registra un ingreso, rechaza la repetición y libera aforo con una salida después del horario", () => {
    const b = book();
    const p = issue(b.id);
    const result = scan(p.qr) as { physicalDoorOpened: boolean };
    expect(result.physicalDoorOpened).toBe(false);
    expect(gymOverview(admin).inside).toBe(1);
    expect(getBooking(b.id)?.status).toBe("EN_ATENCION");
    expect(() => scan(p.qr)).toThrow("utilizado");
    expect(() => scan(issue(b.id).qr)).toThrow("ingreso");
    const later = now + 7200000;
    scan(issue(b.id, student, later).qr, "exit", later);
    expect(gymOverview(admin).inside).toBe(0);
    expect(getBooking(b.id)?.status).toBe("FINALIZADA");
    expect(gymOverview(admin).events).toHaveLength(2);
  });
  it("rechaza QR vencido, alterado, estático y emisión por otra cuenta", () => {
    const b = book();
    expect(() => issue(b.id, student2)).toThrow("autorizada");
    const p = issue(b.id);
    expect(() => scan(p.qr, "entry", now + 60000)).toThrow("vencido");
    const forged = JSON.parse(p.qr);
    forged.token = "f".repeat(64);
    expect(() => scan(JSON.stringify(forged))).toThrow("vencido");
    expect(() =>
      scan(JSON.stringify({ version: 1, bookingId: b.id, token: b.token })),
    ).toThrow("reconocido");
  });
  it("exige rol de gimnasio y evita eludir el aforo con operaciones antiguas", () => {
    const b = book();
    const p = issue(b.id);
    expect(() => scan(p.qr, "entry", now, technical)).toThrow("permiso");
    expect(() => scan(p.qr, "entry", now, student)).toThrow("permiso");
    expect(() => gymOverview(technical)).toThrow("permiso");
    expect(() =>
      operate(admin, { action: "checkin", bookingId: b.id, token: b.token }),
    ).toThrow("QR temporal");
  });
  it("rechaza fecha u horario incorrectos y conserva el pase tras una denegación", () => {
    const b = book();
    const p = issue(b.id, student, now - 660000);
    expect(() => scan(p.qr, "entry", now - 660000)).toThrow("Fuera de horario");
    const valid = issue(b.id);
    scan(valid.qr);
    expect(gymOverview(admin).inside).toBe(1);
  });
  it("impide exceder el aforo entre diferentes reservas y permite ingreso al liberarse una plaza", () => {
    db.exec("UPDATE gym_settings SET capacity=1");
    const a = book();
    const b = book(student2, "gym-2");
    scan(issue(a.id).qr);
    const p = issue(b.id, student2);
    expect(() => scan(p.qr)).toThrow("Aforo completo");
    expect(gymOverview(admin).inside).toBe(1);
    scan(issue(a.id).qr, "exit");
    scan(p.qr);
    expect(gymOverview(admin).inside).toBe(1);
  });
  it("revoca el QR anterior al renovarlo, rechaza cancelación y salida sin entrada", () => {
    const b = book();
    const old = issue(b.id);
    const fresh = issue(b.id);
    expect(() => scan(old.qr)).toThrow("reemplazado");
    expect(() => scan(fresh.qr, "exit")).toThrow("ingreso activo");
    operate(student, { action: "cancel", bookingId: b.id });
    expect(() => scan(fresh.qr)).toThrow("cancelada");
    expect(() => issue(b.id)).toThrow("permite");
  });
});

describe("agenda de gimnasio", () => {
  it("permite crear horarios a gestión, rechaza solapamiento, pasado, exceso de cupos y rol técnico", () => {
    const slot = {
      action: "schedule",
      date: "2099-01-03",
      time: "12:00",
      capacity: 15,
    };
    expect(() => gymAccess(technical, slot, now)).toThrow("permiso");
    const created = gymAccess(admin, slot, now) as { id: string };
    expect(created.id).toBeTruthy();
    expect(() => gymAccess(admin, slot, now)).toThrow("coincide");
    expect(() =>
      gymAccess(admin, { ...slot, date: "2020-01-01" }, now),
    ).toThrow("futuras");
    expect(() =>
      gymAccess(admin, { ...slot, time: "15:00", capacity: 21 }, now),
    ).toThrow("aforo");
    db.prepare("DELETE FROM resources WHERE id=?").run(created.id);
  });
});
