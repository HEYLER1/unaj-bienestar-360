"use client";
import { useState } from "react";
import { CalendarDays, ArrowRight } from "lucide-react";
import {
  sameReservationService,
  type Booking,
  type Resource,
} from "@/domain/rules";
export function RescheduleForm({
  booking,
  resources,
  busy,
  error,
  onConfirm,
}: {
  booking: Booking;
  resources: (Resource & { booked: number })[];
  busy: boolean;
  error: string;
  onConfirm: (resourceId: string) => void;
}) {
  const [date, setDate] = useState(""),
    [selected, setSelected] = useState("");
  const [now] = useState(() => Date.now());
  const current = resources.find((r) => r.id === booking.resource_id);
  const candidates = resources.filter(
    (r) =>
      current &&
      r.id !== current.id &&
      sameReservationService(current, r) &&
      Date.parse(`${r.date}T${r.time}:00-05:00`) > now &&
      r.booked < r.capacity,
  );
  const dates = [...new Set(candidates.map((r) => r.date))].sort();
  const target = candidates.find((r) => r.id === selected);
  return (
    <form
      className="reschedule-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (target) onConfirm(target.id);
      }}
    >
      <div className="reschedule-current">
        <CalendarDays size={20} />
        <div>
          <b>Tu reserva actual</b>
          <p>
            {booking.title} · {booking.date} · {booking.time}
          </p>
        </div>
      </div>
      <p>
        Elige una fecha y un horario disponibles. Tu reserva actual se conserva
        hasta que confirmemos el nuevo cupo.
      </p>
      {dates.length ? (
        <>
          <label htmlFor="reschedule-date">Nueva fecha</label>
          <input
            id="reschedule-date"
            type="date"
            min={dates[0]}
            max={dates.at(-1)}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelected("");
            }}
            required
            disabled={busy}
          />
          <small>
            Días con atención:{" "}
            {dates
              .map((d) =>
                new Date(d + "T12:00:00-05:00").toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "short",
                  timeZone: "America/Lima",
                }),
              )
              .join(" · ")}
          </small>
          <label htmlFor="reschedule-time">Horario de atención</label>
          <select
            id="reschedule-time"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            required
            disabled={busy || !date}
          >
            <option value="">
              {date && !dates.includes(date)
                ? "No hay horarios publicados para esta fecha"
                : "Selecciona un horario"}
            </option>
            {candidates
              .filter((r) => r.date === date)
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.time} · {r.staff} · {r.capacity - r.booked} cupos
                </option>
              ))}
          </select>
          {target && (
            <div className="reschedule-preview">
              <b>
                Nuevo horario: {target.date} · {target.time}
              </b>
              <p>{target.location}</p>
              <small>
                Al confirmar se invalida el código anterior y se emite tu pase
                actualizado.
              </small>
            </div>
          )}
          <button
            type="submit"
            className="primary wide"
            disabled={busy || !target}
          >
            {busy ? "Reprogramando…" : "Confirmar nuevo horario"}
            <ArrowRight size={17} />
          </button>
        </>
      ) : (
        <div className="empty">
          <CalendarDays />
          <h3>No hay otros horarios disponibles</h3>
          <p>
            El servicio debe publicar nuevos horarios para que puedas
            reprogramar. Tu reserva se mantiene.
          </p>
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
