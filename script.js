// =============================
// ELEMENTOS
// =============================
let currentPlayer = JSON.parse(localStorage.getItem("player")) || null;
let currentDeckId = null;
let playerDecks = [];
const playerHandElement = document.getElementById("player-hand");
let currentDeck = [];
const CARD_DB = window.CARD_DB || {};
const EFFECTS = window.EFFECTS || {};

let colecao = {};
let decks = JSON.parse(localStorage.getItem("decks")) || [
  { nome: "Deck 1", cartas: [] }
];

let currentDeckIndex = parseInt(localStorage.getItem("currentDeckIndex") || "0");

if (!decks[currentDeckIndex]) {
  currentDeckIndex = 0;
}

function getCurrentDeck() {
  if (!decks[currentDeckIndex]) {
    decks[currentDeckIndex] = { nome: `Deck ${currentDeckIndex + 1}`, cartas: [] };
  }
  return decks[currentDeckIndex].cartas;
}

let rollsDisponiveis = 0;
let graveyardPlayer = [];
let graveyardEnemy = [];
let graveHistory = [];

//cemitério
window.__necromancerReviveActive = false;

console.log("CARD_DB:", CARD_DB);
console.log("EFFECTS:", EFFECTS);
const roll10Modal = document.getElementById("roll10-modal");
const closeRoll10ModalBtn = document.getElementById("close-roll10-modal");
const openDeckBuilderBtn = document.getElementById("open-deck-builder");
const backToMenuDeckBtn = document.getElementById("back-to-menu-deck");

if (openDeckBuilderBtn) {
  openDeckBuilderBtn.onclick = () => {
    showScreen("deck-screen");
    renderDeckBuilder();
  };
}

if (backToMenuDeckBtn) {
  backToMenuDeckBtn.onclick = () => {
    showScreen("start-screen");
  };
}


const deckActionMenu = document.getElementById("deck-action-menu");
const deckActionAdd = document.getElementById("deck-action-add");
const deckActionInfo = document.getElementById("deck-action-info");

let deckMenuCardId = null;
let deckMenuCardData = null;
const btnCancel = document.getElementById("cancel-btn");
const btnMove = document.getElementById("move-btn");
const btnAttack = document.getElementById("attack-btn");

const startGameBtn = document.getElementById("start-game-btn");
const openRollBtn = document.getElementById("open-roll-btn");
const backToMenuBtn = document.getElementById("back-to-menu-btn");
const rollOnceBtn = document.getElementById("roll-once-btn");
const rollTenBtn = document.getElementById("roll-ten-btn");

const graveModal = document.getElementById("graveyard-modal");
const graveCards = document.getElementById("graveyard-cards");
const graveTitle = document.getElementById("graveyard-title");

const openPlayerGrave = document.getElementById("open-player-grave");
const openEnemyGrave = document.getElementById("open-enemy-grave");
const closeGrave = document.getElementById("close-graveyard");

const ZONES = ["bancoPlayer", "campo1", "campo2", "bancoEnemy"];
const LIMITS = { bancoPlayer: 6, campo1: 4, campo2: 4, bancoEnemy: 6 };
const MAX_HAND_SIZE = 10;
const MAX_DECK_SIZE = 20;

const DECK_LIMITS_BY_RARITY = {
  "Básico": 4,
  "Comum": 3,
  "Especial": 2,
  "Extraordinário": 1,
  "Elite": 1
};

const loginScreen = document.getElementById("login-screen");
const startScreen = document.getElementById("start-screen");
const playerNicknameEl = document.getElementById("player-nickname");
const logoutBtn = document.getElementById("logout-btn");
const switchAccountBtn = document.getElementById("switch-account-btn");
function updatePlayerUI() {
  const player = JSON.parse(localStorage.getItem("player"));

  if (playerNicknameEl) {
    playerNicknameEl.textContent = player?.username || "Visitante";
  }
}

function logoutPlayer() {
  localStorage.removeItem("player");
  localStorage.removeItem("token");
  currentPlayer = null;
  colecao = {};

  const usernameInput = document.getElementById("login-username");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");

  if (usernameInput) usernameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (passwordInput) passwordInput.value = "";

  showScreen("login-screen");
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logoutPlayer();
  });
}

if (switchAccountBtn) {
  switchAccountBtn.addEventListener("click", () => {
    logoutPlayer();
  });
}
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

function showStartScreen() {
  if (loginScreen) loginScreen.classList.add("hidden");
  if (startScreen) startScreen.classList.remove("hidden");
  updatePlayerUI();
}

function showLoginScreen() {
  if (loginScreen) loginScreen.classList.remove("hidden");
  if (startScreen) startScreen.classList.add("hidden");
}

if (registerBtn) 
  registerBtn.addEventListener("click", async () => {
  const username = document.getElementById("login-username").value.trim();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  
  if (!email || !password) {
    alert("Preencha os campos");
    return;
  }
  if (!username || !email || !password) {
    alert("Preencha usuário, email e senha.");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Digite um email válido.");
    return;
  }

  try {
    const result = await registerPlayer(username, email, password);
    alert(result.message || result.error);
  } catch (error) {
    console.error(error);
    alert("Erro ao cadastrar.");
  }
});

if (loginBtn) 
 loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    alert("Preencha email e senha.");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Email inválido.");
    return;
  }

  try {
    const result = await loginPlayer(email, password);
    console.log("RESPOSTA LOGIN:", result);

    if (result.player) {
      localStorage.setItem("player", JSON.stringify(result.player));
      localStorage.setItem("token", result.token || "");
      currentPlayer = result.player;
      rollsDisponiveis = result.player.rolls || 0;
      updatePlayerUI();
      updateRollUI();

      alert("Login feito com sucesso!");
      showStartScreen();
    } else {
      alert(result.error || "Erro no login.");
    }
  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    alert("Erro ao fazer login.");
  }
});

  

const savedPlayer = JSON.parse(localStorage.getItem("player"));
currentPlayer = savedPlayer || null;

//eventos dos decks
const deckSelect = document.getElementById("deck-select");
const deckNameInput = document.getElementById("deck-name-input");
const newDeckBtn = document.getElementById("new-deck-btn");
const deleteDeckBtn = document.getElementById("delete-deck-btn");

if (deckSelect) {
  deckSelect.addEventListener("change", (e) => {
    currentDeckIndex = parseInt(e.target.value);
    salvarDados();
    renderDeckBuilder();
  });
}

if (deckNameInput) {
  deckNameInput.addEventListener("input", (e) => {
    if (!decks[currentDeckIndex]) return;
    decks[currentDeckIndex].nome = e.target.value.trim() || `Deck ${currentDeckIndex + 1}`;
    salvarDados();
    renderDeckBuilder();
  });
}

if (newDeckBtn) {
  newDeckBtn.addEventListener("click", () => {
    decks.push({
      nome: `Deck ${decks.length + 1}`,
      cartas: []
    });
    currentDeckIndex = decks.length - 1;
    salvarDados();
    renderDeckBuilder();
    showWarning("Novo deck criado!");
  });
}

if (deleteDeckBtn) {
  deleteDeckBtn.addEventListener("click", () => {
    if (decks.length <= 1) {
      showWarning("Você precisa ter pelo menos 1 deck.");
      return;
    }

    decks.splice(currentDeckIndex, 1);
    currentDeckIndex = Math.max(0, currentDeckIndex - 1);
    salvarDados();
    renderDeckBuilder();
    showWarning("Deck excluído!");
  });
}

// =============================
// EVENTOS DO DECK BUILDER
// =============================
const deckSearchInput = document.getElementById("deck-search");
const deckFilterRarity = document.getElementById("deck-filter-rarity");
const deckFilterType = document.getElementById("deck-filter-type");
const deckCardsDropZone = document.getElementById("deck-cards");
const autoBuildBtn = document.getElementById("auto-build-btn");
const clearDeckBtn = document.getElementById("clear-deck-btn");
const saveDeckBtn = document.getElementById("save-deck-btn");
const deckFilterOwned = document.getElementById("deck-filter-owned");
if (deckFilterOwned) {
  deckFilterOwned.addEventListener("change", renderDeckBuilder);
}


if (deckSearchInput) {
  deckSearchInput.addEventListener("input", renderDeckBuilder);
}

if (deckFilterRarity) {
  deckFilterRarity.addEventListener("change", renderDeckBuilder);
}

if (deckFilterType) {
  deckFilterType.addEventListener("change", renderDeckBuilder);
}

if (deckCardsDropZone) {
  deckCardsDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    deckCardsDropZone.classList.add("drag-over");
  });

  deckCardsDropZone.addEventListener("dragleave", () => {
    deckCardsDropZone.classList.remove("drag-over");
  });

  deckCardsDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    deckCardsDropZone.classList.remove("drag-over");

    const draggingCard = document.querySelector(".builder-card.dragging");
    if (!draggingCard) return;

    const cardId = draggingCard.dataset.cardId;
    if (!cardId) return;

    addCardToDeck(cardId);
  });
}



if (autoBuildBtn) {
  autoBuildBtn.onclick = () => {
    autoBuildDeckFromCollection();
    renderDeckBuilder();
    showWarning("Deck automático criado!");
  };
}

if (clearDeckBtn) {
  clearDeckBtn.onclick = () => {
    clearDeck();
    showWarning("Deck limpo!");
  };
}

if (saveDeckBtn) {
  saveDeckBtn.onclick = () => {
    const deckAtual = getCurrentDeck();

    if (deckAtual.length !== MAX_DECK_SIZE) {
      showWarning(`O deck precisa ter ${MAX_DECK_SIZE} cartas.`);
      return;
    }

    salvarDados();
    showWarning("Deck salvo!");
  };
}
if (deckActionAdd) {
  deckActionAdd.addEventListener("click", () => {
    if (deckMenuCardId) {
      addCardToDeck(deckMenuCardId);
    }
    hideDeckActionMenu();
  });
}

if (deckActionInfo) {
  deckActionInfo.addEventListener("click", () => {
    if (deckMenuCardData) {
      openDeckCardInfo(deckMenuCardData);
    }
    hideDeckActionMenu();
  });
}

