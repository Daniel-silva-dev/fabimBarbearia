import { minutosParaHora } from "./time";

const SLOT = 50;

const ABERTURA = 8 * 60;
const FECHAMENTO = 20 * 60;

const ALMOCO_INICIO = 12 * 60;
const ALMOCO_FIM = 14 * 60;

function isDomingo(data) {
  return new Date(data + "T00:00:00").getDay() === 0;
}

function isSegunda(data) {
  return new Date(data + "T00:00:00").getDay() === 1;
}

export function gerarHorariosDisponiveis({
  data,
  agendamentos = [],
  segundaFechada = false
}) {

  if (!data) return [];

  if (segundaFechada && isSegunda(data)) return [];

  const inicioExpediente = ABERTURA;
  const fimExpediente = isDomingo(data) ? 12 * 60 : FECHAMENTO;

  const horarios = [];

  for (
    let inicio = inicioExpediente;
    inicio + SLOT <= fimExpediente;
    inicio += SLOT
  ) {

    const fim = inicio + SLOT;

    // bloqueia almoço
    if (inicio < ALMOCO_FIM && fim > ALMOCO_INICIO) continue;

    const conflito = agendamentos.some((ag) => {
      const agInicio = ag.inicioMinutos;
      const agFim = ag.fimMinutos;

      return inicio < agFim && fim > agInicio;
    });

    if (conflito) continue;

    horarios.push({
      inicioMinutos: inicio,
      fimMinutos: fim,
      inicio: minutosParaHora(inicio),
      fim: minutosParaHora(fim),
    });
  }

  return horarios;
}