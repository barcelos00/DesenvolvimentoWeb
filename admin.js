// =====================================================
// PAINEL DO ADMINISTRADOR (CRUD de veículos + usuários)
// Usa as funções de carros.js e auth.js
// =====================================================


// ---------- 1) FUNÇÕES AUXILIARES DE TELA ----------

function mostrarMensagem(texto, deuCerto) {
    var p = document.getElementById("admin-mensagem");
    p.textContent = texto;
    p.className = deuCerto ? "admin-ok" : "auth-erro";
}

// cria uma <td>; aceita texto ou um elemento já pronto
function celula(conteudo, classe) {
    var td = document.createElement("td");

    if (typeof conteudo === "string") {
        td.textContent = conteudo;   // textContent = seguro, não interpreta HTML
    } else {
        td.appendChild(conteudo);
    }
    if (classe) {
        td.className = classe;
    }
    return td;
}

function criarBotao(texto, classeExtra, aoClicar) {
    var botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-tabela " + classeExtra;
    botao.textContent = texto;
    botao.addEventListener("click", aoClicar);
    return botao;
}


// ---------- 2) VEÍCULOS: READ (tabela) ----------

function mostrarCarros() {
    var corpo = document.getElementById("tabela-carros");
    var carros = listarCarros();

    corpo.innerHTML = "";

    if (carros.length === 0) {
        var vazia = document.createElement("tr");
        var td = celula("Nenhum veículo cadastrado.");
        td.colSpan = 7;
        vazia.appendChild(td);
        corpo.appendChild(vazia);
        return;
    }

    for (var i = 0; i < carros.length; i++) {
        corpo.appendChild(montarLinhaCarro(carros[i]));
    }
}

// (função separada para cada botão "lembrar" qual carro é o dele)
function montarLinhaCarro(carro) {
    var linha = document.createElement("tr");

    var imagem = document.createElement("img");
    imagem.src = carro.imagem;
    imagem.alt = carro.nome;

    var status = carro.disponivel ? "Disponível" : "Indisponível";

    var acoes = document.createElement("div");
    acoes.appendChild(criarBotao("Editar", "", function () {
        editarCarro(carro.id);
    }));
    acoes.appendChild(criarBotao("Excluir", "perigo", function () {
        confirmarExclusaoCarro(carro);
    }));

    linha.appendChild(celula(imagem));
    linha.appendChild(celula(carro.nome, "esquerda"));
    linha.appendChild(celula("R$ " + formatarPreco(carro.preco)));
    linha.appendChild(celula(Number(carro.km).toLocaleString("pt-BR")));
    linha.appendChild(celula(carro.ano ? String(carro.ano) : "-"));
    linha.appendChild(celula(status));
    linha.appendChild(celula(acoes));
    return linha;
}


// ---------- 3) VEÍCULOS: CREATE e UPDATE (formulário) ----------

function salvarFormularioCarro() {
    var id = document.getElementById("carro-id").value;   // vazio = carro novo
    var preco = parseFloat(document.getElementById("carro-preco").value);
    var precoAntigo = parseFloat(document.getElementById("carro-preco-antigo").value);
    var km = parseInt(document.getElementById("carro-km").value, 10);
    var ano = parseInt(document.getElementById("carro-ano").value, 10);
    var site = document.getElementById("carro-site").value.trim();

    if (isNaN(preco) || preco <= 0) {
        mostrarMensagem("Informe um preço maior que zero.", false);
        return false;
    }

    if (isNaN(km) || km < 0) {
        mostrarMensagem("A quilometragem não pode ser negativa.", false);
        return false;
    }

    if (site !== "" && !urlHttp(site)) {
        mostrarMensagem("O site oficial precisa começar com http:// ou https://", false);
        return false;
    }

    var carro = {
        nome: document.getElementById("carro-nome").value.trim(),
        descricao: document.getElementById("carro-descricao").value.trim(),
        preco: preco,
        precoAntigo: isNaN(precoAntigo) ? null : precoAntigo,
        km: km,
        ano: isNaN(ano) ? null : ano,
        imagem: document.getElementById("carro-imagem").value.trim(),
        site: site,
        disponivel: document.getElementById("carro-disponivel").value === "sim"
    };

    var texto;
    if (id === "") {
        criarCarro(carro);                       // CREATE
        texto = "Veículo cadastrado com sucesso!";
    } else {
        carro.id = parseInt(id, 10);
        atualizarCarro(carro);                   // UPDATE
        texto = "Veículo atualizado com sucesso!";
    }

    limparFormulario();
    mostrarMensagem(texto, true);
    mostrarCarros();
    return false;
}