document.addEventListener("click", (e) => {
  if (!deckActionMenu) return;
  if (deckActionMenu.classList.contains("hidden")) return;

  if (!e.target.closest(".builder-card") && !e.target.closest("#deck-action-menu")) {
    hideDeckActionMenu();
  }
});

// =============================
// ROLL
// =============================
const ROLL_RATES = [
  { rarity: "Básico", chance: 60 },
  { rarity: "Comum", chance: 29 },
  { rarity: "Especial", chance: 8 },
  { rarity: "Extraordinário", chance: 2 },
  { rarity: "Elite", chance: 1 }
];

function salvarDados() {
  localStorage.setItem("colecao", JSON.stringify(colecao));
  localStorage.setItem("decks", JSON.stringify(decks));
  localStorage.setItem("currentDeckIndex", currentDeckIndex);
  
}

function getRarityClassName(rarity) {
  const value = String(rarity || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (value === "basico" || value === "basica") return "rarity-basico";
  if (value === "comum") return "rarity-comum";
  if (value === "especial") return "rarity-especial";
  if (value === "extraordinario" || value === "estraordinario") return "rarity-extraordinario";
  if (value === "elite") return "rarity-elite";

  return "rarity-basico";
}

function showRoll10Cards(cards) {
  const modal = document.getElementById("roll10-modal");
  const grid = document.getElementById("roll10-cards");

  if (!modal || !grid) return;

  grid.innerHTML = "";

  cards.forEach((card, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "roll10-pack-card";

    const rarityClass = getRarityClassName(card.rarity);

    wrapper.innerHTML = `
      <div class="roll10-pack-inner ${rarityClass}" data-revealed="false">
        <div class="roll10-pack-front">
          <div class="pack-back-symbol">✦</div>
        </div>

        <div class="roll10-pack-back">
          <div class="roll10-pack-emoji">${card.emoji || "🃏"}</div>
          <div class="roll10-pack-name">${card.name}</div>
          <div class="roll10-pack-rarity">${card.rarity}</div>
        </div>
      </div>
    `;

    const inner = wrapper.querySelector(".roll10-pack-inner");

    wrapper.addEventListener("click", () => {
      if (inner.dataset.revealed === "true") return;

      inner.dataset.revealed = "true";
      inner.classList.add("revealed");
    });

    setTimeout(() => {
      wrapper.classList.add("show");
    }, index * 90);

    grid.appendChild(wrapper);
  });

  modal.classList.remove("hidden");
}

function updateRollUI() {
  const el = document.getElementById("rolls-left");
  if (el) {
    el.textContent = `Rolls restantes: ${rollsDisponiveis}`;
  }
}

function jogadorTemCartas() {
  return Object.keys(colecao).length > 0;
}

function rollRarity() {
  const n = Math.random() * 100;
  let acc = 0;

  for (const item of ROLL_RATES) {
    acc += item.chance;
    if (n < acc) return item.rarity;
  }

  return "Básico";
}

function getCardsByRarity(rarity) {
  return Object.values(CARD_DB).filter(card => {
    return card.raridade === rarity || card.rarity === rarity;
  });
}
async function loadCollectionFromServer() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("Token não encontrado.");
    return;
  }

  try {
    const result = await getFullCollection(token);

    if (result.error) {
      console.error("Erro ao buscar coleção:", result.error);
      return;
    }

    colecao = {};

    if (Array.isArray(result.cards)) {
      result.cards.forEach(card => {
        if (card && card.id) {
          colecao[String(card.id)] = card.quantity || 0;
        }
      });
    }

    salvarDados();
    renderCollectionPreview();
    renderDeckBuilder();
  } catch (error) {
    console.error("Erro ao carregar coleção do servidor:", error);
  }
}


async function rollCardOnline() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Faça login primeiro.");
    return null;
  }

  try {
    const result = await rollCardFromServer(token);

    if (result.error) {
      alert(result.error);
      return null;
    }

    const card = result.card;

    if (!card) {
      alert("Nenhuma carta recebida do servidor.");
      return null;
    }

    rollsDisponiveis = result.remainingRolls ?? rollsDisponiveis;
    updateRollUI();
    await loadCollectionFromServer();
    return card;
  } catch (error) {
    console.error("Erro no roll online:", error);
    alert("Erro ao fazer roll.");
    return null;
  }
}

async function rollTenCardsOnline() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Faça login primeiro.");
    return [];
  }

  try {
    const result = await rollTenCardsFromServer(token);

    if (result.error) {
      alert(result.error);
      return [];
    }

    rollsDisponiveis = result.remainingRolls ?? rollsDisponiveis;
    updateRollUI();

    await loadCollectionFromServer();

    return result.cards || [];
  } catch (error) {
    console.error("Erro no roll x10 online:", error);
    alert("Erro ao fazer 10 rolls.");
    return [];
  }
}


function fazerRollInicial(qtd = 10) {
  return [];
}

function getRarityClass(card) {
  const rarity = (card.rarity || card.raridade || "Básico")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (rarity === "basico") return "rarity-basico";
  if (rarity === "comum") return "rarity-comum";
  if (rarity === "especial") return "rarity-especial";
  if (rarity === "extraordinario") return "rarity-extraordinario";
  if (rarity === "elite") return "rarity-elite";

  return "rarity-basico";
}

function getCardHTML(card, options = {}) {
  const summonCost = options.summonCost ?? card.cost ?? 0;
  const showSummon = options.showSummon ?? false;
  const showMove = options.showMove ?? true;
  const showAttack = options.showAttack ?? true;

  if (card.cardClass === "effect") {
    return `
      <div class="card-inner card-effect ${getRarityClass(card)}">
        <div class="card-name">${card.name}</div>
        <div class="card-emoji">${card.emoji || "✨"}</div>
        ${typeBadgeHTML(card.type || "Effect")}
        <div class="card-effect-text">${card.text || "Carta de efeito."}</div>
        <div class="mini-costs effect-only">
          <span class="pill pill-cost">⚡ ${card.cost ?? 0}</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="card-inner ${getRarityClass(card)}">
      <div class="card-name">${card.name}</div>
      <div class="card-emoji">${card.emoji || "🃏"}</div>
      ${typeBadgeHTML(card.type)}
      <div class="mini-costs">
        <span class="pill pill-atk">⚔ ${card.attack ?? 0}</span>
        <span class="pill pill-def">🛡 ${card.defense ?? 0}</span>
      </div>
      <div class="mini-costs">
        ${showSummon ? `<span class="pill pill-summon">✦ ${summonCost}</span>` : ""}
        ${showMove ? `<span class="pill pill-move">➜ ${card.cost ?? 0}</span>` : ""}
        ${showAttack ? `<span class="pill pill-atk">🔥 ${card.attackCost ?? 0}</span>` : ""}
      </div>
    </div>
  `;
}
// =============================
// DECK AUTOMÁTICO A PARTIR DA COLEÇÃO
// =============================
function autoBuildDeckFromCollection() {
  const novoDeck = [];
  const copiesInDeck = {};
  const cardIds = Object.keys(colecao).filter(id => CARD_DB[id]);

  if (cardIds.length === 0) {
    decks[currentDeckIndex].cartas = [];
    salvarDados();
    return;
  }

  while (novoDeck.length < MAX_DECK_SIZE) {
    const cartasValidas = cardIds.filter(cardId => {
      const card = CARD_DB[cardId];
      const owned = colecao[cardId] || 0;
      const rarity = card.rarity || card.raridade || "Básico";
      const limit = DECK_LIMITS_BY_RARITY[rarity] || 1;
      const inDeck = copiesInDeck[cardId] || 0;

      return inDeck < owned && inDeck < limit;
    });

    if (cartasValidas.length === 0) break;

    const randomId = cartasValidas[Math.floor(Math.random() * cartasValidas.length)];
    novoDeck.push(String(randomId));
    copiesInDeck[randomId] = (copiesInDeck[randomId] || 0) + 1;
  }

  novoDeck.sort(() => Math.random() - 0.5);
  decks[currentDeckIndex].cartas = novoDeck;
  salvarDados();
}

// =============================
// CONVERTER CARTAS ANTIGAS
// =============================
function normalizeCardStats(card) {
  if (!card) return card;

  if (card.defense == null && card.health != null) {
    card.defense = card.health;
  }

  if (card.rarity == null && card.raridade != null) {
    card.rarity = card.raridade;
  }

  return card;
}

function buildPlayerDeckFromSavedDeck() {
  const deckAtual = getCurrentDeck();

  return deckAtual
    .filter(id => CARD_DB[id])
    .map(id => createCardFromId(id))
    .filter(Boolean)
    .sort(() => Math.random() - 0.5);
}

function ensureCardTurnState(card) {
  if (!card) return;

  if (card._stateTurn !== turnNumber) {
    card._stateTurn = turnNumber;
    card.actionsUsed = 0;
    card.attacksUsed = 0;
    card.movedThisTurn = false;
  }
}
function triggerDivideAndConquer(attackerUnit) {
  if (!window.__divideAndConquerActive) return;

  const effectOwner = window.__divideAndConquerOwner || "player";

  window.__divideAndConquerActive = false;
  window.__divideAndConquerOwner = null;

  // dano no atacante
  if (attackerUnit?.card) {
    applyDamageToCard(attackerUnit.card, 300);
  }

  // define banco e campo conforme quem ativou a carta
  const fromBenchZone = effectOwner === "player" ? "bancoPlayer" : "bancoEnemy";
  const toActiveZone = effectOwner === "player" ? "campo1" : "campo2";

  const allyFromBench =
    board[fromBenchZone].find(u => u.owner === effectOwner) || null;

  if (allyFromBench && board[toActiveZone].length < LIMITS[toActiveZone]) {
    board[fromBenchZone] = board[fromBenchZone].filter(u => u !== allyFromBench);
    board[toActiveZone].push(allyFromBench);

    showWarning(
      `⚔️ Dividir e Conquistar causou 300 de dano e moveu ${allyFromBench.card.name} para ${toActiveZone}!`
    );
  } else {
    showWarning("⚔️ Dividir e Conquistar causou 300 de dano ao atacante!");
  }

  cleanupDeadUnits();
}

function getMobilizeReduction() {
  let reduction = 0;

  ["bancoPlayer", "campo1", "campo2"].forEach(zone => {
    board[zone].forEach(unit => {
      if (unit.owner === "player" && unit.card?.mobilize) {
        reduction += unit.card.mobilize;
      }
    });
  });

  return reduction;
}

function getSummonCost(card) {
  const reduction = getMobilizeReduction();
  return Math.max(0, (card.cost || 0) - reduction);
}

function getHeavyArmorReduction(card) {
  const armor = card?.heavyArmor ?? 0;

  if (armor === 1) return 0.30;
  if (armor === 2) return 0.50;
  if (armor === 3) return 0.70;

  return 0;
}

function applyDamageToCard(card, amount, sourceCard = null) {

  if (!card || typeof amount !== "number") return;

  if (card.frozenUntilTurn && card.frozenUntilTurn >= window.turnNumber) {
    return;
  }

  let armor = card?.heavyArmor ?? 0;

  if (sourceCard?.ignoreHeavyArmor) {
    armor = 0;
  } else if (sourceCard?.armorPierce) {
    armor = Math.max(0, armor - sourceCard.armorPierce);
  }

  const reduction = getHeavyArmorReduction({ heavyArmor: armor });

  const finalDamage = Math.max(1, Math.round(amount * (1 - reduction)));

  card.defense -= finalDamage;
}

function removeSmokescreenAfterAction(card) {
  if (!card) return;
  if (card.smokescreen) {
    card.smokescreen = false;
  }
}

function applyPinned(targetCard, turns = 1) {
  if (!targetCard) return;
  targetCard.pinnedUntilTurn = turnNumber + turns;
}

function canAttackTarget(attackerZone, targetZone, attackerCard) {
  if (!attackerCard) return false;

  // DISTANTE: pode atacar do banco
  if (attackerCard.ranged) {
    if (attackerZone === "bancoPlayer") {
      return targetZone === "campo1" || targetZone === "campo2";
    }

    if (attackerZone === "bancoEnemy") {
      return targetZone === "campo1" || targetZone === "campo2";
    }
  }

  return ADJ[attackerZone]?.includes(targetZone);
}

function registerMoveAction(unit) {
  if (!unit?.card) return;

  ensureCardTurnState(unit.card);
  unit.card.actionsUsed += 1;
  unit.card.movedThisTurn = true;
  unit.card.actionTurn = turnNumber;

  removeSmokescreenAfterAction(unit.card);
}

function registerAttackAction(unit) {
  if (!unit?.card) return;

  ensureCardTurnState(unit.card);
  unit.card.attacksUsed += 1;

  if (unit.card.riposte) {
    // Riposte usa contador próprio
    unit.card.actionTurn = turnNumber;
  } else {
    unit.card.actionsUsed += 1;
    unit.card.actionTurn = turnNumber;
  }

  removeSmokescreenAfterAction(unit.card);

  // Ambush é perdido se atacar primeiro
  if (unit.card.ambush) {
    unit.card.ambush = false;
  }
}

// =============================
// VISUAL DAS TELAS
// =============================
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
    screen.classList.remove("active");
  });

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.remove("hidden");
    target.classList.add("active");
  }
}

