"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
export function ReservationQR({ id, token }: { id: string; token: string }) {
  const [image, setImage] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(JSON.stringify({ version: 1, bookingId: id, token }), {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (alive) setImage(url);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [id, token]);
  if (failed)
    return (
      <p role="alert">No se pudo generar el QR. Utiliza el código de texto.</p>
    );
  return image ? (
    <img
      src={image}
      width={220}
      height={220}
      alt="Código QR privado de esta reserva"
      style={{ margin: "15px auto", borderRadius: 8 }}
    />
  ) : (
    <p role="status">Generando QR…</p>
  );
}
