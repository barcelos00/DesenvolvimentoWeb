// =====================================================
// CATÁLOGO DE VEÍCULOS DO SOFTCAR (dados, CRUD e vitrine)
// =====================================================


// ---------- 1) DADOS INICIAIS ----------
// São os 15 carros que antes estavam escritos direto no index.html.
// Só são usados na PRIMEIRA vez que o site abre (ou quando o admin
// clica em "Restaurar catálogo original").

var CARROS_INICIAIS = [
    { id: 1, nome: "BMW M2", preco: 620000, precoAntigo: null, km: 18500, ano: 2025, disponivel: true,
      imagem: "imagens/imagens_ex/bmw-4565066_1280.png",
      site: "https://www.bmw.com.br/",
      descricao: "Um sedan esportivo que combina desempenho, tecnologia e conforto para o dia a dia." },
    { id: 2, nome: "Porche Taycan", preco: 410000, precoAntigo: null, km: 12300, ano: 2025, disponivel: false,
      imagem: "imagens/imagens_ex/2025-Porsche-Taycan-5-1536x864-1.png",
      site: "https://www.porsche.com/brazil/pt/",
      descricao: "Modelo esportivo com design marcante, tecnologia avançada e alto desempenho." },
    { id: 3, nome: "Porche 911 GT3", preco: 2450000, precoAntigo: 2520000, km: 8700, ano: 2026, disponivel: true,
      imagem: "imagens/imagens_ex/Porsche-911-GT3-RS-1-750x450.png",
      site: "https://www.porsche.com/brazil/pt/",
      descricao: "Sedan premium desenvolvido para oferecer conforto, sofisticação e desempenho." },
    { id: 4, nome: "Ferrari Tributo", preco: 3600000, precoAntigo: 3620000, km: 18500, ano: 2025, disponivel: true,
      imagem: "imagens/imagens_ex/f8-tributo-v0-m3i9lpacjzsd1.png",
      site: "https://www.ferrari.com/en-BR",
      descricao: "Um sedan esportivo que combina desempenho, tecnologia e conforto para o dia a dia." },
    { id: 5, nome: "Mercedes-AMG GT Coupé", preco: 1735900, precoAntigo: null, km: 10000, ano: 2026, disponivel: true,
      imagem: "imagens/imagens_ex/mercede AMG.png",
      site: "https://www.mercedes-benz.com.br/",
      descricao: "Um coupé esportivo que combina alto desempenho, tecnologia avançada e luxo." },
    { id: 6, nome: "Honda Civic Type R", preco: 429900, precoAntigo: null, km: 8500, ano: 2025, disponivel: true,
      imagem: "imagens/imagens_ex/honda civic type r.png",
      site: "https://www.honda.com.br/automoveis/",
      descricao: "Um hatch esportivo de alto desempenho equipado com motor turbo e transmissão manual de 6 marchas." },
    { id: 7, nome: "Maserati Grecale Trofeo", preco: 1100000, precoAntigo: null, km: 3200, ano: 2025, disponivel: false,
      imagem: "imagens/imagens_ex/masserati.png",
      site: "https://www.maserati.com/br/pt",
      descricao: "Um SUV esportivo italiano que combina luxo, conforto e elevado desempenho." },
    { id: 8, nome: "Audi RS 3", preco: 659990, precoAntigo: null, km: 1500, ano: 2026, disponivel: true,
      imagem: "imagens/imagens_ex/audi rs 3.png",
      site: "https://www.audi.com.br/pt/",
      descricao: "Um sedã esportivo compacto que combina desempenho, tecnologia e conforto para o uso diário." },
    { id: 9, nome: "Fiat Palio Attractive 1.0", preco: 35000, precoAntigo: null, km: 72400, ano: 2016, disponivel: true,
      imagem: "imagens/imagens_ex/palio attractive 1.0.png",
      site: "https://www.fiat.com.br/",
      descricao: "Um hatch compacto que combina economia, praticidade e conforto, sendo uma opção bastante utilizada para o dia a dia." },
    { id: 10, nome: "Lifan 620 1.6 Talent", preco: 22000, precoAntigo: null, km: 110000, ano: 2011, disponivel: true,
      imagem: "imagens/imagens_ex/lifan.png",
      site: "https://www.webmotors.com.br/carros/estoque/lifan?tipoveiculo=carros&marca1=lifan&page=1",
      descricao: "Sedã médio com ótimo custo-benefício, acabamento clássico e amplo espaço interno. Excelente para famílias." },
    { id: 11, nome: "Ford Ka 1.0 MPI 8V", preco: 22900, precoAntigo: null, km: 98200, ano: 2011, disponivel: false,
      imagem: "imagens/imagens_ex/ka.png",
      site: "https://www.ford.com.br/",
      descricao: "Veículo extremamente ágil e econômico, perfeito para o trânsito urbano e fácil de estacionar. Um verdadeiro clássico." },
    { id: 12, nome: "Peugeot 206 1.4 Presence", preco: 16800, precoAntigo: null, km: 130000, ano: 2008, disponivel: true,
      imagem: "imagens/imagens_ex/Peugeot-206.png",
      site: "https://carros.peugeot.com.br/",
      descricao: "Hatch com visual esportivo marcante, acabamento interno caprichado e direção macia. Ótimo desempenho e conforto." },
    { id: 13, nome: "Renault Clio", preco: 18800, precoAntigo: null, km: 130000, ano: null, disponivel: true,
      imagem: "imagens/imagens_ex/clio.png",
      site: "https://pb.olx.com.br/paraiba/autos-e-pecas/carros-vans-e-utilitarios/renault-clio-rt-privil-1-0-1-0-hi-power-16v-5p-2006-1536477396?lis=listing_2020",
      descricao: "Hatch com visual esportivo. Ótimo desempenho e conforto. Fortíssimos 74 cavalos (eu acho)." },
    { id: 14, nome: "Ford Fiesta 1.6 MPI Class Hatch", preco: 26800, precoAntigo: null, km: 130000, ano: 2010, disponivel: true,
      imagem: "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202608/20260819/ford-fiesta-1-6-mpi-class-hatch-8v-flex-4p-manual-wmimagem14071665135.webp",
      site: "https://ford.com.br/",
      descricao: "Um hatch pra cidade em que foca em economia e praticidade, com motor 1.6 e transmissão manual de 5 marchas." },
    { id: 15, nome: "Gol 1.0", preco: 50800, precoAntigo: null, km: 330000, ano: 2010, disponivel: true,
      imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_MnQvLyUB2QJB2BemD1RERakS-KYB331EUu2AK04ikg&s=10",
      site: "https://volkswagen.com.br/",
      descricao: "Um hatch pra cidade em que foca em economia e praticidade, com motor 1.0 e transmissão manual de 5 marchas." }
];