function renderCollectionPreview() {
  const list = document.getElementById("collection-preview-list");
  if (!list) return;

  list.innerHTML = "";

  const ids = Object.keys(colecao);

  if (ids.length === 0) {
    list.innerHTML = "<p>Nenhuma carta ainda.</p>";
    return;
  }

  ids.forEach(id => {
    const card = CARD_DB[id];
    if (!card) return;

    const item = document.createElement("div");
    item.className = "collection-item";
    item.innerHTML = `
      <span>${card.name}</span>
      <span>x${colecao[id]}</span>
    `;
    list.appendChild(item);
  });
}

// =============================
// DECK BUILDER MELHORADO
// =============================
function getNormalizedRarity(card) {
  const rarity = card.rarity || card.raridade || "Básico";

  if (rarity === "Basico") return "Básico";
  if (rarity === "Extraordinario") return "Extraordinário";

  return rarity;
}
function getCardType(card) {
  if (card.type) return card.type;
  if (card.cardType) return card.cardType;

  if (card.cardClass === "effect") return "Effect";
  if (card.cardClass === "unit") return card.type || "Unidade";

  return "Sem tipo";
}

function getCopiesInDeck(cardId) {
  const deckAtual = getCurrentDeck();
  return deckAtual.filter(id => String(id) === String(cardId)).length;
}

function getOwnedCopies(cardId) {
  return colecao[String(cardId)] || 0;
}

function canAddCardToDeck(cardId) {
  const card = CARD_DB[cardId];
  const deckAtual = getCurrentDeck();

  if (!card) return false;

  if (deckAtual.length >= MAX_DECK_SIZE) {
    showWarning("Deck cheio!");
    return false;
  }

  const rarity = getNormalizedRarity(card);
  const limitByRarity = DECK_LIMITS_BY_RARITY[rarity] || 1;
  const copiesInDeck = getCopiesInDeck(cardId);
  const ownedCopies = getOwnedCopies(cardId);

  if (copiesInDeck >= ownedCopies) {
    showWarning("Você não tem mais cópias dessa carta.");
    return false;
  }

  if (copiesInDeck >= limitByRarity) {
    showWarning(`Limite de ${limitByRarity} cópia(s) para essa raridade.`);
    return false;
  }

  return true;
}

function addCardToDeck(cardId) {
  cardId = String(cardId);

  const deckAtual = getCurrentDeck();

  if (!canAddCardToDeck(cardId)) return;

  deckAtual.push(cardId);
  salvarDados();
  renderDeckBuilder();
}

function removeCardFromDeck(index) {
  const deckAtual = getCurrentDeck();

  if (index < 0 || index >= deckAtual.length) return;

  deckAtual.splice(index, 1);
  salvarDados();
  renderDeckBuilder();
}

function clearDeck() {
  decks[currentDeckIndex].cartas = [];
  salvarDados();
  renderDeckBuilder();
}

function renderDeckBuilder() {
  const deckAtual = getCurrentDeck();

  const collectionDiv = document.getElementById("collection-cards");
  const deckDiv = document.getElementById("deck-cards");
  const deckCountEl = document.getElementById("deck-count");
  const searchInput = document.getElementById("deck-search");
  const rarityFilter = document.getElementById("deck-filter-rarity");
  const typeFilter = document.getElementById("deck-filter-type");
  const ownedFilter = document.getElementById("deck-filter-owned");
  const deckSelect = document.getElementById("deck-select");
  const deckNameInput = document.getElementById("deck-name-input");

  if (!collectionDiv || !deckDiv || !deckCountEl) return;

  if (deckSelect) {
    deckSelect.innerHTML = "";
    decks.forEach((d, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = d.nome;
      if (index === currentDeckIndex) option.selected = true;
      deckSelect.appendChild(option);
    });
  }

  if (deckNameInput && decks[currentDeckIndex]) {
    deckNameInput.value = decks[currentDeckIndex].nome;
  }

  const search = (searchInput?.value || "").toLowerCase().trim();
  const selectedRarity = rarityFilter?.value || "all";
  const selectedType = typeFilter?.value || "all";
  const selectedOwnedMode = ownedFilter?.value || "owned";

  collectionDiv.innerHTML = "";
  deckDiv.innerHTML = "";
  deckCountEl.textContent = `${deckAtual.length}/${MAX_DECK_SIZE}`;

  const sourceIds =
    selectedOwnedMode === "all"
      ? Object.keys(CARD_DB)
      : Object.keys(colecao);

  const collectionIds = sourceIds
    .filter(id => CARD_DB[id])
    .sort((a, b) => {
      const cardA = CARD_DB[a];
      const cardB = CARD_DB[b];
      return (cardA.name || "").localeCompare(cardB.name || "");
    });

  const filteredIds = collectionIds.filter(id => {
    const card = CARD_DB[id];
    if (!card) return false;

    const cardName = (card.name || "").toLowerCase();
    const rarity = getNormalizedRarity(card);
    const type = getCardType(card);

    const matchesSearch = !search || cardName.includes(search);
    const matchesRarity = selectedRarity === "all" || rarity === selectedRarity;
    const matchesType = selectedType === "all" || type === selectedType;

    return matchesSearch && matchesRarity && matchesType;
  });

  if (filteredIds.length === 0) {
    collectionDiv.innerHTML = `<div class="builder-card">Nenhuma carta encontrada.</div>`;
  }

  filteredIds.forEach(id => {
  const card = CARD_DB[id];
  const ownedCopies = getOwnedCopies(id);
  const copiesInDeck = getCopiesInDeck(id);
  const rarity = getNormalizedRarity(card);
  const type = getCardType(card);
  const limit = DECK_LIMITS_BY_RARITY[rarity] || 1;
  const isOwned = ownedCopies > 0;

  const el = document.createElement("div");
  el.className = "builder-card";
  el.draggable = isOwned;
  el.dataset.cardId = id;

  el.innerHTML = `
    <div class="builder-emoji">${card.emoji || "🃏"}</div>
    <div class="builder-name">${card.name}</div>
    <div class="builder-info">${rarity}</div>
    <div class="builder-info">${type}</div>
    <div class="builder-copies">
      Coleção: ${ownedCopies} | Deck: ${copiesInDeck}/${limit}
    </div>
  `;

  if (!isOwned) {
    el.style.opacity = "0.45";
    el.style.filter = "grayscale(0.85)";
  }

  el.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!isOwned) {
      showWarning("Você ainda não possui essa carta.");
      return;
    }

    showDeckActionMenu(e.pageX, e.pageY, id, card);
  });

  if (isOwned) {
    el.addEventListener("dragstart", () => {
      el.classList.add("dragging");
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
    });
  }

  collectionDiv.appendChild(el);
});
  const groupedDeck = {};

  deckAtual.forEach((cardId, index) => {
    const id = String(cardId);
    const card = CARD_DB[id];
    if (!card) return;

    if (!groupedDeck[id]) {
      groupedDeck[id] = {
        card,
        indexes: [],
        copies: 0
      };
    }

    groupedDeck[id].indexes.push(index);
    groupedDeck[id].copies++;
  });

  if (deckAtual.length === 0) {
    deckDiv.innerHTML = `<div class="builder-card">Arraste cartas aqui ou clique para montar.</div>`;
    return;
  }

  Object.keys(groupedDeck).forEach(id => {
    const entryData = groupedDeck[id];
    const card = entryData.card;
    const rarity = getNormalizedRarity(card);
    const type = getCardType(card);

    const entry = document.createElement("div");
    entry.className = "deck-entry";

    entry.innerHTML = `
      <div class="deck-entry-left">
        <div class="deck-entry-emoji">${card.emoji || "🃏"}</div>
        <div>
          <div class="deck-entry-name">${card.name} x${entryData.copies}</div>
          <div class="deck-entry-info">${rarity} • ${type}</div>
        </div>
      </div>

      <div class="deck-entry-controls">
        <button class="remove-one-btn">-</button>
        <button class="add-one-btn">+</button>
      </div>
    `;

    entry.querySelector(".remove-one-btn").addEventListener("click", () => {
      const lastIndex = entryData.indexes[entryData.indexes.length - 1];
      removeCardFromDeck(lastIndex);
    });

    entry.querySelector(".add-one-btn").addEventListener("click", () => {
      addCardToDeck(id);
    });

    deckDiv.appendChild(entry);
  });
}
function renderRollResult(card) {
  const box = document.getElementById("roll-result-card");
  if (!box || !card) return;

  const finalCard = normalizeCardStats({ ...card });

  box.innerHTML = `
    <div class="card big-roll-card">
      ${getCardHTML(finalCard, {
        showSummon: finalCard.cardClass !== "effect",
        showMove: finalCard.cardClass !== "effect",
        showAttack: finalCard.cardClass !== "effect",
        summonCost: finalCard.cost ?? 0
      })}
    </div>
  `;
}

