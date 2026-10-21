import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { db, getBooking } from "@/server/db";
import { operate } from "@/server/service";
import { publishAppointment } from "@/server/schedules";
import { gymAccess } from "@/server/gym-access";
import type { Actor } from "@/domain/rules";
const student: Actor = { id: "student", name: "Lucía", roles: ["student"] },
  other: Actor = { id: "student2", name: "Diego", roles: ["student"] };
function reserve(resourceId = "gym-1", actor = student) {
  return operate(actor, {
    action: "reserve",
    resourceId,
    requestId: randomUUID(),
  }) as { id: string; token: string };
}
function move(
  bookingId: string,
  resourceId = "gym-2",
  actor = student,
  requestId = randomUUID(),
) {
  return operate(actor, {
    action: "reschedule",
    bookingId,
    resourceId,
    requestId,
  }) as { id: string; token: string; resource_id: string };
}
beforeEach(() => {
  db.exec(
    "DELETE FROM bookings;DELETE FROM audit_logs;UPDATE resources SET date='2099-01-01';UPDATE resources SET time='16:00' WHERE id='gym-1';UPDATE resources SET time='17:00' WHERE id='gym-2';",
  );
});
describe("reprogramación atómica", () => {
  it("cambia la fecha/horario, libera el cupo anterior, rota el código e invalida el pase QR de gimnasio", () => {
    const b = reserve();
    gymAccess(student, { action: "issue", bookingId: b.id });
    const moved = move(b.id);
    expect(moved.resource_id).toBe("gym-2");
    expect(moved.token).not.toBe(b.token);
    expect(moved.id).toBe(b.id);
    expect(
      db.prepare("SELECT * FROM gym_credentials WHERE booking_id=?").get(b.id),
    ).toBeUndefined();
    expect(
      db.prepare("SELECT * FROM booking_changes WHERE booking_id=?").get(b.id),
    ).toBeTruthy();
    expect(reserve().id).toBeTruthy();
  });
  it("no pierde la reserva ni cambia el token cuando el destino está lleno", () => {
    db.prepare("UPDATE resources SET capacity=1 WHERE id='gym-2'").run();
    reserve("gym-2", other);
    const b = reserve();
    expect(() => move(b.id)).toThrow("cupos");
    expect(getBooking(b.id)?.resource_id).toBe("gym-1");
    expect(getBooking(b.id)?.token).toBe(b.token);
    db.prepare("UPDATE resources SET capacity=15 WHERE id='gym-2'").run();
  });
  it("rechaza reserva ajena, estados atendidos, cambio de servicio, mismo horario y destino pasado", () => {
    const b = reserve();
    expect(() => move(b.id, "gym-2", other)).toThrow("ajena");
    expect(() => move(b.id, "med-1")).toThrow("mismo servicio");
    expect(() => move(b.id, "gym-1")).toThrow("diferente");
    db.prepare("UPDATE resources SET date='2000-01-01' WHERE id='gym-2'").run();
    expect(() => move(b.id)).toThrow("pasado");
    db.prepare("UPDATE bookings SET status='EN_ATENCION' WHERE id=?").run(b.id);
    expect(() => move(b.id)).toThrow("asistencia");
  });
  it("es idempotente al repetir la misma solicitud y rechaza conflictos con otra reserva", () => {
    const b = reserve();
    const key = randomUUID();
    const first = move(b.id, "gym-2", student, key);
    expect(move(b.id, "gym-2", student, key).token).toBe(first.token);
    expect(() => move(b.id, "gym-1", student, key)).toThrow("autorizada");
  });
  it("mantiene separadas salud y psicología y reprograma salud a una fecha publicada", () => {
    const b = reserve("med-1");
    expect(() => move(b.id, "psy-1")).toThrow("agendas separadas");
    db.prepare(
      "INSERT OR REPLACE INTO resources SELECT 'med-next',kind,title,description,'2099-01-02',time,capacity,location,staff FROM resources WHERE id='med-1'",
    ).run();
    const moved = move(b.id, "med-next");
    expect(moved.resource_id).toBe("med-next");
  });
  it("comprueba que no haya otra reserva dentro de los 60 minutos del nuevo horario", () => {
    const b = reserve();
    db.prepare("UPDATE resources SET time='18:00' WHERE id='food-1'").run();
    reserve("food-1");
    db.prepare("UPDATE resources SET time='17:30' WHERE id='gym-2'").run();
    expect(() => move(b.id)).toThrow("coincide");
    expect(getBooking(b.id)?.resource_id).toBe("gym-1");
  });
});

describe("publicación de agenda de atención", () => {
  it("publica psicología por coordinación, conserva su tipo y rechaza otro rol y solapamientos", () => {
    const coordinator: Actor = {
      id: "admin",
      name: "Gestión",
      roles: ["coordinator"],
    };
    const fields = {
      templateId: "psy-1",
      date: "2099-01-10",
      time: "10:00",
      capacity: 1,
    };
    expect(() => publishAppointment(student, fields)).toThrow("permiso");
    const created = publishAppointment(coordinator, fields);
    expect(created.id.startsWith("psy-")).toBe(true);
    expect(() => publishAppointment(coordinator, fields)).toThrow("coincide");
    expect(() =>
      publishAppointment(coordinator, { ...fields, date: "2000-01-01" }),
    ).toThrow("futuras");
  });
});
