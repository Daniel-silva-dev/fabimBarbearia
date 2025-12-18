import "../componentsStyle/form.css"
import { useState } from "react";
const horariosDisponiveis = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00"
];



export default function Form({ onSubmit }) {
  
  const [nome, setNome] = useState("");
  const [horario, setHorario] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const novoEvento = {
      nome,
      horario
    };

    onSubmit(novoEvento);

    setNome("");
    setHorario("");
  }

  return (
<div className="container">
      <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <select
        value={horario}
        onChange={(e) => setHorario(e.target.value)}
        required
      >
        <option value="">Selecione o horário</option>

        {horariosDisponiveis.map((hora, index) => (
          <option key={index} value={hora}>
            {hora}
          </option>
        ))}
      </select>


      <button type="submit" className="btnSubmit">Adicionar</button>
    </form>
</div>
  );
}
