"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  ScanLine,
  LogIn,
  LogOut,
  ShieldCheck,
  Users,
  DoorOpen,
} from "lucide-react";
type Overview = {
  capacity: number;
  inside: number;
  available: number;
  events: { id: string; direction: string; created_at: string; name: string }[];
};
type Detector = {
  detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
};
export function GymAccessPanel({
  onChange,
}: {
  onChange: () => Promise<void>;
}) {
  const [data, setData] = useState<Overview | null>(null),
    [direction, setDirection] = useState<"entry" | "exit">("entry"),
    [qr, setQr] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [camera, setCamera] = useState(false);
  const video = useRef<HTMLVideoElement>(null),
    stream = useRef<MediaStream | null>(null),
    running = useRef(false);
  const stop = useCallback(() => {
    running.current = false;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setCamera(false);
  }, []);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/gym-access", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setData(d);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo consultar el aforo",
      );
    }
  }, []);
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0);
    const id = setInterval(() => void refresh(), 5000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
      running.current = false;
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, [refresh]);
  async function scan(value: string) {
    if (!value.trim()) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const r = await fetch("/api/gym-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan", direction, qr: value }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setData(d);
      setQr("");
      setSuccess(
        direction === "entry"
          ? "Ingreso autorizado y registrado"
          : "Salida registrada y cupo liberado",
      );
      await onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo validar");
    } finally {
      setBusy(false);
    }
  }
  async function createSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/gym-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          date: fields.get("date"),
          time: fields.get("time"),
          capacity: Number(fields.get("capacity")),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await onChange();
      form.reset();
      setSuccess("Horario creado. Ya está disponible para reservar.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el horario");
    } finally {
      setBusy(false);
    }
  }
  async function startCamera() {
    setError("");
    setSuccess("");
    const DetectorClass = (
      window as unknown as {
        BarcodeDetector?: new (options: { formats: string[] }) => Detector;
      }
    ).BarcodeDetector;
    if (!DetectorClass || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "Este navegador no admite el lector de cámara. Usa un lector QR USB o pega el pase copiado del estudiante.",
      );
      return;
    }
    try {
      const detector = new DetectorClass({ formats: ["qr_code"] });
      running.current = true;
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (!running.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      setCamera(true);
      if (video.current) {
        video.current.srcObject = media;
        await video.current.play();
      }
      const loop = async () => {
        if (!running.current || !video.current) return;
        try {
          const codes = await detector.detect(video.current);
          if (codes[0]) {
            stop();
            await scan(codes[0].rawValue);
            return;
          }
          setTimeout(() => void loop(), 250);
        } catch {
          stop();
          setError("No se pudo leer la cámara. Prueba con el código de texto.");
        }
      };
      void loop();
    } catch {
      stop();
      setError("No se pudo abrir la cámara. Revisa el permiso del navegador.");
    }
  }
  return (
    <section
      className="gym-control panel"
      aria-label="Control de acceso al gimnasio"
    >
      <header className="gym-control-header">
        <div>
          <span className="eyebrow">ACCESO INTELIGENTE</span>
          <h2>Un pase. Un ingreso seguro.</h2>
          <p>Valida reservas y controla la ocupación desde un solo lugar.</p>
        </div>
        <span className="gym-mode">
          <span className="dot" />
          Simulador · sin hardware
        </span>
      </header>
      <div className="gym-metrics">
        <div>
          <Users size={20} />
          <strong>
            {data?.inside ?? "—"}
            <small> / {data?.capacity ?? "—"}</small>
          </strong>
          <span>Personas con ingreso activo</span>
        </div>
        <div>
          <DoorOpen size={20} />
          <strong>{data?.available ?? "—"}</strong>
          <span>Plazas disponibles</span>
        </div>
        <div>
          <ShieldCheck size={20} />
          <strong>QR de 60 s</strong>
          <span>Horario, reserva y uso único</span>
        </div>
      </div>
      <details className="gym-schedule">
        <summary>＋ Abrir un nuevo horario de reservas</summary>
        <form onSubmit={createSchedule}>
          <label>
            Fecha en Perú
            <input name="date" type="date" required />
          </label>
          <label>
            Inicio · sesión de 60 min
            <input name="time" type="time" required />
          </label>
          <label>
            Cupos
            <input
              name="capacity"
              type="number"
              min={1}
              max={data?.capacity ?? 20}
              defaultValue={15}
              required
            />
          </label>
          <button className="primary" disabled={busy}>
            Publicar horario
          </button>
        </form>
      </details>
      <div className="gym-control-grid">
        <div className="gym-scanner">
          <div
            className="gym-direction"
            role="group"
            aria-label="Dirección del acceso"
          >
            <button
              type="button"
              aria-pressed={direction === "entry"}
              disabled={busy || camera}
              onClick={() => {
                setDirection("entry");
                setSuccess("");
              }}
            >
              <LogIn size={17} />
              Ingreso
            </button>
            <button
              type="button"
              aria-pressed={direction === "exit"}
              disabled={busy || camera}
              onClick={() => {
                setDirection("exit");
                setSuccess("");
              }}
            >
              <LogOut size={17} />
              Salida
            </button>
          </div>
          <div className="gym-scan-target">
            <ScanLine size={42} />
            <b>
              {direction === "entry" ? "Validar ingreso" : "Registrar salida"}
            </b>
            <p>Escanea el pase temporal del estudiante</p>
            <video
              ref={video}
              hidden={!camera}
              muted
              playsInline
              aria-label="Vista previa del lector QR"
            />
            <button
              className="outline"
              type="button"
              disabled={busy}
              onClick={() => (camera ? stop() : void startCamera())}
            >
              <Camera size={16} />
              {camera ? "Detener cámara" : "Activar cámara"}
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void scan(qr);
            }}
          >
            <label htmlFor="gym-qr">Código de lector o pase copiado</label>
            <textarea
              id="gym-qr"
              value={qr}
              maxLength={700}
              onChange={(e) => setQr(e.target.value)}
              placeholder="Pega aquí el contenido del QR temporal"
              rows={3}
              required
              disabled={busy || camera}
            />
            <button
              type="submit"
              className="primary wide"
              disabled={busy || camera || !qr.trim()}
            >
              {busy
                ? "Validando…"
                : direction === "entry"
                  ? "Autorizar ingreso simulado"
                  : "Confirmar salida"}
            </button>
          </form>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {success && (
            <div role="status" className="gym-access-success">
              <ShieldCheck size={23} />
              <div>
                <b>{success}</b>
                <p>
                  Validación completada. No se envió ninguna señal a una puerta
                  física.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="gym-event-list">
          <h3>Últimos movimientos</h3>
          <p className="fine">
            Ocupación calculada con los registros QR; no es una medición por
            sensores. Se actualiza cada 5 segundos.
          </p>
          {data?.events.length ? (
            data.events.map((e) => (
              <div className="gym-event" key={e.id}>
                <span className={"gym-event-icon " + e.direction}>
                  {e.direction === "entry" ? (
                    <LogIn size={17} />
                  ) : (
                    <LogOut size={17} />
                  )}
                </span>
                <div>
                  <b>{e.name}</b>
                  <small>
                    {e.direction === "entry"
                      ? "Ingreso autorizado"
                      : "Salida registrada"}{" "}
                    ·{" "}
                    {new Date(e.created_at).toLocaleString("es-PE", {
                      timeZone: "America/Lima",
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                    })}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <div className="gym-no-events">
              <ScanLine size={28} />
              <p>El próximo acceso aparecerá aquí.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
