// script.js
window.onload = function() {
    console.log("Sistema SOFTCAR carregado com sucesso.");
};

// Função acionada por um botão na Home
function exibirBoasVindas() {
    alert("Bem-vindo à SOFTCAR! Confira nossos veículos de alta performance.");
}

// Evento de mouse para interatividade nos textos
function destacarTexto(elemento) {
    elemento.style.color = "#d32f2f";
    elemento.style.fontWeight = "bold";
}

function restaurarTexto(elemento) {
    elemento.style.color = "#ffffff";
    elemento.style.fontWeight = "normal";
}