/**
 * ============================================================
 * CONFIGURAÇÃO PRINCIPAL DA SALA DE ESTUDOS
 * ============================================================
 * Edite este arquivo para personalizar o nome, adicionar novas
 * matérias no Mural de Dúvidas ou conectar seu banco Firebase.
 */

window.APP_CONFIG = {
  // Nome e subtítulo exibidos no cabeçalho (tema padrão)
  projectTitle: "Sala de Estudos",
  projectSubtitle: "Ciência da Computação • Projeto de Extensão PES II",

  // Salas / Categorias do Mural de Dúvidas
  // Para adicionar novas matérias no futuro, basta copiar um bloco abaixo!
  rooms: [
    {
      id: "geral",
      name: "Sala Geral",
      icon: "🏛️",
      description: "Espaço aberto para avisos, dicas de estudo e dúvidas gerais de Computação."
    },
    {
      id: "primeiro-ano",
      name: "1º Ano",
      icon: "i-sprout",
      description: "Mural dedicado às disciplinas e dúvidas do 1º ano de Ciência da Computação."
  },
    {
      id: "segundo-ano",
      name: "2º Ano",
      icon: "💻",
      description: "Mural dedicado às disciplinas e trabalhos do 2º ano de Ciência da Computação."
    },
    {
      id: "terceiro-ano",
      name: "3º Ano",
      icon: "🚀",
      description: "Mural dedicado às disciplinas, projetos e dúvidas do 3º ano de Ciência da Computação."
    },
    {
      id: "quarto-ano",
      name: "4º Ano",
      icon: "i-cap",
      description: "Mural dedicado ao TCC, estágios e às disciplinas do 4º ano de Ciência da Computação."
    }
    // Exemplo de como adicionar uma matéria específica depois:
    // {
    //   id: "estruturas-dados",
    //   name: "Estruturas de Dados",
    //   icon: "🌳",
    //   description: "Árvores, grafos, listas encadeadas e complexidade."
    // }
  ],

  // ============================================================
  // FIREBASE FIRESTORE (GRATUITO - PLANO SPARK)
  // ============================================================
  // Enquanto estiver vazio, o site funciona em "Modo Local" (salva no seu navegador).
  // Para que TODOS os alunos vejam as mesmas dúvidas em tempo real:
  // 1. Crie um projeto gratuito em https://console.firebase.google.com
  // 2. Ative o Cloud Firestore e copie o objeto firebaseConfig aqui embaixo.
  firebase: {
    apiKey: "AIzaSyBusqNU49ZKGp-ciCbPBZcuNcIKsxrGQh4",
    authDomain: "sala-de-estudos-cc.firebaseapp.com",
    projectId: "sala-de-estudos-cc",
    storageBucket: "sala-de-estudos-cc.firebasestorage.app",
    messagingSenderId: "541384563731",
    appId: "1:541384563731:web:6aa3815b08eaf36bf6f3e6",
    measurementId: "G-YL9ESJCNC8"
  }
};
