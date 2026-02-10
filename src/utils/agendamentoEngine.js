import { SERVICOS } from "../config/servicos";
import { getRegrasDoDia, INTERVALO_MINUTOS } from "../config/funcionamento";

/* =========================
   Funções auxiliares
========================= */

import { horaParaMinutos, minutosParaHora } from "./time";



function calcularDuracaoTotal(servicosSelecionados) {
  return servicosSelecionados.reduce((total, chave) => {
    return total + (SERVICOS[chave]?.duracao || 0);
  }, 0);
}

/* =========================
   Função principal
========================= */

export function gerarHorariosDisponiveis({
  data,
  servicosSelecionados,
  agendamentosDoDia
}) {

  const regras = getRegrasDoDia(data);

  if (!regras.aberto) {
    return {
      fechado: true,
      horarios: []
    };
  }

  const duracaoTotal = calcularDuracaoTotal(servicosSelecionados);

  if (duracaoTotal === 0) {
    return {
      fechado: false,
      horarios: []
    };
  }

  const inicioDia = horaParaMinutos(regras.inicio);
  const fimDia = horaParaMinutos(regras.fim);

  const pausas = regras.pausas.map(p => ({
    inicio: horaParaMinutos(p.inicio),
    fim: horaParaMinutos(p.fim)
  }));

  // Converter agendamentos existentes
  const ocupados = agendamentosDoDia.map(a => ({
    inicio: a.inicioMinutos,
    fim: a.fimMinutos
  }));

  const horariosValidos = [];

  const BASE_INTERVALO = 30; // 👈 agora visualmente é 30min

  // Pegar finais de agendamentos como possíveis novos inícios
  const finaisOcupados = ocupados.map(o => o.fim);

  // Gerar pontos base (de 30 em 30)
  let pontosInicio = [];

  for (let m = inicioDia; m <= fimDia; m += BASE_INTERVALO) {
    pontosInicio.push(m);
  }

  // Adicionar finais de agendamentos como novos pontos possíveis
  finaisOcupados.forEach(fim => {
    if (fim >= inicioDia && fim < fimDia) {
      pontosInicio.push(fim);
    }
  });

  // Remover duplicados e ordenar
  pontosInicio = [...new Set(pontosInicio)].sort((a, b) => a - b);

  for (let inicio of pontosInicio) {
    const fim = inicio + duracaoTotal;

    if (fim > fimDia) continue;

    // 1️⃣ Verificar pausa
    const invadePausa = pausas.some(p =>
      inicio < p.fim && fim > p.inicio
    );
    if (invadePausa) continue;

    // 2️⃣ Verificar conflito
    const conflito = ocupados.some(o =>
      inicio < o.fim && fim > o.inicio
    );
    if (conflito) continue;

    horariosValidos.push({
      inicio,
      fim
    });
  }


  return {
    fechado: false,
    horarios: horariosValidos.map(h =>
      minutosParaHora(h.inicio)
    )
  };
}
