const botao = document.getElementById("botaoLancamento");
const mensagem = document.getElementById("mensagem");

let mensagemVisivel = false;

botao.addEventListener("click", function () {
    if (mensagemVisivel) {
        mensagem.textContent = "";
        mensagemVisivel = false;
    } else {
        mensagem.textContent = "Estamos finalizando o desenvolvimento. Em breve abriremos para os primeiros usuários.";
        mensagemVisivel = true;
    }
});
