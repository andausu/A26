// 1. URL del CSV pubblicato da Google Sheet
// Sostituisca questa stringa con il link "CSV" del suo Sheet pubblicato.
const sheetURL = "URL_DEL_TUO_CSV";

// Stato attuale dei filtri
let fasciaCorrente = "Giorno";
let settoreCorrente = "TUTTI";
let dati = [];

// Formatta la data di oggi in ITA per header e in ISO per filtro
function getOggiISO() {
  const d = new Date();
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

function formattaDataIt(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

// Caricamento dati dal CSV
async function loadData() {
  try {
    const res = await fetch(sheetURL);
    const text = await res.text();

    const rows = text.trim().split("\n").map(r => r.split(","));
    const headers = rows.shift().map(h => h.trim());

    dati = rows.map(r => {
      const obj = {};
      r.forEach((v, i) => {
        obj[headers[i]] = v.trim();
      });
      return obj;
    });

    render();
  } catch (err) {
    console.error("Errore caricamento dati", err);
    mostraEmpty(true);
  }
}

// Mostra/nasconde messaggio nessuna attività
function mostraEmpty(show) {
  const empty = document.getElementById("empty-state");
  empty.style.display = show ? "block" : "none";
}

// Rendering attività filtrate
function render() {
  const oggiISO = getOggiISO();
  document.getElementById("data-odierna").textContent =
    formattaDataIt(oggiISO);

  const container = document.getElementById("lista-attivita");
  container.innerHTML = "";

  let filtrati = dati.filter(r => r.Data === oggiISO && r.Fascia === fasciaCorrente);

  if (settoreCorrente !== "TUTTI") {
    filtrati = filtrati.filter(r => r.Settore === settoreCorrente);
  }

  // Ordina per ora di inizio
  filtrati.sort((a, b) => (a["Ora Inizio"] || "").localeCompare(b["Ora Inizio"] || ""));

  if (filtrati.length === 0) {
    mostraEmpty(true);
    return;
  } else {
    mostraEmpty(false);
  }

  filtrati.forEach(att => {
    const card = document.createElement("article");
    const settore = att.Settore || "";
    card.className = `card border-${settore}`;

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${att.Titolo || ""}</div>
        <div class="card-time">${att["Ora Inizio"] || ""} – ${att["Ora Fine"] || ""}</div>
      </div>
      <div class="card-meta">
        ${att.Location || ""} · ${att.Target || ""} · ${att.Lingua || ""}
      </div>
      ${att.Note ? `<div class="card-note">${att.Note}</div>` : ""}
    `;

    container.appendChild(card);
  });
}

// Gestione click tab Giorno/Sera
function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      fasciaCorrente = tab.dataset.fascia;
      render();
    });
  });
}

// Gestione click pillole settori
function setupPills() {
  const pills = document.querySelectorAll("#filtri-settori .pill");
  pills.forEach(p => {
    p.addEventListener("click", () => {
      pills.forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      settoreCorrente = p.dataset.settore;
      render();
    });
  });
}

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupPills();
  loadData();
});
