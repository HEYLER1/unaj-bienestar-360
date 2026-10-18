import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import type { Actor, Booking, Resource } from "@/domain/rules";
const globalDb = globalThis as unknown as { wellnessDb?: DatabaseSync };
function initializeDatabase(): DatabaseSync {
  mkdirSync("data", { recursive: true });
  const instance = new DatabaseSync(
    process.env.TEST_DB ?? "data/bienestar.sqlite",
  );
  globalDb.wellnessDb = instance;
  try {
    instance.exec(`PRAGMA busy_timeout=5000;PRAGMA journal_mode=WAL;PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,roles TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS login_attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,until_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS resources(id TEXT PRIMARY KEY,kind TEXT NOT NULL,title TEXT NOT NULL,description TEXT NOT NULL,date TEXT NOT NULL,time TEXT NOT NULL,capacity INTEGER NOT NULL CHECK(capacity>0),location TEXT NOT NULL,staff TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS bookings(id TEXT PRIMARY KEY,resource_id TEXT NOT NULL REFERENCES resources(id),user_id TEXT NOT NULL REFERENCES users(id),status TEXT NOT NULL,token TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,request_id TEXT UNIQUE NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_booking ON bookings(resource_id,user_id) WHERE status NOT IN ('CANCELADA','NO_ASISTIO');
CREATE TABLE IF NOT EXISTS audit_logs(id TEXT PRIMARY KEY,actor_id TEXT NOT NULL,action TEXT NOT NULL,resource_id TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS quality_actions(id TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL,owner TEXT NOT NULL,due TEXT NOT NULL,status TEXT NOT NULL,evidence TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS quality_action_history(id TEXT PRIMARY KEY,quality_id TEXT NOT NULL REFERENCES quality_actions(id),actor_id TEXT NOT NULL REFERENCES users(id),status TEXT NOT NULL,evidence TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS waste_records(id TEXT PRIMARY KEY,prepared INTEGER NOT NULL,delivered INTEGER NOT NULL,recoverable REAL NOT NULL,waste REAL NOT NULL,created_at TEXT NOT NULL);
`);
    seedDatabase();
    return instance;
  } catch (error) {
    globalDb.wellnessDb = undefined;
    instance.close();
    throw error;
  }
}
function connection() {
  return globalDb.wellnessDb ?? initializeDatabase();
}
// La importación de un Route Handler no abre ni modifica la base de datos.
export const db = {
  prepare(sql: string) {
    return connection().prepare(sql);
  },
  exec(sql: string) {
    return connection().exec(sql);
  },
};
export function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function checkPassword(password: string, hash: string) {
  const [salt, key] = hash.split(":");
  return timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(key, "hex"),
  );
}
export function transaction<T>(fn: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const v = fn();
    db.exec("COMMIT");
    return v;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
export function audit(actor: Actor, action: string, id: string) {
  db.prepare("INSERT INTO audit_logs VALUES(?,?,?,?,?)").run(
    randomUUID(),
    actor.id,
    action,
    id,
    new Date().toISOString(),
  );
}
export function getResource(id: string) {
  return db.prepare("SELECT * FROM resources WHERE id=?").get(id) as
    Resource | undefined;
}
export function getBooking(id: string) {
  return db.prepare("SELECT * FROM bookings WHERE id=?").get(id) as
    Booking | undefined;
}
function seedDatabase() {
  transaction(() => {
    const users = [
      ["student", "Lucía Quispe · Demo", "estudiante@demo.local", ["student"]],
      [
        "student2",
        "Diego Mamani · Demo",
        "estudiante2@demo.local",
        ["student"],
      ],
      [
        "admin",
        "Valeria Flores · Demo",
        "gestion@demo.local",
        ["coordinator", "quality", "dining", "gym", "doctor"],
      ],
      [
        "tech",
        "Administrador técnico · Demo",
        "tecnico@demo.local",
        ["technical"],
      ],
    ] as const;
    for (const [id, name, email, roles] of users)
      if (!db.prepare("SELECT id FROM users WHERE id=?").get(id))
        db.prepare("INSERT INTO users VALUES(?,?,?,?,?)").run(
          id,
          name,
          email,
          passwordHash("Demo360!2026"),
          JSON.stringify(roles),
        );
    const day = new Date();
    day.setDate(day.getDate() + 1);
    const date = day.toLocaleDateString("en-CA", { timeZone: "America/Lima" });
    const resources: Resource[] = [
      {
        id: "med-1",
        kind: "appointment",
        title: "Medicina general",
        description:
          "Orientación y atención médica administrativa de demostración.",
        date,
        time: "09:00",
        capacity: 1,
        location: "Consultorio 01 · Sede demo",
        staff: "Dra. Ana Torres · Ficticia",
      },
      {
        id: "med-2",
        kind: "appointment",
        title: "Medicina general",
        description: "Consulta programada de demostración.",
        date,
        time: "10:00",
        capacity: 1,
        location: "Consultorio 01 · Sede demo",
        staff: "Dra. Ana Torres · Ficticia",
      },
      {
        id: "psy-1",
        kind: "appointment",
        title: "Acompañamiento psicológico",
        description: "Agenda privada; sin notas clínicas en este prototipo.",
        date,
        time: "11:00",
        capacity: 1,
        location: "Consultorio 02 · Sede demo",
        staff: "Psic. Elena Rojas · Ficticia",
      },
      {
        id: "camp-1",
        kind: "campaign",
        title: "Jornada de bienestar integral",
        description:
          "Campaña ficticia. Estaciones propuestas: triaje, medicina y nutrición. Tiempo de espera aproximado.",
        date,
        time: "08:00",
        capacity: 40,
        location: "Patio central · Sede demo",
        staff: "Equipo de bienestar · Demo",
      },
      {
        id: "food-1",
        kind: "dining",
        title: "Almuerzo universitario",
        description:
          "Quinua con verduras, pollo al horno y fruta de estación. Menú ficticio.",
        date,
        time: "12:00",
        capacity: 80,
        location: "Comedor · Sede demo",
        staff: "Equipo de alimentación · Demo",
      },
      {
        id: "gym-1",
        kind: "gym",
        title: "Entrenamiento libre",
        description:
          "Turno de 60 minutos. Reserva y control de ingreso y salida.",
        date,
        time: "16:00",
        capacity: 15,
        location: "Gimnasio · Sede demo",
        staff: "Equipo deportivo · Demo",
      },
      {
        id: "gym-2",
        kind: "gym",
        title: "Entrenamiento libre",
        description:
          "Turno de 60 minutos. Reserva y control de ingreso y salida.",
        date,
        time: "17:00",
        capacity: 15,
        location: "Gimnasio · Sede demo",
        staff: "Equipo deportivo · Demo",
      },
      {
        id: "act-1",
        kind: "activity",
        title: "Taller de danzas del altiplano",
        description: "Actividad cultural propuesta; duración de 60 minutos.",
        date,
        time: "15:00",
        capacity: 25,
        location: "Sala cultural · Sede demo",
        staff: "Coordinación cultural · Demo",
      },
      {
        id: "social-1",
        kind: "social",
        title: "Orientación de apoyo estudiantil",
        description:
          "Solicitud administrativa ficticia. No adjuntar datos socioeconómicos reales.",
        date,
        time: "14:00",
        capacity: 10,
        location: "Servicio social · Sede demo",
        staff: "Equipo de servicio social · Demo",
      },
    ];
    for (const r of resources)
      db.prepare(
        "INSERT OR IGNORE INTO resources VALUES(?,?,?,?,?,?,?,?,?)",
      ).run(
        r.id,
        r.kind,
        r.title,
        r.description,
        r.date,
        r.time,
        r.capacity,
        r.location,
        r.staff,
      );
    if (!db.prepare("SELECT id FROM quality_actions LIMIT 1").get())
      db.prepare("INSERT INTO quality_actions VALUES(?,?,?,?,?,?,?,?)").run(
        randomUUID(),
        "Reducir las inasistencias a citas",
        "Propuesta: evaluar confirmaciones y recordatorios discretos. Línea base pendiente de medición.",
        "Responsable de calidad · Demo",
        date,
        "EN_CURSO",
        "",
        new Date().toISOString(),
      );
  });
}
