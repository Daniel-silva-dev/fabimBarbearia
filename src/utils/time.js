export function horaParaMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function minutosParaHora(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