function garantirColecaoInicial() {
  if (jogadorTemCartas()) return;

  const cartasIniciais = fazerRollInicial(10);

  let msg = "Suas cartas iniciais:\n\n";
  cartasIniciais.forEach(c => {
    msg += `${c.name} (${c.rarity || c.raridade})\n`;
  });

  alert(msg);
}

function garantirDeckInicial() {
  const deckAtual = getCurrentDeck();

  if (!deckAtual || deckAtual.length === 0) {
    autoBuildDeckFromCollection();
  }
}

// =============================
// VISUAL DOS TIPOS
// =============================
const TYPE_META = {
  Pusher: { color: "#7CFF5B", icon: "♦" },
  Juggernaut: { color: "#FF3B3B", icon: "⬟" },
  Equalizer: { color: "#4DA3FF", icon: "▲" },
  Effect: { color: "#FFD54A", icon: "▣!" }
};

const ADJ = {
  bancoPlayer: ["campo1"],
  campo1: ["bancoPlayer", "campo2"],
  campo2: ["campo1", "bancoEnemy"],
  bancoEnemy: ["campo2"]
};

let turnNumber = 0;

// =============================
// BOARD
// =============================
let board = {
  bancoPlayer: [],
  campo1: [],
  campo2: [],
  bancoEnemy: []
};

let playerDeck = [];
let playerHand = [];

let actionMode = null;
let selected = null;
let currentTurn = "player";

let enemyDeck = [];
let enemyHand = [];

// =============================
// PE
// =============================
let playerPE = 0;
let maxPE = 0;
const maxPELimit = 10;

// =============================
// VIDA DOS JOGADORES
// =============================
let enemyLife = 4;
let playerLife = 4;

// =============================
// GLOBAIS PARA EFEITOS
// =============================
function syncGlobals() {
  window.board = board;
  window.playerDeck = playerDeck;
  window.enemyDeck = enemyDeck;
  window.enemyHand = enemyHand;
  window.playerHand = playerHand;
  window.graveyardPlayer = graveyardPlayer;
  window.graveyardEnemy = graveyardEnemy;
  window.turnNumber = turnNumber;
  window.playerLife = playerLife;
  window.enemyLife = enemyLife;
  window.playerPE = playerPE;
  window.maxPE = maxPE;
  window.showWarning = showWarning;
  window.cleanupDeadUnits = cleanupDeadUnits;
  window.runEffects = runEffects;

  window.__bonusPENextTurn = window.__bonusPENextTurn || 0;
  window.__delayCounterActive = window.__delayCounterActive || false;
  window.__interceptCounterActive = window.__interceptCounterActive || false;
  window.__panicCounterActive = window.__panicCounterActive || false;
}

// =============================
// CRIAR CARTA PELO ID
// =============================
function createCardFromId(id) {
  const base = CARD_DB[id];
  if (!base) return null;

  const normalizedBase = normalizeCardStats(structuredClone(base));

  return {
    ...normalizedBase,
    emoji: normalizedBase.emoji || "🃏",
    summonedTurn: null,
    actionTurn: null,
    tempBuffs: [],
    tempFlags: [],
    ignoreClassAdvantage: false,
    berserk: false
  };
}

function canAct(unit, actionType = "any") {
  if (!unit || !unit.card) return false;

  const card = unit.card;
  ensureCardTurnState(card);

  // Congelada
  if (card.frozenUntilTurn && card.frozenUntilTurn >= turnNumber) {
    return false;
  }

  // Permanente travada
  if (card.permaPinned) {
    return false;
  }

  // Dormindo
  if (card.sleepUntilTurn && turnNumber <= card.sleepUntilTurn) {
    return false;
  }

  // Presa neste turno
  if (card.pinnedUntilTurn && card.pinnedUntilTurn >= turnNumber) {
    return false;
  }

  // Invocada neste turno sem blitz
  if (card.summonedTurn === turnNumber && !card.blitz) {
    return false;
  }

  // RIPOSTE: pode atacar 2x, mas não pode mover antes
  if (actionType === "attack" && card.riposte) {
    if (card.movedThisTurn) return false;
    return card.attacksUsed < 2;
  }

  // BLITZ: pode fazer 2 ações
  if (card.blitz) {
    return card.actionsUsed < 2;
  }

  // Normal: 1 ação por turno
  return card.actionsUsed < 1;
}

 
// =============================
// BADGE DO TIPO
// =============================
function typeBadgeHTML(type) {
  const meta = TYPE_META[type] || { color: "#fff", icon: "?" };
  return `
    <div class="type-badge" style="border-color:${meta.color}; color:${meta.color}">
      <span class="type-icon">${meta.icon}</span>
      <span class="type-text">${type}</span>
    </div>
  `;
}

// =============================
// VANTAGEM / DESVANTAGEM
// =============================
function typeMultiplier(attType, defType, attackerCard = null, defenderCard = null) {
  if (attType === "Effect" || defType === "Effect") return 1;

  if (attackerCard?.ignoreClassAdvantage || defenderCard?.ignoreClassAdvantage) {
    return 1;
  }

  // vantagem especial do Gamedron contra Pusher
  if (attackerCard?.bonusVsPusher && defType === "Pusher") {
    return 2;
  }

  if (defenderCard?.bonusVsPusher && attType === "Pusher") {
    return 0.5;
  }

  // BERSERK
  if (attackerCard?.berserk) return 2;
  if (defenderCard?.berserk) return 2;

  const beats = {
    Pusher: "Equalizer",
    Equalizer: "Juggernaut",
    Juggernaut: "Pusher"
  };

  if (attType === defType) return 1;
  if (beats[attType] === defType) return 2;
  if (beats[defType] === attType) return 0.5;
  return 1;
}

// =============================
// RODAR EFEITOS
// =============================
function runEffects(card, trigger, ctx = {}) {
  if (!card || !card.effects) return true;

  if (window.__clusterCounterActive) {

  const cardName = card?.name?.toLowerCase();

  if (cardName === "horizonte de eventos" || cardName === "buraco de minhoca") {

    const gain = card.cost ?? 0;

    window.playerPE += gain;

    if (window.playerPE > window.maxPE) {
      window.playerPE = window.maxPE;
    }

    showWarning(`💠 Cluster Antimatéria cancelou ${card.name} e gerou ${gain} PE!`);

  } else {

    showWarning(`💠 Cluster Antimatéria cancelou ${card.name}!`);

  }

  window.__clusterCounterActive = false;

  return; // cancela o efeito
}

  if (
    window.__astrumFieldLockActive &&
    card.id !== "E014" &&
    card.cardClass !== "token"
  ) {
    showWarning("🌌 Astrum anulou os efeitos!");
    return false;
  }

  if (ctx?.target?.card?.effectImmune) {
    showWarning(`✨ ${ctx.target.card.name} é imune a efeitos!`);
    return false;
  }

  if (
    window.__interceptCounterActive &&
  ctx?.owner === "enemy" &&
  card.cardClass === "effect" &&
  trigger === "onPlay"
) {
  window.__interceptCounterActive = false;

  if (window.__blefarActive) {
    window.__blefarActive = false;
    showWarning("🎭 Blefar descartou a contramedida inimiga!");
  } else {
    showWarning("🛡 Interceptar cancelou o efeito inimigo!");
    return false;
  }
}

  if (
    window.__mirrorCounterActive &&
    ctx?.owner === "enemy" &&
    card.cardClass === "effect" &&
    trigger === "onPlay"
  ) {
    window.__mirrorCounterActive = false;

    showWarning("🪞 Espelho refletiu o efeito!");

    runEffects(card, "onPlay", {
      ...ctx,
      owner: "player"
    });

    return false;
  }

  for (const effect of card.effects) {
    if (typeof effect === "string") continue;
    if (effect.trigger !== trigger) continue;

    const fn = EFFECTS?.[effect.id];
    if (fn) {
      fn({ ...ctx, card }, effect);
    }
  }

  return true;
}
function animateCardToGraveyard(cardElement, isPlayer){

if(!cardElement) return;

const graveBtn = isPlayer
? document.getElementById("open-player-grave")
: document.getElementById("open-enemy-grave");

if(!graveBtn) return;

const rectCard = cardElement.getBoundingClientRect();
const rectGrave = graveBtn.getBoundingClientRect();

const clone = cardElement.cloneNode(true);

clone.classList.add("card-death-animation");

clone.style.left = rectCard.left + "px";
clone.style.top = rectCard.top + "px";
clone.style.width = rectCard.width + "px";
clone.style.height = rectCard.height + "px";

document.body.appendChild(clone);

setTimeout(()=>{

clone.style.left = rectGrave.left + "px";
clone.style.top = rectGrave.top + "px";
clone.style.transform = "scale(0.2)";
clone.style.opacity = "0";

},10);

setTimeout(()=>{
clone.remove();
},700);

}

