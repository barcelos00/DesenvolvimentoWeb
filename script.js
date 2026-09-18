
window.onload = function() {
    console.log("Sistema SOFTCAR carregado com sucesso.");
};


function exibirBoasVindas() {
    alert("Bem-vindo à SOFTCAR! Confira nossos veículos de alta performance.");
}


function destacarTexto(elemento) {
    elemento.style.color = "#d32f2f";
    elemento.style.fontWeight = "bold";
}

function restaurarTexto(elemento) {
    elemento.style.color = "#ffffff";
    elemento.style.fontWeight = "normal";
}


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

    return timerId;
}