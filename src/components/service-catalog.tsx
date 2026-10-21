"use client";
import { useState } from "react";
import {
  HeartPulse,
  Utensils,
  Dumbbell,
  Activity,
  Trophy,
  Users,
  ChevronRight,
  CalendarDays,
  Search,
} from "lucide-react";
const services = [
  {
    id: "appointment",
    title: "Salud y psicología",
    description: "Cuida tu salud física y emocional.",
    action: "Agendar una cita",
    icon: HeartPulse,
    color: "blue",
  },
  {
    id: "dining",
    title: "Comedor universitario",
    description: "Consulta el menú y separa tu almuerzo.",
    action: "Reservar almuerzo",
    icon: Utensils,
    color: "orange",
  },
  {
    id: "gym",
    title: "Gimnasio",
    description: "Elige un horario y activa tu día.",
    action: "Elegir un horario",
    icon: Dumbbell,
    color: "purple",
  },
  {
    id: "campaign",
    title: "Campañas de salud",
    description: "Participa en jornadas para cuidarte.",
    action: "Ver campañas",
    icon: Activity,
    color: "green",
  },
  {
    id: "activity",
    title: "Deportes y cultura",
    description: "Encuentra una actividad para ti.",
    action: "Explorar actividades",
    icon: Trophy,
    color: "pink",
  },
  {
    id: "social",
    title: "Servicio social",
    description: "Encuentra orientación y apoyo.",
    action: "Solicitar orientación",
    icon: Users,
    color: "teal",
  },
];
const groups = [
  { id: "all", label: "Todos" },
  { id: "health", label: "Salud" },
  { id: "campus", label: "Vida en campus" },
  { id: "support", label: "Apoyo" },
];
const groupFor: Record<string, string> = {
  appointment: "health",
  campaign: "health",
  dining: "campus",
  gym: "campus",
  activity: "campus",
  social: "support",
};
export function ServiceCatalog({
  onSelect,
  search = "",
  onClearSearch,
  showBookings = false,
}: {
  onSelect: (id: string) => void;
  search?: string;
  onClearSearch?: () => void;
  showBookings?: boolean;
}) {
  const [group, setGroup] = useState("all");
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es")
      .trim();
  const visible = services.filter(
    (s) =>
      (group === "all" || groupFor[s.id] === group) &&
      normalize(s.title + " " + s.description + " " + s.action).includes(
        normalize(search),
      ),
  );
  return (
    <section className="social-catalog" aria-label="Explorar servicios">
      <div className="social-catalog-top">
        <h2>Explorar</h2>
        {showBookings && (
          <button
            type="button"
            className="social-bookings"
            onClick={() => onSelect("bookings")}
          >
            <CalendarDays size={17} />
            <span>Mis reservas</span>
          </button>
        )}
      </div>
      <div
        className="social-categories"
        role="group"
        aria-label="Filtrar servicios"
      >
        {groups.map((g) => (
          <button
            type="button"
            key={g.id}
            aria-pressed={group === g.id}
            onClick={() => setGroup(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="social-results-line">
        <h3>
          {search
            ? "Resultados"
            : group === "all"
              ? "Todos los servicios"
              : groups.find((g) => g.id === group)?.label}
        </h3>
        <span role="status">
          {visible.length} {visible.length === 1 ? "servicio" : "servicios"}
        </span>
      </div>
      {visible.length ? (
        <div className="social-service-grid">
          {visible.map((s) => (
            <button
              type="button"
              key={s.id}
              className="social-service"
              aria-label={s.title}
              onClick={() => onSelect(s.id)}
            >
              <span className={"social-service-icon " + s.color}>
                <s.icon size={26} strokeWidth={2} />
              </span>
              <span className="social-service-copy">
                <strong>{s.title}</strong>
                <span>{s.description}</span>
                <small>{s.action}</small>
              </span>
              <ChevronRight
                size={19}
                className="social-service-chevron"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="social-empty">
          <Search size={30} />
          <h3>No encontramos ese servicio</h3>
          <p>Prueba con otro término o cambia de categoría.</p>
          <button
            type="button"
            onClick={() => {
              setGroup("all");
              onClearSearch?.();
            }}
          >
            Ver todos los servicios
          </button>
        </div>
      )}
    </section>
  );
}
