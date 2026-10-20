"use client";
import {
  ArrowRight,
  CalendarDays,
  HeartPulse,
  ShieldCheck,
  Ticket,
  Flower2,
  Check,
} from "lucide-react";
import type { Booking } from "@/domain/rules";
import { ServiceCatalog } from "./service-catalog";
export function WellnessHome({
  student,
  bookings,
  onNavigate,
  onTicket,
}: {
  student: boolean;
  bookings: Booking[];
  onNavigate: (page: string) => void;
  onTicket: (booking: Booking) => void;
}) {
  const next = [...bookings].sort((a, b) =>
    ((a.date ?? "") + (a.time ?? "")).localeCompare(
      (b.date ?? "") + (b.time ?? ""),
    ),
  )[0];
  return (
    <div className="easy-home">
      <section className="easy-hero">
        <div className="easy-hero-copy">
          <span className="easy-kicker">
            <span /> BIENESTAR PARA TU DÍA A DÍA
          </span>
          <h2>
            Sentirte bien.
            <br />
            <em>Seguir creciendo.</em>
          </h2>
          <p>
            Tu salud, tu alimentación y tus actividades. <br />
            Elige lo que necesitas. Nosotros te acompañamos.
          </p>
          <button className="easy-cta" onClick={() => onNavigate("services")}>
            {student ? "Acceder a servicios" : "Explorar servicios"}
            <ArrowRight size={20} />
          </button>
          <div className="easy-hero-foot">
            <ShieldCheck size={15} />
            Plataforma para la gestión de servicios de Bienestar Universitario
          </div>
        </div>
        <div className="easy-visual" aria-hidden="true">
          <div className="easy-ring" />
          <div className="easy-ring second" />
          <div className="easy-flower">
            <Flower2 size={116} strokeWidth={1.2} />
          </div>
          <span className="easy-float health">
            <HeartPulse size={21} />
            Tu salud primero
          </span>
          <span className="easy-float care">
            <Check size={17} />A tu ritmo
          </span>
          <i className="easy-star">✦</i>
        </div>
      </section>
      <section className="easy-next" aria-label="Tu próxima actividad">
        <span className="easy-next-icon">
          <CalendarDays size={25} />
        </span>
        <div>
          <span className="easy-overline">
            {next ? "TU PRÓXIMA CITA O SERVICIO" : "SERVICIOS UNIVERSITARIOS"}
          </span>
          <h3>{next?.title ?? "¿Listo para dar el primer paso?"}</h3>
          <p>
            {next
              ? `${next.date && new Date(next.date + "T12:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "long" })} · ${next.time}`
              : "Consulta tus servicios, accede al comedor o solicita orientación aquí."}
          </p>
        </div>
        <button
          className="outline"
          onClick={() => (next ? onTicket(next) : onNavigate("services"))}
        >
          {next ? (
            <>
              <Ticket size={17} />
              Ver mi ticket
            </>
          ) : (
            <>
              Elegir un servicio
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </section>
      <section className="easy-catalog">
        <div className="section-heading">
          <div>
            <h2>¿Qué necesitas hoy?</h2>
            <p>Procesos adaptados a cada servicio de Bienestar Universitario.</p>
          </div>
        </div>
        <ServiceCatalog onSelect={onNavigate} />
      </section>
      <section className="easy-help">
        <HeartPulse size={23} />
        <div>
          <h3>No tienes que resolverlo todo a solas.</h3>
          <p>Encuentra orientación para dar el siguiente paso.</p>
        </div>
        <button onClick={() => onNavigate("social")}>
          Necesito orientación
          <ArrowRight size={17} />
        </button>
      </section>
    </div>
  );
}
