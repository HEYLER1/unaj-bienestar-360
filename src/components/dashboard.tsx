"use client";
import { WellnessHome } from "./wellness-home";
import { ServiceCatalog } from "./service-catalog";
import { ReservationQR } from "./reservation-qr";
import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
  LayoutDashboard,
  HeartPulse,
  Utensils,
  Dumbbell,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  ChevronRight,
  ArrowUpRight,
  ArrowRight,
  Search,
  Bell,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Users,
  Activity,
  ShieldCheck,
  MapPin,
  Check,
  Ticket,
  Flower2,
  BookOpen,
  Download,
  Plus,
  AlertCircle,
} from "lucide-react";
import type { Actor, Resource, Booking, Kind } from "@/domain/rules";
import { canOperate } from "@/domain/rules";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
type Quality = {
  id: string;
  title: string;
  description: string;
  owner: string;
  due: string;
  status: string;
  evidence: string;
};
type State = {
  actor: Actor;
  resources: (Resource & { booked: number })[];
  bookings: Booking[];
  quality: Quality[];
  waste: {
    id: string;
    prepared: number;
    delivered: number;
    recoverable: number;
    waste: number;
    created_at: string;
  }[];
};
const nav = [
  { id: "overview", label: "Inicio", icon: LayoutDashboard },
  { id: "services", label: "Servicios", icon: HeartPulse },
  { id: "appointment", label: "Salud y psicología", icon: HeartPulse },
  { id: "campaign", label: "Campañas de salud", icon: Activity },
  { id: "dining", label: "Comedor universitario", icon: Utensils },
  { id: "gym", label: "Gimnasio", icon: Dumbbell },
  { id: "activity", label: "Deportes y cultura", icon: Flower2 },
  { id: "social", label: "Servicio social", icon: Users },
  { id: "bookings", label: "Mis atenciones y citas", icon: CalendarDays },
  { id: "quality", label: "Gestión de calidad", icon: ShieldCheck },
  { id: "reports", label: "Indicadores y reportes", icon: ClipboardCheck },
];
const labels: Record<string, string> = {
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  EN_ESPERA: "En espera",
  EN_ATENCION: "En atención",
  FINALIZADA: "Finalizada",
  CONSUMIDA: "Ración entregada",
  NO_ASISTIO: "No asistió",
  EN_CURSO: "En curso",
  EN_VERIFICACION: "En verificación",
  CERRADA: "Cerrada",
};
const icons: Record<Kind, typeof HeartPulse> = {
  appointment: HeartPulse,
  campaign: Activity,
  dining: Utensils,
  gym: Dumbbell,
  activity: Flower2,
  social: Users,
  quality: ShieldCheck,
};
const loginSchema = z.object({
  email: z.email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});
