import { useState } from "react";
import Form from "./components/form";
import Header from "./components/header";

function App() {
  const [lista, setLista] = useState([]);

  function novoEvento(evento) {
    setLista([...lista, evento]);
  }

  return (
    <>
      <Header lista={lista} />
      <Form onSubmit={novoEvento} />
    </>
  );
}

export default App;
