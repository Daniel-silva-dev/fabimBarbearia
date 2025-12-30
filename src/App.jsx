import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

import { db } from "./services/firebase";
import { AuthProvider } from "./contexts/AuthContext";

import Form from "./components/form";
import Header from "./components/header";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  const [lista, setLista] = useState([]);
  const [diaSelecionado, setDiaSelecionado] = useState("");

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

  // 🔥 CRIA EVENTO SEMPRE COMO ATIVO
  async function novoEvento(evento) {
    const existe = lista.some(
      (item) =>
        item.data === evento.data &&
        item.horario === evento.horario &&
        (item.status === "ativo" || item.status === "bloqueado")
    );

    if (existe) return false;

    await addDoc(collection(db, "agendamentos"), {
      ...evento,
      status: "ativo"
    });

    return true;
  }

  // 🔥 BLOQUEIA HORÁRIOS APENAS SE ATIVO OU BLOQUEADO
  const horariosBloqueados = diaSelecionado
    ? lista
        .filter(
          (item) =>
            item.data === diaSelecionado &&
            (item.status === "ativo" || item.status === "bloqueado")
        )
        .map((item) => item.horario)
    : [];

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={
              <>
                <Header
                  lista={lista.filter((item) =>
                    diaSelecionado ? item.data === diaSelecionado : true
                  )}
                />

                <Form
                  onSubmit={novoEvento}
                  diaSelecionado={diaSelecionado}
                  setDiaSelecionado={setDiaSelecionado}
                  horariosBloqueados={horariosBloqueados}
                />
              </>
            }
          />

          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