// ---------- 2) CAMADA DE DADOS (CRUD) ----------
// Só estas funções sabem ONDE os carros ficam guardados (hoje, o
// localStorage). Quando o banco de dados estiver pronto, é aqui que muda.

function gravarCarros(carros) {
    localStorage.setItem("softcar_carros", JSON.stringify(carros));
}

// READ: lista todos os carros
function listarCarros() {
    var salvos = localStorage.getItem("softcar_carros");

    if (salvos === null) {              // primeira vez: carrega os iniciais
        gravarCarros(CARROS_INICIAIS);
        return JSON.parse(JSON.stringify(CARROS_INICIAIS));
    }
    return JSON.parse(salvos);
}

// READ: busca um carro pelo id
function buscarCarro(id) {
    var carros = listarCarros();

    for (var i = 0; i < carros.length; i++) {
        if (carros[i].id === id) {
            return carros[i];
        }
    }
    return null;
}

// CREATE: adiciona um carro novo (o id é gerado aqui)
function criarCarro(carro) {
    var carros = listarCarros();
    var maiorId = 0;

    for (var i = 0; i < carros.length; i++) {
        if (carros[i].id > maiorId) {
            maiorId = carros[i].id;
        }
    }

    carro.id = maiorId + 1;
    carros.push(carro);
    gravarCarros(carros);
    return carro;
}

