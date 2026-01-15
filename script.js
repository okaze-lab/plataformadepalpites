const botaoLancamento = document.getElementById("botaoLancamento");
const mensagem = document.getElementById("mensagemLancamento");
const botaoLista = document.getElementById("botaoListaEspera");

const TEXTO_LANCAMENTO =
  "Estamos finalizando o Jogo da Vez. Em breve abriremos acesso para os primeiros usuários e rankings semanais.";

const TEXTO_CONFIRMADO = "interesse registrado ✓";
const STORAGE_KEY = "jogodavez_interesse";

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

/* Botão 2: lista de espera (salva e trava) */
function aplicarEstadoConfirmado() {
  botaoLista.textContent = TEXTO_CONFIRMADO;
  botaoLista.classList.add("confirmado");
  botaoLista.setAttribute("aria-disabled", "true");
  botaoLista.style.pointerEvents = "none";
}

function registrarInteresse(e) {
  e.preventDefault();
  if (localStorage.getItem(STORAGE_KEY)) return;

  localStorage.setItem(STORAGE_KEY, "true");
  aplicarEstadoConfirmado();
}

function init() {
  if (localStorage.getItem(STORAGE_KEY)) {
    aplicarEstadoConfirmado();
  } else {
    botaoLista.addEventListener("click", registrarInteresse);
  }
}

init();
