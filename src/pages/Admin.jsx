import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  query,
  orderBy,
  updateDoc,
  getDocs,
  addDoc,
  setDoc,
  getDoc,
  deleteDoc
} from "firebase/firestore";

import { db } from "../services/firebase";
import { SERVICOS } from "../config/servicos";
import { horaParaMinutos, minutosParaHora } from "../utils/time";

import "./admin.css";

export default function Admin() {

  const [agendamentos, setAgendamentos] = useState([]);
  const [mostrarPassados, setMostrarPassados] = useState(false);
  const [segundaOff, setSegundaOff] = useState(false);
  const [dataBloqueio, setDataBloqueio] = useState("");
  const [horarioBloqueio, setHorarioBloqueio] = useState("");
  const [feedback, setFeedback] = useState({
    tipo: "",
    mensagem: ""
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null);

function confirmarAcao(mensagem, callback) {
  setModalMessage(mensagem);
  setModalAction(() => callback);
  setModalOpen(true);
}
function confirmarModal() {
  if (modalAction) {
    modalAction();
  }
  setModalOpen(false);
}

function fecharModal() {
  setModalOpen(false);
}



  function mostrarFeedback(tipo, mensagem) {
    setFeedback({ tipo, mensagem });
    setTimeout(() => {
      setFeedback({ tipo: "", mensagem: "" });
    }, 2500);
  }

  function isPassado(data) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataItem = new Date(data + "T00:00:00");
    return dataItem < hoje;
  }

  /* 🔥 Escuta tempo real */
  useEffect(() => {
    const q = query(
      collection(db, "agendamentos"),
      orderBy("data"),
      orderBy("inicioMinutos")
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

  /* 🔹 Carregar configuração Segunda OFF */
  useEffect(() => {
    async function carregarConfig() {
      const snap = await getDoc(doc(db, "configuracoes", "geral"));
      if (snap.exists()) {
        setSegundaOff(snap.data().segundaOff || false);
      }
    }
    carregarConfig();
  }, []);

  /* 🔹 Toggle Segunda OFF */
  async function toggleSegundaOff() {
    const novoStatus = !segundaOff;
    setSegundaOff(novoStatus);

    await setDoc(doc(db, "configuracoes", "geral"), {
      segundaOff: novoStatus,
      merge: true
    });

    if (novoStatus) {
      await bloquearProximasSegundas();
      mostrarFeedback("info", "Segundas bloqueadas automaticamente");
    } else {
      await removerBloqueiosSegunda();
      mostrarFeedback("info", "Segundas reativadas");
    }
  }

  /* 🔹 Bloquear próximas 60 segundas */
  async function bloquearProximasSegundas() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (let i = 0; i < 180; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);

      if (data.getDay() === 1) {
        const dataFormatada = data.toISOString().split("T")[0];

        await addDoc(collection(db, "agendamentos"), {
          nome: "SEGUNDA OFF",
          data: dataFormatada,
          inicio: "00:00",
          fim: "23:59",
          inicioMinutos: 0,
          fimMinutos: 1440,
          status: "bloqueado",
          automatico: true
        });
      }
    }
  }

  /* 🔹 Remover bloqueios automáticos */
  async function removerBloqueiosSegunda() {
    const snapshot = await getDocs(collection(db, "agendamentos"));

    snapshot.forEach(async (docSnap) => {
      const dados = docSnap.data();

      if (dados.automatico === true && dados.nome === "SEGUNDA OFF") {
        await deleteDoc(doc(db, "agendamentos", docSnap.id));
      }
    });
  }

  /* 🔹 Atualizar status */
  async function atualizarStatus(id, status) {
    await updateDoc(doc(db, "agendamentos", id), { status });
    mostrarFeedback("success", `Status alterado para ${status}`);
  }

  /* 🔹 Finalizar passados */
  async function finalizarDiasPassados() {
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

    mostrarFeedback("success", "Dias passados finalizados");
  }

  /* 🔥 🔥 BLOQUEIO MANUAL AGORA 1 HORA INTEIRA */
  async function bloquearHorario() {
    if (!dataBloqueio || !horarioBloqueio) {
      mostrarFeedback("error", "Selecione data e horário");
      return;
    }

    const inicioMinutos = horaParaMinutos(horarioBloqueio);
    const fimMinutos = inicioMinutos + 60; // 🔥 1 HORA

    await addDoc(collection(db, "agendamentos"), {
      nome: "HORÁRIO BLOQUEADO",
      data: dataBloqueio,
      inicio: horarioBloqueio,
      fim: minutosParaHora(fimMinutos),
      inicioMinutos,
      fimMinutos,
      status: "bloqueado"
    });

    mostrarFeedback("success", `Horário bloqueado das ${horarioBloqueio} até ${minutosParaHora(fimMinutos)}`);

    setDataBloqueio("");
    setHorarioBloqueio("");
  }

  /* 🔥 Filtro principal */
  const agendamentosFiltrados = agendamentos.filter((item) => {
    if (!mostrarPassados && isPassado(item.data)) return false;
    return true;
  });

  /* 🔹 Agrupar por data */
  const agendamentosPorDia = agendamentosFiltrados.reduce((acc, item) => {
    if (!acc[item.data]) acc[item.data] = [];
    acc[item.data].push(item);
    return acc;
  }, {});

  /* 🔥 CALCULAR FATURAMENTO MENSAL */
function calcularFaturamento() {
  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();

  let total = 0;

  agendamentos.forEach((item) => {
    if (item.status !== "finalizado") return;

    const data = new Date(item.data + "T00:00:00");

    if (
      data.getMonth() === mesAtual &&
      data.getFullYear() === anoAtual
    ) {
      const valorServicos = (item.servicos || []).reduce((acc, key) => {
        return acc + (SERVICOS[key]?.preco || 0);
      }, 0);

      total += valorServicos;
    }
  });

  return total;
}

    const faturamentoMensal = calcularFaturamento();

    /* 🔥 MÉTRICAS */
    const totalHoje = agendamentos.filter(a => {
      const hoje = new Date().toISOString().split("T")[0];
      return a.data === hoje && a.status === "ativo";
    }).length;

    const totalAtivos = agendamentos.filter(a => a.status === "ativo").length;
    const totalCancelados = agendamentos.filter(a => a.status === "cancelado").length;


  return (
    <div className="admin-container">

      {feedback.mensagem && (
        <div className={`admin-feedback ${feedback.tipo}`}>
          {feedback.mensagem}
        </div>
      )}

      <h1 className="admin-title">Painel de Administração</h1>
      <div className="dashboard-cards">
  <div className="card">
    <h3>Agendamentos Hoje</h3>
    <strong>{totalHoje}</strong>
  </div>

  <div className="card">
    <h3>Agendamentos Ativos</h3>
    <strong>{totalAtivos}</strong>
  </div>

  <div className="card">
    <h3>Cancelados</h3>
    <strong>{totalCancelados}</strong>
  </div>

  <div className="card">
    <h3>Faturamento do Mês</h3>
    <strong>R$ {faturamentoMensal.toFixed(2)}</strong>
  </div>
</div>


      {/* 🔥 Segunda OFF */}
      <div className="admin-top-controls">

        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={mostrarPassados}
            onChange={(e) => setMostrarPassados(e.target.checked)}
          />
          Mostrar dias passados
        </label>

        <div className="segunda-control">
          <span>Segunda-feira:</span>
          <button
            className={`admin-btn ${segundaOff ? "cancel" : "finish"}`}
            onClick={() => confirmarAcao("Tem certeza que deseja desativar a segunda-feira?", toggleSegundaOff)}
          >
            {segundaOff ? "OFF (Fechado)" : "ON (Aberto)"}

          </button>
        </div>

        <button className="admin-clean-btn" onClick={() => confirmarAcao("Tem certeza que deseja finalizar os dias passados?", finalizarDiasPassados)}>
          Finalizar dias passados
          
        </button>
      </div>

      {/* BLOQUEIO MANUAL */}
              <p className="bloq-manual">Bloqueio Manual de Horário</p>
      <div className="admin-bloqueio">
        <input
          type="date"
          value={dataBloqueio}
          onChange={(e) => setDataBloqueio(e.target.value)}
          className="admin-input"
        />

        <input
          type="time"
          value={horarioBloqueio}
          onChange={(e) => setHorarioBloqueio(e.target.value)}
          className="admin-input"
        />

        <button className="admin-btn bloquear"  onClick={() => confirmarAcao("Tem certeza que deseja bloquear este horário?", bloquearHorario)}>
          Bloquear 1 hora
        </button>
      </div>

      {/* LISTA */}
      {Object.keys(agendamentosPorDia).length === 0 && (
        <p className="admin-empty">Nenhum agendamento encontrado.</p>
      )}

      {Object.entries(agendamentosPorDia).map(([data, itens]) => {

        const dataObj = new Date(data + "T00:00:00");
        const diaSemana = dataObj.toLocaleDateString("pt-BR", { weekday: "long" });

        return (
          <div key={data} className="admin-dia">

            <h2 className="admin-data">
              {data} — {diaSemana}
            </h2>

            {itens.map((item) => {

              const nomesServicos = (item.servicos || [])
                .map(key => SERVICOS[key]?.nome)
                .filter(Boolean)
                .join(" • ");

              return (
                <div key={item.id} className={`admin-item status-${item.status}`}>

                  <div className="admin-info">
                    <strong>{item.nome}</strong>

                    <span className="admin-horario">
                      {item.inicio} - {item.fim}
                    </span>

                    {nomesServicos && (
                      <span className="admin-servicos">
                        {nomesServicos}
                      </span>
                    )}

                    <span className={`status-badge ${item.status}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="admin-actions">

                    {item.status === "ativo" && (
                      <>
                        <button
                          className="admin-btn cancel"
                          onClick={() => confirmarAcao("Tem certeza que deseja cancelar este agendamento?", () => atualizarStatus(item.id, "cancelado"))}
                        >
                          Cancelar
                        </button>

                        <button
                          className="admin-btn finish"
                          onClick={() => confirmarAcao("Tem certeza que deseja finalizar este agendamento?", () => atualizarStatus(item.id, "finalizado"))}
                        >
                          Finalizar
                        </button>
                      </>
                    )}

                    {item.status === "cancelado" && (
                      <button
                        className="admin-btn reativar"
                        onClick={() => confirmarAcao("Tem certeza que deseja reativar este agendamento?", () => atualizarStatus(item.id, "ativo"))}
                      >
                        Reativar
                      </button>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      <div className="faturamento-box">
        <h2>Faturamento Mensal Atual</h2>
        <strong>R$ {faturamentoMensal.toFixed(2)}</strong>
      </div>
      {modalOpen && (
  <div className="admin-modal-overlay">
    <div className="admin-modal">
      <h3>Confirmar ação</h3>
      <p>{modalMessage}</p>

      <div className="admin-modal-actions">
        <button
          className="admin-btn cancel"
          onClick={fecharModal}
        >
          Cancelar
        </button>

        <button
          className="admin-btn finish"
          onClick={confirmarModal}
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
