import "../componentsStyle/header.css";
import { SERVICOS } from "../config/servicos";

export default function Header({ lista = [] }) {

  function gerarDias() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return [
      {
        label: "Hoje",
        data: hoje.toISOString().split("T")[0]
      },
      {
        label: "Amanhã",
        data: new Date(hoje.getTime() + 86400000)
          .toISOString()
          .split("T")[0]
      },
      {
        label: "Depois de amanhã",
        data: new Date(hoje.getTime() + 2 * 86400000)
          .toISOString()
          .split("T")[0]
      }
    ];
  }

  const dias = gerarDias();

  function filtrarPorDia(data) {
    return lista
      .filter(item =>
        item.data === data &&
        (item.status === "ativo" || item.status === "bloqueado")
      )
      .filter(item => item.inicioMinutos !== undefined)
      .sort((a, b) => a.inicioMinutos - b.inicioMinutos);
  }

  const existeAlgumHorario = dias.some(
    dia => filtrarPorDia(dia.data).length > 0
  );

  return (
    <div className="banner">
      <p>Próximos horários</p>

      {!existeAlgumHorario ? (
        <p className="banner-vazio">
          Nenhum horário agendado para os próximos dias.
        </p>
      ) : (
        dias.map(dia => {
          const eventosDoDia = filtrarPorDia(dia.data);

          return (
            <div key={dia.data} className="bloco-dia">
              <h3 className="titulo-dia">{dia.label}</h3>

              {eventosDoDia.length === 0 ? (
                <p className="dia-vazio">Sem horários</p>
              ) : (
                <ul className="lista">
                  {eventosDoDia.map((evento) => {

                    const nomesServicos = (evento.servicos || [])
                      .map(key => SERVICOS[key]?.nome)
                      .filter(Boolean)
                      .join(" • ");

                    return (
                      <li key={evento.id} className="item">
                        <div className="info">
                          <span className="nome">{evento.nome}</span>

                          {nomesServicos && (
                            <span className="servicos">
                              {nomesServicos}
                            </span>
                          )}
                        </div>

                      <span className="hora">
                        <span className="hora-inicio">{evento.inicio}</span>
                        {" - "}
                        <span className="hora-fim">{evento.fim}</span>
                      </span>
                        <span className="status">✅</span>

                        
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
