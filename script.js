const botaoLancamento = document.getElementById("botaoLancamento");
const mensagem = document.getElementById("mensagemLancamento");
const botaoLista = document.getElementById("botaoListaEspera");

const contadorEl = document.getElementById("contadorInteresse");
const statusListaEl = document.getElementById("statusLista");

const TEXTO_LANCAMENTO =
  "Estamos finalizando o Jogo da Vez. Em breve abriremos acesso para os primeiros usuários e rankings semanais.";

const TEXTO_CONFIRMADO = "interesse registrado ✓";

const STORAGE_INTERESSE = "jogodavez_interesse";
const STORAGE_CONTADOR_BASE = "jogodavez_contador_base";
const STORAGE_CONTADOR_TOTAL = "jogodavez_contador_total";

const BASE_MIN = 90;
const BASE_MAX = 160;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getOrCreateBase() {
  const salvo = Number(localStorage.getItem(STORAGE_CONTADOR_BASE));
  if (Number.isFinite(salvo) && salvo > 0) return salvo;

  const base = randomInt(BASE_MIN, BASE_MAX);
  localStorage.setItem(STORAGE_CONTADOR_BASE, String(base));
  return base;
}

function getOrCreateTotal() {
  const salvo = Number(localStorage.getItem(STORAGE_CONTADOR_TOTAL));
  if (Number.isFinite(salvo) && salvo > 0) return salvo;

  const base = getOrCreateBase();
  localStorage.setItem(STORAGE_CONTADOR_TOTAL, String(base));
  return base;
}

function setTotal(n) {
  localStorage.setItem(STORAGE_CONTADOR_TOTAL, String(n));
}

function renderContador() {
  const total = getOrCreateTotal();
  contadorEl.innerHTML = `<b>${total}</b> pessoas na lista de espera`;
}

function mostrarStatusLista() {
  statusListaEl.innerHTML = `<b>Você está na lista.</b> Em breve liberamos o primeiro Jogo do Dia e as enquetes semanais.`;
  statusListaEl.classList.remove("is-hidden");
}

function esconderStatusLista() {
  statusListaEl.classList.add("is-hidden");
  statusListaEl.textContent = "";
}

/* Botão 1: aviso de lançamento (toggle) */
function toggleMensagem() {
  const aberto = botaoLancamento.getAttribute("aria-expanded") === "true";

  if (aberto) {
    botaoLancamento.setAttribute("aria-expanded", "false");
    mensagem.classList.add("is-hidden");
    mensagem.textContent = "";
    return;
  }

  botaoLancamento.setAttribute("aria-expanded", "true");
  mensagem.textContent = TEXTO_LANCAMENTO;
  mensagem.classList.remove("is-hidden");
}

botaoLancamento.addEventListener("click", toggleMensagem);

/* Botão 2: lista de espera (salva, trava, incrementa contador, mostra status) */
function aplicarEstadoConfirmado() {
  botaoLista.textContent = TEXTO_CONFIRMADO;
  botaoLista.classList.add("confirmado");
  botaoLista.setAttribute("aria-disabled", "true");
  botaoLista.style.pointerEvents = "none";
}

function registrarInteresse(e) {
  e.preventDefault();

  if (localStorage.getItem(STORAGE_INTERESSE)) return;

  localStorage.setItem(STORAGE_INTERESSE, "true");

  const atual = getOrCreateTotal();
  const novoTotal = atual + 1;
  setTotal(novoTotal);

  aplicarEstadoConfirmado();
  renderContador();
  mostrarStatusLista();
}

function init() {
  renderContador();

  if (localStorage.getItem(STORAGE_INTERESSE)) {
    aplicarEstadoConfirmado();

    const base = getOrCreateBase();
    const total = getOrCreateTotal();
    if (total <= base) {
      setTotal(base + 1);
    }

    renderContador();
    mostrarStatusLista();
  } else {
    esconderStatusLista();
    botaoLista.addEventListener("click", registrarInteresse);
  }
}

init();