function animateHandCardToGraveyard(handCardElement, isPlayer = true) {
  if (!handCardElement) return;

  const graveBtn = isPlayer
    ? document.getElementById("open-player-grave")
    : document.getElementById("open-enemy-grave");

  if (!graveBtn) return;

  const rectCard = handCardElement.getBoundingClientRect();
  const rectGrave = graveBtn.getBoundingClientRect();

  const clone = handCardElement.cloneNode(true);
  clone.classList.add("card-death-animation");

  clone.style.left = rectCard.left + "px";
  clone.style.top = rectCard.top + "px";
  clone.style.width = rectCard.width + "px";
  clone.style.height = rectCard.height + "px";

  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.left = rectGrave.left + "px";
    clone.style.top = rectGrave.top + "px";
    clone.style.transform = "scale(0.2)";
    clone.style.opacity = "0";
  });

  setTimeout(() => {
    clone.remove();
  }, 700);
}
// =============================
// CEMITÉRIO
// =============================
function sendToGraveyard(unit){
  if(!unit || !unit.card) return;

  const deadCard = structuredClone(unit.card);
  deadCard.__lastOwner = unit.owner;

  runEffects(deadCard, "onDefeat", {
    card: deadCard,
    owner: unit.owner,
    cleanupDead: cleanupDeadUnits
  });

  graveHistory.unshift({
    card: deadCard,
    turn: turnNumber,
    owner: unit.owner
  });

  if(unit.owner === "player"){
    graveyardPlayer.push(deadCard);
  }else{
    graveyardEnemy.push(deadCard);
  }

  updateGraveyardUI();
}
// =============================
// LIMPAR MORTOS
// =============================
function cleanupDeadUnits() {
  Object.keys(board).forEach(zone => {
    const survivors = [];

    board[zone].forEach(unit => {
      if (!unit || !unit.card) return;

      if (unit.card.defense <= 0) {
        sendToGraveyard(unit);
      } else {
        survivors.push(unit);
      }
    });

    board[zone] = survivors;
  });

  updateEudoriaPrince();
  syncGlobals();
}

// =============================
// BUFFS TEMPORÁRIOS
// =============================
function updateTemporaryBuffs() {
  Object.keys(board).forEach(zone => {
    board[zone].forEach(unit => {
      const card = unit.card;
      if (!card) return;

      // Buffs temporários
      if (card.tempBuffs && card.tempBuffs.length > 0) {
        for (let i = card.tempBuffs.length - 1; i >= 0; i--) {
          card.tempBuffs[i].turns -= 1;

          if (card.tempBuffs[i].turns <= 0) {
            if (card.tempBuffs[i].stat === "attack") {
              card.attack -= card.tempBuffs[i].amount;
            }

            if (card.tempBuffs[i].stat === "defense") {
              card.defense -= card.tempBuffs[i].amount;
            }

            card.tempBuffs.splice(i, 1);
          }
        }
      }

      // Flags temporárias
      if (card.tempFlags && card.tempFlags.length > 0) {
        for (let i = card.tempFlags.length - 1; i >= 0; i--) {
          card.tempFlags[i].turns -= 1;

          if (card.tempFlags[i].turns <= 0) {
            const flagKey = card.tempFlags[i].key;
            card[flagKey] = false;
            card.tempFlags.splice(i, 1);
          }
        }
      }
    });
  });
}

function getEnemyActiveCard() {
  return board.campo2.find(unit => unit.owner !== "player") || null;
}

function getEnemyTarget() {
  const enemyCampo = board.campo2.find(unit => unit.owner !== "player");
  if (enemyCampo) return enemyCampo;

  const enemyBanco = board.bancoEnemy.find(unit => unit.owner !== "player");
  if (enemyBanco) return enemyBanco;

  return null;
}

// =============================
// AVISO BONITO
// =============================
function showWarning(text) {
  const warning = document.getElementById("game-warning");
  if (!warning) return;

  warning.textContent = text;
  warning.classList.add("show");

  setTimeout(() => warning.classList.remove("show"), 2000);
}

// =============================
// TURNO UI
// =============================
function updateTurnUI() {
  const turnText = document.getElementById("turn-display");
  if (turnText) turnText.textContent = "Turno: " + turnNumber;
}

// =============================
// UI DO CEMITÉRIO
// =============================
function updateGraveyardUI() {
  const p = document.getElementById("graveyard-player-count");
  const e = document.getElementById("graveyard-enemy-count");

  if (p) p.textContent = graveyardPlayer.length;
  if (e) e.textContent = graveyardEnemy.length;
}


function showDeckActionMenu(x, y, cardId, cardData) {
  if (!deckActionMenu) return;

  deckMenuCardId = String(cardId);
  deckMenuCardData = cardData;

  deckActionMenu.style.left = `${x}px`;
  deckActionMenu.style.top = `${y}px`;
  deckActionMenu.classList.remove("hidden");
}

function hideDeckActionMenu() {
  if (!deckActionMenu) return;

  deckActionMenu.classList.add("hidden");
  deckMenuCardId = null;
  deckMenuCardData = null;
}
// =============================
// MODAL DO CEMITÉRIO
// =============================
function openGraveyard(grave, title) {
  if (!graveModal || !graveCards || !graveTitle) return;

  graveModal.classList.remove("hidden");
  graveTitle.textContent = title;
  graveCards.innerHTML = "";

  if (grave.length === 0) {
    graveCards.innerHTML = "<p>Nenhuma carta no cemitério.</p>";
    return;
  }

  grave.forEach((card, i) => {
    const el = document.createElement("div");

    el.className = "card";

    el.innerHTML = `
      <div>${card.name}</div>
      <div style="font-size:30px">${card.emoji || "🃏"}</div>
      <div>${card.attack}⚔️ ${card.defense}🛡️</div>
      <div style="font-size:10px; opacity:0.8;">#${i + 1}</div>
    `;
    // SE NECROMANTE ESTIVER ATIVO
  if (window.__necromancerReviveActive) {

    el.style.cursor = "pointer";

    el.onclick = () => {

      const revived = grave.splice(i,1)[0];

      const unit = {
        owner: "player",
        card: structuredClone(revived)
      };

      unit.card.summonedTurn = turnNumber;

      board.bancoPlayer.push(unit);

      window.__necromancerReviveActive = false;

      graveModal.classList.add("hidden");

      showWarning(`💀 Necromante reviveu ${revived.name}!`);

      renderAll();
    };
  }

    graveCards.appendChild(el);
  });
}

if (openPlayerGrave) {
  openPlayerGrave.onclick = () => {
    openGraveyard(graveyardPlayer, "Seu Cemitério");
  };
}

if (openEnemyGrave) {
  openEnemyGrave.onclick = () => {
    openGraveyard(graveyardEnemy, "Cemitério do Inimigo");
  };
}

if (closeGrave) {
  closeGrave.onclick = () => {
    if (graveModal) graveModal.classList.add("hidden");
  };
}

// =============================
// MENU DE AÇÕES
// =============================
let menuTarget = null;

function showCardMenu(x, y, zone, index) {
  const menu = document.getElementById("card-menu");
  if (!menu) return;

  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.style.display = "flex";

  menuTarget = { zone, index };
}

function hideCardMenu() {
  const menu = document.getElementById("card-menu");
  if (menu) menu.style.display = "none";
  menuTarget = null;
}

// =============================
// BOTÕES DO MENU
// =============================
const btnEffect = document.getElementById("effect-btn");
const cardInfoModal = document.getElementById("card-info-modal");
const cardInfoTitle = document.getElementById("card-info-title");
const cardInfoText = document.getElementById("card-info-text");
const closeCardInfo = document.getElementById("close-card-info");



function openCardInfo(card) {
  if (!card || !cardInfoModal) return;

  cardInfoTitle.textContent = card.name || "Carta";
  cardInfoText.textContent =
    card.text && card.text.trim() !== ""
      ? card.text
      : "Essa carta não possui efeito.";

  cardInfoModal.classList.remove("hidden");
}

function closeCardInfoModal() {
  if (!cardInfoModal) return;
  cardInfoModal.classList.add("hidden");
}

if (closeCardInfo) {
  closeCardInfo.onclick = closeCardInfoModal;
}

if (cardInfoModal) {
  cardInfoModal.addEventListener("click", (e) => {
    if (e.target === cardInfoModal) {
      closeCardInfoModal();
    }
  });
}

if (btnCancel) {
  btnCancel.onclick = () => {
    actionMode = null;
    selected = null;
    hideCardMenu();
    renderBoard();
  };
}

if (btnMove) {
  btnMove.onclick = () => {
    if (!menuTarget) return;
    actionMode = "move";
    selected = menuTarget;
    hideCardMenu();
    renderBoard();
    showWarning("🔵 Clique numa ZONA vizinha para mover");
  };
}

if (btnAttack) {
  btnAttack.onclick = () => {
    if (!menuTarget) return;

    actionMode = "attack";
    selected = menuTarget;
    hideCardMenu();
    renderBoard();
    showWarning("⚔ Clique numa carta inimiga vizinha ou no banco inimigo vazio");
  };
}

