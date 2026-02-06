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

  for (
    let inicio = inicioDia;
    inicio + duracaoTotal <= fimDia;
    inicio += INTERVALO_MINUTOS
  ) {
    const fim = inicio + duracaoTotal;

    // 1️⃣ Verificar se invade pausa
    const invadePausa = pausas.some(p =>
      inicio < p.fim && fim > p.inicio
    );
    if (invadePausa) continue;

    // 2️⃣ Verificar conflito com agendamento existente
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