type Login = z.infer<typeof loginSchema>;
function prettyDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
  });
}
export default function Dashboard() {
  const [data, setData] = useState<State | null>(null),
    [loading, setLoading] = useState(true),
    [page, setPage] = useState("overview"),
    [search, setSearch] = useState(""),
    [dark, setDark] = useState(false),
    [mobile, setMobile] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<Resource | null>(null),
    [ticket, setTicket] = useState<Booking | null>(null),
    [cancel, setCancel] = useState<Booking | null>(null),
    [qualityForm, setQualityForm] = useState(false),
    [notifications, setNotifications] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "estudiante@demo.local", password: "Demo360!2026" },
  });
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/state");
      if (r.status === 401) {
        setData(null);
        return;
      }
      if (!r.ok) throw new Error("No se pudo cargar la información");
      setData(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let alive = true;
    fetch("/api/state")
      .then(async (r) => {
        if (r.status === 401) return null;
        if (!r.ok) throw new Error("No se pudo cargar la información");
        return r.json() as Promise<State>;
      })
      .then((result) => {
        if (alive) setData(result);
      })
      .catch(() => {
        if (alive) setError("No se pudo cargar la información");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  async function login(values: Login) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setBusy(false);
    }
  }
  async function operation(body: object, success = "Operación completada") {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setMessage(success);
      setSelected(null);
      setCancel(null);
      setQualityForm(false);
      await refresh();
      return true;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo conectar. Inténtalo de nuevo.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      const r = await fetch("/api/auth", { method: "DELETE" });
      if (!r.ok) throw new Error("No se pudo cerrar la sesión");
      setData(null);
      setPage("overview");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  function go(id: string) {
    setPage(id);
    setSearch("");
    setMobile(false);
    setError("");
    setMessage("");
  }
  if (loading)
    return (
      <main className="loading">
        <Flower2 size={36} />
        <p>Cargando Bienestar 360°…</p>
      </main>
    );
  if (!data)
    return (
      <main className="login-page">
        <section className="login-story">
          <div className="brand">
            <div className="brand-mark">
              <GraduationCap />
            </div>
            <span>
              UNAJ <b>Bienestar 360°</b>
            </span>
          </div>
          <div>
            <span className="eyebrow">PLATAFORMA WEB INTEGRADA</span>
            <h1>
              Gestión de Servicios de
              <br />
              Bienestar Universitario
            </h1>
            <p>
              Salud, alimentación, deporte y apoyo social.
              <br />
              Procesos adaptados a cada servicio, trazabilidad e información para el Sistema Integrado de Gestión.
            </p>
            <div className="story-orbit">
              <HeartPulse size={55} />
              <Flower2 size={110} />
              <Dumbbell size={48} />
            </div>
          </div>
          <small>UNAJ Bienestar 360° · Plataforma web para la gestión de servicios de Bienestar Universitario</small>
        </section>
        <section className="login-panel">
          <span className="tag">
            <span className="dot" /> ENTORNO DE DEMOSTRACIÓN
          </span>
          <h2>Bienvenido de nuevo</h2>
          <p>Accede a tu espacio de bienestar universitario.</p>
          <form onSubmit={handleSubmit(login)}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              autoComplete="username"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <small className="error">{errors.email.message}</small>
            )}
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <small className="error">{errors.password.message}</small>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="primary wide" disabled={busy}>
              {busy ? "Ingresando…" : "Iniciar sesión"}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="demo-box">
            <b>Explora con una cuenta ficticia</b>
            <div className="demo-choices">
              <button
                onClick={() => setValue("email", "estudiante@demo.local")}
              >
                Estudiante
              </button>
              <button onClick={() => setValue("email", "gestion@demo.local")}>
                Gestión
              </button>
              <button onClick={() => setValue("email", "tecnico@demo.local")}>
                Técnico
              </button>
            </div>
            <small>
              Contraseña común: <code>Demo360!2026</code>
            </small>
          </div>
          <p className="fine">
            Cuentas preaprovisionadas para exposición. Sin registro público ni
            recuperación por correo. No ingresar datos reales.
          </p>
        </section>
      </main>
    );
  const student = data.actor.roles.includes("student");
  const active = data.bookings.filter(
    (b) =>
      !["CANCELADA", "NO_ASISTIO", "FINALIZADA", "CONSUMIDA"].includes(
        b.status,
      ),
  );
  const completed = data.bookings.filter((b) =>
    ["FINALIZADA", "CONSUMIDA"].includes(b.status),
  );
  const filtered = data.resources.filter(
    (r) =>
      (r.kind === page || page === "overview") &&
      (r.title + " " + r.description)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  });
  function exportReport() {
    const rows = [
      ["Reserva", "Servicio", "Fecha", "Hora", "Estado"],
      ...data!.bookings.map((b) => [
        b.id,
        b.title ?? "",
        b.date ?? "",
        b.time ?? "",
        labels[b.status],
      ]),
    ];
    const content =
      "\uFEFF" +
      rows
        .map((row) =>
          row.map((v) => '"' + v.replace(/"/g, '""') + '"').join(","),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte-demo-bienestar.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className={mobile ? "app menu-open" : "app"}>
      <a className="skip" href="#main">
        Saltar al contenido
      </a>
      {mobile && (
        <button
          className="overlay"
          aria-label="Cerrar menú"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <div className="brand-mark">
            <GraduationCap size={23} />
          </div>
          <div>
            <strong>UNAJ</strong>
            <span>
              Bienestar <b>360°</b>
            </span>
          </div>
        </div>
        <div className="workspace">
          <span className="workspace-icon">
            <BookOpen size={17} />
          </span>
          <div>
            Bienestar Universitario
            <small>
              {student ? "Portal del estudiante" : "Portal de gestión"}
            </small>
          </div>
          <ChevronRight size={14} />
        </div>
        <span className="nav-label">PRINCIPAL</span>
        <nav aria-label="Menú lateral">
          {nav
            .filter(
              (n) =>
                !student || ["overview", "services", "bookings"].includes(n.id),
            )
            .map((n) => (
              <div key={n.id}>
                {n.id === "quality" && (
                  <span className="nav-label management">
                    GESTIÓN Y SEGUIMIENTO
                  </span>
                )}
                <button
                  aria-current={
                    page === n.id ||
                    (student &&
                      n.id === "services" &&
                      [
                        "appointment",
                        "campaign",
                        "dining",
                        "gym",
                        "activity",
                        "social",
                      ].includes(page))
                      ? "page"
                      : undefined
                  }
                  className={
                    page === n.id ||
                    (student &&
                      n.id === "services" &&
                      [
                        "appointment",
                        "campaign",
                        "dining",
                        "gym",
                        "activity",
                        "social",
                      ].includes(page))
                      ? "nav-item active"
                      : "nav-item"
                  }
                  onClick={() => go(n.id)}
                >
                  <n.icon size={18} />
                  <span>{n.label}</span>
                  {n.id === "bookings" && active.length > 0 && (
                    <span className="count">{active.length}</span>
                  )}
                </button>
              </div>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">
              <HeartPulse size={19} />
            </span>
            <b>Estamos para ti</b>
            <p>Te ayudamos a encontrar el servicio que necesitas.</p>
            <button onClick={() => go("social")}>
              Necesito orientación <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="user">
            <span className="avatar">{student ? "LQ" : "VF"}</span>
            <div>
              <b>{data.actor.name.split(" · ")[0]}</b>
              <small>{student ? "Estudiante · Demo" : "Gestión · Demo"}</small>
            </div>
            <button
              className="icon-button"
              onClick={logout}
              aria-label="Cerrar sesión"
              disabled={busy}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      {student && (
        <nav className="mobile-tabs" aria-label="Navegación principal">
          {nav
            .filter((n) => ["overview", "services", "bookings"].includes(n.id))
            .map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                aria-current={
                  page === n.id ||
                  (n.id === "services" &&
                    [
                      "appointment",
                      "campaign",
                      "dining",
                      "gym",
                      "activity",
                      "social",
                    ].includes(page))
                    ? "page"
                    : undefined
                }
              >
                <n.icon size={21} />
                <span>{n.label}</span>
              </button>
            ))}
        </nav>
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-toggle"
              aria-label="Abrir menú"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <span>Mi espacio</span>
            <ChevronRight size={13} />
            <strong>{nav.find((n) => n.id === page)?.label}</strong>
          </div>
          <div className="header-actions">
            <span className="demo-pill">
              <span className="dot" /> Demo académica
            </span>
            <button
              className="icon-button"
              aria-label="Cambiar tema"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="icon-button notification"
              aria-label="Notificaciones"
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={18} />
              {active.length > 0 && <i />}
            </button>
            <span className="avatar small">{student ? "LQ" : "VF"}</span>
          </div>
        </header>
        <main id="main" className="content">
          <div className="page-title">
            <div>
              <span className="eyebrow">BIENESTAR UNIVERSITARIO</span>
              <h1>
                {page === "overview"
                  ? `Hola, ${data.actor.name.split(" ")[0]} 👋`
                  : nav.find((n) => n.id === page)?.label}
              </h1>
              <p>
                {page === "overview"
                  ? "Qué bueno verte. ¿Cómo podemos acompañarte hoy?"
                  : "Organiza y consulta tus servicios en un solo lugar."}
              </p>
            </div>
            <span className="date-label">
              <CalendarDays size={16} />
              {today}
            </span>
          </div>
          {error && (
            <div role="alert" className="notice error-notice">
              <AlertCircle size={18} />
              {error}
              <button aria-label="Cerrar error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {message && (
            <div role="status" className="notice success">
              <Check size={18} />
              {message}
              {message.includes("confirmad") && (
                <button className="success-link" onClick={() => go("bookings")}>
                  Ver mis registros <ArrowRight size={16} />
                </button>
              )}
              <button
                aria-label="Cerrar mensaje"
                onClick={() => setMessage("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {page === "overview" && (
            <WellnessHome
              student={student}
              bookings={active}
              onNavigate={go}
              onTicket={setTicket}
            />
          )}
          {page === "services" && (
            <section className="catalog-page">
              <div className="search">
                <Search size={19} />
                <input
                  aria-label="Buscar un servicio"
                  placeholder="¿Qué necesitas? Salud, almuerzo, deporte…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <ServiceCatalog onSelect={go} search={search} />
            </section>
          )}
          {[
            "appointment",
            "campaign",
            "dining",
            "gym",
            "activity",
            "social",
          ].includes(page) && (
            <>
              <button
                className="back-to-services"
                onClick={() => go("services")}
              >
                ← Volver a servicios
              </button>
              {page === "dining" && student && (
                <div
                  className="panel"
                  style={{
                    padding: "16px 20px",
                    marginBottom: 20,
                    borderLeft: "4px solid #ea580c",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: "0 0 4px",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 15,
                        }}
                      >
                        <Utensils size={18} color="#ea580c" /> Acceso Directo al Comedor Universitario
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "var(--muted)",
                        }}
                      >
                        Presenta tu carnet universitario o código QR en la línea de ingreso. El sistema valida tu beneficio (becario/regular), horario y entrega de ración única del día sin necesidad de reserva previa.
                      </p>
                    </div>
                    <span
                      className="tag"
                      style={{
                        background: "#fff7ed",
                        color: "#c2410c",
                        fontWeight: 600,
                      }}
                    >
                      DNI / Código: 72104589 · Becario
                    </span>
                  </div>
                </div>
              )}
              <div className="toolbar">
                <div className="search">
                  <Search size={17} />
                  <input
                    aria-label="Buscar servicios"
                    placeholder="Buscar servicio o actividad…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <span className="tag">Horarios de demostración · Perú</span>
              </div>
              <div className="resource-grid">
                {filtered.map((r) => {
                  const Icon = icons[r.kind];
                  const existing = active.find((b) => b.resource_id === r.id);
                  return (
                    <article className="resource-card panel" key={r.id}>
                      <div className="resource-head">
                        <span
                          className={
                            "service-icon " +
                            (r.kind === "dining"
                              ? "orange"
                              : r.kind === "gym"
                                ? "purple"
                                : "green")
                          }
                        >
                          <Icon size={25} />
                        </span>
                        <span className="tag">
                          {r.capacity - r.booked} cupos disponibles
                        </span>
                      </div>
                      <h2>{r.title}</h2>
                      <p>{r.description}</p>
                      <div className="resource-detail">
                        <CalendarDays size={16} />
                        {prettyDate(r.date)} · {r.time}
                      </div>
                      <div className="resource-detail">
                        <MapPin size={16} />
                        {r.location}
                      </div>
                      <div className="resource-detail">
                        <Users size={16} />
                        {r.staff}
                      </div>
                      <div className="capacity">
                        <span
                          style={{ width: `${(r.booked / r.capacity) * 100}%` }}
                        />
                      </div>
                      <small>
                        {r.booked} de {r.capacity} cupos reservados
                      </small>
                      {student ? (
                        <button
                          className="primary wide"
                          disabled={
                            busy || r.booked >= r.capacity || !!existing
                          }
                          onClick={() => setSelected(r)}
                        >
                          {existing
                            ? r.kind === "dining"
                              ? "Ración ya confirmada"
                              : "Ya tienes una cita"
                            : r.booked >= r.capacity
                              ? "Sin cupos"
                              : r.kind === "appointment"
                                ? "Agendar cita médica"
                                : r.kind === "dining"
                                  ? "Acceder al comedor"
                                  : r.kind === "campaign"
                                    ? "Inscribirme a jornada"
                                    : r.kind === "gym"
                                      ? "Separar turno"
                                      : r.kind === "social"
                                        ? "Solicitar orientación"
                                        : "Inscribirme"}
                          <ArrowRight size={16} />
                        </button>
                      ) : (
                        <small className="fine">
                          Las solicitudes y registros se realizan desde una cuenta estudiantil.
                        </small>
                      )}
                    </article>
                  );
                })}
              </div>
              {!filtered.length && (
                <div className="empty panel">
                  <Search />
                  <h2>No hay resultados</h2>
                  <p>Prueba con otro término.</p>
                </div>
              )}
              {!student && (
                <BookingTable
                  bookings={data.bookings.filter((b) => b.kind === page)}
                  actor={data.actor}
                  busy={busy}
                  onCancel={setCancel}
                  onTicket={setTicket}
                  onOperation={operation}
                />
              )}
              {page === "dining" && canOperate(data.actor, "dining") && (
                <section className="panel form-panel" style={{ marginBottom: 20 }}>
                  <h2>Identificación y Entrega Directa de Ración</h2>
                  <p>
                    Simulación de control de ingreso: escaneo de carnet o validación de DNI en línea. Verifica condición de beneficio y ración única diaria sin reserva previa.
                  </p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                    <button
                      type="button"
                      className="outline"
                      style={{ fontSize: 12 }}
                      disabled={busy}
                      onClick={() => {
                        const target = data.bookings.find(
                          (b) => b.kind === "dining" && b.status === "CONFIRMADA",
                        );
                        if (target) {
                          void operation(
                            {
                              action: "consume",
                              bookingId: target.id,
                              token: target.token,
                            },
                            `Ración entregada a comensal (${target.name || "Lucía Quispe"}) · Acceso verificado`,
                          );
                        } else {
                          setMessage(
                            "Comensal verificado: Lucía Quispe (DNI 72104589 · Becario) · Ración de almuerzo entregada",
                          );
                        }
                      }}
                    >
                      <Check size={14} /> Registrar Comensal: Lucía Quispe (Becario)
                    </button>
                    <button
                      type="button"
                      className="outline"
                      style={{ fontSize: 12 }}
                      disabled={busy}
                      onClick={() => {
                        setMessage(
                          "Comensal verificado: Diego Mamani (DNI 70894123 · Regular) · Ración de almuerzo entregada",
                        );
                      }}
                    >
                      <Check size={14} /> Registrar Comensal: Diego Mamani (Regular)
                    </button>
                  </div>
                </section>
              )}
              {page === "dining" && canOperate(data.actor, "dining") && (
                <section className="panel form-panel">
                  <h2>Producción y desperdicio</h2>
                  <p>
                    Raciones no entregadas y residuos son medidas distintas.
                    Sobrantes y residuos se registran en kg.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      void operation(
                        {
                          action: "waste",
                          prepared: Number(f.get("prepared")),
                          delivered: Number(f.get("delivered")),
                          recoverable: Number(f.get("recoverable")),
                          waste: Number(f.get("waste")),
                        },
                        "Registro de producción guardado",
                      );
                    }}
                  >
                    <div className="form-grid">
                      {[
                        ["prepared", "Raciones preparadas"],
                        ["delivered", "Raciones entregadas"],
                        ["recoverable", "Sobrantes aprovechables (kg)"],
                        ["waste", "Residuos alimentarios (kg)"],
                      ].map(([name, label]) => (
                        <label key={name}>
                          {label}
                          <input
                            name={name}
                            type="number"
                            min="0"
                            step={
                              name === "prepared" || name === "delivered"
                                ? "1"
                                : "0.1"
                            }
                            required
                          />
                        </label>
                      ))}
                    </div>
                    <button className="primary" disabled={busy}>
                      Guardar registro
                    </button>
                  </form>
                  {data.waste.map((w) => (
                    <p key={w.id}>
                      {w.prepared} preparadas · {w.delivered} entregadas ·{" "}
                      {w.prepared - w.delivered} no entregadas · {w.recoverable}{" "}
                      kg aprovechables · {w.waste} kg residuos
                    </p>
                  ))}
                </section>
              )}
            </>
          )}
          {page === "bookings" && (
            <>
              <div className="toolbar">
                <h2>
                  {student
                    ? "Historial de atenciones y citas"
                    : "Atenciones y registros por servicio autorizado"}
                </h2>
                <button className="outline" onClick={exportReport}>
                  <Download size={16} />
                  Exportar CSV
                </button>
              </div>
              <BookingTable
                bookings={data.bookings}
                actor={data.actor}
                busy={busy}
                onCancel={setCancel}
                onTicket={setTicket}
                onOperation={operation}
              />
            </>
          )}
          {page === "quality" &&
            (canOperate(data.actor, "quality") ? (
              <>
                <div className="toolbar">
                  <div>
                    <h2>Mejora continua</h2>
                    <p>Acciones correctivas · Referencia ISO 9001:2015, 10.2</p>
                  </div>
                  <button
                    className="primary"
                    onClick={() => setQualityForm(true)}
                  >
                    <Plus size={16} />
                    Nueva acción
                  </button>
                </div>
                <div className="quality-grid">
                  {["EN_CURSO", "EN_VERIFICACION", "CERRADA"].map((status) => (
                    <section className="quality-column" key={status}>
                      <h3>
                        <span className="dot" />
                        {labels[status]}
                        <span className="count">
                          {
                            data.quality.filter((q) => q.status === status)
                              .length
                          }
                        </span>
                      </h3>
                      {data.quality
                        .filter((q) => q.status === status)
                        .map((q) => (
                          <article className="panel" key={q.id}>
                            <span className="tag">ACCIÓN CORRECTIVA</span>
                            <h3>{q.title}</h3>
                            <p>{q.description}</p>
                            <small>
                              {q.owner} · {prettyDate(q.due)}
                            </small>
                            {q.evidence && (
                              <p className="evidence">
                                Evidencia: {q.evidence}
                              </p>
                            )}
                            {status !== "CERRADA" && (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const f = new FormData(e.currentTarget);
                                  void operation(
                                    {
                                      action: "quality-status",
                                      id: q.id,
                                      status:
                                        status === "EN_CURSO"
                                          ? "EN_VERIFICACION"
                                          : "CERRADA",
                                      evidence: f.get("evidence"),
                                    },
                                    status === "EN_CURSO"
                                      ? "Acción enviada a verificación"
                                      : "Eficacia verificada y acción cerrada",
                                  );
                                }}
                              >
                                <label>
                                  {status === "EN_CURSO"
                                    ? "Evidencia de ejecución"
                                    : "Evidencia de eficacia"}
                                  <textarea
                                    name="evidence"
                                    required
                                    minLength={10}
                                    maxLength={1500}
                                  />
                                </label>
                                <button
                                  className="outline wide"
                                  disabled={busy}
                                >
                                  {status === "EN_CURSO"
                                    ? "Enviar a verificación"
                                    : "Verificar eficacia y cerrar"}
                                </button>
                              </form>
                            )}
                          </article>
                        ))}
                    </section>
                  ))}
                </div>
                <p className="fine">
                  Apoyo a la gestión de calidad. El aplicativo no garantiza
                  certificación ISO.
                </p>
              </>
            ) : (
              <div className="empty panel">
                <ShieldCheck size={36} />
                <h2>Espacio de calidad restringido</h2>
                <p>
                  Solo el rol autorizado puede gestionar acciones correctivas.
                </p>
              </div>
            ))}
          {page === "reports" && (
            <>
              <div className="toolbar">
                <div>
                  <h2>Indicadores de gestión de Bienestar</h2>
                  <p>
                    Registros consolidados de atenciones y servicios · Apoyo al Sistema Integrado de Gestión (SIG)
                  </p>
                </div>
                <button className="outline" onClick={exportReport}>
                  <Download size={16} />
                  Exportar datos
                </button>
              </div>
              <section className="stats">
                <Stat
                  title="Atenciones y citas"
                  value={String(data.bookings.length)}
                  note="Registros consolidados de servicios"
                  icon={Ticket}
                  color="blue"
                />
                <Stat
                  title="Atenciones completas"
                  value={String(completed.length)}
                  note="Finalizadas + raciones entregadas"
                  icon={Check}
                  color="green"
                />
                <Stat
                  title="Inasistencias"
                  value={String(
                    data.bookings.filter((b) => b.status === "NO_ASISTIO")
                      .length,
                  )}
                  note="Marcadas por personal autorizado"
                  icon={Users}
                  color="orange"
                />
                <Stat
                  title="Satisfacción general"
                  value="4.8 ★"
                  note="Percepción estudiantil (ISO 9001: 9.1.2)"
                  icon={HeartPulse}
                  color="purple"
                />
              </section>
              <section className="panel report-panel">
                <h2>Distribución por servicio</h2>
                <p>
                  Atenciones y registros por área de Bienestar Universitario.
                </p>
                {[
                  "appointment",
                  "campaign",
                  "dining",
                  "gym",
                  "activity",
                  "social",
                ].map((k) => {
                  const n = data.bookings.filter((b) => b.kind === k).length;
                  return (
                    <div key={k} className="bar-row">
                      <span>{nav.find((n) => n.id === k)?.label}</span>
                      <div>
                        <i
                          style={{
                            width: `${data.bookings.length ? (n / data.bookings.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <b>{n}</b>
                    </div>
                  );
                })}
                <p className="fine">
                  Tiempo de espera y ocupación promedio: pendientes de
                  instrumentación de eventos. Sin mediciones no se calculan
                  promedios.
                </p>
              </section>
            </>
          )}
          <footer>
            <span>
              UNAJ Bienestar 360° <span className="subtle">/</span> Plataforma web para la gestión de servicios de Bienestar Universitario
            </span>
            <span>Demostración académica · Apoyo al Sistema Integrado de Gestión (SIG)</span>
          </footer>
        </main>
      </div>
      {selected && (
        <Modal
          title={
            selected.kind === "appointment"
              ? "Confirmar cita médica"
              : selected.kind === "dining"
                ? "Confirmar acceso al comedor"
                : selected.kind === "gym"
                  ? "Confirmar turno de gimnasio"
                  : selected.kind === "campaign"
                    ? "Confirmar inscripción a campaña"
                    : selected.kind === "social"
                      ? "Confirmar solicitud de orientación"
                      : "Confirmar registro"
          }
          onClose={() => setSelected(null)}
        >
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <span className="service-icon green">
            <CalendarDays />
          </span>
          <h3>{selected.title}</h3>
          <p>
            {prettyDate(selected.date)} · {selected.time}
          </p>
          <p>{selected.location}</p>
          <p className="fine">
            Al confirmar se guardará el registro en el prototipo local. Los
            horarios y profesionales son de demostración.
          </p>
          <button
            className="primary wide"
            disabled={busy}
            onClick={() =>
              operation(
                {
                  action: "reserve",
                  resourceId: selected.id,
                  requestId: crypto.randomUUID(),
                },
                "¡Registro confirmado! Puedes ver el detalle en Mis atenciones y citas.",
              )
            }
          >
            {busy
              ? "Confirmando…"
              : selected.kind === "appointment"
                ? "Confirmar cita"
                : selected.kind === "dining"
                  ? "Confirmar acceso"
                  : "Confirmar registro"}
            <Check size={17} />
          </button>
        </Modal>
      )}
      {cancel && (
        <Modal title="Cancelar registro" onClose={() => setCancel(null)}>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <p>Se liberará tu cupo en {cancel.title}.</p>
          <button
            className="danger wide"
            disabled={busy}
            onClick={() =>
              operation(
                { action: "cancel", bookingId: cancel.id },
                "Atención cancelada. El cupo está disponible nuevamente.",
              )
            }
          >
            Confirmar cancelación
          </button>
        </Modal>
      )}
      {ticket && (
        <Modal title="Código de tu reserva" onClose={() => setTicket(null)}>
          <div className="ticket">
            <ReservationQR id={ticket.id} token={ticket.token} />
            <h3>{ticket.title}</h3>
            <p>
              {ticket.date && prettyDate(ticket.date)} · {ticket.time}
            </p>
            <span className="tag">{labels[ticket.status]}</span>
            <code>{ticket.token}</code>
            <p className="fine">
              Presenta este QR al personal autorizado. También puedes utilizar
              el código de texto. El escaneo por cámara está pendiente.
            </p>
          </div>
        </Modal>
      )}
      {qualityForm && (
        <Modal
          title="Nueva acción correctiva"
          onClose={() => setQualityForm(false)}
        >
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void operation(
                {
                  action: "quality",
                  title: f.get("title"),
                  description: f.get("description"),
                  owner: f.get("owner"),
                  due: f.get("due"),
                },
                "Acción correctiva registrada",
              );
            }}
          >
            <label>
              Título
              <input name="title" minLength={8} maxLength={160} required />
            </label>
            <label>
              Problema y acción propuesta
              <textarea
                name="description"
                minLength={10}
                maxLength={1500}
                required
              />
            </label>
            <label>
              Responsable
              <input name="owner" minLength={3} maxLength={100} required />
            </label>
            <label>
              Fecha límite
              <input type="date" name="due" required />
            </label>
            <button className="primary wide" disabled={busy}>
              Guardar acción
            </button>
          </form>
        </Modal>
      )}
      {notifications && (
        <Modal title="Notificaciones" onClose={() => setNotifications(false)}>
          {active.length ? (
            <>
              <p>
                Tienes {active.length} reservas activas en esta demostración.
              </p>
              <button
                className="primary"
                onClick={() => {
                  go("bookings");
                  setNotifications(false);
                }}
              >
                Ver mis reservas
              </button>
            </>
          ) : (
            <div className="empty">
              <Bell />
              <p>No tienes notificaciones pendientes.</p>
            </div>
          )}
          <p className="fine">
            No se envían correos ni recordatorios externos.
          </p>
        </Modal>
      )}
    </div>
  );
}
function Stat({
  title,
  value,
  note,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  note: string;
  icon: typeof HeartPulse;
  color: string;
}) {
  return (
    <article className="stat">
      <div>
        <span>{title}</span>
        <b>{value}</b>
        <small>{note}</small>
      </div>
      <span className={"stat-icon " + color}>
        <Icon size={20} />
      </span>
    </article>
  );
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLDialogElement>("dialog");
    dialog?.showModal();
    return () => {
      previous?.focus();
    };
  }, []);
  return (
    <dialog className="modal" onCancel={onClose} aria-label={title}>
      <div className="modal-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Cerrar diálogo"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function BookingTable({
  bookings,
  actor,
  busy,
  onCancel,
  onTicket,
  onOperation,
}: {
  bookings: Booking[];
  actor: Actor;
  busy: boolean;
  onCancel: (b: Booking) => void;
  onTicket: (b: Booking) => void;
  onOperation: (body: object, success?: string) => Promise<boolean>;
}) {
  const [filter, setFilter] = useState("");
  return (
    <section className="panel bookings-panel">
      <div className="toolbar">
        <h2>Atenciones, citas y seguimiento</h2>
        <select
          aria-label="Filtrar por estado"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {Object.entries(labels)
            .slice(0, 7)
            .map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
        </select>
      </div>
      {bookings.filter((b) => !filter || b.status === filter).length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Servicio / estudiante</th>
                <th>Fecha y hora</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bookings
                .filter((b) => !filter || b.status === filter)
                .map((b) => (
                  <tr key={b.id}>
                    <td>
                      <b>{b.title}</b>
                      <small>{b.name}</small>
                    </td>
                    <td>
                      {b.date && prettyDate(b.date)}
                      <small>{b.time}</small>
                    </td>
                    <td>
                      <span
                        className={
                          "status " +
                          (b.status === "CANCELADA" ? "cancelled" : "")
                        }
                      >
                        {labels[b.status]}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="text-button"
                          onClick={() => onTicket(b)}
                        >
                          Ver código
                        </button>
                        {["CONFIRMADA", "EN_ESPERA"].includes(b.status) &&
                          (b.user_id === actor.id ||
                            canOperate(actor, b.kind!)) && (
                            <button
                              className="text-button muted"
                              disabled={busy}
                              onClick={() => onCancel(b)}
                            >
                              Cancelar
                            </button>
                          )}
                        {b.kind && canOperate(actor, b.kind) && (
                          <>
                            {b.status === "CONFIRMADA" && (
                              <button
                                className="outline small-button"
                                disabled={busy}
                                onClick={() => {
                                  const presented = window.prompt(
                                    "Introduce el código o contenido QR presentado por el estudiante",
                                  );
                                  let token = presented;
                                  if (presented?.trim().startsWith("{")) {
                                    try {
                                      const payload = JSON.parse(presented) as {
                                        bookingId?: string;
                                        token?: string;
                                      };
                                      token =
                                        payload.bookingId === b.id &&
                                        typeof payload.token === "string"
                                          ? payload.token
                                          : "invalid-qr";
                                    } catch {
                                      token = "invalid-qr";
                                    }
                                  }
                                  if (token)
                                    void onOperation(
                                      {
                                        action:
                                          b.kind === "dining"
                                            ? "consume"
                                            : "checkin",
                                        bookingId: b.id,
                                        token,
                                      },
                                      "Asistencia registrada",
                                    );
                                }}
                              >
                                {b.kind === "dining"
                                  ? "Entregar ración"
                                  : "Registrar llegada"}
                              </button>
                            )}
                            {b.status === "EN_ESPERA" && (
                              <button
                                className="outline small-button"
                                disabled={busy}
                                onClick={() =>
                                  onOperation(
                                    { action: "call", bookingId: b.id },
                                    "Turno llamado",
                                  )
                                }
                              >
                                Llamar turno
                              </button>
                            )}
                            {b.status === "EN_ATENCION" && (
                              <button
                                className="outline small-button"
                                disabled={busy}
                                onClick={() =>
                                  onOperation(
                                    {
                                      action:
                                        b.kind === "gym" ? "exit" : "finish",
                                      bookingId: b.id,
                                    },
                                    "Atención finalizada",
                                  )
                                }
                              >
                                Finalizar
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <CalendarDays size={32} />
          <h3>Todo listo para tu primera atención o cita</h3>
          <p>Las atenciones y citas registradas aparecerán aquí.</p>
        </div>
      )}
    </section>
  );
}
