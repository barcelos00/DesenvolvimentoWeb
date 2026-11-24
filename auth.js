function buscarUsuario(email) {
    var usuarios = JSON.parse(localStorage.getItem("softcar_usuarios")) || [];

    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            return usuarios[i];
        }
    }
    return null; 
}

function salvarUsuario(usuario) {
    var usuarios = JSON.parse(localStorage.getItem("softcar_usuarios")) || [];
    usuarios.push(usuario);
    localStorage.setItem("softcar_usuarios", JSON.stringify(usuarios));
}



function iniciarSessao(usuario) {
    var sessao = { nome: usuario.nome, email: usuario.email };
    localStorage.setItem("softcar_sessao", JSON.stringify(sessao));
}

function usuarioLogado() {
    return localStorage.getItem("softcar_sessao") !== null;
}

function sair() {
    localStorage.removeItem("softcar_sessao");
    window.location.replace("login.html");
}


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

    var novoUsuario = { nome: nome, email: email, senha: senha };
    salvarUsuario(novoUsuario);

    // Cadastrou? Já entra logado no site.
    iniciarSessao(novoUsuario);
    window.location.replace("index.html");
    return false;
}


function protegerPagina() {
    var caminho = window.location.pathname;
    var paginaPublica = caminho.indexOf("login.html") !== -1 ||
                        caminho.indexOf("cadastro.html") !== -1;

    if (paginaPublica && usuarioLogado()) {
        // já está logado: não faz sentido ver login/cadastro
        window.location.replace("index.html");
    } else if (!paginaPublica && !usuarioLogado()) {
        // não está logado: manda para o login
        window.location.replace("login.html");
    }
}

protegerPagina();