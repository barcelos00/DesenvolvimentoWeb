/* 1. FUNÇÃO DE BOAS-VINDAS (Evento de Clique Simples) */
function exibirBoasVindas() {
    alert("Bem-vindo à SOFTCAR!\n\nSua jornada rumo ao carro dos sonhos começa aqui.");
}

/* 2. CARROSSEL DE TEXTO (Uso de Arrays e Temporizador) */
function iniciarCarrosselDestaques(seletor) {
    var elemento = document.querySelector(seletor);
    
    // Array (lista) de frases para o carrossel
    var frases = [
        "🔥 Oferta especial: Taxa zero em toda linha BMW!",
        "⚡ Conheça a performance do novo Porsche Taycan.",
        "🚀 Agende seu test-drive VIP hoje mesmo.",
        "💎 Veículos revisados e com garantia de fábrica."
    ];
    
    var indice = 0; // Começa na primeira frase

    if (elemento) {
        // Estilo básico aplicado via JavaScript
        elemento.style.color = "#0ea5e9";
        elemento.style.fontWeight = "bold";
        elemento.style.textAlign = "center";
        elemento.style.fontSize = "18px";
        
        elemento.innerHTML = frases[indice]; // Coloca a primeira frase

        // setInterval repete a execução de um código a cada X milissegundos
        setInterval(function() {
            // O operador % (módulo) faz o índice voltar a 0 quando chega no fim da lista
            indice = (indice + 1) % frases.length; 
            elemento.innerHTML = frases[indice];
        }, 3000); // 3000 ms = 3 segundos
    }
}

/* 3. SIMULADOR DE FINANCIAMENTO (Lógica If/Else e Matemática) */
function simularFinanciamento(nomeCarro, precoCarro) {
    // Pede para o usuário digitar um valor usando prompt
    var entrada = prompt("SIMULADOR SOFTCAR\n\nVeículo: " + nomeCarro + "\nValor Total: R$ " + precoCarro + "\n\nQual valor você deseja dar de entrada? (Apenas números, sem pontos)");

    // Verifica se o usuário não clicou em "Cancelar" ou deixou vazio
    if (entrada !== null && entrada !== "") {
        
        var valorEntrada = parseFloat(entrada); // Converte o texto digitado para número decimal
        var valorVeiculo = parseFloat(precoCarro);

        // Validações com If e Else
        if (isNaN(valorEntrada)) {
            alert("Erro: Por favor, digite um valor numérico válido (ex: 50000).");
        } 
        else if (valorEntrada >= valorVeiculo) {
            alert("Aviso: O valor de entrada não pode ser maior ou igual ao valor total do carro!");
        } 
        else {
            // Cálculo do financiamento
            var saldoDevedor = valorVeiculo - valorEntrada;
            var parcelas = saldoDevedor / 48; // Divide o restante em 48 meses
            
            // Exibe o resultado final com alert
            alert("✅ SIMULAÇÃO APROVADA!\n\nVeículo: " + nomeCarro + "\nEntrada: R$ " + valorEntrada.toFixed(2) + "\nRestante: 48 parcelas fixas de R$ " + parcelas.toFixed(2) + " (Sem Juros)");
        }
    }
}