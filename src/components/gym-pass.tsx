"use client";
import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { RefreshCw, ShieldCheck, Copy } from "lucide-react";
export function GymPass({ bookingId }: { bookingId: string }) {
  const [pass, setPass] = useState<{
    qr: string;
    image: string;
    expiresAt: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const renew = useCallback(
    async (signal?: AbortSignal) => {
      setError("");
      setPass(null);
      setCopied(false);
      try {
        const r = await fetch("/api/gym-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "issue", bookingId }),
          signal,
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        const image = await QRCode.toDataURL(data.qr, {
          width: 260,
          margin: 2,
          errorCorrectionLevel: "M",
        });
        if (!signal?.aborted) {
          setNow(Date.now());
          setPass({ ...data, image });
        }
      } catch (e) {
        if (!signal?.aborted)
          setError(
            e instanceof Error ? e.message : "No se pudo generar el pase",
          );
      }
    },
    [bookingId],
  );
  useEffect(() => {
    const controller = new AbortController();
    const initial = setTimeout(() => void renew(controller.signal), 0);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(initial);
      controller.abort();
      clearInterval(clock);
    };
  }, [renew]);
  const seconds = pass
    ? Math.max(0, Math.ceil((pass.expiresAt - now) / 1000))
    : 0;
  return (
    <div className="gym-pass">
      <span className="tag">
        <ShieldCheck size={15} /> Pase de gimnasio · QR temporal
      </span>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : pass ? (
        <>
          <div
            className={seconds ? "gym-pass-image" : "gym-pass-image expired"}
          >
            <img
              src={pass.image}
              alt="QR temporal de acceso al gimnasio"
              width={260}
              height={260}
            />
          </div>
          <p role="status">
            {seconds
              ? `Válido durante ${seconds} segundos · un solo uso`
              : "QR vencido. Genera un nuevo pase."}
          </p>
        </>
      ) : (
        <p role="status">Preparando tu pase…</p>
      )}
      <div className="gym-pass-actions">
        <button type="button" className="outline" onClick={() => void renew()}>
          <RefreshCw size={16} />
          Nuevo QR
        </button>
        {pass && seconds > 0 && (
          <button
            type="button"
            className="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(pass.qr);
                setCopied(true);
              } catch {
                setError("No se pudo copiar. Presenta el QR en pantalla.");
              }
            }}
          >
            <Copy size={16} />
            {copied ? "Copiado" : "Copiar para simulador"}
          </button>
        )}
      </div>
      <p className="fine">
        Presenta este pase al ingresar y genera uno nuevo al salir. Ingreso
        desde 10 minutos antes; sesión de 60 minutos. Control simulado, sin
        puerta conectada.
      </p>
    </div>
  );
}
