import { minutosParaHora } from "./time";
import { SERVICOS } from "../config/servicos";

const ABERTURA = 8 * 60;
const FECHAMENTO = 20 * 60;

const BASE_INTERNA = 20;
const INTERVALO = 5;

const ALMOCO_INICIO = 12 * 60;
const ALMOCO_FIM = 14 * 60;

function isDomingo(data) {
  return new Date(data + "T00:00:00").getDay() === 0;
}

function isSegunda(data) {
  return new Date(data + "T00:00:00").getDay() === 1;
}

function calcularDuracaoTotal(servicosSelecionados = []) {
  return servicosSelecionados.reduce((total, chave) => {
    return total + (SERVICOS[chave]?.duracao || 0);
  }, 0);
}

export function gerarHorariosDisponiveis({
  data,
  agendamentos = [],
  servicosSelecionados = [],
  segundaFechada = false
}) {

  if (!data) return [];

  if (segundaFechada && isSegunda(data)) return [];

  const duracaoTotal = calcularDuracaoTotal(servicosSelecionados);
  if (!duracaoTotal) return [];

  const domingo = isDomingo(data);

  const inicioExpediente = ABERTURA;
  const fimExpediente = domingo ? 12 * 60 : FECHAMENTO;

  const horarios = [];

  for (
    let inicio = inicioExpediente;
    inicio + duracaoTotal <= fimExpediente;
    inicio += BASE_INTERNA
  ) {

    const fim = inicio + duracaoTotal;

    // Bloqueia almoço
    if (inicio < ALMOCO_FIM && fim > ALMOCO_INICIO) continue;

    // Verifica conflito (considerando intervalo)
    const conflito = agendamentos.some((ag) => {
      const agInicio = ag.inicioMinutos;
      const agFim = ag.fimMinutos + INTERVALO;

      return inicio < agFim && fim > agInicio;
    });

    if (conflito) continue;
    if ((inicio - inicioExpediente) % duracaoTotal !== 0) continue;

    horarios.push({
      inicioMinutos: inicio,
      fimMinutos: fim,
      inicio: minutosParaHora(inicio),
      fim: minutosParaHora(fim),
    });
  }

  return horarios;
}
