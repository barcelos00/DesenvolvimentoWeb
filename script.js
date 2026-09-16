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

// ===============================================
// NOVA FUNÇÃO: Carrossel automático de destaques
// ===============================================
// Roda sozinha (sem precisar de clique), trocando frases
// de destaque em um elemento da página, com fade suave.
// Uso: chame iniciarCarrosselDestaques("#idDoElemento") em qualquer página.
function iniciarCarrosselDestaques(seletor, intervaloMs = 4000) {
    const elemento = document.querySelector(seletor);
    if (!elemento) {
        console.warn(`iniciarCarrosselDestaques: elemento "${seletor}" não encontrado.`);
        return null;
    }

    const frases = [
        "🚗 Confira os lançamentos SOFTCAR desta semana!",
        "⚡ Performance e economia em um só veículo.",
        "🔧 Revisão gratuita na primeira compra.",
        "🏁 Test-drive disponível — agende o seu agora.",
        "💳 Condições especiais de financiamento este mês."
    ];

    let indice = 0;

    // transição suave via CSS (aplicada dinamicamente, sem exigir alterações no style.css)
    elemento.style.transition = "opacity 0.6s ease-in-out";
    elemento.textContent = frases[indice];

    const trocarFrase = () => {
        elemento.style.opacity = "0";
        setTimeout(() => {
            indice = (indice + 1) % frases.length;
            elemento.textContent = frases[indice];
            elemento.style.opacity = "1";
        }, 600);
    };

    const timerId = setInterval(trocarFrase, intervaloMs);

    // retorna o id do timer para permitir parar o carrossel se necessário
    // ex: const id = iniciarCarrosselDestaques("#destaque"); clearInterval(id);
    return timerId;
}