if (btnEffect) {
  btnEffect.onclick = () => {
    if (!menuTarget) return;

    const zone = menuTarget.zone;
    const index = menuTarget.index;
    const unit = board[zone] && board[zone][index];

    if (!unit || !unit.card) {
      hideCardMenu();
      return;
    }

    openCardInfo(unit.card);
    hideCardMenu();
  };
}
function openDeckCardInfo(card) {
  if (!card || !cardInfoModal) return;

  const rarity = card.rarity || card.raridade || "Sem raridade";
  const type = getCardType(card);
  const atk = card.attack ?? 0;
  const def = card.defense ?? card.health ?? 0;
  const cost = card.cost ?? 0;
  const attackCost = card.attackCost ?? 0;

  cardInfoTitle.textContent = `${card.name || "Carta"} ${card.emoji || "🃏"}`;

  cardInfoText.textContent =
`Raridade: ${rarity}
Tipo: ${type}
Custo: ${cost}
Ataque: ${atk}
Defesa: ${def}
Custo de ataque: ${attackCost}

Efeito:
${card.text && card.text.trim() ? card.text : "Essa carta não possui efeito."}`;

  cardInfoModal.classList.remove("hidden");
}

// =============================
// BOTÕES DAS TELAS
// =============================
if (startGameBtn) {
  startGameBtn.addEventListener("click", () => {
    garantirColecaoInicial();
    garantirDeckInicial();
    showScreen("game-screen");
    initGame();
  });
}

if (closeRoll10ModalBtn) {
  closeRoll10ModalBtn.addEventListener("click", () => {
    if (roll10Modal) {
      roll10Modal.classList.add("hidden");
    }
  });
}

if (roll10Modal) {
  roll10Modal.addEventListener("click", (e) => {
    if (e.target === roll10Modal) {
      roll10Modal.classList.add("hidden");
    }
  });
}

if (openRollBtn) {
  openRollBtn.addEventListener("click", () => {
    showScreen("roll-screen");
    renderCollectionPreview();
    updateRollUI();
  });
}

if (backToMenuBtn) {
  backToMenuBtn.addEventListener("click", () => {
    showScreen("start-screen");
  });
}

if (rollOnceBtn) {
  rollOnceBtn.addEventListener("click", async () => {
    const card = await rollCardOnline();
    if (card) {
      renderRollResult(card);
      renderCollectionPreview();
    }
  });
}

if (rollTenBtn) {
  rollTenBtn.addEventListener("click", async () => {
    try {
      const cards = await rollTenCardsOnline();
      console.log("CARDS RECEBIDAS:", cards);

      if (cards.length > 0) {
        showRoll10Cards(cards);
        renderCollectionPreview();
      }
    } catch (error) {
      console.error("ERRO NO BOTÃO ROLL 10:", error);
      alert("Erro ao fazer 10 rolls.");
    }
  });
}

// =============================
// COMPRA
// =============================
function drawCardPlayer() {
  if (playerDeck.length === 0) {
    showWarning("⚠ Seu deck acabou!");
    return;
  }

  if (playerHand.length >= MAX_HAND_SIZE) {
    playerDeck.pop();
    showWarning("⚠ Mão cheia! Carta descartada");
    return;
  }

  const c = playerDeck.pop();
  playerHand.push(c);
  renderHand();
}

function drawCardEnemy() {
  if (enemyDeck.length === 0) return;

  const c = enemyDeck.pop();
  if (!c) return;

  // DESVIO ILEGAL
  if (window.__illegalDiversionActive) {
    window.__illegalDiversionActive = false;

    if (playerHand.length < MAX_HAND_SIZE) {
      playerHand.push(c);
      showWarning(`🕵️ Desvio Ilegal roubou ${c.name}!`);
    } else {
      graveyardPlayer.push(structuredClone(c));
      graveHistory.unshift({
        card: structuredClone(c),
        turn: turnNumber,
        owner: "player"
      });
      showWarning(`🕵️ Você roubou ${c.name}, mas sua mão estava cheia. A carta foi para o seu cemitério.`);
    }

    renderHand();
    updateGraveyardUI();
    return;
  }

  if (enemyHand.length >= MAX_HAND_SIZE) {
    graveyardEnemy.push(structuredClone(c));
    graveHistory.unshift({
      card: structuredClone(c),
      turn: turnNumber,
      owner: "enemy"
    });
    return;
  }

  enemyHand.push(c);
}
function startNewRound() {
  drawCardPlayer();
  drawCardEnemy();
}

// =============================
// DECKS
// =============================


function buildInitialEnemyDeck() {
  const ids = Object.keys(CARD_DB)
    .filter(id => CARD_DB[id].cardClass === "unit")
    .slice(0, 20);

  return ids
    .filter(id => CARD_DB[id])
    .map(id => createCardFromId(id))
    .filter(Boolean)
    .sort(() => Math.random() - 0.5);
}

// =============================
// INIT
// =============================
let gameInitialized = false;

function initGame() {
  if (gameInitialized) return;
  gameInitialized = true;

  playerDeck = buildPlayerDeckFromSavedDeck();

  if (playerDeck.length < 1) {
    showWarning("⚠ Você não tem cartas suficientes para jogar.");
    showScreen("roll-screen");
    gameInitialized = false;
    return;
  }

  enemyDeck = buildInitialEnemyDeck();

  for (let i = 0; i < 5; i++) {
    drawCardPlayer();
    drawCardEnemy();
  }

  ZONES.forEach(z => {
    const zoneEl = document.getElementById(z);
    if (!zoneEl) return;

    zoneEl.addEventListener("click", (e) => {
      if (e.target.closest(".card")) return;

      if (z === "bancoEnemy" && selected && actionMode === "attack") {
        directAttackBancoEnemy(selected.zone, selected.index);
        actionMode = null;
        selected = null;
        renderBoard();
        return;
      }

      if (actionMode === "move") {
        tryMoveToZone(z);
        actionMode = null;
        selected = null;
        renderBoard();
        return;
      }
    });
  });

  const endBtn = document.getElementById("end-turn-btn");
  if (endBtn) endBtn.addEventListener("click", endTurn);

  const surrenderBtn = document.getElementById("surrender-btn");
  if (surrenderBtn) surrenderBtn.addEventListener("click", surrender);

  syncGlobals();
  startPlayerTurn();
  renderAll();
}

// =============================
// TURNOS
// =============================
function startPlayerTurn() {
  currentTurn = "player";
  turnNumber++;
  window.__playerWasAttackedLastTurn = false;
  if (
  window.__quickResponseTrapActive &&
  window.__quickResponseTrapTurn < turnNumber
) {
  window.__quickResponseTrapActive = false;
  window.__quickResponseTrapTurn = null;
}

  updateTurnUI();
  updateTemporaryBuffs();
  function processSideralInfection() {
  const allZones = ["bancoPlayer", "campo1", "campo2", "bancoEnemy"];

  allZones.forEach(zone => {
    (board[zone] || []).forEach(unit => {
      const infection = unit.card?.sideralInfection;
      if (!infection) return;

      applyDamageToCard(unit.card, infection.damage);

      if (unit.card.defense > 0 && !infection.spreadDone && turnNumber >= infection.spreadReadyTurn) {
        const adjacentZones = ADJ[zone] || [];

        adjacentZones.forEach(adjZone => {
          (board[adjZone] || []).forEach(adjUnit => {
            if (!adjUnit?.card) return;
            if (adjUnit.card.sideralInfection) return;

            adjUnit.card.sideralInfection = {
              damage: infection.damage,
              startedTurn: turnNumber,
              spreadReadyTurn: turnNumber + 1,
              spreadDone: false
            };
          });
        });

        infection.spreadDone = true;
        showWarning(`🦠 A infecção de ${unit.card.name} se espalhou!`);
      }
    });
  });

  cleanupDeadUnits();
}

  window.__lightBanActive = false;

  if (window.__endlessWinterTurns > 0) {
  window.__endlessWinterTurns--;
}

  if (window.__malevolentTurns > 0) {

  const dmg = window.__malevolentDamage || 300;

  Object.keys(board).forEach(zone => {
    board[zone].forEach(unit => {
      if (unit.card) {
        applyDamageToCard(unit.card, dmg);
      }
    });
  });

  window.__malevolentTurns--;

  showWarning(`🩸 Santuário Malevolente causou ${dmg} de dano!`);
}

 if (!window.__skipPENextTurnGain) {
  if (maxPE < maxPELimit) maxPE++;
} else {
  window.__skipPENextTurnGain = false;
}
  window.__attackDiscountThisTurn = 0;

  if (window.__bonusPENextTurn) {
    maxPE = Math.min(maxPELimit, maxPE + window.__bonusPENextTurn);
    window.__bonusPENextTurn = 0;
  }

  playerPE = maxPE;

  if (turnNumber >= 2) {
    startNewRound();
  }
    Object.keys(board).forEach(zone => {
    board[zone].forEach(unit => {
      if (!unit.card) return;

      ensureCardTurnState(unit.card);

      if (unit.card.pinnedUntilTurn && unit.card.pinnedUntilTurn < turnNumber) {
        unit.card.pinnedUntilTurn = null;
      }
    });
  });

  Object.keys(board).forEach(zone => {
    board[zone].forEach(unit => {
      if (unit.owner === "player") {
        runEffects(unit.card, "turnStart", {
          card: unit.card,
          getEnemyActiveCard,
          getEnemyTarget,
          cleanupDead: cleanupDeadUnits
        });
      }
    });
  });

  cleanupDeadUnits();
  syncGlobals();
  updatePEUI();
  renderAll();
}
function updateEudoriaPrince() {

  const zones = ["bancoPlayer","campo1","campo2","bancoEnemy"];

  zones.forEach(zone => {

    (window.board?.[zone] || []).forEach(unit => {

      if (!unit.card) return;
      if (unit.card.id !== "E017") return;

      const enemyCount =
        (window.board?.bancoEnemy?.filter(u => u.owner !== "player").length || 0) +
        (window.board?.campo2?.filter(u => u.owner !== "player").length || 0);

      const baseAtk = unit.card.baseAttackEudoria ?? 2000;

      unit.card.attack = Math.max(0, baseAtk - enemyCount * 500);

    });

  });

}

