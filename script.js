function exibirBoasVindas() {
    alert("Bem-vindo à SOFTCAR!\n\nSua jornada rumo ao carro dos sonhos começa aqui.");
}

function iniciarCarrosselDestaques(seletor) {
    var elemento = document.querySelector(seletor);
    
    var frases = [
        "🔥 Oferta especial: Taxa zero em toda linha BMW!",
        "⚡ Conheça a performance do novo Porsche Taycan.",
        "🚀 Agende seu test-drive VIP hoje mesmo.",
        "💎 Veículos revisados e com garantia de fábrica."
    ];
    

    var indice = 0; 

   
    if (elemento) {
        
        elemento.style.color = "#B3006B";
        elemento.style.fontWeight = "bold";
        elemento.style.textAlign = "center";
        elemento.style.fontSize = "18px";
        
        
        elemento.innerHTML = frases[indice];

        
        setInterval(function() {
            
            indice = (indice + 1) % frases.length; 
            
            elemento.innerHTML = frases[indice];
        }, 3000); 
    }
}

function simularFinanciamento(nomeCarro, precoCarro) {
    
    var entrada = prompt(
        "SIMULADOR SOFTCAR\n\n" +
        "Veículo: " + nomeCarro + "\n" +
        "Valor Total: R$ " + precoCarro + "\n\n" +
        "Qual valor você deseja dar de entrada?\n" +
        "(Apenas números, sem pontos)"
    );

    if (entrada !== null && entrada !== "") {
        
        var valorEntrada = parseFloat(entrada);
        var valorVeiculo = parseFloat(precoCarro);

        if (isNaN(valorEntrada)) {
            alert("Erro: Por favor, digite um valor numérico válido (ex: 50000).");
        } 
        
        else if (valorEntrada >= valorVeiculo) {
            alert("Aviso: O valor de entrada não pode ser maior ou igual ao valor total do carro!");
        } 
        
        else {
            
            
            var saldoDevedor = valorVeiculo - valorEntrada;

            
            var escolhaParcelas = prompt(
                "ESCOLHA O PRAZO DO FINANCIAMENTO\n\n" +
                "1 - 24 parcelas\n" +
                "2 - 48 parcelas\n" +
                "3 - 60 parcelas\n\n" +
                "Digite 1, 2 ou 3:"
            );

            var parcelas;

            if (escolhaParcelas === "1") {
                parcelas = 24;
            } 
            else if (escolhaParcelas === "2") {
                parcelas = 48;
            } 
            else if (escolhaParcelas === "3") {
                parcelas = 60;
            } 
            else {
                alert("Erro: Escolha inválida. Digite 1, 2 ou 3.");
                return;
            }

            
            var valorParcela = saldoDevedor / parcelas;

            alert(
                "✅ SIMULAÇÃO APROVADA!\n\n" +
                "Veículo: " + nomeCarro + "\n" +
                "Entrada: R$ " + valorEntrada.toFixed(2) + "\n" +
                "Restante: R$ " + saldoDevedor.toFixed(2) + "\n\n" +
                parcelas + " parcelas fixas de R$ " + valorParcela.toFixed(2) +
                " (Sem Juros)"
            );
        }
    }
}