# Sala de Estudos — Ciência da Computação (Projeto de Extensão PES II)

Aplicação web estática, 100% gratuita para hospedar e manter, criada como sala de estudos virtual para alunos de Ciência da Computação.

## Funcionalidades incluídas
- **5 Temas completos** (paleta, fontes, logo SVG e frases): Claro, Escuro, Harry Potter (Sala Precisa), Hora de Aventura (Casa na Árvore) e Marvel (Torre de Estudos).
- **Pomodoro personalizável** com alerta sonoro e contador diário + **Cronômetro Livre** com registro de blocos.
- **Sons Ambientes procedurais** (Chuva, Lareira, Ruído Marrom e Pad Lo-Fi) gerados via Web Audio API (misture quantos quiser, zero links quebrados).
- **Lista de Tarefas** com barra de progresso salva no navegador.
- **Flashcards 3D interativos** com criação, exclusão e embaralhamento.
- **Mural de Dúvidas sem login** (apenas apelido), dividido em **Sala Geral**, **2º Ano** e **3º Ano**. Funciona offline em Modo Local e sincroniza em tempo real entre todos os alunos ao conectar o Firebase gratuito.

---

## Passo 1: Testar agora no seu computador
Basta extrair o ZIP e abrir o arquivo `index.html` diretamente no navegador (ou usar a extensão *Live Server* no VS Code).

---

## Passo 2: Ativar o Mural de Dúvidas Compartilhado (Firebase Gratuito)
Sem cartão de crédito (Plano Spark gratuito):

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e clique em **Criar um projeto**.
2. Dê um nome (ex.: `sala-estudos-cc`), desative o Google Analytics (opcional) e conclua.
3. No menu esquerdo, vá em **Criação > Firestore Database** e clique em **Criar banco de dados**.
4. Escolha a localização mais próxima (ex.: `southamerica-east1` - São Paulo) e selecione **Iniciar no modo de teste** (permite leitura e escrita imediata).
   > **Importante:** Nas regras do Firestore (`Regras`), lembre-se de ajustar a data de expiração ou usar:
   > ```
   > rules_version = '2';
   > service cloud.firestore {
   >   match /databases/{database}/documents {
   >     match /doubts/{docId} {
   >       allow read, create, update: if true;
   >     }
   >   }
   > }
   > ```
5. No ícone de engrenagem (Configurações do projeto), role até **Seus apps**, clique no ícone **Web (`</>`)**, registre o app e copie o objeto `firebaseConfig`.
6. Abra o arquivo `js/config.js` e cole os valores dentro de `firebase: { ... }`.

Assim que salvar, o selo no topo do site muda automaticamente de **Modo Local** para **Online (Sincronizado)**!

---

## Passo 3: Hospedar de Graça para Seus Colegas Acessarem

### Opção A — GitHub Pages (mais simples para PES II)
1. Crie um repositório público no GitHub (ex.: `sala-de-estudos-cc`).
2. Envie todos os arquivos desta pasta (`index.html`, `styles.css`, pasta `js/`).
3. No repositório, vá em **Settings > Pages**.
4. Em **Source**, selecione `Deploy from a branch`, escolha `main` e pasta `/ (root)` e clique em **Save**.
5. Em 1 minuto, seu site estará no ar em `https://seu-usuario.github.io/sala-de-estudos-cc/`.

### Opção B — Vercel (link curto e deploy automático)
1. Suba a pasta para um repositório no GitHub.
2. Acesse [vercel.com](https://vercel.com) com sua conta do GitHub, clique em **Add New > Project**, selecione o repositório e clique em **Deploy**.
3. O link público (`https://sala-de-estudos-cc.vercel.app`) sai na hora.

---

## Como adicionar novas matérias no futuro
Abra `js/config.js` e adicione novos itens dentro do array `rooms`. Exemplo:
```js
{
  id: "redes",
  name: "Redes de Computadores",
  icon: "🌐",
  description: "Camadas OSI, TCP/IP, roteamento e protocolos."
}
```