function endTurn() {
  if (currentTurn !== "player") return;
  Object.keys(board).forEach(zone => {
  board[zone].forEach(unit => {
    if (unit.owner === "player") {
      runEffects(unit.card, "turnEnd", {
        card: unit.card,
        owner: "player",
        board,
        cleanupDead: cleanupDeadUnits
      });
    }
  });
});

  window.__enemySavedPE = playerPE;

  currentTurn = "enemy";
  actionMode = null;
  selected = null;
  renderBoard();

  setTimeout(() => {
    currentTurn = "player";
    startPlayerTurn();
    renderAll();
  }, 500);
}

function surrender() {
  if (currentTurn !== "player") {
    showWarning("⚠ Só pode desistir no seu turno.");
    return;
  }

  const ok = confirm("Tem certeza que quer desistir? Você vai perder a partida.");
  if (!ok) return;

  playerLife = 0;
  updateLifeUI();
  alert("Você desistiu. Derrota!");
  location.reload();
}

// =============================
// MÃO
// =============================
function renderHand() {
  if (!playerHandElement) return;

  playerHandElement.innerHTML = "";

  playerHand.forEach((c, idx) => {
    const summonCost = getSummonCost(c);

    const el = document.createElement("div");
    el.className = "card hand-card";
    el.dataset.handIndex = idx;

    el.innerHTML = getCardHTML(c, {
      summonCost,
      showSummon: c.cardClass !== "effect",
      showMove: c.cardClass !== "effect",
      showAttack: c.cardClass !== "effect",
      showEffectText: true
    });

    el.addEventListener("dblclick", () => playHandToBanco(idx));
    playerHandElement.appendChild(el);
  });
}

function handleEnemyCountersOnSummon(unit) {
  if (!unit || !unit.card || unit.owner === "player") return false;

  // Interceptar: cancela o próximo efeito inimigo
  if (window.__interceptCounterActive && unit.card.cardClass === "effect") {
    window.__interceptCounterActive = false;
    showWarning("🛡 Interceptar cancelou o efeito inimigo!");
    return true;
  }

  // Atrasar: se a próxima unidade inimiga tiver Blitz, volta para a mão
  const hasBlitz = Array.isArray(unit.card.effects) &&
    unit.card.effects.some(effect => effect?.id === "blitz");

  if (window.__delayCounterActive && unit.card.cardClass === "unit" && hasBlitz) {
    window.__delayCounterActive = false;

    enemyHand.push(unit.card);

    showWarning(`⏳ ${unit.card.name} foi atrasada e voltou para a mão!`);
    return true;
  }

  // Pânico: quando o inimigo entrar no campo ativo, retorna para o banco
  if (window.__panicCounterActive && unit.card.cardClass === "unit") {
    const enteringActiveZone = board.campo1.includes(unit) || board.campo2.includes(unit);

    if (enteringActiveZone) {
      window.__panicCounterActive = false;

      if (board.bancoEnemy.length < LIMITS.bancoEnemy) {
        // remove do campo ativo
        if (board.campo1.includes(unit)) {
          board.campo1 = board.campo1.filter(u => u !== unit);
        }
        if (board.campo2.includes(unit)) {
          board.campo2 = board.campo2.filter(u => u !== unit);
        }

        board.bancoEnemy.push(unit);
        showWarning(`😱 Pânico empurrou ${unit.card.name} para o banco!`);
      } else {
        showWarning("😱 Pânico tentou ativar, mas o banco inimigo está cheio.");
      }

      return true;
    }
  }

  return false;
}

function playHandToBanco(handIndex) {
  if (currentTurn !== "player") return;
  if (window.__eternumLockActive) {
  showWarning("⛓️ Eternum bloqueou invocações!");
  return;
}

  const card = playerHand[handIndex];
  if (!card) return;

  // =============================
  // CARTA DE EFEITO
  // =============================
  if (card.cardClass === "effect") {
    if (playerPE < card.cost) {
      showWarning("⚠ PE insuficiente!");
      return;
    }

    const handCardElement = document.querySelector(`.hand-card[data-hand-index="${handIndex}"]`);

    playerPE -= card.cost;
    updatePEUI();

    const playedEffectCard = structuredClone(card);
    playedEffectCard.__lastOwner = "player";

    const effectWorked = runEffects(card, "onPlay", {
      card,
      owner: "player",
      getEnemyActiveCard,
      getEnemyTarget,
      cleanupDead: cleanupDeadUnits,
      board,
      playerLife,
      enemyLife
    });

    if (handCardElement) {
      animateHandCardToGraveyard(handCardElement, true);
    }

    playerHand.splice(handIndex, 1);

    graveHistory.unshift({
      card: playedEffectCard,
      turn: turnNumber,
      owner: "player"
    });

    graveyardPlayer.push(playedEffectCard);
    updateGraveyardUI();

    window.__lastPlayedCard = structuredClone(card);

    if (effectWorked !== false) {
      cleanupDeadUnits();
    }

    syncGlobals();
    renderAll();
    return;
  }

  


  // =============================
  // CARTA DE UNIDADE
  // =============================
  if (board.bancoPlayer.length >= LIMITS.bancoPlayer) {
    showWarning("⚠ Banco cheio!");
    return;
  }

  const summonCost = getSummonCost(card);

  if (playerPE < summonCost) {
    showWarning("⚠ PE insuficiente!");
    return;
  }

  playerPE -= summonCost;
  updatePEUI();

  const unit = { owner: "player", card };
  unit.card.summonedTurn = turnNumber;
  unit.card.actionTurn = turnNumber;
  unit.card.__lastOwner = "player";

  runEffects(unit.card, "onSummon", {
    card: unit.card,
    owner: "player",
    getEnemyActiveCard,
    getEnemyTarget,
    cleanupDead: cleanupDeadUnits,
    board
  });

  board.bancoPlayer.push(unit);

  // REMOVE DA MÃO
  playerHand.splice(handIndex, 1);

  window.__lastPlayedCard = structuredClone(card);

  actionMode = null;
  selected = null;

  syncGlobals();
  renderAll();
}

function summonEnemyCardToZone(card, zoneName = "bancoEnemy") {
  if (!card || !board[zoneName]) return false;

  if (window.__terminusActive && card.cardClass === "unit") {

  window.__terminusActive = false;

  if ((card.effects?.length || 0) > 0) {

    graveyardEnemy.push(structuredClone(card));

    showWarning(`☠️ Terminus descartou ${card.name}!`);

    return true;
  }
}

  if (board[zoneName].length >= LIMITS[zoneName]) {
    return false;
  }

  const unit = {
    owner: "enemy",
    card: structuredClone(card)
  };

  // atualiza o príncipe
  updateEudoriaPrince();

  if (window.__logisticsCutActive) {

  window.__logisticsCutActive = false;

  const maxCost = window.__logisticsCutCost ?? 5;

  if ((unit.card.cost ?? 0) > maxCost) {

    graveyardEnemy.push(structuredClone(unit.card));

    showWarning(`✂️ Corta Logística descartou ${unit.card.name}!`);

    return true;
  }
}
  if (window.__stealNextEnemySummon) {

  window.__stealNextEnemySummon = false;

  if (board.bancoPlayer.length < LIMITS.bancoPlayer) {
    unit.owner = "player";
    board.bancoPlayer.push(unit);

    showWarning(`📕 Necronomicon roubou ${unit.card.name}!`);
  } else {
    showWarning("📕 Seu banco está cheio!");
  }

  return true;
}

  unit.card.summonedTurn = turnNumber;
  unit.card.actionTurn = turnNumber;
  unit.card.__lastOwner = "enemy";

  // Delay pode devolver pra mão antes de entrar
  const blockedByCounter = handleEnemyCountersOnSummon(unit);
  if (blockedByCounter) {
    syncGlobals();
    renderAll();
    return false;
  }

  board[zoneName].push(unit);

  runEffects(unit.card, "onSummon", {
    card: unit.card,
    owner: "enemy",
    cleanupDead: cleanupDeadUnits,
    board
  });

  // Pânico pode empurrar do campo ativo pro banco
  handleEnemyCountersOnSummon(unit);

  syncGlobals();
  renderAll();
  return true;
} 
function checkArmedNet(unit, fromZone, targetZone) {
  if (!unit || !unit.card) return;

  if (
    window.__armedNetActive &&
    unit.owner === "enemy" &&
    fromZone === "bancoEnemy" &&
    (targetZone === "campo1" || targetZone === "campo2")
  ) {
    unit.card.pinnedUntilTurn = turnNumber + 1;
    window.__armedNetActive = false;
    showWarning(`🕸️ Rede Armada prendeu ${unit.card.name}!`);
  }
}

// =============================
// MOVIMENTO
// =============================
function tryMoveToZone(targetZone) {
  if (currentTurn !== "player") return;
  if (!selected) return;

  const fromZone = selected.zone;

  if (targetZone === "bancoEnemy") {
    showWarning("⚠ Não pode ENTRAR no banco do inimigo andando.");
    return;
  }

  if (!ADJ[fromZone].includes(targetZone)) {
    showWarning("⚠ Não pode pular casa!");
    return;
  }

  const moving = board[fromZone][selected.index];
  if (!moving || moving.owner !== "player") return;

  if (moving.card.noRetreat && targetZone === "bancoEnemy") {
    showWarning("⚔ Essa unidade não pode recuar!");
    return;
  }

  if (!canAct(moving, "move")) {
    showWarning("⚠ Essa carta não pode se mover agora.");
    return;
  }

  if (board[targetZone].length > 0 && board[targetZone][0].owner !== "player") {
    showWarning("⚠ Esse lugar está ocupado pelo inimigo!");
    return;
  }

  if (board[targetZone].length >= LIMITS[targetZone]) {
    showWarning("⚠ Esse lugar está cheio!");
    return;
  }

  const custoMover = moving.card.cost ?? 0;
  if (playerPE < custoMover) {
    showWarning("⚠ PE insuficiente para mover!");
    return;
  }
 

  playerPE -= custoMover;
  updatePEUI();

  board[fromZone].splice(selected.index, 1);
  board[targetZone].push(moving);
  if (
  window.__armedNetActive &&
  fromZone === "bancoEnemy" &&
  (targetZone === "campo1" || targetZone === "campo2")
) {
  moving.card.pinnedUntilTurn = turnNumber + 1;
  window.__armedNetActive = false;
  showWarning(`🕸️ Rede Armada prendeu ${moving.card.name}!`);
}

  registerMoveAction(moving);

  syncGlobals();
  renderAll();
}

