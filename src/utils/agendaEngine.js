import { minutosParaHora } from "./time";

const ABERTURA = 8 * 60;   // 08:00
const FECHAMENTO = 20 * 60; // 20:00

const DURACAO_FIXA = 40; // 40 minutos fixos
const INTERVALO = 5;     // 5 minutos entre atendimentos

const BLOCO_TOTAL = DURACAO_FIXA + INTERVALO;

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
  agendamentos,
  segundaFechada = false
}) {
  if (!data) return [];

  if (segundaFechada && isSegunda(data)) return [];

  const domingo = isDomingo(data);

  const inicioExpediente = ABERTURA;
  const fimExpediente = domingo ? 12 * 60 : FECHAMENTO;

  const horarios = [];

  for (
    let inicio = inicioExpediente;
    inicio <= fimExpediente;
    inicio += BLOCO_TOTAL
  ) {

    let inicioReal = inicio;

    // 🔥 Se cair exatamente 11:45, substitui por 11:40
    if (inicio === 11 * 60 + 45) {
      inicioReal = 11 * 60 + 40;
    }

    const fim = inicioReal + DURACAO_FIXA;

    // Bloqueia horário de almoço
    if (inicioReal < ALMOCO_FIM && fim > ALMOCO_INICIO + 30) continue;

    // Verifica conflito (considerando intervalo também)
    const conflito = agendamentos.some((ag) => {
      const agInicio = ag.inicioMinutos;
      const agFim = ag.fimMinutos + INTERVALO;

      return inicioReal < agFim && fim > agInicio;
    });

    if (!conflito) {
      horarios.push({
        inicioMinutos: inicioReal,
        fimMinutos: fim,
        inicio: minutosParaHora(inicioReal),
        fim: minutosParaHora(fim),
      });
    }
  }

  return horarios;
}
