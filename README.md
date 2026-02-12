💈 Fábim Barbearia– Sistema de Agendamentos

Sistema moderno de agendamento para barbearia, desenvolvido com React + Vite + Firebase, focado em UX simples, admin seguro e deploy em produção no GitHub Pages.

🔗 Acesso público:
https://daniel-silva-dev.github.io/fabimBarbearia

📌 Visão Geral

O Fábim Barber é um sistema web que permite:

Clientes agendarem horários de forma simples

Visualização dos próximos horários disponíveis

Painel administrativo protegido para gestão dos agendamentos

Bloqueio automático de horários

Controle de status dos atendimentos

O projeto foi pensado para simular um cenário real de produção, com regras de segurança, rotas protegidas e deploy público.

🚀 Tecnologias Utilizadas

React (Hooks, Context API)

Vite (build rápido e otimizado)

React Router DOM

Firebase Authentication

Firebase Firestore

GitHub Pages (Deploy)

CSS puro (layout responsivo)

React Icons

🧠 Funcionalidades
👤 Cliente

Agendamento de horário

Validação de datas (não permite datas passadas ou domingos)

Bloqueio automático de horários ocupados

Visualização dos próximos 3 dias

Feedback visual de sucesso e erro

🔐 Admin

Login protegido por autenticação

Visualização de agendamentos por data

Filtro por status

Cancelamento de agendamentos

Limpeza automática de dias passados

Bloqueio manual de horários

Badges visuais de status

🗂️ Estrutura do Projeto
src/
├── components/
│   ├── Form.jsx
│   ├── Header.jsx
│   ├── Footer.jsx
├── pages/
│   ├── Admin.jsx
│   ├── Login.jsx
├── routes/
│   └── PrivateRoute.jsx
├── contexts/
│   └── AuthContext.jsx
├── services/
│   └── firebase.js
├── App.jsx
└── main.jsx

🔐 Segurança

Regras de segurança no Firestore

Apenas o admin autenticado pode:

Ler agendamentos

Cancelar ou bloquear horários

Clientes só podem criar agendamentos

Atualizações diretas são bloqueadas

Exemplo de regra:

allow read, delete: if request.auth != null
  && request.auth.token.email == "admin@fabimbarber.com";

🌍 Deploy

Hospedado via GitHub Pages

Configuração correta de basename para React Router

Fallback de rotas para SPA

Build otimizado com Vite

npm run build
npm run deploy

🎨 UI / UX

Layout limpo e responsivo

Feedback visual para ações do usuário

Mensagens claras quando não há horários disponíveis

Ícones intuitivos

Favicon personalizado com identidade da marca

🧪 Aprendizados Aplicados

Gerenciamento de estado com React Hooks

Rotas protegidas em SPA

Integração real com Firebase

Regras de segurança em produção

Deploy e resolução de problemas no GitHub Pages

UX focado em usabilidade real

📈 Próximas Melhorias (Roadmap)

Envio de notificações por WhatsApp

Edição de horários pelo admin

Dashboard com métricas

Internacionalização (i18n)

Tema dark/light

👨‍💻 Autor

Daniel Silva
Desenvolvedor Front-End

GitHub: https://github.com/daniel-silva-dev

LinkedIn: www.linkedin.com/in/danieldev5g

⭐ Observação Final

Este projeto foi desenvolvido com foco em boas práticas, clareza de código e experiência do usuário, simulando um ambiente profissional real.


