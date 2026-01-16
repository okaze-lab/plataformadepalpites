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

/* enquete */
const pollButtons = Array.from(document.querySelectorAll(".poll-option"));
const pollFeedback = document.getElementById("pollFeedback");
const pollReset = document.getElementById("pollReset");

const barCasa = document.getElementById("barCasa");
const barEmpate = document.getElementById("barEmpate");
const barFora = document.getElementById("barFora");

const pctCasa = document.getElementById("pctCasa");
const pctEmpate = document.getElementById("pctEmpate");
const pctFora = document.getElementById("pctFora");

const STORAGE_POLL_VOTO = "jogodavez_poll_voto";
const STORAGE_POLL_EXTRA = "jogodavez_poll_extra";

function hojeISO() {
  return new Date().toISOString().split("T")[0];
}

function diasDesdeInicio(inicio) {
  const start = new Date(inicio + "T00:00:00");
  const now = new Date(hojeISO() + "T00:00:00");
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

function calcularTotalLista() {
  const dias = diasDesdeInicio(INICIO_GLOBAL);
  return BASE_GLOBAL + dias + getExtraClique();
}

function renderContadorLista() {
  const total = calcularTotalLista();
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

/* Botão 2: lista de espera (+1 local) */
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
  renderContadorLista();
  mostrarStatusLista();
}

/* enquete: base diária determinística */
function hashStringToInt(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function basePollDoDia() {
  const seed = hashStringToInt("jogodavez-poll-" + hojeISO());

  const a = (seed % 41) + 35;            // 35..75
  const b = ((seed >> 8) % 21) + 10;     // 10..30
  const c = 100 - a - b;

  let casa = a;
  let empate = b;
  let fora = c;

  if (fora < 10) {
    const diff = 10 - fora;
    fora = 10;
    casa = Math.max(35, casa - diff);
  }

  const soma = casa + empate + fora;
  if (soma !== 100) casa += (100 - soma);

  return { casa, empate, fora };
}

function getPollExtras() {
  const raw = localStorage.getItem(STORAGE_POLL_EXTRA);
  if (!raw) return { casa: 0, empate: 0, fora: 0 };
  try {
    const obj = JSON.parse(raw);
    return {
      casa: Number(obj.casa) || 0,
      empate: Number(obj.empate) || 0,
      fora: Number(obj.fora) || 0
    };
  } catch {
    return { casa: 0, empate: 0, fora: 0 };
  }
}

function setPollExtras(extras) {
  localStorage.setItem(STORAGE_POLL_EXTRA, JSON.stringify(extras));
}

function normalizarPercentuais(contagens) {
  const total = contagens.reduce((acc, n) => acc + n, 0);
  if (total <= 0) return { casa: 0, empate: 0, fora: 0 };

  const exatos = contagens.map((n) => (n / total) * 100);
  const pisos = exatos.map((x) => Math.floor(x));
  let soma = pisos.reduce((a, b) => a + b, 0);

  let resto = 100 - soma;

  const fracs = exatos.map((x, i) => ({ i, frac: x - Math.floor(x) }));
  fracs.sort((a, b) => b.frac - a.frac);

  const res = [...pisos];

  let idx = 0;
  while (resto > 0) {
    res[fracs[idx % fracs.length].i] += 1;
    resto -= 1;
    idx += 1;
  }

  for (let k = 0; k < res.length; k++) {
    if (res[k] < 0) res[k] = 0;
    if (res[k] > 100) res[k] = 100;
  }

  soma = res.reduce((a, b) => a + b, 0);
  if (soma !== 100) res[0] += (100 - soma);

  return { casa: res[0], empate: res[1], fora: res[2] };
}

function calcularPollCounts() {
  const base = basePollDoDia();
  const extras = getPollExtras();

  const casaCount = Math.max(0, base.casa + extras.casa);
  const empateCount = Math.max(0, base.empate + extras.empate);
  const foraCount = Math.max(0, base.fora + extras.fora);

  return { casaCount, empateCount, foraCount };
}

function calcularPoll() {
  const { casaCount, empateCount, foraCount } = calcularPollCounts();
  return normalizarPercentuais([casaCount, empateCount, foraCount]);
}

function totalVotosPoll() {
  const { casaCount, empateCount, foraCount } = calcularPollCounts();
  return casaCount + empateCount + foraCount;
}

function renderPoll() {
  const r = calcularPoll();

  barCasa.style.width = r.casa + "%";
  barEmpate.style.width = r.empate + "%";
  barFora.style.width = r.fora + "%";

  pctCasa.textContent = r.casa + "%";
  pctEmpate.textContent = r.empate + "%";
  pctFora.textContent = r.fora + "%";

  const total = totalVotosPoll();
  pollFeedback.dataset.total = String(total);
}

function labelVoto(v) {
  if (v === "casa") return "Vitória Casa";
  if (v === "empate") return "Empate";
  return "Vitória Visitante";
}

function textoTotalVotos() {
  const total = totalVotosPoll();
  return total === 1 ? "1 voto registrado" : total + " votos registrados";
}

function bloquearPoll(voto) {
  pollButtons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.toggle("is-picked", btn.dataset.vote === voto);
  });

  pollReset.classList.remove("is-hidden");
}

function liberarPoll() {
  pollButtons.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("is-picked");
  });

  pollReset.classList.add("is-hidden");
}

function votar(opcao) {
  const jaVotou = localStorage.getItem(STORAGE_POLL_VOTO);
  if (jaVotou) return;

  localStorage.setItem(STORAGE_POLL_VOTO, opcao);

  const extras = getPollExtras();
  extras[opcao] = (extras[opcao] || 0) + 1;
  setPollExtras(extras);

  pollFeedback.textContent = "Registramos seu palpite: " + labelVoto(opcao) + ". " + textoTotalVotos() + ".";
  bloquearPoll(opcao);
  renderPoll();
}

function redefinirEscolha() {
  const votoAnterior = localStorage.getItem(STORAGE_POLL_VOTO);
  if (!votoAnterior) return;

  localStorage.removeItem(STORAGE_POLL_VOTO);

  const extras = getPollExtras();
  extras[votoAnterior] = Math.max(0, (extras[votoAnterior] || 0) - 1);
  setPollExtras(extras);

  pollFeedback.textContent = "Escolha uma opção para registrar seu palpite. " + textoTotalVotos() + ".";
  liberarPoll();
  renderPoll();
}

function initPoll() {
  renderPoll();

  const jaVotou = localStorage.getItem(STORAGE_POLL_VOTO);
  if (jaVotou) {
    pollFeedback.textContent = "Seu palpite está registrado: " + labelVoto(jaVotou) + ". " + textoTotalVotos() + ".";
    bloquearPoll(jaVotou);
  } else {
    pollFeedback.textContent = "Escolha uma opção para registrar seu palpite. " + textoTotalVotos() + ".";
    liberarPoll();
  }

  pollButtons.forEach((btn) => {
    btn.addEventListener("click", () => votar(btn.dataset.vote));
  });

  pollReset.addEventListener("click", redefinirEscolha);
}

function init() {
  renderContadorLista();

  if (localStorage.getItem(STORAGE_INTERESSE)) {
    aplicarEstadoConfirmado();
    mostrarStatusLista();
  } else {
    esconderStatusLista();
    botaoLista.addEventListener("click", registrarInteresse);
  }

  initPoll();
}

init();
