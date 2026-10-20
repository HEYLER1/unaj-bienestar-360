"use client";
import {
  HeartPulse,
  Utensils,
  Dumbbell,
  Activity,
  Flower2,
  Users,
  ArrowRight,
  Search,
} from "lucide-react";
const services = [
  {
    id: "appointment",
    title: "Salud y psicología",
    description: "Consultas médicas y citas individuales programadas.",
    action: "Agendar una cita",
    icon: HeartPulse,
    color: "blue",
  },
  {
    id: "dining",
    title: "Comedor universitario",
    description: "Menú del día, carnet digital y atención directa sin reserva.",
    action: "Acceso y menú",
    icon: Utensils,
    color: "orange",
  },
  {
    id: "gym",
    title: "Gimnasio",
    description: "Turnos de entrenamiento y control de cupos en sala.",
    action: "Turnos y cupos",
    icon: Dumbbell,
    color: "purple",
  },
  {
    id: "campaign",
    title: "Campañas de salud",
    description: "Jornadas de atención integral con circuito de triaje.",
    action: "Circuito y triaje",
    icon: Activity,
    color: "green",
  },
  {
    id: "activity",
    title: "Deportes y cultura",
    description: "Talleres culturales y disciplinas deportivas.",
    action: "Explorar actividades",
    icon: Flower2,
    color: "pink",
  },
  {
    id: "social",
    title: "Servicio social",
    description: "Orientación socioeconómica y acompañamiento.",
    action: "Solicitar orientación",
    icon: Users,
    color: "teal",
  },
];
export function ServiceCatalog({
  onSelect,
  search = "",
}: {
  onSelect: (id: string) => void;
  search?: string;
}) {
  const visible = services.filter((s) =>
    (s.title + " " + s.description + " " + s.action)
      .toLocaleLowerCase("es")
      .includes(search.toLocaleLowerCase("es")),
  );
  return visible.length ? (
    <div className="easy-services">
      {visible.map((s) => (
        <button
          key={s.id}
          className="easy-service"
          aria-label={s.title}
          onClick={() => onSelect(s.id)}
        >
          <span className={"service-icon " + s.color}>
            <s.icon size={27} />
          </span>
          <h3>{s.title}</h3>
          <p>{s.description}</p>
          <span className="easy-service-action">
            {s.action}
            <ArrowRight size={17} />
          </span>
        </button>
      ))}
    </div>
  ) : (
    <div className="empty panel">
      <Search />
      <h2>No encontramos ese servicio</h2>
      <p>Prueba con “salud”, “almuerzo” o “gimnasio”.</p>
    </div>
  );
}
