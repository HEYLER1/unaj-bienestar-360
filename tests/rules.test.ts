import { describe, it, expect } from "vitest";
import {
  nextStatus,
  canOperate,
  canOperateResource,
  occupancy,
  demand,
  wasteSchemaCheck,
} from "@/domain/rules";
describe("invariantes de dominio", () => {
  it("rechaza entrega duplicada y saltos de atención", () => {
    expect(nextStatus("CONFIRMADA", "consume", "dining")).toBe("CONSUMIDA");
    expect(() => nextStatus("CONSUMIDA", "consume", "dining")).toThrow();
    expect(() => nextStatus("CONFIRMADA", "finish", "appointment")).toThrow();
    expect(() => nextStatus("CONFIRMADA", "consume", "gym")).toThrow();
  });
  it("no concede privilegios operativos al técnico ni psicología al médico", () => {
    const tech = { id: "t", name: "T", roles: ["technical"] as const };
    expect(canOperate({ ...tech, roles: [...tech.roles] }, "quality")).toBe(
      false,
    );
    expect(
      canOperateResource(
        { id: "m", name: "M", roles: ["doctor"] },
        { id: "psy-1", kind: "appointment" },
      ),
    ).toBe(false);
  });
  it("distingue ocupación histórica y residuos", () => {
    expect(
      occupancy([
        { status: "CONFIRMADA" },
        { status: "CANCELADA" },
        { status: "CONSUMIDA" },
      ]),
    ).toBe(2);
    expect(wasteSchemaCheck(50, 40)).toBe(10);
    expect(() => wasteSchemaCheck(30, 40)).toThrow();
    expect(demand(81, 0.8)).toBe(65);
  });
});
