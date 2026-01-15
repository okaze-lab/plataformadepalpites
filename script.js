const botaoLancamento = document.getElementById("botaoLancamento");
const mensagem = document.getElementById("mensagemLancamento");
const botaoLista = document.getElementById("botaoListaEspera");

const contadorEl = document.getElementById("contadorInteresse");
const statusListaEl = document.getElementById("statusLista");

const TEXTO_LANCAMENTO =
  "Estamos finalizando o Jogo da Vez. Em breve abriremos acesso para os primeiros usuários e rankings semanais.";

const TEXTO_CONFIRMADO = "interesse registrado ✓";

const STORAGE_INTERESSE = "jogodavez_interesse";
const STORAGE_EXTRA_CLIQUE = "jogodavez_extra_clique";

const BASE_GLOBAL = 127;
const INICIO_GLOBAL = "2026-01-01";

function hoje() {
  return new Date().toISOString().split("T")[0];
}

function diasDesdeInicio(inicio) {
  const start = new Date(inicio + "T00:00:00");
  const now = new Date(hoje() + "T00:00:00");
  const diffMs = now.getTime() - start.getTime();
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, dias);
}

function getExtraClique() {
  return localStorage.getItem(STORAGE_EXTRA_CLIQUE) === "1" ? 1 : 0;
}

function setExtraClique() {
  localStorage.setItem(STORAGE_EXTRA_CLIQUE, "1");
}

function calcularTotal() {
  const dias = diasDesdeInicio(INICIO_GLOBAL);
  return BASE_GLOBAL + dias + getExtraClique();
}

function renderContador() {
  const total = calcularTotal();
  contadorEl.innerHTML = `<b>${total}</b> pessoas na lista de espera`;
}

function mostrarStatusLista() {
  statusListaEl.innerHTML =
    "<b>Você está na lista.</b> Em breve liberamos o primeiro Jogo do Dia e as enquetes semanais.";
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

/* Botão 2: lista de espera (salva, trava, incrementa +1 local) */
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
  setExtraClique();

  aplicarEstadoConfirmado();
  renderContador();
  mostrarStatusLista();
}

function init() {
  renderContador();

  if (localStorage.getItem(STORAGE_INTERESSE)) {
    aplicarEstadoConfirmado();
    mostrarStatusLista();
  } else {
    esconderStatusLista();
    botaoLista.addEventListener("click", registrarInteresse);
  }
}

init();