// UPDATE: troca os dados do carro que tem o mesmo id
function atualizarCarro(carro) {
    var carros = listarCarros();

    for (var i = 0; i < carros.length; i++) {
        if (carros[i].id === carro.id) {
            carros[i] = carro;
        }
    }
    gravarCarros(carros);
}

// DELETE: remove o carro com esse id
function excluirCarro(id) {
    var carros = listarCarros();
    var restantes = [];

    for (var i = 0; i < carros.length; i++) {
        if (carros[i].id !== id) {
            restantes.push(carros[i]);
        }
    }
    gravarCarros(restantes);
}

// Volta o catálogo para os 15 carros originais
function restaurarCarros() {
    gravarCarros(CARROS_INICIAIS);
}


// ---------- 3) FUNÇÕES AUXILIARES ----------

// Impede que um texto digitado vire código HTML (ex.: <script>)
function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Só aceita links que começam com http:// ou https://
function urlHttp(url) {
    return /^https?:\/\//i.test(url);
}

// 620000 -> "620.000,00"
function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


// ---------- 4) VITRINE (o que aparece no index.html) ----------

function montarCartaoCarro(c) {
    var preco = "R$ " + formatarPreco(c.preco);
    if (c.precoAntigo) {
        preco = "R$ <del>" + formatarPreco(c.precoAntigo) + "</del> " + preco;
    }

    var status = c.disponivel
        ? '<span class="dispo">Disponível</span>'
        : '<span class="indisponivel">Indisponível</span>';

    var ano = "";
    if (c.ano) {
        ano = "<p><strong>Ano:</strong> " + escapar(c.ano) + "</p>";
    }

    var site = "";
    if (urlHttp(c.site)) {
        site = '<a class="botao-carro" href="' + escapar(c.site) + '" target="_blank" rel="noopener">Site oficial</a>';
    }

    return '' +
        '<article class="carro">' +
            '<div class="carro-imagem">' +
                '<img src="' + escapar(c.imagem) + '" alt="' + escapar(c.nome) + '">' +
            '</div>' +
            '<div class="carro-informacoes">' +
                '<h3>' + escapar(c.nome) + '</h3>' +
                '<p>' + escapar(c.descricao) + '</p>' +
                '<div class="carro-dados">' +
                    '<hr>' +
                    '<p><strong>Preço:</strong> ' + preco + '</p>' +
                    '<div class="disponibilidade"><p><strong>Disponibilidade:</strong> ' + status + '</p></div>' +
                    '<p><strong>Quilometragem:</strong> ' + Number(c.km).toLocaleString("pt-BR") + ' km</p>' +
                    ano +
                '</div>' +
                '<button class="botao-carro botao-simular" style="margin-right: 10px;"' +
                    ' data-nome="' + escapar(c.nome) + '" data-preco="' + escapar(c.preco) + '">Simular Parcelas</button> ' +
                site +
            '</div>' +
        '</article>';
}

function renderizarCarros(seletor) {
    var container = document.querySelector(seletor);
    if (container === null) {
        return;
    }

    var carros = listarCarros();

    if (carros.length === 0) {
        container.innerHTML = '<p class="descricao-produtos">Nenhum veículo cadastrado no momento.</p>';
        return;
    }

    var html = "";
    for (var i = 0; i < carros.length; i++) {
        html += montarCartaoCarro(carros[i]);
    }
    container.innerHTML = html;

    // liga cada botão "Simular Parcelas" à função que já existe no script.js
    var botoes = container.querySelectorAll(".botao-simular");
    for (var j = 0; j < botoes.length; j++) {
        botoes[j].addEventListener("click", function () {
            simularFinanciamento(this.dataset.nome, Number(this.dataset.preco));
        });
    }
}