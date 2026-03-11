import { useEffect, useState, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

import { db } from "./services/firebase";
import { AuthProvider } from "./contexts/AuthContext";

import Form from "./components/Form";
import Header from "./components/Header";
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

  const obterHorarios = useCallback(
    ({ data, servicosSelecionados }) => {
      const agendamentosDoDia = lista.filter(
        (item) =>
          item.data === data &&
          (item.status === "ativo" || item.status === "bloqueado")
      );

      return gerarHorariosDisponiveis({
        data,
        servicosSelecionados,
        agendamentos: agendamentosDoDia,
        segundaFechada: false,
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

    /* 🔑 ID único (impede duplicação) */
    const horario = evento.horario || evento.inicio;
    const barbeiro = evento.barbeiro || "default";

    const id = `${evento.data}_${barbeiro}_${horario}`;

    const ref = doc(db, "agendamentos", id);

    const existe = await getDoc(ref);

    if (existe.exists()) {
      return false;
    }

    await setDoc(ref, {
      ...evento,
      status: "ativo",
    });

    return true;
  }

  return (
    <AuthProvider>
      <BrowserRouter basename="/">
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