// =============================
// ATAQUE EM CARTA
// =============================
function attackUnit(attackerZone, attackerIndex, targetZone, targetIndex) {
  if (currentTurn !== "player") return;

  const attackerUnit = board[attackerZone][attackerIndex];
  if (!attackerUnit || attackerUnit.owner !== "player") return;

  if (attackerUnit.owner === "player" && window.__lightBanActive) {
    attackerUnit.card.pinTurns = 1;
  }
  if (window.__incinerarTrapActive) {

  const targets = [];

  Object.keys(window.board).forEach(zone => {
    window.board[zone].forEach(unit => {
      if (unit.owner === "enemy") {
        targets.push(unit);
      }
    });
  });

  if (targets.length > 0) {

    const target = targets[Math.floor(Math.random() * targets.length)];

    target.card.defense -= 900;

    showWarning(`🔥 Incinerar causou 900 de dano em ${target.card.name}!`);

    if (target.card.defense <= 0) {
      window.cleanupDeadUnits();
    }

    window.__incinerarTrapActive = false;
  }

}

  const targetUnit = board[targetZone][targetIndex];
  if (!targetUnit || targetUnit.owner === "player") {
    showWarning("⚠ Clique numa carta inimiga para atacar.");
    return;
  }
  // proteção da Fortaleza Móvel
const adjacentZones = ADJ[targetZone] || [];

for (const zone of adjacentZones) {

  const protector = (board[zone] || []).find(u => 
    u.card?.mobileFortress && u.owner === targetUnit.owner
  );

  if (protector) {
    showWarning(`🏰 ${targetUnit.card.name} está protegido pela Fortaleza Móvel!`);
    return;
  }

}

  if (!canAttackTarget(attackerZone, targetZone, attackerUnit.card)) {
    showWarning("⚠ Essa carta não alcança esse alvo.");
    return;
  }

  if (targetUnit.card.smokescreen) {
    showWarning("☁ Essa unidade não pode ser alvo de ataques.");
    return;
  }

  const atkCost = attackerUnit.card.attackCost ?? 1;
  if (playerPE < atkCost) {
    showWarning("⚠ PE insuficiente para atacar!");
    return;
  }

  playerPE -= atkCost;
  updatePEUI();

  const atk = attackerUnit.card;
  const def = targetUnit.card;

  if (def.immuneFromTypes?.includes(atk.type)) {
  showWarning(`🌪️ ${def.name} é imune ao dano de ${atk.type}!`);
  
  let dmgToAtk = Math.max(1, Math.round(def.attack * typeMultiplier(def.type, atk.type, def, atk)));
  applyDamageToCard(atk, dmgToAtk);

  registerAttackAction(attackerUnit);
  selected = null;
  actionMode = null;

  cleanupDeadUnits();
  renderAll();
  return;
}

  if (window.__divideAndConquerActive) {
  triggerDivideAndConquer(attackerUnit);
}



   def.lastAttacker = attackerUnit;
  runEffects(def, "onAttacked", {
    card: def,
    attacker: attackerUnit
  });

  let effectiveAtk = atk.attack;
  if (
    atk.berserk &&
    atk.defense <= Math.ceil((CARD_DB[atk.id]?.defense || CARD_DB[atk.id]?.health || atk.defense) / 2)
  ) {
    effectiveAtk += 300;
  }

  const multAtk = typeMultiplier(atk.type, def.type, atk, def);
  const multDef = typeMultiplier(def.type, atk.type, def, atk);

  let dmgToDef = Math.max(1, Math.round(effectiveAtk * multAtk));
  let dmgToAtk = Math.max(1, Math.round(def.attack * multDef));

  if (def.firstHitShield) {
    dmgToDef = 0;
    def.firstHitShield = false;
    showWarning(`🦫 ${def.name} anulou o primeiro ataque!`);
  }
  // AMBUSH
  if (def.ambush) {
    applyDamageToCard(atk, dmgToAtk);
    def.ambush = false;

    if (atk.defense <= 0) {
      if (atk.pinTurns) {
        applyPinned(def, atk.pinTurns);
      }

      registerAttackAction(attackerUnit);
      selected = null;
      actionMode = null;

      cleanupDeadUnits();
      renderAll();
      showWarning(`⚔ Ambush de ${def.name}! ${atk.name} foi destruída antes do ataque.`);
      return;
    }

    // Se sobreviveu, só então toma dano do atacante
    applyDamageToCard(def, dmgToDef);

    if (def.defense <= 0) {
      runEffects(atk, "onKill", {
        card: atk,
        owner: "player",
        target: def,
        cleanupDead: cleanupDeadUnits
      });
    }
  } else {
    applyDamageToCard(def, dmgToDef, atk);
    applyDamageToCard(atk, dmgToAtk, def);

    if (def.defense <= 0) {
      runEffects(atk, "onKill", {
        card: atk,
        owner: "player",
        target: def,
        cleanupDead: cleanupDeadUnits
      });
    }
  }

  const defenderWasKilled = def.defense <= 0;

  if (def.defense <= 0) def.defense = 0;
  if (atk.defense <= 0) atk.defense = 0;

  if (atk.pinTurns && !defenderWasKilled) {
    applyPinned(def, atk.pinTurns);
  }

  registerAttackAction(attackerUnit);
  runEffects(attackerUnit.card, "onAttack", {
  card: attackerUnit.card,
  owner: attackerUnit.owner
});

  selected = null;
  actionMode = null;

  cleanupDeadUnits();
  renderAll();
  showWarning(`⚔ ${atk.type} x ${def.type} | Dano: ${dmgToDef} / ${dmgToAtk}`);
}
// =============================
// DANO DIRETO NO BANCO INIMIGO
// =============================
function directAttackBancoEnemy(attackerZone, attackerIndex) {
  if (currentTurn !== "player") return;

  const attackerUnit = board[attackerZone][attackerIndex];
  if (!attackerUnit || attackerUnit.owner !== "player") return;

  if (!canAct(attackerUnit, "attack")) {
    showWarning("⚠ Essa carta não pode atacar agora.");
    return;
  }

  // DISTANTE do banco não bate direto
  if (attackerUnit.card.ranged && attackerZone === "bancoPlayer") {
    showWarning("⚠ Cartas Distante no banco não podem atacar diretamente.");
    return;
  }

  if (attackerZone !== "campo2") {
    showWarning("⚠ Dano direto só pode ser do Campo2 -> Banco do inimigo.");
    return;
  }

  const hasEnemyInBank = board.bancoEnemy.some(u => u.owner !== "player");
  if (hasEnemyInBank) {
    showWarning("⚠ Tem inimigo no banco. Ataque a carta!");
    return;
  }

  let atkCost = attackerUnit.card.attackCost ?? 1;

if (window.__attackDiscountThisTurn) {
  atkCost = Math.max(0, atkCost - window.__attackDiscountThisTurn);
}
  if (playerPE < atkCost) {
    showWarning("⚠ PE insuficiente para atacar!");
    return;
  }

  playerPE -= atkCost;
  updatePEUI();

  enemyLife -= 1;
  window.__playerWasAttackedLastTurn = true;
  updateLifeUI();

  if (enemyLife <= 0) {
    alert("Você venceu!");
    location.reload();
    return;
  }

  registerAttackAction(attackerUnit);
  renderAll();
}

// =============================
// RENDER BOARD
// =============================
function renderBoard() {
  ZONES.forEach(zone => {
    const zoneEl = document.getElementById(zone);
    if (!zoneEl) return;

    const wrap = zoneEl.querySelector(".card-zone");
    if (!wrap) return;

    wrap.innerHTML = "";

    board[zone].forEach((obj, idx) => {
      const c = obj.card;
      const el = document.createElement("div");
      el.className = "card";

      if (selected && selected.zone === zone && selected.index === idx) {
        el.classList.add("selected");
      }

       el.innerHTML = getCardHTML(c, {
  showSummon: false,
  showMove: c.cardClass !== "effect",
  showAttack: c.cardClass !== "effect"
});

      el.addEventListener("click", (e) => {
        e.stopPropagation();

        if (obj.owner !== "player" && selected && actionMode === "attack") {
          attackUnit(selected.zone, selected.index, zone, idx);
          actionMode = null;
          selected = null;
          renderBoard();
          return;
        }

        if (obj.owner === "player") {
          showCardMenu(e.clientX, e.clientY, zone, idx);
        }
      });

      wrap.appendChild(el);
    });
  });
}

function renderAll() {
  renderHand();
  renderBoard();
  updatePEUI();
  updateLifeUI();
  updateGraveyardUI();
  syncGlobals();
}

// =============================
// UI
// =============================
function updatePEUI() {
  const peText = document.getElementById("mana-text");
  const peFill = document.getElementById("mana-fill");

  if (peText) peText.textContent = `${playerPE} / ${maxPE}`;

  if (peFill) {
    const percentage = maxPE > 0 ? (playerPE / maxPE) * 100 : 0;
    peFill.style.width = percentage + "%";
  }
}

function updateLifeUI() {
  const enemyText = document.getElementById("enemy-life-text");
  const playerText = document.getElementById("player-life-text");
  const enemyBar = document.getElementById("enemy-life-bar");
  const playerBar = document.getElementById("player-life-bar");

  if (enemyText) enemyText.textContent = enemyLife;
  if (playerText) playerText.textContent = playerLife;

  if (enemyBar) enemyBar.style.width = Math.max(0, (enemyLife / 4) * 100) + "%";
  if (playerBar) playerBar.style.width = Math.max(0, (playerLife / 4) * 100) + "%";
}

// =============================
// START
// =============================
async function initFrontend() {
  if (savedPlayer) {
    currentPlayer = savedPlayer;
    updatePlayerUI();
    await loadCollectionFromServer();
    showScreen("start-screen");
  } else {
    showScreen("login-screen");
  }

  renderCollectionPreview();
  updateRollUI();
  updateGraveyardUI();
  syncGlobals();
  renderAll();
}

initFrontend();