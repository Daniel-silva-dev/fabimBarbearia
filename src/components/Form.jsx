import "../componentsStyle/form.css";
import { useState } from "react";

const horariosDisponiveis = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00"
];

export default function Form({
  onSubmit,
  horariosBloqueados = [], 
  setDiaSelecionado

}) {
  const [nome, setNome] = useState("");
  const [horario, setHorario] = useState("");
  const [data, setData] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);



  function isDomingo(data) {
    const diaSemana = new Date(data + "T00:00:00").getDay();
    return diaSemana === 0;
  }

  function isPassado(data) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataItem = new Date(data + "T00:00:00");
    return dataItem < hoje;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!data || !horario) return;

    if (isDomingo(data)) {
      setErro("Não é possível agendar aos domingos.");
      return;
    }

    if (isPassado(data)) {
      setErro("Não é possível agendar em datas passadas.");
      return;
    }

    setLoading(true);

    const ok = await onSubmit({
      nome,
      horario,
      data,
      status: "ativo" // 🔥 NOVA REGRA
    });

    setLoading(false);

    if (ok === false) {
      setErro("Horário indisponível para este dia.");
      return;
    }

    setNome("");
    setHorario("");
    setData("");
    setSucesso("Agendamento realizado com sucesso!");

    setTimeout(() => setSucesso(""), 3000);
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-box">

        <h2>Agendar horário</h2>

        {erro && <p className="form-erro">{erro}</p>}
        {sucesso && <p className="form-sucesso">{sucesso}</p>}

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
            setDiaSelecionado(e.target.value); // 🔥 ESSENCIAL
            setHorario("");
          }}
          required
        />


        <select
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          disabled={!data}
          required
        >
          <option value="">Selecione o horário</option>

          {horariosDisponiveis.map((hora) => {
            const ocupado = horariosBloqueados.includes(hora);

            return (
              <option
                key={hora}
                value={hora}
                disabled={ocupado}
              >
                {hora} {ocupado ? "(ocupado)" : ""}
              </option>
            );
          })}
        </select>

        <button
          type="submit"
          disabled={loading}
          className={loading ? "btn-loading" : ""}
        >
          {loading ? "Salvando..." : "Agendar"}
        </button>

      </form>
    </div>
  );
}
