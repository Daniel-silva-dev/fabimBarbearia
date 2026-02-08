import "../componentsStyle/form.css";
import { useState, useMemo } from "react";
import { SERVICOS } from "../config/servicos";

export default function Form({ onSubmit, gerarHorarios }) {
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [alerta, setAlerta] = useState({
    tipo: "",
    mensagem: "",
    visivel: false
  });

  function mostrarAlerta(tipo, mensagem) {
    setAlerta({ tipo, mensagem, visivel: true });
    setTimeout(() => {
      setAlerta({ tipo: "", mensagem: "", visivel: false });
    }, 3000);
  }

  function handleServicoChange(servico) {
    setServicosSelecionados((prev) =>
      prev.includes(servico)
        ? prev.filter((s) => s !== servico)
        : [...prev, servico]
    );
  }

  // 🔥 CALCULAR DURAÇÃO TOTAL
  const duracaoTotal = useMemo(() => {
    return servicosSelecionados.reduce((total, chave) => {
      return total + (SERVICOS[chave]?.duracao || 0);
    }, 0);
  }, [servicosSelecionados]);

  // 💰 CALCULAR VALOR TOTAL
  const { totalFinal, descontoAplicado } = useMemo(() => {
    let total = servicosSelecionados.reduce((acc, chave) => {
      return acc + (SERVICOS[chave]?.preco || 0);
    }, 0);

    const nomesSelecionados = servicosSelecionados.map(
      (key) => SERVICOS[key]?.nome?.toLowerCase()
    );

    const temCabelo = nomesSelecionados.includes("cabelo");
    const temBarba = nomesSelecionados.includes("barba");
    const temSobrancelha = nomesSelecionados.includes("sobrancelha");

    let desconto = 0;

    if (temCabelo && temBarba && temSobrancelha) {
      desconto = 5;
      total -= desconto;
    }

    return { totalFinal: total, descontoAplicado: desconto };
  }, [servicosSelecionados]);

  const horariosDisponiveis = useMemo(() => {
    if (!data || duracaoTotal === 0) return [];
    return gerarHorarios(data, duracaoTotal);
  }, [data, duracaoTotal, gerarHorarios]);

  const horariosManha = horariosDisponiveis.filter(
    (h) => h.inicioMinutos < 12 * 60
  );

  const horariosTarde = horariosDisponiveis.filter(
    (h) => h.inicioMinutos >= 14 * 60
  );

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nome || !data || !horarioSelecionado || servicosSelecionados.length === 0) {
      mostrarAlerta("error", "Preencha todos os campos.");
      return;
    }

    setLoading(true);

    const ok = await onSubmit({
      nome,
      data,
      servicos: servicosSelecionados,
      inicio: horarioSelecionado.inicio,
      fim: horarioSelecionado.fim,
      inicioMinutos: horarioSelecionado.inicioMinutos,
      fimMinutos: horarioSelecionado.fimMinutos,
      status: "ativo",
      valorTotal: totalFinal // 🔥 ENVIA VALOR FINAL
    });

    setLoading(false);

    if (ok === false) {
      mostrarAlerta("error", "Esse horário não comporta os serviços selecionados.");
      return;
    }

    setNome("");
    setData("");
    setHorarioSelecionado(null);
    setServicosSelecionados([]);

    mostrarAlerta("success", `Agendamento realizado! Total: R$ ${totalFinal}`);
  }

  function renderBloco(titulo, lista) {
    if (lista.length === 0) return null;

    return (
      <>
        <h3 className="periodo-titulo">{titulo}</h3>
        <div className="horarios-grid">
          {lista.map((h) => (
            <button
              type="button"
              key={h.inicioMinutos}
              className={`horario-btn ${
                horarioSelecionado?.inicioMinutos === h.inicioMinutos
                  ? "ativo"
                  : ""
              }`}
              onClick={() => setHorarioSelecionado(h)}
            >
              <span>{h.inicio}</span>
              <small>até {h.fim}</small>
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="form-container">

      {alerta.visivel && (
        <div className="alert-overlay">
          <div className={`alert-box ${alerta.tipo}`}>
            {alerta.mensagem}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-box">
        <h2>Agendar horário</h2>

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          type="date"
          value={data}
          onChange={(e) => {
            setData(e.target.value);
            setHorarioSelecionado(null);
          }}
          required
        />

        <div className="servicos-box">
          <p>Selecione os serviços:</p>

          {Object.entries(SERVICOS).map(([key, servico]) => (
            <label
              key={key}
              className={`servico-item ${
                servicosSelecionados.includes(key) ? "checked" : ""
              }`}
            >
              <span>
                {servico.nome}  — {servico.preco} Reais
              </span>

              <input
                type="checkbox"
                checked={servicosSelecionados.includes(key)}
                onChange={() => handleServicoChange(key)}
              />
            </label>
          ))}
        </div>

        {/* 💰 RESUMO DO VALOR */}
        {servicosSelecionados.length > 0 && (
          <div className="resumo-preco">
            {descontoAplicado > 0 && (
              <p className="desconto-info">
                Desconto aplicado: -R$ {descontoAplicado}
              </p>
            )}
            <h3>Total: R$ {totalFinal}</h3>
          </div>
        )}

        <div className="horarios-box">
          <p>Horários disponíveis:</p>

          {!data || duracaoTotal === 0 ? (
            <p className="horario-info">Selecione data e serviços</p>
          ) : horariosDisponiveis.length === 0 ? (
            <p className="horario-info">Nenhum horário disponível</p>
          ) : (
            <>
              {renderBloco("Manhã", horariosManha)}
              {renderBloco("Tarde", horariosTarde)}
            </>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Agendar"}
        </button>
      </form>
    </div>
  );
}
