const API_URL = "https://card-clash-backend.onrender.com";

async function registerPlayer(username, email, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email, password })
  });

  return await res.json();
}

async function loginPlayer(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return await res.json();
}

async function saveDeck(player_id, name, cards) {
  const res = await fetch(`${API_URL}/decks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ player_id, name, cards })
  });

  return await res.json();
}

async function getDecks(playerId) {
  const res = await fetch(`${API_URL}/decks/${playerId}`);
  return await res.json();
}

// EDITAR DECK
async function updateDeck(deckId, name, cards) {
  const res = await fetch(`${API_URL}/decks/${deckId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, cards })
  });

  return await res.json();
}

// DELETAR DECK
async function deleteDeck(deckId) {
  const res = await fetch(`${API_URL}/decks/${deckId}`, {
    method: "DELETE"
  });

  return await res.json();
}

async function getAllCards() {
  const res = await fetch(`${API_URL}/cards`);
  return await res.json();
}

async function getFullCollection(token) {
  const res = await fetch(`${API_URL}/collection/full`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return await res.json();
}
async function rollCardFromServer(token) {
  const res = await fetch(`${API_URL}/roll`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return await res.json();
}
async function rollTenCardsFromServer(token) {
  const res = await fetch(`${API_URL}/roll/10`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return await res.json();
}
