export const INTERVALO_MINUTOS = 10;

export function getRegrasDoDia(dataISO) {
  const data = new Date(dataISO + "T00:00:00");
  const diaSemana = data.getDay(); // 0=domingo, 1=segunda...

  // Segunda fechada
  if (diaSemana === 1) {
    return { aberto: false };
  }

  // Domingo até 12h
  if (diaSemana === 0) {
    return {
      aberto: true,
      inicio: "08:00",
      fim: "12:00",
      pausas: []
    };
  }

  // Terça a sábado padrão
  return {
    aberto: true,
    inicio: "08:00",
    fim: "20:00",
    pausas: [
      { inicio: "12:00", fim: "14:00" }
    ]
  };
}
