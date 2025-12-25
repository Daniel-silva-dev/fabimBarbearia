//import clients from "../db.js";
import "../componentsStyle/header.css";

export default function Header({ lista }) {

  return (
     <div className="banner">
      <p>Horarios agendados</p>
      <ul className="lista">
        {lista.map((evento, index) => (
          <li key={index} className="item">
            <span className="nome">{evento.nome}</span>
            <span className="hora">{evento.horario}</span>
            <span className="hora">{evento.data}</span>
          </li>
        ))
         }
      </ul>
    </div>
  );
}