// Joga os dados do carro no formulário para editar
function editarCarro(id) {
    var carro = buscarCarro(id);
    if (carro === null) {
        return;
    }

    document.getElementById("carro-id").value = carro.id;
    document.getElementById("carro-nome").value = carro.nome;
    document.getElementById("carro-imagem").value = carro.imagem;
    document.getElementById("carro-descricao").value = carro.descricao;
    document.getElementById("carro-preco").value = carro.preco;
    document.getElementById("carro-preco-antigo").value = carro.precoAntigo === null ? "" : carro.precoAntigo;
    document.getElementById("carro-km").value = carro.km;
    document.getElementById("carro-ano").value = carro.ano === null ? "" : carro.ano;
    document.getElementById("carro-disponivel").value = carro.disponivel ? "sim" : "nao";
    document.getElementById("carro-site").value = carro.site;

    document.getElementById("titulo-form").textContent = "Editar veículo: " + carro.nome;
    document.getElementById("btn-cancelar").hidden = false;
    mostrarMensagem("", true);
    document.getElementById("form-carro").scrollIntoView({ behavior: "smooth" });
}

// Volta o formulário ao estado de "Novo veículo"
function limparFormulario() {
    document.getElementById("form-carro").reset();
    document.getElementById("carro-id").value = "";   // o reset() não limpa o campo escondido
    document.getElementById("titulo-form").textContent = "Novo veículo";
    document.getElementById("btn-cancelar").hidden = true;
    mostrarMensagem("", true);
}


// ---------- 4) VEÍCULOS: DELETE ----------

function confirmarExclusaoCarro(carro) {
    if (!confirm('Excluir "' + carro.nome + '"? Essa ação não pode ser desfeita.')) {
        return;
    }

    excluirCarro(carro.id);

    // se o carro excluído estava aberto no formulário, limpa o formulário
    if (document.getElementById("carro-id").value === String(carro.id)) {
        limparFormulario();
    }
    mostrarCarros();
}

function restaurarCatalogo() {
    if (!confirm("Isso apaga as alterações e volta para os 15 carros originais. Continuar?")) {
        return;
    }

    restaurarCarros();
    limparFormulario();
    mostrarCarros();
}


// ---------- 5) USUÁRIOS ----------

function mostrarUsuarios() {
    var corpo = document.getElementById("tabela-usuarios");
    var usuarios = listarUsuarios();
    var emailLogado = usuarioAtual().email;

    corpo.innerHTML = "";

    for (var i = 0; i < usuarios.length; i++) {
        corpo.appendChild(montarLinhaUsuario(usuarios[i], emailLogado));
    }
}

function montarLinhaUsuario(usuario, emailLogado) {
    var linha = document.createElement("tr");
    var ehAdminLinha = usuario.tipo === "admin";

    var acoes = document.createElement("div");

    if (usuario.email === emailLogado) {
        // o admin não pode se rebaixar nem se excluir (garante que sempre sobra um admin)
        acoes.textContent = "(você)";
    } else {
        acoes.appendChild(criarBotao(ehAdminLinha ? "Tornar cliente" : "Tornar admin", "", function () {
            atualizarTipoUsuario(usuario.email, ehAdminLinha ? "cliente" : "admin");
            mostrarUsuarios();
        }));
        acoes.appendChild(criarBotao("Excluir", "perigo", function () {
            if (confirm("Excluir a conta de " + usuario.email + "?")) {
                excluirUsuario(usuario.email);
                mostrarUsuarios();
            }
        }));
    }

    linha.appendChild(celula(usuario.nome, "esquerda"));
    linha.appendChild(celula(usuario.email, "esquerda"));
    linha.appendChild(celula(ehAdminLinha ? "Administrador" : "Cliente"));
    linha.appendChild(celula(acoes));
    return linha;
}


// ---------- 6) INÍCIO ----------
// Só monta o painel se for administrador
// (o auth.js já redireciona quem não for).

if (ehAdmin()) {
    document.getElementById("admin-saudacao").textContent =
        "Logado como " + usuarioAtual().nome + " (administrador)";
    mostrarCarros();
    mostrarUsuarios();
}