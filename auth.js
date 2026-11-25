// =====================================================
// AUTENTICAÇÃO DO SOFTCAR (login, cadastro, bloqueio e admin)
// =====================================================


// ---------- 1) CAMADA DE DADOS ----------
// Só estas funções sabem ONDE os usuários ficam guardados.
// Hoje é o localStorage do navegador. Quando o banco de dados
// estiver pronto, basta trocar o conteúdo delas.

function listarUsuarios() {
    return JSON.parse(localStorage.getItem("softcar_usuarios")) || [];
}

function gravarUsuarios(usuarios) {
    localStorage.setItem("softcar_usuarios", JSON.stringify(usuarios));
}

function buscarUsuario(email) {
    var usuarios = listarUsuarios();

    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            return usuarios[i];
        }
    }
    return null; // não achou ninguém com esse e-mail
}

function salvarUsuario(usuario) {
    var usuarios = listarUsuarios();
    usuarios.push(usuario);
    gravarUsuarios(usuarios);
}

// tipo = "admin" ou "cliente"
function atualizarTipoUsuario(email, tipo) {
    var usuarios = listarUsuarios();

    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            usuarios[i].tipo = tipo;
        }
    }
    gravarUsuarios(usuarios);
}

function excluirUsuario(email) {
    var usuarios = listarUsuarios();
    var restantes = [];

    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email !== email) {
            restantes.push(usuarios[i]);
        }
    }
    gravarUsuarios(restantes);
}

// Se ainda não existe nenhum administrador, cria o padrão
// (e-mail: admin@softcar.com / senha: admin123).
function garantirAdminPadrao() {
    var usuarios = listarUsuarios();

    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].tipo === "admin") {
            return; // já existe um admin, não precisa criar
        }
    }

    if (buscarUsuario("admin@softcar.com") === null) {
        salvarUsuario({ nome: "Administrador", email: "admin@softcar.com", senha: "admin123", tipo: "admin" });
    } else {
        atualizarTipoUsuario("admin@softcar.com", "admin");
    }
}


// ---------- 2) SESSÃO (quem está logado) ----------

function iniciarSessao(usuario) {
    var sessao = { nome: usuario.nome, email: usuario.email };
    localStorage.setItem("softcar_sessao", JSON.stringify(sessao));
}

function usuarioAtual() {
    return JSON.parse(localStorage.getItem("softcar_sessao")); // null se não há sessão
}

// Está logado se existe sessão E a conta ainda existe
// (se o admin excluir a conta, a pessoa é barrada na próxima página).
function usuarioLogado() {
    var sessao = usuarioAtual();
    return sessao !== null && buscarUsuario(sessao.email) !== null;
}

function ehAdmin() {
    var sessao = usuarioAtual();
    if (sessao === null) {
        return false;
    }

    var usuario = buscarUsuario(sessao.email);
    return usuario !== null && usuario.tipo === "admin";
}

function sair() {
    localStorage.removeItem("softcar_sessao");
    window.location.replace("login.html");
}


// ---------- 3) FORMULÁRIOS ----------
// Cada função retorna false para o formulário NÃO recarregar a página.

function fazerLogin() {
    var email = document.getElementById("email").value.trim().toLowerCase();
    var senha = document.getElementById("senha").value;
    var mensagem = document.getElementById("mensagem");

    var usuario = buscarUsuario(email);

    if (usuario === null || usuario.senha !== senha) {
        mensagem.textContent = "E-mail ou senha incorretos.";
        return false;
    }

    iniciarSessao(usuario);
    window.location.replace("index.html");
    return false;
}

function fazerCadastro() {
    var nome = document.getElementById("nome").value.trim();
    var email = document.getElementById("email").value.trim().toLowerCase();
    var senha = document.getElementById("senha").value;
    var confirmar = document.getElementById("confirmar").value;
    var mensagem = document.getElementById("mensagem");

    if (senha.length < 6) {
        mensagem.textContent = "A senha precisa ter pelo menos 6 caracteres.";
        return false;
    }

    if (senha !== confirmar) {
        mensagem.textContent = "As senhas não coincidem.";
        return false;
    }

    if (buscarUsuario(email) !== null) {
        mensagem.textContent = "Este e-mail já está cadastrado.";
        return false;
    }

    // quem se cadastra pela tela pública é sempre "cliente"
    var novoUsuario = { nome: nome, email: email, senha: senha, tipo: "cliente" };
    salvarUsuario(novoUsuario);

    // Cadastrou? Já entra logado no site.
    iniciarSessao(novoUsuario);
    window.location.replace("index.html");
    return false;
}


// ---------- 4) BLOQUEIO DAS PÁGINAS ----------
// Roda assim que o arquivo carrega (ainda no <head>),
// antes de a página aparecer.

function protegerPagina() {
    var caminho = window.location.pathname;
    var paginaPublica = caminho.indexOf("login.html") !== -1 ||
                        caminho.indexOf("cadastro.html") !== -1;
    var paginaAdmin = caminho.indexOf("admin.html") !== -1;

    if (paginaPublica && usuarioLogado()) {
        // já está logado: não faz sentido ver login/cadastro
        window.location.replace("index.html");
    } else if (!paginaPublica && !usuarioLogado()) {
        // não está logado: manda para o login
        window.location.replace("login.html");
    } else if (paginaAdmin && !ehAdmin()) {
        // está logado, mas não é administrador
        window.location.replace("index.html");
    }
}

// Coloca o link "Admin" no menu, só para administradores.
// Assim não precisa editar o <nav> das 6 páginas de novo.
function mostrarLinkAdmin() {
    var nav = document.querySelector("nav");

    if (nav === null || !ehAdmin()) {
        return;
    }

    var link = document.createElement("a");
    link.href = "admin.html";
    link.textContent = "Admin";

    // entra antes do "Sair" (se não achar o "Sair", vai para o fim do menu)
    nav.insertBefore(link, nav.querySelector("a.sair"));
}

garantirAdminPadrao();
protegerPagina();
document.addEventListener("DOMContentLoaded", mostrarLinkAdmin);