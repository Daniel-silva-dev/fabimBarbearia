//     <input
//      type="date"
//      value={diaSelecionado}
//      onChange={(e) => setDiaSelecionado(e.target.value)} 


import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot
} from "firebase/firestore";

import { db } from "./services/firebase";
import Form from "./components/form";
import Header from "./components/header";

function App() {
  const [lista, setLista] = useState([]);
  const [diaSelecionado, setDiaSelecionado] = useState("");

  // 🔹 BUSCAR DADOS DO FIRESTORE (TEMPO REAL)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "agendamentos"),
      (snapshot) => {
        const dados = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLista(dados);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🔹 BLOQUEAR HORÁRIO + DIA IGUAIS
  async function novoEvento(evento) {
    if (!evento.data || !evento.horario) {
      alert("Data ou horário inválido");
      return;
    }

    const horarioJaExiste = lista.some(
      (item) =>
        item.data === evento.data &&
        item.horario === evento.horario
    );

    if (horarioJaExiste) {
      alert("Esse horário já está ocupado nesse dia");
      return;
    }

    await addDoc(collection(db, "agendamentos"), evento);
  }

  // 🔹 HORÁRIOS JÁ OCUPADOS NO DIA SELECIONADO
  const horariosBloqueados = diaSelecionado
    ? lista
        .filter((item) => item.data === diaSelecionado)
        .map((item) => item.horario)
    : [];

  return (
    <>
      <Header lista={lista.filter(item =>
        diaSelecionado ? item.data === diaSelecionado : true
      )} />

      <Form
        onSubmit={novoEvento}
        diaSelecionado={diaSelecionado}
        setDiaSelecionado={setDiaSelecionado}
        horariosBloqueados={horariosBloqueados}
      />

    </>
  );
}

export default App;
