import emailjs from "@emailjs/browser";

export async function enviarEmailAgendamento(dados) {
  try {
    await emailjs.send(
      "service_rgpx6bj",      // 🔥 coloque aqui
      "template_41pgl19",     // 🔥 coloque aqui
      {
        nome: dados.nome,
        data: dados.data,
        inicio: dados.inicio,
        fim: dados.fim,
        servicos: dados.servicos,
        total: dados.total
      },
      "jbCsTepqCcSv5fZAI"       // 🔥 coloque aqui
    );

    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return false;
  }
}
