import { useEffect, useState, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

import { db } from "./services/firebase";
import { AuthProvider } from "./contexts/AuthContext";

import Form from "./components/form";
import Header from "./components/header";
import Footer from "./components/Footer";
import HeaderBar from "./components/HeaderBar";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import PrivateRoute from "./routes/PrivateRoute";

import { gerarHorariosDisponiveis } from "./utils/agendaEngine";

/* 🔁 Trata redirect do GitHub Pages */
function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");

    if (redirect) {
      navigate(redirect, { replace: true });
    }
  }, [navigate, location]);

  return null;
}

function App() {
  const [lista, setLista] = useState([]);

  /* 🔥 Escuta agendamentos em tempo real */
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

  /* 🔧 Geração dinâmica de horários */
  const obterHorarios = useCallback(
    (data, duracao) => {
      const agendamentosDoDia = lista.filter(
        (item) =>
          item.data === data &&
          (item.status === "ativo" || item.status === "bloqueado")
      );

      return gerarHorariosDisponiveis({
        data,
        duracao,
        agendamentos: agendamentosDoDia,
        segundaFechada: false, // pode virar config depois
      });
    },
    [lista]
  );

  /* ➕ Criar novo agendamento */
  async function novoEvento(evento) {
    const conflito = lista.some(
      (item) =>
        item.data === evento.data &&
        item.status !== "cancelado" &&
        !(
          evento.fimMinutos <= item.inicioMinutos ||
          evento.inicioMinutos >= item.fimMinutos
        )
    );

    if (conflito) return false;

    await addDoc(collection(db, "agendamentos"), {
      ...evento,
      status: "ativo",
    });

    return true;
  }

  return (
    <AuthProvider>
      <BrowserRouter basename="/fabimBarbearia">
        <RedirectHandler />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeaderBar />
                <Header lista={lista} />
                <Form
                  onSubmit={novoEvento}
                  gerarHorarios={obterHorarios}
                />
                <Footer />
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
