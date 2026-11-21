/**
 * ============================================================
 * LÓGICA PRINCIPAL — SALA DE ESTUDOS
 * ============================================================
 * Inclui:
 * 1. Sistema de Temas dinâmicos (Claro, Escuro, Harry Potter, Hora de Aventura, Marvel)
 * 2. Pomodoro personalizável + Cronômetro Livre com registro de blocos
 * 3. Sons Ambientes (integração com Web Audio API)
 * 4. Lista de Tarefas persistente (localStorage)
 * 5. Flashcards interativos 3D persistentes (localStorage)
 * 6. Mural de Dúvidas por sala (Firebase Firestore real-time + fallback local automático)
 */

(function () {
  "use strict";

  // ------------------------------------------------------------
  // UTILITÁRIOS E STORAGE
  // ------------------------------------------------------------
  const STORAGE_KEYS = {
    theme: "sala_estudos_theme",
    nickname: "sala_estudos_nickname",
    todos: "sala_estudos_todos",
    flashcards: "sala_estudos_flashcards",
    pomodoroCount: "sala_estudos_pomo_count",
    localDoubts: "sala_estudos_local_doubts"
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn("Erro ao salvar no localStorage:", err);
    }
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return "agora";
    const ms = typeof timestamp === "number"
      ? timestamp
      : (timestamp.toMillis ? timestamp.toMillis() : Date.now());
    const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
    if (diffSec < 60) return "agora mesmo";
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `há ${days}d`;
    return new Date(ms).toLocaleDateString("pt-BR");
  }

  function icon(id) {
    return `<svg class="ico" aria-hidden="true"><use href="#${id}"/></svg>`;
  }

  function showToast(msg) {
    const toast = $("#toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  // ------------------------------------------------------------
  // 1. SISTEMA DE TEMAS
  // ------------------------------------------------------------
  function initThemes() {
    const switcher = $("#theme-switcher");
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "light";

    Object.values(window.APP_THEMES).forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-pill";
      btn.dataset.themeId = t.id;
      btn.setAttribute("aria-label", `Tema ${t.label}`);
      btn.innerHTML = `<span class="theme-swatch" aria-hidden="true"><i></i><i></i><i></i></span><span class="theme-name">${t.label}</span>`;
      btn.addEventListener("click", () => applyTheme(t.id));
      switcher.appendChild(btn);
    });

    applyTheme(savedTheme);
  }

  function applyTheme(themeId) {
    const theme = window.APP_THEMES[themeId] || window.APP_THEMES.light;
    document.documentElement.setAttribute("data-theme", theme.id);
    localStorage.setItem(STORAGE_KEYS.theme, theme.id);

    $("#brand-logo").innerHTML = theme.logoSvg;
    $("#brand-title").textContent = theme.title;
    $("#brand-subtitle").textContent = theme.subtitle;
    $("#theme-quote").textContent = theme.quote;

    $$(".theme-pill").forEach((btn) => {
      const active = btn.dataset.themeId === theme.id;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && theme.color) meta.setAttribute("content", theme.color);
  }

  // ------------------------------------------------------------
  // 2. APELIDO (SEM LOGIN / ZERO ATRITO)
  // ------------------------------------------------------------
  let currentNickname = localStorage.getItem(STORAGE_KEYS.nickname) || "";

  function updateGreeting() {
    const h = new Date().getHours();
    const part = h < 5 ? "Boa madrugada" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    $("#greeting").textContent = currentNickname ? `${part}, ${currentNickname}` : part;
  }

  function updateNicknameUI() {
    const label = $("#nickname-display");
    label.textContent = currentNickname ? currentNickname : "Definir apelido";
    updateGreeting();
  }

  function openNicknameModal(onSaveCallback) {
    const modal = $("#nickname-modal");
    const input = $("#nickname-input");
    input.value = currentNickname;
    modal.classList.add("open");
    setTimeout(() => input.focus(), 60);

    const form = $("#nickname-form");
    form.onsubmit = (e) => {
      e.preventDefault();
      const cleaned = input.value.trim().slice(0, 28);
      if (!cleaned) return;
      currentNickname = cleaned;
      localStorage.setItem(STORAGE_KEYS.nickname, cleaned);
      updateNicknameUI();
      modal.classList.remove("open");
      showToast(`Bem-vindo(a), ${cleaned}!`);
      if (typeof onSaveCallback === "function") onSaveCallback(cleaned);
    };
  }

  function initNickname() {
    updateNicknameUI();
    $("#nickname-btn").addEventListener("click", () => openNicknameModal());
    $("#close-nickname-modal").addEventListener("click", () => {
      $("#nickname-modal").classList.remove("open");
    });
    $("#nickname-modal").addEventListener("click", (e) => {
      if (e.target.id === "nickname-modal") {
        $("#nickname-modal").classList.remove("open");
      }
    });
  }

  // ------------------------------------------------------------
  // 3. POMODORO + CRONÔMETRO LIVRE
  // ------------------------------------------------------------
  function initTimers() {
    // Alternância de abas
    $$(".timer-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        $$(".timer-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const mode = tab.dataset.mode;
        $("#panel-pomodoro").classList.toggle("hidden", mode !== "pomodoro");
        $("#panel-stopwatch").classList.toggle("hidden", mode !== "stopwatch");
      });
    });

    // --- POMODORO ---
    const pomoDurations = {
      focus: 25,
      short: 5,
      long: 15
    };
    let pomoMode = "focus";
    let pomoTotalSec = pomoDurations.focus * 60;
    let pomoRemainingSec = pomoTotalSec;
    let pomoInterval = null;
    let pomoDoneToday = loadJSON(STORAGE_KEYS.pomodoroCount, { date: "", count: 0 });
    const todayStr = new Date().toISOString().slice(0, 10);
    if (pomoDoneToday.date !== todayStr) {
      pomoDoneToday = { date: todayStr, count: 0 };
      saveJSON(STORAGE_KEYS.pomodoroCount, pomoDoneToday);
    }

    const ring = $("#pomo-ring-progress");
    const radius = 84;
    const circumference = 2 * Math.PI * radius;
    ring.style.strokeDasharray = `${circumference}`;

    function renderPomodoro() {
      const m = Math.floor(pomoRemainingSec / 60);
      const s = pomoRemainingSec % 60;
      const formatted = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      $("#pomo-display").textContent = formatted;
      $("#pomo-count").textContent = pomoDoneToday.count;

      const progress = pomoTotalSec > 0 ? pomoRemainingSec / pomoTotalSec : 0;
      const offset = circumference * (1 - progress);
      ring.style.strokeDashoffset = `${offset}`;

      if (pomoInterval) {
        document.title = `(${formatted}) Sala de Estudos`;
      } else {
        document.title = "Sala de Estudos • Ciência da Computação";
      }
    }

    function setPomoMode(mode) {
      stopPomodoro();
      pomoMode = mode;
      $("#panel-pomodoro").dataset.mode = mode;
      $$(".pomo-mode-btn").forEach((b) => b.classList.toggle("active", b.dataset.pomoMode === mode));
      pomoTotalSec = pomoDurations[mode] * 60;
      pomoRemainingSec = pomoTotalSec;
      const labels = { focus: "Tempo de foco", short: "Pausa curta", long: "Pausa longa" };
      $("#pomo-status-label").textContent = labels[mode];
      renderPomodoro();
    }

    function stopPomodoro() {
      if (pomoInterval) {
        clearInterval(pomoInterval);
        pomoInterval = null;
      }
      $("#pomo-start-btn").textContent = "Iniciar";
      renderPomodoro();
    }

    function togglePomodoro() {
      if (pomoInterval) {
        stopPomodoro();
        return;
      }
      $("#pomo-start-btn").textContent = "Pausar";
      pomoInterval = setInterval(() => {
        if (pomoRemainingSec > 0) {
          pomoRemainingSec--;
          renderPomodoro();
        } else {
          stopPomodoro();
          window.soundEngine.playBell();
          if (pomoMode === "focus") {
            pomoDoneToday.count++;
            saveJSON(STORAGE_KEYS.pomodoroCount, pomoDoneToday);
            showToast("Pomodoro concluído! Hora de descansar um pouco.");
            setPomoMode(pomoDoneToday.count % 4 === 0 ? "long" : "short");
          } else {
            showToast("Pausa encerrada! De volta aos estudos.");
            setPomoMode("focus");
          }
        }
      }, 1000);
      renderPomodoro();
    }

    $$(".pomo-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => setPomoMode(btn.dataset.pomoMode));
    });

    $("#pomo-start-btn").addEventListener("click", togglePomodoro);
    $("#pomo-reset-btn").addEventListener("click", () => setPomoMode(pomoMode));

    // Ajuste personalizado de minutos
    $("#pomo-custom-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = Math.max(1, Math.min(120, parseInt($("#cfg-focus").value, 10) || 25));
      const s = Math.max(1, Math.min(60, parseInt($("#cfg-short").value, 10) || 5));
      const l = Math.max(1, Math.min(60, parseInt($("#cfg-long").value, 10) || 15));
      pomoDurations.focus = f;
      pomoDurations.short = s;
      pomoDurations.long = l;
      setPomoMode(pomoMode);
      showToast("Tempos do Pomodoro atualizados!");
    });

    renderPomodoro();

    // --- CRONÔMETRO LIVRE ---
    let swElapsedMs = 0;
    let swStartTs = 0;
    let swTimer = null;
    let swLaps = [];

    function formatSW(ms) {
      const totalSec = Math.floor(ms / 1000);
      const hrs = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    function renderSW() {
      const currentMs = swTimer ? swElapsedMs + (Date.now() - swStartTs) : swElapsedMs;
      $("#sw-display").textContent = formatSW(currentMs);
    }

    $("#sw-start-btn").addEventListener("click", () => {
      if (swTimer) {
        swElapsedMs += Date.now() - swStartTs;
        clearInterval(swTimer);
        swTimer = null;
        $("#sw-start-btn").textContent = "Retomar";
      } else {
        swStartTs = Date.now();
        swTimer = setInterval(renderSW, 250);
        $("#sw-start-btn").textContent = "Pausar";
      }
      renderSW();
    });

    $("#sw-lap-btn").addEventListener("click", () => {
      const currentMs = swTimer ? swElapsedMs + (Date.now() - swStartTs) : swElapsedMs;
      if (currentMs < 1000) return;
      swLaps.unshift({ idx: swLaps.length + 1, time: formatSW(currentMs) });
      renderLaps();
    });

    $("#sw-reset-btn").addEventListener("click", () => {
      clearInterval(swTimer);
      swTimer = null;
      swElapsedMs = 0;
      swLaps = [];
      $("#sw-start-btn").textContent = "Iniciar";
      renderSW();
      renderLaps();
    });

    function renderLaps() {
      const list = $("#sw-laps");
      if (!swLaps.length) {
        list.innerHTML = `<li class="empty-hint">Nenhum bloco registrado ainda.</li>`;
        return;
      }
      list.innerHTML = swLaps
        .slice(0, 6)
        .map((lap) => `<li><span>Bloco #${lap.idx}</span><strong>${lap.time}</strong></li>`)
        .join("");
    }
    renderLaps();
  }

  // ------------------------------------------------------------
  // 4. SONS AMBIENTES
  // ------------------------------------------------------------
  function initSounds() {
    const sounds = [
      { id: "rain", name: "Chuva suave", icon: "i-rain" },
      { id: "fireplace", name: "Lareira", icon: "i-flame" },
      { id: "brown", name: "Ruído marrom", icon: "i-waves" },
      { id: "lofi", name: "Pad lo-fi", icon: "i-music" }
    ];

    const container = $("#sound-grid");
    sounds.forEach((s) => {
      const item = document.createElement("div");
      item.className = "sound-card";
      item.dataset.soundId = s.id;
      item.innerHTML = `
        <button type="button" class="sound-toggle" aria-pressed="false">
          <span class="sound-icon">${icon(s.icon)}</span>
          <span class="sound-name">${s.name}</span>
          <span class="sound-state" aria-hidden="true"></span>
        </button>
        <input type="range" class="sound-slider" min="5" max="100" value="55" aria-label="Volume de ${s.name}">
      `;

      const toggleBtn = item.querySelector(".sound-toggle");
      const slider = item.querySelector(".sound-slider");

      toggleBtn.addEventListener("click", () => {
        const vol = parseInt(slider.value, 10) / 100;
        const playing = window.soundEngine.toggle(s.id, vol);
        item.classList.toggle("playing", playing);
        toggleBtn.setAttribute("aria-pressed", String(playing));
      });

      const paintSlider = () => slider.style.setProperty("--val", `${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%`);
      paintSlider();
      slider.addEventListener("input", () => {
        paintSlider();
        const vol = parseInt(slider.value, 10) / 100;
        window.soundEngine.setVolume(s.id, vol);
      });

      container.appendChild(item);
    });

    $("#stop-all-sounds").addEventListener("click", () => {
      window.soundEngine.stopAll();
      $$(".sound-card").forEach((el) => {
        el.classList.remove("playing");
        el.querySelector(".sound-toggle").setAttribute("aria-pressed", "false");
      });
    });
  }

  // ------------------------------------------------------------
  // 5. LISTA DE TAREFAS (TO-DO)
  // ------------------------------------------------------------
  function initTodos() {
    let todos = loadJSON(STORAGE_KEYS.todos, [
      { id: 1, text: "Revisar slides da aula de Engenharia de Software", done: false },
      { id: 2, text: "Resolver 2 exercícios de Estruturas de Dados", done: false }
    ]);

    function renderTodos() {
      const list = $("#todo-list");
      const doneCount = todos.filter((t) => t.done).length;
      const pct = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

      $("#todo-progress-text").textContent = `${doneCount}/${todos.length} concluídas`;
      $("#todo-progress-bar").style.width = `${pct}%`;

      if (!todos.length) {
        list.innerHTML = `<li class="empty-hint">Nenhuma tarefa na lista. Adicione sua meta de estudo acima!</li>`;
        return;
      }

      list.innerHTML = todos
        .map(
          (t) => `
          <li class="todo-item ${t.done ? "done" : ""}" data-id="${t.id}">
            <label class="todo-label">
              <input type="checkbox" ${t.done ? "checked" : ""}>
              <span>${escapeHTML(t.text)}</span>
            </label>
            <button type="button" class="icon-btn delete-todo" title="Remover tarefa" aria-label="Remover tarefa">${icon("i-x")}</button>
          </li>
        `
        )
        .join("");

      list.querySelectorAll(".todo-item").forEach((li) => {
        const id = Number(li.dataset.id);
        li.querySelector("input").addEventListener("change", () => {
          todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
          saveJSON(STORAGE_KEYS.todos, todos);
          renderTodos();
        });
        li.querySelector(".delete-todo").addEventListener("click", () => {
          todos = todos.filter((t) => t.id !== id);
          saveJSON(STORAGE_KEYS.todos, todos);
          renderTodos();
        });
      });
    }

    $("#todo-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#todo-input");
      const text = input.value.trim();
      if (!text) return;
      todos.unshift({ id: Date.now(), text, done: false });
      saveJSON(STORAGE_KEYS.todos, todos);
      input.value = "";
      renderTodos();
    });

    $("#todo-clear-done").addEventListener("click", () => {
      todos = todos.filter((t) => !t.done);
      saveJSON(STORAGE_KEYS.todos, todos);
      renderTodos();
    });

    renderTodos();
  }

  // ------------------------------------------------------------
  // 6. FLASHCARDS INTERATIVOS 3D
  // ------------------------------------------------------------
  function initFlashcards() {
    const defaultCards = [
      {
        id: 1,
        tag: "Algoritmos",
        front: "Qual a complexidade de tempo da Busca Binária no pior caso?",
        back: "O(log n), pois o espaço de busca é reduzido pela metade a cada iteração (requer vetor ordenado)."
      },
      {
        id: 2,
        tag: "Sistemas Operacionais",
        front: "Qual a principal diferença entre Processo e Thread?",
        back: "Processos possuem espaços de memória isolados; Threads compartilham o mesmo espaço de endereçamento dentro de um processo."
      },
      {
        id: 3,
        tag: "Engenharia de Software",
        front: "O que significa um Requisito Não-Funcional (RNF)?",
        back: "Define restrições e atributos de qualidade do sistema (ex.: desempenho, segurança, usabilidade, disponibilidade), não uma função direta."
      },
      {
        id: 4,
        tag: "Banco de Dados",
        front: "O que representa a sigla ACID em transações?",
        back: "Atomicidade, Consistência, Isolamento e Durabilidade."
      }
    ];

    let cards = loadJSON(STORAGE_KEYS.flashcards, defaultCards);
    let currentIndex = 0;

    const cardEl = $("#flashcard-3d");

    function renderFlashcard() {
      cardEl.classList.remove("flipped");
      if (!cards.length) {
        $("#fc-counter").textContent = "0 / 0";
        $("#fc-tag").textContent = "Vazio";
        $("#fc-front-text").textContent = "Você ainda não tem flashcards. Clique em '+ Novo' para criar!";
        $("#fc-back-text").textContent = "A resposta aparecerá aqui.";
        return;
      }
      if (currentIndex >= cards.length) currentIndex = 0;
      if (currentIndex < 0) currentIndex = cards.length - 1;

      const c = cards[currentIndex];
      $("#fc-counter").textContent = `${currentIndex + 1} / ${cards.length}`;
      $("#fc-tag").textContent = c.tag || "Geral";
      $("#fc-front-text").textContent = c.front;
      $("#fc-back-text").textContent = c.back;
    }

    cardEl.addEventListener("click", () => {
      if (cards.length) cardEl.classList.toggle("flipped");
    });

    $("#fc-prev").addEventListener("click", () => {
      if (!cards.length) return;
      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      renderFlashcard();
    });

    $("#fc-next").addEventListener("click", () => {
      if (!cards.length) return;
      currentIndex = (currentIndex + 1) % cards.length;
      renderFlashcard();
    });

    $("#fc-shuffle").addEventListener("click", () => {
      if (cards.length < 2) return;
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
      currentIndex = 0;
      saveJSON(STORAGE_KEYS.flashcards, cards);
      renderFlashcard();
      showToast("Flashcards embaralhados!");
    });

    $("#fc-delete").addEventListener("click", () => {
      if (!cards.length) return;
      cards.splice(currentIndex, 1);
      saveJSON(STORAGE_KEYS.flashcards, cards);
      renderFlashcard();
      showToast("Flashcard removido.");
    });

    $("#fc-toggle-form").addEventListener("click", () => {
      $("#fc-add-form").classList.toggle("hidden");
    });

    $("#fc-add-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const tag = $("#fc-input-tag").value.trim() || "Computação";
      const front = $("#fc-input-front").value.trim();
      const back = $("#fc-input-back").value.trim();
      if (!front || !back) return;

      cards.push({ id: Date.now(), tag, front, back });
      saveJSON(STORAGE_KEYS.flashcards, cards);
      currentIndex = cards.length - 1;
      $("#fc-input-tag").value = "";
      $("#fc-input-front").value = "";
      $("#fc-input-back").value = "";
      $("#fc-add-form").classList.add("hidden");
      renderFlashcard();
      showToast("Flashcard adicionado!");
    });

    renderFlashcard();
  }

  // ------------------------------------------------------------
  // 7. MURAL DE DÚVIDAS (FIREBASE FIRESTORE + FALLBACK LOCAL)
  // ------------------------------------------------------------
  function initForum() {
    const rooms = window.APP_CONFIG.rooms || [];
    let activeRoomId = rooms[0] ? rooms[0].id : "geral";
    let db = null;
    let isCloudMode = false;
    let unsubscribeRoom = null;

    // Tenta inicializar Firebase Firestore se as credenciais estiverem preenchidas
    const fbCfg = window.APP_CONFIG.firebase;
    if (fbCfg && fbCfg.apiKey && fbCfg.projectId && typeof firebase !== "undefined") {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(fbCfg);
        }
        db = firebase.firestore();
        isCloudMode = true;
      } catch (err) {
        console.error("Falha ao inicializar Firebase, usando modo local:", err);
        isCloudMode = false;
      }
    }

    const statusBadge = $("#sync-status");
    if (isCloudMode) {
      statusBadge.className = "sync-badge online";
      statusBadge.innerHTML = `<span class="dot"></span> Online (Sincronizado)`;
      statusBadge.title = "Conectado ao Firebase Firestore — todos os alunos veem as mesmas dúvidas.";
    } else {
      statusBadge.className = "sync-badge local";
      statusBadge.innerHTML = `<span class="dot"></span> Modo Local`;
      statusBadge.title = "Configure o Firebase em js/config.js para compartilhar dúvidas entre todos os alunos.";
    }

    // Dados iniciais para demonstração no Modo Local
    const seedDoubts = [
      {
        id: "seed-1",
        roomId: "geral",
        author: "Monitoria CC",
        title: "Bem-vindos à Sala de Estudos!",
        content: "Use as abas acima para alternar entre a Sala Geral, o 2º Ano e o 3º Ano. Defina seu apelido no topo e poste suas dúvidas livremente!",
        createdAt: Date.now() - 1000 * 60 * 42,
        replies: [
          {
            id: "r-1",
            author: "Veterano",
            content: "Dica: combinem o som de chuva + lareira com o tema Harry Potter para estudar à noite!",
            createdAt: Date.now() - 1000 * 60 * 18
          }
        ]
      },
      {
        id: "seed-2",
        roomId: "segundo-ano",
        author: "Lucas (2º Ano)",
        title: "Diferença prática entre Lista Encadeada e Vetor?",
        content: "Quando realmente vale a pena usar lista encadeada em vez de um array dinâmico?",
        createdAt: Date.now() - 1000 * 60 * 95,
        replies: [
          {
            id: "r-2",
            author: "Marina",
            content: "Quando você faz muitas inserções e remoções no início/meio sem precisar de acesso aleatório por índice O(1).",
            createdAt: Date.now() - 1000 * 60 * 60
          }
        ]
      },
      {
        id: "seed-3",
        roomId: "terceiro-ano",
        author: "Ana (3º Ano)",
        title: "Alguém tem um bom resumo sobre normalização até 3FN?",
        content: "Sempre confundo dependência transitiva na Terceira Forma Normal na hora de modelar as tabelas.",
        createdAt: Date.now() - 1000 * 60 * 140,
        replies: []
      }
    ];

    function getLocalDoubts() {
      return loadJSON(STORAGE_KEYS.localDoubts, seedDoubts);
    }

    function saveLocalDoubts(list) {
      saveJSON(STORAGE_KEYS.localDoubts, list);
    }

    // Renderizar abas das salas
    const tabsEl = $("#room-tabs");
    function renderRoomTabs() {
      tabsEl.innerHTML = rooms
        .map(
          (r) => `
          <button type="button" class="room-tab ${r.id === activeRoomId ? "active" : ""}" data-room="${r.id}">
            ${/^i-/.test(r.icon || "") ? icon(r.icon) : `<span>${escapeHTML(r.icon || "")}</span>`} ${escapeHTML(r.name)}
          </button>
        `
        )
        .join("");

      tabsEl.querySelectorAll(".room-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeRoomId = btn.dataset.room;
          renderRoomTabs();
          updateRoomHeader();
          subscribeCurrentRoom();
        });
      });
    }

    function updateRoomHeader() {
      const room = rooms.find((r) => r.id === activeRoomId);
      $("#room-description").textContent = room ? room.description : "";
    }

    function subscribeCurrentRoom() {
      if (unsubscribeRoom) {
        unsubscribeRoom();
        unsubscribeRoom = null;
      }

      const feed = $("#doubts-feed");
      feed.innerHTML = `<p class="empty-hint">Carregando dúvidas...</p>`;

      if (isCloudMode && db) {
        unsubscribeRoom = db
          .collection("doubts")
          .where("roomId", "==", activeRoomId)
          .onSnapshot(
            (snapshot) => {
              const items = [];
              snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
              items.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
              renderDoubts(items);
            },
            (err) => {
              console.error("Erro no Firestore:", err);
              feed.innerHTML = `<p class="empty-hint">Erro ao carregar dúvidas do Firebase. Verifique as regras do Firestore.</p>`;
            }
          );
      } else {
        const all = getLocalDoubts();
        const filtered = all
          .filter((d) => d.roomId === activeRoomId)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        renderDoubts(filtered);
      }
    }

    function renderDoubts(doubts) {
      const feed = $("#doubts-feed");
      if (!doubts.length) {
        feed.innerHTML = `
          <div class="empty-board">
            <p>Nenhuma dúvida postada nesta sala ainda.</p>
            <span>Seja a primeira pessoa a puxar uma discussão!</span>
          </div>
        `;
        return;
      }

      feed.innerHTML = doubts
        .map((d) => {
          const replies = Array.isArray(d.replies) ? d.replies : [];
          const repliesHtml = replies
            .map(
              (r) => `
              <div class="reply-item">
                <div class="reply-meta">
                  <strong>${escapeHTML(r.author)}</strong>
                  <span>${formatTimeAgo(r.createdAt)}</span>
                </div>
                <p>${escapeHTML(r.content)}</p>
              </div>
            `
            )
            .join("");

          return `
            <article class="doubt-card" data-id="${escapeHTML(d.id)}">
              <div class="doubt-header">
                <span class="avatar" aria-hidden="true">${escapeHTML((d.author || "?").trim().charAt(0).toUpperCase())}</span>
                <div class="doubt-meta">
                  <span class="doubt-author">${escapeHTML(d.author)}</span>
                  <span class="doubt-time">${formatTimeAgo(d.createdAtMs || d.createdAt)}</span>
                </div>
              </div>
              <h4 class="doubt-title">${escapeHTML(d.title)}</h4>
              <p class="doubt-body">${escapeHTML(d.content)}</p>

              <div class="replies-section">
                <div class="replies-count">${icon("i-chat")} ${replies.length} ${replies.length === 1 ? "resposta" : "respostas"}</div>
                <div class="replies-list">${repliesHtml}</div>
                <form class="reply-form" data-doubt-id="${escapeHTML(d.id)}">
                  <input type="text" class="reply-input" placeholder="Escreva uma resposta para ajudar..." aria-label="Responder" maxlength="500" required>
                  <button type="submit" class="btn btn-sm">Responder</button>
                </form>
              </div>
            </article>
          `;
        })
        .join("");

      feed.querySelectorAll(".reply-form").forEach((form) => {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const input = form.querySelector(".reply-input");
          const text = input.value.trim();
          if (!text) return;
          const doubtId = form.dataset.doubtId;

          const sendReply = (nick) => {
            addReply(doubtId, nick, text);
            input.value = "";
          };

          if (!currentNickname) {
            openNicknameModal(sendReply);
          } else {
            sendReply(currentNickname);
          }
        });
      });
    }

    async function addDoubt(author, title, content) {
      const now = Date.now();
      if (isCloudMode && db) {
        try {
          await db.collection("doubts").add({
            roomId: activeRoomId,
            author,
            title,
            content,
            createdAtMs: now,
            replies: []
          });
          showToast("Dúvida publicada na sala!");
        } catch (err) {
          console.error(err);
          showToast("Erro ao publicar no Firebase. Confira as regras.");
        }
      } else {
        const all = getLocalDoubts();
        all.unshift({
          id: "local-" + now,
          roomId: activeRoomId,
          author,
          title,
          content,
          createdAt: now,
          replies: []
        });
        saveLocalDoubts(all);
        subscribeCurrentRoom();
        showToast("Dúvida publicada (Modo Local)!");
      }
    }

    async function addReply(doubtId, author, content) {
      const replyObj = {
        id: "rep-" + Date.now(),
        author,
        content,
        createdAt: Date.now()
      };

      if (isCloudMode && db) {
        try {
          await db
            .collection("doubts")
            .doc(doubtId)
            .update({
              replies: firebase.firestore.FieldValue.arrayUnion(replyObj)
            });
          showToast("Resposta enviada!");
        } catch (err) {
          console.error(err);
          showToast("Erro ao enviar resposta.");
        }
      } else {
        const all = getLocalDoubts();
        const target = all.find((d) => d.id === doubtId);
        if (target) {
          target.replies = target.replies || [];
          target.replies.push(replyObj);
          saveLocalDoubts(all);
          subscribeCurrentRoom();
          showToast("Resposta enviada!");
        }
      }
    }

    // Formulário de nova dúvida
    $("#doubt-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const titleInput = $("#doubt-title");
      const contentInput = $("#doubt-content");
      const title = titleInput.value.trim();
      const content = contentInput.value.trim();
      if (!title || !content) return;

      const submitWithNick = (nick) => {
        addDoubt(nick, title, content);
        titleInput.value = "";
        contentInput.value = "";
      };

      if (!currentNickname) {
        openNicknameModal(submitWithNick);
      } else {
        submitWithNick(currentNickname);
      }
    });

    renderRoomTabs();
    updateRoomHeader();
    subscribeCurrentRoom();
  }

  // ------------------------------------------------------------
  // INICIALIZAÇÃO GERAL
  // ------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initThemes();
    initNickname();
    initTimers();
    initSounds();
    initTodos();
    initFlashcards();
    initForum();
  });
})();
