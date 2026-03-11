import { minutosParaHora } from "./time";

const SLOT = 50;

const ABERTURA = 8 * 60;
const FECHAMENTO = 20 * 60;

const DOMINGO_FECHA = 12 * 60;

const ALMOCO_INICIO1 = 12 * 60;
const ALMOCO_FIM = 14 * 60;

const ALMOCO_INICIO = ALMOCO_INICIO1 +20;

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

  const inicioDia = ABERTURA;
  const fimDia = isDomingo(data) ? DOMINGO_FECHA : FECHAMENTO;

  const horarios = [];

  for (let inicio = inicioDia; inicio + SLOT <= fimDia; inicio += SLOT) {

    const fim = inicio + SLOT;

    /* pausa almoço */
    if (inicio < ALMOCO_FIM && fim > ALMOCO_INICIO) {
      continue;
    }

    /* conflito com agendamento */
    const conflito = agendamentos.some(a =>
      inicio < a.fimMinutos && fim > a.inicioMinutos
    );

    if (conflito) continue;

    horarios.push({
      inicioMinutos: inicio,
      fimMinutos: fim,
      inicio: minutosParaHora(inicio),
      fim: minutosParaHora(fim)
    });

  }

  return horarios;
}