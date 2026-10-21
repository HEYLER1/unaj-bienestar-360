"use client";
import { useState } from "react";
import type { Resource } from "@/domain/rules";
export function AppointmentSchedule({
  resources,
  onChange,
}: {
  resources: Resource[];
  onChange: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const templates = resources
    .filter((r) => r.kind === "appointment")
    .filter(
      (r, i, all) =>
        all.findIndex(
          (x) =>
            x.title === r.title &&
            x.staff === r.staff &&
            x.id.startsWith("psy-") === r.id.startsWith("psy-"),
        ) === i,
    );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: f.get("templateId"),
          date: f.get("date"),
          time: f.get("time"),
          capacity: Number(f.get("capacity")),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw Error(d.error);
      await onChange();
      form.reset();
      setMessage(
        "Horario publicado. Ya se puede reservar o elegir al reprogramar.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="gym-schedule panel">
      <summary>Publicar horario de salud o psicología</summary>
      <form onSubmit={submit}>
        <label>
          Servicio y profesional
          <select name="templateId" required>
            {templates.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} · {r.staff}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fecha en Perú
          <input name="date" type="date" required />
        </label>
        <label>
          Hora de atención
          <input name="time" type="time" required />
        </label>
        <label>
          Cupos
          <input
            name="capacity"
            type="number"
            min={1}
            max={50}
            defaultValue={1}
            required
          />
        </label>
        <button className="primary" disabled={busy}>
          {busy ? "Publicando…" : "Publicar atención"}
        </button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
    </details>
  );
}
