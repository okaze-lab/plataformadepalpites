const botao = document.getElementById("botaoLancamento");
const mensagem = document.getElementById("mensagemLancamento");

const TEXTO = "Estamos finalizando o desenvolvimento. Em breve abriremos para os primeiros usuários.";

function toggleMensagem() {
  const estaAberto = botao.getAttribute("aria-expanded") === "true";

  if (estaAberto) {
    botao.setAttribute("aria-expanded", "false");
    mensagem.classList.add("is-hidden");
    mensagem.textContent = "";
    return;
  }

  botao.setAttribute("aria-expanded", "true");
  mensagem.textContent = TEXTO;
  mensagem.classList.remove("is-hidden");
}

botao.addEventListener("click", toggleMensagem);
