/**
 * ============================================================
 * DEFINIÇÃO DOS TEMAS VISUAIS (LOGOS SVG, TÍTULOS E ESTÉTICA)
 * ============================================================
 */

window.APP_THEMES = {
  light: {
    id: "light",
    color: "#2747f0",
    label: "Claro",
    emoji: "☀️",
    title: "Sala de Estudos",
    subtitle: "Ciência da Computação • Ambiente Virtual",
    quote: "Consistência vence intensidade. Um Pomodoro de cada vez.",
    logoSvg: `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="currentColor" fill-opacity="0.14"/>
        <path d="M12 16C12 14.3431 13.3431 13 15 13H23V35H15C13.3431 35 12 33.6569 12 32V16Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M36 16C36 14.3431 34.6569 13 33 13H25V35H33C34.6569 35 36 33.6569 36 32V16Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M17 19H20M17 24H20M28 19H31M28 24H31" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `
  },

  dark: {
    id: "dark",
    color: "#0b0e1c",
    label: "Escuro",
    emoji: "🌙",
    title: "Sala de Estudos",
    subtitle: "Ciência da Computação • Modo Foco Noturno",
    quote: "while (estudando) { foco++; duvidas--; }",
    logoSvg: `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="currentColor" fill-opacity="0.18"/>
        <path d="M16 18L11 24L16 30" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M32 18L37 24L32 30" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M26 14L22 34" stroke="#38bdf8" stroke-width="2.8" stroke-linecap="round"/>
      </svg>
    `
  },

  "harry-potter": {
    id: "harry-potter",
    color: "#1b0d11",
    label: "Harry Potter",
    emoji: "⚡",
    title: "Sala Precisa",
    subtitle: "Escola de Ciência da Computação & Magia",
    quote: "“A inteligência além da medida é o maior tesouro do homem.”",
    logoSvg: `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M24 5L41 37H7L24 5Z" stroke="#d4a243" stroke-width="2.6" stroke-linejoin="round" fill="#7f1d1d" fill-opacity="0.45"/>
        <circle cx="24" cy="27" r="7.5" stroke="#d4a243" stroke-width="2.4"/>
        <line x1="24" y1="6" x2="24" y2="37" stroke="#f5ebd6" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M24 12L21.5 17H25.5L23 22" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
  },

  "adventure-time": {
    id: "adventure-time",
    color: "#ffd53d",
    label: "Hora de Aventura",
    emoji: "⚔️",
    title: "Casa na Árvore",
    subtitle: "Terra de Ooo • Ciência da Computação!",
    quote: "“Ser ruim em alguma coisa é o primeiro passo para ficar bom nela!” — Jake",
    logoSvg: `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="6" y="7" width="36" height="34" rx="8" fill="#34d399" stroke="#1c1917" stroke-width="3"/>
        <rect x="11" y="12" width="26" height="14" rx="3" fill="#d1fae5" stroke="#1c1917" stroke-width="2.5"/>
        <circle cx="18" cy="18" r="2" fill="#1c1917"/>
        <circle cx="30" cy="18" r="2" fill="#1c1917"/>
        <path d="M20 21.5C21.5 23.5 26.5 23.5 28 21.5" stroke="#1c1917" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M14 33H20M17 30V36" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
        <circle cx="32" cy="32" r="2.5" fill="#ef4444" stroke="#1c1917" stroke-width="1.5"/>
        <circle cx="27" cy="35" r="2" fill="#3b82f6" stroke="#1c1917" stroke-width="1.5"/>
      </svg>
    `
  },

  marvel: {
    id: "marvel",
    color: "#090f1f",
    label: "Marvel",
    emoji: "🛡️",
    title: "TORRE DE ESTUDOS",
    subtitle: "INICIATIVA COMPUTAÇÃO • QG DOS ALUNOS",
    quote: "“Eu posso estudar o dia inteiro.” — Modo Vingadores Ativado",
    logoSvg: `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="#e62429" stroke="#f8fafc" stroke-width="2"/>
        <circle cx="24" cy="24" r="14.5" fill="#f8fafc"/>
        <circle cx="24" cy="24" r="10" fill="#e62429"/>
        <circle cx="24" cy="24" r="6.5" fill="#1d4ed8"/>
        <path d="M24 18.5L25.6 22.1L29.5 22.5L26.5 25L27.4 28.8L24 26.8L20.6 28.8L21.5 25L18.5 22.5L22.4 22.1L24 18.5Z" fill="#f8fafc"/>
      </svg>
    `
  }
};
