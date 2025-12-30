import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  query,
  orderBy,
  updateDoc,
  getDocs,
  addDoc
} from "firebase/firestore";

import { db } from "../services/firebase";
import "./admin.css";

export default function Admin() {
  const [filtroData, setFiltroData] = useState("");
  const [mostrarPassados, setMostrarPassados] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [dataBloqueio, setDataBloqueio] = useState("");
  const [horarioBloqueio, setHorarioBloqueio] = useState("");
  const [feedback, setFeedback] = useState({
  tipo: "", // success | error | info
  mensagem: ""
});

function mostrarFeedback(tipo, mensagem) {
  setFeedback({ tipo, mensagem });

  setTimeout(() => {
    setFeedback({ tipo: "", mensagem: "" });
  }, 2500);
}
async function bloquearHorario() {
  if (!dataBloqueio || !horarioBloqueio) {
    mostrarFeedback("error", "Selecione data e horário");
    return;
  }

  await addDoc(collection(db, "agendamentos"), {
    nome: "HORÁRIO BLOQUEADO",
    data: dataBloqueio,
    horario: horarioBloqueio,
    status: "bloqueado"
  });

  mostrarFeedback(
    "success",
    `Horário ${horarioBloqueio} bloqueado`
  );

  setDataBloqueio("");
  setHorarioBloqueio("");
}




  function isPassado(data) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataItem = new Date(data + "T00:00:00");
    return dataItem < hoje;
  }

  // 🔥 ATUALIZA STATUS (NÃO DELETA)
  async function atualizarStatus(id, status) {
    const confirmar = window.confirm(
      `Deseja alterar o status para "${status}"?`
    );
    if (!confirmar) return;

    await updateDoc(doc(db, "agendamentos", id), { status });
  }

  // 🔥 FINALIZA AUTOMATICAMENTE DIAS PASSADOS
  async function finalizarDiasPassados() {
    const confirmar = window.confirm(
      "Deseja marcar todos os agendamentos passados como finalizados?"
    );
    if (!confirmar) return;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const snapshot = await getDocs(collection(db, "agendamentos"));

    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data().data;
      const status = docSnap.data().status;

      if (!data || status === "finalizado") return;

      const dataItem = new Date(data + "T00:00:00");

      if (dataItem < hoje) {
        await updateDoc(doc(db, "agendamentos", docSnap.id), {
          status: "finalizado"
        });
      }
    });

    alert("Agendamentos passados finalizados com sucesso.");
  }

  // 🔹 ESCUTA EM TEMPO REAL
  useEffect(() => {
    const q = query(
      collection(db, "agendamentos"),
      orderBy("data"),
      orderBy("horario")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAgendamentos(dados);
    });

    return () => unsubscribe();
  }, []);

  const agendamentosFiltrados = agendamentos.filter((item) => {
    if (filtroData && item.data !== filtroData) return false;
    if (!mostrarPassados && isPassado(item.data)) return false;
    if (filtroStatus && item.status !== filtroStatus) return false;
    return true;
  });

  const agendamentosPorDia = agendamentosFiltrados.reduce((acc, item) => {
    if (!acc[item.data]) acc[item.data] = [];
    acc[item.data].push(item);
    return acc;
  }, {});


  return (
    <div className="admin-container">
      {feedback.mensagem && (
     <div className={`admin-feedback ${feedback.tipo}`}>
      {feedback.mensagem}
    </div>
)}


      <h1 className="admin-title">Painel de Administração</h1>

      <div className="admin-filtros">
        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
           className="admin-input"
        />

        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={mostrarPassados}
            onChange={(e) => setMostrarPassados(e.target.checked)}
          />
          <span className="checkmark"></span>
          Mostrar dias passados
        </label>


        <select
        value={filtroStatus}
        onChange={(e) => setFiltroStatus(e.target.value)}
        className="admin-select"
      >
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="cancelado">Cancelado</option>
        <option value="finalizado">Finalizado</option>
        <option value="bloqueado">Bloqueado</option>
      </select>

      </div>

      <button className="admin-clean-btn" onClick={finalizarDiasPassados}>
        Finalizar dias passados
      </button>

                <p className="horariosBloqueados">Bloquear horarios</p>
      <div className="admin-bloqueio">
          <input
            type="date"
            value={dataBloqueio}
            onChange={(e) => setDataBloqueio(e.target.value)}
            className="admin-input"
          />

          <select
            value={horarioBloqueio}
            onChange={(e) => setHorarioBloqueio(e.target.value)}
            className="admin-select"
          >
            <option value="">Horário</option>
            <option value="08:00">08:00</option>
            <option value="09:00">09:00</option>
            <option value="10:00">10:00</option>
            <option value="11:00">11:00</option>
            <option value="13:00">13:00</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
          </select>

          <button className="admin-btn bloquear" onClick={bloquearHorario}>
            Bloquear horário
          </button>

        </div>


      {Object.keys(agendamentosPorDia).length === 0 && (
        <p className="admin-empty">Nenhum agendamento encontrado.</p>
      )}

      {Object.entries(agendamentosPorDia).map(([data, itens]) => (
        <div key={data} className="admin-dia">
          <h2 className="admin-data">{data}</h2>

          {itens.map((item) => (
            <div key={item.id} className={`admin-item status-${item.status}`}>
             <div className="admin-info">
                <strong>{item.nome}</strong>
                <span>{item.horario}</span>

                <span className={`status-badge ${item.status}`}>
                  {item.status}
                </span>
              </div>


              <div className="admin-actions">
                {item.status === "ativo" && (
                  <>
                    <button
                      className="admin-btn cancel"
                      onClick={() =>
                        atualizarStatus(item.id, "cancelado")
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      className="admin-btn finish"
                      onClick={() =>
                        atualizarStatus(item.id, "finalizado")
                      }
                    >
                      Finalizar
                    </button>
                  </>
                )}

                {item.status === "cancelado" && (
                  <button
                    className="admin-btn reativar"
                    onClick={() =>
                      atualizarStatus(item.id, "ativo")
                    }
                  >
                    Reativar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
