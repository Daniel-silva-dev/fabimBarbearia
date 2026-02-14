import { SERVICOS } from "../config/servicos";
import { getRegrasDoDia } from "../config/funcionamento";

import { horaParaMinutos, minutosParaHora } from "./time";

function calcularDuracaoTotal(servicosSelecionados = []) {
  return servicosSelecionados.reduce((total, chave) => {
    return total + (SERVICOS[chave]?.duracao || 0);
  }, 0);
}

export function gerarHorariosDisponiveis({
  data,
  servicosSelecionados = [],
  agendamentosDoDia = []
}) {

  const regras = getRegrasDoDia(data);

  if (!regras?.aberto) {
    return {
      fechado: true,
      horarios: []
    };
  }

  const duracaoTotal = calcularDuracaoTotal(servicosSelecionados);

  if (!duracaoTotal) {
    return {
      fechado: false,
      horarios: []
    };
  }

  const inicioDia = horaParaMinutos(regras.inicio);
  const fimDia = horaParaMinutos(regras.fim);

  const pausas = (regras.pausas || []).map(p => ({
    inicio: horaParaMinutos(p.inicio),
    fim: horaParaMinutos(p.fim)
  }));

  const ocupados = agendamentosDoDia.map(a => ({
    inicio: a.inicioMinutos,
    fim: a.fimMinutos
  }));

  const horariosValidos = [];

  const BASE_INTERVALO = 20;

  for (
    let inicio = inicioDia;
    inicio + duracaoTotal <= fimDia;
    inicio += BASE_INTERVALO
  ) {

    const fim = inicio + duracaoTotal;

    // Verifica pausa
    const invadePausa = pausas.some(p =>
      inicio < p.fim && fim > p.inicio
    );
    if (invadePausa) continue;

    // Verifica conflito
    const conflito = ocupados.some(o =>
      inicio < o.fim && fim > o.inicio
    );
    if (conflito) continue;

    horariosValidos.push(
      minutosParaHora(inicio)
    );
  }

  return {
    fechado: false,
    horarios: horariosValidos
  };
}
