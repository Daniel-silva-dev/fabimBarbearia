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

  for (
    let inicio = inicioExpediente;
    inicio + duracao <= fimExpediente;
    inicio += 10
  ) {
    const fim = inicio + duracao;

    // Bloqueia almoço
    if (inicio < ALMOCO_FIM && fim > ALMOCO_INICIO) continue;

    const conflito = agendamentos.some((ag) => {
      return inicio < ag.fimMinutos && fim > ag.inicioMinutos;
    });

    if (!conflito) {
      // 🔥 CALCULA PRIORIDADE (evita buracos)
      let menorEspaco = Infinity;

      agendamentos.forEach((ag) => {
        const espacoAntes = Math.abs(inicio - ag.fimMinutos);
        const espacoDepois = Math.abs(ag.inicioMinutos - fim);

        if (espacoAntes >= 0 && espacoAntes < menorEspaco) {
          menorEspaco = espacoAntes;
        }

        if (espacoDepois >= 0 && espacoDepois < menorEspaco) {
          menorEspaco = espacoDepois;
        }
      });

      horarios.push({
        inicioMinutos: inicio,
        fimMinutos: fim,
        inicio: minutosParaHora(inicio),
        fim: minutosParaHora(fim),
        prioridade: menorEspaco
      });
    }
  }

  // 🔥 Ordena priorizando melhor encaixe
  horarios.sort((a, b) => a.prioridade - b.prioridade);

  return horarios;
}
