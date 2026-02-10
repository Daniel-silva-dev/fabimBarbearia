import { minutosParaHora } from "./time";

const ABERTURA = 8 * 60;   // 08:00
const FECHAMENTO = 20 * 60; // 20:00

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
  duracao,
  agendamentos,
  segundaFechada = false
}) {
  if (!data || !duracao) return [];

  if (segundaFechada && isSegunda(data)) return [];

  const domingo = isDomingo(data);

  const inicioExpediente = ABERTURA;
  const fimExpediente = domingo ? 12 * 60 : FECHAMENTO;

  const horarios = [];

  const BASE_INTERVALO = 30;

  let pontosInicio = [];

  // 1️⃣ Base fixa de 30 em 30
  for (let m = inicioExpediente; m < fimExpediente; m += BASE_INTERVALO) {
    pontosInicio.push(m);
  }

  // 2️⃣ Adiciona finais de agendamentos para permitir encaixe inteligente
  agendamentos.forEach((ag) => {
    if (
      ag.fimMinutos >= inicioExpediente &&
      ag.fimMinutos < fimExpediente
    ) {
      pontosInicio.push(ag.fimMinutos);
    }
  });

  // 3️⃣ Remove duplicados e ordena
  pontosInicio = [...new Set(pontosInicio)].sort((a, b) => a - b);

  // 4️⃣ Gera horários válidos
  for (let inicio of pontosInicio) {

    // 🔥 AQUI FOI A MUDANÇA
    // Agora só bloqueia se começar depois das 20:00
    if (inicio >= fimExpediente) continue;

    const fim = inicio + duracao;

    // Bloqueia almoço
    if (inicio < ALMOCO_FIM && fim > ALMOCO_INICIO) continue;

    const conflito = agendamentos.some((ag) => {
      return inicio < ag.fimMinutos && fim > ag.inicioMinutos;
    });

    if (!conflito) {
      horarios.push({
        inicioMinutos: inicio,
        fimMinutos: fim,
        inicio: minutosParaHora(inicio),
        fim: minutosParaHora(fim),
      });
    }
  }

  horarios.sort((a, b) => a.inicioMinutos - b.inicioMinutos);

  return horarios;
}
