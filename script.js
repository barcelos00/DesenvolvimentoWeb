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
    
    var entrada = prompt("SIMULADOR SOFTCAR\n\nVeículo: " + nomeCarro + "\nValor Total: R$ " + precoCarro + "\n\nQual valor você deseja dar de entrada? (Apenas números, sem pontos)");

    
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
           
            var parcelas = saldoDevedor / 48; 
            
            
            alert("✅ SIMULAÇÃO APROVADA!\n\nVeículo: " + nomeCarro + "\nEntrada: R$ " + valorEntrada.toFixed(2) + "\nRestante: 48 parcelas fixas de R$ " + parcelas.toFixed(2) + " (Sem Juros)");
        }
    }
}